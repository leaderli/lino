---
tags:
  - java/框架/EventBus
date updated: 2022-04-15 14:47
---

```xml
<dependency>
    <groupId>com.google.guava</groupId>
    <artifactId>guava</artifactId>
    <version>18.0</version>
</dependency>
```

`post`事件，注册的 listener 中注解了`@Subscribe`的方法会被执行，该方法的参数的类型需要与`event`类型一致，若没有类型一致的`@Subscribe`，则由参数类型`DeadEvent`的`listener`统一处理

```java
public class EventBusTest {
    @Test
    public void test() {
        EventBus eventBus = new EventBus();
        EventListener eventListener = new EventListener();
        eventBus.register(eventListener);
        eventBus.post("hello");
        eventBus.post(123);
    }
    public static class EventListener {
        @Subscribe
        public void stringEvent(String event) {
            System.out.println("event = " + event);
        }
        @Subscribe
        public void handleDeadEvent(DeadEvent deadEvent) {
            System.out.println("deadEvent = " + deadEvent);
        }
    }
}

```
