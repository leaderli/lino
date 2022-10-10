import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;

/**
 * @author leaderli
 * @since 2022/10/10 8:29 AM
 */
public class bean_definition_registry_post_processor_1 {

    static class Foo {

    }

    static class Bar {

        @Autowired
        Foo foo;
    }


    public static void main(String[] args) {
        AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext();
        context.refresh();
        context.registerBean(Bar.class, Bar::new);
        context.registerBean(Foo.class, Foo::new);

        System.out.println(context.getBean(Foo.class));
        System.out.println(context.getBean(Bar.class).foo);
    }
}
