import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.*;

import static io.leaderli.litool.core.util.ConsoleUtil.print;

@ExtendWith(ContainerExtension.class)
public class junit_1 {

    @Test
    void test() {

        print(this,this.getClass().getClassLoader());

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
