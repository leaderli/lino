---
tags:
  - eclipse/eclipse-plugin-rename
date updated: 2022-07-04 22:46
---

## 源码简析

`org.eclipse.ltk.internal.ui.refactoring.actions.RenameResourceHandler`

拦截器捕获到重命名操作

```java
public Object execute(ExecutionEvent event) throws ExecutionException {  
    Object checkCompositeRename = HandlerUtil.getVariable(event, LTK_CHECK_COMPOSITE_RENAME_PARAMETER_KEY);  
    if (checkCompositeRename instanceof Boolean) {  
        return checkForCompositeRename(event);  
    }  
    performRename(event);  
    return null;  
}

private void performRename(ExecutionEvent event) {
	Shell activeShell= HandlerUtil.getActiveShell(event);
	Object newNameValue= HandlerUtil.getVariable(event, LTK_RENAME_COMMAND_NEWNAME_PARAMETER_KEY);
	String newName= null;
	if (newNameValue instanceof String) {
		newName= (String) newNameValue;
	}
	ISelection sel= HandlerUtil.getCurrentSelection(event);
	if (sel instanceof IStructuredSelection) {
		IResource resource= getCurrentResource((IStructuredSelection) sel);
		if (resource != null) {
			RenameResourceWizard refactoringWizard;
			Change change= null;
			RefactoringProcessor processor= null;
			if (newName != null) {
				refactoringWizard= new RenameResourceWizard(resource, newName);
				processor= ((ProcessorBasedRefactoring) refactoringWizard.getRefactoring()).getProcessor();
				// 查看重命名操作是否可行
				change= getChange(refactoringWizard);
				//Reset the state of the wizard once we have the change it will perform
				refactoringWizard= new RenameResourceWizard(resource, newName);
			} else {
				refactoringWizard= new RenameResourceWizard(resource);
			}

			try {
				// Let user see rename dialog with preview page for composite changes or if another RefactoringProcessor is used (which may offer rename options)
				if (newName == null || change == null || isCompositeChange(change) || !(processor instanceof RenameResourceProcessor)) {
					RefactoringWizardOpenOperation op= new RefactoringWizardOpenOperation(refactoringWizard);
					op.run(activeShell, RefactoringUIMessages.RenameResourceHandler_title);
				} else {
					//Silently perform the rename without the dialog
					change.perform(new NullProgressMonitor());
				}
			} catch (InterruptedException e) {
				// do nothing
			} catch (CoreException e) {
				RefactoringUIPlugin.log(e);
			}
		}
	}
}

private Change getChange(RenameResourceWizard refactoringWizard) {
	refactoringWizard.setChangeCreationCancelable(true);
    // 主要是这一行执行
	refactoringWizard.setInitialComputationContext((boolean fork, boolean cancelable, IRunnableWithProgress runnable) -> runnable.run(new NullProgressMonitor()));
	return refactoringWizard.internalCreateChange(InternalAPI.INSTANCE,
			new CreateChangeOperation(new CheckConditionsOperation(refactoringWizard.getRefactoring(), CheckConditionsOperation.FINAL_CONDITIONS), RefactoringStatus.FATAL), true);
}
```

`org.eclipse.ltk.ui.refactoring.RefactoringWizard`

```java
public final Change internalCreateChange(InternalAPI api, CreateChangeOperation operation, boolean updateStatus) {
	Assert.isNotNull(api);
	IRunnableContext context= getContainer() != null ? getContainer() : fRunnableContext;
	return createChange(operation, updateStatus, context);
}

private Change createChange(CreateChangeOperation operation, boolean updateStatus, IRunnableContext context){
	InvocationTargetException exception= null;
	try {
	   // 对重命名操作进行校验，执行   refactoringWizard.setInitialComputationContext((fork, cancelable, runnable) -> runnable.run(new NullProgressMonitor())); 
	   // 那么查看 WorkbenchRunnableAdapter 源码即可
		context.run(true, fIsChangeCreationCancelable, new WorkbenchRunnableAdapter(
				operation, ResourcesPlugin.getWorkspace().getRoot()));
	} catch (InterruptedException e) {
		setConditionCheckingStatus(null);
		return null;
	} catch (InvocationTargetException e) {
		exception= e;
	}

	if (updateStatus) {
		RefactoringStatus status= null;
		if (exception != null) {
			status= new RefactoringStatus();
			String msg= exception.getMessage();
			if (msg != null) {
				status.addFatalError(Messages.format(RefactoringUIMessages.RefactoringWizard_see_log, msg));
			} else {
				status.addFatalError(RefactoringUIMessages.RefactoringWizard_Internal_error);
			}
			RefactoringUIPlugin.log(exception);
		} else {
			status= operation.getConditionCheckingStatus();
		}
		setConditionCheckingStatus(status, operation.getConditionCheckingStyle());
	} else {
		if (exception != null)
            // 当校验不通过时，则会抛出异常，同时会发出改变命名的动作 
			ExceptionHandler.handle(exception, getContainer().getShell(),
				RefactoringUIMessages.RefactoringWizard_refactoring,
				RefactoringUIMessages.RefactoringWizard_unexpected_exception);
	}
	Change change= operation.getChange();
	return change;
}
```

`org.eclipse.ltk.internal.ui.refactoring.WorkbenchRunnableAdapter`

```java
public void run(IProgressMonitor monitor) throws InvocationTargetException, InterruptedException {
	try {
		ResourcesPlugin.getWorkspace().run(fWorkspaceRunnable, fRule, IWorkspace.AVOID_UPDATE, monitor);
	} catch (OperationCanceledException e) {
		throw new InterruptedException(e.getMessage());
	} catch (CoreException e) {
		throw new InvocationTargetException(e);
	}
}
```

`org.eclipse.core.internal.resources.Workspace`

```java
public void run(IWorkspaceRunnable action, ISchedulingRule rule, int options, IProgressMonitor monitor) throws CoreException {
	run((ICoreRunnable) action, rule, options, monitor);
}

public void run(ICoreRunnable action, ISchedulingRule rule, int options, IProgressMonitor monitor) throws CoreException {
	SubMonitor subMonitor = SubMonitor.convert(monitor, Policy.totalWork); // $NON-NLS-1$
	int depth = -1;
	boolean avoidNotification = (options & IWorkspace.AVOID_UPDATE) != 0;
	try {
		prepareOperation(rule, subMonitor);
		beginOperation(true);
		if (avoidNotification)
			avoidNotification = notificationManager.beginAvoidNotify();
		depth = getWorkManager().beginUnprotected();
	   // CreateChangeOperation 操作执行
		action.run(subMonitor.newChild(Policy.opWork));
	} catch (OperationCanceledException e) {
		getWorkManager().operationCanceled();
		throw e;
	} catch (CoreException e) {
		if (e.getStatus().getSeverity() == IStatus.CANCEL)
			getWorkManager().operationCanceled();
		throw e;
	} finally {
		subMonitor.done();
		if (avoidNotification)
			notificationManager.endAvoidNotify();
		if (depth >= 0)
			getWorkManager().endUnprotected(depth);
		endOperation(rule, false);
	}
}
```

`org.eclipse.ltk.core.refactoring.CreateChangeOperation`

```java
public void run(IProgressMonitor pm) throws CoreException {
	if (pm == null)
		pm= new NullProgressMonitor();
	fChange= null;
	try {
		fChange= null;
		RefactoringTickProvider rtp= fRefactoring.getRefactoringTickProvider();
		if (fCheckConditionOperation != null) {
			int conditionTicks= fCheckConditionOperation.getTicks(rtp);
			int allTicks= conditionTicks + rtp.getCreateChangeTicks() + rtp.getInitializeChangeTicks();
			pm.beginTask("", allTicks); //$NON-NLS-1$
			pm.subTask(""); //$NON-NLS-1$
			// 根据条件执行不同的校验策略
			fCheckConditionOperation.run(new SubProgressMonitor(pm, conditionTicks));
			RefactoringStatus status= fCheckConditionOperation.getStatus();
			if (status != null && status.getSeverity() < fConditionCheckingFailedSeverity) {
				fChange= fRefactoring.createChange(new SubProgressMonitor(pm, rtp.getCreateChangeTicks()));
				fChange.initializeValidationData(new NotCancelableProgressMonitor(
						new SubProgressMonitor(pm, rtp.getInitializeChangeTicks())));
			} else {
				pm.worked(rtp.getCreateChangeTicks() + rtp.getInitializeChangeTicks());
			}
		} else {
			pm.beginTask("", rtp.getCreateChangeTicks() + rtp.getInitializeChangeTicks()); //$NON-NLS-1$
			fChange= fRefactoring.createChange(new SubProgressMonitor(pm, rtp.getCreateChangeTicks()));
			fChange.initializeValidationData(new NotCancelableProgressMonitor(
				new SubProgressMonitor(pm, rtp.getInitializeChangeTicks())));
		}
	} finally {
		pm.done();
	}
}
```

`org.eclipse.ltk.core.refactoring.CheckConditionsOperation`

```java

public void run(IProgressMonitor pm) throws CoreException {
	if (pm == null)
		pm= new NullProgressMonitor();
	try {
		fStatus= null;
		if ((fStyle & ALL_CONDITIONS) == ALL_CONDITIONS)
			fStatus= fRefactoring.checkAllConditions(pm);
		else if ((fStyle & INITIAL_CONDITONS) == INITIAL_CONDITONS)
			fStatus= fRefactoring.checkInitialConditions(pm);
		else if ((fStyle & FINAL_CONDITIONS) == FINAL_CONDITIONS)
			// 此处执行最终条件，即重命名的确认动作
			fStatus= fRefactoring.checkFinalConditions(pm);
	} finally {
		pm.done();
	}
}
```

`org.eclipse.ltk.core.refactoring.participants.ProcessorBasedRefactoring`

```java
public RefactoringStatus checkFinalConditions(IProgressMonitor pm) throws CoreException {
	if (pm == null)
		pm= new NullProgressMonitor();
	RefactoringStatus result= new RefactoringStatus();
	CheckConditionsContext context= createCheckConditionsContext();

	pm.beginTask("", 9); //$NON-NLS-1$
	pm.setTaskName(RefactoringCoreMessages.ProcessorBasedRefactoring_final_conditions);

	result.merge(getProcessor().checkFinalConditions(new SubProgressMonitor(pm, 5), context));
	if (result.hasFatalError()) {
		pm.done();
		return result;
	}
	if (pm.isCanceled())
		throw new OperationCanceledException();

	SharableParticipants sharableParticipants= new SharableParticipants(); // must not be shared when checkFinalConditions is called again
	 // 查找其他加载的重命名校验规则
	RefactoringParticipant[] loadedParticipants= getProcessor().loadParticipants(result, sharableParticipants);
	if (loadedParticipants == null || loadedParticipants.length == 0) {
		fParticipants= EMPTY_PARTICIPANTS;
	} else {
		fParticipants= new ArrayList<>();
		fParticipants.addAll(Arrays.asList(loadedParticipants));
	}
	if (result.hasFatalError()) {
		pm.done();
		return result;
	}
	IProgressMonitor sm= new SubProgressMonitor(pm, 2);

	sm.beginTask("", fParticipants.size()); //$NON-NLS-1$
	for (Iterator<RefactoringParticipant> iter= fParticipants.iterator(); iter.hasNext() && !result.hasFatalError(); ) {

		RefactoringParticipant participant= iter.next();

		final PerformanceStats stats= PerformanceStats.getStats(PERF_CHECK_CONDITIONS, getName() + ", " + participant.getName()); //$NON-NLS-1$
		stats.startRun();

		try {
			result.merge(participant.checkConditions(new SubProgressMonitor(sm, 1), context));
		} catch (OperationCanceledException e) {
			throw e;
		} catch (RuntimeException e) {
			// remove the participant so that it will be ignored during change execution.
			RefactoringCorePlugin.log(e);
			result.merge(RefactoringStatus.createErrorStatus(Messages.format(
				RefactoringCoreMessages.ProcessorBasedRefactoring_check_condition_participant_failed,
				participant.getName())));
			iter.remove();
		}

		stats.endRun();

		if (sm.isCanceled())
			throw new OperationCanceledException();
	}
	sm.done();
	if (result.hasFatalError()) {
		pm.done();
		return result;
	}
	result.merge(context.check(new SubProgressMonitor(pm, 1)));
	pm.done();
	return result;
}
```

`org.eclipse.ltk.internal.core.refactoring.resource.RenameResourceProcessor`

```java
public RefactoringParticipant[] loadParticipants(RefactoringStatus status, SharableParticipants shared) throws CoreException {
	 // 根据资源文件找到受影响的 Nature
	String[] affectedNatures= ResourceProcessors.computeAffectedNatures(fResource);
	 // 根据 Nature 找到对应的  重命名策略
	return ParticipantManager.loadRenameParticipants(status, this, fResource, fRenameArguments, null, affectedNatures, shared);
}
```

`org.eclipse.ltk.internal.core.refactoring.resource.ResourceProcessors`

```java
public static String[] computeAffectedNatures(IResource resource) throws CoreException {
	IProject project= resource.getProject();
	Set<String> result= new HashSet<>();
	Set<IProject> visitedProjects= new HashSet<>();
	computeNatures(result, visitedProjects, project);
	return result.toArray(new String[result.size()]);
}

private static void computeNatures(Set<String> result, Set<IProject> visitedProjects, IProject focus) throws CoreException {
	if (visitedProjects.contains(focus))
		return;
    //   .project 文件中的  projectDescription > natures 
	String[] pns= focus.getDescription().getNatureIds();
	result.addAll(Arrays.asList(pns));
	visitedProjects.add(focus);
	IProject[] referencing= focus.getReferencingProjects();
	for (IProject r : referencing) {
		computeNatures(result, visitedProjects, r);
	}
}
```

我们根据 `Nature` 找到对应的重命名策略

`org.eclipse.ltk.core.refactoring.participants.ParticipantManager`

```java
public static RenameParticipant[] loadRenameParticipants(RefactoringStatus status, RefactoringProcessor processor, Object element, RenameArguments arguments, IParticipantDescriptorFilter filter, String[] affectedNatures, SharableParticipants shared) {
	RefactoringParticipant[] participants= fgRenameInstance.getParticipants(status, processor, element, arguments, filter, affectedNatures, shared);
	RenameParticipant[] result= new RenameParticipant[participants.length];
	System.arraycopy(participants, 0, result, 0, participants.length);
	return result;
}
```

`org.eclipse.ltk.core.refactoring.participants.ParticipantExtensionPoint`

```java


public RefactoringParticipant[] getParticipants(RefactoringStatus status, RefactoringProcessor processor, Object element, RefactoringArguments arguments, IParticipantDescriptorFilter filter, String[] affectedNatures, SharableParticipants shared) {
	if (fParticipants == null)
	    //重命名策略类的加载过程
		init();

	EvaluationContext evalContext= createEvaluationContext(processor, element, affectedNatures);
	List<RefactoringParticipant> result= new ArrayList<>();
	for (Iterator<ParticipantDescriptor> iter= fParticipants.iterator(); iter.hasNext();) {
		ParticipantDescriptor descriptor= iter.next();
		if (!descriptor.isEnabled()) {
			iter.remove();
		} else {
			try {
				RefactoringStatus filterStatus= new RefactoringStatus();
				if (descriptor.matches(evalContext, filter, filterStatus)) {
					RefactoringParticipant participant= shared.get(descriptor);
					if (participant != null) {
						((ISharableParticipant)participant).addElement(element, arguments);
					} else {
					    // 根据描述文件 descriptor 创建 participant
						participant= descriptor.createParticipant();
						if (fParticipantClass.isInstance(participant)) {
							if (participant.initialize(processor, element, arguments)) {
								participant.setDescriptor(descriptor);
								result.add(participant);
								if (participant instanceof ISharableParticipant)
									shared.put(descriptor, participant);
							}
						} else {
							status.addError(Messages.format(
								RefactoringCoreMessages.ParticipantExtensionPoint_participant_removed,
								descriptor.getName()));
							RefactoringCorePlugin.logErrorMessage(
								Messages.format(
									RefactoringCoreMessages.ParticipantExtensionPoint_wrong_type,
									new String[] {descriptor.getName(), fParticipantClass.getName()}));
							iter.remove();
						}
					}
				} else {
					status.merge(filterStatus);
				}
			} catch (CoreException | RuntimeException e) {
				logMalfunctioningParticipant(status, descriptor, e);
				iter.remove();
			}
		}
	}

	return result.toArray(new RefactoringParticipant[result.size()]);
}
}


private void init() {
	IExtensionRegistry registry= Platform.getExtensionRegistry();
    // 获取 插件ID org.eclipse.ltk.core.refactoring 对应的 renameParticipants
	IConfigurationElement[] ces= registry.getConfigurationElementsFor(fPluginId, fParticipantID);
	fParticipants= new ArrayList<>(ces.length);
	for (IConfigurationElement ce : ces) {
		ParticipantDescriptor descriptor= new ParticipantDescriptor(ce);
		IStatus status= descriptor.checkSyntax();
		switch (status.getSeverity()) {
			case IStatus.ERROR:
				RefactoringCorePlugin.log(status);
				break;
			case IStatus.WARNING:
			case IStatus.INFO:
				RefactoringCorePlugin.log(status);
				fParticipants.add(descriptor);
				break;
			default:
				fParticipants.add(descriptor);
		}
	}
}
```

`org.eclipse.core.internal.registry.ExtensionRegistry`

```java
public IConfigurationElement[] getConfigurationElementsFor(String pluginId, String extensionPointSimpleId) {
	// this is just a convenience API - no need to do any sync'ing here
    //  org.eclipse.ltk.core.refactoring 查找 renameParticipants
	IExtensionPoint extPoint = this.getExtensionPoint(pluginId, extensionPointSimpleId);
	if (extPoint == null)
		return new IConfigurationElement[0];
	return extPoint.getConfigurationElements();
}

public IExtensionPoint getExtensionPoint(String elementName, String xpt) {
	access.enterRead();
	try {
        // 从注册的 extensionPoint 缓冲中读取 org.eclipse.ltk.core.refactoring.renameParticipants
		return registryObjects.getExtensionPointHandle(elementName + '.' + xpt);
	} finally {
		access.exitRead();
	}
}
```

我们再来看下 participant 的创建过程， 是根据 `plugin.xml` 中的 `extension` ，其规定了具体的 重命名策略类，以及生效条件等

例如 junit 的重命名

```xml
<extension
         point="org.eclipse.ltk.core.refactoring.renameParticipants">
      <renameParticipant
            name="%RenameTypeParticipant.name"
            class="org.eclipse.jdt.internal.junit.refactoring.TypeRenameParticipant"
            id="org.eclipse.jdt.junit.renameTypeParticipant">
         <enablement>
           <with variable="affectedNatures">
             <iterate operator="or">
               <equals value="org.eclipse.jdt.core.javanature"/>
             </iterate>
           </with>
           <with variable="element">
             <instanceof value="org.eclipse.jdt.core.IType"/>
 	         <test property="org.eclipse.jdt.core.hasTypeOnClasspath" value="junit.framework.Test"/>
            </with>
         </enablement>
      </renameParticipant>
      <renameParticipant
            class="org.eclipse.jdt.internal.junit.refactoring.ProjectRenameParticipant"
            name="%junitRenameParticipant"
            id="org.eclipse.jdt.junit.renameProjectParticipant">
         <enablement>
           <with variable="affectedNatures">
             <iterate operator="or">
               <equals value="org.eclipse.jdt.core.javanature"/>
             </iterate>
           </with>
           <with variable="element">
   	         <instanceof value="org.eclipse.jdt.core.IJavaProject"/>
	         <test property="org.eclipse.jdt.core.hasTypeOnClasspath" value="junit.framework.Test"/>
           </with>
         </enablement>
      </renameParticipant>

</extension>
```

回到 `org.eclipse.ltk.internal.core.refactoring.ParticipantDescriptor`，我们可以看到 它是根据 `plugin.xml` 中  `renameParticipant` 的 `class` 属性来实例化的。

```java
public class ParticipantDescriptor {

	private IConfigurationElement fConfigurationElement;
	private boolean fEnabled;

	private static final String ID= "id"; //$NON-NLS-1$
	private static final String NAME= "name";  //$NON-NLS-1$
	private static final String CLASS= "class"; //$NON-NLS-1$
	private static final String PROCESS_ON_CANCEL= "processOnCancel";  //$NON-NLS-1$

	public ParticipantDescriptor(IConfigurationElement element) {
		fConfigurationElement= element;
		fEnabled= true;
	}

	public String getId() {
		return fConfigurationElement.getAttribute(ID);
	}

	public String getName() {
		return fConfigurationElement.getAttribute(NAME);
	}

	public IStatus checkSyntax() {
		if (fConfigurationElement.getAttribute(ID) == null) {
			return new Status(IStatus.ERROR, RefactoringCorePlugin.getPluginId(), IStatus.ERROR,
				RefactoringCoreMessages.ParticipantDescriptor_error_id_missing, null);
		}
		if (fConfigurationElement.getAttribute(NAME) == null) {
			return new Status(IStatus.ERROR, RefactoringCorePlugin.getPluginId(), IStatus.ERROR,
				Messages.format( RefactoringCoreMessages.ParticipantDescriptor_error_name_missing, getId()),
				null);
		}
		if (fConfigurationElement.getAttribute(CLASS) == null) {
			return new Status(IStatus.ERROR, RefactoringCorePlugin.getPluginId(), IStatus.ERROR,
				Messages.format( RefactoringCoreMessages.ParticipantDescriptor_error_class_missing, getId()),
				null);
		}
		return Status.OK_STATUS;
	}

	public boolean matches(IEvaluationContext context, IParticipantDescriptorFilter filter, RefactoringStatus status) throws CoreException {
		IConfigurationElement[] elements= fConfigurationElement.getChildren(ExpressionTagNames.ENABLEMENT);
		if (elements.length == 0)
			return false;
		Assert.isTrue(elements.length == 1);
		Expression exp= ExpressionConverter.getDefault().perform(elements[0]);
		if (!convert(exp.evaluate(context)))
			return false;
		if (filter != null && !filter.select(fConfigurationElement, status))
			return false;

		return true;
	}

   // 策略类的实例化过程
	public RefactoringParticipant createParticipant() throws CoreException {
		return (RefactoringParticipant)fConfigurationElement.createExecutableExtension(CLASS);
	}

	public boolean isEnabled() {
		return fEnabled;
	}

	public void disable() {
		fEnabled= false;
	}

	public boolean processOnCancel() {
		String attr= fConfigurationElement.getAttribute(PROCESS_ON_CANCEL);
		if (attr == null)
			return false;
		return Boolean.valueOf(attr).booleanValue();
	}

	private boolean convert(EvaluationResult eval) {
		if (eval == EvaluationResult.FALSE)
			return false;
		return true;
	}

	@Override
	public String toString() {
		return "name= " + getName() + (isEnabled() ? " (enabled)" : " (disabled)") + //$NON-NLS-1$ //$NON-NLS-2$ //$NON-NLS-3$
				"\nid= " + getId() + //$NON-NLS-1$
				"\nclass= " + fConfigurationElement.getAttribute(CLASS); //$NON-NLS-1$
	}
}
```


##  自定义一个重命名动作


配置 [[eclipse-plugin-develop-tutorial-setup#extension|extension]] 

```xml
<extension point="org.eclipse.ltk.core.refactoring.renameParticipants">
	<renameParticipant class="io.leaderli.visual.editor.refactor.FlowRenameParticipant" id="io.leaderli.visual.editor.refactor.FlowRenameParticipant" name="FlowRenameParticipant">
		<enablement>
	   
			<with variable="affectedNatures">
				<iterate operator="or">
					<equals value="io.leaderli.visual.editor.LiVisualEditorNature" />
				</iterate>
			</with>
		</enablement>
	</renameParticipant>
</extension>
```

```java
package io.leaderli.visual.editor.refactor;

import org.eclipse.core.runtime.CoreException;
import org.eclipse.core.runtime.IProgressMonitor;
import org.eclipse.core.runtime.IStatus;
import org.eclipse.core.runtime.OperationCanceledException;
import org.eclipse.ltk.core.refactoring.Change;
import org.eclipse.ltk.core.refactoring.RefactoringStatus;
import org.eclipse.ltk.core.refactoring.participants.CheckConditionsContext;
import org.eclipse.ltk.core.refactoring.participants.IRenameResourceProcessor;
import org.eclipse.ltk.core.refactoring.participants.RefactoringProcessor;
import org.eclipse.ltk.core.refactoring.participants.RenameParticipant;

import io.leaderli.litool.core.text.StringUtils;
import io.leaderli.litool.core.util.ConsoleUtil;
import io.leaderli.visual.editor.constant.Leaderli;
import io.leaderli.visual.editor.util.NameUtil;

//TODO 重命名文件的规则校验
public class FlowRenameParticipant extends RenameParticipant {

    @Override
    protected boolean initialize(Object element) {
        return true;
    }

    @Override
    public String getName() {
        return "Rename Flow";
    }

    @Override
    public RefactoringStatus checkConditions(IProgressMonitor pm, CheckConditionsContext context)
            throws OperationCanceledException {

		//进行校验
        if(!newName.endsWith(Leaderli.EXTENSION_OF_LI_WITH_DOT)) {
            return RefactoringStatus.createFatalErrorStatus("flow file must be .li extension");

        }
        return new RefactoringStatus();
    }

    @Override
    public Change createPreChange(IProgressMonitor pm) throws CoreException, OperationCanceledException {
		// 预览，即 preview
        return super.createPreChange(pm);
    }

    @Override
    public Change createChange(IProgressMonitor pm) throws CoreException, OperationCanceledException {
		// 执行重命名操作
        return super.createPreChange(pm);
    }

}

```