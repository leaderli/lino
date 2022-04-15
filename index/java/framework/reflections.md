---
aliases: 响应式
tags:
  - java/框架/reflections
date updated: 2022-04-15 14:47
---

```xml
<dependency>
    <groupId>org.reflections</groupId>
    <artifactId>reflections</artifactId>
    <version>0.9.10</version>
</dependency>
```

扫描类在某个包下的所有子类

```java
Reflections reflections = new Reflections("my.project");
Set<Class<? extends SomeType>> subTypes = reflections.getSubTypesOf(SomeType.class);

```

扫描在某个包下的被注解了某个注解的所有类

```java
Set<Class<?>> annotated = reflections.getTypesAnnotatedWith(SomeAnnotation.class);
```
