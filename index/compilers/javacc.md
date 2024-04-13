---
tags:
  - compilers/antlr
date updated: 2024-04-10 23:02
---

默认使用 [[LL(1)]] 文法，使用 [[EBNF]] 来描述语法

# javacc

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
    <version>3.1.0</version>  
    <executions>  
        <execution>  
            <id>javacc</id>  
            <goals>  
                <goal>javacc</goal>  
            </goals>  
            <configuration>  
			    <includes>  
			        <include>*.jj</include>  
			    </includes>  
			    <sourceDirectory>src/main/resources</sourceDirectory>  
			    <packageName>io.leaderli.c1</packageName>  
			    <outputDirectory>${project.build.sourceDirectory}</outputDirectory>  
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

## javacc options

javacc的options

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

一些参数的示例

### CommonTokenAction

默认为false，设置为true时，会给某个token定义一个行为，需要在 TOKEN_MGR_DECLS 中新增方法 CommonTokenAction

```java
options {  
    STATIC = false;  
    JDK_VERSION = "1.8";  
    COMMON_TOKEN_ACTION = true;  
}  
PARSER_BEGIN(Demo)  
package io.leaderli.c1;  
import java.io.*;  
public class Demo{  
    public static void main(String[] args) {  
  
        String input = "ABCBC";  
        SimpleCharStream scs= new  SimpleCharStream(new StringReader(input));  
       DemoTokenManager tmr = new DemoTokenManager(scs);  
        while( tmr.getNextToken().kind!=EOF){}  
    }  
 }  
PARSER_END(Demo)  
TOKEN_MGR_DECLS:{  
    private void CommonTokenAction(Token matchedToken) {  
        if (matchedToken.kind != EOF) {  
            System.out.println("Found token " + matchedToken.image);  
        } else {  
            System.out.println("Found the end of file token");  
        }  
    }  
}  
  
TOKEN : {  
    <A:"A">|  
    <B:"B">|  
    <C:"C">  
}
```

编译后执行结果

```txt
Found token A
Found token B
Found token C
Found token B
Found token C
Found the end of file token
```

## 语法结构

- options javaCC的设置
- PARSER_BEGIN PARSER_END 定义解析类
- TOKEN_MGR_DECLS 定义token管理类
- 词法定义，`SKIP`,`MORE`,`TOKEN`,`SPECIAL_TOKEN`
- 语法定义，定义token的顺序

## 解析

匹配电话号码

```java
PARSER_BEGIN(DemoParser)  
package io.leaderli.c1;  
import java.io.*;  
public class DemoParser{  
    public static void main(String[] args) throws ParseException {  
  
        String input = "123-123-1234";  
        Reader reader= new StringReader(input);  
       DemoParser demo= new DemoParser(reader);  
        demo.phoneNumber();    }  
 }  
PARSER_END(DemoParser)  
  
  
TOKEN : {  
    <FOUR:(<DIGITS>){4}>  
    |<THREE:(<DIGITS>){3}>  
    |<#DIGITS:["0"-"9"]>  
}  
void phoneNumber():{}{  
    <THREE>"-"<THREE>"-"<FOUR><EOF>  
}
```

将号码返回

```java
PARSER_BEGIN(DemoParser)  
package io.leaderli.c1;  
import java.io.*;  
public class DemoParser{  
    public static void main(String[] args) throws ParseException {  
  
        String input = "123-123-1234";  
        Reader reader= new StringReader(input);  
       DemoParser demo= new DemoParser(reader);  
        System.out.println(demo.phoneNumber());    }  
 }  
PARSER_END(DemoParser)  
  
  
TOKEN : {  
    <FOUR:(<DIGITS>){4}>  
    |<THREE:(<DIGITS>){3}>  
    |<#DIGITS:["0"-"9"]>  
}  
StringBuilder phoneNumber():  
{  
StringBuilder number = new StringBuilder();  
}{  
    <THREE>{number.append(token.image);}  
    "-"<THREE>{number.append(token.image);}  
    "-"<FOUR>{number.append(token.image);}  
    <EOF>{return number;}  
}
```

### LOOKAHEAD

回朔

针对匹配 7位号码和10位号码的grammar

```java
PARSER_BEGIN(DemoParser)  
package io.leaderli.c1;  
import java.io.*;  
public class DemoParser{  
    public static void main(String[] args) throws ParseException {  
  
        String input = "123-123-1234";  
        Reader reader= new StringReader(input);  
        DemoParser demo= new DemoParser(reader);  
        demo.phone();    
    }  
 }  
PARSER_END(DemoParser)  
  
  
TOKEN : {  
    <FOUR:(<DIGITS>){4}>  
    |<THREE:(<DIGITS>){3}>  
    |<#DIGITS:["0"-"9"]>  
}  
  
void phone():{}{  
    (local() | country())<EOF>  
}  
void local():{}{  
    area() "-"<FOUR>  
}  
void country():{}{  
    area() "-"<THREE>"-"<FOUR>  
}  
  
void  area():{}{  
    <THREE>  
}
```

上面无法编译，存在冲突，可以使用最左推导（Left Factoring）来解决冲突

```java
PARSER_BEGIN(DemoParser)  
package io.leaderli.c1;  
import java.io.*;  
public class DemoParser{  
    public static void main(String[] args) throws ParseException {  
  
        String input = "123-123-1234";  
        Reader reader= new StringReader(input);  
       DemoParser demo= new DemoParser(reader);  
        demo.phone();    }  
 }  
PARSER_END(DemoParser)  
TOKEN : {  
    <FOUR:(<DIGITS>){4}>  
    |<THREE:(<DIGITS>){3}>  
    |<#DIGITS:["0"-"9"]>  
}  
void phone():{}{  
    area()"-"(local() | country())<EOF>  
}  
void local():{}{  
     <FOUR>  
}  
void country():{}{  
     <THREE>"-"<FOUR>  
}  
void  area():{}{  
    <THREE>  
}
```

也可以用回朔来解决

```java
PARSER_BEGIN(DemoParser)  
package io.leaderli.c1;  
import java.io.*;  
public class DemoParser{  
    public static void main(String[] args) throws ParseException {  
  
        String input = "123-123-1234";  
        Reader reader= new StringReader(input);  
       DemoParser demo= new DemoParser(reader);  
        demo.phone();    }  
 }  
PARSER_END(DemoParser)  
TOKEN : {  
    <FOUR:(<DIGITS>){4}>  
    |<THREE:(<DIGITS>){3}>  
    |<#DIGITS:["0"-"9"]>  
}  
void phone():{}{  
    LOOKAHEAD(3)local() {System.out.println("found local");}  
    | country(){System.out.println("found country");}<EOF>  
}  
void local():{}{  
    area()"-"<FOUR>  
}  
void country():{}{  
    area()"-"<THREE>"-"<FOUR>  
}  
void  area():{}{  
    <THREE>  
}
```

可以配置全局

```java
options:{
	LOOKAHEAD=3
}
```

回朔可以使用语义来指定

```java
PARSER_BEGIN(DemoParser)  
package io.leaderli.c1;  
import java.io.*;  
public class DemoParser{  
    public static void main(String[] args) throws ParseException {  
  
        String input = "123-123-1234";  
        Reader reader= new StringReader(input);  
       DemoParser demo= new DemoParser(reader);  
        demo.phone();    }  
 }  
PARSER_END(DemoParser)  
TOKEN : {  
    <FOUR:(<DIGITS>){4}>  
    |<THREE:(<DIGITS>){3}>  
    |<#DIGITS:["0"-"9"]>  
}  
void phone():{}{  
    LOOKAHEAD(area()"-"<FOUR>)local() {System.out.println("found local");}  
    | country(){System.out.println("found country");}<EOF>  
}  
void local():{}{  
    area()"-"<FOUR>  
}  
void country():{}{  
    area()"-"<THREE>"-"<FOUR>  
}  
void  area():{}{  
    <THREE>  
}
```

基于语义的

```java
PARSER_BEGIN(DemoParser)  
package io.leaderli.c1;  
import java.io.*;  
public class DemoParser{  
    public static void main(String[] args) throws ParseException {  
  
        String input = "223-1234";  
        Reader reader= new StringReader(input);  
        DemoParser demo= new DemoParser(reader);  
        demo.phone();    }  
 }  
PARSER_END(DemoParser)  
TOKEN : {  
    <FOUR:(<DIGITS>){4}>  
    |<THREE:(<DIGITS>){3}>  
    |<#DIGITS:["0"-"9"]>  
}  
void phone():{}{  
    LOOKAHEAD({getToken(1).image.equals("123")})  
     one() {System.out.println("found one");}  
    | two() {System.out.println("found two");}<EOF>  
}  
void one():{}{  
    area()"-"<FOUR>  
}  
void two():{}{  
    area()"-"<FOUR>  
}  
void  area():{}{  
    <THREE>  
}
```

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

### 示例

#### 匹配注释

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
  
        String input = "/*redbluegreendefault---hello*/b";  
        SimpleCharStream scs= new  SimpleCharStream(new StringReader(input));  
       DemoTokenManager tmr = new DemoTokenManager(scs);  
        while( tmr.getNextToken().kind!=EOF){}  
    }  
 }  
PARSER_END(Demo)  
MORE :{  
 "/*": IN_MULTI_LINE_COMMENT  
 }  
<IN_MULTI_LINE_COMMENT>  
MORE : {  
    <~[]>  
}  
<IN_MULTI_LINE_COMMENT>  
SPECIAL_TOKEN : {  
    <MULTI_LINE_COMMEN: "*/"> {  
            System.out.println("comment:"+matchedToken.image);  
    }: DEFAULT  
}
```

### java的string的grammar

```java
<STRING_LITERAL:  
    "\""  
     (    (~["\"","\\","\n","\r"])  
        | ( "\\"  
             ( ["n","t","b","r","f","\\","'","\""]  
             | ["0"-"7"](["0"-"7"])?  
             |["0"-"3"]["0"-"7"]["0"-"7"]  
             )  
          )  
  
     )*  
    "\""  
>
```



## 一个计算器的示例

其文法如下：


1. $expr\to term \space(+\mid-)\space term$
2. $term\to primary\space(*\mid/)\space primary$
4. $primary\to number\mid -number\mid (expr)$
5. $num \to digits\mid digits.digits$
6. $digits \to (0\mid 1\mid2\mid\cdots\mid9)+$

```java
options {  
    STATIC = false;  
}  
PARSER_BEGIN(DemoParser)  
package io.leaderli.c1;  
public class DemoParser{  
    public static void main(String[] args) throws Exception {  
      DemoParser demo = new DemoParser(System.in);  
      demo.Start();    }  
 }  
PARSER_END(DemoParser)  
SKIP : {" "}  
TOKEN : {  
    <EOL: "\r"|"\n"|"\r\n">|  
    <PLUS: "+"> |  
    <MINUS: "-"> |  
    <TIMES: "*"> |  
    <DIVIDE: "/"> |  
    <OPEN_PAR: "("> |  
    <CLOSE_PAR: ")"> |  
    <NUMBER: <DIGITS>|<DIGITS>"."<DIGITS>> |  
    <#DIGITS: (["0"-"9"])+>  
}  
  
void Start() :{double value;}{  
   (  
    value = expr()  
    <EOL>{System.out.println(value);}  
   )*  
   <EOF>  
}  
  
  
double term() throws NumberFormatException:{double i;double value;}  
{  
    value = primary()  
    (  
        <TIMES>  
        i = primary(){value *= i;}  
        |  
        <DIVIDE>  
        i = primary(){value /= i;}  
    )*  
    {return value;}  
  
}  
  
  
double expr() throws NumberFormatException:{double i;double value;}  
{  
    value = term()  
    (  
        <PLUS>{value +=  term();}  
       |  
        <MINUS>{value -=term();}  
    )*  
    {return value;}  
  
}  
double primary() throws NumberFormatException:{Token t;double d;}  
{  
    t = <NUMBER> { return Double.parseDouble(t.image); }  
|  
    <OPEN_PAR>d = expr() <CLOSE_PAR>  { return d; }  
|  
    <MINUS> d=primary() { return -d; }  
}
```
# jjtree

将源文件编译为语法树

## 快速示例

pom配置，配置了clean插件，用于每次情况源码文件，以便重新生成。

```xml
<?xml version="1.0" encoding="UTF-8"?>  
<project xmlns="http://maven.apache.org/POM/4.0.0"  
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"  
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">  
    <modelVersion>4.0.0</modelVersion>  
  
    <groupId>io.leaderli</groupId>  
    <artifactId>javacc_demo</artifactId>  
    <version>1.0-SNAPSHOT</version>  
  
    <properties>  
        <maven.compiler.source>8</maven.compiler.source>  
        <maven.compiler.target>8</maven.compiler.target>  
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>  
    </properties>  
    <dependencies>  
        <dependency>  
            <groupId>net.java.dev.javacc</groupId>  
            <artifactId>javacc</artifactId>  
            <version>7.0.13</version>  
            <scope>provided</scope>  
        </dependency>  
    </dependencies>  
    <build>  
        <plugins>  
            <plugin>  
                <groupId>org.apache.maven.plugins</groupId>  
                <artifactId>maven-clean-plugin</artifactId>  
                <version>3.1.0</version>  
                <executions>  
                    <execution>  
                        <id>custom-clean</id>  
                        <phase>clean</phase>  
                        <goals>  
                            <goal>clean</goal>  
                        </goals>  
                        <configuration>  
                            <filesets>  
                                <fileset>  
                                    <directory>src/main/java</directory>  
                                </fileset>  
                            </filesets>  
                        </configuration>  
                    </execution>  
                </executions>  
            </plugin>  
            <plugin>  
                <groupId>org.codehaus.mojo</groupId>  
                <artifactId>javacc-maven-plugin</artifactId>  
                <version>3.1.0</version>  
                <executions>  
                    <execution>  
                        <id>jjtree</id>  
                        <goals>  
                            <goal>jjtree-javacc</goal>  
                        </goals>  
                        <configuration>  
                            <includes>*.jjt</includes>  
                            <sourceDirectory>src/main/resources</sourceDirectory>  
                            <interimDirectory>src/main/java</interimDirectory>  
                            <outputDirectory>src/main/java</outputDirectory>  
                        </configuration>  
                    </execution>  
                </executions>  
            </plugin>  
        </plugins>  
    </build>  
</project>
```

`d1.jjt`

```java
options {  
    STATIC = false;  
}  
PARSER_BEGIN(DemoParser)  
package io.leaderli.c1;  
import java.io.*;  
public class DemoParser{  
    public static void main(String[] args) throws ParseException {  
  
        String input = "4 + 2";  
        Reader reader= new StringReader(input);  
        DemoParser demo= new DemoParser(reader);  
        SimpleNode e =  demo.expression();       
        e.dump(">");  
    }  
 }  
PARSER_END(DemoParser)  
SKIP : {  
    " "  
}  
TOKEN : {  
    <DIGITS:(["0"-"9"])+>|<PLUS:"+">  
}  
SimpleNode expression():{}{  
    operator() {  
    return jjtThis;  
    }  
}  
void operator():{}{  
    operand()  
    "+"  
    operand()  
}  
// 使用< > 引用token
void operand():{}{  
     <DIGITS>  
}
```

执行 `mvn clean generate-sources`

## jjtree的options参数

```shell
BUILD_NODE_FILES (default: true)
MULTI (default: false)
NODE_DEFAULT_VOID (default: false)
NODE_CLASS (default: "")
NODE_FACTORY (default: "")
NODE_PACKAGE (default: "")
NODE_PREFIX (default: "AST")
NODE_SCOPE_HOOK (default: false)
NODE_SCOPE_HOOK (default: false)
NODE_USES_PARSER (default: false)
TRACK_TOKENS (default: false)
STATIC (default: true)
VISITOR (default: false)
VISITOR_DATA_TYPE (default: "Object")
VISITOR_RETURN_TYPE (default: "Object")
VISITOR_EXCEPTION (default: "")
JJTREE_OUTPUT_DIRECTORY (default: use value of OUTPUT_DIRECTORY)
```

## visitor

使用访问者模式遍历所有节点

```java
options {  
    STATIC = false;  
    MULTI = true;  
    VISITOR = true;  
}  
PARSER_BEGIN(DemoParser)  
package io.leaderli.c1;  
import java.io.*;  
public class DemoParser{  
    public static void main(String[] args) throws ParseException {  
  
        String input = "4 + 2";  
        Reader reader= new StringReader(input);  
        DemoParser demo= new DemoParser(reader);  
        SimpleNode e =  demo.expression();        
        e.jjtAccept(new DemoParserDefaultVisitor(){  
  
              @Override              
              public Object visit(ASToperand node, Object data) {  
                  System.out.println(node+" "+node.jjtGetValue());  
                  return super.visit(node, data);  
              }    
        },null);  
    }  
 }  
PARSER_END(DemoParser)  
SKIP : {  
    " "  
}  
TOKEN : {  
    <DIGITS:(["0"-"9"])+>|<PLUS:"+">  
}  
SimpleNode expression():{}{  
    operator() {  
    return jjtThis;  
    }  
}  
void operator():{Token t;}{  
    operand()  
    t="+"{jjtThis.jjtSetValue(t.image);}  
    operand()  
}  
void operand():{Token t;}{  
     t=<DIGITS>{jjtThis.jjtSetValue(t.image);}  
}
```

会生成如下文件

```txt
ASTexpression.java             DemoParserVisitor.java
ASToperand.java                JJTDemoParserState.java
ASToperator.java               Node.java
DemoParser.java                ParseException.java
DemoParserConstants.java       SimpleCharStream.java
DemoParserDefaultVisitor.java  SimpleNode.java
DemoParserTokenManager.java    Token.java
DemoParserTreeConstants.java   TokenMgrError.java
```

可以修改生成的节点名,例如 `ASToperand.java` 文件更改为 `ASTOp.java`

```java
void operand() #Op:{Token t;}{  
     t=<DIGITS>{jjtThis.jjtSetValue(t.image);}  
}
```

也可以组合多个为一个

```java
void operator()#Op:{Token t;}{  
    operand()  
    t="+"{jjtThis.jjtSetValue(t.image);}  
    operand()  
}  
void operand() #Op:{Token t;}{  
     t=<DIGITS>{jjtThis.jjtSetValue(t.image);}  
}
```

也可以声明为 void类型，表示无子节点，可以节省性能

```java
void operator() #void:{}{  
    operand()  
    "+"  
    operand()  
}  
void operand() :{Token t;}{  
     t=<DIGITS>{jjtThis.jjtSetValue(t.image);}  
}
```

## 节点构建与节点描述


jjtree从上到下依次构建节点，它为[[grammar#非终结符]]创建节点，并新建一个节点的上下文，该上下文维护在jjtree的stack上。当创建节点后，会调用 `jjtOpen`，然后展开[[grammar#非终结符]]。当展开后，所有的子节点都创建好后，调用`jjtClose`，将堆栈中的子节点挂载到节点下，若父节点因为节点描述符，未能挂载，则子节点则会保留在堆栈上，供后续节点`jjtClose`使用。



```java
options {
    STATIC = false;
    MULTI = true;
    VISITOR = true;
    VISITOR_DATA_TYPE="String";
}
PARSER_BEGIN(DemoParser)
package io.leaderli.c1;
import java.io.Reader;
import java.io.StringReader;
public class DemoParser{
    public static void main(String[] args) throws ParseException {

        String input = "ABC1C2C3";
        Reader reader= new StringReader(input);
        DemoParser demo= new DemoParser(reader);
        SimpleNode e =  demo.A();
        e.dump("");
    }
 }
PARSER_END(DemoParser)
TOKEN : {
    <C_NUM: "C"["0"-"9"]>
}
SimpleNode A():{Token t;}{
    t="A"{jjtThis.jjtSetValue(t.image);}
    B() { return jjtThis;}
}
void B() :{Token t;}{
    t="B"{jjtThis.jjtSetValue(t.image);}
    (C())+

}
void C() :{Token t;}{
    t=<C_NUM>{jjtThis.jjtSetValue(t.image);}
}
```

为了方便观察，修改SimpleNode的toString方法

```java
public String toString() {  
	return value == null ? DemoParserTreeConstants.jjtNodeName[id]:value.toString();
}
```

`ABC1C2C3`

```txt
A
 B
  C1
  C2
  C3
```

当指定B有两个子节点时

```java
void B() #B(2) :{Token t;}{
    t="B"{jjtThis.jjtSetValue(t.image);}
    (C())+

}
```

`ABC1C2`

```txt
A
 B
  C1
  C2
```

`ABC1C2C3`

B节点有两个节点时，就表示组装完成了，则向上构建

```txt
A
 C1
 B
  C2
  C3
```

`ABC1`

则会抛出异常

当定义为 `>2`时

```java
void B() #B(>2) :{Token t;}{
    t="B"{jjtThis.jjtSetValue(t.image);}
    (C())+
}
```

`ABC1C2C3`

```txt
A
 B
  C1
  C2
  C3
```

`ABC1C2`

B下面的C的数量不够，则不加载B

```txt
A
  C1
  C2
```

嵌入式的节点描述，一般用于添加额外的节点

```java
TOKEN : {  
    <B_NUM: "B"["0"-"9"]>|  
    <C_NUM: "C"["0"-"9"]>  
}  
SimpleNode A():{Token t;}{  
    t="A"{jjtThis.jjtSetValue(t.image);}  
    B() { return jjtThis;}  
}  
void B() :{Token t;}{  
    t=<B_NUM> {jjtThis.jjtSetValue(t.image);}  
    (C())+ #B(2)  
}  
void C() :{Token t;}{  
    t=<C_NUM>{jjtThis.jjtSetValue(t.image);}  
}
```

`AB1C1C2`

```shell
A
 B1         
  B
   C1
   C2
```

`AB1C1C2C3`

```shell
A
 B1
  C1
  B
   C2
   C3
```

我们再看同时定义的时候

```java
void B() #B(>1):{Token t;}{  
    t=<B_NUM> {jjtThis.jjtSetValue(t.image);}  
    (C())+ #B(2)  
}
```

`AB1C1C2`

```shell
A
 B         # 额外的B，因为子节点数量不满足，所以未加载另一个B
   C1
   C2
```

ABCCC

```shell
A
 B1
  C1
  B
   C2
   C3
```




## 参考

- [JavaCC](https://javacc.github.io/javacc/)
- [JavaCC - tutorials](https://javacc.github.io/javacc/tutorials/)
- [javaCC - documentation](https://javacc.github.io/javacc/documentation/)
- [JavaCC - 博客园](https://www.cnblogs.com/suhaha/tag/JavaCC/)
- [[Generating Parsers with JavaCC (Tom Copeland) (Z-Library).pdf]]
- [[javacc-tutorial.pdf]]