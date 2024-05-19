---
tags:
  - java/ee/executors
  - thread
date updated: 2024-05-19 15:29
---

线程池

## ExecutorService
### 创建

通过工厂类 `executors`

```java
ExecutorService executor = Executors.newFixedThreadPool(10);
```

new

```java
ExecutorService executorService = new ThreadPoolExecutor(1, 1, 0L, TimeUnit.MILLISECONDS, new LinkedBlockingQueue<Runnable>());
```


### 提交任务

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


### 关闭


```shell
// 停止接收新任务，并在所有任务执行完成后停止所有线程
executorService.shutdown();

// 强制停所有线程，返回未执行完成的任务
List<Runnable> notExecutedTasks = executorService.shutDownNow();
```



## ScheduledExecutorService


```java
ScheduledExecutorService executorService = Executors.newSingleThreadScheduledExecutor();
// 延迟执行一次
Future<String> resultFuture = executorService.schedule(callableTask, 1, TimeUnit.SECONDS);

// 延迟 并定期执行，定时间隔按照固定频率，
executorService.scheduleAtFixedRate(runnableTask, 100, 450, TimeUnit.MILLISECONDS);
// 延迟 并定期执行，定时间隔按照上一个任务结束后的固定验证
executorService.scheduleWithFixedDelay(task, 100, 150, TimeUnit.MILLISECONDS);
```