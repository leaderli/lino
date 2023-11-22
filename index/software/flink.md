---
tags:
  - 软件/flink
date updated: 2023-11-22 21:32
---

## 简介

flink 是一个分布式处理引擎，用于在无边界和有边界数据流上进行有状态的计算。任何类型的数据都可以形成一种事件流。

[官网](https://flink.apache.org/)。


## 快速入门

### 安装

[下载地址](https://flink.apache.org/downloads.html)，我们使用版本[flink-1.17.1](https://www.apache.org/dyn/closer.lua/flink/flink-1.17.1/flink-1.17.1-bin-scala_2.12.tgz)

java 版本仅支持 8 或 11

```shell
$ tar -xzf  flink-1.17.1-bin-scala_2.12.tgz
$ cd flink-1.17.1


#启动 若默认端口8081被占用，则无法正常启动，需修改默认端口
$ ./bin/start-cluster.sh
Starting cluster.
Starting standalonesession daemon on host xxx.
Starting taskexecutor daemon on host xxx.

#停止
./bin/stop-cluster.sh

#测试 提交一个任务
$ ./bin/flink run examples/streaming/WordCount.jar
# 可通过日志查看
$ tail log/flink-*-taskexecutor-*.out
(to,1)
(be,1)
(or,1)
(not,1)
(to,2)
(be,2)
# 也可以使用Web UI界面查看，默认端口为8081，可在conf/flink-conf.yaml中修改rest.port配置
```

### 配置允许ip访问 Web UI

```yml
rest.address: 0.0.0.0
rest.bind-address: 0.0.0.0
```

下载示例程序

[examples-scala.jar](https://streaming-with-flink.github.io/examples/download/examples-scala.jar)

```shell
./bin/flink  run  -c  io.github.streamingwithflink.chapter1.AverageSensorReadings  ~/temp/examples-scala.jar 


tail -f ./log/flink-<user>-taskexecutor-<n>-<hostname>.out
```

SensorReading 的第一个字段是 sensorld ，第二个字段是用自1970-01-01 00:00:00.000 以来的毫秒数所表示的时间戳，第三个字段是每隔 5 秒计算出的平均温度 。



## 流处理基础

Dataflow图

DataFlow描述了数据如何在不同操作之间流动。Dataflow通常表示为有向图。

![[Pasted image 20231122215103.png]]

