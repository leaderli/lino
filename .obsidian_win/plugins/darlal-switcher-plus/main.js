'use strict';

var obsidian = require('obsidian');

var Mode;
(function (Mode) {
    Mode[Mode["Standard"] = 1] = "Standard";
    Mode[Mode["EditorList"] = 2] = "EditorList";
    Mode[Mode["SymbolList"] = 4] = "SymbolList";
    Mode[Mode["WorkspaceList"] = 8] = "WorkspaceList";
    Mode[Mode["HeadingsList"] = 16] = "HeadingsList";
    Mode[Mode["StarredList"] = 32] = "StarredList";
    Mode[Mode["CommandList"] = 64] = "CommandList";
    Mode[Mode["RelatedItemsList"] = 128] = "RelatedItemsList";
})(Mode || (Mode = {}));
var SymbolType;
(function (SymbolType) {
    SymbolType[SymbolType["Link"] = 1] = "Link";
    SymbolType[SymbolType["Embed"] = 2] = "Embed";
    SymbolType[SymbolType["Tag"] = 4] = "Tag";
    SymbolType[SymbolType["Heading"] = 8] = "Heading";
})(SymbolType || (SymbolType = {}));
var LinkType;
(function (LinkType) {
    LinkType[LinkType["None"] = 0] = "None";
    LinkType[LinkType["Normal"] = 1] = "Normal";
    LinkType[LinkType["Heading"] = 2] = "Heading";
    LinkType[LinkType["Block"] = 4] = "Block";
})(LinkType || (LinkType = {}));
const SymbolIndicators = {};
SymbolIndicators[SymbolType.Link] = '🔗';
SymbolIndicators[SymbolType.Embed] = '!';
SymbolIndicators[SymbolType.Tag] = '#';
SymbolIndicators[SymbolType.Heading] = 'H';
const HeadingIndicators = {};
HeadingIndicators[1] = 'H₁';
HeadingIndicators[2] = 'H₂';
HeadingIndicators[3] = 'H₃';
HeadingIndicators[4] = 'H₄';
HeadingIndicators[5] = 'H₅';
HeadingIndicators[6] = 'H₆';
var SuggestionType;
(function (SuggestionType) {
    SuggestionType["EditorList"] = "editorList";
    SuggestionType["SymbolList"] = "symbolList";
    SuggestionType["WorkspaceList"] = "workspaceList";
    SuggestionType["HeadingsList"] = "headingsList";
    SuggestionType["StarredList"] = "starredList";
    SuggestionType["CommandList"] = "commandList";
    SuggestionType["RelatedItemsList"] = "relatedItemsList";
    SuggestionType["File"] = "file";
    SuggestionType["Alias"] = "alias";
    SuggestionType["Unresolved"] = "unresolved";
})(SuggestionType || (SuggestionType = {}));

function isOfType(obj, discriminator, val) {
    let ret = false;
    if (obj && obj[discriminator] !== undefined) {
        ret = true;
        if (val !== undefined && val !== obj[discriminator]) {
            ret = false;
        }
    }
    return ret;
}
function isSymbolSuggestion(obj) {
    return isOfType(obj, 'type', SuggestionType.SymbolList);
}
function isEditorSuggestion(obj) {
    return isOfType(obj, 'type', SuggestionType.EditorList);
}
function isWorkspaceSuggestion(obj) {
    return isOfType(obj, 'type', SuggestionType.WorkspaceList);
}
function isHeadingSuggestion(obj) {
    return isOfType(obj, 'type', SuggestionType.HeadingsList);
}
function isCommandSuggestion(obj) {
    return isOfType(obj, 'type', SuggestionType.CommandList);
}
function isFileSuggestion(obj) {
    return isOfType(obj, 'type', SuggestionType.File);
}
function isAliasSuggestion(obj) {
    return isOfType(obj, 'type', SuggestionType.Alias);
}
function isUnresolvedSuggestion(obj) {
    return isOfType(obj, 'type', SuggestionType.Unresolved);
}
function isSystemSuggestion(obj) {
    return isFileSuggestion(obj) || isUnresolvedSuggestion(obj) || isAliasSuggestion(obj);
}
function isExSuggestion(sugg) {
    return sugg && !isSystemSuggestion(sugg);
}
function isHeadingCache(obj) {
    return isOfType(obj, 'level');
}
function isTagCache(obj) {
    return isOfType(obj, 'tag');
}
function isTFile(obj) {
    return isOfType(obj, 'extension');
}
function isFileStarredItem(obj) {
    return isOfType(obj, 'type', 'file');
}
function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
function getInternalPluginById(app, id) {
    return app?.internalPlugins?.getPluginById(id);
}
function getSystemSwitcherInstance(app) {
    const plugin = getInternalPluginById(app, 'switcher');
    return plugin?.instance;
}
function stripMDExtensionFromPath(file) {
    let retVal = null;
    if (file) {
        const { path } = file;
        retVal = path;
        if (file.extension === 'md') {
            const index = path.lastIndexOf('.');
            if (index !== -1 && index !== path.length - 1 && index !== 0) {
                retVal = path.slice(0, index);
            }
        }
    }
    return retVal;
}
function filenameFromPath(path) {
    let retVal = null;
    if (path) {
        const index = path.lastIndexOf('/');
        retVal = index === -1 ? path : path.slice(index + 1);
    }
    return retVal;
}
function matcherFnForRegExList(regExStrings) {
    regExStrings = regExStrings ?? [];
    const regExList = [];
    for (const str of regExStrings) {
        try {
            const rx = new RegExp(str);
            regExList.push(rx);
        }
        catch (err) {
            console.log(`Switcher++: error creating RegExp from string: ${str}`, err);
        }
    }
    const isMatchFn = (input) => {
        for (const rx of regExList) {
            if (rx.test(input)) {
                return true;
            }
        }
        return false;
    };
    return isMatchFn;
}
function getLinkType(linkCache) {
    let type = LinkType.None;
    if (linkCache) {
        // remove the display text before trying to parse the link target
        const linkStr = linkCache.link.split('|')[0];
        if (linkStr.includes('#^')) {
            type = LinkType.Block;
        }
        else if (linkStr.includes('#')) {
            type = LinkType.Heading;
        }
        else {
            type = LinkType.Normal;
        }
    }
    return type;
}

class FrontMatterParser {
    static getAliases(frontMatter) {
        let aliases = [];
        if (frontMatter) {
            aliases = FrontMatterParser.getValueForKey(frontMatter, /^alias(es)?$/i);
        }
        return aliases;
    }
    static getValueForKey(frontMatter, keyPattern) {
        const retVal = [];
        const fmKeys = Object.keys(frontMatter);
        const key = fmKeys.find((val) => keyPattern.test(val));
        if (key) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            let value = frontMatter[key];
            if (typeof value === 'string') {
                value = value.split(',');
            }
            if (Array.isArray(value)) {
                value.forEach((val) => {
                    if (typeof val === 'string') {
                        retVal.push(val.trim());
                    }
                });
            }
        }
        return retVal;
    }
}

class SwitcherPlusSettings {
    constructor(plugin) {
        this.plugin = plugin;
        this.data = SwitcherPlusSettings.defaults;
    }
    static get defaults() {
        const enabledSymbolTypes = {};
        enabledSymbolTypes[SymbolType.Link] = true;
        enabledSymbolTypes[SymbolType.Embed] = true;
        enabledSymbolTypes[SymbolType.Tag] = true;
        enabledSymbolTypes[SymbolType.Heading] = true;
        return {
            onOpenPreferNewPane: true,
            alwaysNewPaneForSymbols: false,
            useActivePaneForSymbolsOnMobile: false,
            symbolsInLineOrder: true,
            editorListCommand: 'edt ',
            symbolListCommand: '@',
            workspaceListCommand: '+',
            headingsListCommand: '#',
            starredListCommand: "'",
            commandListCommand: '>',
            relatedItemsListCommand: '~',
            strictHeadingsOnly: false,
            searchAllHeadings: true,
            excludeViewTypes: ['empty'],
            referenceViews: ['backlink', 'localgraph', 'outgoing-link', 'outline'],
            limit: 50,
            includeSidePanelViewTypes: ['backlink', 'image', 'markdown', 'pdf'],
            enabledSymbolTypes,
            selectNearestHeading: true,
            excludeFolders: [],
            excludeLinkSubTypes: 0,
            excludeRelatedFolders: [''],
            excludeOpenRelatedFiles: false,
            excludeObsidianIgnoredFiles: false,
            shouldSearchFilenames: false,
        };
    }
    get builtInSystemOptions() {
        return getSystemSwitcherInstance(this.plugin.app)?.options;
    }
    get showAllFileTypes() {
        // forward to core switcher settings
        return this.builtInSystemOptions?.showAllFileTypes;
    }
    get showAttachments() {
        // forward to core switcher settings
        return this.builtInSystemOptions?.showAttachments;
    }
    get showExistingOnly() {
        // forward to core switcher settings
        return this.builtInSystemOptions?.showExistingOnly;
    }
    get onOpenPreferNewPane() {
        return this.data.onOpenPreferNewPane;
    }
    set onOpenPreferNewPane(value) {
        this.data.onOpenPreferNewPane = value;
    }
    get alwaysNewPaneForSymbols() {
        return this.data.alwaysNewPaneForSymbols;
    }
    set alwaysNewPaneForSymbols(value) {
        this.data.alwaysNewPaneForSymbols = value;
    }
    get useActivePaneForSymbolsOnMobile() {
        return this.data.useActivePaneForSymbolsOnMobile;
    }
    set useActivePaneForSymbolsOnMobile(value) {
        this.data.useActivePaneForSymbolsOnMobile = value;
    }
    get symbolsInLineOrder() {
        return this.data.symbolsInLineOrder;
    }
    set symbolsInLineOrder(value) {
        this.data.symbolsInLineOrder = value;
    }
    get editorListPlaceholderText() {
        return SwitcherPlusSettings.defaults.editorListCommand;
    }
    get editorListCommand() {
        return this.data.editorListCommand;
    }
    set editorListCommand(value) {
        this.data.editorListCommand = value;
    }
    get symbolListPlaceholderText() {
        return SwitcherPlusSettings.defaults.symbolListCommand;
    }
    get symbolListCommand() {
        return this.data.symbolListCommand;
    }
    set symbolListCommand(value) {
        this.data.symbolListCommand = value;
    }
    get workspaceListCommand() {
        return this.data.workspaceListCommand;
    }
    set workspaceListCommand(value) {
        this.data.workspaceListCommand = value;
    }
    get workspaceListPlaceholderText() {
        return SwitcherPlusSettings.defaults.workspaceListCommand;
    }
    get headingsListCommand() {
        return this.data.headingsListCommand;
    }
    set headingsListCommand(value) {
        this.data.headingsListCommand = value;
    }
    get headingsListPlaceholderText() {
        return SwitcherPlusSettings.defaults.headingsListCommand;
    }
    get starredListCommand() {
        return this.data.starredListCommand;
    }
    set starredListCommand(value) {
        this.data.starredListCommand = value;
    }
    get starredListPlaceholderText() {
        return SwitcherPlusSettings.defaults.starredListCommand;
    }
    get commandListCommand() {
        return this.data.commandListCommand;
    }
    set commandListCommand(value) {
        this.data.commandListCommand = value;
    }
    get commandListPlaceholderText() {
        return SwitcherPlusSettings.defaults.commandListCommand;
    }
    get relatedItemsListCommand() {
        return this.data.relatedItemsListCommand;
    }
    set relatedItemsListCommand(value) {
        this.data.relatedItemsListCommand = value;
    }
    get relatedItemsListPlaceholderText() {
        return SwitcherPlusSettings.defaults.relatedItemsListCommand;
    }
    get strictHeadingsOnly() {
        return this.data.strictHeadingsOnly;
    }
    set strictHeadingsOnly(value) {
        this.data.strictHeadingsOnly = value;
    }
    get searchAllHeadings() {
        return this.data.searchAllHeadings;
    }
    set searchAllHeadings(value) {
        this.data.searchAllHeadings = value;
    }
    get excludeViewTypes() {
        return this.data.excludeViewTypes;
    }
    get referenceViews() {
        return this.data.referenceViews;
    }
    get limit() {
        return this.data.limit;
    }
    set limit(value) {
        this.data.limit = value;
    }
    get includeSidePanelViewTypes() {
        return this.data.includeSidePanelViewTypes;
    }
    set includeSidePanelViewTypes(value) {
        // remove any duplicates before storing
        this.data.includeSidePanelViewTypes = [...new Set(value)];
    }
    get includeSidePanelViewTypesPlaceholder() {
        return SwitcherPlusSettings.defaults.includeSidePanelViewTypes.join('\n');
    }
    get selectNearestHeading() {
        return this.data.selectNearestHeading;
    }
    set selectNearestHeading(value) {
        this.data.selectNearestHeading = value;
    }
    get excludeFolders() {
        return this.data.excludeFolders;
    }
    set excludeFolders(value) {
        // remove any duplicates before storing
        this.data.excludeFolders = [...new Set(value)];
    }
    get excludeLinkSubTypes() {
        return this.data.excludeLinkSubTypes;
    }
    set excludeLinkSubTypes(value) {
        this.data.excludeLinkSubTypes = value;
    }
    get excludeRelatedFolders() {
        return this.data.excludeRelatedFolders;
    }
    set excludeRelatedFolders(value) {
        this.data.excludeRelatedFolders = [...new Set(value)];
    }
    get excludeOpenRelatedFiles() {
        return this.data.excludeOpenRelatedFiles;
    }
    set excludeOpenRelatedFiles(value) {
        this.data.excludeOpenRelatedFiles = value;
    }
    get excludeObsidianIgnoredFiles() {
        return this.data.excludeObsidianIgnoredFiles;
    }
    set excludeObsidianIgnoredFiles(value) {
        this.data.excludeObsidianIgnoredFiles = value;
    }
    get shouldSearchFilenames() {
        return this.data.shouldSearchFilenames;
    }
    set shouldSearchFilenames(value) {
        this.data.shouldSearchFilenames = value;
    }
    async loadSettings() {
        const copy = (source, target, keys) => {
            for (const key of keys) {
                if (key in source) {
                    target[key] = source[key];
                }
            }
        };
        try {
            const savedData = (await this.plugin?.loadData());
            if (savedData) {
                const keys = Object.keys(SwitcherPlusSettings.defaults);
                copy(savedData, this.data, keys);
            }
        }
        catch (err) {
            console.log('Switcher++: error loading settings, using defaults. ', err);
        }
    }
    async saveSettings() {
        const { plugin, data } = this;
        await plugin?.saveData(data);
    }
    save() {
        this.saveSettings().catch((e) => {
            console.log('Switcher++: error saving changes to settings', e);
        });
    }
    isSymbolTypeEnabled(symbol) {
        return this.data.enabledSymbolTypes[symbol];
    }
    setSymbolTypeEnabled(symbol, isEnabled) {
        this.data.enabledSymbolTypes[symbol] = isEnabled;
    }
}

class SettingsTabSection {
    constructor(app, mainSettingsTab, config) {
        this.app = app;
        this.mainSettingsTab = mainSettingsTab;
        this.config = config;
    }
    /**
     * Creates a new Setting with the given name and description.
     * @param  {HTMLElement} containerEl
     * @param  {string} name
     * @param  {string} desc
     * @returns Setting
     */
    createSetting(containerEl, name, desc) {
        const setting = new obsidian.Setting(containerEl);
        setting.setName(name);
        setting.setDesc(desc);
        return setting;
    }
    /**
     * Create section title elements and divider.
     * @param  {HTMLElement} containerEl
     * @param  {string} title
     * @param  {string} desc?
     * @returns Setting
     */
    addSectionTitle(containerEl, title, desc = '') {
        const setting = this.createSetting(containerEl, title, desc);
        setting.setHeading();
        return setting;
    }
    /**
     * Creates a HTMLInput element setting.
     * @param  {HTMLElement} containerEl The element to attach the setting to.
     * @param  {string} name
     * @param  {string} desc
     * @param  {string} initialValue
     * @param  {StringTypedConfigKey} configStorageKey The SwitcherPlusSettings key where the value for this setting should be stored.
     * @param  {string} placeholderText?
     * @returns Setting
     */
    addTextSetting(containerEl, name, desc, initialValue, configStorageKey, placeholderText) {
        const setting = this.createSetting(containerEl, name, desc);
        setting.addText((comp) => {
            comp.setPlaceholder(placeholderText);
            comp.setValue(initialValue);
            comp.onChange((rawValue) => {
                const value = rawValue.length ? rawValue : initialValue;
                this.saveChangesToConfig(configStorageKey, value);
            });
        });
        return setting;
    }
    /**
     * Create a Checkbox element setting.
     * @param  {HTMLElement} containerEl The element to attach the setting to.
     * @param  {string} name
     * @param  {string} desc
     * @param  {boolean} initialValue
     * @param  {BooleanTypedConfigKey} configStorageKey The SwitcherPlusSettings key where the value for this setting should be stored.
     * @returns Setting
     */
    addToggleSetting(containerEl, name, desc, initialValue, configStorageKey) {
        const setting = this.createSetting(containerEl, name, desc);
        setting.addToggle((comp) => {
            comp.setValue(initialValue);
            comp.onChange((value) => this.saveChangesToConfig(configStorageKey, value));
        });
        return setting;
    }
    /**
     * Create a TextArea element setting.
     * @param  {HTMLElement} containerEl The element to attach the setting to.
     * @param  {string} name
     * @param  {string} desc
     * @param  {string} initialValue
     * @param  {ListTypedConfigKey|StringTypedConfigKey} configStorageKey The SwitcherPlusSettings key where the value for this setting should be stored.
     * @param  {string} placeholderText?
     * @returns Setting
     */
    addTextAreaSetting(containerEl, name, desc, initialValue, configStorageKey, placeholderText) {
        const setting = this.createSetting(containerEl, name, desc);
        setting.addTextArea((comp) => {
            comp.setPlaceholder(placeholderText);
            comp.setValue(initialValue);
            comp.onChange((rawValue) => {
                const value = rawValue.length ? rawValue : initialValue;
                const isArray = Array.isArray(this.config[configStorageKey]);
                this.saveChangesToConfig(configStorageKey, isArray ? value.split('\n') : value);
            });
        });
        return setting;
    }
    /**
     * Updates the internal SwitcherPlusSettings configStorageKey with value, and writes it to disk.
     * @param  {K} configStorageKey The SwitcherPlusSettings key where the value for this setting should be stored.
     * @param  {SwitcherPlusSettings[K]} value
     * @returns void
     */
    saveChangesToConfig(configStorageKey, value) {
        const { config } = this;
        config[configStorageKey] = value;
        config.save();
    }
}

class StarredSettingsTabSection extends SettingsTabSection {
    display(containerEl) {
        const { config } = this;
        this.addSectionTitle(containerEl, 'Starred List Mode Settings');
        this.addTextSetting(containerEl, 'Starred list mode trigger', 'Character that will trigger starred list mode in the switcher', config.starredListCommand, 'starredListCommand', config.starredListPlaceholderText);
    }
}

class CommandListSettingsTabSection extends SettingsTabSection {
    display(containerEl) {
        const { config } = this;
        this.addSectionTitle(containerEl, 'Command List Mode Settings');
        this.addTextSetting(containerEl, 'Command list mode trigger', 'Character that will trigger command list mode in the switcher', config.commandListCommand, 'commandListCommand', config.commandListPlaceholderText);
    }
}

class RelatedItemsSettingsTabSection extends SettingsTabSection {
    display(containerEl) {
        const { config } = this;
        this.addSectionTitle(containerEl, 'Related Items List Mode Settings');
        this.addTextSetting(containerEl, 'Related Items list mode trigger', 'Character that will trigger related items list mode in the switcher', config.relatedItemsListCommand, 'relatedItemsListCommand', config.relatedItemsListPlaceholderText);
        this.addToggleSetting(containerEl, 'Exclude open files', 'Enable, related files which are already open will not be displayed in the list. Disabled, All related files will be displayed in the list.', config.excludeOpenRelatedFiles, 'excludeOpenRelatedFiles');
    }
}

class GeneralSettingsTabSection extends SettingsTabSection {
    display(containerEl) {
        this.addSectionTitle(containerEl, 'General Settings');
        this.addToggleSetting(containerEl, 'Default to open in new pane', 'When enabled, navigating to un-opened files will open a new editor pane whenever possible (as if cmd/ctrl were held). When the file is already open, the existing pane will be activated. This overrides all other pane settings.', this.config.onOpenPreferNewPane, 'onOpenPreferNewPane');
    }
}

class WorkspaceSettingsTabSection extends SettingsTabSection {
    display(containerEl) {
        const { config } = this;
        this.addSectionTitle(containerEl, 'Workspace List Mode Settings');
        this.addTextSetting(containerEl, 'Workspace list mode trigger', 'Character that will trigger workspace list mode in the switcher', config.workspaceListCommand, 'workspaceListCommand', config.workspaceListPlaceholderText);
    }
}

class EditorSettingsTabSection extends SettingsTabSection {
    display(containerEl) {
        const { config } = this;
        this.addSectionTitle(containerEl, 'Editor List Mode Settings');
        this.addTextSetting(containerEl, 'Editor list mode trigger', 'Character that will trigger editor list mode in the switcher', config.editorListCommand, 'editorListCommand', config.editorListPlaceholderText);
        this.setIncludeSidePanelViews(containerEl, config);
    }
    setIncludeSidePanelViews(containerEl, config) {
        const viewsListing = Object.keys(this.app.viewRegistry.viewByType).sort().join(' ');
        const desc = `When in Editor list mode, show the following view types from the side panels. Add one view type per line. Available view types: ${viewsListing}`;
        this.addTextAreaSetting(containerEl, 'Include side panel views', desc, config.includeSidePanelViewTypes.join('\n'), 'includeSidePanelViewTypes', config.includeSidePanelViewTypesPlaceholder);
    }
}

class HeadingsSettingsTabSection extends SettingsTabSection {
    display(containerEl) {
        const { config } = this;
        this.addSectionTitle(containerEl, 'Headings List Mode Settings');
        this.addTextSetting(containerEl, 'Headings list mode trigger', 'Character that will trigger headings list mode in the switcher', config.headingsListCommand, 'headingsListCommand', config.headingsListPlaceholderText);
        this.addToggleSetting(containerEl, 'Show headings only', 'Enabled, strictly search through only the headings contained in the file. Note: this setting overrides the "Show existing only", and "Search filenames" settings. Disabled, fallback to searching against the filename when there is not a match in the first H1 contained in the file. This will also allow searching through filenames, Aliases, and Unresolved links to be enabled.', config.strictHeadingsOnly, 'strictHeadingsOnly');
        this.addToggleSetting(containerEl, 'Search all headings', 'Enabled, search through all headings contained in each file. Disabled, only search through the first H1 in each file.', config.searchAllHeadings, 'searchAllHeadings');
        this.addToggleSetting(containerEl, 'Search filenames', "Enabled, search and show suggestions for filenames. Disabled, Don't search through filenames (except for fallback searches)", config.shouldSearchFilenames, 'shouldSearchFilenames');
        this.setExcludeFolders(containerEl, config);
        this.addToggleSetting(containerEl, 'Hide Obsidian "Excluded files"', 'Enabled, do not display suggestions for files that are in Obsidian\'s "Options > Files & Links > Excluded files" list. Disabled, suggestions for those files will be displayed but downranked.', config.excludeObsidianIgnoredFiles, 'excludeObsidianIgnoredFiles');
    }
    setExcludeFolders(containerEl, config) {
        const settingName = 'Exclude folders';
        this.createSetting(containerEl, settingName, 'When in Headings list mode, folder path that match any regex listed here will not be searched for suggestions. Path should start from the Vault Root. Add one path per line.').addTextArea((textArea) => {
            textArea.setValue(config.excludeFolders.join('\n'));
            textArea.inputEl.addEventListener('blur', () => {
                const excludes = textArea
                    .getValue()
                    .split('\n')
                    .filter((v) => v.length > 0);
                if (this.validateExcludeFolderList(settingName, excludes)) {
                    config.excludeFolders = excludes;
                    config.save();
                }
            });
        });
    }
    validateExcludeFolderList(settingName, excludes) {
        let isValid = true;
        let failedMsg = '';
        for (const str of excludes) {
            try {
                new RegExp(str);
            }
            catch (err) {
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                failedMsg += `<span class="qsp-warning">${str}</span><br/>${err}<br/><br/>`;
                isValid = false;
            }
        }
        if (!isValid) {
            const popup = new obsidian.Modal(this.app);
            popup.titleEl.setText(settingName);
            popup.contentEl.innerHTML = `Changes not saved. The following regex contain errors:<br/><br/>${failedMsg}`;
            popup.open();
        }
        return isValid;
    }
}

class SwitcherPlusSettingTab extends obsidian.PluginSettingTab {
    constructor(app, plugin, config) {
        super(app, plugin);
        this.config = config;
    }
    display() {
        const { app, containerEl, config } = this;
        const generalSection = new GeneralSettingsTabSection(app, this, config);
        const tabSections = [
            HeadingsSettingsTabSection,
            EditorSettingsTabSection,
            RelatedItemsSettingsTabSection,
            StarredSettingsTabSection,
            CommandListSettingsTabSection,
            WorkspaceSettingsTabSection,
        ];
        containerEl.empty();
        containerEl.createEl('h2', { text: 'Quick Switcher++ Settings' });
        generalSection.display(containerEl);
        this.setSymbolModeSettingsGroup(containerEl, config);
        tabSections.forEach((tabSectionClass) => {
            const tabSection = new tabSectionClass(app, this, config);
            tabSection.display(containerEl);
        });
    }
    setSymbolModeSettingsGroup(containerEl, config) {
        new obsidian.Setting(containerEl).setHeading().setName('Symbol List Mode Settings');
        SwitcherPlusSettingTab.setSymbolListCommand(containerEl, config);
        SwitcherPlusSettingTab.setSymbolsInLineOrder(containerEl, config);
        SwitcherPlusSettingTab.setAlwaysNewPaneForSymbols(containerEl, config);
        SwitcherPlusSettingTab.setUseActivePaneForSymbolsOnMobile(containerEl, config);
        SwitcherPlusSettingTab.setSelectNearestHeading(containerEl, config);
        this.setEnabledSymbolTypes(containerEl, config);
    }
    static setAlwaysNewPaneForSymbols(containerEl, config) {
        new obsidian.Setting(containerEl)
            .setName('Open Symbols in new pane')
            .setDesc('Enabled, always open a new pane when navigating to Symbols. Disabled, navigate in an already open pane (if one exists)')
            .addToggle((toggle) => toggle.setValue(config.alwaysNewPaneForSymbols).onChange((value) => {
            config.alwaysNewPaneForSymbols = value;
            config.save();
        }));
    }
    static setUseActivePaneForSymbolsOnMobile(containerEl, config) {
        new obsidian.Setting(containerEl)
            .setName('Open Symbols in active pane on mobile devices')
            .setDesc('Enabled, navigate to the target file and symbol in the active editor pane. Disabled, open a new pane when navigating to Symbols, even on mobile devices.')
            .addToggle((toggle) => toggle.setValue(config.useActivePaneForSymbolsOnMobile).onChange((value) => {
            config.useActivePaneForSymbolsOnMobile = value;
            config.save();
        }));
    }
    static setSelectNearestHeading(containerEl, config) {
        new obsidian.Setting(containerEl)
            .setName('Auto-select nearest heading')
            .setDesc('Enabled, in an unfiltered symbol list, select the closest preceding Heading to the current cursor position. Disabled, the first symbol in the list is selected.')
            .addToggle((toggle) => toggle.setValue(config.selectNearestHeading).onChange((value) => {
            config.selectNearestHeading = value;
            config.save();
        }));
    }
    static setSymbolsInLineOrder(containerEl, config) {
        new obsidian.Setting(containerEl)
            .setName('List symbols as indented outline')
            .setDesc('Enabled, symbols will be displayed in the (line) order they appear in the source text, indented under any preceding heading. Disabled, symbols will be grouped by type: Headings, Tags, Links, Embeds.')
            .addToggle((toggle) => toggle.setValue(config.symbolsInLineOrder).onChange((value) => {
            config.symbolsInLineOrder = value;
            config.save();
        }));
    }
    setEnabledSymbolTypes(containerEl, config) {
        new obsidian.Setting(containerEl).setName('Show Headings').addToggle((toggle) => toggle
            .setValue(config.isSymbolTypeEnabled(SymbolType.Heading))
            .onChange((value) => {
            config.setSymbolTypeEnabled(SymbolType.Heading, value);
            config.save();
        }));
        new obsidian.Setting(containerEl).setName('Show Tags').addToggle((toggle) => toggle.setValue(config.isSymbolTypeEnabled(SymbolType.Tag)).onChange((value) => {
            config.setSymbolTypeEnabled(SymbolType.Tag, value);
            config.save();
        }));
        new obsidian.Setting(containerEl).setName('Show Embeds').addToggle((toggle) => toggle.setValue(config.isSymbolTypeEnabled(SymbolType.Embed)).onChange((value) => {
            config.setSymbolTypeEnabled(SymbolType.Embed, value);
            config.save();
        }));
        this.setEnableLinks(containerEl, config);
    }
    setEnableLinks(containerEl, config) {
        const isLinksEnabled = config.isSymbolTypeEnabled(SymbolType.Link);
        new obsidian.Setting(containerEl).setName('Show Links').addToggle((toggle) => {
            toggle.setValue(isLinksEnabled).onChange(async (value) => {
                config.setSymbolTypeEnabled(SymbolType.Link, value);
                // have to await the save here because the call to display() will trigger a read
                // of the updated data
                await config.saveSettings();
                // reload the settings panel. This will cause the sublink types toggle
                // controls to be shown/hidden based on isLinksEnabled status
                this.display();
            });
        });
        if (isLinksEnabled) {
            SwitcherPlusSettingTab.addSubLinkTypeToggle(containerEl, config, LinkType.Heading, 'Links to headings');
            SwitcherPlusSettingTab.addSubLinkTypeToggle(containerEl, config, LinkType.Block, 'Links to blocks');
        }
    }
    static addSubLinkTypeToggle(containerEl, config, linkType, name) {
        new obsidian.Setting(containerEl)
            .setClass('qsp-setting-item-indent')
            .setName(name)
            .addToggle((toggle) => {
            const isExcluded = (config.excludeLinkSubTypes & linkType) === linkType;
            toggle.setValue(!isExcluded).onChange((isEnabled) => {
                let exclusions = config.excludeLinkSubTypes;
                if (isEnabled) {
                    // remove from exclusion list
                    exclusions &= ~linkType;
                }
                else {
                    // add to exclusion list
                    exclusions |= linkType;
                }
                config.excludeLinkSubTypes = exclusions;
                config.save();
            });
        });
    }
    static setSymbolListCommand(containerEl, config) {
        new obsidian.Setting(containerEl)
            .setName('Symbol list mode trigger')
            .setDesc('Character that will trigger symbol list mode in the switcher')
            .addText((text) => text
            .setPlaceholder(config.symbolListPlaceholderText)
            .setValue(config.symbolListCommand)
            .onChange((value) => {
            const val = value.length ? value : config.symbolListPlaceholderText;
            config.symbolListCommand = val;
            config.save();
        }));
    }
}

class Handler {
    constructor(app, settings) {
        this.app = app;
        this.settings = settings;
    }
    get commandString() {
        return null;
    }
    getEditorInfo(leaf) {
        const { excludeViewTypes } = this.settings;
        let file = null;
        let isValidSource = false;
        let cursor = null;
        if (leaf) {
            const { view } = leaf;
            const viewType = view.getViewType();
            file = view.file;
            cursor = this.getCursorPosition(view);
            // determine if the current active editor pane is valid
            const isCurrentEditorValid = !excludeViewTypes.includes(viewType);
            // whether or not the current active editor can be used as the target for
            // symbol search
            isValidSource = isCurrentEditorValid && !!file;
        }
        return { isValidSource, leaf, file, suggestion: null, cursor };
    }
    getSuggestionInfo(suggestion) {
        const info = this.getSourceInfoFromSuggestion(suggestion);
        let leaf = info.leaf;
        if (info.isValidSource) {
            // try to find a matching leaf for suggestion types that don't explicitly
            // provide one. This is primarily needed to be able to focus an
            // existing pane if there is one
            ({ leaf } = this.findOpenEditor(info.file, info.leaf));
        }
        // Get the cursor information to support `selectNearestHeading`
        const cursor = this.getCursorPosition(leaf?.view);
        return { ...info, leaf, cursor };
    }
    getSourceInfoFromSuggestion(suggestion) {
        let file = null;
        let leaf = null;
        // Can't use a symbol, workspace, unresolved (non-existent file) suggestions as
        // the target for another symbol command, because they don't point to a file
        const isFileBasedSuggestion = suggestion &&
            !isSymbolSuggestion(suggestion) &&
            !isUnresolvedSuggestion(suggestion) &&
            !isWorkspaceSuggestion(suggestion) &&
            !isCommandSuggestion(suggestion);
        if (isFileBasedSuggestion) {
            file = suggestion.file;
        }
        if (isEditorSuggestion(suggestion)) {
            leaf = suggestion.item;
        }
        const isValidSource = !!file;
        return { isValidSource, leaf, file, suggestion };
    }
    /**
     * Retrieves the position of the cursor, given that view is in a Mode that supports cursors.
     * @param  {View} view
     * @returns EditorPosition
     */
    getCursorPosition(view) {
        let cursor = null;
        if (view?.getViewType() === 'markdown') {
            const md = view;
            if (md.getMode() !== 'preview') {
                const { editor } = md;
                cursor = editor.getCursor('head');
            }
        }
        return cursor;
    }
    /**
     * Returns the text of the first H1 contained in sourceFile, or sourceFile
     * path if an H1 does not exist
     * @param  {TFile} sourceFile
     * @returns string
     */
    getTitleText(sourceFile) {
        const path = stripMDExtensionFromPath(sourceFile);
        const h1 = this.getFirstH1(sourceFile);
        return h1?.heading ?? path;
    }
    /**
     * Finds and returns the first H1 from sourceFile
     * @param  {TFile} sourceFile
     * @returns HeadingCache
     */
    getFirstH1(sourceFile) {
        let h1 = null;
        const { metadataCache } = this.app;
        const headingList = metadataCache.getFileCache(sourceFile)?.headings?.filter((v) => v.level === 1) ??
            [];
        if (headingList.length) {
            h1 = headingList.reduce((acc, curr) => {
                const { line: currLine } = curr.position.start;
                const accLine = acc.position.start.line;
                return currLine < accLine ? curr : acc;
            });
        }
        return h1;
    }
    /**
     * Finds the first open WorkspaceLeaf that is showing source file.
     * @param  {TFile} file The source file that is being shown to find
     * @param  {WorkspaceLeaf} leaf An already open editor, or, a 'reference' WorkspaceLeaf (example: backlinks, outline, etc.. views) that is used to find the associated editor if one exists.
     * @param  {} shouldIncludeRefViews=false set to true to make reference view types valid return candidates.
     * @returns TargetInfo
     */
    findOpenEditor(file, leaf, shouldIncludeRefViews = false) {
        let matchingLeaf = null;
        const hasSourceLeaf = !!leaf;
        const { settings: { referenceViews, excludeViewTypes, includeSidePanelViewTypes }, app: { workspace }, } = this;
        const isMatch = (candidateLeaf) => {
            let val = false;
            if (candidateLeaf?.view) {
                const isCandidateRefView = referenceViews.includes(candidateLeaf.view.getViewType());
                const isValidCandidate = shouldIncludeRefViews || !isCandidateRefView;
                const isSourceRefView = hasSourceLeaf && referenceViews.includes(leaf.view.getViewType());
                if (isValidCandidate) {
                    if (hasSourceLeaf && (shouldIncludeRefViews || !isSourceRefView)) {
                        val = candidateLeaf === leaf;
                    }
                    else {
                        val = candidateLeaf.view.file === file;
                    }
                }
            }
            return val;
        };
        // Prioritize the active leaf matches first, otherwise find the first matching leaf
        if (isMatch(workspace.activeLeaf)) {
            matchingLeaf = workspace.activeLeaf;
        }
        else {
            const leaves = this.getOpenLeaves(excludeViewTypes, includeSidePanelViewTypes);
            // put leaf at the first index so it gets checked first
            matchingLeaf = [leaf, ...leaves].find(isMatch);
        }
        return {
            leaf: matchingLeaf ?? null,
            file,
            suggestion: null,
            isValidSource: false,
        };
    }
    /**
     * Determines whether or not a new leaf should be created
     * @param  {boolean} isModDown Set to true if the user holding cmd/ctrl
     * @param  {} isAlreadyOpen=false Set to true if there is a pane showing the file already
     * @param  {Mode} mode? Only Symbol mode has special handling.
     * @returns boolean
     */
    shouldCreateNewLeaf(isModDown, isAlreadyOpen = false, mode) {
        const { onOpenPreferNewPane, alwaysNewPaneForSymbols, useActivePaneForSymbolsOnMobile, } = this.settings;
        const isNewPaneRequested = !isAlreadyOpen && onOpenPreferNewPane;
        let shouldCreateNew = isModDown || isNewPaneRequested;
        if (mode === Mode.SymbolList && !onOpenPreferNewPane) {
            const { isMobile } = obsidian.Platform;
            shouldCreateNew = alwaysNewPaneForSymbols || isModDown;
            if (isMobile) {
                shouldCreateNew = isModDown || !useActivePaneForSymbolsOnMobile;
            }
        }
        return shouldCreateNew;
    }
    /**
     * Determines if a leaf belongs to the main editor panel (workspace.rootSplit)
     * as opposed to the side panels
     * @param  {WorkspaceLeaf} leaf
     * @returns boolean
     */
    isMainPanelLeaf(leaf) {
        return leaf?.getRoot() === this.app.workspace.rootSplit;
    }
    /**
     * Reveals and optionally bring into focus a WorkspaceLeaf, including leaves
     * from the side panels.
     * @param  {WorkspaceLeaf} leaf
     * @param  {boolean} pushHistory?
     * @param  {Record<string} eState?
     * @param  {} unknown>
     * @returns void
     */
    activateLeaf(leaf, pushHistory, eState) {
        const { workspace } = this.app;
        const isInSidePanel = !this.isMainPanelLeaf(leaf);
        const state = { focus: true, ...eState };
        if (isInSidePanel) {
            workspace.revealLeaf(leaf);
        }
        workspace.setActiveLeaf(leaf, pushHistory);
        leaf.view.setEphemeralState(state);
    }
    /**
     * Returns a array of all open WorkspaceLeaf taking into account
     * excludeMainPanelViewTypes and includeSidePanelViewTypes.
     * @param  {string[]} excludeMainPanelViewTypes?
     * @param  {string[]} includeSidePanelViewTypes?
     * @returns WorkspaceLeaf[]
     */
    getOpenLeaves(excludeMainPanelViewTypes, includeSidePanelViewTypes) {
        const leaves = [];
        const saveLeaf = (l) => {
            const viewType = l.view?.getViewType();
            if (this.isMainPanelLeaf(l)) {
                if (!excludeMainPanelViewTypes?.includes(viewType)) {
                    leaves.push(l);
                }
            }
            else if (includeSidePanelViewTypes?.includes(viewType)) {
                leaves.push(l);
            }
        };
        this.app.workspace.iterateAllLeaves(saveLeaf);
        return leaves;
    }
    /**
     * Loads a file into a (optionally new) WorkspaceLeaf
     * @param  {TFile} file
     * @param  {boolean} shouldCreateNewLeaf
     * @param  {OpenViewState} openState?
     * @param  {} errorContext=''
     * @returns void
     */
    openFileInLeaf(file, shouldCreateNewLeaf, openState, errorContext) {
        errorContext = errorContext ?? '';
        const message = `Switcher++: error opening file. ${errorContext}`;
        try {
            this.app.workspace
                .getLeaf(shouldCreateNewLeaf)
                .openFile(file, openState)
                .catch((reason) => {
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                console.log(`${message} ${reason}`);
            });
        }
        catch (error) {
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            console.log(`${message} ${error}`);
        }
    }
    /**
     * Determines whether to activate (make active and focused) an existing WorkspaceLeaf,
     * or, create a new WorkspaceLeaf, or, reuse an unpinned WorkspaceLeaf in order to
     * dispay file. This takes user settings and Mod key status into account.
     * @param  {boolean} isModDown Set to true if the user is holding down cmd/ctrl keys
     * @param  {TFile} file The file to display
     * @param  {string} errorContext Custom text to save in error messages
     * @param  {OpenViewState} openState? State to pass to the new, or activated view. If
     * falsy, default values will be used
     * @param  {WorkspaceLeaf} leaf? Editor, or reference WorkspaceLeaf to activate if it's
     * already known
     * @param  {Mode} mode? Only Symbol mode has custom handling
     * @returns void
     */
    navigateToLeafOrOpenFile(isModDown, file, errorContext, openState, leaf, mode, shouldIncludeRefViews = false) {
        const { leaf: targetLeaf } = this.findOpenEditor(file, leaf, shouldIncludeRefViews);
        const isAlreadyOpen = !!targetLeaf;
        const shouldCreateNew = this.shouldCreateNewLeaf(isModDown, isAlreadyOpen, mode);
        // default to having the pane active and focused
        openState = openState ?? { active: true, eState: { active: true, focus: true } };
        if (targetLeaf && !shouldCreateNew) {
            const eState = openState?.eState;
            this.activateLeaf(targetLeaf, true, eState);
        }
        else {
            this.openFileInLeaf(file, shouldCreateNew, openState, errorContext);
        }
    }
}

const WORKSPACE_PLUGIN_ID = 'workspaces';
class WorkspaceHandler extends Handler {
    get commandString() {
        return this.settings?.workspaceListCommand;
    }
    validateCommand(inputInfo, index, filterText, _activeSuggestion, _activeLeaf) {
        if (this.isWorkspacesPluginEnabled()) {
            inputInfo.mode = Mode.WorkspaceList;
            const workspaceCmd = inputInfo.parsedCommand(Mode.WorkspaceList);
            workspaceCmd.index = index;
            workspaceCmd.parsedInput = filterText;
            workspaceCmd.isValidated = true;
        }
    }
    getSuggestions(inputInfo) {
        const suggestions = [];
        if (inputInfo) {
            inputInfo.buildSearchQuery();
            const { hasSearchTerm, prepQuery } = inputInfo.searchQuery;
            const items = this.getItems();
            items.forEach((item) => {
                let shouldPush = true;
                let match = null;
                if (hasSearchTerm) {
                    match = obsidian.fuzzySearch(prepQuery, item.id);
                    shouldPush = !!match;
                }
                if (shouldPush) {
                    suggestions.push({ type: SuggestionType.WorkspaceList, item, match });
                }
            });
            if (hasSearchTerm) {
                obsidian.sortSearchResults(suggestions);
            }
        }
        return suggestions;
    }
    renderSuggestion(sugg, parentEl) {
        if (sugg) {
            obsidian.renderResults(parentEl, sugg.item.id, sugg.match);
        }
    }
    onChooseSuggestion(sugg, _evt) {
        if (sugg) {
            const { id } = sugg.item;
            const pluginInstance = this.getSystemWorkspacesPluginInstance();
            if (typeof pluginInstance['loadWorkspace'] === 'function') {
                pluginInstance.loadWorkspace(id);
            }
        }
    }
    getItems() {
        const items = [];
        const workspaces = this.getSystemWorkspacesPluginInstance()?.workspaces;
        if (workspaces) {
            Object.keys(workspaces).forEach((id) => items.push({ id, type: 'workspaceInfo' }));
        }
        return items;
    }
    isWorkspacesPluginEnabled() {
        const plugin = this.getSystemWorkspacesPlugin();
        return plugin?.enabled;
    }
    getSystemWorkspacesPlugin() {
        return getInternalPluginById(this.app, WORKSPACE_PLUGIN_ID);
    }
    getSystemWorkspacesPluginInstance() {
        const workspacesPlugin = this.getSystemWorkspacesPlugin();
        return workspacesPlugin?.instance;
    }
}

class HeadingsHandler extends Handler {
    get commandString() {
        return this.settings?.headingsListCommand;
    }
    validateCommand(inputInfo, index, filterText, _activeSuggestion, _activeLeaf) {
        inputInfo.mode = Mode.HeadingsList;
        const headingsCmd = inputInfo.parsedCommand(Mode.HeadingsList);
        headingsCmd.index = index;
        headingsCmd.parsedInput = filterText;
        headingsCmd.isValidated = true;
    }
    onChooseSuggestion(sugg, evt) {
        if (sugg) {
            const { start: { line, col }, end: endLoc, } = sugg.item.position;
            // state information to highlight the target heading
            const eState = {
                active: true,
                focus: true,
                startLoc: { line, col },
                endLoc,
                line,
                cursor: {
                    from: { line, ch: col },
                    to: { line, ch: col },
                },
            };
            this.navigateToLeafOrOpenFile(obsidian.Keymap.isModEvent(evt), sugg.file, 'Unable to navigate to heading for file.', { active: true, eState });
        }
    }
    renderSuggestion(sugg, parentEl) {
        if (sugg) {
            const { item } = sugg;
            obsidian.renderResults(parentEl, item.heading, sugg.match);
            parentEl.createSpan({
                cls: ['suggestion-flair', 'qsp-headings-indicator'],
                text: HeadingIndicators[item.level],
                prepend: true,
            });
            parentEl.createDiv({
                cls: 'suggestion-note',
                text: stripMDExtensionFromPath(sugg.file),
            });
            if (sugg.downranked) {
                parentEl.addClass('mod-downranked');
            }
        }
    }
    getSuggestions(inputInfo) {
        let suggestions = [];
        if (inputInfo) {
            inputInfo.buildSearchQuery();
            const { prepQuery, hasSearchTerm } = inputInfo.searchQuery;
            if (hasSearchTerm) {
                const { limit } = this.settings;
                suggestions = this.getAllFilesSuggestions(prepQuery);
                obsidian.sortSearchResults(suggestions);
                if (suggestions.length > 0 && limit > 0) {
                    suggestions = suggestions.slice(0, limit);
                }
            }
            else {
                suggestions = this.getRecentFilesSuggestions();
            }
        }
        return suggestions;
    }
    getAllFilesSuggestions(prepQuery) {
        const suggestions = [];
        const { app: { vault }, settings: { strictHeadingsOnly, showExistingOnly, excludeFolders }, } = this;
        const isExcludedFolder = matcherFnForRegExList(excludeFolders);
        let nodes = [vault.getRoot()];
        while (nodes.length > 0) {
            const node = nodes.pop();
            if (isTFile(node)) {
                this.addSuggestionsFromFile(suggestions, node, prepQuery);
            }
            else if (!isExcludedFolder(node.path)) {
                nodes = nodes.concat(node.children);
            }
        }
        if (!strictHeadingsOnly && !showExistingOnly) {
            this.addUnresolvedSuggestions(suggestions, prepQuery);
        }
        return suggestions;
    }
    addSuggestionsFromFile(suggestions, file, prepQuery) {
        const { searchAllHeadings, strictHeadingsOnly, shouldSearchFilenames, shouldShowAlias, } = this.settings;
        if (this.shouldIncludeFile(file)) {
            const isH1Matched = this.addHeadingSuggestions(suggestions, prepQuery, file, searchAllHeadings);
            if (!strictHeadingsOnly) {
                if (shouldSearchFilenames || !isH1Matched) {
                    // if strict is disabled and filename search is enabled or there
                    // isn't an H1 match, then do a fallback search against the filename, then path
                    this.addFileSuggestions(suggestions, prepQuery, file);
                }
                if (shouldShowAlias) {
                    this.addAliasSuggestions(suggestions, prepQuery, file);
                }
            }
        }
    }
    downrankScoreIfIgnored(sugg) {
        if (this.app.metadataCache.isUserIgnored(sugg?.file?.path)) {
            sugg.downranked = true;
            if (sugg.match) {
                sugg.match.score -= 10;
            }
        }
        return sugg;
    }
    shouldIncludeFile(file) {
        let retVal = false;
        const { settings: { excludeObsidianIgnoredFiles, builtInSystemOptions: { showAttachments, showAllFileTypes }, }, app: { viewRegistry, metadataCache }, } = this;
        if (isTFile(file)) {
            const { extension } = file;
            if (!metadataCache.isUserIgnored(file.path) || !excludeObsidianIgnoredFiles) {
                retVal = viewRegistry.isExtensionRegistered(extension)
                    ? showAttachments || extension === 'md'
                    : showAllFileTypes;
            }
        }
        return retVal;
    }
    addAliasSuggestions(suggestions, prepQuery, file) {
        const { metadataCache } = this.app;
        const frontMatter = metadataCache.getFileCache(file)?.frontmatter;
        if (frontMatter) {
            const aliases = FrontMatterParser.getAliases(frontMatter);
            let i = aliases.length;
            // create suggestions where there is a match with an alias
            while (i--) {
                const alias = aliases[i];
                const { match } = this.fuzzySearchWithFallback(prepQuery, alias, null);
                if (match) {
                    suggestions.push(this.createAliasSuggestion(alias, file, match));
                }
            }
        }
    }
    addFileSuggestions(suggestions, prepQuery, file) {
        const path = stripMDExtensionFromPath(file);
        const filename = filenameFromPath(path);
        const { isPrimary, match } = this.fuzzySearchWithFallback(prepQuery, filename, path);
        if (isPrimary) {
            this.adjustMatchIndicesForPath(match.matches, path.length - filename.length);
        }
        if (match) {
            suggestions.push(this.createFileSuggestion(file, match));
        }
    }
    addHeadingSuggestions(suggestions, prepQuery, file, allHeadings) {
        const { metadataCache } = this.app;
        const headingList = metadataCache.getFileCache(file)?.headings ?? [];
        let h1 = null;
        let isH1Matched = false;
        let i = headingList.length;
        while (i--) {
            const heading = headingList[i];
            let isMatched = false;
            if (allHeadings) {
                isMatched = this.matchAndPushHeading(suggestions, prepQuery, file, heading);
            }
            if (heading.level === 1) {
                const { line } = heading.position.start;
                if (h1 === null || line < h1.position.start.line) {
                    h1 = heading;
                    isH1Matched = isMatched;
                }
            }
        }
        if (!allHeadings && h1) {
            isH1Matched = this.matchAndPushHeading(suggestions, prepQuery, file, h1);
        }
        return isH1Matched;
    }
    matchAndPushHeading(suggestions, prepQuery, file, heading) {
        const { match } = this.fuzzySearchWithFallback(prepQuery, heading.heading, null);
        if (match) {
            suggestions.push(this.createHeadingSuggestion(heading, file, match));
        }
        return !!match;
    }
    addUnresolvedSuggestions(suggestions, prepQuery) {
        const { unresolvedLinks } = this.app.metadataCache;
        const unresolvedSet = new Set();
        const sources = Object.keys(unresolvedLinks);
        let i = sources.length;
        // create a distinct list of unresolved links
        while (i--) {
            // each source has an object with keys that represent the list of unresolved links
            // for that source file
            const sourcePath = sources[i];
            const links = Object.keys(unresolvedLinks[sourcePath]);
            let j = links.length;
            while (j--) {
                // unresolved links can be duplicates, use a Set to get a distinct list
                unresolvedSet.add(links[j]);
            }
        }
        const unresolvedList = Array.from(unresolvedSet);
        i = unresolvedList.length;
        // create suggestions where there is a match with an unresolved link
        while (i--) {
            const unresolved = unresolvedList[i];
            const { match } = this.fuzzySearchWithFallback(prepQuery, unresolved, null);
            if (match) {
                suggestions.push(this.createUnresolvedSuggestion(unresolved, match));
            }
        }
    }
    createAliasSuggestion(alias, file, match) {
        const sugg = {
            alias,
            file,
            match,
            type: SuggestionType.Alias,
        };
        return this.downrankScoreIfIgnored(sugg);
    }
    createUnresolvedSuggestion(linktext, match) {
        return {
            linktext,
            match,
            type: SuggestionType.Unresolved,
        };
    }
    createFileSuggestion(file, match) {
        const sugg = {
            file,
            match,
            type: SuggestionType.File,
        };
        return this.downrankScoreIfIgnored(sugg);
    }
    createHeadingSuggestion(item, file, match) {
        const sugg = {
            item,
            file,
            match,
            type: SuggestionType.HeadingsList,
        };
        return this.downrankScoreIfIgnored(sugg);
    }
    fuzzySearchWithFallback(prepQuery, primaryString, secondaryString) {
        let isPrimary = false;
        let match = null;
        if (primaryString) {
            match = obsidian.fuzzySearch(prepQuery, primaryString);
            isPrimary = !!match;
        }
        if (!match && secondaryString) {
            match = obsidian.fuzzySearch(prepQuery, secondaryString);
            if (match) {
                match.score -= 1;
            }
        }
        return {
            isPrimary,
            match,
        };
    }
    adjustMatchIndicesForPath(matches, pathLen) {
        matches?.forEach((match) => {
            match[0] += pathLen;
            match[1] += pathLen;
        });
    }
    getRecentFilesSuggestions() {
        const suggestions = [];
        const { workspace, vault, metadataCache } = this.app;
        const recentFilePaths = workspace.getLastOpenFiles();
        recentFilePaths.forEach((path) => {
            const file = vault.getAbstractFileByPath(path);
            if (this.shouldIncludeFile(file)) {
                const f = file;
                let h1 = null;
                const h1s = metadataCache
                    .getFileCache(f)
                    ?.headings?.filter((h) => h.level === 1)
                    .sort((a, b) => a.position.start.line - b.position.start.line);
                if (h1s?.length) {
                    h1 = h1s[0];
                }
                const sugg = h1
                    ? this.createHeadingSuggestion(h1, f, null)
                    : this.createFileSuggestion(f, null);
                suggestions.push(sugg);
            }
        });
        return suggestions;
    }
}

class EditorHandler extends Handler {
    get commandString() {
        return this.settings?.editorListCommand;
    }
    validateCommand(inputInfo, index, filterText, _activeSuggestion, _activeLeaf) {
        inputInfo.mode = Mode.EditorList;
        const editorCmd = inputInfo.parsedCommand(Mode.EditorList);
        editorCmd.index = index;
        editorCmd.parsedInput = filterText;
        editorCmd.isValidated = true;
    }
    getSuggestions(inputInfo) {
        const suggestions = [];
        if (inputInfo) {
            inputInfo.buildSearchQuery();
            const { hasSearchTerm, prepQuery } = inputInfo.searchQuery;
            const { excludeViewTypes, includeSidePanelViewTypes } = this.settings;
            const items = this.getOpenLeaves(excludeViewTypes, includeSidePanelViewTypes);
            items.forEach((item) => {
                let shouldPush = true;
                let match = null;
                if (hasSearchTerm) {
                    match = obsidian.fuzzySearch(prepQuery, item.getDisplayText());
                    shouldPush = !!match;
                }
                if (shouldPush) {
                    const file = item.view?.file;
                    suggestions.push({ type: SuggestionType.EditorList, file, item, match });
                }
            });
            if (hasSearchTerm) {
                obsidian.sortSearchResults(suggestions);
            }
        }
        return suggestions;
    }
    renderSuggestion(sugg, parentEl) {
        if (sugg) {
            obsidian.renderResults(parentEl, sugg.item.getDisplayText(), sugg.match);
        }
    }
    onChooseSuggestion(sugg, evt) {
        if (sugg) {
            this.navigateToLeafOrOpenFile(obsidian.Keymap.isModEvent(evt), sugg.file, 'Unable to reopen existing editor in new Leaf.', null, sugg.item, null, true);
        }
    }
}

class SymbolHandler extends Handler {
    get commandString() {
        return this.settings?.symbolListCommand;
    }
    validateCommand(inputInfo, index, filterText, activeSuggestion, activeLeaf) {
        const sourceInfo = this.getSourceInfoForSymbolOperation(activeSuggestion, activeLeaf, index === 0);
        if (sourceInfo) {
            inputInfo.mode = Mode.SymbolList;
            const symbolCmd = inputInfo.parsedCommand(Mode.SymbolList);
            symbolCmd.source = sourceInfo;
            symbolCmd.index = index;
            symbolCmd.parsedInput = filterText;
            symbolCmd.isValidated = true;
        }
    }
    getSuggestions(inputInfo) {
        const suggestions = [];
        if (inputInfo) {
            this.inputInfo = inputInfo;
            inputInfo.buildSearchQuery();
            const { hasSearchTerm, prepQuery } = inputInfo.searchQuery;
            const symbolCmd = inputInfo.parsedCommand(Mode.SymbolList);
            const items = this.getItems(symbolCmd.source, hasSearchTerm);
            items.forEach((item) => {
                let shouldPush = true;
                let match = null;
                if (hasSearchTerm) {
                    match = obsidian.fuzzySearch(prepQuery, SymbolHandler.getSuggestionTextForSymbol(item));
                    shouldPush = !!match;
                }
                if (shouldPush) {
                    const { file } = symbolCmd.source;
                    suggestions.push({ type: SuggestionType.SymbolList, file, item, match });
                }
            });
            if (hasSearchTerm) {
                obsidian.sortSearchResults(suggestions);
            }
        }
        return suggestions;
    }
    renderSuggestion(sugg, parentEl) {
        if (sugg) {
            const { item } = sugg;
            let containerEl = parentEl;
            if (this.settings.symbolsInLineOrder &&
                this.inputInfo &&
                !this.inputInfo.searchQuery.hasSearchTerm) {
                containerEl.addClass(`qsp-symbol-l${item.indentLevel}`);
            }
            const text = SymbolHandler.getSuggestionTextForSymbol(item);
            SymbolHandler.addSymbolIndicator(item, containerEl);
            containerEl = parentEl.createSpan({
                cls: 'qsp-symbol-text',
            });
            obsidian.renderResults(containerEl, text, sugg.match);
        }
    }
    onChooseSuggestion(sugg, evt) {
        if (sugg) {
            const symbolCmd = this.inputInfo.parsedCommand();
            this.navigateToSymbol(sugg, symbolCmd, obsidian.Keymap.isModEvent(evt));
        }
    }
    reset() {
        this.inputInfo = null;
    }
    getSourceInfoForSymbolOperation(activeSuggestion, activeLeaf, isSymbolCmdPrefix) {
        const prevInputInfo = this.inputInfo;
        let prevSourceInfo = null;
        let prevMode = Mode.Standard;
        if (prevInputInfo) {
            prevSourceInfo = prevInputInfo.parsedCommand().source;
            prevMode = prevInputInfo.mode;
        }
        // figure out if the previous operation was a symbol operation
        const hasPrevSymbolSource = prevMode === Mode.SymbolList && !!prevSourceInfo;
        const activeEditorInfo = this.getEditorInfo(activeLeaf);
        const activeSuggInfo = this.getSuggestionInfo(activeSuggestion);
        // Pick the source file for a potential symbol operation, prioritizing
        // any pre-existing symbol operation that was in progress
        let sourceInfo = null;
        if (hasPrevSymbolSource) {
            sourceInfo = prevSourceInfo;
        }
        else if (activeSuggInfo.isValidSource) {
            sourceInfo = activeSuggInfo;
        }
        else if (activeEditorInfo.isValidSource && isSymbolCmdPrefix) {
            sourceInfo = activeEditorInfo;
        }
        return sourceInfo;
    }
    getItems(sourceInfo, hasSearchTerm) {
        let items = [];
        let symbolsInLineOrder = false;
        let selectNearestHeading = false;
        if (!hasSearchTerm) {
            ({ selectNearestHeading, symbolsInLineOrder } = this.settings);
        }
        items = this.getSymbolsFromSource(sourceInfo, symbolsInLineOrder);
        if (selectNearestHeading) {
            SymbolHandler.FindNearestHeadingSymbol(items, sourceInfo);
        }
        return items;
    }
    static FindNearestHeadingSymbol(items, sourceInfo) {
        const cursorLine = sourceInfo?.cursor?.line;
        // find the nearest heading to the current cursor pos, if applicable
        if (cursorLine) {
            let found = null;
            const headings = items.filter((v) => isHeadingCache(v.symbol));
            if (headings.length) {
                found = headings.reduce((acc, curr) => {
                    const { line: currLine } = curr.symbol.position.start;
                    const accLine = acc ? acc.symbol.position.start.line : -1;
                    return currLine > accLine && currLine <= cursorLine ? curr : acc;
                });
            }
            if (found) {
                found.isSelected = true;
            }
        }
    }
    getSymbolsFromSource(sourceInfo, orderByLineNumber) {
        const { app: { metadataCache }, settings, } = this;
        const ret = [];
        if (sourceInfo?.file) {
            const file = sourceInfo.file;
            const symbolData = metadataCache.getFileCache(file);
            if (symbolData) {
                const push = (symbols = [], symbolType) => {
                    if (settings.isSymbolTypeEnabled(symbolType)) {
                        symbols.forEach((symbol) => ret.push({ type: 'symbolInfo', symbol, symbolType }));
                    }
                };
                push(symbolData.headings, SymbolType.Heading);
                push(symbolData.tags, SymbolType.Tag);
                this.addLinksFromSource(symbolData.links, ret);
                push(symbolData.embeds, SymbolType.Embed);
            }
        }
        return orderByLineNumber ? SymbolHandler.orderSymbolsByLineNumber(ret) : ret;
    }
    addLinksFromSource(linkData, symbolList) {
        const { settings } = this;
        linkData = linkData ?? [];
        if (settings.isSymbolTypeEnabled(SymbolType.Link)) {
            for (const link of linkData) {
                const type = getLinkType(link);
                const isExcluded = (settings.excludeLinkSubTypes & type) === type;
                if (!isExcluded) {
                    symbolList.push({
                        type: 'symbolInfo',
                        symbol: link,
                        symbolType: SymbolType.Link,
                    });
                }
            }
        }
    }
    static orderSymbolsByLineNumber(symbols = []) {
        const sorted = symbols.sort((a, b) => {
            const { start: aStart } = a.symbol.position;
            const { start: bStart } = b.symbol.position;
            const lineDiff = aStart.line - bStart.line;
            return lineDiff === 0 ? aStart.col - bStart.col : lineDiff;
        });
        let currIndentLevel = 0;
        sorted.forEach((si) => {
            let indentLevel = 0;
            if (isHeadingCache(si.symbol)) {
                currIndentLevel = si.symbol.level;
                indentLevel = si.symbol.level - 1;
            }
            else {
                indentLevel = currIndentLevel;
            }
            si.indentLevel = indentLevel;
        });
        return sorted;
    }
    static getSuggestionTextForSymbol(symbolInfo) {
        const { symbol } = symbolInfo;
        let text;
        if (isHeadingCache(symbol)) {
            text = symbol.heading;
        }
        else if (isTagCache(symbol)) {
            text = symbol.tag.slice(1);
        }
        else {
            const refCache = symbol;
            ({ link: text } = refCache);
            const { displayText } = refCache;
            if (displayText && displayText !== text) {
                text += `|${displayText}`;
            }
        }
        return text;
    }
    static addSymbolIndicator(symbolInfo, parentEl) {
        const { symbolType, symbol } = symbolInfo;
        let indicator;
        if (isHeadingCache(symbol)) {
            indicator = HeadingIndicators[symbol.level];
        }
        else {
            indicator = SymbolIndicators[symbolType];
        }
        parentEl.createDiv({
            text: indicator,
            cls: 'qsp-symbol-indicator',
        });
    }
    navigateToSymbol(sugg, symbolCmd, isModDown) {
        const { leaf, file } = symbolCmd.source;
        const { start: { line, col }, end: endLoc, } = sugg.item.symbol.position;
        // object containing the state information for the target editor,
        // start with the range to highlight in target editor
        const eState = {
            active: true,
            focus: true,
            startLoc: { line, col },
            endLoc,
            line,
            cursor: {
                from: { line, ch: col },
                to: { line, ch: col },
            },
        };
        this.navigateToLeafOrOpenFile(isModDown, file, `Unable to navigate to symbol for file ${file.path}`, { active: true, eState }, leaf, Mode.SymbolList);
    }
}

const STARRED_PLUGIN_ID = 'starred';
class StarredHandler extends Handler {
    get commandString() {
        return this.settings?.starredListCommand;
    }
    validateCommand(inputInfo, index, filterText, _activeSuggestion, _activeLeaf) {
        if (this.isStarredPluginEnabled()) {
            inputInfo.mode = Mode.StarredList;
            const starredCmd = inputInfo.parsedCommand(Mode.StarredList);
            starredCmd.index = index;
            starredCmd.parsedInput = filterText;
            starredCmd.isValidated = true;
        }
    }
    getSuggestions(inputInfo) {
        const suggestions = [];
        if (inputInfo) {
            inputInfo.buildSearchQuery();
            const { hasSearchTerm, prepQuery } = inputInfo.searchQuery;
            const itemsInfo = this.getItems();
            itemsInfo.forEach(({ file, item }) => {
                let shouldPush = true;
                let match = null;
                if (hasSearchTerm) {
                    match = obsidian.fuzzySearch(prepQuery, item.title);
                    shouldPush = !!match;
                }
                if (shouldPush) {
                    suggestions.push({ type: SuggestionType.StarredList, file, item, match });
                }
            });
            if (hasSearchTerm) {
                obsidian.sortSearchResults(suggestions);
            }
        }
        return suggestions;
    }
    renderSuggestion(sugg, parentEl) {
        if (sugg) {
            obsidian.renderResults(parentEl, sugg.item.title, sugg.match);
        }
    }
    onChooseSuggestion(sugg, evt) {
        if (sugg) {
            const { item } = sugg;
            if (isFileStarredItem(item)) {
                const { file } = sugg;
                this.navigateToLeafOrOpenFile(obsidian.Keymap.isModEvent(evt), file, `Unable to open Starred file ${file.path}`);
            }
        }
    }
    getTFileByPath(path) {
        let file = null;
        const abstractItem = this.app.vault.getAbstractFileByPath(path);
        if (isTFile(abstractItem)) {
            file = abstractItem;
        }
        return file;
    }
    getItems() {
        const itemsInfo = [];
        const starredItems = this.getSystemStarredPluginInstance()?.items;
        if (starredItems) {
            starredItems.forEach((starredItem) => {
                // Only support displaying of starred files for now
                if (isFileStarredItem(starredItem)) {
                    const file = this.getTFileByPath(starredItem.path);
                    // 2022-apr when a starred file is deleted, the underlying data stored in the
                    // Starred plugin data file (starred.json) for that file remain in there, but
                    // at runtime the deleted file info is not displayed. Do the same here.
                    if (file) {
                        // 2022-apr when a starred file is renamed, the 'title' property stored in
                        // the underlying Starred plugin data file (starred.json) is not updated, but
                        // at runtime, the title that is displayed in the UI does reflect the updated
                        // filename. So do the same thing here in order to display the current
                        // filename as the starred file title
                        const title = file.basename;
                        const item = {
                            type: 'file',
                            title,
                            path: starredItem.path,
                        };
                        itemsInfo.push({ file, item });
                    }
                }
            });
        }
        return itemsInfo;
    }
    isStarredPluginEnabled() {
        const plugin = this.getSystemStarredPlugin();
        return plugin?.enabled;
    }
    getSystemStarredPlugin() {
        return getInternalPluginById(this.app, STARRED_PLUGIN_ID);
    }
    getSystemStarredPluginInstance() {
        const starredPlugin = this.getSystemStarredPlugin();
        return starredPlugin?.instance;
    }
}

const COMMAND_PALETTE_PLUGIN_ID = 'command-palette';
class CommandHandler extends Handler {
    get commandString() {
        return this.settings?.commandListCommand;
    }
    validateCommand(inputInfo, index, filterText, _activeSuggestion, _activeLeaf) {
        inputInfo.mode = Mode.CommandList;
        const commandCmd = inputInfo.parsedCommand(Mode.CommandList);
        commandCmd.index = index;
        commandCmd.parsedInput = filterText;
        commandCmd.isValidated = true;
    }
    getSuggestions(inputInfo) {
        const suggestions = [];
        if (inputInfo) {
            inputInfo.buildSearchQuery();
            const { hasSearchTerm, prepQuery } = inputInfo.searchQuery;
            const itemsInfo = this.getItems();
            itemsInfo.forEach((item) => {
                let shouldPush = true;
                let match = null;
                if (hasSearchTerm) {
                    match = obsidian.fuzzySearch(prepQuery, item.name);
                    shouldPush = !!match;
                }
                if (shouldPush) {
                    suggestions.push({
                        type: SuggestionType.CommandList,
                        item,
                        match,
                    });
                }
            });
            if (hasSearchTerm) {
                obsidian.sortSearchResults(suggestions);
            }
        }
        return suggestions;
    }
    renderSuggestion(sugg, parentEl) {
        if (sugg) {
            obsidian.renderResults(parentEl, sugg.item.name, sugg.match);
        }
    }
    onChooseSuggestion(sugg) {
        if (sugg) {
            const { item } = sugg;
            this.app.commands.executeCommandById(item.id);
        }
    }
    getItems() {
        // Sort commands by their name
        const items = this.app.commands.listCommands().sort((a, b) => {
            if (a.name < b.name)
                return -1;
            if (a.name > b.name)
                return 1;
            return 0;
        });
        // Pinned commands should be at the top (if any)
        if (this.isCommandPalettePluginEnabled() &&
            this.getCommandPalettePluginInstance()?.options.pinned?.length > 0) {
            const pinnedCommandIds = this.getCommandPalettePluginInstance().options.pinned;
            // We're gonna find the pinned command in `items` and move it to the beginning
            // Therefore we need to perform "for each right"
            for (let i = pinnedCommandIds.length - 1; i >= 0; i--) {
                const commandId = pinnedCommandIds[i];
                const commandIndex = items.findIndex((c) => c.id === commandId);
                if (commandIndex > -1) {
                    const command = items[commandIndex];
                    items.splice(commandIndex, 1);
                    items.unshift(command);
                }
            }
        }
        return items;
    }
    isCommandPalettePluginEnabled() {
        const plugin = this.getCommandPalettePlugin();
        return plugin?.enabled;
    }
    getCommandPalettePlugin() {
        return getInternalPluginById(this.app, COMMAND_PALETTE_PLUGIN_ID);
    }
    getCommandPalettePluginInstance() {
        const commandPalettePlugin = this.getCommandPalettePlugin();
        return commandPalettePlugin?.instance;
    }
}

class RelatedItemsHandler extends Handler {
    get commandString() {
        return this.settings?.relatedItemsListCommand;
    }
    validateCommand(inputInfo, index, filterText, activeSuggestion, activeLeaf) {
        const sourceInfo = this.getSourceInfo(activeSuggestion, activeLeaf, index === 0);
        if (sourceInfo) {
            inputInfo.mode = Mode.RelatedItemsList;
            const cmd = inputInfo.parsedCommand(Mode.RelatedItemsList);
            cmd.source = sourceInfo;
            cmd.index = index;
            cmd.parsedInput = filterText;
            cmd.isValidated = true;
        }
    }
    getSuggestions(inputInfo) {
        const suggestions = [];
        if (inputInfo) {
            this.inputInfo = inputInfo;
            inputInfo.buildSearchQuery();
            const { hasSearchTerm, prepQuery } = inputInfo.searchQuery;
            const cmd = inputInfo.parsedCommand(Mode.RelatedItemsList);
            const items = this.getRelatedFiles(cmd.source.file);
            items.forEach((item) => {
                let shouldPush = true;
                let match = null;
                if (hasSearchTerm) {
                    match = obsidian.fuzzySearch(prepQuery, this.getTitleText(item));
                    shouldPush = !!match;
                }
                if (shouldPush) {
                    suggestions.push({
                        type: SuggestionType.RelatedItemsList,
                        relationType: 'diskLocation',
                        file: item,
                        match,
                    });
                }
            });
            if (hasSearchTerm) {
                obsidian.sortSearchResults(suggestions);
            }
        }
        return suggestions;
    }
    renderSuggestion(sugg, parentEl) {
        if (sugg) {
            obsidian.renderResults(parentEl, this.getTitleText(sugg.file), sugg.match);
        }
    }
    onChooseSuggestion(sugg, evt) {
        if (sugg) {
            const { file } = sugg;
            this.navigateToLeafOrOpenFile(obsidian.Keymap.isModEvent(evt), file, `Unable to open related file ${file.path}`);
        }
    }
    getTitleText(sourceFile) {
        return stripMDExtensionFromPath(sourceFile);
    }
    getRelatedFiles(sourceFile) {
        const relatedFiles = [];
        const { excludeRelatedFolders, excludeOpenRelatedFiles } = this.settings;
        const isExcludedFolder = matcherFnForRegExList(excludeRelatedFolders);
        let nodes = [...sourceFile.parent.children];
        while (nodes.length > 0) {
            const node = nodes.pop();
            if (isTFile(node)) {
                const isSourceFile = node === sourceFile;
                const isExcluded = isSourceFile || (excludeOpenRelatedFiles && !!this.findOpenEditor(node).leaf);
                if (!isExcluded) {
                    relatedFiles.push(node);
                }
            }
            else if (!isExcludedFolder(node.path)) {
                nodes = nodes.concat(node.children);
            }
        }
        return relatedFiles;
    }
    reset() {
        this.inputInfo = null;
    }
    getSourceInfo(activeSuggestion, activeLeaf, isPrefixCmd) {
        const prevInputInfo = this.inputInfo;
        let prevSourceInfo = null;
        let prevMode = Mode.Standard;
        if (prevInputInfo) {
            prevSourceInfo = prevInputInfo.parsedCommand().source;
            prevMode = prevInputInfo.mode;
        }
        // figure out if the previous operation was a symbol operation
        const hasPrevSource = prevMode === Mode.RelatedItemsList && !!prevSourceInfo;
        const activeEditorInfo = this.getEditorInfo(activeLeaf);
        const activeSuggInfo = this.getSuggestionInfo(activeSuggestion);
        // Pick the source file for the operation, prioritizing
        // any pre-existing operation that was in progress
        let sourceInfo = null;
        if (hasPrevSource) {
            sourceInfo = prevSourceInfo;
        }
        else if (activeSuggInfo.isValidSource) {
            sourceInfo = activeSuggInfo;
        }
        else if (activeEditorInfo.isValidSource && isPrefixCmd) {
            sourceInfo = activeEditorInfo;
        }
        return sourceInfo;
    }
}

class StandardExHandler extends Handler {
    validateCommand(_inputInfo, _index, _filterText, _activeSuggestion, _activeLeaf) {
        throw new Error('Method not implemented.');
    }
    getSuggestions(_inputInfo) {
        throw new Error('Method not implemented.');
    }
    renderSuggestion(_sugg, _parentEl) {
        throw new Error('Method not implemented.');
    }
    onChooseSuggestion(sugg, evt) {
        if (sugg) {
            const { file } = sugg;
            this.navigateToLeafOrOpenFile(obsidian.Keymap.isModEvent(evt), file, `Unable to open file from SystemSuggestion ${file.path}`);
        }
    }
}

class InputInfo {
    constructor(inputText = '', mode = Mode.Standard) {
        this.inputText = inputText;
        this.mode = mode;
        const symbolListCmd = {
            ...InputInfo.defaultParsedCommand,
            source: null,
        };
        const relatedItemsListCmd = {
            ...InputInfo.defaultParsedCommand,
            source: null,
        };
        const parsedCmds = {};
        parsedCmds[Mode.SymbolList] = symbolListCmd;
        parsedCmds[Mode.Standard] = InputInfo.defaultParsedCommand;
        parsedCmds[Mode.EditorList] = InputInfo.defaultParsedCommand;
        parsedCmds[Mode.WorkspaceList] = InputInfo.defaultParsedCommand;
        parsedCmds[Mode.HeadingsList] = InputInfo.defaultParsedCommand;
        parsedCmds[Mode.StarredList] = InputInfo.defaultParsedCommand;
        parsedCmds[Mode.CommandList] = InputInfo.defaultParsedCommand;
        parsedCmds[Mode.RelatedItemsList] = relatedItemsListCmd;
        this.parsedCommands = parsedCmds;
    }
    static get defaultParsedCommand() {
        return {
            isValidated: false,
            index: -1,
            parsedInput: null,
        };
    }
    get searchQuery() {
        return this._searchQuery;
    }
    buildSearchQuery() {
        const { mode } = this;
        const input = this.parsedCommands[mode].parsedInput ?? '';
        const prepQuery = obsidian.prepareQuery(input.trim().toLowerCase());
        const hasSearchTerm = prepQuery?.query?.length > 0;
        this._searchQuery = { prepQuery, hasSearchTerm };
    }
    parsedCommand(mode) {
        mode = mode ?? this.mode;
        return this.parsedCommands[mode];
    }
}

class ModeHandler {
    constructor(app, settings, exKeymap) {
        this.app = app;
        this.settings = settings;
        this.exKeymap = exKeymap;
        // StandardExHandler one is special in that it is not a "full" handler,
        // and not attached to a mode, as a result it is not in the handlersByMode list
        const standardExHandler = new StandardExHandler(app, settings);
        const handlersByMode = new Map([
            [Mode.SymbolList, new SymbolHandler(app, settings)],
            [Mode.WorkspaceList, new WorkspaceHandler(app, settings)],
            [Mode.HeadingsList, new HeadingsHandler(app, settings)],
            [Mode.EditorList, new EditorHandler(app, settings)],
            [Mode.StarredList, new StarredHandler(app, settings)],
            [Mode.CommandList, new CommandHandler(app, settings)],
            [Mode.RelatedItemsList, new RelatedItemsHandler(app, settings)],
        ]);
        this.handlersByMode = handlersByMode;
        this.handlersByType = new Map([
            [SuggestionType.CommandList, handlersByMode.get(Mode.CommandList)],
            [SuggestionType.EditorList, handlersByMode.get(Mode.EditorList)],
            [SuggestionType.HeadingsList, handlersByMode.get(Mode.HeadingsList)],
            [SuggestionType.RelatedItemsList, handlersByMode.get(Mode.RelatedItemsList)],
            [SuggestionType.StarredList, handlersByMode.get(Mode.StarredList)],
            [SuggestionType.SymbolList, handlersByMode.get(Mode.SymbolList)],
            [SuggestionType.WorkspaceList, handlersByMode.get(Mode.WorkspaceList)],
            [SuggestionType.File, standardExHandler],
            [SuggestionType.Alias, standardExHandler],
        ]);
        this.debouncedGetSuggestions = obsidian.debounce(this.getSuggestions.bind(this), 400, true);
        this.reset();
    }
    onOpen() {
        this.exKeymap.isOpen = true;
    }
    onClose() {
        this.exKeymap.isOpen = false;
    }
    setSessionOpenMode(mode, chooser) {
        this.reset();
        chooser?.setSuggestions([]);
        if (mode !== Mode.Standard) {
            this.sessionOpenModeString = this.getHandler(mode).commandString;
        }
    }
    insertSessionOpenModeCommandString(inputEl) {
        const { sessionOpenModeString } = this;
        if (sessionOpenModeString !== null && sessionOpenModeString !== '') {
            // update UI with current command string in the case were openInMode was called
            inputEl.value = sessionOpenModeString;
            // reset to null so user input is not overridden the next time onInput is called
            this.sessionOpenModeString = null;
        }
    }
    updateSuggestions(query, chooser) {
        let handled = false;
        const { exKeymap, app: { workspace: { activeLeaf }, }, } = this;
        const activeSugg = ModeHandler.getActiveSuggestion(chooser);
        const inputInfo = this.determineRunMode(query, activeSugg, activeLeaf);
        const { mode } = inputInfo;
        exKeymap.updateKeymapForMode(mode);
        if (mode !== Mode.Standard) {
            if (mode === Mode.HeadingsList && inputInfo.parsedCommand().parsedInput?.length) {
                // if headings mode and user is typing a query, delay getting suggestions
                this.debouncedGetSuggestions(inputInfo, chooser);
            }
            else {
                this.getSuggestions(inputInfo, chooser);
            }
            handled = true;
        }
        return handled;
    }
    renderSuggestion(sugg, parentEl) {
        let handled = false;
        if (isExSuggestion(sugg)) {
            this.getHandler(sugg).renderSuggestion(sugg, parentEl);
            handled = true;
        }
        return handled;
    }
    onChooseSuggestion(sugg, evt) {
        let handled = false;
        // in Headings mode, StandardExHandler should handle the onChoose action for File
        // and Alias suggestion so that the preferOpenInNewPane setting can be handled properly
        const useExHandler = this.inputInfo.mode === Mode.HeadingsList && !isUnresolvedSuggestion(sugg);
        if (useExHandler || isExSuggestion(sugg)) {
            this.getHandler(sugg).onChooseSuggestion(sugg, evt);
            handled = true;
        }
        return handled;
    }
    determineRunMode(query, activeSugg, activeLeaf) {
        const input = query ?? '';
        const info = new InputInfo(input);
        if (input.length === 0) {
            this.reset();
        }
        this.validatePrefixCommands(info, activeSugg, activeLeaf);
        this.validateSourcedCommands(info, activeSugg, activeLeaf);
        return info;
    }
    getSuggestions(inputInfo, chooser) {
        this.inputInfo = inputInfo;
        const { mode } = inputInfo;
        chooser.setSuggestions([]);
        const suggestions = this.getHandler(mode).getSuggestions(inputInfo);
        chooser.setSuggestions(suggestions);
        ModeHandler.setActiveSuggestion(mode, chooser);
    }
    validatePrefixCommands(inputInfo, activeSugg, activeLeaf) {
        const { settings } = this;
        const prefixCmds = [
            settings.editorListCommand,
            settings.workspaceListCommand,
            settings.headingsListCommand,
            settings.starredListCommand,
            settings.commandListCommand,
        ]
            .map((v) => `(${escapeRegExp(v)})`)
            // account for potential overlapping command strings
            .sort((a, b) => b.length - a.length);
        // regex that matches any of the prefix commands, and extract filter text
        const match = new RegExp(`^(${prefixCmds.join('|')})(.*)$`).exec(inputInfo.inputText);
        if (match) {
            const cmdStr = match[1];
            const filterText = match[match.length - 1];
            const handler = this.getHandler(cmdStr);
            if (handler) {
                handler.validateCommand(inputInfo, match.index, filterText, activeSugg, activeLeaf);
            }
        }
    }
    validateSourcedCommands(inputInfo, activeSugg, activeLeaf) {
        const { mode, inputText } = inputInfo;
        // Standard, Headings, Starred, and EditorList mode can have an embedded command
        const supportedModes = [
            Mode.Standard,
            Mode.EditorList,
            Mode.HeadingsList,
            Mode.StarredList,
        ];
        if (supportedModes.includes(mode)) {
            const { settings } = this;
            const embeddedCmds = [settings.symbolListCommand, settings.relatedItemsListCommand]
                .map((v) => `(${escapeRegExp(v)})`)
                .sort((a, b) => b.length - a.length);
            // regex that matches any sourced command, and extract filter text
            const match = new RegExp(`(${embeddedCmds.join('|')})(.*)$`).exec(inputText);
            if (match) {
                const cmdStr = match[1];
                const filterText = match[match.length - 1];
                const handler = this.getHandler(cmdStr);
                if (handler) {
                    handler.validateCommand(inputInfo, match.index, filterText, activeSugg, activeLeaf);
                }
            }
        }
    }
    static setActiveSuggestion(mode, chooser) {
        // only symbol mode currently sets an active selection
        if (mode === Mode.SymbolList) {
            const index = chooser.values
                .filter((v) => isSymbolSuggestion(v))
                .findIndex((v) => v.item.isSelected);
            if (index !== -1) {
                chooser.setSelectedItem(index, true);
            }
        }
    }
    static getActiveSuggestion(chooser) {
        let activeSuggestion = null;
        if (chooser?.values) {
            activeSuggestion = chooser.values[chooser.selectedItem];
        }
        return activeSuggestion;
    }
    reset() {
        this.inputInfo = new InputInfo();
        this.sessionOpenModeString = null;
        this.getHandler(Mode.SymbolList).reset();
        this.getHandler(Mode.RelatedItemsList).reset();
    }
    getHandler(kind) {
        let handler;
        const { handlersByMode, handlersByType } = this;
        if (typeof kind === 'number') {
            handler = handlersByMode.get(kind);
        }
        else if (isOfType(kind, 'type')) {
            handler = handlersByType.get(kind.type);
        }
        else if (typeof kind === 'string') {
            const { settings } = this;
            const handlersByCommand = new Map([
                [settings.editorListCommand, handlersByMode.get(Mode.EditorList)],
                [settings.workspaceListCommand, handlersByMode.get(Mode.WorkspaceList)],
                [settings.headingsListCommand, handlersByMode.get(Mode.HeadingsList)],
                [settings.starredListCommand, handlersByMode.get(Mode.StarredList)],
                [settings.commandListCommand, handlersByMode.get(Mode.CommandList)],
                [settings.symbolListCommand, handlersByMode.get(Mode.SymbolList)],
                [settings.relatedItemsListCommand, handlersByMode.get(Mode.RelatedItemsList)],
            ]);
            handler = handlersByCommand.get(kind);
        }
        return handler;
    }
}

class Keymap {
    constructor(scope, chooser, modalContainerEl) {
        this.scope = scope;
        this.chooser = chooser;
        this.modalContainerEl = modalContainerEl;
        this.registerBindings(scope);
    }
    get isOpen() {
        return this._isOpen;
    }
    set isOpen(value) {
        this._isOpen = value;
    }
    registerBindings(scope) {
        const keys = [
            [['Ctrl'], 'n'],
            [['Ctrl'], 'p'],
            [['Ctrl'], 'j'],
            [['Ctrl'], 'k'],
        ];
        keys.forEach((v) => {
            scope.register(v[0], v[1], this.navigateItems.bind(this));
        });
    }
    navigateItems(_evt, ctx) {
        const { isOpen, chooser } = this;
        if (isOpen) {
            const nextKeys = ['n', 'j'];
            let index = chooser.selectedItem;
            index = nextKeys.includes(ctx.key) ? ++index : --index;
            chooser.setSelectedItem(index, true);
        }
        return false;
    }
    static updateHelperTextForMode(mode, containerEl) {
        const selector = '.prompt-instructions';
        const el = containerEl.querySelector(selector);
        if (el) {
            el.style.display = mode === Mode.Standard ? '' : 'none';
        }
    }
    updateKeymapForMode(mode) {
        const keys = this.scope.keys;
        let { backupKeys = [] } = this;
        Keymap.updateHelperTextForMode(mode, this.modalContainerEl);
        if (mode === Mode.Standard) {
            if (backupKeys.length) {
                backupKeys.forEach((key) => keys.push(key));
            }
            backupKeys = undefined;
        }
        else {
            // unregister unused hotkeys for custom modes
            for (let i = keys.length - 1; i >= 0; --i) {
                const key = keys[i];
                // modifiers are serialized to string at run time, if they exist
                const modifiers = key.modifiers?.toString();
                if (key.key === 'Enter' && modifiers === 'Shift') {
                    keys.splice(i, 1);
                    backupKeys.push(key);
                }
            }
        }
        this.backupKeys = backupKeys;
    }
}

function createSwitcherPlus(app, plugin) {
    const SystemSwitcherModal = getSystemSwitcherInstance(app)
        ?.QuickSwitcherModal;
    if (!SystemSwitcherModal) {
        console.log('Switcher++: unable to extend system switcher. Plugin UI will not be loaded. Use the builtin switcher instead.');
        return null;
    }
    const SwitcherPlusModal = class extends SystemSwitcherModal {
        constructor(app, plugin) {
            super(app, plugin.options.builtInSystemOptions);
            this.plugin = plugin;
            plugin.options.shouldShowAlias = this.shouldShowAlias;
            const exKeymap = new Keymap(this.scope, this.chooser, this.containerEl);
            this.exMode = new ModeHandler(app, plugin.options, exKeymap);
        }
        openInMode(mode) {
            this.exMode.setSessionOpenMode(mode, this.chooser);
            super.open();
        }
        onOpen() {
            this.exMode.onOpen();
            super.onOpen();
        }
        onClose() {
            super.onClose();
            this.exMode.onClose();
        }
        updateSuggestions() {
            const { exMode, inputEl, chooser } = this;
            exMode.insertSessionOpenModeCommandString(inputEl);
            if (!exMode.updateSuggestions(inputEl.value, chooser)) {
                super.updateSuggestions();
            }
        }
        onChooseSuggestion(item, evt) {
            if (!this.exMode.onChooseSuggestion(item, evt)) {
                super.onChooseSuggestion(item, evt);
            }
        }
        renderSuggestion(value, parentEl) {
            if (!this.exMode.renderSuggestion(value, parentEl)) {
                super.renderSuggestion(value, parentEl);
            }
        }
    };
    return new SwitcherPlusModal(app, plugin);
}

class SwitcherPlusPlugin extends obsidian.Plugin {
    async onload() {
        const options = new SwitcherPlusSettings(this);
        await options.loadSettings();
        this.options = options;
        this.addSettingTab(new SwitcherPlusSettingTab(this.app, this, options));
        this.registerCommand('switcher-plus:open', 'Open', Mode.Standard);
        this.registerCommand('switcher-plus:open-editors', 'Open in Editor Mode', Mode.EditorList);
        this.registerCommand('switcher-plus:open-symbols', 'Open in Symbol Mode', Mode.SymbolList);
        this.registerCommand('switcher-plus:open-workspaces', 'Open in Workspaces Mode', Mode.WorkspaceList);
        this.registerCommand('switcher-plus:open-headings', 'Open in Headings Mode', Mode.HeadingsList);
        this.registerCommand('switcher-plus:open-starred', 'Open in Starred Mode', Mode.StarredList);
        this.registerCommand('switcher-plus:open-commands', 'Open in Commands Mode', Mode.CommandList);
        this.registerCommand('switcher-plus:open-related-items', 'Open in Related Items Mode', Mode.RelatedItemsList);
    }
    registerCommand(id, name, mode) {
        this.addCommand({
            id,
            name,
            hotkeys: [],
            checkCallback: (checking) => {
                // modal needs to be created dynamically (same as system switcher)
                // as system options are evaluated in the modal constructor
                const modal = createSwitcherPlus(this.app, this);
                if (modal) {
                    if (!checking) {
                        modal.openInMode(mode);
                    }
                    return true;
                }
                return false;
            },
        });
    }
}

module.exports = SwitcherPlusPlugin;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3R5cGVzL3NoYXJlZFR5cGVzLnRzIiwiLi4vLi4vc3JjL3V0aWxzL3V0aWxzLnRzIiwiLi4vLi4vc3JjL3V0aWxzL2Zyb250TWF0dGVyUGFyc2VyLnRzIiwiLi4vLi4vc3JjL3NldHRpbmdzL3N3aXRjaGVyUGx1c1NldHRpbmdzLnRzIiwiLi4vLi4vc3JjL3NldHRpbmdzL3NldHRpbmdzVGFiU2VjdGlvbi50cyIsIi4uLy4uL3NyYy9zZXR0aW5ncy9zdGFycmVkU2V0dGluZ3NUYWJTZWN0aW9uLnRzIiwiLi4vLi4vc3JjL3NldHRpbmdzL2NvbW1hbmRMaXN0U2V0dGluZ3NUYWJTZWN0aW9uLnRzIiwiLi4vLi4vc3JjL3NldHRpbmdzL3JlbGF0ZWRJdGVtc1NldHRpbmdzVGFiU2VjdGlvbi50cyIsIi4uLy4uL3NyYy9zZXR0aW5ncy9nZW5lcmFsU2V0dGluZ3NUYWJTZWN0aW9uLnRzIiwiLi4vLi4vc3JjL3NldHRpbmdzL3dvcmtzcGFjZVNldHRpbmdzVGFiU2VjdGlvbi50cyIsIi4uLy4uL3NyYy9zZXR0aW5ncy9lZGl0b3JTZXR0aW5nc1RhYlNlY3Rpb24udHMiLCIuLi8uLi9zcmMvc2V0dGluZ3MvaGVhZGluZ3NTZXR0aW5nc1RhYlNlY3Rpb24udHMiLCIuLi8uLi9zcmMvc2V0dGluZ3Mvc3dpdGNoZXJQbHVzU2V0dGluZ1RhYi50cyIsIi4uLy4uL3NyYy9IYW5kbGVycy9oYW5kbGVyLnRzIiwiLi4vLi4vc3JjL0hhbmRsZXJzL3dvcmtzcGFjZUhhbmRsZXIudHMiLCIuLi8uLi9zcmMvSGFuZGxlcnMvaGVhZGluZ3NIYW5kbGVyLnRzIiwiLi4vLi4vc3JjL0hhbmRsZXJzL2VkaXRvckhhbmRsZXIudHMiLCIuLi8uLi9zcmMvSGFuZGxlcnMvc3ltYm9sSGFuZGxlci50cyIsIi4uLy4uL3NyYy9IYW5kbGVycy9zdGFycmVkSGFuZGxlci50cyIsIi4uLy4uL3NyYy9IYW5kbGVycy9jb21tYW5kSGFuZGxlci50cyIsIi4uLy4uL3NyYy9IYW5kbGVycy9yZWxhdGVkSXRlbXNIYW5kbGVyLnRzIiwiLi4vLi4vc3JjL0hhbmRsZXJzL3N0YW5kYXJkRXhIYW5kbGVyLnRzIiwiLi4vLi4vc3JjL3N3aXRjaGVyUGx1cy9pbnB1dEluZm8udHMiLCIuLi8uLi9zcmMvc3dpdGNoZXJQbHVzL21vZGVIYW5kbGVyLnRzIiwiLi4vLi4vc3JjL3N3aXRjaGVyUGx1cy9rZXltYXAudHMiLCIuLi8uLi9zcmMvc3dpdGNoZXJQbHVzL3N3aXRjaGVyUGx1cy50cyIsIi4uLy4uL3NyYy9tYWluLnRzIl0sInNvdXJjZXNDb250ZW50IjpudWxsLCJuYW1lcyI6WyJTZXR0aW5nIiwiTW9kYWwiLCJQbHVnaW5TZXR0aW5nVGFiIiwiUGxhdGZvcm0iLCJmdXp6eVNlYXJjaCIsInNvcnRTZWFyY2hSZXN1bHRzIiwicmVuZGVyUmVzdWx0cyIsIktleW1hcCIsInByZXBhcmVRdWVyeSIsImRlYm91bmNlIiwiUGx1Z2luIl0sIm1hcHBpbmdzIjoiOzs7O0FBb0JBLElBQVksSUFTWCxDQUFBO0FBVEQsQ0FBQSxVQUFZLElBQUksRUFBQTtBQUNkLElBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsR0FBQSxVQUFZLENBQUE7QUFDWixJQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsWUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLEdBQUEsWUFBYyxDQUFBO0FBQ2QsSUFBQSxJQUFBLENBQUEsSUFBQSxDQUFBLFlBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxHQUFBLFlBQWMsQ0FBQTtBQUNkLElBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxlQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsR0FBQSxlQUFpQixDQUFBO0FBQ2pCLElBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxjQUFBLENBQUEsR0FBQSxFQUFBLENBQUEsR0FBQSxjQUFpQixDQUFBO0FBQ2pCLElBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxhQUFBLENBQUEsR0FBQSxF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
