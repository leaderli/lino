---
aliases: xml
tags:
  - protocol/xml
  - java
  - linux
date updated: 2022-07-07 06:43
---

## dom4j

```xml
<dependency>
      <groupId>jaxen</groupId>
      <artifactId>jaxen</artifactId>
      <version>1.2.0</version>
</dependency>
<dependency>
    <groupId>dom4j</groupId>
    <artifactId>dom4j</artifactId>
    <version>1.6.1</version>
</dependency>
```

### SAXReader

`feature`属性，禁止校验`dtd`文件

使用 dom4j 解析 xml

```java
import com.sun.org.apache.xerces.internal.impl.Constants;

/**
 * 在读取文件时，去掉dtd的验证，可以缩短运行时间
 */
public static SAXReader getSAXReader(){
    SAXReader saxReader = new SAXReader(DOMDocumentFactory.getInstance(),false);
     try {
         // saxReader.setFeature(Constants.XERCES_FEATURE_PREFIX + Constants.LOAD_EXTERNAL_DTD_FEATURE, false);  //设置不需要校验头文件
         saxReader.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
     } catch (Exception e) {
         e.printStackTrace();
     }
     return saxReader;
 }
```

读取`String`为`DOMDocument`

```java
String xml = "...xml...";
DOMDocument document = (DOMDocument) getSAXReader().read(new StringReader(xml));
```

### DOMElement

顺序读取文本内容和子元素

```java
DOMElement root = doc.getRootElement();
for(Object element : root.content()){
    if( o instanceof DOMElement){
        System.out.println(((DOMElement)o).asXML())
    }
    if( o instanceof DOMText){
        System.out.println(((DOMText)o).getText().trim())
    }
}
```

### 格式化输出

```java
//document DOMDocument 
StringWriter writer = new StringWriter();  
XMLWriter xmlWriter = new XMLWriter(writer, OutputFormat.createPrettyPrint());  
xmlWriter.write(document);  
xmlWriter.close();  
//输出的为格式化后的文本
System.out.println(writer.toString());
```

## XPATH

### dom4j

```java
doc.selectObject("substring(/root/name/text(),2)");

//选择所有有id属性元素(List<DOMAttribute>)，当属性仅为一个时，其返回值不为List
doc.selectObject("/root/@id")
//获取第一个匹配标签的id属性的值
doc.selectObject("string(/root/@id)")

//搜索当前dom的子节点
dom.selectNodes("child/name/text()")
```

### XPATH 一些语法

- `para` 选择所有名为 para 的子节点
- `*` 选择所有子节点
- `text()`选择所有子节点文本
- `@name` 选择所有名为 name 的节点属性
- `@*` 选择所有节点属性
- `para[1]` 选择名为 para 的第一个节点
- `para[fn:last()]` 选择名为 para 的最后一个节点
- `//` 从根节点查找所有节点
- `..` 选择父节点
- `.` 选择当前节点
- `and`,`or`操作符
- `"child::*` 获取当前节点子节点

一些示例

```shell

chapter[@title="one"]

book/(chapter|appendix)/section

employee[@secretary and @assistant]

chapter[@title="one" or @title="two" and  author="li"]
```

### 获取`tomcat`运行端口

```java
//通过classpath定位tomcat配置文件conf/server.xml，使用xpath去解析
File serverXml = new File("/Users/li/java/apache-tomcat-7.0.70/conf/server.xml");
DocumentBuilderFactory domFactory = DocumentBuilderFactory.newInstance();
domFactory.setNamespaceAware(true); // never forget this!
DocumentBuilder builder = domFactory.newDocumentBuilder();
Document doc = builder.parse(serverXml);
XPathFactory factory = XPathFactory.newInstance();
XPath xpath = factory.newXPath();
XPathExpression expr = xpath.compile("/Server/Service[@name='Catalina']/Connector[starts-with(@protocol,'HTTP')]/@port[1]");
String result = (String) expr.evaluate(doc, XPathConstants.STRING);
port = result != null && result.length() > 0 ? Integer.valueOf(result) : null;
```

### 命令空间

当 xml 报文中，含有`xmlns='xxx'`的命名空间时，会造成 xpath 查找不到指定的节点。可以将所有命令空间的属性替换掉。

### 示例代码

```java
DOMElement doc;

doc.attributeValue("id"); //不存在时值为null
doc.attributeValue("id","1"); //不存在时使用默认值1
doc.getAttribute("id"); //不存在时值为空字符串
```

### 命名规范

XML 元素必须遵循以下命名规则：

- 名称可以包含字母、数字、下划线以及其他的字符
- 名称不能以数字或者标点符号开始
- 名称不能以字母 xml（或者 XML、Xml 等等）开始
- 名称不能包含空格

### 注意事项

```java
DOMElement element;

element.getTextTrim();//会将字符串中间的空格合并为一个
```

### 参考文档

[xpath 语法详细规则](https://www.w3.org/TR/xpath-30/)

## xmllint

linux中处理xml文件的类库

-- shell 以目录的方式访问xml节点，可以使用cd，ls等
-- xpath 以xpath表达式选择节点

对于有`xmlns`的xml文件，可以做如下处理

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>2.2.1.RELEASE</version>
    <relativePath/> <!-- lookup parent from repository -->
  </parent>
  <groupId>com.leaderli</groupId>
  <artifactId>demo</artifactId>
  <version>0.0.1-SNAPSHOT</version>
  <name>demo</name>
  <description>Demo project for Spring Boot</description>
</project>

```

这样就可以移除xmlns相关的标签，然后就可以做其他处理

```shell
xmllint --format pom.xml|sed 's/xmlns=".*"//g'
xmllint --format pom.xml|sed 's/xmlns=".*"//g'|xmllint --xpath "//version" - 
```
