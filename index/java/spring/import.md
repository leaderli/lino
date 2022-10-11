---
tags:
  - java/spring/import
date updated: 2022-04-17 20:21
---


`@import` 可以用来注入bean，配合自定义注解，可以实现按需引入，例如实现 [[scanner|自定义扫描器]]

```java
import org.springframework.context.annotation.AnnotationConfigApplicationContext;  
import org.springframework.context.annotation.Import;  
  
import java.lang.annotation.*;  
  
@spring_import_1.EnableFoo  
public class spring_import_1 {  
    @Target(ElementType.TYPE)  
    @Retention(RetentionPolicy.RUNTIME)  
    @Documented  
    @Import(Foo.class)  
    public @interface EnableFoo {  
    }  
  
    static class Foo {  
  
    }  
  
    public static void main(String[] args) {  
        AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(spring_import_1.class);  
        System.out.println(context.getBean(Foo.class));  
  
    }  
}
```