---
tags:
  - java/框架/asciitable
date updated: 2022-04-15 14:52
---

一个用于输出ASCII表格的字符串格式化工具类

```xml
<dependency>
    <groupId>de.vandermeer</groupId>
    <artifactId>asciitable</artifactId>
    <version>0.3.2</version>
</dependency>
```

```java
AsciiTable at = new AsciiTable();  
at.addRule();  
at.addRow("row 1 col 1", "row 1 col 2");  
at.addRule();  
at.addRow("row 2 col 1", "row 2 col 2");  
at.addRule();  
String rend = at.render();  
System.out.println(rend);
```

```shell
┌───────────────────────────────────────┬──────────────────────────────────────┐
│row 1 col 1                            │row 1 col 2                           │
├───────────────────────────────────────┼──────────────────────────────────────┤
│row 2 col 1                            │row 2 col 2                           │
└───────────────────────────────────────┴──────────────────────────────────────┘
```

## 参考文档

 [官方有示例](http://www.vandermeer.de/projects/skb/java/asciitable/examples.html)
