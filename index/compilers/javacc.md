---
tags:
  - compilers/antlr
date updated: 2024-03-17 17:33
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

   跳过单行注释

   ```java
   SKIP:{
   	<SINGLE_LINE_COMMENT: "#" (~["\n","\r"]*)("\n"|"\r"|"\r\n")>
   }
   ```

2. `MORE` 将当前匹配的字符用于下一个词法
   ```java
   // 将 Apple is my name 做为一个DONE 的token来匹配
   MORE : {  
       <NAME: ["A"-"Z"](["a"-"z"])+>  
   }  
   TOKEN : {  
       <DONE: " is my name">  
   }
   ```

3. `TOKEN` 将匹配的字符用于token，用于解析

4. `SPECIAL_TOKEN` 将匹配的字符存储于下一个token的属性specialToken中

   ```java
   PARSER_BEGIN(SpecialA)  
   package io.leaderli.c1;  
   import java.io.*;  
   public class SpecialA{  
       public static void main(String[] args) {  
     
           String input = "aaab";  
           SimpleCharStream scs= new  SimpleCharStream(new StringReader(input));  
           Token t = SpecialATokenManager.getNextToken();        System.out.println("Found token: "+t.image);  
           while (t.specialToken!=null){  
               System.out.println("special token:"+t.specialToken.image);  
               t = t.specialToken;        }    }  
    }  
   PARSER_END(SpecialA)  
     
   SPECIAL_TOKEN : {  
   <A:"a">  
   }  
   TOKEN : {  
   <B:"b">  
   }
   ```

   ```txt

   Found token: b
   special token:a
   special token:a
   special token:a
   ```

### 定义多个token

```java
TOKEN: {
	<HELLO: "hello">
	|<DIGIT: ["0"-"9"]>
	|<WORLD: "world">
}
```

### 私有token

仅用于其他token的组成

```java
TOKEN: {
	<ID: <LETTER><DIGIT><LETTER>>
	|<#LETTER: ["a"-"z""A"-"Z"]>
	|<#DIGIT: ["0"-"9"] >
}
```

### 支持的正则

基本类似其他正则表达式，取反有些不一样

- "a"
- "a"|"b"
- ["a","b","c"]
- ["a"-"z"]
- ~["a"] 取反
- ("a"){4}
- ("a"){2,4}
- ("a")+
- ("a")?
- ("a")*

## 词法

### 自定义词法处理

一些特殊token正则表达式难以表示，例如` 数字:数字长度的字符  ` `2:hi5:abcef`，

```java
PARSER_BEGIN(RunLengthEncoding)
package io.leaderli.c1;
import java.io.*;
public class RunLengthEncoding{
    public static void main(String[] args) {

        String input = "2:hi5:abcde";
        SimpleCharStream scs= new  SimpleCharStream(new StringReader(input));
        Token t = RunLengthEncodingTokenManager.getNextToken();
        while(t.kind!=EOF){
            System.out.println("found token:"+t.image);
            t = RunLengthEncodingTokenManager.getNextToken();
        }
    }
 }
PARSER_END(RunLengthEncoding)

TOKEN : {
<RL_STR: ["0"-"9"]":">
    {
      int length = Integer.parseInt(matchedToken.image.substring(0,1));
      try{
        for(int i=0;i<length;i++){
           matchedToken.image = matchedToken.image + input_stream.readChar();
        }
      }catch(IOException ioe){
        ioe.printStackTrace();
      }
    }
}
```

## 参考

- [JavaCC](https://javacc.github.io/javacc/)
- [JavaCC - tutorials](https://javacc.github.io/javacc/tutorials/)
- [JavaCC - 博客园](https://www.cnblogs.com/suhaha/tag/JavaCC/)
- [[Generating Parsers with JavaCC (Tom Copeland) (Z-Library).pdf]]
