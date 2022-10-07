import net.bytebuddy.ByteBuddy;
import net.bytebuddy.implementation.FixedValue;
import net.bytebuddy.matcher.ElementMatchers;
import org.junit.jupiter.api.Test;

public class bytebuddy_1 {

    public static class Foo {
        public String say() {
            return "foo";
        }
    }

    @Test
    void test() throws InstantiationException, IllegalAccessException {

        Class<?> dynamicType = new ByteBuddy()
                .subclass(Foo.class)
                .method(ElementMatchers.named("say"))
                .intercept(FixedValue.value("Hello World!"))
                .make()
                .load(getClass().getClassLoader())
                .getLoaded();

        Foo x = (Foo) dynamicType.newInstance();
        System.out.println(x.say());

    }
}

