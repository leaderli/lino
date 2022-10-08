import org.junit.jupiter.api.Test;
import org.mockito.MockedStatic;
import org.mockito.Mockito;
import org.mockito.invocation.InvocationOnMock;
import org.mockito.stubbing.Answer;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class mockito_1 {


    @Test
    void test() {
        MockedStatic mocked = Mockito.mockStatic(Foo.class, new Answer() {
            @Override
            public Object answer(InvocationOnMock invocation) throws Throwable {
                return "answer";
            }
        });
//        System.out.println(new Foo().m1());
        Foo mock = Mockito.mock(Foo.class, new Answer() {
            @Override
            public Object answer(InvocationOnMock invocation) throws Throwable {
                return "anwser2";
            }
        });

        System.out.println(Foo.method());
        System.out.println(mock.m1());
    }

    private void t1() {
        assertEquals("bar", Foo.method());
    }


    public static class Foo {

        public String m1() {
            return "m1";
        }

        public static String method() {
            return "method";
        }
    }
}
