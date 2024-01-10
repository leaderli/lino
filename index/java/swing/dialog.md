---
tags:
  - swing/dialog
date updated: 2023-11-19 22:30
---

## date updated: 2023-11-12 22:39

下拉选择框

```java
package io.leaderli.demo.swing;  
  
import io.leaderli.litool.core.meta.Lira;  
import io.leaderli.litool.core.text.StringUtils;  
import io.leaderli.litool.core.util.RandomUtil;  
  
import javax.swing.*;  
import javax.swing.event.DocumentEvent;  
import javax.swing.event.DocumentListener;  
import java.awt.*;  
import java.util.Comparator;  
  
class FilterDialog extends JDialog {  
    private JComboBox<String> comboBox;  
    private JTextField textField;  
    private final String[] options;  
  
    public FilterDialog(Frame owner, String title, String[] options) {  
        super(owner, title, true);  
        this.options = options;  
  
        // 创建下拉选择框  
        comboBox = new JComboBox<>(options);  
  
        // 创建文本输入框  
        textField = new JTextField(20);  
        textField.getDocument().addDocumentListener(new DocumentListener() {  
            @Override  
            public void insertUpdate(DocumentEvent e) {  
                filterOptions();  
            }  
  
            @Override  
            public void removeUpdate(DocumentEvent e) {  
                filterOptions();  
            }  
  
            @Override  
            public void changedUpdate(DocumentEvent e) {  
                filterOptions();  
            }  
        });  
  
  
        // 创建布局并添加组件  
        JPanel panel = new JPanel(new GridLayout(2, 1));  
        panel.add(textField);  
        panel.add(comboBox);  
  
        // 设置对话框的内容面板  
        setContentPane(panel);  
  
        // 设置对话框大小和位置  
        setSize(400, 100);  
        setLocationRelativeTo(owner);  
    }  
  
    private void filterOptions() {  
  
        String search = textField.getText();  
  
  
        DefaultComboBoxModel<String> model = searchOptions(search);  
        comboBox.setModel(model);  
        if (model.getSize() == 1) {  
            comboBox.setSelectedIndex(0);  
        } else {  
            comboBox.setSelectedIndex(-1);  
        }  
    }  
  
    private DefaultComboBoxModel<String> searchOptions(String text) {  
        DefaultComboBoxModel<String> model = new DefaultComboBoxModel<>();  
        for (String option : Lira.of(this.options)  
                .tuple(o -> StringUtils.complete(o, text))  
                .filter(o -> o._2 >= 0)  
                .sorted(Comparator.comparingInt(o -> o._2))  
                .map(o -> o._1)) {  
            model.addElement(option);  
        }  
        return model;  
    }  
  
  
    public static void main(String[] args) {  
        String[] options = new String[20];  
  
        for (int i = 0; i < options.length; i++) {  
            options[i] = RandomUtil.randomString(20);  
        }  
  
        // 创建主窗口  
        JFrame frame = new JFrame("Main Window");  
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);  
        // 创建筛选对话框并显示  
        FilterDialog dialog = new FilterDialog(frame, "Filter Options", options);  
        dialog.setVisible(true);  
        // 关闭主窗口  
        frame.dispose();  
    }  
}
```

## 快速构建选择框，输入框

方法的返回值即为交互的输入结果

```java
JOptionPane.showInputDialog(null, "Please enter your name", "Example 2",
JOptionPane.QUESTION_MESSAGE, null, null, "Shannon");
```

![[Pasted image 20231119222454.png]]

```java
JOptionPane.showInputDialog(null, "Please choose a name", "Example 1",
JOptionPane.QUESTION_MESSAGE, null, new Object[] {
"Amanda", "Colin", "Don", "Fred", "Gordon", "Janet", "Jay", "Joe",
"Judie", "Kerstin", "Lotus", "Maciek", "Mark", "Mike", "Mulhern",
"Oliver", "Peter", "Quaxo", "Rita", "Sandro", "Tim", "Will"}, "Joe");
```

![[Pasted image 20231119222448.png]]
