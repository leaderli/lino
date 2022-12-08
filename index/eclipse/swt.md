---
tags:
  - eclipse/swt
date updated: 2022-04-05 22:56
---

## 基础架构

![[Pasted image 20221208163302.png]]
## shell

一个提供了最小化，最大化，关闭按钮的基本窗口

```java
package com.swt;

import org.eclipse.swt.SWT;
import org.eclipse.swt.widgets.Display;
import org.eclipse.swt.widgets.Shell;
import org.eclipse.swt.widgets.Text;

public class HelloSWT {
	public static void main(String[] args) {
		Display display = new Display();
		Shell shell = new Shell(display);
		Text helloText = new Text(shell, SWT.CENTER);
		helloText.setText("Hello SWT!");
		helloText.pack();
		shell.pack();
		shell.open();
		while (!shell.isDisposed()) {

			if (!display.readAndDispatch())
				display.sleep();
		}
		display.dispose();
	}
}
```

![[Pasted image 20221208163538.png]]

