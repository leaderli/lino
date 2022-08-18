---
tags:
  - java/spring/resource
date updated: 2022-05-02 09:48
---

### 概述

[[jdk]] 提供的访问资源的类（如 `java.net.URL` 、`File` 等），并不能很好地满足各种底层资源的访问需求，比如缺少从类路径或者Web容器上下文中获取资源的操作类。Spring 提高了 Resource 接口，为应用提供了更强的底层资源访问能力，该接口拥有对应不同资源类型的实现类，以用来访问配置文件资源，国际化属性文件资源等。

```java
public interface Resource extends InputStreamSource {

    /**
     *
     *  判断资源是否物理形式的存在
     */
    boolean exists();

    /**
     * 表示可以通过 getInputStream 读取资源内容
     */
    default boolean isReadable() {
        return true;
    }

    /**
     * 当为true时说明其不可以被重复读取。读取后必须关闭以防止资源泄露
     */
    default boolean isOpen() {
        return false;
    }

    /**
     * 资源是否为一个文件
     */
    default boolean isFile() {
        return false;
    }

    /**
     *  返回资源的URL句柄
     */
    URL getURL() throws IOException;

    /**
     *  返回资源的URI句柄
     */
    URI getURI() throws IOException;

    /**
     *  返回资源的文件句柄
     */
    File getFile() throws IOException;

    default ReadableByteChannel readableChannel() throws IOException {
        return Channels.newChannel(getInputStream());
    }

    long contentLength() throws IOException;

    long lastModified() throws IOException;

    Resource createRelative(String relativePath) throws IOException;

    /**
     * 通常返回文件的简单名称，例如 1.txt
     */
    String getFilename();

    String getDescription();
}
```

[[Spring]] 框架中主要实现类有，通过实现类，可以将 [[spring]] 的配置文件放在任何地方，例如数据库、LDAP，只需要最终通过 Resource 接口返回配置信息即可。 [[spring]] 的 Resource 接口及其实现类可以脱离 [[spring]] 框架的情况下使用，比 [[JDK]] 自带的更方便更强大。

- `ByteArrayResource` 二进制数组表示的资源，二进制数组资源可以在内存中通过程序构造。

- `ClassPathResource` 类路径下的资源，资源以相对于类路径的方式表示，一般是以相对于根路径的方式。

- `FileSystemResource`  文件系统资源，资源以文件系统路径的方式表示

- `ServletContextResource` 访问 Web 容器上下文的资源而设计的类，负责以相对于 Web 应用根目录的路径来加载资源。支持以流和 URL 的方式访问。在war包解压的情况下，也可以通过 File 方式访问。 该类还可以直接从 jar 包中访问资源。

- `UrlResource`  封装了 `java.net.URL` 它是用户能够在访问任何通过 [[URL]] 表示的资源。

- `PathResource`  封装了 `java.net.URL`  、`java.nio.file.Path` 、`FileSystemResource`。

### 示例

![[Pasted image 20220502090536.png]]

```java
Resource file = new FileSystemResource("D:\\work\\workspace\\idea\\spring-demo\\src\\main\\resources\\application.yml");  
  
System.out.println("isFile:" + file.isFile());  
System.out.println("getDescription:" + file.getDescription());  
System.out.println("exists:" + file.exists());  
System.out.println("isReadable:" + file.isReadable());  

```

```log
isFile:true
getDescription:file [D:\work\workspace\idea\spring-demo\src\main\resources\application.yml]
exists:true
isReadable:true

```

```java
Resource file = new ClassPathResource("/application.yml");  
  
System.out.println("isFile:" + file.isFile());  
System.out.println("getDescription:" + file.getDescription());  
System.out.println("exists:" + file.exists());  
System.out.println("isReadable:" + file.isReadable());  

```

```log
isFile:true
getDescription:class path resource [application.yml]
exists:true
isReadable:true
```

![[tips#Spring注入文件]]

### 资源地址表达式

通过上面的例子，可以发现，为了访问不同类型的资源，必须使用相应的 Resource 实现类。我们可以使用 `ResourceLoader` 或 `ResourcePatternResolver`（支持 [[ant]]）  通过资源地址的特殊标识符就可以访问相应的资源。下面的示例统一使用实现类 `PathMatchingResourcePatternResolver` 作为加载工具类

````ad-info
title: `classpath:`


从类库中加载资源，`classpath:` 和 `classpath:/` 是等价的，都是相对于类库的根路径，资源文件可以在标准的文件系统中，也可以在jar或者zip的包中。



```java
resourceResolver.getResource("classpath:application.yml");
resourceResolver.getResource("classpath:/application.yml");
```

````

````ad-info
title: `file:`


使用 UrlResource 从文件系统目录中加载资源，可以使用绝对路径或相对路径



```java
resourceResolver.getResource("file:D:\\work\\workspace\\idea\\spring-demo\\src\\main\\resources\\application.yml");

resourceResolver.getResource("file:src/main/resources/application.yml");
```

````


````ad-info
title: `http://`


使用 UrlResource 从 web 服务器加载资源, 也可以加载 `ftp://` , `https://`


```java
resourceResolver.getResource("https://www.baidu.com/");
```


````

```ad-info
title: 无前缀

一般由具体实现类指定的一个默认类型的。例如我们示例的实现类使用的就是 `classpath:` 类型的

```


### 读取资源文件内容


使用 Resource 操作文件时，如果资源的配置文件如果在 jar 包中， 那么就不能使用 `Resource.getFile()` ，否则会抛出 FileNotFoundException 异常， 推荐使用 `Resource.getInputStream()` 读取。

```java
  
Resource resource = resourceResolver.getResource("https://www.baidu.com/");  
  
System.out.println(StreamUtils.copyToString(resource.getInputStream(), StandardCharsets.UTF_8));
```

###  加载其他配置

```java
public class SpringEnvironmentAware implements EnvironmentAware {  
    @Override  
    public void setEnvironment(org.springframework.core.env.Environment environment) {  
  
        MutablePropertySources mutablePropertySources = ((ConfigurableEnvironment) environment).getPropertySources();  
        mutablePropertySources.addLast(new PropertiesPropertySource("new", new Properties()));  
    }  
}
```