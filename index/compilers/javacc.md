---
tags:
  - compilers/antlr
date updated: 2024-04-05 14:30
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

## 编译参数

```shell
The boolean valued options are:

    BUILD_PARSER                    (default : true)
    BUILD_TOKEN_MANAGER             (default : true)
    CACHE_TOKENS                    (default : false)
    COMMON_TOKEN_ACTION             (default : false)
    DEBUG_LOOKAHEAD                 (default : false)
    DEBUG_PARSER                    (default : false)
    DEBUG_TOKEN_MANAGER             (default : false)
    ERROR_REPORTING                 (default : true)
    FORCE_LA_CHECK                  (default : false)
    GENERATE_ANNOTATIONS            (default : false)
    GENERATE_BOILERPLATE            (default : true)
    GENERATE_CHAINED_EXCEPTION      (default : false)
    GENERATE_GENERICS               (default : false)
    GENERATE_STRING_BUILDER         (default : false)
    IGNORE_CASE                     (default : false)
    JAVA_UNICODE_ESCAPE             (default : false)
    KEEP_LINE_COLUMN                (default : true)
    NO_DFA                          (default : false)
    SANITY_CHECK                    (default : true)
    STATIC                          (default : true)
    SUPPORT_CLASS_VISIBILITY_PUBLIC (default : true)
    TOKEN_MANAGER_USES_PARSER       (default : false)
    UNICODE_INPUT                   (default : false)
    USER_CHAR_STREAM                (default : false)
    USER_TOKEN_MANAGER              (default : false)

The string valued options are:

    GRAMMAR_ENCODING             (default : <<empty>>)
    JAVA_TEMPLATE_TYPE           (default : classic)
    JDK_VERSION                  (default : 1.5)
    OUTPUT_DIRECTORY             (default : .)
    PARSER_CODE_GENERATOR        (default : <<empty>>)
    PARSER_SUPER_CLASS
    TOKEN_EXTENDS                (default : <<empty>>)
    TOKEN_FACTORY                (default : <<empty>>)
    TOKEN_INCLUDE                (default : <<empty>>)
    TOKEN_MANAGER_CODE_GENERATOR (default : <<empty>>)
    TOKEN_MANAGER_INCLUDE        (default : <<empty>>)
    TOKEN_MANAGER_SUPER_CLASS
    TOKEN_SUPER_CLASS
```

[JavaCC | The most popular parser generator for use with Java applications.](https://javacc.github.io/javacc/documentation/grammar.html#option-binding)

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

示例

```java
TOKEN : {  
    <GREETING: (["a"-"z"])+>
}
```

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

### 词法状态

词法状态是TOKEN、SKIP、MORE 或 SPECIAL TOKEN的控制器。当处于特定的词法状态时，JavaCC 将只使用该状态下定义的正则表达式。

词法的状态定义示例如下：

```java
PARSER_BEGIN(Demo)  
package io.leaderli.c1;  
import java.io.*;  
public class Demo{  
    public static void main(String[] args) {  
  
        String input = "redbluegreendefault";  
        SimpleCharStream scs= new  SimpleCharStream(new StringReader(input));  
        Token t = DemoTokenManager.getNextToken();        while(t.kind!=EOF){  
            t = DemoTokenManager.getNextToken();        }    }  
 }  
PARSER_END(Demo)  
  
  
TOKEN : {  
    <RED: "red">{System.out.println("in red");}:IN_RED  
}  
<IN_RED>  
TOKEN : {  
    <BLUE: "blue">{System.out.println("in blue");}:IN_BLUE  
}  
<IN_BLUE>  
TOKEN : {  
    <GREEN: "green">{System.out.println("in green");}:IN_GREEN  
}  
<IN_GREEN>  
TOKEN : {  
    <DONE: "default">{System.out.println("in default");}: DEFAULT  
}
```

为多个状态定义同一个语法，例如 SKIP

```java
<DEFAULT,IN_RED,IN_BLUE,IN_GREEN>  
SKIP : {  
" "  
}
```

```java
<*>  
SKIP : {  
" "  
}
```

### 非默认状态

一般情况下，使用`DEFAULT`作为初始状态，可以定义非初始状态

```java
options {  
    STATIC = false;  
    JDK_VERSION = "1.8";  
}  
PARSER_BEGIN(Demo)  
package io.leaderli.c1;  
import java.io.*;  
public class Demo{  
    public static void main(String[] args) {  
  
        String input = "redbluegreendefault---hello";  
        SimpleCharStream scs= new  SimpleCharStream(new StringReader(input));  
       DemoTokenManager tmr = new DemoTokenManager(scs,IN_HEADER);  
        while( tmr.getNextToken().kind!=EOF){}  
    }  
 }  
PARSER_END(Demo)  
  
<IN_HEADER>  
MORE : {  
    <~[]>  
}  
<IN_HEADER>  
SPECIAL_TOKEN : {  
    <HEADER_NOTES: "---"> : DEFAULT  
}  
  
<DEFAULT>  
TOKEN : {  
    <GREETING: (["a"-"z"])+>{  
        System.out.println("get:"+matchedToken.specialToken.image);  
    }  
}
```

编译后运行

```txt
get:redbluegreendefault---
```

## 参考

- [JavaCC](https://javacc.github.io/javacc/)
- [JavaCC - tutorials](https://javacc.github.io/javacc/tutorials/)
- [JavaCC - 博客园](https://www.cnblogs.com/suhaha/tag/JavaCC/)
- [[Generating Parsers with JavaCC (Tom Copeland) (Z-Library).pdf]]
