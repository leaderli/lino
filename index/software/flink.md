---
tags:
  - 软件/flink
date updated: 2023-12-18 22:11
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

## 快速入门（java）

```xml
<properties>  
    <flink.version>1.17.0</flink.version>  
</properties>  
<dependencies>  
    <dependency>  
        <groupId>org.apache.flink</groupId>  
        <artifactId>flink-streaming-java</artifactId>  
        <version>${flink.version}</version>  
    </dependency>  
    <dependency>  
        <groupId>org.apache.flink</groupId>  
        <artifactId>flink-clients</artifactId>  
        <version>${flink.version}</version>  
    </dependency>  
    <dependency>  
        <groupId>org.apache.flink</groupId>  
        <artifactId>flink-runtime-web</artifactId>  
        <version>${flink.version}</version>  
    </dependency>
```

```java
package io.leaderli.flink.demo;  
  
import org.apache.flink.api.common.typeinfo.Types;  
import org.apache.flink.api.java.tuple.Tuple2;  
import org.apache.flink.configuration.Configuration;  
import org.apache.flink.streaming.api.datastream.DataStreamSource;  
import org.apache.flink.streaming.api.environment.StreamExecutionEnvironment;  
import org.apache.flink.util.Collector;  
  
public class WordCount {  
    public static void main(String[] args) throws Exception {  
        StreamExecutionEnvironment env = StreamExecutionEnvironment.createLocalEnvironmentWithWebUI(new Configuration());  
        DataStreamSource<String> ds = env.socketTextStream("centos7", 7777);  
        ds.flatMap((String line, Collector<String> collector) -> {  
  
                    for (String word : line.split("\\b")) {  
                        collector.collect(word);  
                    }  
                })  
                .returns(String.class)  
                .map((String s) -> Tuple2.of(s, 1))  
                .returns(Types.TUPLE(Types.STRING, Types.INT))  
                .keyBy(tuple2 -> tuple2.f0)  
                .sum(1)  
                .print();  
        env.execute();  
    }  
}
```

上述代码启动前，需要先 [[netcat]] 打开一个socket端口

```shell
nc -lk 7777
```

启动后可以访问 <http://localhost:8081/>

我们向socket端口输出数据时，就可以看到java控制台相关的输出信息

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

### 转换操作

分别处理每个事件，对其应用某些转换并产生一条心的输出流

### 滚动聚合

滚动聚合（如求和、求最小值）会根据每个到来的事件持续更新结果。聚合操作都是有状态的，它们将到来的事件合并到已有状态来生成更新后的聚合值。

聚合函数必须满足可结合以及可交换的条件，以用于合并事件和当前状态并生成单个结果。

### 窗口操作

窗口操作持续创建一些称为桶的有限事件集合，并允许我们基于这些有限集进行计算。事件通常会根据其时间或其他属性分配到不同桶中。

窗口的行为是由一系列策略定义的，这些窗口策略决定了什么时间创建桶，事件如何分配到桶中以及桶内数据什么时间参与计算。其中参与计算的决策会根据触发条件判断，当触发条件满足时，桶内数据会发送给一个计算函数，由它来对桶中的元素应用计算逻辑。

- 滚动窗口  长度固定且互不重叠的桶。基于数量的、基于时间的
- 滑动窗口  长度固定且允许互相重叠的桶
- 会话窗口 发生在相邻时间内的一系列事件外加一段非活动时间组成

### 时间语义

- 处理时间  当前流处理算子所在机器上的本地时钟时间。
- 事件时间  数据流中事件实际发生的时间，它以附加在数据流中事件的时间戳为依据
- 水位线   表示我们确信不会再有延迟事件到来的某个时间点。
