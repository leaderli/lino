---
tags:
  - 软件/flink
date updated: 2024-01-14 16:22
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

```java
package io.leaderli.flink.demo;

import org.apache.commons.lang3.RandomStringUtils;
import org.apache.flink.api.common.eventtime.WatermarkStrategy;
import org.apache.flink.api.common.serialization.SimpleStringEncoder;
import org.apache.flink.api.common.typeinfo.Types;
import org.apache.flink.api.connector.source.util.ratelimit.RateLimiterStrategy;
import org.apache.flink.configuration.MemorySize;
import org.apache.flink.connector.datagen.source.DataGeneratorSource;
import org.apache.flink.connector.file.sink.FileSink;
import org.apache.flink.core.fs.Path;
import org.apache.flink.streaming.api.CheckpointingMode;
import org.apache.flink.streaming.api.environment.StreamExecutionEnvironment;
import org.apache.flink.streaming.api.functions.sink.filesystem.OutputFileConfig;
import org.apache.flink.streaming.api.functions.sink.filesystem.bucketassigners.DateTimeBucketAssigner;
import org.apache.flink.streaming.api.functions.sink.filesystem.rollingpolicies.DefaultRollingPolicy;

import java.time.Duration;
import java.time.ZoneId;

public class FileOutDemo {

    public static void main(String[] args) throws Exception {
        StreamExecutionEnvironment env = StreamExecutionEnvironment.getExecutionEnvironment();
        env.setParallelism(2);
        env.enableCheckpointing(1000, CheckpointingMode.EXACTLY_ONCE);
        DataGeneratorSource<String> source = new DataGeneratorSource<>(
                l -> RandomStringUtils.random(1000),
                1000,
                RateLimiterStrategy.perSecond(100),

                Types.STRING);

        FileSink<String> sink = FileSink
                .<String>forRowFormat(
                        // 路径
                        new Path("D:/app"),
                        // 解码，编码格式
                        new SimpleStringEncoder<>("UTF-8"))
                // 指定文件前缀，后缀
                .withOutputFileConfig(OutputFileConfig.builder()
                        .withPartPrefix("li_")
                        .withPartSuffix(".log")
                        .build())
                // 按照日期分目录
                .withBucketAssigner(new DateTimeBucketAssigner<>("yyyyMMdd", ZoneId.systemDefault()))
                // 文件滚动策略，10s或者1M，生成新文件
                .withRollingPolicy(DefaultRollingPolicy.builder()
                        .withRolloverInterval(Duration.ofSeconds(10))
                        .withMaxPartSize(MemorySize.parse("1M"))
                        .build())
                .build();
        env.fromSource(source, WatermarkStrategy.noWatermarks(), "datagen")
                .sinkTo(sink);


        env.execute();
    }
}
```

### kafka

```java
package io.leaderli.flink.demo;

import org.apache.flink.api.common.serialization.SimpleStringSchema;
import org.apache.flink.configuration.Configuration;
import org.apache.flink.connector.base.DeliveryGuarantee;
import org.apache.flink.connector.kafka.sink.KafkaRecordSerializationSchema;
import org.apache.flink.connector.kafka.sink.KafkaSink;
import org.apache.flink.streaming.api.CheckpointingMode;
import org.apache.flink.streaming.api.datastream.DataStreamSource;
import org.apache.flink.streaming.api.environment.StreamExecutionEnvironment;
import org.apache.kafka.clients.producer.ProducerConfig;

public class KafkaSinkDemo {
    public static void main(String[] args) throws Exception {
        StreamExecutionEnvironment env = StreamExecutionEnvironment.createLocalEnvironmentWithWebUI(new Configuration());
        env.setParallelism(1);
        // 如果是精准一次，必须开启 checkpoint
        env.enableCheckpointing(2000, CheckpointingMode.EXACTLY_ONCE);
        DataStreamSource<String> ds = env.socketTextStream("debian", 7777);
        /*
         * Kafka Sink:
         * 注意：如果要使用 精准一次 写入 Kafka，需要满足以下条件，缺一不可
         * 1、开启 checkpoint（后续介绍）
         * 2、设置事务前缀
         * 3、设置事务超时时间： checkpoint 间隔 < 事务超时时间 < max
         的 15 分钟
         */
        KafkaSink<String> sink = KafkaSink.<String>builder()
                .setBootstrapServers("debian:9092")
                // 指定序列化器，指定topic名称，具体的序列化
                .setRecordSerializer(KafkaRecordSerializationSchema.<String>builder()
                        .setTopic("ws")
                        .setValueSerializationSchema(new SimpleStringSchema())
                        .build())
                // 写到 kafka 的一致性级别：精准一次，至少一次
                .setDeliveryGuarantee(DeliveryGuarantee.EXACTLY_ONCE)
                // 如果是精准一次，必须设置事务的前缀
                .setTransactionalIdPrefix("li-")
                // 如果是精准一次，必须设置事务超时时间：大于checkpoint间隔，小于max
                .setProperty(ProducerConfig.TRANSACTION_TIMEOUT_CONFIG, 15 * 60 * 1000 + "")
                .build();
        ds.sinkTo(sink);
        env.execute();
    }
}

```

### mysql

```xml
<dependency>  
    <groupId>org.apache.flink</groupId>  
    <artifactId>flink-connector-jdbc</artifactId>  
    <version>3.1.0-1.17</version>  
</dependency>
```

```java
package io.leaderli.flink.demo;

import org.apache.flink.api.common.functions.MapFunction;
import org.apache.flink.configuration.Configuration;
import org.apache.flink.connector.jdbc.JdbcConnectionOptions;
import org.apache.flink.connector.jdbc.JdbcExecutionOptions;
import org.apache.flink.connector.jdbc.JdbcSink;
import org.apache.flink.connector.jdbc.JdbcStatementBuilder;
import org.apache.flink.streaming.api.datastream.DataStreamSource;
import org.apache.flink.streaming.api.environment.StreamExecutionEnvironment;
import org.apache.flink.streaming.api.functions.sink.SinkFunction;

import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.Arrays;
import java.util.Objects;

public class MysqlSinkDemo {
    public static void main(String[] args) throws Exception {
        StreamExecutionEnvironment env = StreamExecutionEnvironment.createLocalEnvironmentWithWebUI(new Configuration());
        env.setParallelism(1);
        DataStreamSource<String> ds = env.socketTextStream("debian", 7777);
        SinkFunction<WaterSensor> sink = JdbcSink.sink("insert into ws values(?,?,?)",
                new JdbcStatementBuilder<WaterSensor>() {
                    @Override
                    public void accept(PreparedStatement preparedStatement, WaterSensor waterSensor) throws SQLException {
                        preparedStatement.setString(1, waterSensor.id);
                        preparedStatement.setLong(2, waterSensor.ts);
                        preparedStatement.setInt(3, waterSensor.vc);

                    }
                },
                JdbcExecutionOptions.builder()
                        .withBatchIntervalMs(3000)
                        .withBatchSize(100)
                        .withMaxRetries(3)
                        .build(),
                new JdbcConnectionOptions.JdbcConnectionOptionsBuilder()
                        .withUrl("jdbc:mysql://centos7:3306/leaderli")
                        .withUsername("root")
                        .withPassword("123456")
                        .withConnectionCheckTimeoutSeconds(6)
                        .build());
        ds.map(new MapFunction<String, WaterSensor>() {
                    @Override
                    public WaterSensor map(String value) throws Exception {
                        String[] split = value.split(",");
                        System.out.println(Arrays.toString(split));
                        if (split.length == 3) {
                            return new WaterSensor(split[0], Long.valueOf(split[1]), Integer.valueOf(split[2]));
                        }
                        return null;
                    }
                })
                .filter(Objects::nonNull)
                .addSink(sink);
        env.execute();
    }
}
```

## 窗口

窗口操作持续创建一些称为桶的有限事件集合，并允许我们基于这些有限集进行计算。事件通常会根据其时间或其他属性分配到不同桶中。

窗口的行为是由一系列策略定义的，这些窗口策略决定了什么时间创建桶，事件如何分配到桶中以及桶内数据什么时间参与计算。其中参与计算的决策会根据触发条件判断，当触发条件满足时，桶内数据会发送给一个计算函数，由它来对桶中的元素应用计算逻辑。

### 按照驱动类型分类

1. 时间窗口 以时间点来定义窗口的开始和结束
2. 计数窗口 以元素的个数来截取数据

### 按窗口分配的数据的规则分类

1. 滚动窗口 具有固定的大小，对数据进行均匀切片，窗口之间没有重叠，也不会有间隔
2. 滑动窗口 具有固定的大小，有一个滑动步长，它代表了窗口计算的评率。适用于计算结果更新评率非常高的场景
3. 会话窗口 长度不固定，起始时间和结束时间也确定，其通过会话的超时时间，即相邻两个数据达到的时间间隔小于指定的大小，说明还在保持会话，他们就属于同一个窗口，否则，就关闭当前窗口，新建会话窗口。
4. 全局窗口 把相同key的数据都分配到同一个窗口中，这种窗口默认不会做触发计算，如果希望对数据进行计算处理，需要自己定义触发器

### 按键分区和非按键分区

```java
// 经过keyBy分区后，分为多个子任务，窗口操作基于每个key进行单独的处理
stream.keyBy(...).window(...)

// 窗口逻辑在一个任务上执行
stream.windowAll(...)
```

### 窗口API

窗口操作主要有两个部分：窗口分配器和窗口函数

```java
stream.keyBy(<key selector>)
	.window(<window assigner>)
	.aggregate(<window function>)
```

```java
// 滚动处理时间窗口
window(TumblingProcessingTimeWindows.of(Time.seconds(5)))

// 滑动处理时间窗口   大小 步长
window(SlidingProcessingTimeWindows.of(Time.seconds(10)))

// 处理时间会话窗口
window(ProcessingTimeSessionWindows.withGap(Time.seconds(10))
	   
// 滚动事件时间窗口
window(TumblingEventTimeWindows.of(Time.seconds(5)))

// 滑动事件时间窗口   大小 步长
window(SlidingEventTimeWindows.of(Time.seconds(10)))

// 事件时间会话窗口
window(EventTimeSessionWindows.withGap(Time.seconds(10)))

// 滚动计数窗口
countWindow(10)
// 滑动计数窗口
countWindow(10, 3)
```

滚动聚合（如求和、求最小值）会根据每个到来的事件持续更新结果。聚合操作都是有状态的，它们将到来的事件合并到已有状态来生成更新后的聚合值。聚合函数必须满足可结合以及可交换的条件，以用于合并事件和当前状态并生成单个结果。

reduce

```java
package io.leaderli.flink.demo;  
  
import org.apache.flink.streaming.api.datastream.DataStreamSource;  
import org.apache.flink.streaming.api.environment.StreamExecutionEnvironment;  
  
  
    public static void main(String[] args) throws Exception {  
        StreamExecutionEnvironment env = StreamExecutionEnvironment.getExecutionEnvironment();  
        env.setParallelism(1);  
        DataStreamSource<Long> ds = env.fromSequence(0, 20);  
        ds.countWindowAll(5, 2)  
                .reduce((l1, l2) -> {  
                    System.out.println(">" + l2);  
                    return l1 + l2;  
                })  
                .print();  
        env.execute();  
    }  
```

aggregate

```java
package io.leaderli.flink.demo;  
  
import org.apache.flink.api.common.functions.AggregateFunction;  
import org.apache.flink.streaming.api.datastream.DataStreamSource;  
import org.apache.flink.streaming.api.environment.StreamExecutionEnvironment;  
  
  
    public static void main(String[] args) throws Exception {  
        StreamExecutionEnvironment env = StreamExecutionEnvironment.getExecutionEnvironment();  
        env.setParallelism(1);  
        DataStreamSource<Long> ds = env.fromSequence(0, 20);  
        ds.keyBy(l -> l % 10).countWindow(5, 2)  
                .aggregate(new AggregateFunction<Long, Long, Long>() {  
                    @Override  
                    public Long createAccumulator() {  
                        // 窗口创建时调用
                        return 0L;  
                    }  
  
                    @Override  
                    public Long add(Long value, Long accumulator) {  
                        System.out.println(">" + value);  
                        return value + accumulator;  
                    }  
  
                    @Override  
                    public Long getResult(Long accumulator) {  
                        // 窗口结束时调用  
                        return accumulator;  
                    }  
  
                    @Override  
                    public Long merge(Long a, Long b) {  
                        // 只有会话窗口才会用到  
                        return null;  
                    }  
                })  
                .print();  
        env.execute();  
    }  
```

process  窗口函数，处理整个窗口所有的数据，包括窗口的上下文信息

```java
package io.leaderli.flink.demo;  
  
import org.apache.flink.streaming.api.datastream.DataStreamSource;  
import org.apache.flink.streaming.api.environment.StreamExecutionEnvironment;  
import org.apache.flink.streaming.api.functions.windowing.ProcessAllWindowFunction;  
import org.apache.flink.streaming.api.windowing.windows.GlobalWindow;  
import org.apache.flink.util.Collector;  
  
import java.util.ArrayList;  
import java.util.List;  
  
  
    public static void main(String[] args) throws Exception {  
        StreamExecutionEnvironment env = StreamExecutionEnvironment.getExecutionEnvironment();  
        env.setParallelism(1);  
        DataStreamSource<Long> ds = env.fromSequence(0, 20);  
        ds.countWindowAll(5, 2)  
                .process(new ProcessAllWindowFunction<Long, Object, GlobalWindow>() {  
                    @Override  
                    public void process(ProcessAllWindowFunction<Long, Object, GlobalWindow>.Context context, Iterable<Long> elements, Collector<Object> out) throws Exception {  
                        List<Long> list = new ArrayList<>();  
                        elements.forEach(list::add);  
                        out.collect(list.toString());  
                    }  
                })  
                .print();  
        env.execute();  
    }  
```

```python
[0, 1]
[0, 1, 2, 3]
[1, 2, 3, 4, 5]
[3, 4, 5, 6, 7]
[5, 6, 7, 8, 9]
[7, 8, 9, 10, 11]
[9, 10, 11, 12, 13]
[11, 12, 13, 14, 15]
[13, 14, 15, 16, 17]
[15, 16, 17, 18, 19]
```

```java
package io.leaderli.flink.demo;  
  
import org.apache.flink.streaming.api.datastream.DataStreamSource;  
import org.apache.flink.streaming.api.environment.StreamExecutionEnvironment;  
import org.apache.flink.streaming.api.functions.windowing.ProcessWindowFunction;  
import org.apache.flink.streaming.api.windowing.windows.GlobalWindow;  
import org.apache.flink.util.Collector;  
  
import java.util.ArrayList;  
import java.util.List;  
  
  
    public static void main(String[] args) throws Exception {  
        StreamExecutionEnvironment env = StreamExecutionEnvironment.getExecutionEnvironment();  
        env.setParallelism(1);  
        DataStreamSource<Long> ds = env.fromSequence(0, 20);  
        ds.keyBy(l -> l % 5).countWindow(5, 2)  
                .process(new ProcessWindowFunction<Long, String, Long, GlobalWindow>() {  
                    @Override  
                    public void process(Long key, ProcessWindowFunction<Long, String, Long, GlobalWindow>.Context context, Iterable<Long> elements, Collector<String> out) {  
  
                        List<Long> list = new ArrayList<>();  
                        elements.forEach(list::add);  
                        // key 分区键  
                        out.collect(key + "->" + list);  
  
                    }  
                })  
                .print();  
        env.execute();  
    }  
```

```python
0->[0, 5]
1->[1, 6]
2->[2, 7]
3->[3, 8]
4->[4, 9]
0->[0, 5, 10, 15]
1->[1, 6, 11, 16]
2->[2, 7, 12, 17]
3->[3, 8, 13, 18]
4->[4, 9, 14, 19]
```

reduce 和 aggregate 可以传入一个process参数，该process中仅会存储 reduce 和 aggregate 的结果

```java
package io.leaderli.flink.demo;  
  
import org.apache.flink.streaming.api.datastream.DataStreamSource;  
import org.apache.flink.streaming.api.environment.StreamExecutionEnvironment;  
import org.apache.flink.streaming.api.functions.windowing.ProcessAllWindowFunction;  
import org.apache.flink.streaming.api.windowing.windows.GlobalWindow;  
import org.apache.flink.util.Collector;  
  
  
    public static void main(String[] args) throws Exception {  
        StreamExecutionEnvironment env = StreamExecutionEnvironment.getExecutionEnvironment();  
        env.setParallelism(1);  
        DataStreamSource<Long> ds = env.fromSequence(0, 20);  
        ds.countWindowAll(5, 2)  
                .reduce(Long::sum, new ProcessAllWindowFunction<Long, String, GlobalWindow>() {  
                    @Override  
                    public void process(ProcessAllWindowFunction<Long, String, GlobalWindow>.Context context, Iterable<Long> elements, Collector<String> out) throws Exception {  
                        out.collect(context.window().maxTimestamp() + "->" + elements.iterator().next());  
                    }  
                })  
                .print();  
  
        env.execute();  
    }  
```

### 其他API

```java
// 触发器主要是用来控制窗口什么时候触发计算
stream.keyBy(...)
	.window(...)
	.trigger(new MyTrigger())

// 移除器主要用来定义移除某些数据的逻辑
stream.keyBy(...)
	.window(...)
	.evictor(new MyEvictor())
```

## 时间语义

- 处理时间  当前流处理算子所在机器上的本地时钟时间。
- 事件时间  数据流中事件实际发生的时间，它以附加在数据流中事件的时间戳为依据

```ad-info
title:逻辑时钟
时钟的时间不会自动流逝；它的时间进展，就是靠着新到数据的时间戳来推动的。计算的过程可以完全不依赖处理时间（系统时间），不论什么时候进行统计
处理，得到的结果都是正确的。而一般实时流处理的场景中，事件时间可以基本与处理时间保持同
步，只是略微有一点延迟，同时保证了窗口计算的正确性
```

### 水位线

用来衡量事件时间进展的标记，可以看做一条特殊的数据记录，主要内容就是一个时间戳，用来指示当前的事件时间。水位线是基于数据的时间戳生成的，是单调递增的。水位线可以通过设置延迟，来确保正确处理乱序数据。一个水位线Watermark(t)，表示在当前流中事件时间已经达到了时间戳t，这代表t之前的所有数据都到齐了，之后流中不会出现时间戳t’≤ t的数据。它往往会跟窗口一起配合

```java
package io.leaderli.flink.demo;  
  
import org.apache.flink.api.common.eventtime.WatermarkStrategy;  
import org.apache.flink.streaming.api.datastream.DataStreamSource;  
import org.apache.flink.streaming.api.environment.StreamExecutionEnvironment;  
import org.apache.flink.streaming.api.windowing.assigners.TumblingEventTimeWindows;  
import org.apache.flink.streaming.api.windowing.time.Time;  
  
  
    public static void main(String[] args) throws Exception {  
        StreamExecutionEnvironment env = StreamExecutionEnvironment.getExecutionEnvironment();  
        env.setParallelism(1);  
        DataStreamSource<Long> ds = env.fromSequence(0, 20);  
        ds.assignTimestampsAndWatermarks(
        // 指定 watermark 生成：升序的 watermark，没有等待时间
        WatermarkStrategy.<Long>forMonotonousTimestamps()  
						// 指定 时间戳分配器，从数据中提取
                        .withTimestampAssigner((element, recordTimestamp) -> {  
                            System.out.println(element + " < " + recordTimestamp);  
                            return (element % 10) * 1000;  
                        }))  
                .windowAll(TumblingEventTimeWindows.of(Time.seconds(5)))  
                .reduce((o, a) -> {  
                    System.out.println("<" + a + " " + o);  
                    return o + a;  
                })  
                .print();  
  
        env.execute();  
    }  
```

```java
package io.leaderli.flink.demo;  
  
import org.apache.flink.api.common.eventtime.WatermarkStrategy;  
import org.apache.flink.streaming.api.datastream.DataStreamSource;  
import org.apache.flink.streaming.api.environment.StreamExecutionEnvironment;  
import org.apache.flink.streaming.api.windowing.assigners.TumblingEventTimeWindows;  
import org.apache.flink.streaming.api.windowing.time.Time;  
  
import java.time.Duration;  
import java.util.Random;  
  
  
    public static void main(String[] args) throws Exception {  
        StreamExecutionEnvironment env = StreamExecutionEnvironment.getExecutionEnvironment();  
        env.setParallelism(1);  
        DataStreamSource<Long> ds = env.fromSequence(0, 20);  
        ds.assignTimestampsAndWatermarks(WatermarkStrategy.  
						 // 指定 watermark 生成：乱序的，等待 3s
                        <Long>forBoundedOutOfOrderness(Duration.ofSeconds(3))  
                        .withTimestampAssigner((element, recordTimestamp) -> {  
                            System.out.println(element + " < " + recordTimestamp);  
                            return new Random().nextInt(20) * 1000;  
                        }))  
                .windowAll(TumblingEventTimeWindows.of(Time.seconds(5)))  
                .reduce((o, a) -> {  
                    System.out.println("<" + a + " " + o);  
                    return o + a;  
                })  
                .print();  
  
        env.execute();  
    }  
```

自定义水位线

```java
package io.leaderli.flink.demo;  
  
import org.apache.flink.api.common.eventtime.Watermark;  
import org.apache.flink.api.common.eventtime.WatermarkGenerator;  
import org.apache.flink.api.common.eventtime.WatermarkOutput;  
import org.apache.flink.api.common.eventtime.WatermarkStrategy;  
import org.apache.flink.streaming.api.datastream.DataStreamSource;  
import org.apache.flink.streaming.api.environment.StreamExecutionEnvironment;  
import org.apache.flink.streaming.api.windowing.assigners.TumblingEventTimeWindows;  
import org.apache.flink.streaming.api.windowing.time.Time;  
  
  
    private static class MyWatermarkGenerator implements WatermarkGenerator<Long> {  
  
        private long time;  
  
        @Override  
        public void onEvent(Long event, long eventTimestamp, WatermarkOutput output) {  
            this.time = Math.max(event, eventTimestamp);  
			// 可通过 WatermarkOutput ，直接触发水位线的生成
        }  
  
		// 周期性的调用该方法生成水位线
        @Override  
        public void onPeriodicEmit(WatermarkOutput output) {  
            output.emitWatermark(new Watermark(time));  
        }  
    }  
  
    public static void main(String[] args) throws Exception {  
        StreamExecutionEnvironment env = StreamExecutionEnvironment.getExecutionEnvironment();  
		// 设置水位线周期，默认为200  
		env.getConfig().setAutoWatermarkInterval(2000);
        env.setParallelism(1);  
        DataStreamSource<Long> ds = env.fromSequence(0, 20);  
        ds.assignTimestampsAndWatermarks(WatermarkStrategy.  
                        forGenerator(ctx -> new MyWatermarkGenerator())  
                        .withTimestampAssigner((element, recordTimestamp) -> element))  
                .windowAll(TumblingEventTimeWindows.of(Time.seconds(5)))  
                .reduce((o, a) -> {  
                    System.out.println("<" + a + " " + o);  
                    return o + a;  
                })  
                .print();  
  
        env.execute();  
    }  
```

在数据源中指定水位线

```java
env.fromSource(
	kafkaSource,
	WatermarkStrategy.forBoundedOutOfOrderness(Duration.ofSeconds(3)),
	"kafkasource"
)
```

## 流处理基础

Dataflow图[[intellij_idea]]

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
