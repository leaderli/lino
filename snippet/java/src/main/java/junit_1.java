import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.*;

@ExtendWith(ContainerExtension.class)
public class junit_1 {

    @Test
    void test() {

        System.out.println(this);

    }
}

class ContainerExtension implements TestInstanceFactory {

    @Override
    public Object createTestInstance(TestInstanceFactoryContext factoryContext, ExtensionContext extensionContext) throws TestInstantiationException {
        try {
            return factoryContext.getTestClass().newInstance();
        } catch (InstantiationException | IllegalAccessException e) {
            throw new RuntimeException(e);
        }
    }
}
