---
tags:
  - java/tips
date updated: 2022-07-18 21:27
---

### 读取 properties 中文乱码解决

```java
properties.load(new InputStreamReader(AutoConfig.class.getResourceAsStream("/application.properties"),"utf-8"));
```

### 获取当前执行的方法名,通过方法内的内部类来实现的

```java
new Object(){}.getClass().getEnclosingMethod().getName();
```

### Comparator.comparing

可是使用 lambda 快速实现`comparable`

```java
Comparator<Player> byRanking
 = (Player player1, Player player2) -> player1.getRanking() - player2.getRanking();
```

类似`Collectors`提供了快捷的`Comparator`方法

```java
Comparator<Player> byRanking = Comparator
  .comparing(Player::getRanking);
Comparator<Player> byAge = Comparator
  .comparing(Player::getAge);
```

### 批量反编译 jar 包

```shell
ls *.jar|xargs -I {} jadx {} -d src
```

### 读取文件

```java
String javaSource = new String(Files.readAllBytes(Paths.get("src/Hello.java")));

```

### 返回空的集合

```ad-bug

该集合无法进行add操作
```

```java
return Collections.emptyList();
```

### getResource

```java
// getResource最终调用的是ClassLoader的方法，对于 '/' 开头的路径表明是 classpath 路径，实际 Classloader 中会将 '/' 截掉

//返回类加载器加载的当前类的路径
Test.class.getResource(".");
// 返回类加载的根目录
Test.class.getResource("/");
```

下面是具体 [[classloader]] 的源码，可以看出不是以 `/` 开头的，会去找当前类的路径下文件，否则找 classpath 路径

```java
public java.net.URL getResource(String name) {  
    name = resolveName(name);  
    ClassLoader cl = getClassLoader0();  
    if (cl==null) {  
        // A system class.  
        return ClassLoader.getSystemResource(name);  
    }  
    return cl.getResource(name);  
}


private String resolveName(String name) {  
    if (name == null) {  
        return name;  
    }  
    if (!name.startsWith("/")) {  
        Class<?> c = this;  
        while (c.isArray()) {  
            c = c.getComponentType();  
        }  
        String baseName = c.getName();  
        int index = baseName.lastIndexOf('.');  
        if (index != -1) {  
            name = baseName.substring(0, index).replace('.', '/')  
                +"/"+name;  
        }  
    } else {  
        name = name.substring(1);  
    }  
    return name;  
}
```

### classpath

```java
package foo;

public class Test
{
    public static void main(String[] args)
    {
        ClassLoader loader = Test.class.getClassLoader();
        System.out.println(loader.getResource("foo/Test.class"));
    }
}
//This printed out:
//file:/C:/Users/Jon/Test/foo/Test.class
```

### 扫描所有类

```java
public void test() throws IOException, URISyntaxException {  
  
  
    Enumeration<URL> resources = this.getClass().getClassLoader().getResources("");
  
    while (resources.hasMoreElements()){  
  
        scan(new File(resources.nextElement().toURI()));  
    }  
}  
  
private void scan(File file) {  
    if(file==null||!file.exists()){  
       return;  
    }  
  
    System.out.println(file);  
  
    if(file.isDirectory()){  
        for (File f: Objects.requireNonNull(file.listFiles())) {  
            scan(f);  
        }  
    }  
}
```

### 获取项目中所有jar

可查找classpath目录下所有的 [[maven#META-INF|META-INF]]，从而找到所有jar包

```java
  
ClassLoader loader = Thread.currentThread().getContextClassLoader();  
Enumeration<URL> resources = loader.getResources("META-INF");  
Collections.list(resources).stream()  
        .filter(url -> "jar".equals(url.getProtocol()))  
        .map(URL::getFile)  
        .forEach(System.out::println);

```

```log
file:/D:/resouce/java/maven/repository/junit/junit/4.12/junit-4.12.jar!/META-INF
file:/D:/resouce/java/maven/repository/org/hamcrest/hamcrest-core/2.1/hamcrest-core-2.1.jar!/META-INF
file:/D:/ProgramFiles/IDEA2020/lib/idea_rt.jar!/META-INF
```

根据 [stackoverflow](https://stackoverflow.com/questions/25729319/how-does-a-classloader-load-classes-reference-in-the-manifest-classpath) 中的回答，[[maven#META-INF|META-INF]] 是由JVM底层去加载的

### 如何修改 final 修饰符的值

```java
String str = "fuck";

Field value = String.class.getDeclaredField("value");
//Field中包含当前属性的修饰符，通过改变修饰符的final属性，达到重新赋值的功能
Field modifier = Field.class.getDeclaredField("modifiers");
modifier.setAccessible(true);
modifier.set(value, value.getModifiers() & ~Modifier.FINAL);

value.setAccessible(true);
value.set(str, "notfuck".toCharArray());
//修改成功后重新加上final修饰符
modifier.set(value, value.getModifiers() | Modifier.FINAL);}
```

### HttpServletRequest

HttpServletRequest.getRequestURL()中获取的是请求地址，不是实际的IP地址，当通过nginx转发时，有可能返回nginx地址，想要获取真实IP，使用 [[config#InetAddress getLocalHost java net UnknownHostException 异常|InetAddress getLocalHost]]

### 动态编译源代码

```java
package com.leaderli.litest;

import org.junit.Test;

import javax.tools.JavaCompiler;
import javax.tools.ToolProvider;
import java.io.File;
import java.io.IOException;
import java.net.URL;
import java.net.URLClassLoader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;

public class TestCompile {
    @Test
    public void test() throws IOException, ClassNotFoundException, InstantiationException, IllegalAccessException {
        String source = "package test;     " +
                "public class Test implements Runnable{\n" +
                "        @Override\n" +
                "        public void run() {\n" +
                "            System.out.println(\"test compile\");\n" +
                "        }\n" +
                " }";

		//将源码保存到目录下
        File root = new File("/java"); // On Windows running on C:\, this is C:\java.
        File sourceFile = new File(root, "test/Test.java");
        sourceFile.getParentFile().mkdirs();
        Files.write(sourceFile.toPath(), source.getBytes(StandardCharsets.UTF_8));

		// 将源码进行编译到指定根目录下，编译失败会抛出相关异常
        JavaCompiler compiler = ToolProvider.getSystemJavaCompiler();
		//0表示编译成功
        int status = compiler.run(null, null, null, sourceFile.getPath());

		//通过定义一个新的类加载器去加载编译后的class
        URLClassLoader classLoader = URLClassLoader.newInstance(new URL[]{root.toURI().toURL()});
		//加载以及实例化类
        Class<?> cls = Class.forName("test.Test", true, classLoader);
        Runnable runnable = (Runnable) cls.newInstance(); 
        runnable.run();
    }
}

```

上述编译代码的方式在tomcat中可能会运行不正常，因为相关的jar可能不在classpath中，可通过如下方式加载。

- [[#获取项目中所有jar]]
- [[JavaPoet]] `JavaFile.toJavaFileObject()`

```java
public void test(JavaFileObject javaFileObject) throws IOException {

        JavaCompiler compiler = ToolProvider.getSystemJavaCompiler();
        JavaFileManager fileManager = compiler.getStandardFileManager(null,null,null);

        List<JavaFileObject> files = new ArrayList<>();
        files.add(javaFileObject);
        List<String> options = new ArrayList<>();

        options.add("-Xlint:unchecked");// 忽略一些检测
        
        options.add("-classpath"); // 将必要的jar添加到classpath
        options.add(LiClassUtil.getAppJars().stream().collect(Collectors.joining(File.pathSeparator)));
        
        options.add("-d"); // 编译后的文件输出目录，
        options.add(this.getClass().getResource("/").getPath());
        
        compiler.getTask(null,fileManager,null,options,null,files).call();

        fileManager.close();

}
```

### 获取所有枚举值

```java
enum Color {  
 RED,GREEN  
}  
  
@Test  
public void test() throws Throwable{  
	for (Color enumConstant : Color.class.getEnumConstants()) {  
		System.out.println(enumConstant);  
	}  
}
```

### 枚举不可以extends但可以implements

```java
interface Mode<E extends Enum<E>> {
	public E combine();
}

enum Color implements Mode<Color> {
        RED, GREEN;

        @Override
        public Color combine() {
            return this;
        }
}
class TextFragment<E extends Enum<E> & Mode<E>> {

	E mode;

	public TextFragment(E mode) {
		this.mode = mode;
	}
}

@Test
public void test() {

	TextFragment<Color> text = new TextFragment<>(Color.GREEN);  
	Assert.assertSame(Color.GREEN, text.mode);
}
```

### 暂停线程的另一种方式

```java
TimeUnit.SECONDS.sleep(1);
```

### 输出java对象的内存占用

```java
System.out.println("int[256]:\t\t"+ObjectSizeCalculator.getObjectSize(new int [256]));  
System.out.println("int[2][128]:\t"+ObjectSizeCalculator.getObjectSize(new int [2][128]));  
System.out.println("int[128][2]:\t"+ObjectSizeCalculator.getObjectSize(new int [128][2]));


int[256]:		1040
int[2][128]:	1080
int[128][2]:	3600
```

### 两个参数的 lambda

```java
@FunctionalInterface  
public interface BiConsumer<T, U> {  
  
  void accept(T t, U u);
}
```
