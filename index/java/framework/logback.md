---
tags:
- java/框架/logback
---

## 安装

[maven Setup](https://logback.qos.ch/setup.html)

```xml
<dependency>
  <groupId>ch.qos.logback</groupId>
  <artifactId>logback-classic</artifactId>
  <version>1.3.0-alpha13</version>
</dependency>
```

## 配置

[Chapter 3: Configuration](https://logback.qos.ch/manual/configuration.html)



### statusListener

logback 日志在开始阶段会输出一些自身的日志，通过配置`NopStatusListener`即可以清除

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>

    <!-- Stop output INFO at start -->
    <statusListener class="ch.qos.logback.core.status.NopStatusListener" />

    <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
        <layout class="ch.qos.logback.classic.PatternLayout">
            <Pattern>
                %d{yyyy-MM-dd HH:mm:ss} %-5level %logger{36} - %msg%n
            </Pattern>
        </layout>
    </appender>

    <root level="error">
        <appender-ref ref="STDOUT"/>
    </root>

</configuration>
```

### define

logback的配置可以使用变量，而变量的值可以通过实现一个java接口来动态返回


```java
public class LiPropertyDefiner extends PropertyDefinerBase {

    private String level;
    
    public void setLevel(String level) {
        this.level = level;
    }
    
    @Override
    public String getPropertyValue() {
        return level;
    }
}
```

```xml
<configuration debug="false">

  <define name="level" class="com.leaderli.demo.LiPropertyDefiner">
	  <level>info</level>
  </define>
  <root level="${level}">
    <appender-ref ref="STDOUT"/>
  </root>
</configuration>
```

当 PropertyDefiner 的实现类中包含define内定义的变量的set方法时，会自动填充  PropertyDefiner 的属性值
