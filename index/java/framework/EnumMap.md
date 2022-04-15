---
tags:
  - java/框架/EnumMap
date updated: 2022-04-15 14:56
---



对于key是枚举的类来说，可以使用 EnumMap，它的底层是一个简单的数组
```java
public enum COLOR{
	RED,GREEN
}

Map<COLOR,String> mood  = new EnumMap<>(COLOR.class)
```
