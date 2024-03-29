---
aliases:  java数组
tags:
- java/se/数组
---

## java 在堆中的内存分为三个部分

1. 对象头 `Object header`
2. 值 `value`
3. 对齐 `padding`(不一定存在，java 内存需要对齐 8byte，不足部分填充)

### java 对象头

```java
|--------------------------------------------------------------|
|                     Object Header (64 bits)                  |
|------------------------------------|-------------------------|
|        Mark Word (32 bits)         |    Klass Word (32 bits) |
|------------------------------------|-------------------------|
```

java 数组头

```java
|---------------------------------------------------------------------------------|
|                                 Object Header (96 bits)                         |
|--------------------------------|-----------------------|------------------------|
|        Mark Word(32bits)       |    Klass Word(32bits) |  array length(32bits)  |
|--------------------------------|-----------------------|------------------------|
```

其中`Mark Word`

```java
|-------------------------------------------------------|--------------------|
|                  Mark Word (32 bits)                  |       State        |
|-------------------------------------------------------|--------------------|
| identity_hashcode:25 | age:4 | biased_lock:1 | lock:2 |       Normal       |
|-------------------------------------------------------|--------------------|
|  thread:23 | epoch:2 | age:4 | biased_lock:1 | lock:2 |       Biased       |
|-------------------------------------------------------|--------------------|
|               ptr_to_lock_record:30          | lock:2 | Lightweight Locked |
|-------------------------------------------------------|--------------------|
|               ptr_to_heavyweight_monitor:30  | lock:2 | Heavyweight Locked |
|-------------------------------------------------------|--------------------|
|                                              | lock:2 |    Marked for GC   |
|-------------------------------------------------------|--------------------|
```

```java
|------------------------------------------------------------------------------|--------------------|
|                                  Mark Word (64 bits)                         |       State        |
|------------------------------------------------------------------------------|--------------------|
| unused:25 | identity_hashcode:31 | unused:1 | age:4 | biased_lock:1 | lock:2 |       Normal       |
|------------------------------------------------------------------------------|--------------------|
| thread:54 |       epoch:2        | unused:1 | age:4 | biased_lock:1 | lock:2 |       Biased       |
|------------------------------------------------------------------------------|--------------------|
|                       ptr_to_lock_record:62                         | lock:2 | Lightweight Locked |
|------------------------------------------------------------------------------|--------------------|
|                     ptr_to_heavyweight_monitor:62                   | lock:2 | Heavyweight Locked |
|------------------------------------------------------------------------------|--------------------|
|                                                                     | lock:2 |    Marked for GC   |
|------------------------------------------------------------------------------|--------------------|
```

lock:2 位的锁状态标记位，由于希望用尽可能少的二进制位表示尽可能多的信息，所以设置了 lock 标记。该标记的值不同，整个 mark word 表示的含义不同。

| biased_lock | Tlock |     状态 |
| :---------- | :---: | -------: |
| 0           |  01   |     无锁 |
| 1           |  01   |   偏向锁 |
| 0           |  00   | 轻量级锁 |
| 0           |  10   | 重量级锁 |
| 0           |  11   |  GC 标记 |

1. biased_lock`：对象是否启用偏向锁标记，只占 1 个二进制位。为 1 时表示对象启用偏向锁，为 0 时表示对象没有偏向锁。
2. `age`：4 位的 `Java` 对象年龄。在 `GC` 中，如果对象在 `Survivor` 区复制一次，年龄增加 1。当对象达到设定的阈值时，将会晋升到老年代。默认情况下，并行 `GC` 的年龄阈值为 15，并发 `GC` 的年龄阈值为 6。由于 `age` 只有 4 位，所以最大值为 15，这就是`-XX:MaxTenuringThreshold` 选项最大值为 15 的原因。
3. `identity_hashcode`：25 位的对象标识 `Hash` 码，采用延迟加载技术。调用方法 `System.identityHashCode()`计算，并会将结果写到该对象头中。当对象被锁定时，该值会移动到管程 `Monitor` 中。
4. `thread`：持有偏向锁的线程 `ID`。
5. `epoch`：偏向时间戳。
6. `ptr_to_lock_record`：指向栈中锁记录的指针。
7. `ptr_to_heavyweight_monitor`：指向管程 `Monitor` 的指针。

### class pointer

这一部分用于存储对象的类型指针，该指针指向它的类元数据，`JVM` 通过这个指针确定对象是哪个类的实例。该指针的位长度为 `JVM` 的一个字大小，即 32 位的 `JVM` 为 32 位，64 位的 `JVM` 为 64 位。

### array length

如果对象是一个数组，那么对象头还需要有额外的空间用于存储数组的长度，这部分数据的长度也随着 `JVM` 架构的不同而不同：32 位的 `JVM` 上，长度为 32 位；64 位 `JVM` 则为 64 位。64 位 `JVM` 如果开启`+UseCompressedOops` 选项，该区域长度也将由 64 位压缩至 32 位。

## 数组下标寻址

1. 首先根据栈上的指针找到该数组对象在内存中的位置 `p`

2. 判断 `index` 是否越界，即与数组对象头中存储的 `array length` 做比较

3. 根据数组对象头的 `class pointer` 确定数组元素的内存占用长度 `n`

4. 根据数组对象头长度 `base` 和下标计算出访问的元素的内存位置，即 `p+base+n*index` 

## 数组对象与数组的区别

![genericsAndReflect_代码示例.png](genericsAndReflect_代码示例.png)

其 [[bytecode|字节码]] 如下

```java
public class com/leaderli/demo/TheClassTest {

  public <init>()V
   L0
    LINENUMBER 3 L0
    ALOAD 0
    INVOKESPECIAL java/lang/Object.<init> ()V
    RETURN
   L1
    LOCALVARIABLE this Lcom/leaderli/demo/TheClassTest; L0 L1 0
    MAXSTACK = 1
    MAXLOCALS = 1

  public static varargs test([Ljava/lang/Object;)V
   L0
    LINENUMBER 8 L0
    RETURN
   L1
    LOCALVARIABLE args [Ljava/lang/Object; L0 L1 0
    MAXSTACK = 0
    MAXLOCALS = 1

  public static main([Ljava/lang/String;)V
   L0
    LINENUMBER 10 L0
    ICONST_0                     //压入0
    ANEWARRAY java/lang/String   //弹出栈顶，生成一个栈顶数值长度的String数组
    ASTORE 1                     //弹出栈顶到本地变量1，即p1
   L1
    LINENUMBER 11 L1
    ICONST_1                     //压入1
    ANEWARRAY java/lang/Object   //生成一个长度为1的Object数组
    DUP                          //复制一份引用至栈顶
    ICONST_0                     //压入0
    ALOAD 1                      //压入本地变量1，即p1
    AASTORE                      //弹出栈顶的引用型数值（value）、数组下标（index）、数组引用（arrayref）出栈，将数值存入对应的数组元素中。这里的意思是将p1存入到方法test的形参数组角标0的位置
    INVOKESTATIC com/leaderli/demo/TheClassTest.test ([Ljava/lang/Object;)V // 弹出栈顶所有元素作为参数调用方法，方法返回值会被压入栈顶，因方法返回类型为V，操作栈则清空
   L2
    LINENUMBER 12 L2
    ALOAD 1                       //压入本地变量1
    CHECKCAST [Ljava/lang/Object; //类型检查
    CHECKCAST [Ljava/lang/Object; //类型检查
    ASTORE 2                      //弹出栈顶到本地变量2，即p2
   L3
    LINENUMBER 13 L3
    ALOAD 2                       //压入本地变量1，即p1
    INVOKESTATIC com/leaderli/demo/TheClassTest.test ([Ljava/lang/Object;)V // 弹出栈顶所有元素作为参数调用方法，方法返回值会被压入栈顶，因方法返回类型为V，操作栈则清空
   L4
    LINENUMBER 14 L4
    RETURN
   L5
    LOCALVARIABLE args [Ljava/lang/String; L0 L5 0
    LOCALVARIABLE p1 Ljava/lang/Object; L1 L5 1  //描述符L表示它是对象类型
    LOCALVARIABLE p2 [Ljava/lang/Object; L3 L5 2 //描述符[L表示它是对象数组类型
    MAXSTACK = 4
    MAXLOCALS = 3
}
```


##  带泛型的数组元素

当申明一个带泛型的数组元素时，其实际存储内容并不会对元素泛型进行校验

```java
String[] ss =  new String[1];  
Object[] oo = ss;  
oo[0] = 22; //此处会直接报错


Lino<String>[] linos = new Lino[]{Lino.of("1")};  
Lino[] hello = linos;  
hello[0] = Lino.of(1); // 这里不会报错
```
## 数组常用API

### 环形数组

```java
// 使用 % 来实现
array[tail] = value;
tail = (tail + 1) % array.length;
```
### 数组的class

```java
Object[].class 
```

### 判断类是否为数组

```java
klass.isArray();
```

### 获取数组 class 的申明类型

```java
Person[] ps = new Person[0];
ps.getClass().getComponentType(); // class Person

int[] arr = new int[10];  
arr.getClass().getComponentType(); // int

String.class.getComponentType(); // null

```

### 判断数组是否相等

```java
Arrays.deepEquals(new String[]{"1","2"},new String[]{"1","2"});
```

### 获取基础类型数组的长度

```java
Array.getLength(originalArray)
```

### 基础类型数组转换包装类数组

```java
IntStream.range(0, Array.getLength(originalArray)) 
		 .mapToObj(index -> Array.get(originalArray, index))  
		 .toArray();
```

### 泛型数组的创建

![[reflect#反射工具类创建数组]]