---
tags:
  - java/spring/resource
date updated: 2022-05-02 00:26
---

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



[Java-利用Spring提供的Resource/ResourceLoader接口操作资源文件 - 云+社区 - 腾讯云](https://cloud.tencent.com/developer/article/1862136)