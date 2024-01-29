---
tags:
  - 软件/flink
  - '#启动'
  - '#停止'
  - '#测试'
  - '#默认'
date updated: 2024-01-28 22:58
---

# 简介

flink 是一个分布式处理引擎，用于在无边界和有边界数据流上进行有状态的计算。任何类型的数据都可以形成一种事件流。

[官网](https://flink.apache.org/)。

# 快速入门

## 安装

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

## 配置允许ip访问 Web UI

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

# 快速入门（java）

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

# 读取数据

## 读取文件

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

## 读取kafka

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

# flink的数据类型

```java
.map(word -> Tuple2.of(word, 1L))
.returns(Types.TUPLE(Types.STRING, Types.LONG));

// 定义泛型类
.returns(new TypeHint<Tuple2<Integer, SomeType>>(){})
```

# 转换算子

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

# 分区算子

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

# 侧流

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

# 合流

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

# 输出算子

## 文件

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

## kafka

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

## mysql

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

# 窗口

窗口操作持续创建一些称为桶的有限事件集合，并允许我们基于这些有限集进行计算。事件通常会根据其时间或其他属性分配到不同桶中。

窗口的行为是由一系列策略定义的，这些窗口策略决定了什么时间创建桶，事件如何分配到桶中以及桶内数据什么时间参与计算。其中参与计算的决策会根据触发条件判断，当触发条件满足时，桶内数据会发送给一个计算函数，由它来对桶中的元素应用计算逻辑。

## 按照驱动类型分类

1. 时间窗口 以时间点来定义窗口的开始和结束
2. 计数窗口 以元素的个数来截取数据

## 按窗口分配的数据的规则分类

1. 滚动窗口 具有固定的大小，对数据进行均匀切片，窗口之间没有重叠，也不会有间隔
2. 滑动窗口 具有固定的大小，有一个滑动步长，它代表了窗口计算的评率。适用于计算结果更新评率非常高的场景
3. 会话窗口 长度不固定，起始时间和结束时间也确定，其通过会话的超时时间，即相邻两个数据达到的时间间隔小于指定的大小，说明还在保持会话，他们就属于同一个窗口，否则，就关闭当前窗口，新建会话窗口。
4. 全局窗口 把相同key的数据都分配到同一个窗口中，这种窗口默认不会做触发计算，如果希望对数据进行计算处理，需要自己定义触发器

## 按键分区和非按键分区

```java
// 经过keyBy分区后，分为多个子任务，窗口操作基于每个key进行单独的处理
stream.keyBy(...).window(...)

// 窗口逻辑在一个任务上执行
stream.windowAll(...)
```

## 窗口的生命周期

创建 属于窗口的第一个数据到来的时候
销毁，关窗  数据时间 >= 窗口的最大时间戳 + 允许最大的延迟

## 窗口API

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

## 其他API

```java
// 触发器主要是用来控制窗口什么时候触发计算
stream.keyBy(...)
	.window(...)
	.trigger(new MyTrigger())

// 移除器主要用来定义移除某些数据的逻辑
stream.keyBy(...)
	.window(...)
	.evictor(new MyEvictor())
// 延迟关闭窗口，只能运用在 event time 上
stream.keyBy(...)
	.window(TumblingEventTimeWindows.of(Time.seconds(5)))
	.allowedLateness(Time.seconds(3))
	// 关窗后的迟到数据，放入侧输出流
	.sideOutputLateData(lateTag) 
```

# 窗口联结

为基于一段时间的双流合并专门提供了一个窗口联结算子，可以定义时间窗口，并
将两条流中共享一个公共键（key）的数据放在窗口中进行配对处理。

```java
stream1.join(stream2)
	.where(<KeySelector>)
	.equalTo(<KeySelector>)
	.window(<WindowAssigner>)
	.apply(<JoinFunction>)
```

类似

```sql
SELECT * FROM table1 t1, table2 t2 WHERE t1.id = t2.id;
```

针对一条流的每个数据，开辟出其时间戳前后的一段时间间隔，看这期间是否有来自另一条流的数据匹配。

![[Pasted image 20240114210925.png]]

```java
stream1
	.keyBy(<KeySelector>)
	.intervalJoin(stream2.keyBy(<KeySelector>))
	.between(Time.milliseconds(-2), Time.milliseconds(1))
	.sideOutputLeftLateData(ks1LateTag) // 将 ks1 的迟到数据，放入侧输出流
	.sideOutputRightLateData(ks2LateTag) // 将 ks2 的迟到数据，放入侧输出流
	.process (new ProcessJoinFunction<Integer, Integer, String(){
		@Override
		public void processElement(Integer left, Integer right,Context ctx, Collector<String> out) {
			out.collect(left + "," + right);
		}
	});
```

# 处理函数

process 是最底层的API

![[Pasted image 20240114215059.png]]

```java
stream.process(new MyProcessFunction())
```

```java
class MyProcessFunction extends KeyedProcessFunction<String, WaterSensor, String> {  
    /**  
     * 来一条数据调用一次  
     *  
     * @param value 当前流中的输入元素，也就是正在处理的数据，类型与流中数据类型一致  
     * @param ctx   类型是 ProcessFunction 中定义的内部抽象类 Context，表示当前运行的上下文，可以获取到当前的时间戳，并提供了用于查询时间和注册定时器的“定时服务”  
     *              （TimerService），以及可以将数据发送到“侧输出流”（side output）的方法.output()。  
     * @param out   “收集器”（类型为 Collector），用于返回输出数据。使用方式与 flatMap 算子中的收集器完全一样，直接调用 out.collect()方法就可以向下游发出一个数据。这个方法可以多次调用，也可以不调用  
     */  
    @Override  
    public void processElement(WaterSensor value, Context ctx, Collector<String> out) throws Exception {  
        //获取当前数据的 key        
        String currentKey = ctx.getCurrentKey();  
        // 1. 定时器注册  
        TimerService timerService = ctx.timerService();// 1、事件时间的案例  
        Long currentEventTime = ctx.timestamp(); //数据中提取出来的事件时间  
        timerService.registerEventTimeTimer(5000L);  
        System.out.println("当前 key=" + currentKey + ",当前时间=" + currentEventTime + ",注册了一个 5s 的定时器");  
        // 2. 处理时间的案例  
        long currentTs = timerService.currentProcessingTime();  
        timerService.registerProcessingTimeTimer(currentTs + 5000L);  
        System.out.println("当前 key=" + currentKey + ",当前时间=" + currentTs + ",注册了一个 5s 后的定时器");  
        // 3. 获取 process 的 当前 watermark , watermark为上一条数据的位置的，因为还未生产当前数据的watermark       
        long currentWatermark = timerService.currentWatermark();  
        System.out.println("当前数据=" + value + ",当前 watermark = " + currentWatermark);  
        // 4. 获取当前时间进展： 处理时间-当前系统时间， 事件时间 - 当前 watermark        
        currentTs = timerService.currentProcessingTime();  
        long wm = timerService.currentWatermark();  
    }  
  
    /**  
     * 
     * 这个方法只有在注册好的定时器触发的时候才会调用，而定时器是通过“定时服务”TimerService 来注册的，只能在KeyedStream中设置定时器。TimerService 会以键（key）和时间戳为标准，对定时器进行去重；也就是说对于每个key 和时间戳，最多只有一个定时器，如果注册了多次，onTimer()方法也将只被调用一次
     *  
     * @param timestamp 当前时间进展，就是定时器被触发时的时间  
     * @param ctx       上下文  
     * @param out       采集器  
     */  
    @Override  
    public void onTimer(long timestamp, OnTimerContext ctx, Collector<String> out) throws Exception {  
        super.onTimer(timestamp, ctx, out);  
        String currentKey = ctx.getCurrentKey();  
        System.out.println("key=" + currentKey + "现 在时间是" + timestamp + " 定时器触发");  
    }  
}
```

TimerService

```java
// 获取当前的处理时间
long currentProcessingTime();
// 获取当前的水位线（事件时间）
long currentWatermark();
// 注册处理时间定时器，当处理时间超过 time 时触发
void registerProcessingTimeTimer(long time);
// 注册事件时间定时器，当水位线超过 time 时触发
void registerEventTimeTimer(long time);
// 删除触发时间为 time 的处理时间定时器
void deleteProcessingTimeTimer(long time);
// 删除触发时间为 time 的处理时间定时器
void deleteEventTimeTimer(long time);
```

# 时间语义

- 处理时间  当前流处理算子所在机器上的本地时钟时间。

- 事件时间  数据流中事件实际发生的时间，它以附加在数据流中事件的时间戳为依据

```ad-info
title:逻辑时钟
时钟的时间不会自动流逝；它的时间进展，就是靠着新到数据的时间戳来推动的。计算的过程可以完全不依赖处理时间（系统时间），不论什么时候进行统计
处理，得到的结果都是正确的。而一般实时流处理的场景中，事件时间可以基本与处理时间保持同
步，只是略微有一点延迟，同时保证了窗口计算的正确性
```

## 水位线

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

## 水位线的传递

在流处理中，上游任务处理完水位线、时钟改变之后，要把当前的水位线广播给所有的下游子任务，以最小的作为当前任务的事件时钟。每个任务以处理之前所有数据为标准来确定自己的时钟。

![[Pasted image 20240114183143.png]]

为了避免上游数据一直没有数据，可以设置最大等待时间

```java
WatermarkStrategy
	.<Integer>forMonotonousTimestamps()
	.withTimestampAssigner((r, ts) -> r * 1000L)
	//空闲等待 5s
	.withIdleness(Duration.ofSeconds(5))
```

# 状态

## 无状态

无状态的操作不会维持内部状态，即处理事件时无需依赖已处理过的事件，也不保存历史数据。事件处理互不影响且与事件到来的时间无关，易并行化。

## 有状态

依赖之前接收的事件信息，它们的状态会根据传入的事件更新，并用于未来事件的处理逻辑。需要保障在出错时进行可靠的故障恢复。

有状态算子的一般处理流程，具体步骤如下。

1. 算子任务接收到上游发来的数据；
2. 获取当前状态；
3. 根据业务逻辑进行计算，更新状态；
4. 得到计算结果，输出发送到下游任务。

## 状态的分类

### 按键分区状态

状态是根据输入流中定义的键（key）来维护和访问的，所以只能定义在按键分区流
（KeyedStream）中，也就keyBy之后才可以使用
![[Pasted image 20240115231333.png]]

也可以通过富函数类（RichFunction）来自定义KeyedState，所以只要提供了富函数类接口的算子，也都可以使用KeyedState

示例：

```java
package io.leaderli.flink.demo;  
  
import org.apache.flink.api.common.state.StateTtlConfig;  
import org.apache.flink.api.common.state.ValueState;  
import org.apache.flink.api.common.state.ValueStateDescriptor;  
import org.apache.flink.api.common.time.Time;  
import org.apache.flink.api.common.typeinfo.Types;  
import org.apache.flink.configuration.Configuration;  
import org.apache.flink.streaming.api.environment.StreamExecutionEnvironment;  
import org.apache.flink.streaming.api.functions.KeyedProcessFunction;  
import org.apache.flink.util.Collector;  
  
public class StateDemo {  
  
    public static void main(String[] args) throws Exception {  
        StreamExecutionEnvironment env = StreamExecutionEnvironment.getExecutionEnvironment();  
  
        env.fromElements(new WaterSensor("1", 1, 1));  
        env.fromElements(  
                        new WaterSensor("s1", 1, 1),  
                        new WaterSensor("s1", 2, 11),  
                        new WaterSensor("s2", 2, 2),  
                        new WaterSensor("s3", 3, 3)  
                )  
                .keyBy(k -> k.id).process(new KeyedProcessFunction<String, WaterSensor, WaterSensor>() {  
  
                    ValueState<Integer> lastValue;  
  
                    @Override  
                    public void open(Configuration parameters) throws Exception {  
                        super.open(parameters);  
                        StateTtlConfig ttlConfig = StateTtlConfig.newBuilder(Time.seconds(5))  
                                // 创建和更新的时候，刷新过期时间  
                                .setUpdateType(StateTtlConfig.UpdateType.OnCreateAndWrite)  
                                // 因为清理的不是实时生效的，可以设定过期后是否可见，默认不可见  
                                .setStateVisibility(StateTtlConfig.StateVisibility.ReturnExpiredIfNotCleanedUp)  
                                .build();  
                        ValueStateDescriptor<Integer> valueStateDescriptor = new ValueStateDescriptor<>("lastValue", Types.INT);  
                        // 定期清理状态  
                        valueStateDescriptor.enableTimeToLive(ttlConfig);  
                        lastValue = getRuntimeContext().getState(valueStateDescriptor);  
  
                    }  
  
                    @Override  
                    public void processElement(WaterSensor value, KeyedProcessFunction<String, WaterSensor, WaterSensor>.Context ctx, Collector<WaterSensor> out) throws Exception {  
//                        lastValue.clear();  
                        System.out.println(value.id + "->" + lastValue.value());  
                        if (lastValue.value() == null) {  
                            lastValue.update(0);  
                        }  
                        if (value.vc > lastValue.value()) {  
                            lastValue.update(value.vc);  
                        }  
                    }  
                });  
        env.execute();  
  
    }  
}
```

还有其他保存值的函数

- ListState
- MapState
- ReducingState
- AggregatingState

### 算子状态

flink，一个算子任务会按照并行度分为多个子任务执行，而不同的子任务会占据不同的任务槽。由于不同的slot在计算资源上是物理隔离的，所以flink能管理的状态在并行任务间是无法共享的，每个状态只能针对当前子任务的实例有效。

很多有状态的操作（聚合、窗口）都是要先做keyBy进行按键分区的。按键分区之后，任务所进行的所有计算都应该值针对key有效，所以状态也应该按照key彼此隔离。每个并行子任务维护着对应的状态，算子的子任务之间状态不共享。

![[Pasted image 20240115225143.png]]

保存值的函数

#### ListState

每一个并行子任务上只会保留一个列表。当算子并行度进行缩放调整时，算子的列表状态中的所有元素项会被统一收集起来，相
当于把多个分区的列表合并成了一个大列表，然后再均匀地分配给所有并行任务。这种均匀分配的具体方法就是轮询

#### UnionListState

UnionListState 与 ListState 区别在并行度调整时，常规列表状态是轮询分配状态项，而联合列表状态的算子则会直接广播状态的完整列表

#### BroadcastState

并行子任务都保持同一份“全局”状态

## 状态后端

状态的存储、访问以及维护，都是由一个可插拔的组件决定的，这个组件就叫作状态后端（state backend）。状态后端主要负责管理本地状态的存储方式和位置

### 保存方式

#### HashMapStateBackend

状态存放在内存里，底层是一个HashMap

#### RocksDB

RocksDB 是一种内嵌的 key-value 存储介质，可以把数据持久化到本地硬盘。异步快照，增量式保存检查点。

### 如何使用

flink-conf.yaml

```yml
# 默认状态后端
# rocksdb
state.backend: hashmap
# 存放检查点的文件路径
state.checkpoints.dir: hdfs://hadoop102:8020/flink/checkpoints
```

```java
StreamExecutionEnvironment env = StreamExecutionEnvironment.getExecutionEnvironment();
env.setStateBackend(new HashMapStateBackend());
env.setStateBackend(new EmbeddedRocksDBStateBackend());
```

# checkpoint

![[Pasted image 20240121010425.png]]

检查点的保存是周期性触发的，间隔时间可以进行设置.在所有任务（算子）都恰好处理完一个相同的输入数据的时候，将它们的状态保存下来。

## Checkpoint Barrier

借鉴水位线的设计，在数据流中插入一个特殊的数据结构，专门用来表示触发检查点保存的时间点。收到保存检查点的指令后，Source 任务可以在当前数据流中插入这个结构；之后的所有任务只要遇到它就开始对状态做持久化快照保存。由于数据流是保持顺序依次处理的，因此遇到这个标识就代表之前的数据都处理完了，可以保存一个检查点；而在它之后的数据，引起的状态改变就不会体现在这个检查点中，而需要保存到下一个检查点

## 检查点配置

```java
StreamExecutionEnvironment env = StreamExecutionEnvironment.getExecutionEnvironment();
// 每隔 1 秒启动一次检查点保存
env.enableCheckpointing(1000);

// 配置存储检查点到 JobManager 堆内存
env.getCheckpointConfig().setCheckpointStorage(new JobManagerCheckpointStorage());
// 配置存储检查点到文件系统
env.getCheckpointConfig().setCheckpointStorage(new FileSystemCheckpointStorage("hdfs://namenode:40010/flink/checkpoints"));
```

### 常用配置

#### CheckpointingMode

设置检查点一致性的保证级别，有“精确一次”（exactly-once）和“至少一次”（at-least-once）两个选项。默认级别为 exactly-once，而对于大多数低延迟的流处理程序，at-least-once就够用了，而且处理效率会更高。不开启的时候，就是最多一次（At-Most-Once）

#### checkpointTimeout

用于指定检查点保存的超时时间，超时没完成就会被丢弃掉。

#### minPauseBetweenCheckpoints

用于指定在上一个检查点完成之后，检查点协调器最快等多久可以出发保存下一个检查点的指令

#### maxConcurrentCheckpoints

用于指定运行中的检查点最多可以有多少个

#### enableExternalizedCheckpoints

用于开启检查点的外部持久化，而且默认在作业失败的时候不会自动清理，如果想释放空间需要自己手工清理。里面传入的参数 ExternalizedCheckpointCleanup 指定了当作业取消的时候外部的检查点该如何清理。DELETE_ON_CANCELLATION：在作业取消的时候会自动删除外部检查点，但是如果是作业失败退出，则会保留检查点。RETAIN_ON_CANCELLATION：作业取消的时候也会保留外部检查点。

#### tolerableCheckpointFailureNumber

用于指定检查点连续失败的次数，当达到这个次数，作业就失败退出。默认为 0，这意味着不能容忍检查点失败，并且作业将在第一次报告检查点失败时失败

#### enableUnalignedCheckpoints

不再执行检查点的分界线对齐操作，启用之后可以大大减少产生背压时的检查点保存时间。这个设置要求检查点模式（CheckpointingMode）必须为 exctly-once，并且最大并发的检查点个数为 1

#### alignedCheckpointTimeout

该参数只有在启用非对齐检查点的时候有效。参数默认是 0，表示一开始就直接用非对齐检查点。如果设置大于 0，一开始会使用对齐的检查点，当对齐时间超过该参数设定的时间，则会自动切换成非对齐检查点。

# savepoint

镜像保存功能,它的原理和算法与检查点完全相同，只是多了一些额外的元数据。不会自动创建，必须由用户明确地手动触发保存操作，所以就是“手动存盘”。

适用于

- 版本管理和归档存储
- 更新 Flink 版本
- 更新应用程序
- 调整并行度
- 暂停应用程序

```shell
# 创建保存点，可以通过配置文件 flink-conf.yaml 设置默认路径
# state.savepoints.dir: hdfs:///flink/savepoints
$ bin/flink savepoint :jobId [:targetDirectory]

# 在stop时创建保存点
$ bin/flink stop --savepointPath [:targetDirectory] :jobId


# 从保存点重启应用
$ bin/flink run -s :savepointPath [:runArgs]
```

# 状态一致性

一致性其实就是结果的正确性，一般从数据丢失、数据重复来评估。

- At-Most-Once
- At-Least-Once
- Exactly-Once

完整的流处理应用，应该包括了数据源、流处理器和外部存储系统三个部分。这个完整应用的一致性，就叫做“端到端（end-to-end）的状态一致性”

![[Pasted image 20240121012518.png]]

## 数据源

数据源可重放数据，或者说可重置读取数据偏移量，加上 Flink 的 Source 算子将偏移量作为状态保存进检查点，就可以保证数据不丢。这是达到 at-least-once 一致性语义的基本要求，当然也是实现端到端 exactly-once 的基本要求

## 流处理器

flink的checkponit可以保证

## 输出端

保证 exactly-once 一致性的写入方式有两种：

### 幂等写入

操作可以重复执行很多次，但只导致一次结果更改。比如 Redis 中键值存储，或者关系型数据库（如 MySQL）中满足查询条件的更新操作。

### 事务写入

构建一个事务，让写入操作可以随着检查点来提交和回滚。

具体实现方式有两种：

#### 预写日志（write-ahead-log，WAL）

1. 先把结果数据作为日志（log）状态保存起来
2. 进行检查点保存时，也会将这些结果数据一并做持久化存储
3. 在收到检查点完成的通知时，将所有结果一次性写入外部系统。
4. 在成功写入所有数据后，在内部再次确认相应的检查点，将确认信息也进行持久化保存。这才代表着检查点的真正完成。

#### 两阶段提交（two-phase-commit，2PC）

先做“预提交”，等检查点完成之后再正式提交。这种提交方式是真正基于事务的，它需要外部系统提供事务支持。

## 应用

kafka属于可重置偏移量的消息队列，且支持两阶段提交（2PC）。

要实现精准一次需要的配置

1. 必须启用检查点
2. 指定 KafkaSink 的发送级别为 DeliveryGuarantee.EXACTLY_ONCE
3. 配置 Kafka 读取数据的消费者的隔离级别
4. 事务超时配置

```java
package io.leaderli.flink.demo;

import org.apache.flink.api.common.eventtime.WatermarkStrategy;
import org.apache.flink.api.common.serialization.SimpleStringSchema;
import org.apache.flink.connector.base.DeliveryGuarantee;
import org.apache.flink.connector.kafka.sink.KafkaRecordSerializationSchema;
import org.apache.flink.connector.kafka.sink.KafkaSink;
import org.apache.flink.connector.kafka.source.KafkaSource;
import org.apache.flink.connector.kafka.source.enumerator.initializer.OffsetsInitializer;
import org.apache.flink.streaming.api.CheckpointingMode;
import org.apache.flink.streaming.api.datastream.DataStreamSource;
import org.apache.flink.streaming.api.environment.CheckpointConfig;
import org.apache.flink.streaming.api.environment.StreamExecutionEnvironment;
import org.apache.kafka.clients.producer.ProducerConfig;

import java.time.Duration;


public class KafkaEOSDemo {
    public static void main(String[] args) throws Exception {
        StreamExecutionEnvironment env = StreamExecutionEnvironment.getExecutionEnvironment();
        // 代码中用到 hdfs，需要导入 hadoop 依赖、指定访问 hdfs 的用户名
        System.setProperty("HADOOP_USER_NAME", "atguigu");
        // 1、启用检查点,设置为精准一次
        env.enableCheckpointing(5000, CheckpointingMode.EXACTLY_ONCE);
        CheckpointConfig checkpointConfig = env.getCheckpointConfig();
        checkpointConfig.setCheckpointStorage("hdfs://hadoop102:8020/chk");
        checkpointConfig.setExternalizedCheckpointCleanup(CheckpointConfig.ExternalizedCheckpointCleanup.RETAIN_ON_CANCELLATION);
        // 2.读取 kafka
        KafkaSource<String> kafkaSource = KafkaSource.<String>builder().setBootstrapServers("hadoop102:9092,hadoop103:9092, hadoop104:9092 ").setGroupId("atguigu").setTopics("topic_1").setValueOnlyDeserializer(new SimpleStringSchema()).setStartingOffsets(OffsetsInitializer.latest()).build();
        DataStreamSource<String> dataStreamSource = env.fromSource(kafkaSource, WatermarkStrategy.forBoundedOutOfOrderness(Duration.ofSeconds(3)), "kafkasource");
        /*
         * 3.写出到 Kafka
         * 精准一次 写入 Kafka，需要满足以下条件，缺一不可
         * 1、开启 checkpoint
         * 2、sink 设置保证级别为 精准一次
         * 3、sink 设置事务前缀
         * 4、sink 设置事务超时时间： checkpoint 间隔 < 事务超时时间 <
         max 的 15 分钟
         */
        KafkaSink<String> kafkaSink = KafkaSink.<String>builder()
                // 指定 kafka 的地址和端口
                .setBootstrapServers("hadoop102:9092,hadoop103:9092, hadoop104:9092 ")
                // 指定序列化器：指定 Topic 名称、具体的序列化
                .setRecordSerializer(KafkaRecordSerializationSchema.<String>builder().setTopic("ws").setValueSerializationSchema(new SimpleStringSchema()).build())
                // 3.1 精准一次,开启 2pc
                .setDeliveryGuarantee(DeliveryGuarantee.EXACTLY_ONCE)
                // 3.2 精准一次，必须设置 事务的前缀
                .setTransactionalIdPrefix("atguigu-")
                // 3.3 精 准 一 次 ， 必 须 设 置 事 务 超 时 时 间 : 大 于checkpoint 间隔，小于 max 15 分钟
                .setProperty(ProducerConfig.TRANSACTION_TIMEOUT_CONFIG, 10 * 60 * 1000 + "").build();
        dataStreamSource.sinkTo(kafkaSink);
        env.execute();
    }
}
```

后续读取“ws”这个 topic 的消费者，要设置事务的隔离级别为“读已提交”，如下：

```java
package io.leaderli.flink.demo;  
  
import org.apache.flink.api.common.eventtime.WatermarkStrategy;  
import org.apache.flink.api.common.serialization.SimpleStringSchema;  
import org.apache.flink.connector.kafka.source.KafkaSource;  
import org.apache.flink.connector.kafka.source.enumerator.initializer.OffsetsInitializer;  
import org.apache.flink.streaming.api.environment.StreamExecutionEnvironment;  
import org.apache.kafka.clients.consumer.ConsumerConfig;  
  
import java.time.Duration;  
  
  
public class KafkaEOSDemo {  
    public static void main(String[] args) throws Exception {  
        StreamExecutionEnvironment env = StreamExecutionEnvironment.getExecutionEnvironment();  
// 消费 在前面使用两阶段提交写入的 Topic        KafkaSource<String> kafkaSource =  
                KafkaSource.<String>builder()  
                        .setBootstrapServers("hadoop102:9092,hadoop103:9092,hadoop104:9092")  
                        .setGroupId("atguigu")  
                        .setTopics("ws")  
                        .setValueOnlyDeserializer(new SimpleStringSchema())  
                        .setStartingOffsets(OffsetsInitializer.latest())  
                        // 作为 下游的消费者，要设置 事务的隔离级别 = 读已提交  
                        .setProperty(ConsumerConfig.ISOLATION_LEVEL_CONFIG, "read_committed")  
                        .build();  
        env.fromSource(kafkaSource, WatermarkStrategy.forBoundedOutOfOrderness(Duration.ofSeconds(3)), "kafkasource")  
                .print();  
        env.execute();  
    }  
}
```

# flink-sql

## sql-client

```shell
$ bin/sql-client

$ vim conf/sql-client-init.sql
SET sql-client.execution.result-mode=tableau;
CREATE DATABASE mydatabase

# 通过sql文件初始化
$ bin/sql-client -i conf/sql-client-init.sql
```

```shell
#默认 table，还可以设置为 tableau、changelog
SET sql-client.execution.result-mode=tableau;

#默认 streaming，也可以设置 batch
SET execution.runtime-mode=streaming; 

# 默认并行度 
SET parallelism.default=1

# 设置状态 TTL
SET table.exec.state.ttl=1000;
```

## 动态表和持续查询

流的数据持续不断到来，基于这个表的SQL查询，就并不会停止，持续查询的结果也会是一个动态表。每次数据到来都会触发查询操作，一次查询面对的数据集，就是当前输入动态表中收到的所有数据，相当于对输入动态表做了一个快照。

![[Pasted image 20240122201436.png]]

持续查询的步骤如下：

1. 流（stream）被转换为动态表（dynamic table）；
2. 对动态表进行持续查询（continuous query），生成新的动态表；
3. 生成的动态表被转换成流

## 将流转换为动态表

把流看作一张表，那么流中每个数据的到来，都应该看作是对表的一次 insert 操作。

![[Pasted image 20240122202649.png]]

## 用SQL持续查询

当我们使用sql去查询时，随着原始动态表不停插入新的数据，查询的结果也不断更改。这里的更改可以是 insert ，也可能是对之前的数据的更新 update，这种查询被称为 update query

![[Pasted image 20240122202952.png]]

如果使用了窗口，因为窗口的结果是一次性写入结果表，因此结果表的更新日志流只包含 insert，而没有 update ，这里的持续查询是一个追加查询。
![[Pasted image 20240122203004.png]]

## 将动态表转换为流

与关系型数据库中的表一样，动态表也可以通过插入（Insert）、更新（Update）和删除（Delete）操作，进行持续的更改。将动态表转换为流或将其写入外部系统时，就需要对这些更改操作进行编码，通过发送编码消息的方式告诉外部系统要执行的操作。在 FLink 中，支持三种编码方式：

### Append-only

仅通过 insert 更改来修改的动态表，可以直接转换为 "append-only" 流。这个流中发出的数据，其实就是动态表中新增的每一行

### Retract

撤回流中包含两类消息的流程， add 和 retract 消息。insert 就是 add，deltete 就是 retract ，update 就是 先 retract 后 add

![[Pasted image 20240122203711.png]]

### upsert

类似retract，将 insert 和 update 合并了

![[Pasted image 20240122203812.png]]

## 时间属性

时间属性的数据类型必须为 TIMESTAMPj， 时间属性的定义分成事件时间（event time）和处理时间（processing time）

通过 `WATERMARK FOR` 定义事件时间属性

```sql
// 这里我们把 ts 字段定义为事件时间属性，而且基于 ts 设置了 5 秒的水位线延迟。
CREATE TABLE EventTable(
	user STRING,
	url STRING,
	ts TIMESTAMP(3),
	WATERMARK FOR ts AS ts - INTERVAL '5' SECOND
) WITH (
	...
);
```

定义处理时间属性

```sql
CREATE TABLE EventTable(
 user STRING,
 url STRING,
 ts as PROCTIME()
) WITH(
 ...	
);
```

## 数据库

```sql
CREATE DATABASE [IF NOT EXISTS] [catalog_name.]db_name
	[COMMENT database_comment]
	WITH (key1=val1, key2=val2, ...);

CREATE DATABASE db_flink;


SHOW DATABASES;

SHOW CURRENT DATABASE;

// RESTRICT：删除非空数据库会触发异常。默认启用
// CASCADE：删除非空数据库也会删除所有相关的表和函数
DROP DATABASE [IF EXISTS] [catalog_name.]db_name [ (RESTRICT |
CASCADE) 
```

## 表

```sql
CREATE TABLE [IF NOT EXISTS] [catalog_name.][db_name.]table_name
(
{ <physical_column_definition> | <metadata_column_definition> |
<computed_column_definition> }[ , ...n]
[ <watermark_definition> ]
[ <table_constraint> ][ , ...n]
)
[COMMENT table_comment]
[PARTITIONED
BY
(partition_column_name1,
partition_column_name2, ...)]
WITH (key1=val1, key2=val2, ...)
[ LIKE source_table [( <like_options> )] | AS select_query ]
```

1. physical_column_definition
   物理列是数据库中所说的常规列。其定义了物理介质中存储的数据中字段的名称、类型和顺序。其他类型的列可以在物理列之间声明，但不会影响最终的物理列的读取。
2. metadata_column_definition
   元数据列是 SQL 标准的扩展，允许访问数据源本身具有的一些元数据。元数据列由METADATA 关键字标识。例如，我们可以使用元数据列从 Kafka 记录中读取和写入时间戳

```sql
CREATE TABLE MyTable (
	`user_id` BIGINT,
	`name` STRING,
	// 如果自定义的列名称和 Connector 中定义 metadata 字段的名称一样， FROM xxx 子句可省略
	`record_time` TIMESTAMP_LTZ(3) METADATA FROM 'timestamp'
) WITH (
	'connector' = 'kafka'
);
```

如果自定义列的数据类型和 Connector 中定义的 metadata 字段的数据类型不一致，程序运行时会自动 cast 强转

```sql
CREATE TABLE MyTable (
`user_id` BIGINT,
`name` STRING,
-- 将时间戳强转为 BIGINT
`timestamp` BIGINT METADATA
) WITH (
'connector' = 'kafka'
...
);
```

默认情况下，Flink SQL planner 认为 metadata 列可以读取和写入。然而，在许多情况下，外部系统提供的只读元数据字段比可写字段多。因此，可以使用 VIRTUAL 关键字排除元数据列的持久化(表示只读)。

```sql
CREATE TABLE MyTable (
`timestamp` BIGINT METADATA,
`offset` BIGINT METADATA VIRTUAL,
`user_id` BIGINT,
`name` STRING,
) WITH (
'connector' = 'kafka'
...
);
```

支持自定义运算生成的列

```sql
CREATE TABLE MyTable (
`user_id` BIGINT,
`price` DOUBLE,
`quantity` DOUBLE,
`cost` AS price * quanitity
) WITH (
'connector' = 'kafka'
...
);
```

定义watermark

1. 严格升序：`WATERMARK FOR rowtime_column AS rowtime_column`。Flink 任务认为时间戳只会越来越大，也不存在相等的情况，只要相等或者小于之前的，就认为是迟到的数据

2. 递增：`WATERMARK FOR rowtime_column AS rowtime_column - INTERVAL '0.001' SECOND` 。一般基本不用这种方式。如果设置此类，则允许有相同的时间戳出现

3. 有界无序： `WATERMARK FOR rowtime_column AS rowtime_column – INTERVAL 'string' timeUnit` 。此 类 策 略 就 可 以 用 于 设 置 最 大 乱 序 时 间 ， 假 如 设 置 为 `WATERMARK FOR rowtime_column AS rowtime_column - INTERVAL '5' SECOND` ，则生成的是运行 5s 延迟的 Watermark。一般都用这种 Watermark 生成策略，此类 Watermark 生成策略通常用于有数据乱序的场景中，而对应到实际的场景中，数据都是会存在乱序的，所以基本都使用此类策略。

主键

主键约束表明表中的一列或一组列是唯一的，并且它们不包含 NULL 值。主键唯一地标识表中的一行，只支持 not enforced。

```sql
CREATE TABLE MyTable (
`user_id` BIGINT,
`name` STRING,
PARYMARY KEY(user_id) not enforced
) WITH (
'connector' = 'kafka'
...
);
```

with 语句，用于创建表的属性，用于指定外部存储系统的元数据信息配置属性时，表达式key1=val1 的键和值都应该是字符串字面值。如下是 Kafka 的映射表：

```sql
CREATE TABLE KafkaTable (
`user_id` BIGINT,
`name` STRING,
`ts` TIMESTAMP(3) METADATA FROM 'timestamp'
) WITH (
'connector' = 'kafka',
'topic' = 'user_behavior',
'properties.bootstrap.servers' = 'localhost:9092',
'properties.group.id' = 'testGroup',
'scan.startup.mode' = 'earliest-offset',
'format' = 'csv'
)
```

使用 like 基于现有表创建新表

```sql
CREATE TABLE Orders (
`user` BIGINT,
product STRING,
order_time TIMESTAMP(3)
) WITH (
'connector' = 'kafka',
'scan.startup.mode' = 'earliest-offset'
);
CREATE TABLE Orders_with_watermark (
-- Add watermark definition
WATERMARK FOR order_time AS order_time - INTERVAL '5' SECOND
) WITH (
-- Overwrite the startup-mode
'scan.startup.mode' = 'latest-offset'
)
LIKE Orders;
```

as select 通过查询的结果创建和填充表

```sql
CREATE TABLE my_ctas_table
WITH (
'connector' = 'kafka',
...
)
AS SELECT id, name, age FROM source_table WHERE mod(id, 10) = 0;
```


查看表
```sql
show tables

describe table
```
# 流处理基础

Dataflow图

DataFlow描述了数据如何在不同操作之间流动。Dataflow通常表示为有向图。

图中顶点称为算子，表示计算；而边表示数据依赖关系。算子是Dataflow的基本功能单元，他们从输入获取数据，对其精选计算，然后阐述数据并发往输出供后续处理。没有输入端的算子称为数据源，没有输出端的算子称为数据汇。

![[Pasted image 20231122215103.png]]

上图被称为逻辑图，为了执行，需要将逻辑图转化为物理图。在分布式处理引擎时，每个算子可能在不同物理机上运行多个并行任务。

![[Pasted image 20231122223703.png]]

## 数据交换策略

- 转发策略
- 广播策略
- 基于键值的策略
- 随机策略

## 延迟和吞吐

延迟表示处理一个事件所需要的时间。流式应用关心从接受事件到输出观察到事件处理效果的时间间隔。延迟以时间片（例如毫秒）为单位测量的。

吞吐是用来衡量系统处理能力（处理速率)的指标，它告诉我们系统每单位时间可以处理多少事件。

## 数据流操作

## 输入输出

数据接入和数据输出操作允许流处理引擎和外部系统进行通信。

数据接入操作时从外部数据源获取原始数据并将其转换成适合后续处理的格式。实现数据接入操作逻辑的算子称为数据源。数据源可以从TCP套接字、文件、kafka中获取数据。

数据输出操作是将数据以适合外部系统使用的格式输出。负责数据输出的算子称为数据汇，其写入的目标可以是文件、数据库、消息队列或监控接口等。
