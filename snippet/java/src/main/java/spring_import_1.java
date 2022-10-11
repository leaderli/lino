import org.springframework.context.annotation.AnnotationConfigApplicationContext;
import org.springframework.context.annotation.Import;

import java.lang.annotation.*;

/**
 * @author leaderli
 * @since 2022/10/11 3:34 PM
 */

@spring_import_1.EnableFoo
public class spring_import_1 {
    @Target(ElementType.TYPE)
    @Retention(RetentionPolicy.RUNTIME)
    @Documented
    @Import(Foo.class)
    public @interface EnableFoo {
    }

    static class Foo {

    }

    public static void main(String[] args) {
        AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(spring_import_1.class);
        System.out.println(context.getBean(Foo.class));

    }
}
