---
tags:
  - java/框架/bytebuddy
date updated: 2022-10-10 19:47
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

## 动态生成子类

```embed-java
PATH: "vault://snippet/java/src/main/java/bytebuddy_3.java"
```

### MethodDelegation

`@RuntimeType` 告诉 Byte Buddy 不要进行严格的参数类型检测，在参数匹配失败时，尝试使用类型转换方式（runtime type casting）进行类型转换，匹配相应方法
@AllArguments 注解：注入目标方法的全部参数，是不是感觉与 Java 反射的那套 API 有点类似了？
@Origin 注解：注入目标方法对应的 Method 对象。如果拦截的是字段的话，该注解应该标注到 Field 类型参数。
@Super 注解：注入目标对象。通过该对象可以调用目标对象的所有方法。
@This 注解：注入目标对象。不可以通过该对象可以调用目标对象的方法，会造成死循环

## 修改已加载类

需要 [[java agent]] 支持

### 使用MethodDelegation

```embed-java
PATH: "vault://snippet/java/src/main/java/bytebuddy_1.java"
```

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

### 使用Advice

```embed-java
PATH: "vault://snippet/java/src/main/java/bytebuddy_2.java"
```

## 参考文档

[Byte Buddy - runtime code generation for the Java virtual machine](http://bytebuddy.net/#/)
