---
aliases: 常量
tags:
  - java/ee/constants
date updated: 2022-04-15 15:05
---

## 示例

### 将常量放在接口中，通过继承该接口，调用常量

```java
public interface ClassConstants{
   int CONSUMER = 1;//接口中变量默认为 static final
   int DISPLAY = 2;
}
```
