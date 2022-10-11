---
tags:
  - java/spring/beanPostProcessor
---

通过自定义注解来设置成员变量的值

```java
import io.leaderli.litool.core.type.ReflectUtil;  
import org.springframework.beans.BeansException;  
import org.springframework.beans.factory.config.BeanPostProcessor;  
import org.springframework.context.annotation.AnnotationConfigApplicationContext;  
import org.springframework.lang.Nullable;  
  
import java.lang.annotation.Retention;  
import java.lang.annotation.Target;  
import java.lang.reflect.Field;  
  
import static java.lang.annotation.ElementType.FIELD;  
import static java.lang.annotation.RetentionPolicy.RUNTIME;  
  
/**  
 * @author leaderli * @since 2022/10/10 8:29 AM */public class bean_definition_registry_post_processor_1 {  
    @Retention(RUNTIME)  
    @Target({FIELD})  
    public @interface MyAuto {  
  
    }  
  
    static class Foo {  
  
    }  
  
    static class Bar {  
  
        @MyAuto  
        Foo foo;  
    }  
  
    static class CustomBeanPost implements BeanPostProcessor {  
  
        @Nullable  
        public Object postProcessBeforeInitialization(Object bean, String beanName) throws BeansException {  
            for (Field field : ReflectUtil.getFields(bean.getClass()).filter(f -> f.isAnnotationPresent(MyAuto.class))) {  
  
                try {  
                    field.set(bean, field.getType().newInstance());  
                } catch (IllegalAccessException | InstantiationException e) {  
                    throw new RuntimeException(e);  
                }  
            }  
            return bean;  
        }  
  
  
    }  
  
  
    public static void main(String[] args) {  
        AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(CustomBeanPost.class);  
        context.registerBean(Bar.class, Bar::new);  
        assert context.getBean(Bar.class).foo != null;  
  
    }  
}
```