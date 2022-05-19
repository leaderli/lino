---
tags:
  - java/框架/redisson
date updated: 2022-05-20 06:01
---

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

## 参考文档

[redisson 掘金](https://juejin.cn/post/7093149727260147749)
