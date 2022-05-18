---
tags:
  - java/框架/redisson
date updated: 2022-05-18 01:12
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

## 参考文档

[redisson 掘金](https://juejin.cn/post/7093149727260147749)
