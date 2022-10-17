---
aliases: idea
tags:
  - 软件/intellij_idea
date updated: 2022-10-07 13:54
---

## 设置

通过插件在git上共享配置，本地的git仓库在

`~/Library/Application Support/JetBrains/IntelliJIdea2022.2/settingsRepository/repository`


## 插件

`editorconfig` 提供代码规范的一些配置，可以多个ide公用

## 快捷键

![[cheatsheet#idea]]

## 调试debug

IDEA 开发 web 项目时，建议使用 `debug` 启动模式，这样可以随时打断点调试项目

### 断点类型

1. 行断点
2. 方法断点，可直接断点到接口上，会自动找到其实现类，断点标记为一个菱形![[Pasted image 20221007135132.png]]
3. 属性断点，小眼睛标记，可设置断点的触发类型：修改或访问

### 断点设置

1. 使用异常类型断点，在抛出异常时快速进入报错点

2. 断点设置 `condition`，仅当满足条件时触发断点

3. 断点可设置依赖关系，仅在前置断点触发后再触发

4. 使用 `watches` 监听属性的变化

5. `variables` 直接修改属性值，进行调试

6. 指定线程下触发断点

### 一下断点操作

1. `evaluate Expression` 可编写代码进行测试

2. 移动到下个断点

3. 移动到光标位置

4. option + 左键 查看变量

[测试左移-快速玩转Debug - 掘金](https://juejin.cn/post/7143932872854863902)

## 输入

多尝试用自定义模板  [官方自定义模板内容函数](https://www.jetbrains.com/help/idea/template-variables.html)

## gradle

`gradle`  编译特别慢，需要在  `idea` 设置中设置 `HTTP Proxy`

## 快捷键

### paster form history

`idea`记录了最近复制过(`⌘c`)的文本

### recent location

最近访问的路径`⌘⇧e`

### 最小化工具窗口

`⇧⌘F12`

### 跳转源码

`jump to source` 快捷键为 `⎋(esc)` 或 `⌘+↓`

### 回到 Project 视图源码处

`select in project view`默认没有快捷键

### 自动分屏到右边

`move right`

### 在分屏中切换

`⌥tab`

### 切换 tab

`switcher` 快捷键为`⌃⇥`

`⇧⌘[`上个 tab
`⇧⌘]`下个 tab

### debug 模式下,开启变量提示

`show values inline`

### 当前行行数高亮

`line number on caret row`

### Hippie completion

自动输入前面或后面的单词`⌥/` `⌥⇧/`

### Smart Type

智能补全，比如说提示使用何种 `lambda` `⇧ space`

### 自动补全根据使用频率

`sort suggestions alphabetically`

### quick Definitions

弹出窗口快速查看代码`⌥q`

### quick documentation

弹出窗口快速查看文档`⌥F1`

### adjust code style setting

选中代码后，使用可以查看到选中代码所使用的格式选项，可以去调整它，`⌥⏎`

## coverage

测试覆盖率

可以针对所有类运行 coverage，会出一个报告，显示测试的覆盖范围

![[Pasted image 20220721062019.png|left|600]]

我们可以看到测试覆盖类和函数是 100% ，但是line 没有，我们找到具体类，可以看左边的颜色提示，红色部分即表示 junit 中测试范围未执行到此行

![[Pasted image 20220721062139.png|left|400]]

## 为报错文件设置提醒色

`File Color`

## postfix complete

![[Pasted image 20220922105948.png]]

![[Pasted image 20220922110014.png]]

## live templates

`ifn`快速判断当前行数变量是否为 null

```java
if (var == null) {

}
```

自定义`live templates`

```java
@org.junit.Test  
public void test$START$() {  
    $END$  
}
```

指定其生效的范围，触发的关键字为`test`，默认`tab`触发补全

![[Pasted image 20210921012204.png|600]]

[Live template variables | IntelliJ IDEA](https://www.jetbrains.com/help/idea/template-variables.html#example_live_template_variables)

## 使用 favorite

## custome live template

可以选中代码后，抽取为`template`

## keymap abbrevation

添加快捷方式的缩写，方便使用`find action`查找

## breadcrumbs

使用面包屑导航显示代码类，方法

## 隐藏目录

`Editor`|`File Types`|`Ignore files and folders`

## 相关问题

> objc[1474]: Class JavaLaunchHelper is implemented in both /Library/Java/JavaVirtualMachines/jdk1.8.0_144.jdk/Contents/Home/bin/java (0x10b59a4c0) and /Library/Java/JavaVirtualMachines/jdk1.8.0_144.jdk/Contents/Home/jre/lib/libinstrument.dylib (0x10b6764e0). One of the two will be used. Which one is undefined.

`IDEA`菜单`Help`>>`Edit Custom Properties`
在打开的`idea.properties`里加上

```properties
idea.no.launcher=true
```

## 文件打开方式

idea 若使用某种方式打开文件后，`file type`中的编辑器类型下，会有相关联的文件后缀。

## 标记当前段落不格式化

code style|enable formatter markers in comments

## springboot yml 无自动提示

项目右键点 Modules，然后点 + 号看是否无 spring 选项

## junit test 一直 build

junit 跑的比较慢的时候

关闭maven的 delegate IDE build/run action to maven

## junit 输出slf4j日志告警

> SLF4J: Failed to load class "org.slf4j.impl.StaticLoggerBinder".

SLF4J: Defaulting to no-operation (NOP) logger implementation
SLF4J: See <http://www.slf4j.org/codes.html#StaticLoggerBinder> for further details.

增加maven配置

```xml
<dependency>
	<groupId>org.slf4j</groupId>
	<artifactId>slf4j-api</artifactId>
</dependency>
<dependency>
	<groupId>org.slf4j</groupId>
	<artifactId>slf4j-simple</artifactId>
</dependency>
```

## typescript不检测代码类型

![[Pasted image 20211223185044.png|400]]

## commit 时自动执行格式化等操作

![[Pasted image 20220829085559.png]]

![[Pasted image 20220902205333.png]]

## 参考文档

激活 破解

[Jetbrains 试用期重置 - 今日 | 有悟 | 有物](https://youwu.today/blog/jetbrains-evaluate-reset/)

[临时激活码](https://3.jetbra.in)

长时间未登陆解决办法

删除 `eval` 文件

- windows：`%userprofile%/AppData/Roaming/JetBrains/产品名版本号`
- macos: `~/Library/ApplicationSupport/JetBrains/产品名版本号`
