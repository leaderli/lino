---
tags:
  - java/spring/tips
date updated: 2024-09-28 08:44
---

### 反射工具类

```java
import org.springframework.util.ReflectionUtils;

Method log = ReflectionUtils.findMethod(SpringTest.class, "log");
Field name = ReflectionUtils.findField(SpringTest.class, "name");
```

### spring bean 多个 id

```java
@Service("Service-A")
public class SampleService {
    public String doSomething() { return "Foo"; }
}

@Configuration
public class SampleConfig {

    @Bean(name = {"Service-B", "Service-C"})
    public SampleService createMirroredService(@Autowired SampleService service) {
        return service;
    }
}
```

### 作用域代理——proxyMode 属性

将一个短生命周期作用域 bean 注入给长生命周期作用域 bean，我们期望长生命周期 bean 的属性保持与短生命周期 bean 同样。例如

```java
@Component
@Scope(value = BeanDefinition.SCOPE_PROTOTYPE,proxyMode = ScopedProxyMode.TARGET_CLASS)
public class Prototype {
}

@Component
@Scope(BeanDefinition.SCOPE_SINGLETON)
public class Singleton {
  @Autowired
  private Prototype prototype;
}
```

保证每次`prototype`都是最新的，需要在`Prototype`类上定义`proxyMode`

### 延迟加载 bean

```java
//...
import javax.inject.Inject;
import javax.inject.Provider;

public class InjectTest{

    @Inject
    Provider<InjectBean> provider;

    public void test() {
      InjectBean bean =  provider.get();
    }

}
```

使用`@Autowire`也是可以的，重要是使用了`Provider`

### 基于注解的切面

```java
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class AnnotationAspect {

  @Around("@annotation(Log)")
  public void log1(ProceedingJoinPoint point){
    MethodSignature  s = (MethodSignature) point.getSignature();
    Log annotation = s.getMethod().getAnnotation(Log.class);
  }
}
```

所有注解了`@Log`的方法都会被切

### Spring注入文件

```java
 import org.springframework.core.io.Resource;

 @Value("classpath:rootxml.js")
 private Resource cert;

 @Test
 public void test() throws ScriptException, IOException {
    System.out.println(StreamUtils.copyToString(cert.getInputStream(), StandardCharsets.UTF_8));
 }
```

### @Autowired

`@Autowired(required = false)`若`Spring`容器中没有对应的`BeanDefinition`时不会注入值，可赋值一个默认值避免空指针的情况。

### @Value

注入数组类型配置

```properties
list.node=123,456
```

```java
@Value("${list.node}")
private String[] nodes
```

### 定时任务

`Spring`的`@Scheduled`  可使用`crontab`语法，但是不同于`unix`的标准语法，它第一位是秒

```java
@Scheduled(cron = "1 22 22 * * *")
public void log() {
    logger.info("--------------------" + index++);
}
```

`cron`规则一定是 6 位以空白字符间隔的字符串，其中每位代表的含义如下

```shell
秒     分   小时    日    月    星期
0-59 0-59  0-23  1-31  1-12  0-6

记住几个特殊符号的含义:
*  代表取值范围内的数字
*/x  代表每x
x-y  代表从x到y
,  分开几个离散的数字
```

### @Primary

`@Primary`：自动装配时当出现多个 Bean 候选者时，被注解为@Primary 的 Bean 将作为首选者，否则将抛出异常

### event

定义一个事件

```java
public class CustomSpringEvent extends ApplicationEvent {
    private String message;

    public CustomSpringEvent(Object source, String message) {
        super(source);
        this.message = message;
    }
    public String getMessage() {
        return message;
    }
}
```

定义一个发布事件的类

```java
@Component
public class CustomSpringEventPublisher {
    @Autowired
    private ApplicationEventPublisher applicationEventPublisher;

    public void publishCustomEvent(final String message) {
        System.out.println("Publishing custom event. ");
        CustomSpringEvent customSpringEvent = new CustomSpringEvent(this, message);
        applicationEventPublisher.publishEvent(customSpringEvent);
    }
}
```

当发布事件后，所有注册相关事件的listener都会被执行

```java
@Component
public class CustomSpringEventListener implements ApplicationListener<CustomSpringEvent> {
    @Override
    public void onApplicationEvent(CustomSpringEvent event) {
        System.out.println("Received spring custom event - " + event.getMessage());
    }
}
```

spring中一些内置的事件

```java
//spring启动过程调用refresh方法后会发布一个ContextRefreshedEvent事件
public class ContextRefreshedListener 
  implements ApplicationListener<ContextRefreshedEvent> {
    @Override
    public void onApplicationEvent(ContextRefreshedEvent cse) {
        System.out.println("Handling context re-freshed event. ");
    }
}
```

### 在ServletContextListener中注入Spring对象

```java
@WebListener
public class ContextWebListener implements ServletContextListener {
 
    @Override
    public void contextDestroyed(ServletContextEvent arg0) {

        LogHelper.info("web stop!");
        System.out.println("dao++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
    }
 
    @Override
    public void contextInitialized(ServletContextEvent sce) {

        // SpringBeanAutowiringSupport.processInjectionBasedOnCurrentContext(this);
        WebApplicationContextUtils.getRequiredWebApplicationContext(sce.getServletContext())
                .getAutowireCapableBeanFactory().autowireBean(this);//加上这一句
        LogHelper.info("web start!");
        System.out.println("dao++++"+dao.count());
        LogHelper.info("web start! finish");
    }
 
 
    @Autowired
    private ApplicationMetricsDao dao;
}
```

### profiles

[Profiles](https://docs.spring.io/spring-boot/docs/1.2.0.M1/reference/html/boot-features-profiles.html)

配置环境变量

```shell
spring.profiles.active=dev,hsqldb
```

### ImportBeanDefinitionRegistrar

可以获取到所有被Spring加载的注解，可以取到类似`@Enable`系列的注解值， 该接口实现类可以通过`@import`引入，但是该类不会被加载到 Spring 容器中

```java
class AspectJAutoProxyRegistrar implements ImportBeanDefinitionRegistrar {  
  
    /**  
     * Register, escalate, and configure the AspectJ auto proxy creator based on the value     * of the @{@link EnableAspectJAutoProxy#proxyTargetClass()} attribute on the importing  
     * {@code @Configuration} class.     */    @Override  
    public void registerBeanDefinitions(  
            AnnotationMetadata importingClassMetadata, BeanDefinitionRegistry registry) {  
  
        AopConfigUtils.registerAspectJAnnotationAutoProxyCreatorIfNecessary(registry);  
  
        AnnotationAttributes enableAspectJAutoProxy =  
                AnnotationConfigUtils.attributesFor(importingClassMetadata, EnableAspectJAutoProxy.class);  
        if (enableAspectJAutoProxy != null) {  
            if (enableAspectJAutoProxy.getBoolean("proxyTargetClass")) {  
                AopConfigUtils.forceAutoProxyCreatorToUseClassProxying(registry);  
            }  
            if (enableAspectJAutoProxy.getBoolean("exposeProxy")) {  
                AopConfigUtils.forceAutoProxyCreatorToExposeProxy(registry);  
            }  
        }  
    }  
  
}
```

### 给bean添加默认属性

当spring注入person时，会给hello赋值123

```java
RootBeanDefinition rootBeanDefinition = new RootBeanDefinition(Person.class);
rootBeanDefinition.getPropertyValues().add("hello","123");
//BeanDefinitionRegistry
beanDefinitionRegistry.registerBeanDefinition("person",rootBeanDefinition);

```

```java
 class Person{
        private String hello;

        public String getHello() {
            return hello;
        }

        public void setHello(String hello) {
            this.hello = hello;
        }
    }
```

## 指定类加载器

```java
AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext();  
context.setClassLoader(classLoader);  
context.refresh();
```

## EnableAspectJAutoProxy

默认情况下，Spring会尝试使用DJK接口代理来实现切面，可强制使用cglib代理

```java
@EnableAspectJAutoProxy(proxyTargetClass=true)
@Configuration
public class SpringConfig{

}
```


## @WebAppConfiguration


构建spring的web测试环境，实际是通过创建一个MockServletContext来实现的
[@WebAppConfiguration :: Spring Framework](https://docs.spring.io/spring-framework/reference/testing/annotations/integration-spring/annotation-webappconfiguration.html)


```java
AnnotationConfigWebApplicationContext context = new AnnotationConfigWebApplicationContext();  
context.setServletContext(new MockServletContext("/src/main/webapp"))
context.refresh
```


