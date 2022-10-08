---
tags:
  - java/框架/bytebuddy
date updated: 2022-10-07 22:04
---

```xml
<dependency>  
    <groupId>net.bytebuddy</groupId>  
    <artifactId>byte-buddy</artifactId>  
    <version>1.12.16</version>  
</dependency>  
<dependency>  
    <groupId>net.bytebuddy</groupId>  
    <artifactId>byte-buddy-agent</artifactId>  
    <version>1.12.16</version>  
</dependency>
```

## 修改已加载类

需要 [[java agent]] 支持

```embed-java
PATH: "vault://snippet/java/src/main/java/bytebuddy_1.java"
```

### MethodDelegation

用来替换现有方法，代理类中的方法不一定需要和原始类方法名相同。

```java
public class GreetingInterceptor {
  public Object greet(Object argument) {
    return "Hello from " + argument;
  }
}

Class<? extends java.util.function.Function> dynamicType = new ByteBuddy()
  .subclass(java.util.function.Function.class)
  .method(ElementMatchers.named("apply"))
  .intercept(MethodDelegation.to(new GreetingInterceptor()))
  .make()
  .load(getClass().getClassLoader())
  .getLoaded();
assertThat((String) dynamicType.newInstance().apply("Byte Buddy"), is("Hello from Byte Buddy"));

```

## 参考文档

[Byte Buddy - runtime code generation for the Java virtual machine](http://bytebuddy.net/#/)
