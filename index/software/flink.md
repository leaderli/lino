---
tags:
  - 软件/flink
date updated: 2023-12-27 22:27
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

## 读取数据

### 读取文件

```xml
<dependency>  
    <groupId>org.apache.flink</groupId>  
    <artifactId>flink-runtime-web</artifactId>  
    <version>${flink.version}</version>  
</dependency>
```

```java
package io.leaderli.flink.demo;  
  
import org.apache.commons.lang3.StringUtils;  
import org.apache.flink.api.common.RuntimeExecutionMode;  
import org.apache.flink.api.common.eventtime.WatermarkStrategy;  
import org.apache.flink.api.common.typeinfo.Types;  
import org.apache.flink.api.java.tuple.Tuple2;  
import org.apache.flink.connector.file.src.FileSource;  
import org.apache.flink.connector.file.src.reader.TextLineInputFormat;  
import org.apache.flink.core.fs.Path;  
import org.apache.flink.streaming.api.environment.StreamExecutionEnvironment;  
import org.apache.flink.util.Collector;  
  
  
public class FileSourceDemo {  
  
    public static void main(String[] args) throws Exception {  
        StreamExecutionEnvironment env = StreamExecutionEnvironment.getExecutionEnvironment();  
  
        FileSource<String> source = FileSource.forRecordStreamFormat(new TextLineInputFormat(), new Path("pom.xml")).build();  
  
        env.setRuntimeMode(RuntimeExecutionMode.BATCH);  
        env.fromSource(source, WatermarkStrategy.noWatermarks(), "file_source")  
                .flatMap((String s, Collector<String> o) -> {  
                    for (String word : s.replaceAll("\\W", " ").split(" ")) {  
                        o.collect(word);  
                    }  
                })  
                .returns(String.class)  
                .filter(StringUtils::isNotBlank)  
                .map(w -> Tuple2.of(w, 1))  
                .returns(Types.TUPLE(Types.STRING, Types.INT))  
                .keyBy(t -> t.f0)  
                .sum(1)  
                .print()  
        ;  
  
        ;  
        env.execute();  
    }  
}
```

### 读取kafka

```xml
<dependency>  
    <groupId>org.apache.flink</groupId>  
    <artifactId>flink-connector-kafka</artifactId>  
    <version>${flink.version}</version>  
    <scope>provided</scope>  
</dependency>
```

```java
package io.leaderli.flink.demo;  
  
import org.apache.commons.lang3.StringUtils;  
import org.apache.flink.api.common.eventtime.WatermarkStrategy;  
import org.apache.flink.api.common.serialization.SimpleStringSchema;  
import org.apache.flink.api.common.typeinfo.Types;  
import org.apache.flink.api.java.tuple.Tuple2;  
import org.apache.flink.connector.kafka.source.KafkaSource;  
import org.apache.flink.connector.kafka.source.enumerator.initializer.OffsetsInitializer;  
import org.apache.flink.streaming.api.environment.StreamExecutionEnvironment;  
import org.apache.flink.util.Collector;  
  
  
public class KafkaConsumerSourceDemo {  
  
    public static void main(String[] args) throws Exception {  
        StreamExecutionEnvironment env = StreamExecutionEnvironment.getExecutionEnvironment();  
  
        KafkaSource<String> source = KafkaSource.<String>builder()  
                .setBootstrapServers("debian:9092")  
                .setTopics("topic_demo")  
                .setStartingOffsets(OffsetsInitializer.latest())  
                .setValueOnlyDeserializer(new SimpleStringSchema())  
                .build();  
  
        env.fromSource(source, WatermarkStrategy.noWatermarks(), "kafka_source")  
                .flatMap((String s, Collector<String> o) -> {  
                    for (String word : s.replaceAll("\\W", " ").split(" ")) {  
                        o.collect(word);  
                    }  
                })  
                .returns(String.class)  
                .filter(StringUtils::isNotBlank)  
                .map(w -> Tuple2.of(w, 1))  
                .returns(Types.TUPLE(Types.STRING, Types.INT))  
                .keyBy(t -> t.f0)  
                .sum(1)  
                .print()  
        ;  
  
        env.execute();  
    }  
}
```

## flink的数据类型

```java
.map(word -> Tuple2.of(word, 1L))
.returns(Types.TUPLE(Types.STRING, Types.LONG));

// 定义泛型类
.returns(new TypeHint<Tuple2<Integer, SomeType>>(){})
```

## 转换算子

1. map
2. filter
3. flatMap
4. keyBy
5. reduce
6. sum
7. min 对指定的字段求最小值。
8. minBy 返回包含字段最小值的整条数据。
9. max
10. maxBy
11. reduce 可以对已有的数据进行归约处理，把每一个新输入的数据和当前已经归约出来的

值，再做一个聚合计算。

示例：
max

```java
StreamExecutionEnvironment env = StreamExecutionEnvironment.getExecutionEnvironment();  
env.setParallelism(1);  
  
env.fromElements(  
                new WaterSensor("s1", 1L, 1),  
                new WaterSensor("s1", 2L, 11),  
                new WaterSensor("s2", 2L, 2),  
                new WaterSensor("s3", 3L, 3)  
        )  
        .keyBy(k -> k.id)  
        .max("vc")  
        .print()  
;  
  
env.execute();
```

仅vc字段有变化

```
WaterSensor{id='s1', ts=1, vc=1}
WaterSensor{id='s1', ts=1, vc=11}
WaterSensor{id='s2', ts=2, vc=2}
WaterSensor{id='s3', ts=3, vc=3}
```

如果使用maxBy，则使用最大的那一条数据

```
WaterSensor{id='s1', ts=1, vc=1}
WaterSensor{id='s1', ts=2, vc=11}
WaterSensor{id='s2', ts=2, vc=2}
WaterSensor{id='s3', ts=3, vc=3}
```

reduce，

```java
env.fromElements(  
                new WaterSensor("s1", 1L, 1),  
                new WaterSensor("s1", 2L, 11),  
                new WaterSensor("s2", 2L, 2),  
                new WaterSensor("s3", 3L, 3)  
        )  
        .keyBy(k -> k.id)  
        .reduce((prev, next) -> {  
            if (prev.vc > next.vc) {  
                return prev;  
            }  
            return next;  
        })  
        .print()  
;
```

## 分区算子

1. shuffle 随机分区
2. rebalance 轮询分区
3. rescale 缩放分区，轮询发送到下游并行任务的一部分中
4. broadcast 输入数据复制并发送到下游算子的所有并行任务中去。
5. global 所有的输入流数据都发送到下游算子的第一个并行子任务中去

自定义分区

```java
env.fromSource(source, WatermarkStrategy.noWatermarks(), "datagen")  
        .partitionCustom((key, numPartitions) -> key % numPartitions / 2, Integer::valueOf)  
        .print();
```

## 侧流

```java
package io.leaderli.flink.demo;  
  
import org.apache.flink.api.common.typeinfo.Types;  
import org.apache.flink.streaming.api.datastream.SingleOutputStreamOperator;  
import org.apache.flink.streaming.api.environment.StreamExecutionEnvironment;  
import org.apache.flink.streaming.api.functions.ProcessFunction;  
import org.apache.flink.util.Collector;  
import org.apache.flink.util.OutputTag;  
  
public class SideOutputDemo {  
    public static void main(String[] args) throws Exception {  
        StreamExecutionEnvironment env = StreamExecutionEnvironment.getExecutionEnvironment();  
        env.setParallelism(1);  
  
        OutputTag<WaterSensor> tag1 = new OutputTag<>("s1", Types.POJO(WaterSensor.class));  
        OutputTag<WaterSensor> tag2 = new OutputTag<>("s2", Types.POJO(WaterSensor.class));  
        SingleOutputStreamOperator<WaterSensor> process = env.fromElements(  
                        new WaterSensor("s1", 1L, 1),  
                        new WaterSensor("s1", 2L, 11),  
                        new WaterSensor("s2", 2L, 2),  
                        new WaterSensor("s3", 3L, 3),  
                        new WaterSensor("s4", 4L, 4)  
                )  
                .process(new ProcessFunction<WaterSensor, WaterSensor>() {  
                    @Override  
                    public void processElement(WaterSensor value, ProcessFunction<WaterSensor, WaterSensor>.Context ctx, Collector<WaterSensor> out) throws Exception {  
  
                        if ("s1".equals(value.id)) {  
                            ctx.output(tag1, value);  
                        } else if ("s2".equals(value.id)) {  
                            ctx.output(tag2, value);  
                        } else {  
                            out.collect(value);  
                        }  
                    }  
                });  
        process.print();  
  
        process.getSideOutput(tag1).print("s1");  
        process.getSideOutput(tag2).print("s2");  
  
  
        env.execute();  
    }  
}
```

## 合流

union

```java
package io.leaderli.flink.demo;  
  
import org.apache.flink.streaming.api.datastream.DataStreamSource;  
import org.apache.flink.streaming.api.environment.StreamExecutionEnvironment;  
  
public class UnionDemo {  
  
    public static void main(String[] args) throws Exception {  
  
        StreamExecutionEnvironment env = StreamExecutionEnvironment.getExecutionEnvironment();  
        env.setParallelism(1);  
  
        DataStreamSource<Integer> source1 = env.fromElements(1, 2, 3);  
        DataStreamSource<Integer> source2 = env.fromElements(4, 5, 6);  
        DataStreamSource<Integer> source3 = env.fromElements(7, 8, 9);  
  
        source1.union(source2,source3).print();  
  
        env.execute();  
    }  
}
```

connect

多并行度的情况下，需要keyby将数据分配到合适的节点

```java
package io.leaderli.flink.demo;  
  
import org.apache.flink.streaming.api.datastream.DataStreamSource;  
import org.apache.flink.streaming.api.environment.StreamExecutionEnvironment;  
import org.apache.flink.streaming.api.functions.co.CoMapFunction;  
  
public class ConnectDemo {  
  
    public static void main(String[] args) throws Exception {  
  
        StreamExecutionEnvironment env = StreamExecutionEnvironment.getExecutionEnvironment();  
        env.setParallelism(1);  
  
        DataStreamSource<Integer> source1 = env.fromElements(1, 2, 3);  
        DataStreamSource<String> source2 = env.fromElements("4", "5", "6");  
  
        source1.connect(source2).map(new CoMapFunction<Integer, String, String>() {  
                    @Override  
                    public String map1(Integer value) {  
                        return value + "";  
                    }  
  
                    @Override  
                    public String map2(String value) {  
                        return value;  
                    }  
                })  
                .print();  
  
        env.execute();  
    }  
}
```

## 输出算子

### 文件


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
