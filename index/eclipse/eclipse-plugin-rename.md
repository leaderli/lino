---
tags:
  - eclipse/eclipse-plugin-rename
date updated: 2022-03-28 15:40
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
	Shell activeShell = HandlerUtil.getActiveShell(event);
	Object newNameValue = HandlerUtil.getVariable(event, "org.eclipse.ltk.ui.refactoring.commands.renameResource.newName.parameter.key");
	String newName = null;
	if (newNameValue instanceof String)
	newName = (String)newNameValue; 

	ISelection sel = HandlerUtil.getCurrentSelection(event);
	if (sel instanceof IStructuredSelection) {
	IResource resource = getCurrentResource((IStructuredSelection)sel);
		if (resource != null) {
			 RenameResourceWizard refactoringWizard;
			 Change change = null;
			 RefactoringProcessor processor = null;
			 if (newName != null) {
			   refactoringWizard = new RenameResourceWizard(resource, newName);
			   processor = ((ProcessorBasedRefactoring)refactoringWizard.getRefactoring()).getProcessor();
			   // 查看重命名操作是否需要其他改变动作
			   change = getChange(refactoringWizard);

			   refactoringWizard = new RenameResourceWizard(resource, newName);
			 } else {
			   refactoringWizard = new RenameResourceWizard(resource);


			 } 
			 try {
			   if (newName == null || change == null || isCompositeChange(change) || !(processor instanceof org.eclipse.ltk.internal.core.refactoring.resource.RenameResourceProcessor)) {
			     // 命名不规范的弹窗修改操作
				 RefactoringWizardOpenOperation op = new RefactoringWizardOpenOperation(refactoringWizard);
				 op.run(activeShell, RefactoringUIMessages.RenameResourceHandler_title);

			   } else {
			     // 命名规则，直接触发修改
				 change.perform(new NullProgressMonitor());
			   } 
			 } catch (InterruptedException interruptedException) {
			 
			 } catch (CoreException e) {
			   RefactoringUIPlugin.log(e);
			 } 
		} 
	} 
}


private Change getChange(RenameResourceWizard refactoringWizard) {
 refactoringWizard.setChangeCreationCancelable(true);
 // 主要是这一行执行
 refactoringWizard.setInitialComputationContext((fork, cancelable, runnable) -> runnable.run(new NullProgressMonitor()));
 return refactoringWizard.internalCreateChange(InternalAPI.INSTANCE, 
	 new CreateChangeOperation(new CheckConditionsOperation(refactoringWizard.getRefactoring(), 4), 4), true);
}
```


`org.eclipse.ltk.ui.refactoring.RefactoringWizard`

```java
public final Change internalCreateChange(InternalAPI api, CreateChangeOperation operation, boolean updateStatus) {
 Assert.isNotNull(api);
 IRunnableContext context = (getContainer() != null) ? getContainer() : this.fRunnableContext;
 return createChange(operation, updateStatus, context);
}


private Change createChange(CreateChangeOperation operation, boolean updateStatus, IRunnableContext context) {
 InvocationTargetException exception = null;
 try {
   // 对重命名操作进行校验，执行   refactoringWizard.setInitialComputationContext((fork, cancelable, runnable) -> runnable.run(new NullProgressMonitor())); 
   // 那么查看 WorkbenchRunnableAdapter 源码即可
   context.run(true, this.fIsChangeCreationCancelable, new WorkbenchRunnableAdapter(
		 (IWorkspaceRunnable)operation, ResourcesPlugin.getWorkspace().getRoot()));
 } catch (InterruptedException interruptedException) {
   setConditionCheckingStatus((RefactoringStatus)null);
   return null;
 } catch (InvocationTargetException e) {
   exception = e;

 } 
 
 if (updateStatus) {
   RefactoringStatus status = null;
   if (exception != null) {
	 status = new RefactoringStatus();
	 String msg = exception.getMessage();
	 if (msg != null) {
	   status.addFatalError(Messages.format(RefactoringUIMessages.RefactoringWizard_see_log, msg));
	 } else {
	   status.addFatalError(RefactoringUIMessages.RefactoringWizard_Internal_error);
	 } 
	 RefactoringUIPlugin.log(exception);
   } else {
	 status = operation.getConditionCheckingStatus();
   } 
   setConditionCheckingStatus(status, operation.getConditionCheckingStyle());

 } else if (exception != null) {
   // 当校验不通过时，则会抛出异常，同时会发出改变命名的动作 
   ExceptionHandler.handle(exception, getContainer().getShell(), 
	   RefactoringUIMessages.RefactoringWizard_refactoring, 
	   RefactoringUIMessages.RefactoringWizard_unexpected_exception);
 } 
 Change change = operation.getChange();
 return change;
}

```


`org.eclipse.ltk.internal.ui.refactoring.WorkbenchRunnableAdapter`

```java
public void run(IProgressMonitor monitor) throws InvocationTargetException, InterruptedException {
 try {
   ResourcesPlugin.getWorkspace().run(this.fWorkspaceRunnable, this.fRule, 1, monitor);
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
 run(action, rule, options, monitor);
}


public void run(ICoreRunnable action, ISchedulingRule rule, int options, IProgressMonitor monitor) throws CoreException {
 SubMonitor subMonitor = SubMonitor.convert(monitor, 100);
 int depth = -1;
 boolean avoidNotification = ((options & 0x1) != 0);
 try {
   prepareOperation(rule, subMonitor);
   beginOperation(true);
   if (avoidNotification)
	 avoidNotification = this.notificationManager.beginAvoidNotify(); 
   depth = getWorkManager().beginUnprotected();
   // CreateChangeOperation 操作执行
   action.run(subMonitor.newChild(Policy.opWork));
 } catch (OperationCanceledException e) {
   getWorkManager().operationCanceled();
   throw e;
 } catch (CoreException e) {
   if (e.getStatus().getSeverity() == 8)
	 getWorkManager().operationCanceled(); 
   throw e;
 } finally {
   subMonitor.done();
   if (avoidNotification)
	 this.notificationManager.endAvoidNotify(); 
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
   pm = new NullProgressMonitor(); 
 this.fChange = null;
 try {
   this.fChange = null;
   RefactoringTickProvider rtp = this.fRefactoring.getRefactoringTickProvider();
   if (this.fCheckConditionOperation != null) {
	 int conditionTicks = this.fCheckConditionOperation.getTicks(rtp);
	 int allTicks = conditionTicks + rtp.getCreateChangeTicks() + rtp.getInitializeChangeTicks();
	 pm.beginTask("", allTicks);
	 pm.subTask("");
	 // 根据条件执行不同的校验策略
	 this.fCheckConditionOperation.run(new SubProgressMonitor(pm, conditionTicks));
	 RefactoringStatus status = this.fCheckConditionOperation.getStatus();
	 if (status != null && status.getSeverity() < this.fConditionCheckingFailedSeverity) {
	   this.fChange = this.fRefactoring.createChange(new SubProgressMonitor(pm, rtp.getCreateChangeTicks()));
	   this.fChange.initializeValidationData(new NotCancelableProgressMonitor(
			 new SubProgressMonitor(pm, rtp.getInitializeChangeTicks())));
	 } else {
	   pm.worked(rtp.getCreateChangeTicks() + rtp.getInitializeChangeTicks());
	 } 
   } else {
	 pm.beginTask("", rtp.getCreateChangeTicks() + rtp.getInitializeChangeTicks());
	 this.fChange = this.fRefactoring.createChange(new SubProgressMonitor(pm, rtp.getCreateChangeTicks()));
	 this.fChange.initializeValidationData(new NotCancelableProgressMonitor(
		   new SubProgressMonitor(pm, rtp.getInitializeChangeTicks())));
   } 
 } finally {
   pm.done();
 } 
}
```


`org.eclipse.ltk.core.refactoring.CheckConditionsOperation`

```java

public static final int NONE = 0;

public static final int INITIAL_CONDITONS = 2;

public static final int FINAL_CONDITIONS = 4;

public static final int ALL_CONDITIONS = 6;

private static final int LAST = 8;
   
public void run(IProgressMonitor pm) throws CoreException {
 if (pm == null)
   pm = new NullProgressMonitor(); 
 try {
   this.fStatus = null;
   if ((this.fStyle & 0x6) == 6) {
	 this.fStatus = this.fRefactoring.checkAllConditions(pm);
   } else if ((this.fStyle & 0x2) == 2) {
	 this.fStatus = this.fRefactoring.checkInitialConditions(pm);
   } else if ((this.fStyle & 0x4) == 4) {
     // 此处执行最终条件，即重命名的确认动作
	 this.fStatus = this.fRefactoring.checkFinalConditions(pm);
   }     } finally {
   pm.done();
 } 
}
```

`org.eclipse.ltk.core.refactoring.participants.ProcessorBasedRefactoring`

```java
public RefactoringStatus checkFinalConditions(IProgressMonitor pm) throws CoreException {
 if (pm == null)
   pm = new NullProgressMonitor(); 
 RefactoringStatus result = new RefactoringStatus();
 CheckConditionsContext context = createCheckConditionsContext();

 pm.beginTask("", 9);
 pm.setTaskName(RefactoringCoreMessages.ProcessorBasedRefactoring_final_conditions);

 result.merge(getProcessor().checkFinalConditions(new SubProgressMonitor(pm, 5), context));
 if (result.hasFatalError()) {
   pm.done();
   return result;
 } 
 if (pm.isCanceled())
   throw new OperationCanceledException(); 

 SharableParticipants sharableParticipants = new SharableParticipants();
 // 查找其他加载的重命名校验规则
 RefactoringParticipant[] loadedParticipants = getProcessor().loadParticipants(result, sharableParticipants);
 if (loadedParticipants == null || loadedParticipants.length == 0) {
   this.fParticipants = EMPTY_PARTICIPANTS;
 } else {
   this.fParticipants = new ArrayList<>();
   this.fParticipants.addAll(Arrays.asList(loadedParticipants));
 } 
 if (result.hasFatalError()) {
   pm.done();
   return result;
 } 
 IProgressMonitor sm = new SubProgressMonitor(pm, 2);

 sm.beginTask("", this.fParticipants.size());
 for (Iterator<RefactoringParticipant> iter = this.fParticipants.iterator(); iter.hasNext() && !result.hasFatalError(); ) {

   RefactoringParticipant participant = iter.next();

checkConditions", String.valueOf(getName()) + ", " + participant.getName());
   stats.startRun();

   try {
	 result.merge(participant.checkConditions(new SubProgressMonitor(sm, 1), context));
   } catch (OperationCanceledException e) {
	 throw e;
   } catch (RuntimeException e) {

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
 String[] affectedNatures = ResourceProcessors.computeAffectedNatures(this.fResource);
 // 根据 Nature 找到对应的  重命名策略
 return (RefactoringParticipant[])ParticipantManager.loadRenameParticipants(status, this, this.fResource, this.fRenameArguments, null, affectedNatures, shared);
}

public RefactoringParticipant[] loadParticipants(RefactoringStatus status, SharableParticipants shared) throws CoreException {
 String[] affectedNatures = ResourceProcessors.computeAffectedNatures(this.fResource);
 return (RefactoringParticipant[])ParticipantManager.loadRenameParticipants(status, this, this.fResource, this.fRenameArguments, null, affectedNatures, shared);
}
```


`org.eclipse.ltk.internal.core.refactoring.resource.ResourceProcessors`

```java
public static String[] computeAffectedNatures(IResource resource) throws CoreException {
 IProject project = resource.getProject();
 Set<String> result = new HashSet<>();
 Set<IProject> visitedProjects = new HashSet<>();
 computeNatures(result, visitedProjects, project);
 return result.<String>toArray(new String[result.size()]);
}



private static void computeNatures(Set result, Set visitedProjects, IProject focus) throws CoreException {  
    if (visitedProjects.contains(focus)) {  
        return;  
    }
    //   .project 文件中的  projectDescription > natures 
    //    
    String[] pns = focus.getDescription().getNatureIds();  
    for (String str : pns) {  
        result.add(str);  
    }  
    visitedProjects.add(focus);  
    IProject[] referencing = focus.getReferencingProjects();  
    for (IProject iProject : referencing) {  
        computeNatures(result, visitedProjects, iProject);  
    }  
}
```


我们根据 `Nature` 找到对应的重命名策略

`org.eclipse.ltk.core.refactoring.participants.ParticipantManager`

```java
public static RenameParticipant[] loadRenameParticipants(RefactoringStatus status, RefactoringProcessor processor, Object element, RenameArguments arguments, IParticipantDescriptorFilter filter, String[] affectedNatures, SharableParticipants shared) {
 
 RefactoringParticipant[] participants = fgRenameInstance.getParticipants(status, processor, element, arguments, filter, affectedNatures, shared);
 RenameParticipant[] result = new RenameParticipant[participants.length];
 System.arraycopy(participants, 0, result, 0, participants.length);
 return result;
}


```

`org.eclipse.ltk.core.refactoring.participants.ParticipantExtensionPoint`

```java
public RefactoringParticipant[] getParticipants(RefactoringStatus status, RefactoringProcessor processor, Object element, RefactoringArguments arguments, IParticipantDescriptorFilter filter, String[] affectedNatures, SharableParticipants shared) {
 //重命名策略类的加载过程
 if (this.fParticipants == null)
   init(); 

 EvaluationContext evalContext = createEvaluationContext(processor, element, affectedNatures);
 List<RefactoringParticipant> result = new ArrayList<>();
 for (Iterator<ParticipantDescriptor> iter = this.fParticipants.iterator(); iter.hasNext(); ) {
   ParticipantDescriptor descriptor = iter.next();
   if (!descriptor.isEnabled()) {
	 iter.remove();
	 continue;      } 
   try {
	 RefactoringStatus filterStatus = new RefactoringStatus();
	 if (descriptor.matches(evalContext, filter, filterStatus)) {
	   RefactoringParticipant participant = shared.get(descriptor);
	   if (participant != null) {
		 ((ISharableParticipant)participant).addElement(element, arguments);
		 continue;          } 
	  // 根据描述文件 descriptor 创建 participant
	  // 
	   participant = descriptor.createParticipant();
	   if (this.fParticipantClass.isInstance(participant)) {
		 if (participant.initialize(processor, element, arguments)) {
		   participant.setDescriptor(descriptor);
		   result.add(participant);
		   if (participant instanceof ISharableParticipant)
			 shared.put(descriptor, participant); 
		 }             continue;
	   } 
	   status.addError(Messages.format(
			 RefactoringCoreMessages.ParticipantExtensionPoint_participant_removed, 
			 descriptor.getName()));
	   RefactoringCorePlugin.logErrorMessage(
		   Messages.format(
			 RefactoringCoreMessages.ParticipantExtensionPoint_wrong_type, 
			 (Object[])new String[] { descriptor.getName(), this.fParticipantClass.getName() }));
	   iter.remove();

	   continue;
	 } 
	 status.merge(filterStatus);

   } catch (CoreException|RuntimeException e) {
	 logMalfunctioningParticipant(status, descriptor, e);
	 iter.remove();


   } 
 } 
 return result.<RefactoringParticipant>toArray(new RefactoringParticipant[result.size()]);
}


private void init() {
 IExtensionRegistry registry = Platform.getExtensionRegistry();
 // 获取 插件ID org.eclipse.ltk.core.refactoring 对应的 renameParticipants
 IConfigurationElement[] ces = registry.getConfigurationElementsFor(this.fPluginId, this.fParticipantID);
 this.fParticipants = new ArrayList<>(ces.length);    byte b;    int i;    IConfigurationElement[] arrayOfIConfigurationElement1;
 for (i = (arrayOfIConfigurationElement1 = ces).length, b = 0; b < i; ) {      IConfigurationElement ce = arrayOfIConfigurationElement1[b];
   ParticipantDescriptor descriptor = new ParticipantDescriptor(ce);
   IStatus status = descriptor.checkSyntax();
   switch (status.getSeverity()) {
	 case 4:
	   RefactoringCorePlugin.log(status);
	   break;
	 case 1:
	 case 2:
	   RefactoringCorePlugin.log(status);
	   this.fParticipants.add(descriptor);
	   break;
	 default:
	   this.fParticipants.add(descriptor);
	   break;
   } 
   b++;
 } 
}
```


`org.eclipse.core.internal.registry.ExtensionRegistry`

```java
public IConfigurationElement[] getConfigurationElementsFor(String pluginId, String extensionPointSimpleId) {
 //  org.eclipse.ltk.core.refactoring 查找 renameParticipants
 IExtensionPoint extPoint = getExtensionPoint(pluginId, extensionPointSimpleId);
 if (extPoint == null)
   return new IConfigurationElement[0]; 
 return extPoint.getConfigurationElements();
}

public IExtensionPoint getExtensionPoint(String elementName, String xpt) {
 this.access.enterRead();
 try {
   // 从注册的 extensionPoint 缓冲中读取 org.eclipse.ltk.core.refactoring.renameParticipants
   return this.registryObjects.getExtensionPointHandle(String.valueOf(elementName) + '.' + xpt);
 } finally {
   this.access.exitRead();
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
   
   private static final String ID = "id";
   
   private static final String NAME = "name";
   
   private static final String CLASS = "class";
   
   private static final String PROCESS_ON_CANCEL = "processOnCancel";
   
   public ParticipantDescriptor(IConfigurationElement element) {
     this.fConfigurationElement = element;
     this.fEnabled = true;
   }
 
   public String getId() {
     return this.fConfigurationElement.getAttribute("id");
   }
 
   public String getName() {
     return this.fConfigurationElement.getAttribute("name");
   }
 
   public IStatus checkSyntax() {
     if (this.fConfigurationElement.getAttribute("id") == null)
       return new Status(4, RefactoringCorePlugin.getPluginId(), 4, 
           RefactoringCoreMessages.ParticipantDescriptor_error_id_missing, null); 
 
     if (this.fConfigurationElement.getAttribute("name") == null)
       return new Status(4, RefactoringCorePlugin.getPluginId(), 4, 
           Messages.format(RefactoringCoreMessages.ParticipantDescriptor_error_name_missing, getId()), 
           null); 
 
     if (this.fConfigurationElement.getAttribute("class") == null)
       return new Status(4, RefactoringCorePlugin.getPluginId(), 4, 
           Messages.format(RefactoringCoreMessages.ParticipantDescriptor_error_class_missing, getId()), 
           null); 
 
     return Status.OK_STATUS;
   }
 
   public boolean matches(IEvaluationContext context, IParticipantDescriptorFilter filter, RefactoringStatus status) throws CoreException {
     IConfigurationElement[] elements = this.fConfigurationElement.getChildren("enablement");
     if (elements.length == 0)
       return false; 
     Assert.isTrue((elements.length == 1));
     Expression exp = ExpressionConverter.getDefault().perform(elements[0]);
     if (!convert(exp.evaluate(context)))
       return false; 
     if (filter != null && !filter.select(this.fConfigurationElement, status))
       return false; 
 
     return true;
   }
   // 策略类的实例化过程
   public RefactoringParticipant createParticipant() throws CoreException {
     return (RefactoringParticipant)this.fConfigurationElement.createExecutableExtension("class");
   }
 
   public boolean isEnabled() {
     return this.fEnabled;
   }
 
   public void disable() {
     this.fEnabled = false;
   }
 
   public boolean processOnCancel() {
     String attr = this.fConfigurationElement.getAttribute("processOnCancel");
     if (attr == null)
       return false; 
     return Boolean.valueOf(attr).booleanValue();
   }
 
   private boolean convert(EvaluationResult eval) {
     if (eval == EvaluationResult.FALSE)
       return false; 
     return true;
   }
 
 
   public String toString() {
     return "name= " + getName() + (isEnabled() ? " (enabled)" : " (disabled)") + 
       "\nid= " + getId() + 
       "\nclass= " + this.fConfigurationElement.getAttribute("class");
   }
}
```