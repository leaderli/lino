import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.MockedStatic;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mockStatic;

public class mockito_1 {

    @BeforeEach
    public void b() {

        MockedStatic mocked = mockStatic(Foo.class);
        mocked.when(Foo::method).thenReturn("bar");
    }

    @Test
    void test() {
        assertEquals("foo", Foo.method());
        assertEquals("bar", Foo.method());
        t1();
        assertEquals("foo", Foo.method());

    }

    private void t1() {
        assertEquals("bar", Foo.method());
    }


    static class Foo {

        static {

            System.out.println(Foo.class.getClassLoader());
        }
        public static String method() {
            System.out.println(Foo.class.getClassLoader());
            return "foo";
        }
    }
}
