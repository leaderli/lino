---
tags:
  - java/ee/executors
  - thread
date updated: 2024-05-19 18:30
---

线程池

```java
ThreadPoolExecutor executor = new ThreadPoolExecutor(  
    int corePoolSize,  
    int maxPoolSize,  
    long keepAliveTime,  
    TimeUnit unit,  
    BlockingQueue<Runnable> workQueue,  
    RejectedExecutionHandler handler  
);
```

- corePoolSize  线程池最小数量
- maxPoolSize   线程池最大数量
- keepAliveTime 当线程数量大于corePoolSize时，且线程的空闲时间超过该值时，则会自动回收多余的线程
- workQueue 当所有线程都在执行时，其他任务如何处理
- handler 当queue已满且线程已达到最大数量时，处理任务的策略

BlockingQueue 的三种类型

1. synchronousQueue 基本上就 queue Size 就是 0。如果不存在可用Thread，则新建一个。如果有设置maxPoolSize，则会拒绝执行新的Task，通常使用这种类型时，不会设置maxPoolSize
2. LinkedBlockingQueue queue 的大小是无限制的。需要搭配合适的线程池数量才能比较好。
3. ArrayBlockingQueue	queue 的大小是有限制的


RejectedExecutionHandler

- AbortPolicy  直接抛出 RejectedExecutionException
	可用通过如下方式自定义处理异常
	
	```java
	executor.setRejectedExecutionHandler(new RejectedExecutionHandler() {  
	    @Override  
	    public void rejectedExecution(Runnable r, ThreadPoolExecutor executor) {  
	        System.out.println("Get you!");  
	        r.run();  
	        System.out.println("Done in handler");  
	    }  
	});
	```
- DiscardPolicy 不做处理，直接丢弃
- DiscardOldestPolicy 丢弃队列中最开始的任务
- CallerRunsPolicy 由调用者的线程来执行
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
