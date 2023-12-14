---
aliases: 命令行
tags:
  - java/command
date updated: 2023-05-17 06:01
---

### linux上查看java安装目录

```shell
han@ubuntu:/etc$ whereis java
java: /usr/bin/java /usr/share/java /usr/lib/jvm/java-8-openjdk-amd64/bin/java /usr/share/man/man1/java.1.gz
han@ubuntu:/etc$ ls -lrt /usr/bin/java
lrwxrwxrwx 1 root root 22 4月   2 15:54 /usr/bin/java -> /etc/alternatives/java
han@ubuntu:/etc$ ls -lrt /etc/alternatives/java
lrwxrwxrwx 1 root root 46 4月   2 15:54 /etc/alternatives/java -> /usr/lib/jvm/java-8-openjdk-amd64/jre/bin/java
```

### java

java 接受重定向符号，但是只能接受读取文件

```java
class Main
{
    public static void main(String[] args)
    {
        List<String> tokens = new ArrayList<>();
 
        Scanner scanner = new Scanner(System.in);
        while (scanner.hasNext()) {
            tokens.add(scanner.next());
        }
 
        System.out.println(tokens);
        scanner.close();
    }
}
```

```shell
# main.class
java Main < 1.txt
```

也可以java其命令的输出重定向到某个文件中，其用法类似于标准输出

### javap

`javap [option] class`

- `- v`  输出堆栈大小、各方法的 locals 及 args 数,以及class文件的 [[major_version|编译版本]]

例如

```java
public class Hello {
    public static void main(String[] args) {
        System.out.println("hello");
    }
}
```

在编译后使用 `javap -v Hello` 后

```java
Classfile /D:/download/Hello.class
  Last modified 2022-2-22; size 409 bytes
  MD5 checksum e0b623c37edff568d4ff4685ad50fd2c
  Compiled from "Hello.java"
public class Hello
  minor version: 0
  major version: 52                      // 表示使用的是JDK8
  flags: ACC_PUBLIC, ACC_SUPER
Constant pool:
   #1 = Methodref          #6.#15         // java/lang/Object."<init>":()V
   #2 = Fieldref           #16.#17        // java/lang/System.out:Ljava/io/PrintStream;
   #3 = String             #18            // hello
   #4 = Methodref          #19.#20        // java/io/PrintStream.println:(Ljava/lang/String;)V
   #5 = Class              #21            // Hello
   #6 = Class              #22            // java/lang/Object
   #7 = Utf8               <init>
   #8 = Utf8               ()V
   #9 = Utf8               Code
  #10 = Utf8               LineNumberTable
  #11 = Utf8               main
  #12 = Utf8               ([Ljava/lang/String;)V
  #13 = Utf8               SourceFile
  #14 = Utf8               Hello.java
  #15 = NameAndType        #7:#8          // "<init>":()V
  #16 = Class              #23            // java/lang/System
  #17 = NameAndType        #24:#25        // out:Ljava/io/PrintStream;
  #18 = Utf8               hello
  #19 = Class              #26            // java/io/PrintStream
  #20 = NameAndType        #27:#28        // println:(Ljava/lang/String;)V
  #21 = Utf8               Hello
  #22 = Utf8               java/lang/Object
  #23 = Utf8               java/lang/System
  #24 = Utf8               out
  #25 = Utf8               Ljava/io/PrintStream;
  #26 = Utf8               java/io/PrintStream
  #27 = Utf8               println
  #28 = Utf8               (Ljava/lang/String;)V
{
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

  public static void main(java.lang.String[]);
    descriptor: ([Ljava/lang/String;)V
    flags: ACC_PUBLIC, ACC_STATIC
    Code:
      stack=2, locals=1, args_size=1          // 涉及到一个参数，一个本地变量即"hello"
         0: getstatic     #2                  // Field java/lang/System.out:Ljava/io/PrintStream;
         3: ldc           #3                  // String hello
         5: invokevirtual #4                  // Method java/io/PrintStream.println:(Ljava/lang/String;)V
         8: return
      LineNumberTable:
        line 3: 0
        line 4: 8
}
SourceFile: "Hello.java"
```

^e7cce6

### jinfo

列出运行中的Java程序的运行环境参数

### jmap

打印每个class的实例数目，内存占用，类全名信息。查看是否有类异常加载

```shell
jmap -histo <pid>
```

示例
![[jvm性能排除_2019-12-19-23-48-31.png]]

可将上述命令的输出重定向到文件中，然后使用 `sort -n -k 2` 命令，根据示例数目进行排序，已确定占用数量较多的实例的类

查看当前内存使用情况

输出 `Java` 进程的堆内存信息，包括永久代、年轻代、老年代

```shell
jmap -heap <pid>
```

示例
![[jvm性能排除_2019-12-19-23-58-41.png]]

### jps

查看java进程，列出本机所有的jvm实例

部分 `jps` 参数

- `-m` :输出主函数传入的参数. 下的 hello 就是在执行程序时从命令行输入的参数
- `-l`  输出应用程序主类完整 package 名称或 jar 完整名称.
- `-v` 列出 jvm 参数, -Xms20m -Xmx50m 是启动程序指定的 jvm 参数

### jstack

查看当前线程信息

![[jvm-gc]]

### jstat

`gcutil` 是按百分比占比输出 `gc` 情况的

```java
jstat -gcutil <PID> 5000 # 每5秒输出一次gc
```

| 简写   | 描述                                 |
| ---- | ---------------------------------- |
| S0   |   新生代中 Survivor space 0 区已使用空间的百分比 |
| S1   | 新生代中 Survivor space 1 区已使用空间的百分比   |
| E    | 新生代已使用空间的百分比                       |
| O    | 老年代已使用空间的百分比                       |
| P    | 永久带已使用空间的百分比                       |
| YGC  | 从应用程序启动到当前，发生 Yang GC 的次数          |
| YGCT | 从应用程序启动到当前，Yang GC 所用的时间【单位秒】      |
| FGC  | 从应用程序启动到当前，发生 Full GC 的次数          |
| FGCT | 从应用程序启动到当前，Full GC 所用的时间           |
| GCT  | 从应用程序启动到当前，用于垃圾回收的总时间【单位秒】         |

示例
![[jvm性能排除_2019-12-20-00-04-43.png]]
