/*
THIS IS A GENERATED/BUNDLED FILE BY ESBUILD
if you want to view the source, please visit the github repository of this plugin
*/

var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __export = (target, all) => {
  __markAsModule(target);
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __reExport = (target, module2, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, { get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable });
  }
  return target;
};
var __toModule = (module2) => {
  return __reExport(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", module2 && module2.__esModule && "default" in module2 ? { get: () => module2.default, enumerable: true } : { value: module2, enumerable: true })), module2);
};
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// main.ts
__export(exports, {
  default: () => VimImPlugin
});
var import_obsidian = __toModule(require("obsidian"));
var os = __toModule(require("os"));
var DEFAULT_SETTINGS = {
  defaultIM: "",
  obtainCmd: "",
  switchCmd: "",
  windowsDefaultIM: "",
  windowsObtainCmd: "",
  windowsSwitchCmd: ""
};
var VimImPlugin = class extends import_obsidian.Plugin {
  constructor() {
    super(...arguments);
    this.currentInsertIM = "";
    this.previousMode = "";
    this.isWinPlatform = false;
    this.initialized = false;
    this.editorMode = null;
  }
  onload() {
    return __async(this, null, function* () {
      yield this.loadSettings();
      this.app.workspace.on("file-open", (_file) => __async(this, null, function* () {
        if (!this.initialized)
          yield this.initialize();
        let view = this.getActiveView();
        if (view) {
          var editor = this.getCodeMirror(view);
          if (editor) {
            editor.on("vim-mode-change", (modeObj) => {
              if (modeObj) {
                this.onVimModeChanged(modeObj);
              }
            });
          }
        }
        this.previousMode = "normal";
      }));
      this.addSettingTab(new SampleSettingTab(this.app, this));
      console.log("VimIm::OS type: " + os.type());
      this.isWinPlatform = os.type() == "Windows_NT";
      this.currentInsertIM = this.isWinPlatform ? this.settings.windowsDefaultIM : this.settings.defaultIM;
      if (this.isWinPlatform) {
        console.log("VimIm Use Windows config");
      }
    });
  }
  initialize() {
    return __async(this, null, function* () {
      if (this.initialized)
        return;
      if ("editor:toggle-source" in this.app.commands.editorCommands) {
        this.editorMode = "cm6";
        console.log("Vimrc plugin: using CodeMirror 6 mode");
      } else {
        this.editorMode = "cm5";
        console.log("Vimrc plugin: using CodeMirror 5 mode");
      }
      this.initialized = true;
    });
  }
  getActiveView() {
    return this.app.workspace.getActiveViewOfType(import_obsidian.MarkdownView);
  }
  getCodeMirror(view) {
    var _a, _b, _c, _d;
    if (this.editorMode == "cm6")
      return (_c = (_b = (_a = view.sourceMode) == null ? void 0 : _a.cmEditor) == null ? void 0 : _b.cm) == null ? void 0 : _c.cm;
    else
      return (_d = view.sourceMode) == null ? void 0 : _d.cmEditor;
  }
  onVimModeChanged(modeObj) {
    const { exec } = require("child_process");
    let switchToInsert;
    if (this.currentInsertIM) {
      switchToInsert = this.isWinPlatform ? this.settings.windowsSwitchCmd.replace(/{im}/, this.currentInsertIM) : this.settings.switchCmd.replace(/{im}/, this.currentInsertIM);
    }
    const obtainc = this.isWinPlatform ? this.settings.windowsObtainCmd : this.settings.obtainCmd;
    const switchFromInsert = this.isWinPlatform ? this.settings.windowsSwitchCmd.replace(/{im}/, this.settings.windowsDefaultIM) : this.settings.switchCmd.replace(/{im}/, this.settings.defaultIM);
    switch (modeObj.mode) {
      case "insert":
        console.log("change to insert");
        if (typeof switchToInsert != "undefined" && switchToInsert) {
          exec(switchToInsert, (error, stdout, stderr) => {
            if (error) {
              console.error(`switch error: ${error}`);
              return;
            }
            console.log(`switch im: ${switchToInsert}`);
          });
        }
        break;
      default:
        if (this.previousMode != "insert") {
          break;
        }
        console.log("change to noInsert");
        if (typeof obtainc != "undefined" && obtainc) {
          exec(obtainc, (error, stdout, stderr) => {
            if (error) {
              console.error(`obtain error: ${error}`);
              return;
            }
            this.currentInsertIM = stdout;
            console.log(`obtain im: ${this.currentInsertIM}`);
          });
        }
        if (typeof switchFromInsert != "undefined" && switchFromInsert) {
          exec(switchFromInsert, (error, stdout, stderr) => {
            if (error) {
              console.error(`switch error: ${error}`);
              return;
            }
            console.log(`switch im: ${switchFromInsert}`);
          });
        }
        break;
    }
    this.previousMode = modeObj.mode;
  }
  onunload() {
    console.log("onunload");
  }
  loadSettings() {
    return __async(this, null, function* () {
      this.settings = Object.assign({}, DEFAULT_SETTINGS, yield this.loadData());
    });
  }
  saveSettings() {
    return __async(this, null, function* () {
      yield this.saveData(this.settings);
    });
  }
};
var SampleSettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "Vim IM Select Settings." });
    containerEl.createEl("h3", { text: "Settings for default platform." });
    new import_obsidian.Setting(containerEl).setName("Default IM").setDesc("IM for normal mode").addText((text) => text.setPlaceholder("Default IM").setValue(this.plugin.settings.defaultIM).onChange((value) => __async(this, null, function* () {
      console.log("Default IM: " + value);
      this.plugin.settings.defaultIM = value;
      yield this.plugin.saveSettings();
    })));
    new import_obsidian.Setting(containerEl).setName("Obtaining Command").setDesc("Command for obtaining current IM(must be excutable)").addText((text) => text.setPlaceholder("Obtaining Command").setValue(this.plugin.settings.obtainCmd).onChange((value) => __async(this, null, function* () {
      console.log("Obtain Cmd: " + value);
      this.plugin.settings.obtainCmd = value;
      yield this.plugin.saveSettings();
    })));
    new import_obsidian.Setting(containerEl).setName("Switching Command").setDesc("Command for switching to specific IM(must be excutable)").addText((text) => text.setPlaceholder("Use {im} as placeholder of IM").setValue(this.plugin.settings.switchCmd).onChange((value) => __async(this, null, function* () {
      console.log("Switch Cmd: " + value);
      this.plugin.settings.switchCmd = value;
      yield this.plugin.saveSettings();
    })));
    containerEl.createEl("h3", { text: "Settings for Windows platform." });
    new import_obsidian.Setting(containerEl).setName("Windows Default IM").setDesc("IM for normal mode").addText((text) => text.setPlaceholder("Default IM").setValue(this.plugin.settings.windowsDefaultIM).onChange((value) => __async(this, null, function* () {
      console.log("Default IM: " + value);
      this.plugin.settings.windowsDefaultIM = value;
      yield this.plugin.saveSettings();
    })));
    new import_obsidian.Setting(containerEl).setName("Obtaining Command on Windows").setDesc("Command for obtaining current IM(must be excutable)").addText((text) => text.setPlaceholder("Obtaining Command").setValue(this.plugin.settings.windowsObtainCmd).onChange((value) => __async(this, null, function* () {
      console.log("Obtain Cmd: " + value);
      this.plugin.settings.windowsObtainCmd = value;
      yield this.plugin.saveSettings();
    })));
    new import_obsidian.Setting(containerEl).setName("Switching Command on Windows").setDesc("Command for switching to specific IM(must be excutable)").addText((text) => text.setPlaceholder("Use {im} as placeholder of IM").setValue(this.plugin.settings.windowsSwitchCmd).onChange((value) => __async(this, null, function* () {
      console.log("Switch Cmd: " + value);
      this.plugin.settings.windowsSwitchCmd = value;
      yield this.plugin.saveSettings();
    })));
  }
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibWFpbi50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiLypcclxuTUlUIExpY2Vuc2VcclxuXHJcbkNvcHlyaWdodCAoYykgWzIwMjFdIFtBbG9uZWx1ciB5aW53ZW5oYW4xOTk4QGdtYWlsLmNvbV1cclxuXHJcblBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcclxub2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxyXG5pbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXHJcbnRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcclxuY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXHJcbmZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XHJcblxyXG5UaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpbiBhbGxcclxuY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cclxuXHJcblRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcclxuSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXHJcbkZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxyXG5BVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXHJcbkxJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXHJcbk9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFXHJcblNPRlRXQVJFLlxyXG4qL1xyXG5pbXBvcnQgeyBBcHAsIFBsdWdpbiwgUGx1Z2luU2V0dGluZ1RhYiwgU2V0dGluZywgTWFya2Rvd25WaWV3IH0gZnJvbSAnb2JzaWRpYW4nO1xyXG5cclxuaW1wb3J0ICogYXMgb3MgZnJvbSAnb3MnO1xyXG5pbnRlcmZhY2UgVmltSW1QbHVnaW5TZXR0aW5ncyB7XHJcblx0ZGVmYXVsdElNOiBzdHJpbmc7XHJcblx0b2J0YWluQ21kOiBzdHJpbmc7XHJcblx0c3dpdGNoQ21kOiBzdHJpbmc7XHJcblx0d2luZG93c0RlZmF1bHRJTTogc3RyaW5nO1xyXG5cdHdpbmRvd3NPYnRhaW5DbWQ6IHN0cmluZztcclxuXHR3aW5kb3dzU3dpdGNoQ21kOiBzdHJpbmc7XHJcbn1cclxuXHJcbmNvbnN0IERFRkFVTFRfU0VUVElOR1M6IFZpbUltUGx1Z2luU2V0dGluZ3MgPSB7XHJcblx0ZGVmYXVsdElNOiAnJyxcclxuXHRvYnRhaW5DbWQ6ICcnLFxyXG5cdHN3aXRjaENtZDogJycsXHJcblx0d2luZG93c0RlZmF1bHRJTTogJycsXHJcblx0d2luZG93c09idGFpbkNtZDogJycsXHJcblx0d2luZG93c1N3aXRjaENtZDogJycsXHJcbn1cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVmltSW1QbHVnaW4gZXh0ZW5kcyBQbHVnaW4ge1xyXG5cdHNldHRpbmdzOiBWaW1JbVBsdWdpblNldHRpbmdzO1xyXG5cdHByaXZhdGUgY3VycmVudEluc2VydElNID0gJyc7XHJcblx0cHJpdmF0ZSBwcmV2aW91c01vZGUgPSAnJztcclxuXHRwcml2YXRlIGlzV2luUGxhdGZvcm0gPSBmYWxzZTtcclxuXHJcblx0cHJpdmF0ZSBpbml0aWFsaXplZCA9IGZhbHNlO1xyXG5cdHByaXZhdGUgZWRpdG9yTW9kZTogJ2NtNScgfCAnY202JyA9IG51bGw7XHJcblxyXG5cdGFzeW5jIG9ubG9hZCgpIHtcclxuXHRcdGF3YWl0IHRoaXMubG9hZFNldHRpbmdzKCk7XHJcblxyXG5cdFx0Ly8gd2hlbiBvcGVuIGEgZmlsZSwgdG8gaW5pdGlhbGl6ZSBjdXJyZW50XHJcblx0XHQvLyBlZGl0b3IgdHlwZSBDb2RlTWlycm9yNSBvciBDb2RlTWlycm9yNlxyXG5cdFx0dGhpcy5hcHAud29ya3NwYWNlLm9uKCdmaWxlLW9wZW4nLCBhc3luYyAoX2ZpbGUpID0+IHtcclxuXHRcdFx0aWYgKCF0aGlzLmluaXRpYWxpemVkKVxyXG5cdFx0XHRcdGF3YWl0IHRoaXMuaW5pdGlhbGl6ZSgpO1xyXG5cclxuXHRcdFx0bGV0IHZpZXcgPSB0aGlzLmdldEFjdGl2ZVZpZXcoKTtcclxuXHRcdFx0aWYgKHZpZXcpIHtcclxuXHRcdFx0XHR2YXIgZWRpdG9yID0gdGhpcy5nZXRDb2RlTWlycm9yKHZpZXcpO1xyXG5cclxuXHRcdFx0XHRpZiAoZWRpdG9yKSB7XHJcblx0XHRcdFx0XHRlZGl0b3Iub24oJ3ZpbS1tb2RlLWNoYW5nZScsIChtb2RlT2JqOiBhbnkpID0+IHtcclxuXHRcdFx0XHRcdFx0aWYgKG1vZGVPYmopIHtcclxuXHRcdFx0XHRcdFx0XHR0aGlzLm9uVmltTW9kZUNoYW5nZWQobW9kZU9iaik7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0dGhpcy5wcmV2aW91c01vZGUgPSBcIm5vcm1hbFwiO1xyXG5cdFx0fSk7XHJcblxyXG5cclxuXHRcdC8vIFRoaXMgYWRkcyBhIHNldHRpbmdzIHRhYiBzbyB0aGUgdXNlciBjYW4gY29uZmlndXJlIHZhcmlvdXMgYXNwZWN0cyBvZiB0aGUgcGx1Z2luXHJcblx0XHR0aGlzLmFkZFNldHRpbmdUYWIobmV3IFNhbXBsZVNldHRpbmdUYWIodGhpcy5hcHAsIHRoaXMpKTtcclxuXHJcblx0XHRjb25zb2xlLmxvZyhcIlZpbUltOjpPUyB0eXBlOiBcIiArIG9zLnR5cGUoKSk7XHJcblx0XHR0aGlzLmlzV2luUGxhdGZvcm0gPSBvcy50eXBlKCkgPT0gJ1dpbmRvd3NfTlQnO1xyXG5cclxuXHRcdHRoaXMuY3VycmVudEluc2VydElNID0gdGhpcy5pc1dpblBsYXRmb3JtID8gdGhpcy5zZXR0aW5ncy53aW5kb3dzRGVmYXVsdElNIDogdGhpcy5zZXR0aW5ncy5kZWZhdWx0SU07XHJcblxyXG5cdFx0aWYgKHRoaXMuaXNXaW5QbGF0Zm9ybSkge1xyXG5cdFx0XHRjb25zb2xlLmxvZyhcIlZpbUltIFVzZSBXaW5kb3dzIGNvbmZpZ1wiKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGFzeW5jIGluaXRpYWxpemUoKSB7XHJcblx0XHRpZiAodGhpcy5pbml0aWFsaXplZClcclxuXHRcdFx0cmV0dXJuO1xyXG5cclxuXHRcdC8vIERldGVybWluZSBpZiB3ZSBoYXZlIHRoZSBsZWdhY3kgT2JzaWRpYW4gZWRpdG9yIChDTTUpIG9yIHRoZSBuZXcgb25lIChDTTYpLlxyXG5cdFx0Ly8gVGhpcyBpcyBvbmx5IGF2YWlsYWJsZSBhZnRlciBPYnNpZGlhbiBpcyBmdWxseSBsb2FkZWQsIHNvIHdlIGRvIGl0IGFzIHBhcnQgb2YgdGhlIGBmaWxlLW9wZW5gIGV2ZW50LlxyXG5cdFx0aWYgKCdlZGl0b3I6dG9nZ2xlLXNvdXJjZScgaW4gKHRoaXMuYXBwIGFzIGFueSkuY29tbWFuZHMuZWRpdG9yQ29tbWFuZHMpIHtcclxuXHRcdFx0dGhpcy5lZGl0b3JNb2RlID0gJ2NtNic7XHJcblx0XHRcdGNvbnNvbGUubG9nKCdWaW1yYyBwbHVnaW46IHVzaW5nIENvZGVNaXJyb3IgNiBtb2RlJyk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHR0aGlzLmVkaXRvck1vZGUgPSAnY201JztcclxuXHRcdFx0Y29uc29sZS5sb2coJ1ZpbXJjIHBsdWdpbjogdXNpbmcgQ29kZU1pcnJvciA1IG1vZGUnKTtcclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLmluaXRpYWxpemVkID0gdHJ1ZTtcclxuXHR9XHJcblxyXG5cdHByaXZhdGUgZ2V0QWN0aXZlVmlldygpOiBNYXJrZG93blZpZXcge1xyXG5cdFx0cmV0dXJuIHRoaXMuYXBwLndvcmtzcGFjZS5nZXRBY3RpdmVWaWV3T2ZUeXBlKE1hcmtkb3duVmlldyk7XHJcblx0fVxyXG5cclxuXHRwcml2YXRlIGdldENvZGVNaXJyb3IodmlldzogTWFya2Rvd25WaWV3KTogQ29kZU1pcnJvci5FZGl0b3Ige1xyXG5cdFx0Ly8gRm9yIENNNiB0aGlzIGFjdHVhbGx5IHJldHVybnMgYW4gaW5zdGFuY2Ugb2YgdGhlIG9iamVjdCBuYW1lZCBDb2RlTWlycm9yIGZyb20gY21fYWRhcHRlciBvZiBjb2RlbWlycm9yX3ZpbVxyXG5cdFx0aWYgKHRoaXMuZWRpdG9yTW9kZSA9PSAnY202JylcclxuXHRcdFx0cmV0dXJuICh2aWV3IGFzIGFueSkuc291cmNlTW9kZT8uY21FZGl0b3I/LmNtPy5jbTtcclxuXHRcdGVsc2VcclxuXHRcdFx0cmV0dXJuICh2aWV3IGFzIGFueSkuc291cmNlTW9kZT8uY21FZGl0b3I7XHJcblx0fVxyXG5cclxuXHRvblZpbU1vZGVDaGFuZ2VkKG1vZGVPYmo6IGFueSkge1xyXG5cdFx0Y29uc3QgeyBleGVjIH0gPSByZXF1aXJlKCdjaGlsZF9wcm9jZXNzJyk7XHJcblx0XHRsZXQgc3dpdGNoVG9JbnNlcnQ6IHN0cmluZztcclxuXHRcdGlmICh0aGlzLmN1cnJlbnRJbnNlcnRJTSkge1xyXG5cdFx0XHRzd2l0Y2hUb0luc2VydCA9IHRoaXMuaXNXaW5QbGF0Zm9ybSA/XHJcblx0XHRcdFx0dGhpcy5zZXR0aW5ncy53aW5kb3dzU3dpdGNoQ21kLnJlcGxhY2UoL3tpbX0vLCB0aGlzLmN1cnJlbnRJbnNlcnRJTSkgOlxyXG5cdFx0XHRcdHRoaXMuc2V0dGluZ3Muc3dpdGNoQ21kLnJlcGxhY2UoL3tpbX0vLCB0aGlzLmN1cnJlbnRJbnNlcnRJTSk7XHJcblx0XHR9XHJcblxyXG5cdFx0Y29uc3Qgb2J0YWluYyA9IHRoaXMuaXNXaW5QbGF0Zm9ybSA/XHJcblx0XHRcdHRoaXMuc2V0dGluZ3Mud2luZG93c09idGFpbkNtZCA6IHRoaXMuc2V0dGluZ3Mub2J0YWluQ21kO1xyXG5cclxuXHRcdGNvbnN0IHN3aXRjaEZyb21JbnNlcnQgPSB0aGlzLmlzV2luUGxhdGZvcm0gP1xyXG5cdFx0XHR0aGlzLnNldHRpbmdzLndpbmRvd3NTd2l0Y2hDbWQucmVwbGFjZSgve2ltfS8sIHRoaXMuc2V0dGluZ3Mud2luZG93c0RlZmF1bHRJTSkgOlxyXG5cdFx0XHR0aGlzLnNldHRpbmdzLnN3aXRjaENtZC5yZXBsYWNlKC97aW19LywgdGhpcy5zZXR0aW5ncy5kZWZhdWx0SU0pO1xyXG5cclxuXHRcdHN3aXRjaCAobW9kZU9iai5tb2RlKSB7XHJcblx0XHRcdGNhc2UgXCJpbnNlcnRcIjpcclxuXHRcdFx0XHRjb25zb2xlLmxvZyhcImNoYW5nZSB0byBpbnNlcnRcIik7XHJcblx0XHRcdFx0aWYgKHR5cGVvZiBzd2l0Y2hUb0luc2VydCAhPSAndW5kZWZpbmVkJyAmJiBzd2l0Y2hUb0luc2VydCkge1xyXG5cdFx0XHRcdFx0ZXhlYyhzd2l0Y2hUb0luc2VydCwgKGVycm9yOiBhbnksIHN0ZG91dDogYW55LCBzdGRlcnI6IGFueSkgPT4ge1xyXG5cdFx0XHRcdFx0XHRpZiAoZXJyb3IpIHtcclxuXHRcdFx0XHRcdFx0XHRjb25zb2xlLmVycm9yKGBzd2l0Y2ggZXJyb3I6ICR7ZXJyb3J9YCk7XHJcblx0XHRcdFx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKGBzd2l0Y2ggaW06ICR7c3dpdGNoVG9JbnNlcnR9YCk7XHJcblx0XHRcdFx0XHR9KTtcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRkZWZhdWx0OlxyXG5cdFx0XHRcdGlmICh0aGlzLnByZXZpb3VzTW9kZSAhPSBcImluc2VydFwiKSB7XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0Y29uc29sZS5sb2coXCJjaGFuZ2UgdG8gbm9JbnNlcnRcIik7XHJcblx0XHRcdFx0Ly9bMF06IE9idGlhbiBpbSBpbiBJbnNlcnQgTW9kZVxyXG5cdFx0XHRcdGlmICh0eXBlb2Ygb2J0YWluYyAhPSAndW5kZWZpbmVkJyAmJiBvYnRhaW5jKSB7XHJcblx0XHRcdFx0XHRleGVjKG9idGFpbmMsIChlcnJvcjogYW55LCBzdGRvdXQ6IGFueSwgc3RkZXJyOiBhbnkpID0+IHtcclxuXHRcdFx0XHRcdFx0aWYgKGVycm9yKSB7XHJcblx0XHRcdFx0XHRcdFx0Y29uc29sZS5lcnJvcihgb2J0YWluIGVycm9yOiAke2Vycm9yfWApO1xyXG5cdFx0XHRcdFx0XHRcdHJldHVybjtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHR0aGlzLmN1cnJlbnRJbnNlcnRJTSA9IHN0ZG91dDtcclxuXHRcdFx0XHRcdFx0Y29uc29sZS5sb2coYG9idGFpbiBpbTogJHt0aGlzLmN1cnJlbnRJbnNlcnRJTX1gKTtcclxuXHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHQvL1sxXTogU3dpdGNoIHRvIGRlZmF1bHQgaW1cclxuXHRcdFx0XHRpZiAodHlwZW9mIHN3aXRjaEZyb21JbnNlcnQgIT0gJ3VuZGVmaW5lZCcgJiYgc3dpdGNoRnJvbUluc2VydCkge1xyXG5cdFx0XHRcdFx0ZXhlYyhzd2l0Y2hGcm9tSW5zZXJ0LCAoZXJyb3I6IGFueSwgc3Rkb3V0OiBhbnksIHN0ZGVycjogYW55KSA9PiB7XHJcblx0XHRcdFx0XHRcdGlmIChlcnJvcikge1xyXG5cdFx0XHRcdFx0XHRcdGNvbnNvbGUuZXJyb3IoYHN3aXRjaCBlcnJvcjogJHtlcnJvcn1gKTtcclxuXHRcdFx0XHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0Y29uc29sZS5sb2coYHN3aXRjaCBpbTogJHtzd2l0Y2hGcm9tSW5zZXJ0fWApO1xyXG5cdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRicmVhaztcclxuXHRcdH1cclxuXHRcdHRoaXMucHJldmlvdXNNb2RlID0gbW9kZU9iai5tb2RlO1xyXG5cdH1cclxuXHJcblx0b251bmxvYWQoKSB7XHJcblx0XHRjb25zb2xlLmxvZyhcIm9udW5sb2FkXCIpO1xyXG5cdH1cclxuXHJcblx0YXN5bmMgbG9hZFNldHRpbmdzKCkge1xyXG5cdFx0dGhpcy5zZXR0aW5ncyA9IE9iamVjdC5hc3NpZ24oe30sIERFRkFVTFRfU0VUVElOR1MsIGF3YWl0IHRoaXMubG9hZERhdGEoKSk7XHJcblx0fVxyXG5cclxuXHRhc3luYyBzYXZlU2V0dGluZ3MoKSB7XHJcblx0XHRhd2FpdCB0aGlzLnNhdmVEYXRhKHRoaXMuc2V0dGluZ3MpO1xyXG5cdH1cclxuXHJcbn1cclxuXHJcbmNsYXNzIFNhbXBsZVNldHRpbmdUYWIgZXh0ZW5kcyBQbHVnaW5TZXR0aW5nVGFiIHtcclxuXHRwbHVnaW46IFZpbUltUGx1Z2luO1xyXG5cclxuXHRjb25zdHJ1Y3RvcihhcHA6IEFwcCwgcGx1Z2luOiBWaW1JbVBsdWdpbikge1xyXG5cdFx0c3VwZXIoYXBwLCBwbHVnaW4pO1xyXG5cdFx0dGhpcy5wbHVnaW4gPSBwbHVnaW47XHJcblx0fVxyXG5cclxuXHRkaXNwbGF5KCk6IHZvaWQge1xyXG5cdFx0Y29uc3QgeyBjb250YWluZXJFbCB9ID0gdGhpcztcclxuXHJcblx0XHRjb250YWluZXJFbC5lbXB0eSgpO1xyXG5cclxuXHRcdGNvbnRhaW5lckVsLmNyZWF0ZUVsKCdoMicsIHsgdGV4dDogJ1ZpbSBJTSBTZWxlY3QgU2V0dGluZ3MuJyB9KTtcclxuXHJcblx0XHRjb250YWluZXJFbC5jcmVhdGVFbCgnaDMnLCB7IHRleHQ6ICdTZXR0aW5ncyBmb3IgZGVmYXVsdCBwbGF0Zm9ybS4nIH0pO1xyXG5cdFx0bmV3IFNldHRpbmcoY29udGFpbmVyRWwpXHJcblx0XHRcdC5zZXROYW1lKCdEZWZhdWx0IElNJylcclxuXHRcdFx0LnNldERlc2MoJ0lNIGZvciBub3JtYWwgbW9kZScpXHJcblx0XHRcdC5hZGRUZXh0KHRleHQgPT4gdGV4dFxyXG5cdFx0XHRcdC5zZXRQbGFjZWhvbGRlcignRGVmYXVsdCBJTScpXHJcblx0XHRcdFx0LnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmRlZmF1bHRJTSlcclxuXHRcdFx0XHQub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XHJcblx0XHRcdFx0XHRjb25zb2xlLmxvZygnRGVmYXVsdCBJTTogJyArIHZhbHVlKTtcclxuXHRcdFx0XHRcdHRoaXMucGx1Z2luLnNldHRpbmdzLmRlZmF1bHRJTSA9IHZhbHVlO1xyXG5cdFx0XHRcdFx0YXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcblx0XHRcdFx0fSkpO1xyXG5cdFx0bmV3IFNldHRpbmcoY29udGFpbmVyRWwpXHJcblx0XHRcdC5zZXROYW1lKCdPYnRhaW5pbmcgQ29tbWFuZCcpXHJcblx0XHRcdC5zZXREZXNjKCdDb21tYW5kIGZvciBvYnRhaW5pbmcgY3VycmVudCBJTShtdXN0IGJlIGV4Y3V0YWJsZSknKVxyXG5cdFx0XHQuYWRkVGV4dCh0ZXh0ID0+IHRleHRcclxuXHRcdFx0XHQuc2V0UGxhY2Vob2xkZXIoJ09idGFpbmluZyBDb21tYW5kJylcclxuXHRcdFx0XHQuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3Mub2J0YWluQ21kKVxyXG5cdFx0XHRcdC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcclxuXHRcdFx0XHRcdGNvbnNvbGUubG9nKCdPYnRhaW4gQ21kOiAnICsgdmFsdWUpO1xyXG5cdFx0XHRcdFx0dGhpcy5wbHVnaW4uc2V0dGluZ3Mub2J0YWluQ21kID0gdmFsdWU7XHJcblx0XHRcdFx0XHRhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuXHRcdFx0XHR9KSk7XHJcblx0XHRuZXcgU2V0dGluZyhjb250YWluZXJFbClcclxuXHRcdFx0LnNldE5hbWUoJ1N3aXRjaGluZyBDb21tYW5kJylcclxuXHRcdFx0LnNldERlc2MoJ0NvbW1hbmQgZm9yIHN3aXRjaGluZyB0byBzcGVjaWZpYyBJTShtdXN0IGJlIGV4Y3V0YWJsZSknKVxyXG5cdFx0XHQuYWRkVGV4dCh0ZXh0ID0+IHRleHRcclxuXHRcdFx0XHQuc2V0UGxhY2Vob2xkZXIoJ1VzZSB7aW19IGFzIHBsYWNlaG9sZGVyIG9mIElNJylcclxuXHRcdFx0XHQuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3Muc3dpdGNoQ21kKVxyXG5cdFx0XHRcdC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcclxuXHRcdFx0XHRcdGNvbnNvbGUubG9nKCdTd2l0Y2ggQ21kOiAnICsgdmFsdWUpO1xyXG5cdFx0XHRcdFx0dGhpcy5wbHVnaW4uc2V0dGluZ3Muc3dpdGNoQ21kID0gdmFsdWU7XHJcblx0XHRcdFx0XHRhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuXHRcdFx0XHR9KSk7XHJcblxyXG5cdFx0Y29udGFpbmVyRWwuY3JlYXRlRWwoJ2gzJywgeyB0ZXh0OiAnU2V0dGluZ3MgZm9yIFdpbmRvd3MgcGxhdGZvcm0uJyB9KTtcclxuXHRcdG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxyXG5cdFx0XHQuc2V0TmFtZSgnV2luZG93cyBEZWZhdWx0IElNJylcclxuXHRcdFx0LnNldERlc2MoJ0lNIGZvciBub3JtYWwgbW9kZScpXHJcblx0XHRcdC5hZGRUZXh0KHRleHQgPT4gdGV4dFxyXG5cdFx0XHRcdC5zZXRQbGFjZWhvbGRlcignRGVmYXVsdCBJTScpXHJcblx0XHRcdFx0LnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLndpbmRvd3NEZWZhdWx0SU0pXHJcblx0XHRcdFx0Lm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xyXG5cdFx0XHRcdFx0Y29uc29sZS5sb2coJ0RlZmF1bHQgSU06ICcgKyB2YWx1ZSk7XHJcblx0XHRcdFx0XHR0aGlzLnBsdWdpbi5zZXR0aW5ncy53aW5kb3dzRGVmYXVsdElNID0gdmFsdWU7XHJcblx0XHRcdFx0XHRhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuXHRcdFx0XHR9KSk7XHJcblx0XHRuZXcgU2V0dGluZyhjb250YWluZXJFbClcclxuXHRcdFx0LnNldE5hbWUoJ09idGFpbmluZyBDb21tYW5kIG9uIFdpbmRvd3MnKVxyXG5cdFx0XHQuc2V0RGVzYygnQ29tbWFuZCBmb3Igb2J0YWluaW5nIGN1cnJlbnQgSU0obXVzdCBiZSBleGN1dGFibGUpJylcclxuXHRcdFx0LmFkZFRleHQodGV4dCA9PiB0ZXh0XHJcblx0XHRcdFx0LnNldFBsYWNlaG9sZGVyKCdPYnRhaW5pbmcgQ29tbWFuZCcpXHJcblx0XHRcdFx0LnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLndpbmRvd3NPYnRhaW5DbWQpXHJcblx0XHRcdFx0Lm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xyXG5cdFx0XHRcdFx0Y29uc29sZS5sb2coJ09idGFpbiBDbWQ6ICcgKyB2YWx1ZSk7XHJcblx0XHRcdFx0XHR0aGlzLnBsdWdpbi5zZXR0aW5ncy53aW5kb3dzT2J0YWluQ21kID0gdmFsdWU7XHJcblx0XHRcdFx0XHRhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuXHRcdFx0XHR9KSk7XHJcblx0XHRuZXcgU2V0dGluZyhjb250YWluZXJFbClcclxuXHRcdFx0LnNldE5hbWUoJ1N3aXRjaGluZyBDb21tYW5kIG9uIFdpbmRvd3MnKVxyXG5cdFx0XHQuc2V0RGVzYygnQ29tbWFuZCBmb3Igc3dpdGNoaW5nIHRvIHNwZWNpZmljIElNKG11c3QgYmUgZXhjdXRhYmxlKScpXHJcblx0XHRcdC5hZGRUZXh0KHRleHQgPT4gdGV4dFxyXG5cdFx0XHRcdC5zZXRQbGFjZWhvbGRlcignVXNlIHtpbX0gYXMgcGxhY2Vob2xkZXIgb2YgSU0nKVxyXG5cdFx0XHRcdC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy53aW5kb3dzU3dpdGNoQ21kKVxyXG5cdFx0XHRcdC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcclxuXHRcdFx0XHRcdGNvbnNvbGUubG9nKCdTd2l0Y2ggQ21kOiAnICsgdmFsdWUpO1xyXG5cdFx0XHRcdFx0dGhpcy5wbHVnaW4uc2V0dGluZ3Mud2luZG93c1N3aXRjaENtZCA9IHZhbHVlO1xyXG5cdFx0XHRcdFx0YXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcblx0XHRcdFx0fSkpO1xyXG5cdH1cclxufVxyXG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQUE7QUFBQTtBQXVCQSxzQkFBcUU7QUFFckUsU0FBb0I7QUFVcEIsSUFBTSxtQkFBd0M7QUFBQSxFQUM3QyxXQUFXO0FBQUEsRUFDWCxXQUFXO0FBQUEsRUFDWCxXQUFXO0FBQUEsRUFDWCxrQkFBa0I7QUFBQSxFQUNsQixrQkFBa0I7QUFBQSxFQUNsQixrQkFBa0I7QUFBQTtBQUVuQixnQ0FBeUMsdUJBQU87QUFBQSxFQUFoRCxjQTNDQTtBQTJDQTtBQUVTLDJCQUFrQjtBQUNsQix3QkFBZTtBQUNmLHlCQUFnQjtBQUVoQix1QkFBYztBQUNkLHNCQUE0QjtBQUFBO0FBQUEsRUFFOUIsU0FBUztBQUFBO0FBQ2QsWUFBTSxLQUFLO0FBSVgsV0FBSyxJQUFJLFVBQVUsR0FBRyxhQUFhLENBQU8sVUFBVTtBQUNuRCxZQUFJLENBQUMsS0FBSztBQUNULGdCQUFNLEtB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
