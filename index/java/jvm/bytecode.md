---
aliases: 字节码,class
tags:
  - java/jvm/字节码
date updated: 2023-02-14 21:38
---

class字节码文件是java跨平台的基础，其本质是一个满足JVM规范的二进制文件。class文件以一个个8位字节位基础单位，每个数据严格按照指定的数据结构排列在class文件之中。

## 类文件的数据结构

```c++
ClassFile {
    u4             magic;
    u2             minor_version;
    u2             major_version;
    u2             constant_pool_count;
    cp_info        constant_pool[constant_pool_count-1];
    u2             access_flags;
    u2             this_class;
    u2             super_class;
    u2             interfaces_count;
    u2             interfaces[interfaces_count];
    u2             fields_count;
    field_info     fields[fields_count];
    u2             methods_count;
    method_info    methods[methods_count];
    u2             attributes_count;
    attribute_info attributes[attributes_count];
}
```

- `u4` `u2`表示占用4字节和2字节
- `info` 表示指针

对下述代码编译

```java
public class Hello {
	public static void main(String[] args) {
        System.out.println("hello");
	}
}
```

得到 hello.class文件，我们查看其二进制内容

```http
  Offset: 00 01 02 03 04 05 06 07 08 09 0A 0B 0C 0D 0E 0F 10 11 12 13 14 15 16 17 18 19 1A 1B 1C 1D 1E 1F 	
00000000: CA FE BA BE 00 00 00 34 00 1D 0A 00 06 00 0F 09 00 10 00 11 08 00 12 0A 00 13 00 14 07 00 15 07    J~:>...4........................
00000020: 00 16 01 00 06 3C 69 6E 69 74 3E 01 00 03 28 29 56 01 00 04 43 6F 64 65 01 00 0F 4C 69 6E 65 4E    .....<init>...()V...Code...LineN
00000040: 75 6D 62 65 72 54 61 62 6C 65 01 00 04 6D 61 69 6E 01 00 16 28 5B 4C 6A 61 76 61 2F 6C 61 6E 67    umberTable...main...([Ljava/lang
00000060: 2F 53 74 72 69 6E 67 3B 29 56 01 00 0A 53 6F 75 72 63 65 46 69 6C 65 01 00 0A 48 65 6C 6C 6F 2E    /String;)V...SourceFile...Hello.
00000080: 6A 61 76 61 0C 00 07 00 08 07 00 17 0C 00 18 00 19 01 00 05 68 65 6C 6C 6F 07 00 1A 0C 00 1B 00    java................hello.......
000000a0: 1C 01 00 05 48 65 6C 6C 6F 01 00 10 6A 61 76 61 2F 6C 61 6E 67 2F 4F 62 6A 65 63 74 01 00 10 6A    ....Hello...java/lang/Object...j
000000c0: 61 76 61 2F 6C 61 6E 67 2F 53 79 73 74 65 6D 01 00 03 6F 75 74 01 00 15 4C 6A 61 76 61 2F 69 6F    ava/lang/System...out...Ljava/io
000000e0: 2F 50 72 69 6E 74 53 74 72 65 61 6D 3B 01 00 13 6A 61 76 61 2F 69 6F 2F 50 72 69 6E 74 53 74 72    /PrintStream;...java/io/PrintStr
00000100: 65 61 6D 01 00 07 70 72 69 6E 74 6C 6E 01 00 15 28 4C 6A 61 76 61 2F 6C 61 6E 67 2F 53 74 72 69    eam...println...(Ljava/lang/Stri
00000120: 6E 67 3B 29 56 00 21 00 05 00 06 00 00 00 00 00 02 00 01 00 07 00 08 00 01 00 09 00 00 00 1D 00    ng;)V.!.........................
00000140: 01 00 01 00 00 00 05 2A B7 00 01 B1 00 00 00 01 00 0A 00 00 00 06 00 01 00 00 00 01 00 09 00 0B    .......*7..1....................
00000160: 00 0C 00 01 00 09 00 00 00 25 00 02 00 01 00 00 00 09 B2 00 02 12 03 B6 00 04 B1 00 00 00 01 00    .........%........2....6..1.....
00000180: 0A 00 00 00 0A 00 02 00 00 00 03 00 08 00 04 00 01 00 0D 00 00 00 02 00 0E                         .........................
```

根据数据结构的定义，前4位是magic，固定为 `CAFEBABE`，用于JVM认定该文件为一个合法的class字节码，通过第8位也可以看到其编译的 [[major_version|java 版本信息]]

一般为了方便我们都使用  [[index/java/command#javap|javap]] 查看class字节码，查看
[[index/java/command#^e7cce6|示例]] 我们可以方便的看到其 [[major_version|java 版本信息]]

## 描述符

在jvm规范中，每个变量、字段都有描述信息，描述符的作用是用来描述字段的数据类型、方法的参数列表（包括数量、类型以及顺序）和返回值。
根据描述符规则，基本数据类型（ `byte`、`char`、`double`、`float`、`int`、`long`、`short`、`boolean` ）以及代表无返回值的 `void` 类型都用一个大写字符 `V` 来表示，而对象类型则用字符`L` 加对象的全限定名来表示，详见下表:

| 标志符  | 含义                        |
| :--- | :------------------------ |
| B    | 基本数据类型 byte               |
| C    | 基本数据类型 char               |
| D    | 基本数据类型 double             |
| F    | 基本数据类型 float              |
| I    | 基本数据类型 int                |
| J    | 基本数据类型 long               |
| S    | 基本数据类型 short              |
| Z    | 基本数据类型 boolean            |
| V    | 基本数据类型 void               |
| L    | 对象类型,如 Ljava/lang/Object  |
| `[*` | 数组类型,如 [Ljava/lang/Object |

方法的描述符，先参数列表后返回值的顺序来描述，参数列表按参数顺序放在 `()` 之间。

通过查看  [[index/java/command#^e7cce6|示例]] ，我们观察到 [[constant pool| 常量池]] 中字段的描述符，也可以看到方法的描述符。例如最常见的main方法的描述符，`descriptor: ([Ljava/lang/String;)V`

描述符示例：

- `public void method(): ()V`
- `public void method(String s, int i): (Ljava/lang/String;I)V`
- `public String method(String s, int i, boolan flag):(Ljava/lang/String;IZ)Ljava/lang/String`

## 常用字节码指令

### ldc

`int`, `float` 或 `String` 型常量从常量池推送至栈顶

### getstatic

获取类的静态字段，将其值压入栈顶

### putstatic

给类的静态字段赋值

## 示例

### 查看 Class 是否是基本类型

```java
clasz.isPrimitive();
```

### 判断类是否继承自

```java
Father.class.isAssignableFrom(Son.class)
```


## 字节码编辑软件


![[Pasted image 20240206211329.png]]

[JBE - Java Bytecode Editor](https://set.ee/jbe/)
## 参考文档

1. [Java字节码文件结构剖析 - cexo - 博客园](https://www.cnblogs.com/webor2006/p/9404249.html)
2. [Java字节码结构剖析一：常量池 - 简书](https://www.jianshu.com/p/bc3cfbebef25)
