
可以通过自定义layout来实现对日志的脱敏处理
```xml
  <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
    <!-- encoders are  by default assigned the type
         ch.qos.logback.classic.encoder.PatternLayoutEncoder -->
    <layout class="ch.qos.logback.classic.PatternLayout">
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