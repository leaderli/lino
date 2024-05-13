---
tags:
  - java/ee/ExecutorService
  - thread
---

## 创建

通过工厂类 `executors`

```java
ExecutorService executor = Executors.newFixedThreadPool(10);
```

new

```java
ExecutorService executorService = new ThreadPoolExecutor(1, 1, 0L, TimeUnit.MILLISECONDS, new LinkedBlockingQueue<Runnable>());
```

