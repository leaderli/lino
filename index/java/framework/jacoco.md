---
tags:
  - java/框架/jacoco
date updated: 2024-03-03 18:04
---

## maven插件

```xml
<?xml version="1.0" encoding="UTF-8"?>  
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"  
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">  
    <modelVersion>4.0.0</modelVersion>  
  
    <groupId>com.howtoprogram</groupId>  
    <artifactId>test_jacoco</artifactId>  
    <version>1.0-SNAPSHOT</version>  
    <packaging>jar</packaging>  
    <name>junit-maven-jacoco-example</name>  
  
    <properties>  
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>  
        <java.version>1.8</java.version>  
        <junit.jupiter.version>5.0.0</junit.jupiter.version>  
        <junit.platform.version>1.0.0</junit.platform.version>  
        <jacoco.version>0.8.8</jacoco.version>  
    </properties>  
  
  
    <build>  
        <plugins>  
  
            <plugin>  
                <groupId>org.apache.maven.plugins</groupId>  
                <artifactId>maven-surefire-plugin</artifactId>  
                <version>2.22.2</version>  
                <configuration>  
                    <argLine> </argLine>  
                    <testFailureIgnore>true</testFailureIgnore>  
                    <forkCount>2</forkCount>  
                    <reuseForks>true</reuseForks>  
                    <argLine>${surefireArgLine}</argLine>  
                </configuration>  
            </plugin>  
  
            <plugin>  
                <groupId>org.jacoco</groupId>  
                <artifactId>jacoco-maven-plugin</artifactId>  
                <version>0.8.8</version>  
                <executions>  
                    <execution>  
                        <id>default-prepare-agent</id>  
                        <goals>  
                            <goal>prepare-agent</goal>  
                        </goals>  
                        <configuration>  
                            <destFile>${project.build.directory}/coverage-reports/jacoco.exec</destFile>  
                            <propertyName>surefireArgLine</propertyName>  
                        </configuration>  
                    </execution>  
                    <execution>  
                        <id>default-report</id>  
                        <phase>test</phase>  
                        <goals>  
                            <goal>report</goal>  
                        </goals>  
                        <configuration>  
                            <dataFile>${project.build.directory}/coverage-reports/jacoco.exec</dataFile>  
                            <outputDirectory>${project.reporting.outputDirectory}/jacoco</outputDirectory>  
                        </configuration>  
                    </execution>  
                    <execution>  
                        <id>default-check</id>  
                        <goals>  
                            <goal>check</goal>  
                        </goals>  
                        <configuration>  
                            <rules>  
                                <rule>  
                                    <element>BUNDLE</element>  
                                    <limits>  
                                        <limit>  
                                            <counter>COMPLEXITY</counter>  
                                            <value>COVEREDRATIO</value>  
                                            <minimum>0.70</minimum>  
                                        </limit>  
                                    </limits>  
                                </rule>  
                            </rules>  
                        </configuration>  
                    </execution>  
                </executions>  
            </plugin>  
            <plugin>  
                <groupId>org.apache.maven.plugins</groupId>  
                <artifactId>maven-compiler-plugin</artifactId>  
                <configuration>  
                    <source>8</source>  
                    <target>8</target>  
                </configuration>  
            </plugin>  
  
        </plugins>  
    </build>  
  
    <dependencies>  
  
        <dependency>  
            <groupId>io.leaderli.litool</groupId>  
            <artifactId>litool-test</artifactId>  
            <version>1.2.4</version>  
        </dependency>  
    </dependencies>  
  
</project>
```

## jacoco-agent

下载安装

[EclEmma - JaCoCo Java Code Coverage Library](https://www.eclemma.org/jacoco/)

```ad-tip

tomcat9需要jacoco的版本为0.8以上

```

将下载的jacoco解压

```shell
$ cd ~/app
$ wget https://search.maven.org/remotecontent?filepath=org/jacoco/jacoco/0.8.11/jacoco-0.8.11.zip -O jacoco.zip
$ unzip jacoco.zip -d jacoco
```

在tomcat的catalina.sh中添加

```shell
CATALINA_OPTS=-javaagent:/home/li/app/jacoco/lib/jacocoagent.jar=includes=com.leaderli.*,output=file,destfile=/home/li/app/jacoco/jacoco.exec,append=true
```

启动tomcat，并访问一些接口后

通过 `jacococli report` 生成报告，可以将源码放到目录下，多个报告可以合并 `jacococli merge`

```shell
$ java -jar /home/li/app/jacoco/lib/jacococli.jar report jacoco.exec 
--sourcefiles src
--classfiles /home/li/app/apache-tomcat-9.0.84/webapps/demo/WEB-INF/classes/ --html /home/li/jacoco/demo
```

打开目录中的index.html即可看到测试报告

![[Pasted image 20240109114831.png]]

### javacoco-agent

output 指定测试范围的输出方式

1. file 生成文件
2. tcpserver 作为服务端，监听tcp请求,回送测试报告
3. tcpclient 作为客户端，发送测试报告到指定服务器

catalina.sh 中配置为tcpserver。默认情况下 address为localhost，port为6300

```shell
CATALINA_OPTS=-javaagent:/home/li/app/jacoco/lib/jacocoagent.jar=includes=com.leaderli.*,output=tcpserver,append=true
```

可以用 `javacococli dump` 拉取报告

```shell
$ java -jar lib/jacococli.jar  dump --destfile jacoco.exec
[INFO] Connecting to localhost/127.0.0.1:6300.
[INFO] Writing execution data to /home/li/app/jacoco/jacoco.exec.

$ java -jar lib/jacococli.jar  report jacoco.exec --sourcefiles src --classfiles ~/app/apache-tomcat-9.0.84/webapps/demo/WEB-INF/classes/ --html  demo
[INFO] Loading execution data file /home/li/app/jacoco/jacoco.exec.
[INFO] Analyzing 4 classes.
```

## junit使用

// 添加java启动参数

```java
-javaagent:D:/resource/java/maven/repository/org/jacoco/org.jacoco.agent/0.8.8/org.jacoco.agent-0.8.8-runtime.jar=destfile=D:/work/workspace/idea/litool/litool-test/target/coverage-reports/jacoco.exec 
```

### 参考文档

[jacoco-agent的参数](https://www.eclemma.org/jacoco/trunk/doc/prepare-agent-mojo.html)

[jacoco-cli参数](https://www.eclemma.org/jacoco/trunk/doc/cli.html)
