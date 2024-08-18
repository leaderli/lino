---
tags:
  - java/框架/asm
date updated: 2024-02-04 20:24
---

## 安装

ASM是一个直接生成 java [[bytecode|字节码]] 的框架

```xml
<dependency>
    <groupId>org.ow2.asm</groupId>
    <artifactId>asm</artifactId>
    <version>6.0</version>
</dependency>
<dependency>
    <groupId>org.ow2.asm</groupId>
    <artifactId>asm-util</artifactId>
    <version>6.0</version>
</dependency>
```

## 快速入门

一个用于生成 `HelloWorld` 的demo

对于一个标准的 HelloWorld 代码

```java
public class HelloWorld {

    public static void main(String[] args) {
        System.out.println("HelloWorld");
    }
}
```

其 [[bytecode|字节码]] 如下

```java
Classfile /D:/work/workspace/idea/JavaDemoAndSnippet/target/test-classes/HelloWorld.class
  Last modified 2022-3-22; size 549 bytes
  MD5 checksum 51591c5f52334e2cf65f23ed60cb036f
  Compiled from "HelloWorld.java"
public class HelloWorld
  minor version: 0
  major version: 52
  flags: ACC_PUBLIC, ACC_SUPER
Constant pool:
   #1 = Methodref          #6.#21         // java/lang/Object."<init>":()V
   #2 = Fieldref           #22.#23        // java/lang/System.out:Ljava/io/PrintStream;
   #3 = String             #24            // HelloWorld
   #4 = Methodref          #25.#26        // java/io/PrintStream.println:(Ljava/lang/String;)V
   #5 = Class              #24            // HelloWorld
   #6 = Class              #27            // java/lang/Object
   #7 = Utf8               <init>
   #8 = Utf8               ()V
   #9 = Utf8               Code
  #10 = Utf8               LineNumberTable
  #11 = Utf8               LocalVariableTable
  #12 = Utf8               this
  #13 = Utf8               LHelloWorld;
  #14 = Utf8               main
  #15 = Utf8               ([Ljava/lang/String;)V
  #16 = Utf8               args
  #17 = Utf8               [Ljava/lang/String;
  #18 = Utf8               MethodParameters
  #19 = Utf8               SourceFile
  #20 = Utf8               HelloWorld.java
  #21 = NameAndType        #7:#8          // "<init>":()V
  #22 = Class              #28            // java/lang/System
  #23 = NameAndType        #29:#30        // out:Ljava/io/PrintStream;
  #24 = Utf8               HelloWorld
  #25 = Class              #31            // java/io/PrintStream
  #26 = NameAndType        #32:#33        // println:(Ljava/lang/String;)V
  #27 = Utf8               java/lang/Object
  #28 = Utf8               java/lang/System
  #29 = Utf8               out
  #30 = Utf8               Ljava/io/PrintStream;
  #31 = Utf8               java/io/PrintStream
  #32 = Utf8               println
  #33 = Utf8               (Ljava/lang/String;)V
{
  public HelloWorld();
    descriptor: ()V
    flags: ACC_PUBLIC
    Code:
      stack=1, locals=1, args_size=1
         0: aload_0
         1: invokespecial #1                  // Method java/lang/Object."<init>":()V
         4: return
      LineNumberTable:
        line 5: 0
      LocalVariableTable:
        Start  Length  Slot  Name   Signature
            0       5     0  this   LHelloWorld;

  public static void main(java.lang.String[]);
    descriptor: ([Ljava/lang/String;)V
    flags: ACC_PUBLIC, ACC_STATIC
    Code:
      stack=2, locals=1, args_size=1
         0: getstatic     #2                  // Field java/lang/System.out:Ljava/io/PrintStream;
         3: ldc           #3                  // String HelloWorld
         5: invokevirtual #4                  // Method java/io/PrintStream.println:(Ljava/lang/String;)V
         8: return
      LineNumberTable:
        line 8: 0
        line 9: 8
      LocalVariableTable:
        Start  Length  Slot  Name   Signature
            0       9     0  args   [Ljava/lang/String;
    MethodParameters:
      Name                           Flags
      args
}
SourceFile: "HelloWorld.java"
```

根据字节码实际内容，用ASM框架的API进行生成

```java
package com.leaderli.demo;

import org.objectweb.asm.ClassWriter;
import org.objectweb.asm.MethodVisitor;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.net.URL;
import java.net.URLClassLoader;

import static org.objectweb.asm.Opcodes.*;


/**
 * @author leaderli
 * @since 2022/3/22
 */
public class ASMTest {


    public static void main(String[] args) throws ClassNotFoundException, IllegalAccessException, InstantiationException, NoSuchMethodException, InvocationTargetException {

        ClassLoader classLoader = ASMTest.class.getClassLoader();
        Class<?> fuck = new ByteClassLoader(new URL[]{}, classLoader).findClass("HelloWorld");

        System.out.println("class:" + fuck.getName());
        for (Method method : fuck.getMethods()) {
            if (method.getName().startsWith("main"))
                method.invoke(null);
        }

    }

    ClassWriter cw = new ClassWriter(0);

    public byte[] serializeToBytes(String outputClazzName) {

        cw.visit(V1_8, ACC_PUBLIC + ACC_SUPER, outputClazzName, null, "java/lang/Object", null);
        addStandardConstructor();
        addMainMethod();
        cw.visitEnd();
        return cw.toByteArray();
    }

    private void addMainMethod() {

        MethodVisitor mv = cw.visitMethod(ACC_PUBLIC + ACC_STATIC, "main", "()V", null, null);
        mv.visitCode();
        mv.visitFieldInsn(GETSTATIC, "java/lang/System", "out", "Ljava/io/PrintStream;");
        mv.visitLdcInsn("Hello World! ");
        mv.visitMethodInsn(INVOKEVIRTUAL, "java/io/PrintStream", "println", "(Ljava/lang/String;)V", false);
        mv.visitInsn(RETURN);
        mv.visitMaxs(2, 1);
        mv.visitEnd();
    }

    private void addStandardConstructor() {

        MethodVisitor mv = cw.visitMethod(ACC_PUBLIC, "<init>", "()V", null, null);
        mv.visitVarInsn(ALOAD, 0);
        mv.visitMethodInsn(INVOKESPECIAL, "java/lang/Object", "<init>", "()V", false);
        mv.visitInsn(RETURN);
        mv.visitMaxs(1, 1);
        mv.visitEnd();
    }
}

class ByteClassLoader extends URLClassLoader {

    public ByteClassLoader(URL[] urls, ClassLoader parent) {
        super(urls, parent);
    }

    @Override
    protected Class<?> findClass(final String name) throws ClassNotFoundException {
        byte[] classBytes = new ASMTest().serializeToBytes(name);
        if (classBytes != null) {
            return defineClass(name, classBytes, 0, classBytes.length);
        }
        return super.findClass(name);
    }

}
```


## 解析字节码


```java
ClassReader classReader = new ClassReader(Person.class.getName());  
Map<String, Textifier> methodVisitors = new HashMap<>();  
ClassVisitor classVisitor = new ClassVisitor(ASM6) {  
    @Override  
    public MethodVisitor visitMethod(int access, String name, String desc, String signature, String[] exceptions) {  
        String id = Modifier.toString(access) + " " + name + " " + desc + " " + signature + " " + Arrays.toString(exceptions);  
        Textifier textifier = new Textifier();  
        methodVisitors.put(id, textifier);  
        return new TraceMethodVisitor(textifier);  
    }  
};  
classReader.accept(classVisitor, 0);  
methodVisitors.forEach((k, v) -> {  
    System.out.println(k);  
    System.out.println(v.getText());  
});
```

```java
public getAAge ()I null null
[   L0
,     LINENUMBER 14 L0
,     ALOAD 0
,     GETFIELD io/leaderli/demo/bean/Person.aAge : I
,     IRETURN
,    L1
,     LOCALVARIABLE this Lio/leaderli/demo/bean/Person; L0 L1 0
,     MAXSTACK = 1
,     MAXLOCALS = 1
]
public getFuck ()Ljava/lang/String; null null
[   L0
,     LINENUMBER 22 L0
,     ALOAD 0
,     GETFIELD io/leaderli/demo/bean/Person.aName : Ljava/lang/String;
,     ARETURN
,    L1
,     LOCALVARIABLE this Lio/leaderli/demo/bean/Person; L0 L1 0
,     MAXSTACK = 1
,     MAXLOCALS = 1
]
public setFuck (Ljava/lang/String;)V null null
[   L0
,     LINENUMBER 26 L0
,     ALOAD 0
,     ALOAD 1
,     PUTFIELD io/leaderli/demo/bean/Person.aName : Ljava/lang/String;
,    L1
,     LINENUMBER 27 L1
,     RETURN
,    L2
,     LOCALVARIABLE this Lio/leaderli/demo/bean/Person; L0 L2 0
,     LOCALVARIABLE aName Ljava/lang/String; L0 L2 1
,     MAXSTACK = 2
,     MAXLOCALS = 2
]
public toString ()Ljava/lang/String; null null
[   L0
,     LINENUMBER 31 L0
,     NEW java/lang/StringBuilder
,     DUP
,     INVOKESPECIAL java/lang/StringBuilder.<init> ()V
,     LDC "Person{aAge="
,     INVOKEVIRTUAL java/lang/StringBuilder.append (Ljava/lang/String;)Ljava/lang/StringBuilder;
,     ALOAD 0
,     GETFIELD io/leaderli/demo/bean/Person.aAge : I
,     INVOKEVIRTUAL java/lang/StringBuilder.append (I)Ljava/lang/StringBuilder;
,     LDC ", aName="
,     INVOKEVIRTUAL java/lang/StringBuilder.append (Ljava/lang/String;)Ljava/lang/StringBuilder;
,     ALOAD 0
,     GETFIELD io/leaderli/demo/bean/Person.aName : Ljava/lang/String;
,     INVOKEVIRTUAL java/lang/StringBuilder.append (Ljava/lang/String;)Ljava/lang/StringBuilder;
,     BIPUSH 125
,     INVOKEVIRTUAL java/lang/StringBuilder.append (C)Ljava/lang/StringBuilder;
,     INVOKEVIRTUAL java/lang/StringBuilder.toString ()Ljava/lang/String;
,     ARETURN
,    L1
,     LOCALVARIABLE this Lio/leaderli/demo/bean/Person; L0 L1 0
,     MAXSTACK = 2
,     MAXLOCALS = 1
]
public setAAge (I)V null null
[   L0
,     LINENUMBER 18 L0
,     ALOAD 0
,     ILOAD 1
,     PUTFIELD io/leaderli/demo/bean/Person.aAge : I
,    L1
,     LINENUMBER 19 L1
,     RETURN
,    L2
,     LOCALVARIABLE this Lio/leaderli/demo/bean/Person; L0 L2 0
,     LOCALVARIABLE aAge I L0 L2 1
,     MAXSTACK = 2
,     MAXLOCALS = 2
]
public <init> ()V null null
[   L0
,     LINENUMBER 7 L0
,     ALOAD 0
,     INVOKESPECIAL java/lang/Object.<init> ()V
,     RETURN
,    L1
,     LOCALVARIABLE this Lio/leaderli/demo/bean/Person; L0 L1 0
,     MAXSTACK = 1
,     MAXLOCALS = 1
]
```

## 参考文档

[官网地址](https://asm.ow2.io/index.html)

[替换加载后的类](https://bukkit.org/threads/tutorial-extreme-beyond-reflection-asm-replacing-loaded-classes.99376/)
