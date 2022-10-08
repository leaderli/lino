import org.junit.jupiter.api.Test;
import org.mockito.MockedStatic;
import org.mockito.Mockito;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class mockito_1 {


    @Test
    void test() {
        MockedStatic mocked = Mockito.mockStatic(Foo.class);
//        mock(Foo.class);
//        System.out.println(new Foo().m1());
        System.out.println(Foo.method());
    }

    private void t1() {
        assertEquals("bar", Foo.method());
    }


    public static class Foo {

        public String m1() {
            System.out.println(Foo.class.getClassLoader());
            return "foo";
        }

        public static String method() {
            System.out.println(Foo.class.getClassLoader());
            return "foo";
        }
    }
}
