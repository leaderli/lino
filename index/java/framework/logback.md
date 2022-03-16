---
tags:
- java/框架/logback
---

## 安装

[maven Setup](https://logback.qos.ch/setup.html)

```xml
<dependency>  
 <groupId>org.slf4j</groupId>  
 <artifactId>slf4j-api</artifactId>  
</dependency>  
  
  
<!-- logback -->  
<dependency>  
 <groupId>ch.qos.logback</groupId>  
 <artifactId>logback-classic</artifactId>  
 <version>1.1.7</version>  
</dependency>  
<dependency>  
 <groupId>ch.qos.logback</groupId>  
 <artifactId>logback-core</artifactId>  
 <version>1.1.7</version>  
</dependency>  
<dependency>  
 <groupId>ch.qos.logback</groupId>  
 <artifactId>logback-access</artifactId>  
 <version>1.1.7</version>  
</dependency>
```

```java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class HelloWorld {

  public static void main(String[] args) {

    Logger logger = LoggerFactory.getLogger("HelloWorld");
    logger.debug("Hello world.");

  }
}
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

### appender

可以通过自定义layout来实现对日志的脱敏处理
```xml
  <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
    <!-- encoders are  by default assigned the type
         ch.qos.logback.classic.encoder.PatternLayoutEncoder -->
    <layout class="io.leaderli.log.LiPatternLayout">
      <pattern>%d{HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n</pattern>
    </layout>
  </appender>
```

```java
public class LiMesseageConvert extends MessageConverter{
	@Override
	public String convert(ILoggingEvent event){
		String msg = event.getFormattedMesseage();
		// 脱敏
		return  msg;
	}
}

public class LiPatternLayout extends PatternLayout{
	static {
		defaultConvertMap.put("m",LiMesseageConvert.class.getName());
		defaultConvertMap.put("msg",LiMesseageConvert.class.getName());
		defaultConvertMap.put("message",LiMesseageConvert.class.getName());
	}
}
```


##  自定义实现类

配置文件中涉及到的class，可以自定义实现，可通过配置对自定义的类的属性进行赋值

```xml
<appender name="file" class="com.leaderli.demo.log.LiFileAppender">  
 <file>/app/demo.log</file>  
 <sex>123123</sex>  
 <layout class="ch.qos.logback.classic.PatternLayout">  
	 <Pattern>  %d{yyyy-MM-dd HH:mm:ss} %-5level %logger{36} - %msg%n  </Pattern>  
 </layout>  
</appender>
```


```java
public class LiFileAppender<E> extends FileAppender<E> {

    private String sex;

    public void setSex(String sex) {
        this.sex = sex;
        System.out.println("set " + sex);
    }

    public void addSex(String name) {
        System.out.println("add " + name);
    }
}

```

通过查看源码，每个class的属性注入是根据其内部标签名来决定的，
- 如果该标签指向一个字符串类型的class成员变量，则查找其set或者add方法。对于简单的变量，可以直接定义set方法，对于集合变量可以使用add方法，add方法的优先级要高于set方法。
- 如果该标签指向的是一个类，则递归生成该类。

#todo 源码解析 