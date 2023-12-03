---
tags:
  - 软件/flink
date updated: 2023-11-22 22:35
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

图中顶点称为算子，表示计算；而边表示数据依赖关系。算子是Dataflow的基本功能单元，他们从输入获取数据，对其精选计算，然后阐述数据并发往输出供后续处理。没有输入端的算子称为数据源，没有输出端的算子称为数据汇。

![[Pasted image 20231122215103.png]]

上图被称为逻辑图，为了执行，需要将逻辑图转化为物理图。在分布式处理引擎时，每个算子可能在不同物理机上运行多个并行任务。

![[Pasted image 20231122223703.png]]


### 数据交换策略

- 转发策略
- 广播策略
- 基于键值的策略
- 随机策略


### 延迟和吞吐

延迟表示处理一个事件所需要的时间。流式应用关心从接受事件到输出观察到事件处理效果的时间间隔。延迟以时间片（例如毫秒）为单位测量的。

吞吐是用来衡量系统处理能力（处理速率)的指标，它告诉我们系统每单位时间可以处理多少事件。



### 数据流操作

#### 无状态

无状态的操作不会维持内部状态，即处理事件时无需依赖已处理过的事件，也不保存历史数据。事件处理互不影响且与事件到来的时间无关，易并行化。

#### 有状态

依赖之前接收的事件信息，它们的状态会根据传入的事件更新，并用于未来事件的处理逻辑。需要保障在出错时进行可靠的故障恢复。



### 输入输出


数据接入和数据输出操作允许流处理引擎和外部系统进行通信。

数据接入操作时从外部数据源获取原始数据并将其转换成适合后续处理的格式。实现数据接入操作逻辑的算子称为数据源。数据源可以从TCP套接字、文件、kafka中获取数据。

数据输出操作是将数据以适合外部系统使用的格式输出。负责数据输出的算子称为数据汇，其写入的目标可以是文件、数据库、消息队列或监控接口等。