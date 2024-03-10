---
tags:
  - compilers/antlr
date updated: 2024-03-10 19:54
---

默认使用 [[LL(1)]] 文法，使用 [[EBNF]] 来描述语法

## 快速示例

用来表示匹配大括号的语法 `{}, {{{{{}}}}} // … etc`

```java
PARSER_BEGIN(Example)

/** Simple brace matcher. */
public class Example {

  /** Main entry point. */
  public static void main(String args[]) throws ParseException {
    Example parser = new Example(System.in);
    parser.Input();
  }

}

PARSER_END(Example)

/** Root production. */
void Input() :
{}
{
  MatchedBraces() ("\n"|"\r")* <EOF>
}

/** Brace matching production. */
void MatchedBraces() :
{}
{
  "{" [ MatchedBraces() ] "}"
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
mvn clean  generate-sources 
```

编译后执行

```shell
$ java Example
{{}}<return>
```

## token

javaCC 由一组词法来构成，每个词法由一组正则表达式构成，默认的词法为`DEFAULT`。

词法有四种类型

1. `SKIP` 跳过匹配的字符，例如换行、注释
2. `MORE` 将当前匹配的字符用于下一个词法
3. `TOKEN` 将匹配的字符用于token，用于解析
4. `SPECIAL_TOKEN` 匹配特殊的token，不参与解析

## 参考

- [JavaCC](https://javacc.github.io/javacc/)
- [JavaCC - tutorials](https://javacc.github.io/javacc/tutorials/)
- [JavaCC - 博客园](https://www.cnblogs.com/suhaha/tag/JavaCC/)
- [[Generating Parsers with JavaCC (Tom Copeland) (Z-Library).pdf]]
