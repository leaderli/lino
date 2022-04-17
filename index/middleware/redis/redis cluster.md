---
tags:
  - middleware/redis/cluster
date updated: 2022-04-17 16:12
---

## 端口

redis 节点通常占用两个端口，一个服务端口，一个数据端口，服务端口默认为 ` 6379  `，数据端口则为服务端口 `+10000` ,确保这两个端口的防火墙为打开状态。

## 启动集群

1. 建立多个节点的配置文件目录

   ```shell
   mkdir cluster-test
   cd cluster-test
   mkdir 7000 7001 7002 7003 7004 7005
   ```

2. 每个节点目录下新增`redis.conf`配置文件，以下为`7000`节点最小配置

   ```conf
   port 7000
   cluster-enabled yes
   cluster-config-file nodes-7000.conf
   cluster-node-timeout 5000
   appendonly yes
   daemonize yes
   ```

3. 在 cluster-test 目录编写启动脚本

   ```shell
    #!/bin/bash
    /usr/bin/redis-server 7000/redis.conf
    /usr/bin/redis-server 7001/redis.conf
    /usr/bin/redis-server 7002/redis.conf
    /usr/bin/redis-server 7003/redis.conf
    /usr/bin/redis-server 7004/redis.conf
    /usr/bin/redis-server 7005/redis.conf
   ```

   启动后我们可以通过`ps -ef|grep redis`看到所有 redis 节点都启动了

4. 对于使用了`redis 5`以上版本，可以使用如下命令来分配 [[

   ```shell
   #--cluster-replicas 1 使用一个节点作为从节点，那么这里至少需要6个节点，若不指定cluster-replicas则可以只使用三个节点
   redis-cli --cluster create 127.0.0.1:7000 127.0.0.1:7001 127.0.0.1:7002 127.0.0.1:7003 127.0.0.1:7004 127.0.0.1:7005 --cluster-replicas 1

   ```

   执行后可以得到输出

   > [OK] All 16384 slots covered

   同时可以看到各个节点的相关运行时配置文件`node.conf`
   我们有 3 个节点的 7000 端口的`node.conf`文件,我们可以看到 `hash槽` 的分布

   ```configuration
   73a213f442c0299596d464a1b00b26c0eb433a63 127.0.0.1:7002@17002 master - 0 1589883608796 3 connected 10923-16383
   3c0f18ab3bcafd94486aab2264833d1a583a0b18 127.0.0.1:7001@17001 master - 0 1589883609703 2 connected 5461-10922
   1ebfb6ca239c3780fd76f599c0caace80391806b 127.0.0.1:7000@17000 myself,master - 0 0 1 connected 0-5460
   vars currentEpoch 3 lastVoteEpoch 0
   ```

5. `redis.conf` 配置 `bind ip` ，可以限定不能使用 `127.0.0.1` 去访问

## 分区

[[redis scaling|分区]]
