import io.leaderli.litool.core.type.PrimitiveEnum;
import net.bytebuddy.ByteBuddy;
import net.bytebuddy.agent.ByteBuddyAgent;
import net.bytebuddy.asm.Advice;
import net.bytebuddy.dynamic.loading.ClassReloadingStrategy;
import net.bytebuddy.implementation.bytecode.assign.Assigner;
import net.bytebuddy.matcher.ElementMatchers;

import java.lang.instrument.Instrumentation;
import java.lang.reflect.Method;

import static io.leaderli.litool.core.util.ConsoleUtil.print0;

public class bytebuddy_2 {


    public static class Source {
        public static int hello(String name) {
            System.out.println("------------" + name);
            return name.length();
        }

    }


    public static void main(String[] args) {

        Instrumentation instrumentation = ByteBuddyAgent.install();
        ByteBuddy byteBuddy = new ByteBuddy();

        System.out.println(Source.hello("123"));

        new ByteBuddy()
                .redefine(Source.class)
                .visit(Advice.to(MockMethodAdvice.class).on(ElementMatchers.named("hello")))
                .make()
                .load(Source.class.getClassLoader(), ClassReloadingStrategy.fromInstalledAgent());
        System.out.println(Source.hello("123"));

    }


    public static class MockMethodAdvice {
        //        @Advice.OnMethodEnter(skipOn = Advice.OnNonDefaultValue.class) 跳过执行原方法
        @Advice.OnMethodEnter
        public static Object enter(
//                @Advice.This Object mock,   // 静态方法无this
                @Advice.Origin Method origin,
                @Advice.AllArguments Object[] arguments) {

            return PrimitiveEnum.get(origin.getReturnType()).zero_value;
        }

        @SuppressWarnings({"unused"})
        @Advice.OnMethodExit
        private static void exit(
                @Advice.Return(readOnly = false, typing = Assigner.Typing.DYNAMIC) Object returned // 原始方法的执行结果
                , @Advice.Enter Object mocked // OnMethodEnter方法的返回值
                , @Advice.Origin Method method // 原始方法
        )
                throws Throwable {
            print0(",", method, "real", returned, "mock", mocked);
            returned = mocked; // 修改方法的返回值

        }
    }

}
