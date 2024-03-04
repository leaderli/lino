---
tags:
  - java/框架/javaassist
date updated: 2024-02-28 22:55
---

## 快速入门

```maven
<dependency>
    <groupId>org.javassist</groupId>
    <artifactId>javassist</artifactId>
	<version>3.29.2-GA</version>
</dependency>
```

```java
package com.leaderli.liutil;

import javassist.*;
import javassist.bytecode.AnnotationsAttribute;
import javassist.bytecode.ConstPool;
import javassist.bytecode.annotation.Annotation;

import java.lang.reflect.Method;
import java.net.URL;
import java.net.URLClassLoader;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

public class TestAssist {

    public static final Map<String, Class<?>> ASSIST_CLASS = new HashMap<>();


    public static class ByteClassLoader extends URLClassLoader {

        public static final String PREFIX = "leaderli.com.";

        public ByteClassLoader(URL[] urls, ClassLoader parent) {
            super(urls, parent);
        }

        @Override
        protected Class<?> findClass(final String name) throws ClassNotFoundException {
            Class<?> cls = ASSIST_CLASS.get(name);
            if (cls != null) {
                return cls;
            }
            return super.findClass(name);
        }

    }

    static ByteClassLoader loader = new ByteClassLoader(new URL[]{}, ByteClassLoader.class.getClassLoader());

    static {
        try {
            init("Fuck");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public static void init(String name) throws Exception {
        ClassPool classPool = ClassPool.getDefault();

        String classname = ByteClassLoader.PREFIX + name;
        //生成类名
        CtClass ct = classPool.makeClass(classname);//Create class
        //生成属性
        CtField id = CtField.make("public int id;", ct);
        ConstPool constPool = ct.getClassFile().getConstPool();
        //属性增加注解
        AnnotationsAttribute annotationsAttribute = new AnnotationsAttribute(constPool, AnnotationsAttribute.visibleTag);
        Annotation annotation = new Annotation(Deprecated.class.getName(), constPool);
        annotationsAttribute.addAnnotation(annotation);
        id.getFieldInfo().addAttribute(annotationsAttribute);
        ct.addField(id);
        //生成构造器
        CtConstructor constructor = CtNewConstructor.make("public " + name + "(int pId){this.id=pId;}", ct);
        ct.addConstructor(constructor);
        //生成方法
        CtMethod helloM = CtNewMethod.make("public void hello2(String des){ System.out.println(des);}", ct);
        ct.addMethod(helloM);
        //方法增加注解
        helloM.getMethodInfo().addAttribute(annotationsAttribute);
        ASSIST_CLASS.put(name, ct.toClass());
    }

    public static void main(String[] args) throws Exception {


        Class<?> cls = loader.findClass("Fuck");
        System.out.println(cls);
        System.out.println(Arrays.toString(cls.getField("id").getAnnotations()));

        Object o = cls.getConstructor(int.class).newInstance(123);
        System.out.println(cls.getField("id").get(o));
        Method method = cls.getMethod("hello2", String.class);
        System.out.println(Arrays.toString(method.getAnnotations()));
        method.invoke(o, "fuck");
    }
}

```

## 概述

javassist是一个生成或修改java字节码的框架，他相对与[[ASM]]来说较轻量，使用起来较简洁，但有局限性。javassist不允许删除方法或字段，但允许更改名称。不允许修改方法的参数

### CtClass

java[[bytecode|字节码]]以二进制的形式存储在class文件中，在javassist中，类`CtClass`表示class的字节码对象，一个CtClass对象可以处理一个class字节码对象。

```java
ClassPool pool = ClassPool.getDefault();
CtClass cc = pool.get("test.Rectangle");
cc.setSuperclass(pool.get("test.Point"));
cc.writeFile();

//直接获取字节码文件
byte[] bytes = cc.toBytecode();
//使用当前线程的ClassLoader加载以CtClass对象转换的Class对象
Class clazz = cc.toClass();
```

在上面的例子中，修改了类的字节码对象，这项修改通过writeFile()将CtClass对象转换为[[bytecode|字节码]]文件并写到磁盘中。

==需要注意的是，CtClass做的修改是不会同步到已经被类加载器加载的类对象上的==

CtClass对象代表的class的文件中涉及到的其他class的引用，也需要在[[#ClassPool]]的[[#classpath]]中，

当不需要使用CtClass对象时，可以使用`detach()`方法，或者直接回收`ClassPool`，以避免加载过多Ctclass对象而造成巨大的内存消耗。调用detach之后，就不能调用这个CtClass对象的任何方法了，但可以调用[[#ClassPool]]的get方法，重新读取这个类文件，创建一个新的CtClass对象。

也可以直接回收[[#ClassPool]]，或者创建一个新的[[#ClassPool]]

```java
CtClass cc;
//回收
cc.detach();
```

### ClassPool

ClassPool是CtClass对象的容器。它按需要读取类文件来构造CtClass对象，并且保存CtClass对象以便以后使用。

ClassPool是一个存储CtClass的Hash表，ClassPool的get()函数用于从Hash表中查找指定Key的CtClass对象，如果没有找到，get()函数会在其[[#classpath]]下查找指定名称的[[bytecode|字节码]]文件，创建并返回一个新的CtClass对象，这个新对象会保存在Hash表中。

如果程序在web应用服务器上运行，则可能需要创建多个ClassPool实例。正确的做法应该为每一个ClassLoader创建一个ClassPool实例，ClassPool应当通过构造函数来生成，而不是调用getDefault()来创建。

==ClassPool的层级关系应当保持和ClassLoader一致==

```java
//parent classloader
ClassPool parent = ClassPool.getDefault();

//child classloader
ClassPool child = new ClassPool(parent);


```

## 修改与加载类

对于已经被ClassLoader加载的类，CtClass对其[[bytecode|字节码]]做的修改是无法及时生效的。

```java
//com.AssistDemo.java
package com;  
public class AssistDemo {  
  
    private int id = 1;  
}
```

```java
ClassPool pool = ClassPool.getDefault();  
CtClass cc = pool.get(AssistDemo.class.getName());  
cc.toClass();
```

上述代码会抛出如下异常

```java
javassist.CannotCompileException: by java.lang.LinkageError:
loader (instance of  sun/misc/Launcher$AppClassLoader):
attempted  duplicate class definition for name: "com/AssistDemo"
```

当我们使用如下方式去修改时，则可以生效

```java
CtClass cc = pool.get("com.AssistDemo");  
  
CtField id = cc.getField("id");  
id.setName("newName");  
  
Class<?> aClass = cc.toClass();  
  
System.out.println(Arrays.toString(aClass.getDeclaredFields()));  
System.out.println(Arrays.toString(AssistDemo.class.getDeclaredFields()));

```

```
[private int com.AssistDemo.newName]
[private int com.AssistDemo.newName]
```

如果事先知道需要修改哪些类，修改类的最简方法如下

1. 调用ClassPool.get() 获取CtClass对象
2. 修改CtClass
3. 调用CtClass对象的writeFile()或者toBytecode()获取修改过的类

==如果在加载时，可以确定是否需要修改某个类，用户必须使javassist和类加载器协作，以便在类加载过程中先修改字节码。用户可以定义自己的类加载器，也可以使用javassist提供的类加载器==

[[#类加载器]]

如果一个CtClass对象通过writeFile()，toClass()，toBytecode()被转换成一个类文件，此CtClass对象会被冻结起来，不允许再修改。因为一个类只能被JVM加载一次。

但是，一个被冻结的CtClass也可以解冻，解冻后则可以继续修改了。

```java

CtClass cc = ...;

cc.writeFile();
cc.defrost();
cc.setSuperClass(...)

```

## classpath

如果程序运行在tomcat等web服务器上，ClassPool可能无法找到用户的类，因为web服务器使用多个类加载器作为系统类加载器，在这种情况下，ClassPool必须添加额外的类搜索路径。

```java
//获取使用JVM的类搜索路径
ClassPool classPool = ClassPool.getDefault();  
//将this指向的类的classloader的类加载路径添加到pool的类加载路径
classPool.insertClassPath(new ClassClassPath(this.getClass()));

```

也可以注册一个目录作为类搜索路径

```java
ClassPool classPool = ClassPool.getDefault();  
classPool.insertClassPath("/user/local/javalib");
```

也可以直接传递byte数组

```java
ClassPool cp = ClassPool.getDefault();
//java byte ;
byte[] b;
//className
String name;
cp.insertClassPath(new ByteArrayClassPath(name, b));
CtClass cc = cp.get(name);
```

当不知道类名的时候可以使用输入流

```java
ClassPool cp = ClassPool.getDefault();
//字节码文件流
InputStream ins;
CtClass cc = cp.makeClass(ins);
```

## 类加载器

注入当前线程的上下文类加载器

```java
try {
    Class.forName("MyClass");
} catch(ClassNotFoundException e) {
    ClassPool pool = ClassPool.getDefault();
    CtClass cc = pool.makeClass("MyClass");
    cc.toClass(this.getClass().getClassLoader(), this.getClass().getProtectionDomain());
    Class.forName("MyClass");
}
```

当在tomcat等容器上运行时，toClass() 使用的上下文类加载器可能是不合适的，

```java
//需要操作的类对象
CtClass cc;
//传递合适的类加载器
Class c = cc.toClass(bean.getClass().getClassLoader());
```

javaassist提供一个类加载器javassist.Loader。它使用javaassist.ClassPool对象来读取类文件。

例如

```java
ClassPool pool = ClassPool.getDefault();  
CtClass cc = pool.get("com.AssistDemo");  
  
Loader cl = new Loader(pool);  
Class<?> aClass = cl.loadClass("com.AssistDemo");  
Object o = aClass.newInstance();  
System.out.println(aClass + "@" + aClass.hashCode()+" "+aClass.getClassLoader());  
aClass = AssistDemo.class;  
System.out.println(aClass + "@" + aClass.hashCode()+" "+aClass.getClassLoader());

//class com.AssistDemo@425918570 javassist.Loader@368102c8
//class com.AssistDemo@1100439041 sun.misc.Launcher$AppClassLoader@18b4aac2
```

如果希望在加载时按需修改类，则可以向javassist.Loader添加一个监听器

```java
public interface Translator {
    public void start(ClassPool pool) throws NotFoundException, CannotCompileException;
    public void onLoad(ClassPool pool, String classname) throws NotFoundException, CannotCompileException;
}
```

注意，onLoad() 不必调用 toBytecode() 或 writeFile()，因为 javassist.Loader 会调用这些方法来获取类文件。

使用示例

```java
class MyTranslator implements Translator {  
  
    @Override  
 public void start(ClassPool classPool) throws NotFoundException, CannotCompileException {  
  
        System.out.println("start:" + classPool);  
    }  
  
    @Override  
 public void onLoad(ClassPool classPool, String name) throws NotFoundException, CannotCompileException {  
        System.out.println("onload:" + classPool + " " + name);  
  
        CtClass ctClass = classPool.get(name);  
        System.out.println(Arrays.toString(ctClass.toClass().getDeclaredFields()));  
  
        ctClass.defrost();  
        ctClass.getField("id").setName("fuck");  
  
    }  
}

```

```java
public void test4() throws Throwable {  
  
    ClassPool pool = ClassPool.getDefault();  
    Loader cl = new Loader(pool);  
    String name = "com.AssistDemo";  
    cl.addTranslator(pool, new MyTranslator());  
    System.out.println(Arrays.toString(cl.loadClass(name).getDeclaredFields()));  
  
}
```

> start:[class path: java.lang.Object.class;]

onload:[class path: java.lang.Object.class;] com.AssistDemo
[private int com.AssistDemo.id]
[private int com.AssistDemo.fuck]

## 注意事项

Java 中的装箱和拆箱是语法糖。没有用于装箱或拆箱的字节码。所以 Javassist 的编译器不支持它们

```java
//无法通过编译
CtField id = CtField.make("public Integer id = 1;", ct);

//需要显式的装箱拆箱
CtField id = CtField.make("public Integer id = new Integer(1);", ct);
```

可变参数，泛型，类型转换等语法糖，都会遇到类似问题

## 常用API

### 定义新类

```java
ClassPool pool = ClassPool.getDefault();
CtClass cc = pool.makeClass("Point");

//定义接口
pool.makeInterface("IPoint");
```

### 从字节码中加载类

```java
// 字节码
byte[] classfileBuffer;
CtClass ctClass = classPool.makeClass(new ByteArrayInputStream(classfileBuffer));

```

### 适配jacoco

[[jacoco]] 通过 [[java agent]] 来给类中添加属性，用以记录代码覆盖率。而javassist是从class文件中读取字节码的。

当javassist通过 Instrumentation 将对字节码的修改重新加载时，会丢失jacoco添加的变量和方法，而 jvm 是不允许修改已加载类的属性和方法，会抛出 `class redefinition failed: attempted to change the schema (add/remove fields)`。

那么我们就需要让javasssit去直接加载jacoco修改后的字节码。我们的思路是，在javassist加载类(getCtClass)时，添加一个临时 ClassFileTransformer，然后触发类的重新加载retransformClasses。此时可以拿到jacoco修改过的字节码，我们则直接通过该字节码来触发CtClass的加载。

加载后立即删除临时的ClassFileTransformer。避免非必要的类，触发重复加载。

下面是代码示例：

```java
public static ClassPool classPool = ClassPool.getDefault();  
private static boolean jacoco;

for (Class<?> loadedClass : instrumentation.getAllLoadedClasses()) {  
    if (ClassFileTransformer.class.isAssignableFrom(loadedClass)) {  
        if (loadedClass.getName().startsWith("org.jacoco.agent.rt")) {  
            jacoco = true;  
            return;  
        }  
    }  
}



static class TempClassFileTransformer implements ClassFileTransformer {  
    final Instrumentation instrumentation;  
  
    TempClassFileTransformer(Instrumentation instrumentation) {  
        this.instrumentation = instrumentation;  
    }  
  
    @Override  
    public byte[] transform(ClassLoader loader, String className, Class<?> classBeingRedefined, ProtectionDomain protectionDomain, byte[] classfileBuffer) throws IllegalClassFormatException {  
        try {  
            CtClass ctClass = classPool.makeClass(new ByteArrayInputStream(classfileBuffer));  
        } catch (IOException ignore) {  
        }        
        instrumentation.removeTransformer(this);  
        return null;  
    }  
}


// 在获取CtClass前，添加一个临时ClassFileTransformer用来读取已经加载的字节码，并用来加载到classPool中
  
public static CtClass getCtClass(Class<?> clazz) {  
    try {  
        if (instrumentation.isModifiableClass(clazz)) {  
            instrumentation.addTransformer(new TempClassFileTransformer(instrumentation), true);  
            instrumentation.retransformClasses(clazz);  
        }  
  
        return classPool.getCtClass(clazz.getName());  
    } catch (Exception e) {  
        throw new RuntimeException(clazz + " : " + e);  
    }  
}
```

### 添加注解

```java
//添加枚举类型的注解

AnnotationsAttribute attr = new AnnotationsAttribute(constpool, AnnotationsAttribute.visibleTag);

Annotation annot = new Annotation("org.mengyun.tcctransaction.api.Compensable", constpool);
EnumMemberValue enumMemberValue = new EnumMemberValue(constpool);
enumMemberValue.setType("org.mengyun.tcctransaction.api.Propagation");
enumMemberValue.setValue("SUPPORTS");
annot.addMemberValue("propagation", enumMemberValue);
annot.addMemberValue("confirmMethod", new StringMemberValue(ctMethod.getName(), constpool));

```

需要特别注意的是，注解的值，需要使用特殊的方法赋值，不能直接赋值

```java
ConstPool constPool = ct.getClassFile().getConstPool();

//方法增加注解
AnnotationsAttribute annotationsAttribute = new AnnotationsAttribute(constPool, AnnotationsAttribute.visibleTag);

Annotation requestMapping = new Annotation(RequestMapping.class.getName(), constPool);
StringMemberValue url = new StringMemberValue(constPool);
url.setValue("/6666");

EnumMemberValue type = new EnumMemberValue(constPool);
type.setType(PackageType.class.getName());
type.setValue(PackageType.TOUDA_JSON_OUT.name());
requestMapping.addMemberValue("url", url);
requestMapping.addMemberValue("type", type);

annotationsAttribute.addAnnotation(requestMapping);

helloM.getMethodInfo().addAttribute(annotationsAttribute);

```

### 修改成员变量名称

```java
ClassPool pool = ClassPool.getDefault();  
CtClass ctClass = pool.get("com.AssistDemo");  
CtField id = ctClass.getField("id");  
CodeConverter codeConverter = new CodeConverter();  
codeConverter.redirectFieldAccess(id,ctClass,"id2");  
id.setName("id2");  
ctClass.instrument(codeConverter);  
ctClass.toClass().newInstance();
```

上述方法不会将成员变量id删除，而是新生成一个成员变量id2，以及替换所有使用到成员变量id的地方。

### 修改方法

```java
import io.leaderli.litool.core.test.StringValues;  
import javassist.ClassPool;  
import javassist.CtClass;  
import javassist.CtMethod;  
  
/**  
 * @author leaderli * @since 2022/9/30 */  
public class javassist_1 {  
  
    public static final String[] value = new String[]{"Hello form javassist", "fuck", "fuck2"};  
  
    static int i = 0;  
  
    public static String value() {  
        return value[i++];  
    }  
  
    public static void main(String[] args) throws Exception {  
  
        ClassPool classPool = ClassPool.getDefault();  
        CtClass ctClass = classPool.get("Welcome");  
        CtMethod ctMethod = ctClass.getDeclaredMethod("sayHello");  
        ctMethod.setBody("{ return javassist_1.value(); }");  
  
        Class<?> aClass = ctClass.toClass();  
        ctClass.defrost();  
  
        System.out.println(Welcome.sayHello());  
        ctMethod.setBody("{ return \"1\"; }");  
        aClass = ctClass.toClass();  
        System.out.println(Welcome.sayHello());  
        System.out.println(Welcome.sayHello());  

        ctClass.defrost();  
		ctMethod = ctClass.getDeclaredMethod("sayHello","(Ljava/lang/String;)Ljava/lang/String;"); 
        // 获取参数1，参数0表示this 
        ctMethod.setBody("{ return $1; }");  
        System.out.println(Welcome.sayHello2());  
  
    }  
  
  
}  
class Welcome {  
    public static String sayHello(String msg) {  
        return "Hello!!!!";  
    }  
	public static String sayHello(String msg) {  
        return "Hello!!!!";  
    }  
}
```

### 添加异常捕获

添加的catch 必须以 `throw` or `return` 结尾

```java
CtMethod m = ...;
CtClass etype = ClassPool.getDefault().get("java.io.IOException");
m.addCatch("{ System.out.println($e); throw $e; }", etype);
```

相当于

```java
try {
   // the original method body_
}
catch (java.io.IOException e) {
    System.out.println(e);
    throw e;
}
```

### 添加import

```java
ClassPool cl;
cl.importPackage("io.leaderli.litool.test.LiMock");
```

## 替换代码中的变量

`3.25.0-GA` 以上 版本有些功能才能正常使用

| 值                     | 说明                                                                                                                 |
| --------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `$0`, `$1`, `$2`, ... | `this` and actual parameters                                                                                       |
| `$args`               | An array of parameters. The type of `$args` is `Object[]`.                                                         |
| `$$`                  | All actual parameters.                                                                                             |
| `$cflow(`...`)`       | `cflow` variable                                                                                                   |
| `$r`                  | The result type. It is used in a cast expression.                                                                  |
| `$w`                  | The wrapper type. It is used in a cast expression.                                                                 |
| `$sig`                | An array of `java.lang.Class` objects representing the formal parameter types.                                     |
| `$type`               | A `java.lang.Class` object representing the formal result type.                                                    |
| `$class`              | A `java.lang.Class` object representing the class that declares the method  <br>currently edited (the type of $0). |

[Javassist Tutorial](https://www.javassist.org/tutorial/tutorial2.html)

## 装箱

javaassit 不会自动装箱、解箱，下面的代码都是无效的

```java
Integer a =  3;
int a  =  new Integer(3)
```

需要手动如下调用

```java
Integer a = new Integer(3)
int a  =  new Integer(3).intValue()
```

## 替换已经加载类

通过 java-agent的方式实现

```java
package io.leaderli.demo.bytebuddy;  
  
/*  
Copyright (c) 2017 Turn Inc  
All rights reserved.  
  
The contents of this file are subject to the MIT License as provided  
below. Alternatively, the contents of this file may be used under  
the terms of Mozilla Public License Version 1.1,  
the terms of the GNU Lesser General Public License Version 2.1 or later,  
or the terms of the Apache License Version 2.0.  
  
License:  
  
Permission is hereby granted, free of charge, to any person obtaining a copy of  
this software and associated documentation files (the "Software"), to deal in  
the Software without restriction, including without limitation the rights to  
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of  
the Software, and to permit persons to whom the Software is furnished to do so,  
subject to the following conditions:  
  
The above copyright notice and this permission notice shall be included in all  
copies or substantial portions of the Software.  
  
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR  
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS  
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR  
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER  
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN  
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.  
*/  
  
import com.sun.tools.attach.VirtualMachine;  
import javassist.CannotCompileException;  
import javassist.ClassPool;  
import javassist.CtClass;  
import javassist.NotFoundException;  
  
import java.io.File;  
import java.io.FileOutputStream;  
import java.io.IOException;  
import java.lang.instrument.ClassDefinition;  
import java.lang.instrument.Instrumentation;  
import java.lang.instrument.UnmodifiableClassException;  
import java.lang.management.ManagementFactory;  
import java.util.jar.Attributes;  
import java.util.jar.JarEntry;  
import java.util.jar.JarOutputStream;  
import java.util.jar.Manifest;  
import java.util.logging.Level;  
import java.util.logging.Logger;  
  
/**  
 * Packages everything necessary to be able to redefine a class using {@link Instrumentation} as provided by  
 * Java 1.6 or later. Class redefinition is the act of replacing a class' bytecode at runtime, after that class * has already been loaded. * <p>  
 * The scheme employed by this class uses an agent (defined by this class) that, when loaded into the JVM, provides * an instance of {@link Instrumentation} which in turn provides a method to redefine classes.  
 * <p>  
 * Users of this class only need to call {@link #redefineClasses(ClassDefinition...)}. The agent stuff will be done  
 * automatically (and lazily). * <p>  
 * Note that classes cannot be arbitrarily redefined. The new version must retain the same schema; methods and fields * cannot be added or removed. In practice this means that method bodies can be changed. * <p>  
 * Note that this is a replacement for javassist's {@code HotSwapper}. {@code HotSwapper} depends on the debug agent * to perform the hotswap. That agent is available since Java 1.3, but the JVM must be started with the agent enabled, * and the agent often fails to perform the swap if the machine is under heavy load. This class is both cleaner and more * reliable. * * @see Instrumentation#redefineClasses(ClassDefinition...)  
 * * @author Adam Lugowski */public class RedefineClassAgent {  
    /**  
     * Use the Java logger to avoid any references to anything not supplied by the JVM. This avoids issues with     * classpath when compiling/loading this class as an agent.     */    private static final Logger LOGGER = Logger.getLogger(RedefineClassAgent.class.getSimpleName());  
  
    /**  
     * Populated when this class is loaded into the JVM as an agent (via {@link #ensureAgentLoaded()}.     */    private static volatile Instrumentation instrumentation = null;  
  
    /**  
     * How long to wait for the agent to load before giving up and assuming the load failed.     */    private static final int AGENT_LOAD_WAIT_TIME_SEC = 10;  
  
    /**  
     * Agent entry point. Do not call this directly.     * <p>  
     * This method is called by the JVM when this class is loaded as an agent.     * <p>  
     * Sets {@link #instrumentation} to {@code inst}, provided {@code inst} supports class redefinition.     *     * @param agentArgs ignored.  
     * @param inst This is the reason this class exists. {@link Instrumentation} has the  
     *             {@link Instrumentation#redefineClasses(ClassDefinition...)} method.  
     */    public static void agentmain(String agentArgs, Instrumentation inst) {  
        if (!inst.isRedefineClassesSupported()) {  
            LOGGER.severe("Class redefinition not supported. Aborting.");  
            return;  
        }  
  
        instrumentation = inst;  
    }  
  
    /**  
     * Attempts to redefine class bytecode.     * <p>  
     * On first call this method will attempt to load an agent into the JVM to obtain an instance of     * {@link Instrumentation}. This agent load can introduce a pause (in practice 1 to 2 seconds).  
     *     * @see Instrumentation#redefineClasses(ClassDefinition...)  
     *     * @param definitions classes to redefine.  
     * @throws UnmodifiableClassException as thrown by {@link Instrumentation#redefineClasses(ClassDefinition...)}  
     * @throws ClassNotFoundException as thrown by {@link Instrumentation#redefineClasses(ClassDefinition...)}  
     * @throws FailedToLoadAgentException if agent either failed to load or if the agent wasn't able to get an  
     *                                    instance of {@link Instrumentation} that allows class redefinitions.  
     */    public static void redefineClasses(ClassDefinition... definitions)  
            throws UnmodifiableClassException, ClassNotFoundException, FailedToLoadAgentException {  
        ensureAgentLoaded();  
        instrumentation.redefineClasses(definitions);  
    }  
  
    /**  
     * Lazy loads the agent that populates {@link #instrumentation}. OK to call multiple times.     *     * @throws FailedToLoadAgentException if agent either failed to load or if the agent wasn't able to get an  
     *                                    instance of {@link Instrumentation} that allows class redefinitions.  
     */    private static void ensureAgentLoaded() throws FailedToLoadAgentException {  
        if (instrumentation != null) {  
            // already loaded  
            return;  
        }  
  
        // load the agent  
        try {  
            File agentJar = createAgentJarFile();  
  
            // Loading an agent requires the PID of the JVM to load the agent to. Find out our PID.  
            String nameOfRunningVM = ManagementFactory.getRuntimeMXBean().getName();  
            String pid = nameOfRunningVM.substring(0, nameOfRunningVM.indexOf('@'));  
  
            // load the agent  
            VirtualMachine vm = VirtualMachine.attach(pid);  
            vm.loadAgent(agentJar.getAbsolutePath(), "");  
            vm.detach();  
        } catch (Exception e) {  
            throw new FailedToLoadAgentException(e);  
        }  
  
        // wait for the agent to load  
        for (int sec = 0; sec < AGENT_LOAD_WAIT_TIME_SEC; sec++) {  
            if (instrumentation != null) {  
                // success!  
                return;  
            }  
  
            try {  
                LOGGER.info("Sleeping for 1 second while waiting for agent to load.");  
                Thread.sleep(1000);  
            } catch (InterruptedException e) {  
                Thread.currentThread().interrupt();  
                throw new FailedToLoadAgentException();  
            }  
        }  
  
        // agent didn't load  
        throw new FailedToLoadAgentException();  
    }  
  
    /**  
     * An agent must be specified as a .jar where the manifest has an Agent-Class attribute. Additionally, in order     * to be able to redefine classes, the Can-Redefine-Classes attribute must be true.     *     * This method creates such an agent Jar as a temporary file. The Agent-Class is this class. If the returned Jar     * is loaded as an agent then {@link #agentmain(String, Instrumentation)} will be called by the JVM.  
     *     * @return a temporary {@link File} that points at Jar that packages this class.  
     * @throws IOException if agent Jar creation failed.  
     */    private static File createAgentJarFile() throws IOException {  
        File jarFile = File.createTempFile("agent", ".jar");  
        jarFile.deleteOnExit();  
  
        // construct a manifest that allows class redefinition  
        Manifest manifest = new Manifest();  
        Attributes mainAttributes = manifest.getMainAttributes();  
        mainAttributes.put(Attributes.Name.MANIFEST_VERSION, "1.0");  
        mainAttributes.put(new Attributes.Name("Agent-Class"), RedefineClassAgent.class.getName());  
        mainAttributes.put(new Attributes.Name("Can-Retransform-Classes"), "true");  
        mainAttributes.put(new Attributes.Name("Can-Redefine-Classes"), "true");  
  
        try (JarOutputStream jos = new JarOutputStream(new FileOutputStream(jarFile), manifest)) {  
            // add the agent .class into the .jar  
            JarEntry agent = new JarEntry(RedefineClassAgent.class.getName().replace('.', '/') + ".class");  
            jos.putNextEntry(agent);  
  
            // dump the class bytecode into the entry  
            ClassPool pool = ClassPool.getDefault();  
            CtClass ctClass = pool.get(RedefineClassAgent.class.getName());  
            jos.write(ctClass.toBytecode());  
            jos.closeEntry();  
        } catch (CannotCompileException | NotFoundException e) {  
            // Realistically this should never happen.  
            LOGGER.log(Level.SEVERE, "Exception while creating RedefineClassAgent jar.", e);  
            throw new IOException(e);  
        }  
  
        return jarFile;  
    }  
  
    /**  
     * Marks a failure to load the agent and get an instance of {@link Instrumentation} that is able to redefine  
     * classes.     */    public static class FailedToLoadAgentException extends Exception {  
        public FailedToLoadAgentException() {  
            super();  
        }  
  
        public FailedToLoadAgentException(Throwable cause) {  
            super(cause);  
        }  
    }  
}
```

```java
package io.leaderli.demo.bytebuddy;  
  
public class ByteDemo {  
  
    static {  
        if (true) {  
            throw new IllegalStateException("123");  
        }  
    }  
  
    public static void test() {  
  
        System.out.println("fuck1");  
    }  
}
```

```java
package io.leaderli.demo.bytebuddy;  
  
import javassist.ClassPool;  
import javassist.CtClass;  
import javassist.CtMethod;  
  
import java.lang.instrument.ClassDefinition;  
  
public class ByteBuddyTest {  
    public static void test() {  
  
        System.out.println("fuck");  
    }  
  
    public static void main(String[] args) throws Throwable {  
        ClassLoader classLoader = ByteBuddyTest.class.getClassLoader();  
  
        ClassPool pool = ClassPool.getDefault();  
        String name = ByteDemo.class.getName();  
        CtClass cc = pool.get(name);  
//        CtClass cc = pool.get("io.leaderli.demo.bytebuddy.ByteDemo");  
        CtMethod test = pool.getMethod(ByteBuddyTest.class.getName(), "test");  
        cc.getClassInitializer().setBody("{}");  
        cc.getMethod("test", "()V").setBody(test, null);  
        ClassDefinition definition = new ClassDefinition(ByteDemo.class, cc.toBytecode());  
        RedefineClassAgent.redefineClasses(definition);  
  
  
  
        ByteDemo.test();  
    }  
}
```

## debug

```java
CtClass.debugDump = "./dump";
```

## 参考文档

[tutorial](http://www.javassist.org/tutorial/tutorial.html)
[tutorial-wiki](https://github.com/jboss-javassist/javassist/wiki/Tutorial-1)
