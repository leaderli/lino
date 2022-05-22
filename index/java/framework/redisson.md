---
tags:
  - java/框架/redisson
date updated: 2022-05-20 06:01
---
## 示例
```xml
<dependency>  
    <groupId>org.redisson</groupId>  
    <artifactId>redisson-spring-boot-starter</artifactId>  
    <version>3.17.0</version>  
</dependency>
```

```java
package com.leaderli.demo;

import org.redisson.Redisson;
import org.redisson.api.RLock;
import org.redisson.config.Config;
import org.redisson.config.SingleServerConfig;

/**
 * @author leaderli
 * @since 2022/5/17
 */
public class RedissionTest {


    public static void main(String[] args) {
        //1. 配置部分
        Config config = new Config();
        String address = "redis://127.0.0.1:6379";
        SingleServerConfig serverConfig = config.useSingleServer();
        serverConfig.setAddress(address);
        serverConfig.setDatabase(0);
        config.setLockWatchdogTimeout(5000);
        Redisson redisson = (Redisson) Redisson.create(config);


        RLock rLock = redisson.getLock("goods:1000:1");

        for (int i = 0; i < 5; i++) {

            new Thread(
                    () -> {

                        //2. 加锁
                        rLock.lock();
                        try {
                            System.out.println("todo 逻辑处理 1000000." + Thread.currentThread().getId());
                            Thread.sleep(3000);
                        } catch (InterruptedException e) {
                            e.printStackTrace();
                        } finally {
                            if (rLock.isLocked() && rLock.isHeldByCurrentThread()) {
                                //3. 解锁
                                rLock.unlock();
                            }
                        }
                        System.out.println("release " + Thread.currentThread().getId());

                    }
            ).start();
        }
    }
}

```


## 获取锁

redission 继承了标准的 `lock` 接口 ，其实现类似 `ReentrantLock`

通过 debug 我们可以观察到调用栈

![[Pasted image 20220520055251.png]]

其中利用通过 [[redis lua]] 的原子性，去尝试获取一个锁。锁使用的数据类型 [[redis data type#hash|hash]] ，这是为了方便使用同一个key来存储同一个线程的重入锁

```lua

-- 当k1不存在时，则新建一个当前线程的锁，并设置过期时间
if (redis.call('exists', KEYS[1]) == 0) then  
    redis.call('hincrby', KEYS[1], ARGV[2], 1);  
    redis.call('pexpire', KEYS[1], ARGV[1]);  
    return nil;  
end ;  
-- 当k1存在时，则查看当前线程是否已经持有锁，若持有锁则将锁的计数+1，并重置过期时间
if (redis.call('hexists', KEYS[1], ARGV[2]) == 1) then  
    redis.call('hincrby', KEYS[1], ARGV[2], 1);  
    redis.call('pexpire', KEYS[1], ARGV[1]);  
    return nil;  
end ;  
return redis.call('pttl', KEYS[1]);
```

我们查看 tryAcquireAsync 方法细节

```java
private <T> RFuture<Long> tryAcquireAsync(long waitTime, long leaseTime, TimeUnit unit, long threadId) {  
    RFuture<Long> ttlRemainingFuture;  
    if (leaseTime != -1) {  
        ttlRemainingFuture = tryLockInnerAsync(waitTime, leaseTime, unit, threadId, RedisCommands.EVAL_LONG);  
    } else {  
        ttlRemainingFuture = tryLockInnerAsync(waitTime, internalLockLeaseTime,  
                TimeUnit.MILLISECONDS, threadId, RedisCommands.EVAL_LONG);  
    }  
    CompletionStage<Long> f = ttlRemainingFuture.thenApply(ttlRemaining -> {  
        // 取到了锁
        if (ttlRemaining == null) {  
            if (leaseTime != -1) {  
                internalLockLeaseTime = unit.toMillis(leaseTime);  
            } else {  // 当未指定锁失效时间，则在默认失效时间到达时尝试去获取锁。
	            
                scheduleExpirationRenewal(threadId);  
            }  
        }  
        //当为null时表示取到了锁，否则即表示锁的剩余时间
        return ttlRemaining;  
    });  
    return new CompletableFutureWrapper<>(f);  
}
```



```java
protected void scheduleExpirationRenewal(long threadId) {  
    ExpirationEntry entry = new ExpirationEntry();  
    ExpirationEntry oldEntry = EXPIRATION_RENEWAL_MAP.putIfAbsent(getEntryName(), entry);  
    if (oldEntry != null) {  
        oldEntry.addThreadId(threadId);  
    } else {  
        entry.addThreadId(threadId);  
        try {  
            renewExpiration();  
        } finally {  
            if (Thread.currentThread().isInterrupted()) {  
                cancelExpirationRenewal(threadId);  
            }  
        }  
    }  
}

```

实际执行续期逻辑的代码，由一个 netty 的定时任务去执行，此处只需要创建对应的任务对象即可。通过我们可以看出，执行续期操作的时间为锁的持续时间的 `1/3` ，这就避免了执行定时任务时锁已经过期了，同时也不至于太频繁。
```java
private void renewExpiration() {  
    ExpirationEntry ee = EXPIRATION_RENEWAL_MAP.get(getEntryName());  
    if (ee == null) {  
        return;  
    }  
      
    Timeout task = commandExecutor.getConnectionManager().newTimeout(new TimerTask() {  
        @Override  
        public void run(Timeout timeout) throws Exception {  
            ExpirationEntry ent = EXPIRATION_RENEWAL_MAP.get(getEntryName());  
            if (ent == null) {  
                return;  
            }  
            Long threadId = ent.getFirstThreadId();  
            if (threadId == null) {  
                return;  
            }  
              
            RFuture<Boolean> future = renewExpirationAsync(threadId);  
            future.whenComplete((res, e) -> {  
                if (e != null) {  
                    log.error("Can't update lock " + getRawName() + " expiration", e);  
                    EXPIRATION_RENEWAL_MAP.remove(getEntryName());  
                    return;  
                }  
                  
                if (res) {  
                    // reschedule itself  
                    renewExpiration();  
                } else {  
                    cancelExpirationRenewal(null);  
                }  
            });  
        }  
    }, internalLockLeaseTime / 3, TimeUnit.MILLISECONDS);  
      
    ee.setTimeout(task);  
}
```

我们可以看到，延期持续时间主要也是通过 [[redis lua]] 来实现的 
```java
protected RFuture<Boolean> renewExpirationAsync(long threadId) {  
    return evalWriteAsync(getRawName(), LongCodec.INSTANCE, RedisCommands.EVAL_BOOLEAN,  
            "if (redis.call('hexists', KEYS[1], ARGV[2]) == 1) then " +  
                    "redis.call('pexpire', KEYS[1], ARGV[1]); " +  
                    "return 1; " +  
                    "end; " +  
                    "return 0;",  
            Collections.singletonList(getRawName()),  
            internalLockLeaseTime, getLockName(threadId));  
}
```


### 锁的自旋重试

在获取锁失败后，会进入重试流程，等待上次获得锁过期的时间。
```java
private void lock(long leaseTime, TimeUnit unit, boolean interruptibly) throws InterruptedException {  
    long threadId = Thread.currentThread().getId();  
    Long ttl = tryAcquire(-1, leaseTime, unit, threadId);  
    // lock acquired  
    if (ttl == null) {  
        return;  
    }  
	// 获取不到锁时会注册一个监听器，用以监听是锁是否提前被释放了。
    CompletableFuture<RedissonLockEntry> future = subscribe(threadId);  
    RedissonLockEntry entry;  
    if (interruptibly) {  
        entry = commandExecutor.getInterrupted(future);  
    } else {  
        entry = commandExecutor.get(future);  
    }  
  
    try {  
        while (true) {  
            ttl = tryAcquire(-1, leaseTime, unit, threadId);  
            // lock acquired  
            if (ttl == null) {  
                break;  
            }  
  
            // waiting for message  
            if (ttl >= 0) {  
                try {  
	                // 使用 semaphore 为0 的实现暂停效果，当有其他线程release时，会提前结束等待
                    entry.getLatch().tryAcquire(ttl, TimeUnit.MILLISECONDS);  
                } catch (InterruptedException e) {  
                    if (interruptibly) {  
                        throw e;  
                    }  
                    entry.getLatch().tryAcquire(ttl, TimeUnit.MILLISECONDS);  
                }  
            } else {  
                if (interruptibly) {  
                    entry.getLatch().acquire();  
                } else {  
                    entry.getLatch().acquireUninterruptibly();  
                }  
            }  
        }  
    } finally {  
        unsubscribe(entry, threadId);  
    }
}
```

`CompletableFuture<RedissonLockEntry> future = subscribe(threadId);`

这里订阅了一个监听器

```java
public CompletableFuture<E> subscribe(String entryName, String channelName) {  
    AsyncSemaphore semaphore = service.getSemaphore(new ChannelName(channelName));  
    CompletableFuture<E> newPromise = new CompletableFuture<>();  
  
    int timeout = service.getConnectionManager().getConfig().getTimeout();  
    Timeout lockTimeout = service.getConnectionManager().newTimeout(t -> {  
        newPromise.completeExceptionally(new RedisTimeoutException(  
                "Unable to acquire subscription lock after " + timeout + "ms. " +  
                        "Increase 'subscriptionsPerConnection' and/or 'subscriptionConnectionPoolSize' parameters."));  
    }, timeout, TimeUnit.MILLISECONDS);  
  
    semaphore.acquire(() -> {  
        if (!lockTimeout.cancel()) {  
            semaphore.release();  
            return;  
        }  
  
        E entry = entries.get(entryName);  
        if (entry != null) {  
            entry.acquire();  
            semaphore.release();  
            entry.getPromise().whenComplete((r, e) -> {  
                if (e != null) {  
                    newPromise.completeExceptionally(e);  
                    return;  
                }  
                newPromise.complete(r);  
            });  
            return;  
        }  
  
        E value = createEntry(newPromise);  
        value.acquire();  
  
        E oldValue = entries.putIfAbsent(entryName, value);  
        if (oldValue != null) {  
            oldValue.acquire();  
            semaphore.release();  
            oldValue.getPromise().whenComplete((r, e) -> {  
                if (e != null) {  
                    newPromise.completeExceptionally(e);  
                    return;  
                }  
                newPromise.complete(r);  
            });  
            return;  
        }  
  
        RedisPubSubListener<Object> listener = createListener(channelName, value);  
        CompletableFuture<PubSubConnectionEntry> s = service.subscribe(LongCodec.INSTANCE, channelName, semaphore, listener);  
        s.whenComplete((r, e) -> {  
            if (e != null) {  
                value.getPromise().completeExceptionally(e);  
                return;  
            }  
            value.getPromise().complete(value);  
        });  
  
    });  
  
    return newPromise;  
}
```

该监听器在释放锁时，会释放一个permit给上面 semaphore中暂停等待的线程，从而唤醒线程
```java
private RedisPubSubListener<Object> createListener(String channelName, E value) {  
    RedisPubSubListener<Object> listener = new BaseRedisPubSubListener() {  
  
        @Override  
        public void onMessage(CharSequence channel, Object message) {  
            if (!channelName.equals(channel.toString())) {  
                return;  
            }  
  
            PublishSubscribe.this.onMessage(value, (Long) message);  
        }  
    };  
    return listener;  
}


@Override  
protected void onMessage(RedissonLockEntry value, Long message) {  
    if (message.equals(UNLOCK_MESSAGE)) {  
        Runnable runnableToExecute = value.getListeners().poll();  
        if (runnableToExecute != null) {  
            runnableToExecute.run();  
        }  
		// 通过给semaphore 释放permit来唤醒等待的线程
        value.getLatch().release();  
    } else if (message.equals(READ_UNLOCK_MESSAGE)) {  
        while (true) {  
            Runnable runnableToExecute = value.getListeners().poll();  
            if (runnableToExecute == null) {  
                break;  
            }  
            runnableToExecute.run();  
        }  
  
        value.getLatch().release(value.getLatch().getQueueLength());  
    }  
}
```

### 释放锁

通过debug查看调用栈
![[Pasted image 20220522063114.png]]

其核心方法也是通过 [[redis lua]] 来解锁


```lua
if (redis.call('hexists', KEYS[1], ARGV[3]) == 0) then 
    return nil;
end;

local counter = redis.call('hincrby', KEYS[1], ARGV[3], -1);

if (counter > 0) then 
    redis.call('pexpire', KEYS[1], ARGV[2]); 
    return 0;
else 
    redis.call('del', KEYS[1]); redis.call('publish', KEYS[2], ARGV[1]); 
    return 1; 
end;
return nil;
```

解锁时同时会取消锁续期的定时任务。
```java
public RFuture<Void> unlockAsync(long threadId) {  
    RFuture<Boolean> future = unlockInnerAsync(threadId);  
  
    CompletionStage<Void> f = future.handle((opStatus, e) -> {  
        cancelExpirationRenewal(threadId);  
  
        if (e != null) {  
            throw new CompletionException(e);  
        }  
        if (opStatus == null) {  
            IllegalMonitorStateException cause = new IllegalMonitorStateException("attempt to unlock lock, not locked by current thread by node id: "  
                    + id + " thread-id: " + threadId);  
            throw new CompletionException(cause);  
        }  
  
        return null;  
    });  
  
    return new CompletableFutureWrapper<>(f);  
}
```
## 参考文档

[redisson 掘金](https://juejin.cn/post/7093149727260147749)
