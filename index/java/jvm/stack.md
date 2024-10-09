---
tags:
- java/jvm/jvm栈
---
## 概述

`JVM` 是一个基于栈的架构，每一个线程都有一个用来存储帧集 `(frames)` 的 `JVM`  栈，每次方法被调用的时候(包含 `main` 方法)，在栈上会分配一个新的帧。这个帧包含本地变量数组，操作数栈，常量池指针,程序计数器，动态链接，返回地址。
从概念来说，帧的情况如下图所示

![[java字节码_2020-04-25-12-51-54.png]]

![[java字节码_2020-04-23-10-46-50.png]]


## 本地变量

本地变量的数组也称为本地变量表，包括方法的参数，它也可以用来存储本地变量的值。首先存放的参数，从地址 0 开始编码。如果帧是一个构造器或者实例方法，this 引用讲存储在地址 0 中，地址 1 存放第一个参数，地址 2 存放第二个参数，依次类推。如果帧是一个静态方法，第一个方法参数会存在地址 0 中，地址 1 存放第二个参数，依次类推。

本地变量数组的大小是在编译期决定的，它取决于本地变量和正常方法参数的数量和大小。操作栈是一个用于 push 和 pop 值的后进先出的栈，它的大小也是在编译器决定的。一些操作码指令将值 push  到操作栈，其它的操作码从栈上获取操作数，操作它们，并将值 push  回去。操作栈常用来接收方法的返回值。

本地变量可以是以下几种类型：

- char
- long
- short
- int
- double
- float
- 引用
- 返回地址

除了 long 和 double 类型，每个变量都只占用本地变量区中的一个变量槽(`slot`)，而 long 和  double 只所以会占用两个变量槽(`slot`)，因为 long 和 double 是 64 位的。

当一个新的变量创建时，操作数栈(`Operand stack`)会存储这个新变量的值。然后这个变量会被存储到本地变量表中对应的位置上。如果这个变量不是基础类型的话，本地变量槽存的就是一个`引用`，这个`引用`指向堆中的一个对象。

比如

```java
int i = 5;
```

编译后就变成了

```java
0: bipush      5 //用来将一个字节作为整型数字压入操作数栈中，在这里5就会被压入操作数栈上。
2: istore_0 //这是istore_这组指令集（译注：严格来说，这个应该叫做操作码，opcode ,指令是指操作码加上对应的操作数，oprand。不过操作码一般作为指令的助记符，这里统称为指令）中的一条，这组指令是将一个整型数字存储到本地变量中。n代表的是本地变量区中的位置，并且只能是0,1,2,3。再多的话只能用另一条指令istore了，这条指令会接受一个操作数，对应的是本地变量区中的位置信息。
```

这条指令执行的时候，内存布局是这样的：
![[java字节码_2020-04-23-10-47-55.png]]

每个方法都包含一个本地变量表，如果这段代码在一个方法里面的话，你会在方法的本地变量表中发现如下信息
![[java字节码_2020-04-23-10-48-09.png]]

## 类字段

java 类里面的字段作为类对象实例的一部分，存储在堆里(类变量存储在对应类对象里)。关于字段的信息会添加到类的[[bytecode#类文件的数据结构|field_info]] 数组里

另外如果变量被初始化了，那么初始化的字节码会添加到构造方法里。
下面这段代码编译之后：

```java
public class SimpleClass {
    public int simpleField = 100;
}
```

如果你用 [[index/java/command#javap|javap]] 进行反编译，这个被添加到了[[bytecode#类文件的数据结构|field_info]]数组里的字段就会多了一段描述：

```java
//javap -v SimpleClass
Classfile /C:/Users/pc/Desktop/SimpleClass.class
  Last modified 2021-9-16; size 242 bytes
  MD5 checksum 5e72ac9df8d32a402db494c35624dc25
  Compiled from "SimpleClass.java"
public class SimpleClass
  minor version: 0
  major version: 52
  flags: ACC_PUBLIC, ACC_SUPER
Constant pool:
   #1 = Methodref          #4.#13         // java/lang/Object."<init>":()V
   #2 = Fieldref           #3.#14         // SimpleClass.simpleField:I
   #3 = Class              #15            // SimpleClass
   #4 = Class              #16            // java/lang/Object
   #5 = Utf8               simpleField
   #6 = Utf8               I
   #7 = Utf8               <init>
   #8 = Utf8               ()V
   #9 = Utf8               Code
  #10 = Utf8               LineNumberTable
  #11 = Utf8               SourceFile
  #12 = Utf8               SimpleClass.java
  #13 = NameAndType        #7:#8          // "<init>":()V
  #14 = NameAndType        #5:#6          // simpleField:I
  #15 = Utf8               SimpleClass
  #16 = Utf8               java/lang/Object
{
  public int simpleField;
    descriptor: I
    flags: ACC_PUBLIC

  public SimpleClass();
    descriptor: ()V
    flags: ACC_PUBLIC
    Code:
      stack=2, locals=1, args_size=1
         0: aload_0                    //操作码将this这个引用变量压入操作数栈
         1: invokespecial #1           //弹出栈顶并调用默认构造器#1 Object."<init>":()V
         4: aload_0                    //操作码将this这个引用变量压入到操作数栈
         5: bipush        100          //将100压入操作数栈
         7: putfield      #2           //弹出栈顶两个元素，将100赋值给属性#2 simpleField:I
        10: return
      LineNumberTable:
        line 1: 0
        line 2: 4
}
SourceFile: "SimpleClass.java"
```

可以看到初始化成员变量的字节码会被加到构造方法里，putfield 指令的操作数引用的 [[constant pool|常量池]]里的第二个位置。

上述代码执行的时候内存里面是这样的：

![[java字节码_2020-04-23-10-48-45.png]]

## 常量字段（类常量）

带有`final`标记的常量字段在`class`文件里会被标记成`ACC_FINAL`.

```java
public class SimpleClass {
    public final int simpleField = 100;
}
```

字段的描述信息会标记成`ACC_FINAL`:

```java
public static final int simpleField = 100;
    Signature: I
    flags: ACC_PUBLIC, ACC_FINAL
    ConstantValue: int 100
```

对应的初始化代码并不变：

```java
4: aload_0
5: bipush        100
7: putfield      #2                  // Field simpleField:I
```

## 静态变量

带有 `static` 修饰符的静态变量则会被标记成 `ACC_STATIC`，不过在实例的构造方法中却再也找不到对应的初始化代码了。因为 `static` 变量会在类的构造方法中进行初始化，并且它用的是 `putstatic` 指令而不是 `putfiled` 。

```java
public class Hello {
	public static int age = 100;
}
```
节选部分 [[bytecode|字节码]]
```java
{
  public static int age;
    descriptor: I
    flags: ACC_PUBLIC, ACC_STATIC

  public Hello();
    descriptor: ()V
    flags: ACC_PUBLIC
    Code:
      stack=1, locals=1, args_size=1
         0: aload_0
         1: invokespecial #1                  // Method java/lang/Object."<init>":()V
         4: return
      LineNumberTable:
        line 1: 0

  static {};
    descriptor: ()V
    flags: ACC_STATIC
    Code:
      stack=1, locals=0, args_size=0
         0: bipush        100
         2: putstatic     #2                  // Field age:I
         5: return
      LineNumberTable:
        line 2: 0
}
```

## 动态链接

每个栈帧都包含一个指向运行时常量池中该栈帧所属方法的引用，持有该引用是为了支持方法调用过程中的动态连接。

动态分派在 Java 中被大量使用，使用频率及其高，如果在每次动态分派的过程中都要重新在类的方法元数据中搜索合适的目标的话就可能影响到执行效率，因此 JVM 在类的方法区中建立虚方法表（virtual method table）来提高性能。每个类中都有一个虚方法表，表中存放着各个方法的实际入口。如果某个方法在子类中没有被重写，那子类的虚方法表中该方法的地址入口和父类该方法的地址入口一样，即子类的方法入口指向父类的方法入口。如果子类重写父类的方法，那么子类的虚方法表中该方法的实际入口将会被替换为指向子类实现版本的入口地址。  
那么虚方法表什么时候被创建？虚方法表会在类加载的连接阶段被创建并开始初始化，类的变量初始值准备完成之后，JVM 会把该类的方法表也初始化完毕。

## 程序计数器

是一块比较小的内存空间，它是当前线程 [[bytecode|字节码]] 执行的行号指示器。[[bytecode|字节码]] 就是通过改变这个计数器中的值来选取下一条执行的 [[bytecode|字节码]] 指令的。


## 字节码分析示例
```java
public class Test {
    private String employeeName;

    public String employeeName(){
        return this.employeeName;
    }
}
```

查看其字节码

```java
Classfile /Users/li/Downloads/Test.class
  Last modified Mar 15, 2018; size 309 bytes
  MD5 checksum 4553b41dee731dd099687198deb75de7
  Compiled from "Test.java"
public class Test
  minor version: 0
  major version: 52
  flags: ACC_PUBLIC, ACC_SUPER
Constant pool:
   #1 = Methodref          #4.#15         // java/lang/Object."<init>":()V
   #2 = Fieldref           #3.#16         // Test.name:Ljava/lang/String;
   #3 = Class              #17            // Test
   #4 = Class              #18            // java/lang/Object
   #5 = Utf8               name
   #6 = Utf8               Ljava/lang/String;
   #7 = Utf8               <init>
   #8 = Utf8               ()V
   #9 = Utf8               Code
  #10 = Utf8               LineNumberTable
  #11 = Utf8               employeeName
  #12 = Utf8               ()Ljava/lang/String;
  #13 = Utf8               SourceFile
  #14 = Utf8               Test.java
  #15 = NameAndType        #7:#8          // "<init>":()V
  #16 = NameAndType        #5:#6          // name:Ljava/lang/String;
  #17 = Utf8               Test
  #18 = Utf8               java/lang/Object
{
  java.lang.String name;
    descriptor: Ljava/lang/String;
    flags:

  public Test();
    descriptor: ()V
    flags: ACC_PUBLIC
    Code:
      stack=1, locals=1, args_size=1
         0: aload_0
         1: invokespecial #1                  // Method java/lang/Object."<init>":()V
         4: return
      LineNumberTable:
        line 1: 0

  public java.lang.String employeeName();
    descriptor: ()Ljava/lang/String;
    flags: ACC_PUBLIC
    Code:
      stack=1, locals=1, args_size=1
         0: aload_0
         1: getfield      #2                  // Field name:Ljava/lang/String;
         4: areturn
      LineNumberTable:
        line 4: 0
}
SourceFile: "Test.java"
```

这个方法(line 44)的字节码有三个操作码组成。

1. 第一个操作码 aload_0，用于将局部变量表中索引为 0 的变量的值推送到操作栈上。前面提到过，局部变量表可以用来为方法传递参数的，构造器和实例方法的 this 引用总是存放在局部变量表的地址 0 处，this 引用必须入栈，因为方法需要访问实例的数据，名称和类。
2. 第二个操作码 getfield，用于从对象中提取字段。当该操作码执行的时候，操作栈顶的值就会弹出(pop)，然后＃2 就用来在类运行时常量池中构建一个用于存放字段 name 引用地址的索引，当这个引用被提取时，它会被推送到操作栈上。
3. 第三个操作码 areturn，返回一个来自方法的引用。比较特殊的是，areturn 的执行会导致操作栈顶的值，name 字段的 引用都会被弹出，然后推送到调用方法的操作栈。

employeeName 的方法相当简单，在考虑一个更复杂的例子之前，我们需要检查每一个操作码左边的值。在 employeeName 的方法的字节码中，这些值是 0，1，4。每个方法都有一个对应的字节码数组。这些值对应每个操作码和它们在参数数组的索引，一些操作码含有参数，这些参数会占据字节数组的空间。aload_0 没有参数，自然而然就占据一个字节，因此，下一个操作码 getfield，就在位置 1 上，然而 areturn 在位置 4 上，因为 getfield 操作码和他的参数占据了位置 1，2，3。位置 1 被操作码 getfield 使用，位置 2，3 被用于存放参数，这些参数用于构成在类运行时常量池中存放值的地方的一个索引。下面的图，展示了 employeeName 的方法的字节码数数组看起来的样子

![[java字节码_2020-04-23-10-50-00.png]]

实际上，字节码数组包含代表指令的字节。使用一个 16 进制的编辑器查看 class 文件，可能看到字节码数组中有下面的值

![[java字节码_2020-04-23-10-50-44.png]]

##  synchronized的字节码分析
通过字节码分析 synchronized 方法和 synchronized 代码块的区别

```java
public synchronized int top1()
{
  return intArr[0];
}
public int top2()
{
 synchronized (this) {
  return intArr[0];
 }
}
```

```java
Method int top1()
   0 aload_0           //将局部变量表中索引为0的对象引用this入栈。

   1 getfield #6 <Field int intArr[]>
                       //弹出对象引用this，将访问常量池的intArr对象引用入栈。

   4 iconst_0          //将0入栈。
   5 iaload            //弹出栈顶的两个值，将intArr中索引为0的值入栈。

   6 ireturn           //弹出栈顶的值，将其压入调用方法的操作栈，并退出。


Method int top2()
   0 aload_0           //将局部变量表中索引为0的对象引用this入栈。
   1 astore_2          //弹出this引用，存放到局部变量表中索引为2的地方。
   2 aload_2           //将this引用入栈。
   3 monitorenter      //弹出this引用，获取对象的监视器。

   4 aload_0           //开始进入同步块。将this引用压入局部变量表索引为0的地方。

   5 getfield #6 <Field int intArr[]>
                       //弹出this引用，压入访问常量池的intArr引用。

   8 iconst_0          //压入0。
   9 iaload            //弹出顶部的两个值，压入intArr索引为0的值。

  10 istore_1          //弹出值，将它存放到局部变量表索引为1的地方。

  11 jsr 19            //压入下一个操作码(14)的地址，并跳转到位置19。
  14 iload_1           //压入局部变量表中索引为1的值。

  15 ireturn           //弹出顶部的值，并将其压入到调用方法的操作栈中，退出。

  16 aload_2           //同步块结束。将this引用压入到局部变量表索引为2的地方。

  17 monitorexit       //弹出this引用，退出监视器。

  18 athrow            //弹出this引用，抛出异常。

  19 astore_3          //弹出返回地址(14)，并将其存放到局部变量表索引为3的地方。

  20 aload_2           //将this引用压入到局部变量索引为2的地方。

  21 monitorexit       //弹出this引用，并退出监视器。

  22 ret 3             //从局部变量表索引为3的值(14)指示的地方返回。
Exception table:       //如果在位置4(包括4)和位置16(排除16)中出现异常，则跳转到位置16.
from to target type
 4   16   16   any
```

top2 比 top1 大，执行还慢，是因为 top2 采取的同步和异常处理方式。注意到 top1 采用 synchronized 方法修饰符，这不会产生额外的字节码。相反 top2 在方法体内使用 synchronized 同步代码块，会产生 monitorenter 和 monitorexit 操作码的字节码，还有额外的用于处理异常的字节码。如果执行到一个同步锁的块(一个监视器)内部时，抛出了一个异常，这个锁要保证在退出同步代码块前被释放。top1 的实现要比 top2 的效率高一些，这能获取一丁点的性能提升。

当 synchronized 方法修饰符出现的时候，锁的获取和释放不是通过 monitorenter 和 monitorexit 操作码来实现的，而是在 JVM 调用一个方法时，它检查 ACC_SYNCHRONIZED 属性的标识。如果有这个标识，正在执行的线程将会先获取一个锁，调用方法然后在方法返回时释放锁。如果同步方法抛出异常，在异常离开方法前会自动释放锁。
