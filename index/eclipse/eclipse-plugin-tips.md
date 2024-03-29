---
tags:
  - eclipse/eclipse-plugin-tips
date updated: 2022-11-24 00:16
---

### 如何DEBUG插件

1. 安装 [[eclipse#反编译插件]]
2. 在 `plugin.xml` 文件中 的 `Dependencies` 中 Add 需要添加需要进行断点的jar，当 jar存在源码包时，也可以直接引入。一般为 `-source`结尾
3. 找到需要断点的类，添加上断点

### 打开文件

```java
import org.eclipse.core.resources.IFile;
import org.eclipse.core.resources.IFolder;
import org.eclipse.core.resources.IProject;
import org.eclipse.core.resources.IResource;
import org.eclipse.core.resources.IWorkspaceRoot;
import org.eclipse.core.resources.ResourcesPlugin;
import org.eclipse.ui.IEditorInput;
import org.eclipse.ui.IWorkbenchPage;
import org.eclipse.ui.PartInitException;
import org.eclipse.ui.PlatformUI;
import org.eclipse.ui.ide.IDE;


IWorkspaceRoot root = ResourcesPlugin.getWorkspace().getRoot();
   IWorkbenchPage page = PlatformUI.getWorkbench().getActiveWorkbenchWindow().getActivePage();
   IEditorInput input = page.getActiveEditor()
     .getEditorInput();
   IResource activeResource = input.getAdapter(IResource.class);
   IProject iproject = activeResource.getProject();
   IFolder iFolder = iproject.getFolder("src/demo");
   IFile iFile = iFolder.getFile("test.java");

   try {
    IDE.openEditor(page, iFile);
   } catch (PartInitException e) {
    e.printStackTrace();
   }

```

### 获取图标的工具类

```java
package com.leaderli.li.flow.util;

import java.net.MalformedURLException;
import java.net.URL;

import org.eclipse.jface.resource.ImageDescriptor;
import org.eclipse.jface.resource.ImageRegistry;
import org.eclipse.swt.graphics.Image;

//插件的启动类，一般自动生成
import com.leaderli.li.flow.Activator;

public class ImageUtil {
 public static final ImageRegistry IMAGE_REGISTRY = Activator.getDefault().getImageRegistry();

 public static Image getImage(String name) {

  getImageDescriptor(name);
  return IMAGE_REGISTRY.get(name);
 }

 public static ImageDescriptor getImageDescriptor(String name) {

  ImageDescriptor imageDescriptor = IMAGE_REGISTRY.getDescriptor(name);
  Image image = IMAGE_REGISTRY.get(name);
  if (imageDescriptor == null) {
   try {
    imageDescriptor = ImageDescriptor
      .createFromURL(new URL(Activator.getDefault().getBundle().getEntry("/"), "icon/" + name));
    IMAGE_REGISTRY.put(name, imageDescriptor);
   } catch (MalformedURLException e) {
    e.printStackTrace();
   }
  }
  return imageDescriptor;
 }
}

```

### 读取插件下的资源

```java
import com.leaderli.visual.editor.Activator;

public static void copyFileFromPluginToProject(IProject project, String from, String to, IProgressMonitor monitor) throws Exception 
	// form   resource/pom.xml
	URL fromURL = Activator.getDefault().getBundle().getResource(from);
	// toFile   pom.xml
	IFile toFile = project.getFile(to);
	//将插件下的pom.xml拷贝到项目根目录下
	toFile.create(fromStream, true, monitor);

}
```

### 进度条

参考 [Eclipse Jobs and Background Processing - Tutorial](https://www.vogella.com/tutorials/EclipseJobs/article.html)

```java
import java.util.concurrent.TimeUnit;

import org.eclipse.core.runtime.IProgressMonitor;
import org.eclipse.core.runtime.IStatus;
import org.eclipse.core.runtime.Status;
import org.eclipse.core.runtime.SubMonitor;
import org.eclipse.core.runtime.jobs.Job


Job job = new Job("create project : " + projectName) {

		@Override
		protected IStatus run(IProgressMonitor monitor) {
			try {
				//将任务分为100个
				SubMonitor subMonitor = SubMonitor.convert(monitor, 100);
				for (int i = 0; i < 10; i++) {
					//完成10个
					subMonitor.split(10);
					monitor.setTaskName("create project:" + i);
					// 设定为还剩70个
					// subMonitor.setWorkRemaining(70);
					TimeUnit.SECONDS.sleep(1);
				}

			} catch (InterruptedException e) {
				e.printStackTrace();
			}
			return new Status(IStatus.OK, Activator.PLUGIN_ID, Messages.status_OK);
		}
};
job.schedule();
```

### 在其他线程中查找激活的窗口

当线程不是在激活的窗口中运行时，需要使用通过下述方法来查找激活的窗口

```java
Display.getDefault().asyncExec(new Runnable() {
	@Override
	public void run() {
		IWorkbenchWindow iw = PlatformUI.getWorkbench().getActiveWorkbenchWindow();
		try {
			// file  -> Ifile
			IDE.openEditor(iw.getActivePage(), file);
		} catch (PartInitException e) {
			e.printStackTrace();
		}
	}
});
				
```

### 创建一个maven项目

在创建project的时候，将nature和buildSpec中添加maven的支持

```java
import org.eclipse.core.resources.ICommand;
import org.eclipse.core.resources.IProject;
import org.eclipse.core.resources.IProjectDescription;
import org.eclipse.core.runtime.NullProgressMonitor;
import org.eclipse.ui.IWorkbenchWindow;


private static void addMavenNature(IProject project, IProgressMonitor monitor) throws CoreException {


	IProjectDescription description = project.getDescription();

	String[] newNatures = new String[2];

	newNatures[0] = JavaCore.NATURE_ID;// 添加 java
	newNatures[1] = "org.eclipse.m2e.core.maven2Nature";// 添加 maven

	description.setNatureIds(newNatures);

	project.setDescription(description, monitor);

	ICommand command = description.newCommand();
	command.setBuilderName(JavaCore.BUILDER_ID); // 添加java
	
	command = description.newCommand();
	command.setBuilderName("org.eclipse.m2e.core.maven2Builder"); // 添加 maven
}  
```

也需要在设置classpath的内容

```xml
<?xml version="1.0" encoding="UTF-8"?>
<classpath>
	<classpathentry kind="src" output="target/test-classes" path="src/test/java">
		<attributes>
			<attribute name="optional" value="true"/>
			<attribute name="maven.pomderived" value="true"/>
		</attributes>
	</classpathentry>
	<classpathentry kind="src" path="src/main/java"/>
	<classpathentry kind="con" path="org.eclipse.jdt.launching.JRE_CONTAINER/org.eclipse.jdt.internal.debug.ui.launcher.StandardVMType/jdk1.8.0_281">
		<attributes>
			<attribute name="maven.pomderived" value="true"/>
		</attributes>
	</classpathentry>
	<classpathentry kind="con" path="org.eclipse.m2e.MAVEN2_CLASSPATH_CONTAINER">
		<attributes>
			<attribute name="maven.pomderived" value="true"/>
		</attributes>
	</classpathentry>
	<classpathentry kind="output" path="target/classes"/>
</classpath>
```

### 创建WizardPage时用到的一些方法

```java
this.setMessage("Select a project.", IMessageProvider.WARNING); // 2
```

### 获取选中元素所在的project

```java
import org.eclipse.core.resources.IProject;
import org.eclipse.core.resources.IResource
import org.eclipse.jdt.core.IJavaElement;
import org.eclipse.jdt.core.IJavaProject;

Lino<Object> element = Lino.of(selection).map(IStructuredSelection::getFirstElement);

// 根据选中的元素不同，通过不同的方式去获取当前的project
Lino<IProject> project = element
.cast(IJavaProject.class).map(IJavaProject::getProject)
.or(element.cast(IResource.class).map(IResource::getProject))
.or(element.cast(IJavaElement.class).map(IJavaElement::getResource).map(IResource::getProject))
```

### 在 packageExplorer 中显示指定文件

```java
PackageExplorerPart part = PackageExplorerPart.getFromActivePerspective();
part.selectAndReveal(iFile)
```

### 查找指定视图

```java
//VIEW_ID org.eclipse.jdt.ui.PackageExplorer
IWorkbenchWindow window= PlatformUI.getWorkbench().getActiveWorkbenchWindow();
window.getActivePage().findView(VIEW_ID);
if (view instanceof PackageExplorerPart){

}
```

### 定位 java 项目

```java
IProject project;

PackageExplorerPart part = PackageExplorerPart.getFromActivePerspective();
TreeViewer treeViewer = part.getTreeViewer();
Control control = treeViewer.getControl();
JavaModel javaModel = (JavaModel) control.getData();
// 具体某个项目
JavaProject javaProject = javaModel.getJavaProject(project.getName());

IFolder folder = project.getFolder("src/java/main")
// 源码根目录
IPackageFragmentRoot sourceFolder = javaProject.getPackageFragmentRoot(folder);



// 最简单的方式为
JavaCore.create(project);
JavaCore.create(javaProject.getPackageFragmentRoot(folder));

```

### log4j

```java
// eclipse的安装根目录下添加log4j.properties文件
BasicConfigurator.configure();
String log4jConfPathBase = Platform
		.getInstallLocation()
		.getURL()
		.getPath()
		.substring(
				1,
				Platform.getInstallLocation().getURL().getPath()
						.length() - 1);
String log4jConfPath = log4jConfPathBase + "/log4j.properties";
PropertyConfigurator.configure(log4jConfPath);
```

```properties
log4j.debug=true

# For the general syntax of property based configuration files see the
# documentation of org.apache.log4j.PropertyConfigurator.
log4j.rootLogger=debug, console

log4j.logger.com.avaya.sce=debug, console
log4j.additivity.com.avaya.sce=false


# Appender console is set to be a ConsoleAppender which outputs to System.out.
log4j.appender.console=org.apache.log4j.ConsoleAppender
log4j.appender.console.layout=org.apache.log4j.PatternLayout
# 可以直接点击到源码的打印格式
log4j.appender.console.layout.ConversionPattern=%d{yyyy-MM-dd HH:mm:ss} %-5p %c.%M(%c{1}.java:%L) - %m%n



```

### 源码对应的插件

eclipse 插件 依赖其他插件时，可以引入其源码包

例如

![[Pasted image 20220704211213.png|left|400]]

当找不到相关插件时，需要安装，安装时可以将其source也一同安装，这样就有了源码

| extension         | plugin          | site                                                                      |
| ----------------- | --------------- | ------------------------------------------------------------------------- |
| `org.eclipse.gef` | `GEF (MVC) SDK` | `https://download.eclipse.org/tools/gef/classic/releases/latest/plugins/` |

### 常见错误

`plugin.xml` 中配置了 `Bundle-ActivationPolicy: lazy` ，会影响 引入 `*.source.jar` ，造成无法启动插件

```log
org.osgi.framework.BundleException: Could not resolve module: io.leaderli.visual.editor [491]
  Unresolved requirement: Require-Bundle: org.eclipse.ltk.core.refactoring.source; 
```

### 弹窗

notifaction 错误信息

```java
                                MessageDialog.openError(LiFlowPlugin.getStandardDisplay().getActiveShell(), "fuck", "fuck");

```


### 在problem视图创建错误提醒

[[eclipse-plugin-develop-tutorial-setup#新增扩展点]] ， 其中id会加上插件的唯一编号前缀


```xml
<extension
	  id="li_flow_marker"
	  name="li flow marker"
	  point="org.eclipse.core.resources.markers">
   <persistent
		 value="true">
   </persistent>
   <super
		 type="org.eclipse.core.resources.problemmarker">
   </super>
</extension>
```


新增提示

```java
public static IMarker createMarker(IResource resource, int severity, String message, String location) {
	try {
		final IMarker marker = resource.createMarker(Leaderli.FLOW_MARKER);
		marker.setAttribute("location", location);
		marker.setAttribute("message", message);
		marker.setAttribute("severity", severity);
		return marker;
	} catch (CoreException e) {
		LogUtil.logError(e);

	}
	return null;

}
```


提示中定位节点，需要继承`IGotoMarker`， 省略大部分代码

```java
public class FlowEditor extends BaseGraphicalEditorWithFlyoutPalette implements IGotoMarker {

	/**
	 * 
	 * 根据错误标记定位节点
	 * 
	 * @see
	 */
	@Override
	public void gotoMarker(IMarker marker) {
		String name = marker.getAttribute("location", null);
		selectFlowObject(name);
	}
	
	/**
	 * 选择节点
	 * 
	 */
	public EditPart selectFlowObject(String name) {
		FlowDiagram flowDiagram = (FlowDiagram) getGraphicalViewer().getContents().getModel();
	
		return Lino.of(flowDiagram.getFlowNodeByName(name))
				.map(FlowNode::getEditPart)
				.ifPresent(editPart -> {
					GraphicalViewer viewer = getGraphicalViewer();
					viewer.setSelection(new StructuredSelection(editPart));
					viewer.reveal(editPart);
				})
				.get();
	}
}
```

