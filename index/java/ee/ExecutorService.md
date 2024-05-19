---
tags:
  - java/ee/ExecutorService
  - thread
date updated: 2024-05-19 15:29
---

线程池

## 创建

通过工厂类 `executors`

```java
ExecutorService executor = Executors.newFixedThreadPool(10);
```

new

```java
ExecutorService executorService = new ThreadPoolExecutor(1, 1, 0L, TimeUnit.MILLISECONDS, new LinkedBlockingQueue<Runnable>());
```

## 提交任务

```java
executor.execute((Runnable) () -> System.out.println("runnable"));

Future<Integer> future= executor.submit((Callable<Integer>) () ->1);

List<Callable<Integer>> callableTasks = new ArrayList<>();  
callableTasks.add(() -> 1);  
callableTasks.add(() -> 2);  
callableTasks.add(() -> 3);  

# 返回一个成功执行的任务结果
executor.invokeAny(callableTasks);  
executor.invokeAll(callableTasks);
```


