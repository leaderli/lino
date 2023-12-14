---
tags:
  - eclipse/eclipse-plugin-extension
date updated: 2022-07-04 22:46
---


##  org.eclipse.core.expressions.propertyTesters

用于提供自定义表达式语法的

```xml
<extension
	  point="org.eclipse.core.expressions.propertyTesters">
   <propertyTester
		 class="io.leaderli.visual.editor.expression.FlowFileTester"
		 id="io.leaderli.visual.editor.expression.FlowFileTester"
		 namespace="io.leaderli.visual.editor"
		 properties="extension"
		 type="org.eclipse.core.resources.IFile">
   </propertyTester>
</extension>
```

- namespace 是表达式命名空间，和property组合成唯一表达式
- properties 当前自定义表达式的可选property集合
- type 可执行该表达式的类型


```java
package io.leaderli.visual.editor.expression;

import org.eclipse.core.expressions.PropertyTester;
import org.eclipse.core.resources.IFile;

import io.leaderli.visual.editor.util.PluginUtil;

public class FlowFileTester extends PropertyTester {

    @Override
    public boolean test(Object receiver, String property, Object[] args, Object expectedValue) {
        IFile file = (IFile) receiver;

        if(!PluginUtil.isFlowProject(file.getProject())) {
            
            return false;
        }
        if (property.equals("extension")) {
            return file.getFileExtension().equals(expectedValue);
        }

        return false;
    }

}
```

用法，表示只在`.li`扩展名的文件上执行move操作

```xml
<extension
		point="org.eclipse.ltk.core.refactoring.moveParticipants">
	<moveParticipant
			class="io.leaderli.visual.editor.refactor.FlowMoveParticipant"
			id="io.leaderli.visual.editor.refactor.FlowMoveParticipant"
			name="FlowMoveParticipant">
		<enablement>
			<with variable="element">
					<instanceof value="org.eclipse.core.resources.IFile"/>
					<test property="io.leaderli.visual.editor.extension" value="li"/>
			</with>
		</enablement>
	</moveParticipant>
</extension>
```