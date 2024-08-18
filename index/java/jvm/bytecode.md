---
aliases: 字节码,class
tags:
  - java/jvm/字节码
date updated: 2024-08-18 22:01
---

class字节码文件是java跨平台的基础，其本质是一个满足JVM规范的二进制文件。class文件是一组8位字节位为最小基础单位，每个数据严格按照指定的数据结构排列在class文件之中，中间没有任何分隔符。

## 类文件的数据结构

### 概述

```c
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

字节码文件结构，有两种最基本的数据类型来表示字节码文件格式：无符号数和表

**无符号数**

它以 u1、u2、u4、u8 六七分别代表 1 个字节、2 个字节、4 个字节、8 个字节的无符号数。

**表**

有多个无符号数或其他表作为数据项构成的符合数据类型，所有表一般以`_info`结尾

整个字节码文件本质上就是一张表，它由下面几个部分组成：

1. 魔数与Class文件版本
2. 常量池
3. 访问标志
4. 类索引、父类索引、接口索引
5. 字段表集合
6. 方法表集合
7. 属性表集合

![[Pasted image 20240818191659.png]]

其内存布局如下

![[Pasted image 20240818193923.png]]

对下述代码编译

```java
public class Demo {
public static void main(String[] args) {
System.out.println("hello");
}
}
```

得到 Demo.class文件，我们[[vim#查看字节]]内容

```txt
cafe babe 0000 0034 001d 0a00 0600 0f09
0010 0011 0800 120a 0013 0014 0700 1507
0016 0100 063c 696e 6974 3e01 0003 2829
5601 0004 436f 6465 0100 0f4c 696e 654e
756d 6265 7254 6162 6c65 0100 046d 6169
6e01 0016 285b 4c6a 6176 612f 6c61 6e67
2f53 7472 696e 673b 2956 0100 0a53 6f75
7263 6546 696c 6501 0009 4465 6d6f 2e6a
6176 610c 0007 0008 0700 170c 0018 0019
0100 0b48 656c 6c6f 2057 6f72 6c64 0700
1a0c 001b 001c 0100 0444 656d 6f01 0010
6a61 7661 2f6c 616e 672f 4f62 6a65 6374
0100 106a 6176 612f 6c61 6e67 2f53 7973
7465 6d01 0003 6f75 7401 0015 4c6a 6176
612f 696f 2f50 7269 6e74 5374 7265 616d
3b01 0013 6a61 7661 2f69 6f2f 5072 696e
7453 7472 6561 6d01 0007 7072 696e 746c
6e01 0015 284c 6a61 7661 2f6c 616e 672f
5374 7269 6e67 3b29 5600 2100 0500 0600
0000 0000 0200 0100 0700 0800 0100 0900
0000 1d00 0100 0100 0000 052a b700 01b1
0000 0001 000a 0000 0006 0001 0000 0001
0009 000b 000c 0001 0009 0000 0025 0002
0001 0000 0009 b200 0212 03b6 0004 b100
0000 0100 0a00 0000 0a00 0200 0000 0300
0800 0400 0100 0d00 0000 0200 0e
```

### 魔数与Class文件版本

1. 1~4位 magic，固定为 `CAFEBABE`，用于JVM认定该文件为一个合法的class字节码
2. 5~6位 Minor Version，即编译该 Class 文件的 JDK 次版本号。
3. 7~8位 Major Version，即编译该 Class 文件的 JDK 主版本号。可以看到其编译的 [[major_version|java 版本信息]]，一般为了方便我们都使用  [[index/java/command#javap|javap]] 查看class字节码，查看[[index/java/command#^e7cce6|示例]] 我们可以方便的看到其 [[major_version|java 版本信息]]

### 常量池

紧跟版本信息之后的是常量池信息，其中前 2 个字节表示常量池个数，其后的不定长数据则表示常量池的具体信息。

常量池的常量都是由`cp_info`这种表结构组成的，而且表结构不同其大小也不同。在 Java 虚拟机规范中一共有 14 种 `cp_info` 类型的表结构。

![](https://img2018.cnblogs.com/blog/595137/201812/595137-20181219204324926-1691668396.png)

而上面这些 `cp_info` 表结构又有不同的数据结构，其对应的数据结构如下图所示。

![](https://img2018.cnblogs.com/blog/595137/201812/595137-20181219204338051-305022474.png)

`cp_info`表结构一共有三个字段，第一个字段表示这个表结构的标示值，有一个字节大小，对应我们上一个表格中的数字。第二、三个字段表示其表结构的描述

第 1 个常量。

![[Pasted image 20240818195507.png]]

紧接着 001d 的后一个字节为 0A，为十进制数字 10，查表可知其为方法引用类型（CONSTANT_Methodref_info）的常量。再查 cp_info 对应的表结构知道，该常量项第 2 - 3 个字节表示类信息，第 4 - 5 个字节表示名称及类描述符。

该常量项第 2 - 3 个字节，其值为 `00 06`，表示指向常量池第 6 个常量所表示的信息。根据后面我们分析的结果知道第 6 个常量是 `java/lang/Object` 。第 4 - 5 个字节，其值为 `000f`，表示指向常量池第 15 个常量所表示的信息，根据 javap 反编译出来的信息可知第 10 个常量是 `<init>:()V`。将这两者组合起来就是：`java/lang/Object.<init>:V`，即 Object 的 init 初始化方法。

### 访问标志

这个标志用于识别一些类或者接口层次的访问信息，包括：这个Class是类还是接口、是否定义为public类型、是否定义为abstract类型等。具体的标志位以及标志的含义见下表。

| 标志类型           | 标志值                 | 标志意义                          |
| -------------- | ------------------- | ----------------------------- |
| ACC_PUBLIC     | 0000 0000 0000 0001 | 是否为 public 类型                 |
| ACC_FINAL      | 0000 0000 0001 0000 | 是否被声明为 final 类型               |
| ACC_SUPER      | 0000 0000 0010 0000 | 是否允许使用 invokespcial 字节码指令的新语义 |
| ACC_INTERFACE  | 0000 0001 0000 0000 | 标识这是一个接口                      |
| ACC_ABSTRACT   | 0000 0010 0000 0000 | 是否为抽象类型                       |
| ACC_SYNTHETIC  | 0001 0000 0000 0000 | 标识这个类并非由用户代码生成                |
| ACC_ANNOTATION | 0010 0000 0000 0000 | 标识这是一个注解                      |
| ACC_ENUM       | 0100 0000 0000 0000 | 标识这是一个枚举                      |

在这里这两个字节是 `00 21`，其二进制值为`0000 0000 0010 0001`，根据标志位上是否为1表示是否有某个标志，如下图所示，则表示为 `ACC_PUBLIC` 和

![[Pasted image 20240818200343.png]]

### 类索引、父类索引、接口索引

类索引和父类索引都是一个u2类型的数据，而接口索引集合是一组u2类型的数据的集合，Class 文件中由这三项数据来确定这个类的继承关系。

### 字段表集合

字段表集合用于描述接口或者类中声明的变量

这里说的字段包括类级变量和实例级变量，但不包括在方法内部声明的局部变量。在类接口集合后的2个字节是一个字段计数器，表示总有有几个属性字段。在字段计数器后，才是具体的属性数据。

字段表的每个字段用一个名为 field_info 的表来表示，field_info 表的数据结构如下所示：

![[Pasted image 20240818202739.png]]

### 方法表集合

方法表中的每个方法都用一个 method_info 表示，其数据结构如下：

![[Pasted image 20240818202814.png]]

方法的属性表一般包括一个重要的[[#Code属性的数据结构如下|Code]]属性

### 属性表集合

属性表用于class文件格式中的ClassFile，field_info，method_info和Code_attribute结构，以用于描述某些场景专有的信息。与 Class 文件中其它的数据项目要求的顺序、长度和内容不同，属性表集合的限制稍微宽松一些，不再要求各个属性表具有严格的顺序，并且只要不与已有的属性名重复，任何人实现的编译器都可以向属性表中写 入自己定义的属性信息，Java 虚拟机运行时会忽略掉它不认识的属性。

对于每个属性，它的名称需要从常量池中引用一个CONSTANT_Utf8_info类型的常量来表示，而属性值的结构则是完全自定义的，只需要通过一个u4的长度去说明属性值所占用的位数即可。

attribute_info 表的结构如下图所示

![[Pasted image 20240818203028.png]]

**《java虚拟机规范 JavaSE8》中预定义23项虚拟机实现应当能识别的属性:**

| 属性                                   | 可用位置                                     | 含义                                                                                                                                                                                            |
| ------------------------------------ | ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SourceFile                           | ClassFile                                | 记录源文件名称                                                                                                                                                                                       |
| InnerClasses                         | ClassFile                                | 内部类列表                                                                                                                                                                                         |
| EnclosingMethod                      | ClassFile                                | 仅当一个类为局部类或者匿名类时，才能拥有这个属性，这个属性用于表示这个类所在的外围方法                                                                                                                                                   |
| SourceDebugExtension                 | ClassFile                                | JDK1.6中新增的属性，SourceDebugExtension用于存储额外的调试信息。如在进行JSP文件调试时，无法通过Java堆栈来定位到JSP文件的行号，JSR-45规范为这些非Java语言编写，却需要编译成字节码运行在Java虚拟机汇中的程序提供了一个进行调试的标准机制，使用SourceDebugExtension就可以存储这些调试信息。               |
| BootstrapMethods                     | ClassFile                                | JDK1.7新增的属性，用于保存invokedynamic指令引用的引导方法限定符                                                                                                                                                     |
| ConstantValue                        | field_info                               | final关键字定义的常量值                                                                                                                                                                                |
| Code                                 | method_info                              | Java代码编译成的字节码指令(即：具体的方法逻辑字节码指令)                                                                                                                                                               |
| Exceptions                           | method_info                              | 方法声明的异常                                                                                                                                                                                       |
| RuntimeVisibleAnnotations            | ClassFile, field_info, method_info       | JDK1.5中新增的属性，为动态注解提供支持。RuntimeVisibleAnnotations属性，用于指明哪些注解是运行时(实际上运行时就是进行反射调用)可见的。                                                                                                           |
| RuntimeInvisibleAnnotations          | ClassFile, field_info, method_info       | JDK1.5中新增的属性，作用与RuntimeVisibleAnnotations相反用于指明哪些注解是运行时不可见的。                                                                                                                                  |
| RuntimeVisibleParameterAnnotations   | method_info                              | JDK1.5中新增的属性，作用与RuntimeVisibleAnnotations类似，只不过作用对象为方法的参数。                                                                                                                                    |
| RuntimeInvisibleParameterAnnotations | method_info                              | JDK1.5中新增的属性，作用与RuntimeInvisibleAnnotations类似，只不过作用对象为方法的参数。                                                                                                                                  |
| AnnotationDefault                    | method_info                              | JDK1.5中新增的属性，用于记录注解类元素的默认值                                                                                                                                                                    |
| MethodParameters                     | method_info                              | 52.0                                                                                                                                                                                          |
| Synthetic                            | ClassFile, field_info, method_info       | 标识方法或字段为编译器自动产生的                                                                                                                                                                              |
| Deprecated                           | ClassFile, field_info, method_info       | 被声明为deprecated的方法和字段                                                                                                                                                                          |
| Signature                            | ClassFile, field_info, method_info       | JDK1.5新增的属性，这个属性用于支持泛型情况下的方法签名，在Java语言中，任何类、接口、初始化方法或成员的泛型签名如果包含了类型变量(Type Variables)或参数类型(Parameterized Types),则Signature属性会为它记录泛型签名信息。由于Java的泛型采用擦除法实现，在为了避免类型信息被擦除后导致签名混乱，需要这个属性记录泛型中的相关信息 |
| RuntimeVisibleAnnotations            | ClassFile, field_info, method_info       | JDK1.5中新增的属性，为动态注解提供支持。RuntimeVisibleAnnotations属性，用于指明哪些注解是运行时(实际上运行时就是进行反射调用)可见的。                                                                                                           |
| RuntimeInvisibleAnnotations          | ClassFile, field_info, method_info       | JDK1.5中新增的属性，作用与RuntimeVisibleAnnotations相反用于指明哪些注解是运行时不可见的。                                                                                                                                  |
| LineNumberTable                      | Code                                     | Java源码的行号与字节码指令的对应关系                                                                                                                                                                          |
| LocalVariableTable                   | Code                                     | 方法的局部变量描述                                                                                                                                                                                     |
| LocalVariableTypeTable               | Code                                     | JDK1.5中新增的属性，它使用特征签名代替描述符，是为了引入泛型语法之后能描述泛型参数化类型而添加                                                                                                                                            |
| StackMapTable                        | Code                                     | JDK1.6中新增的属性，供新的类型检查验证器(Type Checker)检查和处理目标方法的局部变量和操作数栈所需要的类型是否匹配                                                                                                                            |
| MethodParameters                     | method_info                              | JDK1.8中新加的属性，用于标识方法参数的名称和访问标志。                                                                                                                                                                |
| RuntimeVisibleTypeAnnotations        | ClassFile, field_info, method_info, Code | JDK1.8中新加的属性，在运行时可见的注释，用于泛型类型，指令等。                                                                                                                                                            |
| RuntimeInvisibleTypeAnnotations<br>  | ClassFile, field_info, method_info, Code | JDK1.8中新加的属性，在编译时可见的注释，用于泛型类型，指令等。                                                                                                                                                            |



![[Pasted image 20240818215117.png]]
#### Code属性的数据结构如下：

![[Pasted image 20240818204608.png]]


根据 Code 属性对应表结构知道，前 2 个字节为 0009，即常量池第 9 个常量，查询知道是字符串常量`Code`。接着 4 个字节表示属性长度，这里值为 1D，即 29 的长度。下面我们继续分析 Code 属性的数据内容。

紧接着 2 个字节为 max_stack 属性。这里数据为 00 01，表示操作数栈深度的最大值。

紧接着 2 个字节为 max_locals属性。这里是数据为 00 01，表示局部变量表所需的存储空间为 1 个 Slot。在这里 max_locals的单位是Slot，Slot是虚拟机为局部变量分配内存所使用的最小单位。

接着 4 个字节为 code_length，表示生成字节码这里给的长度。这里数据为 00 00 00 05，表示生成字节码长度为 5 个字节。那么紧接着 5 个自己就是对应的数据，这里数据为 2a b7 00 01 b1，这一串数据其实就是字节码指令。通过查询字节码指令表，可知其对应的字节码指令：

- 读入2A，查表得0x2A对应的指令为aload_0，这个指令的含义是将第0个Slot中为reference类型的本地变量推送到操作数栈顶。
- 读入B7，查表得0xB7对应的指令为invokespecial，这条指令的作用是以栈顶的reference类型的数据所指向的对象作为方法接收者，调用此对象的实例构造器方法、private方法或者它的父类的方法。这个方法有一个u2类型的参数说明具体调用哪一个方法，它指向常量池中的一个CONSTANT_Methodref_info类型常量，即此方法的方法符号引用。
- 读入00 01，这是invokespecial的参数，查常量池得0x0001对应的常量为实例构造器“”方法的符号引用。
- 读入B1，查表得0xB1对应的指令为return，含义是返回此方法，并且返回值为void。这条指令执行后，当前方法结束。

接着 2 个字节为异常表长度，这里数据为 00 00，表示没有异常表数据。那么接下来也就不会有异常表的值。

紧接着 2 个字节是属性表的长度，这里数据为 00 01，表示有一个属性。该属性长度为一个 attribute_info 那么长
#### LineNumberTable属性的数据结构如下

![[Pasted image 20240818204729.png]]

#### line_number_info属性的数据结构

![[Pasted image 20240818204747.png]]

start_pc 表示的字节码行号， line_number 表示 Java 源码行号


第 1 个 line_number_info，即接下来 2 个字节为 00 00，即 start_pc 表示的字节码行号为第 0 行。接着 00 03，即 line_number 表示 Java 源码行号为第 3 行。

第 2 个 line_number_info，即接下来 2 个字节为 00 08，即 start_pc 表示的字节码行号为第 8 行。接着 00 04，即 line_number 表示 Java 源码行号为第 4 行。

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

## 字节码指令表

字节码指令根据功能、属性不同，可以分为11大类。下面附上字节码指令的分类，用于简单、临时查看，字节码指令的详细介绍，还需要查看官网的介绍。

### Constants 常量相关

|     |      |             |                                          |
| --- | ---- | ----------- | ---------------------------------------- |
| 十进制 | 操作码  | 助记符         | 含义                                       |
| 00  | 0x00 | nop         | 什么都不做                                    |
| 01  | 0x01 | aconst_null | 把 null 推到操作数栈                            |
| 02  | 0x02 | iconst_m1   | 把 int 常量 –1 推到操作数栈                       |
| 03  | 0x03 | iconst_0    | 把 int 常量 0 推到操作数栈                        |
| 04  | 0x04 | iconst_1    | 把 int 常量 1 推到操作数栈                        |
| 05  | 0x05 | iconst_2    | 把 int 常量 2 推到操作数栈                        |
| 06  | 0x06 | iconst_3    | 把 int 常量 3 推到操作数栈                        |
| 07  | 0x07 | iconst_4    | 把 int 常量 4 推到操作数栈                        |
| 08  | 0x08 | iconst_5    | 把 int 常量 5 推到操作数栈                        |
| 09  | 0x09 | lconst_0    | 把 long 常量 0 推到操作数栈                       |
| 10  | 0x0A | lconst_1    | 把 long 常量 1 推到操作数栈                       |
| 11  | 0x0B | fconst_0    | 把 float 常量 0 推到操作数栈                      |
| 12  | 0x0C | fconst_1    | 把 float 常量 1 推到操作数栈                      |
| 13  | 0x0D | fconst_2    | 把 float 常量 2 推到操作数栈                      |
| 14  | 0x0E | dconst_0    | 把 double 常量 0 推到操作数栈                     |
| 15  | 0x0F | dconst_1    | 把 double 常量 1 推到操作数栈                     |
| 16  | 0x10 | bipush      | 把单字节常量（-128~127）推到操作数栈                   |
| 17  | 0x11 | sipush      | 把 short 常量（-32768~32767）推到操作数栈           |
| 18  | 0x12 | ldc         | 把常量池中的int，float，String型常量取出并推到操作数栈顶      |
| 19  | 0x13 | ldc_w       | 把常量池中的int，float，String型常量取出并推到操作数栈顶（宽索引） |
| 20  | 0x14 | ldc2_w      | 把常量池中的long，double型常量取出并推到操作数栈顶（宽索引）      |

### Loads 加载相关

|     |      |         |                               |
| --- | ---- | ------- | ----------------------------- |
| 十进制 | 操作码  | 助记符     | 含义                            |
| 21  | 0x15 | iload   | 把 int 型局部变量推到操作数栈             |
| 22  | 0x16 | lload   | 把 long 型局部变量推到操作数栈            |
| 23  | 0x17 | fload   | 把 float 型局部变量推到操作数栈           |
| 24  | 0x18 | dload   | 把 double 型局部变量推到操作数栈          |
| 25  | 0x19 | aload   | 把引用型局部变量推到操作数栈                |
| 26  | 0x1A | iload_0 | 把局部变量第 1 个 int 型局部变量推到操作数栈    |
| 27  | 0x1B | iload_1 | 把局部变量第 2 个 int 型局部变量推到操作数栈    |
| 28  | 0x1C | iload_2 | 把局部变量第 3 个 int 型局部变量推到操作数栈    |
| 29  | 0x1D | iload_3 | 把局部变量第 4 个 int 型局部变量推到操作数栈    |
| 30  | 0x1E | lload_0 | 把局部变量第 1 个 long 型局部变量推到操作数栈   |
| 31  | 0x1F | lload_1 | 把局部变量第 2 个 long 型局部变量推到操作数栈   |
| 32  | 0x20 | lload_2 | 把局部变量第 3 个 long 型局部变量推到操作数栈   |
| 33  | 0x21 | lload_3 | 把局部变量第 4 个 long 型局部变量推到操作数栈   |
| 34  | 0x22 | fload_0 | 把局部变量第 1 个 float 型局部变量推到操作数栈  |
| 35  | 0x23 | fload_1 | 把局部变量第 2 个 float 型局部变量推到操作数栈  |
| 36  | 0x24 | fload_2 | 把局部变量第 3 个 float 型局部变量推到操作数栈  |
| 37  | 0x25 | fload_3 | 把局部变量第 4 个 float 型局部变量推到操作数栈  |
| 38  | 0x26 | dload_0 | 把局部变量第 1 个 double 型局部变量推到操作数栈 |
| 39  | 0x27 | dload_1 | 把局部变量第 2 个 double 型局部变量推到操作数栈 |
| 40  | 0x28 | dload_2 | 把局部变量第 3 个 double 型局部变量推到操作数栈 |
| 41  | 0x29 | dload_3 | 把局部变量第 4 个 double 型局部变量推到操作数栈 |
| 42  | 0x2A | aload_0 | 把局部变量第 1 个引用型局部变量推到操作数栈       |
| 43  | 0x2B | aload_1 | 把局部变量第 2 个引用型局部变量推到操作数栈       |
| 44  | 0x2C | aload_2 | 把局部变量第 3 个引用型局部变量推到操作数栈       |
| 45  | 0x2D | aload_3 | 把局部变量第 4 个引用 型局部变量推到操作数栈      |
| 46  | 0x2E | iaload  | 把 int 型数组指定索引的值推到操作数栈         |
| 47  | 0x2F | laload  | 把 long 型数组指定索引的值推到操作数栈        |
| 48  | 0x30 | faload  | 把 float 型数组指定索引的值推到操作数栈       |
| 49  | 0x31 | daload  | 把 double 型数组指定索引的值推到操作数栈      |
| 50  | 0x32 | aaload  | 把引用型数组指定索引的值推到操作数栈            |
| 51  | 0x33 | baload  | 把 boolean或byte型数组指定索引的值推到操作数栈 |
| 52  | 0x34 | caload  | 把 char 型数组指定索引的值推到操作数栈        |
| 53  | 0x35 | saload  | 把 short 型数组指定索引的值推到操作数栈       |

### Store 存储相关

|     |      |          |                                   |
| --- | ---- | -------- | --------------------------------- |
| 十进制 | 操作码  | 助记符      | 含义                                |
| 54  | 0x36 | istore   | 把栈顶 int 型数值存入指定局部变量               |
| 55  | 0x37 | lstore   | 把栈顶 long 型数值存入指定局部变量              |
| 56  | 0x38 | fstore   | 把栈顶 float 型数值存入指定局部变量             |
| 57  | 0x39 | dstore   | 把栈顶 double 型数值存入指定局部变量            |
| 58  | 0x3A | astore   | 把栈顶引用型数值存入指定局部变量                  |
| 59  | 0x3B | istore_0 | 把栈顶 int 型数值存入第 1 个局部变量            |
| 60  | 0x3C | istore_1 | 把栈顶 int 型数值存入第 2 个局部变量            |
| 61  | 0x3D | istore_2 | 把栈顶 int 型数值存入第 3 个局部变量            |
| 62  | 0x3E | istore_3 | 把栈顶 int 型数值存入第 4 个局部变量            |
| 63  | 0x3F | lstore_0 | 把栈顶 long 型数值存入第 1 个局部变量           |
| 64  | 0x40 | lstore_1 | 把栈顶 long 型数值存入第 2 个局部变量           |
| 65  | 0x41 | lstore_2 | 把栈顶 long 型数值存入第 3 个局部变量           |
| 66  | 0x42 | lstore_3 | 把栈顶 long 型数值存入第 4 个局部变量           |
| 67  | 0x43 | fstore_0 | 把栈顶 float 型数值存入第 1 个局部变量          |
| 68  | 0x44 | fstore_1 | 把栈顶 float 型数值存入第 2 个局部变量          |
| 69  | 0x45 | fstore_2 | 把栈顶 float 型数值存入第 3 个局部变量          |
| 70  | 0x46 | fstore_3 | 把栈顶 float 型数值存入第 4 个局部变量          |
| 71  | 0x47 | dstore_0 | 把栈顶 double 型数值存入第 1 个局部变量         |
| 72  | 0x48 | dstore_1 | 把栈顶 double 型数值存入第 2 个局部变量         |
| 73  | 0x49 | dstore_2 | 把栈顶 double 型数值存入第 3 个局部变量         |
| 74  | 0x4A | dstore_3 | 把栈顶 double 型数值存入第 4 个局部变量         |
| 75  | 0x4B | astore_0 | 把栈顶 引用 型数值存入第 1 个局部变量             |
| 76  | 0x4C | astore_1 | 把栈顶 引用 型数值存入第 2 个局部变量             |
| 77  | 0x4D | astore_2 | 把栈顶 引用 型数值存入第 3 个局部变量             |
| 78  | 0x4E | astore_3 | 把栈顶 引用 型数值存入第 4 个局部变量             |
| 79  | 0x4F | iastore  | 把栈顶 int 型数值存入数组指定索引位置             |
| 80  | 0x50 | lastore  | 把栈顶 long 型数值存入数组指定索引位置            |
| 81  | 0x51 | fastore  | 把栈顶 float 型数值存入数组指定索引位置           |
| 82  | 0x52 | dastore  | 把栈顶 double 型数值存入数组指定索引位置          |
| 83  | 0x53 | aastore  | 把栈顶 引用 型数值存入数组指定索引位置              |
| 84  | 0x54 | bastore  | 把栈顶 boolean or byte 型数值存入数组指定索引位置 |
| 85  | 0x55 | castore  | 把栈顶 char 型数值存入数组指定索引位置            |
| 86  | 0x56 | sastore  | 把栈顶 short 型数值存入数组指定索引位置           |

### Stack 栈相关

|     |      |         |                                            |
| --- | ---- | ------- | ------------------------------------------ |
| 十进制 | 操作码  | 助记符     | 含义                                         |
| 87  | 0x57 | pop     | 把栈顶数值弹出（非long，double数值）                    |
| 88  | 0x58 | pop2    | 把栈顶的一个long或double值弹出，或弹出2个其他类型数值           |
| 89  | 0x59 | dup     | 复制栈顶数值并把数值入栈                               |
| 90  | 0x5A | dup_x1  | 复制栈顶数值并将两个复制值压入栈顶                          |
| 91  | 0x5B | dup_x2  | 复制栈顶数值并将三个（或两个）复制值压入栈顶                     |
| 92  | 0x5C | dup2    | 复制栈顶一个（long 或double 类型的)或两个（其它）数值并将复制值压入栈顶 |
| 93  | 0x5D | dup2_x1 | dup_x1 指令的双倍版本                             |
| 94  | 0x5E | dup2_x2 | dup_x2 指令的双倍版本                             |
| 95  | 0x5F | swap    | 把栈顶端的两个数的值交换（数值不能是long 或double 类型< td >的）  |

### Math 运算相关

Java 虚拟机在处理浮点数运算时，不会抛出任何运行时异常，当一个操作产生溢出时，将会使用有符号的无穷大来表示，如果某个操作结果没有明确的数学定义的话，将会使用 NaN 值来表示。所有使用 NaN 值作为操作数的算术操作，结果都会返回 NaN。

|     |      |       |                            |
| --- | ---- | ----- | -------------------------- |
| 十进制 | 操作码  | 助记符   | 含义                         |
| 96  | 0x60 | iadd  | 把栈顶两个 int 型数值相加并将结果入栈      |
| 97  | 0x61 | ladd  | 把栈顶两个 long 型数值相加并将结果入栈     |
| 98  | 0x62 | fadd  | 把栈顶两个 float 型数值相加并将结果入栈    |
| 99  | 0x63 | dadd  | 把栈顶两个 double 型数值相加并将结果入栈   |
| 100 | 0x64 | isub  | 把栈顶两个 int 型数值相减并将结果入栈      |
| 101 | 0x65 | lsub  | 把栈顶两个 long 型数值相减并将结果入栈     |
| 102 | 0x66 | fsub  | 把栈顶两个 float 型数值相减并将结果入栈    |
| 103 | 0x67 | dsub  | 把栈顶两个 double 型数值相减并将结果入栈   |
| 104 | 0x68 | imul  | 把栈顶两个 int 型数值相乘并将结果入栈      |
| 105 | 0x69 | lmul  | 把栈顶两个 long 型数值相乘并将结果入栈     |
| 106 | 0x6A | fmul  | 把栈顶两个 float 型数值相乘并将结果入栈    |
| 107 | 0x6B | dmul  | 把栈顶两个 double 型数值相乘并将结果入栈   |
| 108 | 0x6C | idiv  | 把栈顶两个 int 型数值相除并将结果入栈      |
| 109 | 0x6D | ldiv  | 把栈顶两个 long 型数值相除并将结果入栈     |
| 110 | 0x6E | fdiv  | 把栈顶两个 float 型数值相除并将结果入栈    |
| 111 | 0x6F | ddiv  | 把栈顶两个 double 型数值相除并将结果入栈   |
| 112 | 0x70 | irem  | 把栈顶两个 int 型数值模运算并将结果入栈     |
| 113 | 0x71 | lrem  | 把栈顶两个 long 型数值模运算并将结果入栈    |
| 114 | 0x72 | frem  | 把栈顶两个 float 型数值模运算并将结果入栈   |
| 115 | 0x73 | drem  | 把栈顶两个 double 型数值模运算并将结果入栈  |
| 116 | 0x74 | ineg  | 把栈顶 int 型数值取负并将结果入栈        |
| 117 | 0x75 | lneg  | 把栈顶 long 型数值取负并将结果入栈       |
| 118 | 0x76 | fneg  | 把栈顶 float 型数值取负并将结果入栈      |
| 119 | 0x77 | dneg  | 把栈顶 double 型数值取负并将结果入栈     |
| 120 | 0x78 | ishl  | 把 int 型数左移指定位数并将结果入栈       |
| 121 | 0x79 | lshl  | 把 long 型数左移指定位数并将结果入栈      |
| 122 | 0x7A | ishr  | 把 int 型数右移指定位数并将结果入栈（有符号）  |
| 123 | 0x7B | lshr  | 把 long 型数右移指定位数并将结果入栈（有符号） |
| 124 | 0x7C | iushr | 把 int 型数右移指定位数并将结果入栈（无符号）  |
| 125 | 0x7D | lushr | 把 long 型数右移指定位数并将结果入栈（无符号） |
| 126 | 0x7E | iand  | 把栈顶两个 int 型数值 按位与 并将结果入栈   |
| 127 | 0x7F | land  | 把栈顶两个 long 型数值 按位与 并将结果入栈  |
| 128 | 0x80 | ior   | 把栈顶两个 int 型数值 按位或 并将结果入栈   |
| 129 | 0x81 | lor   | 把栈顶两个 long 型数值 按或与 并将结果入栈  |
| 130 | 0x82 | ixor  | 把栈顶两个 int 型数值 按位异或 并将结果入栈  |
| 131 | 0x83 | lxor  | 把栈顶两个 long 型数值 按位异或 并将结果入栈 |
| 132 | 0x84 | iinc  | 把指定 int 型增加指定值             |

### Conversions 转换相关

类型转换指令可以将两种不同的数值类型进行相互转换，这些转换操作一般用于实现用户代码中的显示类型转换操作。

Java 虚拟机直接支持（即转换时无需显示的转换指令）小范围类型向大范围类型的安全转换，但在处理窄化类型转换时，必须显式使用转换指令来完成。

|     |      |     |                         |
| --- | ---- | --- | ----------------------- |
| 十进制 | 操作码  | 助记符 | 含义                      |
| 133 | 0x85 | i2l | 把栈顶 int 强转 long 并入栈     |
| 134 | 0x86 | i2f | 把栈顶 int 强转 float 并入栈    |
| 135 | 0x87 | i2d | 把栈顶 int 强转 double 并入栈   |
| 136 | 0x88 | l2i | 把栈顶 long 强转 int 并入栈     |
| 137 | 0x89 | l2f | 把栈顶 long 强转 float 并入栈   |
| 138 | 0x8A | l2d | 把栈顶 long 强转 double 并入栈  |
| 139 | 0x8B | f2i | 把栈顶 float 强转 int 并入栈    |
| 140 | 0x8C | f2l | 把栈顶 float 强转 long 并入栈   |
| 141 | 0x8D | f2d | 把栈顶 float 强转 double 并入栈 |
| 142 | 0x8E | d2i | 把栈顶 double 强转 int 并入栈   |
| 143 | 0x8F | d2l | 把栈顶 double 强转 long 并入栈  |
| 144 | 0x90 | d2f | 把栈顶 double 强转 float 并入栈 |
| 145 | 0x91 | i2b | 把栈顶 int 强转 byte 并入栈     |
| 146 | 0x92 | i2c | 把栈顶 int 强转 char 并入栈     |
| 147 | 0x93 | i2s | 把栈顶 int 强转 short 并入栈    |

### Comparisons 比较相关

|     |      |           |                                                            |
| --- | ---- | --------- | ---------------------------------------------------------- |
| 十进制 | 操作码  | 助记符       | 含义                                                         |
| 148 | 0x94 | lcmp      | 比较栈顶两long 型数值大小，并将结果（1，0，-1）压入栈顶                           |
| 149 | 0x95 | fcmpl     | 比较栈顶两float 型数值大小，并将结果（1，0，-1）压入栈顶；当其中一个数值为“NaN”时，将-1 压入栈顶  |
| 150 | 0x96 | fcmpg     | 比较栈顶两float 型数值大小，并将结果（1，0，-1）压入栈顶；当其中一个数值为“NaN”时，将1 压入栈顶   |
| 151 | 0x97 | dcmpl     | 比较栈顶两double 型数值大小，并将结果（1，0，-1）压入栈顶；当其中一个数值为“NaN”时，将-1 压入栈顶 |
| 152 | 0x98 | dcmpg     | 比较栈顶两double 型数值大小，并将结果（1，0，-1）压入栈顶；当其中一个数值为“NaN”时，将1 压入栈顶  |
| 153 | 0x99 | ifeq      | 当栈顶 int 型数值等于0时，跳转                                         |
| 154 | 0x9A | ifne      | 当栈顶 int 型数值不等于0时，跳转                                        |
| 155 | 0x9B | iflt      | 当栈顶 int 型数值小于0时，跳转                                         |
| 156 | 0x9C | ifge      | 当栈顶 int 型数值大于等于0时，跳转                                       |
| 157 | 0x9D | ifgt      | 当栈顶 int 型数值大于0时，跳转                                         |
| 158 | 0x9E | ifle      | 当栈顶 int 型数值小于等于0时，跳转                                       |
| 159 | 0x9F | if_icmpeq | 比较栈顶两个 int 型数值，等于0时，跳转                                     |
| 160 | 0xA0 | if_icmpne | 比较栈顶两个 int 型数值，不等于0时，跳转                                    |
| 161 | 0xA1 | if_icmplt | 比较栈顶两个 int 型数值，小于0时，跳转                                     |
| 162 | 0xA2 | if_icmpge | 比较栈顶两个 int 型数值，大于等于0时，跳转                                   |
| 163 | 0xA3 | if_icmpgt | 比较栈顶两个 int 型数值，大于0时，跳转                                     |
| 164 | 0xA4 | if_icmple | 比较栈顶两个 int 型数值，小于等于0时，跳转                                   |
| 165 | 0xA5 | if_acmpeq | 比较栈顶两个 引用 型数值，相等时跳转                                        |
| 166 | 0xA6 | if_acmpne | 比较栈顶两个 引用 型数值，不相等时跳转                                       |

### Control 控制相关

控制转移指令可以让 Java 虚拟机有条件或无条件地从指定的位置指令而不是控制转移指令的下一条指令继续执行程序，从概念模型上理解，可以认为控制转移指令就是在有条件或无条件地修改 PC 寄存器的值。

|     |      |              |                                           |
| --- | ---- | ------------ | ----------------------------------------- |
| 十进制 | 操作码  | 助记符          | 含义                                        |
| 167 | 0xA7 | goto         | 无条件分支跳转                                   |
| 168 | 0xA8 | jsr          | 跳转至指定16 位offset（bit） 位置，并将jsr 下一条指令地址压入栈顶 |
| 169 | 0xA9 | ret          | 返回至局部变量指定的index 的指令位置（一般与jsr，jsr_w联合使用）   |
| 170 | 0xAA | tableswitch  | 用于switch 条件跳转，case 值连续（可变长度指令）            |
| 171 | 0xAB | lookupswitch | 用于switch 条件跳转，case 值不连续（可变长度指令）           |
| 172 | 0xAC | ireturn      | 结束方法，并返回一个int 类型数据                        |
| 173 | 0xAD | lreturn      | 从当前方法返回 long                              |
| 174 | 0xAE | freturn      | 从当前方法返回 float                             |
| 175 | 0xAF | dreturn      | 从当前方法返回 double                            |
| 176 | 0xB0 | areturn      | 从当前方法返回 对象引用                              |
| 177 | 0xB1 | return       | 从当前方法返回 void                              |

### references 引用、方法、异常、同步相关

|     |      |                 |                                                                                                                                  |
| --- | ---- | --------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| 十进制 | 操作码  | 助记符             | 含义                                                                                                                               |
| 178 | 0xB2 | getstatic       | 获取指定类的静态域，并将其值压入栈顶                                                                                                               |
| 179 | 0xB3 | putstatic       | 为类的静态域赋值                                                                                                                         |
| 180 | 0xB4 | getfield        | 获取指定类的实例域（对象的字段值），并将其值压入栈顶                                                                                                       |
| 181 | 0xB5 | putfield        | 为指定的类的实例域赋值                                                                                                                      |
| 182 | 0xB6 | invokevirtual   | 调用对象的实例方法，根据对象的实际类型进行分派（虚方法分派），是Java语言中最常见的方法分派方式。                                                                               |
| 183 | 0xB7 | invokespecial   | 调用一些需要特殊处理的实例方法，包括实例初始化方法（）、私有方法和父类方法。这三类方法的调用对象在编译时就可以确定。                                                                       |
| 184 | 0xB8 | invokestatic    | 调用静态方法                                                                                                                           |
| 185 | 0xB9 | invokeinterface | 调用接口方法调，它会在运行时搜索一个实现了这个接口方法的对象，找出适合的方法进行调用。                                                                                      |
| 186 | 0xBA | invokedynamic   | 调用动态链接方法（该指令是指令是Java SE 7 中新加入的）。用于在运行时动态解析出调用点限定符所引用的方法，并执行该方法，前面4条调用指令的分派逻辑都固化在Java虚拟机内部，而invokedynamic指令的分派逻辑是由用户所设定的引导方法决定的。 |
| 187 | 0xBB | new             | 创建一个对象，并将其引用值压入栈顶                                                                                                                |
| 188 | 0xBC | newarray        | 创建一个指定原始类型（如int、float、char……）的数组，并将其引用值压入栈顶                                                                                      |
| 189 | 0xBD | anewarray       | 创建一个引用型（如类，接口，数组）的数组，并将其引用值压入栈顶                                                                                                  |
| 190 | 0xBE | arraylength     | 获得数组的长度值并压入栈顶                                                                                                                    |
| 191 | 0xBF | athrow          | 将栈顶的异常直接抛出。Java程序中显式抛出异常的操作（throw语句）都由athrow指令来实现，并且，在Java虚拟机中，处理异常（catch语句）不是由字节码指令来实现的，而是采用异常表来完成的。                            |
| 192 | 0xC0 | checkcast       | 检验类型转换，检验未通过将抛出ClassCastException                                                                                                |
| 193 | 0xC1 | instanceof      | 检验对象是否是指定的类的实例，如果是将1 压入栈顶，否则将0 压入栈顶                                                                                              |
| 194 | 0xC2 | monitorenter    | 获取对象的monitor，用于同步块或同步方法                                                                                                          |
| 195 | 0xC3 | monitorexit     | 释放对象的monitor，用于同步块或同步方法                                                                                                          |

Java 虚拟机可以支持方法级的同步和方法内部一段指令序列的同步，这两种同步结构都是使用管程（Monitor）来支持的。

方法级的同步是隐式的，即无须通过字节码指令来控制，它实现在方法调用和返回操作之中。虚拟机可以从方法常量池的方法表结构中的 ACC_SYNCHRONIZED 方法标志得知一个方法是否声明为同步方法。当方法调用时，调用指令将会检查方法的 ACC_SYNCHRONIZED 访问标志是否被设置，如果设置了，执行线程就要求先成功持有管程，然后才能执行方法，最后当方法完成（无论是正常完成还是非正常完成）时释放管程。在方法执行期间，执行线程持有了管程，其他任何线程都无法再获取到同一个管程。如果一个同步方法执行期间抛出了异常，并且在方法内部无法处理此异常，那么这个同步方法所持有的管程将在异常抛到同步方法之外时自动释放。

同步一段指令集序列通常是由Java语言中的synchronized语句块来表示的，Java虚拟机的指令集中有monitorenter和monitorexit两条指令来支持synchronized关键字的语义

编译器必须确保无论方法通过何种方式完成，方法中调用过的每条monitorenter指令都必须执行其对应的monitorexit指令，而无论这个方法是正常结束还是异常结束。

### Extended 扩展相关

|     |      |                |                                                     |
| --- | ---- | -------------- | --------------------------------------------------- |
| 十进制 | 操作码  | 助记符            | 含义                                                  |
| 196 | 0xC4 | wide           | 扩展访问局部变量表的索引宽度                                      |
| 197 | 0xC5 | multianewarray | 创建指定类型和指定维度的多维数组（执行该指令时，操作栈中必须包含各维度的长度值），并将其引用值压入栈顶 |
| 198 | 0xC6 | ifnull         | 为 null 时跳转                                          |
| 199 | 0xC7 | ifnonnull      | 非 null 时跳转                                          |
| 200 | 0xC8 | goto_w         | 无条件跳转（宽索引）                                          |
| 201 | 0xC9 | jsr_w          | 跳转指定32bit偏移位置，并将jsr_w下一条指令地址入栈                      |

### Reserved 保留指令

|     |      |            |                 |
| --- | ---- | ---------- | --------------- |
| 十进制 | 操作码  | 助记符        | 含义              |
| 202 | 0xCA | breakpoint | 调试时的断点          |
| 254 | 0xFE | impdep1    | 用于在特定硬件中使用的语言后门 |
| 255 | 0xFF | impdep2    | 用于在特定硬件中使用的语言后门 |

## 字节码编辑软件

![[Pasted image 20240206211329.png]]

[JBE - Java Bytecode Editor](https://set.ee/jbe/)

## 参考文档

1. [Java字节码文件结构剖析 - cexo - 博客园](https://www.cnblogs.com/webor2006/p/9404249.html)
2. [Java字节码结构剖析一：常量池 - 简书](https://www.jianshu.com/p/bc3cfbebef25)
3. [JVM规范 Java SE8官方文档](https://link.juejin.cn/?target=https%3A%2F%2Fdocs.oracle.com%2Fjavase%2Fspecs%2Fjvms%2Fse8%2Fhtml%2Findex.html "https://docs.oracle.com/javase/specs/jvms/se8/html/index.html")
4. [JVM规范中《操作码助记符表》](https://docs.oracle.com/javase/specs/jvms/se8/html/jvms-7.html)
5. [JVM入门教程第5讲：字节码文件结构 - 陈树义 - 博客园](https://www.cnblogs.com/chanshuyi/p/jvm_serial_05_jvm_bytecode_analysis.html)
