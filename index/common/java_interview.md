---
aliases: java面试题
tags:
  - 常用/java面试题
date updated: 2022-05-07 14:55
---

#java #面试题 #link

## 面试题网站

https://pdai.tech/

<https://github.com/Snailclimb/JavaGuide>

### `HashMap`,`HashTable`,`CocurrentHashMap`的共同点和区别

共同点：

1. 底层使用拉链式数组
2. 为了避免`hash`冲突，当当数组元素已用槽数量超过 (`容量*容载因子`) 就会扩容
3. `put`时，对`key`进行`hash`计算槽，若槽没有元素则赋值，否则插入链表的结尾
4. `get`时，对`key`进行`hash`计算槽，若槽没有元素或者仅有一个元素，则直接返回，
   否则，通过`equals`方法比较`key`，返回指定的元素

不同点：

1. `HashTable`的`key`和`value`不允许`null`
2. `hash`方法不同，`HashTable`直接对`hashcode`进行取模运算，`HashMap`首先对`hashcode`进行扰动计算，尽量避免 hash 碰撞。然后因其数组长度恒定为$2^n$,所以直接通过与运算进行取模，
3. `HashMap`线程不安全，`HashTable`通过`synchronized`修改关键方法确保线程安全，`CoccurentHashMap`通过分段锁的方式实现

### 说出几种幂等的实现方式

幂等操作指任意多次执行的结果和执行一次的结果一样。通俗来说，就是同一用户的对同一操作的多次请求的结果是一致的。

保证幂等性主要是三点：

1. 对于同一操作的请求必须有唯一标识，例如订单支付系统，肯定包含订单`ID`，确保一个订单仅支付一次。
2. 处理请求时需要有标识记录操作的状态，如正在处理中，已经处理完成等。
3. 每次接受请求时，需要判断是否已经处理过该请求或者正在处理该请求。

实现方式：

1. 分布式锁
2. 数据库锁
3. 事务

### `Spring`的`init-method`，`destroy-metdho`的实现方式

根据[[spring-initMethod执行过程 ]]的分析，我们可以知道`Spring`在扫描`bean`的配置信息时，将
`init-method`，`destroy-metdhod`的信息存储在`BeanDefinition`中，在`bean`的生命周期的一开始即实例化`bean`，以及对`bean`的属性进行初始化赋值后，会查找当前`BeanDefinition`,是否有`init-method`方法，有则通过反射去执行。在`bean`的生命周期的最后，会查找当前`BeanDefinition`,是否有`destroy-metdhod`方法，有则通过反射去执行。

[[v4.0-JavaGuide面试突击版.pdf]]

## 曾总分享

## 项目

- 谈谈你收获最多/最近的/最让你印象深刻/的一个项目，有什么收获？

- 你在项目中做了什么？

- 讲讲项目中有什么难点，你是怎么解决的？

- 聊聊你的项目的整个开发流程？

### Java 基础

- JVM 的内存结构是怎么样的？

- hashcode 和 equals有什么区别？为什么需要一起重写？

- Http 协议的三次握手知道吗？

- Https 建立连接的过程？

- 常用的 JVM 的设置参数有什么？

- java 的几种 io 模型？

- jvm 的默认堆大小你怎么考虑的？

- ArrayList 和 LinkedList 有什么区别？

- 创建对象的几种方法？

- 深复制和浅复制的区别？

### 并发编程

- 你知道 JMM 吗？

- java 中的 volatile 关键字有什么用？

- synchronized 关键字有什么作用？和 ReentrantLock 有什么区别呢？

- ThreadLocal 如何实现的，有什么用？

- 常见的线程池有哪几种？项目中你怎么用的？

- 线程池的几个参数有什么作用（讲任务提交后的流程）？

- 你知道 AQS 吗？

- jdk8 的新特性有哪些？

- Stream 和 ParrelStream 有什么区别？

- LinkedHashMap 和 HashMap 有什么区别？

- 你如何理解 java 中的锁？

- FuntionalInterface 和 lamda 表达式有什么区别？内部类呢？

- 二叉树和 B 树、红黑树有什么关系？

### Redis

- 你们项目中用到了 redis？聊聊使用场景？

- Redis 的常用几种数据结构？

- Redis 的缓存击穿、缓存雪崩、缓存穿透分别是什么意思？如何解决？

- Redis 的分布式锁是如何实现的（参考 Redisson 代码）？

- Redis 如何保证高可用的？

- Redis 的 AOF 和 RDB了解吗？

### 高并发

- 什么是乐观锁？什么是悲观锁？

- 什么是公平锁？什么是非公平锁？

- 有遇到过高并发问题吗？如何解决的？

- 如何保证请求是幂等的？

### 数据库

- 数据库事务的几种隔离级别

- MySQL的 B 树和 B+ 树有什么区别？

- 当 SQL 缓慢的时候，你如何排查？

- SQL 什么时候下不会用到索引(索引失效)?

- SQL 执行缓慢，你将如何优化？

- MySQL如何实现事务？

- mySAIM引擎和 Innodb引擎有什么区别？

- 聚簇索引和次级索引有什么区别

- 如果项目中用到索引，你会参考什么原则使用索引呢？

### Spring/SpringBoot/SpringCloud

- Spring 你常用的注解有哪些？

- Spring 的事务传播机制呢？

- SpringMVC 是如何处理 Http 请求的？

- Spring 如何解决循环依赖问题？

- Spring Bean 的生命周期？

- Spring Bean 是线程安全的吗？如果不安全，如何保证安全？

- SpringBoot 常用的注解有什么？

- SpringBoot 如何实现的自动装配

- Spring的动态代理是什么？聊聊 AOP?

- SpringBoot 的@Transactional 注解什么情况下会失效？

- SpringCloud Gateway 和 Nginx 有什么区别呢？

- SpringCloud 组件有哪些？分别有什么作用？

### kafka

- kafka如何保证消息不丢失的？

- 如何保证kafka的消费者只消费一次？

- 讲讲 kakfa 有哪些组成部分？

- 如何保证多个 partion 的消息是被顺序消费的

- kafka 为什么这么快？

- kafka 是如何保证可用性的？

### 架构设计问题

- 如何保证请求的幂等性

- 如何保证消息只被消费一次？

- 什么是服务降级、熔断、限流？

- 项目是如何优雅停机的？

- 如何实现服务注册发现？

- k8s 了解吗？

- 你会怎样将单体应用拆分成为微服务架构？

### 排查问题

- 当应用卡顿的时候，你是如何进行调优的？

- 有没有遇到大的生产问题？如何排查解决的？

### 个人发展

- 你对未来的职位有什么期待和想法？

- 为什么从上家公司离职（我们公司有什么吸引你的地方）？

- 你的职业规划是什么？

- 你有什么想问我的吗？

- 现在的薪资是多少？期望是多少？
