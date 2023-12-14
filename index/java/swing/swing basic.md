---
tags:
  - swing/swing_basic
date updated: 2023-10-07 00:27
---

### setDisplayedMnemonic

助记键是一种用于快速访问组件的功能的键盘快捷方式。当设置了显示助记键后，用户可以通过按下特定的键组合来激活或获取焦点到该组件，而无需使用鼠标点击。

```java
import javax.swing.*;

public class Example {
    public static void main(String[] args) {
        JButton button = new JButton("Save");
        button.setDisplayedMnemonic('S');

        // 在标签中显示助记键的下划线
        button.setDisplayedMnemonicIndex(0);

        // 将按钮添加到容器中并显示窗口...
    }
}
```

在上面的示例中，我们创建了一个名为 "Save" 的按钮，并使用 `.setDisplayedMnemonic` 方法将助记键设置为 'S'。然后，使用 `.setDisplayedMnemonicIndex` 方法将标签中助记键的下划线位置设置为第一个字符。

在运行时，按钮的标签将显示为 "Save"，并且 'S' 的下划线将用于指示助记键。用户可以按下 "Alt + S"（或与助记键相对应的键）来激活按钮。
