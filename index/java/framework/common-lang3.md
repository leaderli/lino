---
tags:
  - java/框架/common-lang3
date updated: 2022-04-15 15:11
---

### 统计代码执行时间

```java
import org.apache.commons.lang3.time.StopWatch;

StopWatch stopWatch = new StopWatch();  
stopWatch.start();  
lazy();  
stopWatch.stop();
System.out.println(stopWatch.getTime(TimeUnit.MILLISECONDS));
```

### 查看类是否为基本类型或包装类型

```java
import org.apache.commons.lang3.ClassUtils;
ClassUtils.isPrimitiveOrWrapper(klass)
```
