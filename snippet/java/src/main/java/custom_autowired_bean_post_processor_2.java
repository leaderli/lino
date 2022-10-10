import io.leaderli.litool.core.meta.Lira;
import io.leaderli.litool.core.type.ReflectUtil;
import net.bytebuddy.ByteBuddy;
import net.bytebuddy.asm.Advice;
import net.bytebuddy.implementation.MethodCall;
import net.bytebuddy.implementation.MethodDelegation;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.config.BeanPostProcessor;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
import org.springframework.lang.Nullable;

import java.lang.annotation.Retention;
import java.lang.annotation.Target;
import java.lang.reflect.Field;

import static java.lang.annotation.ElementType.FIELD;
import static java.lang.annotation.RetentionPolicy.RUNTIME;
import static net.bytebuddy.matcher.ElementMatchers.named;

/**
 * @author leaderli
 * @since 2022/10/10 8:29 AM
 */
public class custom_autowired_bean_post_processor_2 {
    @Retention(RUNTIME)
    @Target({FIELD})
    public @interface MyAuto {

    }

    public static class Delete {
        public static Object service(Object request) {
            System.out.println("request:" + request);
            return request;
        }
    }

    public interface Foo {
        String service(String request);
    }

    static class Bar {

        @MyAuto
        Foo foo;
    }

    static class CustomBeanPost implements BeanPostProcessor {

        @Nullable
        public Object postProcessBeforeInitialization(Object bean, String beanName) throws BeansException {

            Lira<Field> fieldsWithAnnotation = ReflectUtil.getFields(bean.getClass())
                    .filter(f -> f.isAnnotationPresent(MyAuto.class));
            for (Field field : fieldsWithAnnotation) {
//                new ByteBuddy().subclass(field.getType()).in
                Class<?> dynamicType = new ByteBuddy()
                        .subclass(field.getType())
//                        .method(named("service"))
//                        .intercept(MethodCall.call(()->Delete.service()))
                        .make()

                        .load(getClass().getClassLoader())
                        .getLoaded();
                try {
                    field.set(bean, dynamicType.newInstance());
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
        Foo foo = context.getBean(Bar.class).foo;
        System.out.println(foo.service("fuck"));

    }
}
