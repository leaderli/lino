---
tags:
  - java/框架/logback
date updated: 2022-04-21 19:35
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

### conversionRule

注册对layout在各个占位符的转换的处理器

```xml
<conversionRule conversionWord="msg" converterClass="com.leaderli.demo.log.LiMessageConvert" />
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
```

### appender

略

## 自定义实现类

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

配置文件的加载

JoranConfiguratorBase

```java
@Override  
protected void addInstanceRules(RuleStore rs) {  
  
    // is "configuration/variable" referenced in the docs?  
    rs.addRule(new ElementSelector("configuration/variable"), new PropertyAction());  
    rs.addRule(new ElementSelector("configuration/property"), new PropertyAction());  
  
    rs.addRule(new ElementSelector("configuration/substitutionProperty"), new PropertyAction());  
  
    rs.addRule(new ElementSelector("configuration/timestamp"), new TimestampAction());  
    rs.addRule(new ElementSelector("configuration/shutdownHook"), new ShutdownHookAction());  
    rs.addRule(new ElementSelector("configuration/define"), new DefinePropertyAction());  
  
    // the contextProperty pattern is deprecated. It is undocumented  
    // and will be dropped in future versions of logback    rs.addRule(new ElementSelector("configuration/contextProperty"), new ContextPropertyAction());  
  
    rs.addRule(new ElementSelector("configuration/conversionRule"), new ConversionRuleAction());  
  
    rs.addRule(new ElementSelector("configuration/statusListener"), new StatusListenerAction());  
  
    rs.addRule(new ElementSelector("configuration/appender"), new AppenderAction());  
    rs.addRule(new ElementSelector("configuration/appender/appender-ref"), new AppenderRefAction());  
    rs.addRule(new ElementSelector("configuration/newRule"), new NewRuleAction());  
    rs.addRule(new ElementSelector("*/param"), new ParamAction(getBeanDescriptionCache()));  
}
```

JoranConfigurator

```java
@Override  
public void addInstanceRules(RuleStore rs) {  
    // parent rules already added  
    super.addInstanceRules(rs);  
  
    rs.addRule(new ElementSelector("configuration"), new ConfigurationAction());  
  
    rs.addRule(new ElementSelector("configuration/contextName"), new ContextNameAction());  
    rs.addRule(new ElementSelector("configuration/contextListener"), new LoggerContextListenerAction());  
    rs.addRule(new ElementSelector("configuration/insertFromJNDI"), new InsertFromJNDIAction());  
    rs.addRule(new ElementSelector("configuration/evaluator"), new EvaluatorAction());  
  
    rs.addRule(new ElementSelector("configuration/appender/sift"), new SiftAction());  
    rs.addRule(new ElementSelector("configuration/appender/sift/*"), new NOPAction());  
  
    rs.addRule(new ElementSelector("configuration/logger"), new LoggerAction());  
    rs.addRule(new ElementSelector("configuration/logger/level"), new LevelAction());  
  
    rs.addRule(new ElementSelector("configuration/root"), new RootLoggerAction());  
    rs.addRule(new ElementSelector("configuration/root/level"), new LevelAction());  
    rs.addRule(new ElementSelector("configuration/logger/appender-ref"), new AppenderRefAction<ILoggingEvent>());  
    rs.addRule(new ElementSelector("configuration/root/appender-ref"), new AppenderRefAction<ILoggingEvent>());  
  
    // add if-then-else support  
    rs.addRule(new ElementSelector("*/if"), new IfAction());  
    rs.addRule(new ElementSelector("*/if/then"), new ThenAction());  
    rs.addRule(new ElementSelector("*/if/then/*"), new NOPAction());  
    rs.addRule(new ElementSelector("*/if/else"), new ElseAction());  
    rs.addRule(new ElementSelector("*/if/else/*"), new NOPAction());  
  
    // add jmxConfigurator only if we have JMX available.  
    // If running under JDK 1.4 (retrotranslateed logback) then we    // might not have JMX.    if (PlatformInfo.hasJMXObjectName()) {  
        rs.addRule(new ElementSelector("configuration/jmxConfigurator"), new JMXConfiguratorAction());  
    }  
    rs.addRule(new ElementSelector("configuration/include"), new IncludeAction());  
  
    rs.addRule(new ElementSelector("configuration/consolePlugin"), new ConsolePluginAction());  
  
    rs.addRule(new ElementSelector("configuration/receiver"), new ReceiverAction());  
  
}
```
