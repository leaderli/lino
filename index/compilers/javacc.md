---
tags:
  - compilers/antlr
date updated: 2024-03-15 22:52
---

默认使用 [[LL(1)]] 文法，使用 [[EBNF]] 来描述语法

## 快速示例

用来匹配字母`a`

```java
options {  
}  
  
PARSER_BEGIN(SimpleParser)  
import java.io.StringReader;  
public class SimpleParser {  
    public static void main(String[] args){  
        String input = "a";  
        SimpleParser parser = new  SimpleParser(new StringReader(input));  
        parser.A();    }  
}  
PARSER_END(SimpleParser)  
TOKEN : {  
    <A: "a">  
}  
  
void A():{}  
{  
    <A> {System.out.println("Found A");}  
}
```

pom 插件

```xml
<plugin>  
    <groupId>org.codehaus.mojo</groupId>  
    <artifactId>javacc-maven-plugin</artifactId>  
    <version>3.0.1</version>  
    <executions>  
        <execution>  
            <id>javacc</id>  
            <goals>  
                <goal>javacc</goal>  
            </goals>  
            <configuration>  
                <includes>  
                    <include>**/*.jj</include>  
                </includes>  
            </configuration>  
        </execution>  
    </executions>  
</plugin>
```

执行后则会在target目录下生成相应的java文件

```shell
$ mvn clean  generate-sources 

$ ls
ParseException.java    SimpleParserConstants.java     TokenMgrError.java
SimpleCharStream.java  SimpleParserTokenManager.java
SimpleParser.java      Token.java

```

编译后执行

```shell
$ java SimpleParser
Found A
```

其生成的parser类部分如下：其内容根据定义的jj文件而来。

```java
public class SimpleParser implements SimpleParserConstants {  
    public static void main(String[] args) throws ParseException {  
        String input = "a";  
        SimpleParser parser = new SimpleParser(new StringReader(input));  
        parser.A();  
    }  
  
    static final public void A() throws ParseException {  
        jj_consume_token(A);  
        System.out.println("Found A");  
    }
...
}
```

会生成一个Constants 文件来表示所有TOKEN和词法状态

```java
public interface SimpleParserConstants {  
  
  /** 默认的文件结束TOKEN. */  
  int EOF = 0;  
  /** TOKEN A. */  
  int A = 1;  
  
  /** 词法状态. */  
  int DEFAULT = 0;  
  
  /** 定义的所有token序列的字符串表现形式，角标与上面的TOKEN定义相同. */  
  String[] tokenImage = {  
    "<EOF>",  
    "\"a\"",  
  };  
  
}
```

## 语法结构

由四个部分组成

- options javaCC的设置
- PARSER_BEGIN PARSER_END 定义解析类
- 词法定义，`SKIP`,`MORE`,`TOKEN`,`SPECIAL_TOKEN`
- 语法定义，定义token的顺序

## token

javaCC 由一组词法来构成，每个词法由一组正则表达式构成，默认的词法为`DEFAULT`。

词法有四种类型

1. `SKIP` 跳过匹配的字符，例如换行、注释
2. `MORE` 将当前匹配的字符用于下一个词法
3. `TOKEN` 将匹配的字符用于token，用于解析
4. `SPECIAL_TOKEN` 匹配特殊的token，不参与解析

## 支持的正则

基本类似其他正则表达式，取反有些不一样

- "a"
- ["a","b","c"]
- ["a"-"z"]
- ~["a"] 取反
- ("a"){4}
- ("a"){2,4}
- ("a")+
- ("a")?
- ("a")*

## 参考

- [JavaCC](https://javacc.github.io/javacc/)
- [JavaCC - tutorials](https://javacc.github.io/javacc/tutorials/)
- [JavaCC - 博客园](https://www.cnblogs.com/suhaha/tag/JavaCC/)
- [[Generating Parsers with JavaCC (Tom Copeland) (Z-Library).pdf]]
