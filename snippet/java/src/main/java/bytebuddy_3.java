import io.leaderli.litool.core.internal.ParameterizedTypeImpl;
import net.bytebuddy.ByteBuddy;
import net.bytebuddy.dynamic.loading.ClassLoadingStrategy;
import net.bytebuddy.implementation.MethodDelegation;
import net.bytebuddy.implementation.bind.annotation.AllArguments;
import net.bytebuddy.implementation.bind.annotation.Origin;
import net.bytebuddy.implementation.bind.annotation.RuntimeType;
import net.bytebuddy.implementation.bind.annotation.Super;
import net.bytebuddy.matcher.ElementMatchers;

import java.lang.reflect.Method;
import java.util.Arrays;
import java.util.function.Function;

public class bytebuddy_3 {


    public static class Delegate {
        @RuntimeType
        public static Object apply(
                @Super Function<Object, Object> function,
                @Origin Method origin,
                @AllArguments Object[] args) {
            System.out.println(function);
            System.out.println(origin);
            System.out.println(Arrays.toString(args));
            return null;
        }
    }


    @SuppressWarnings({"unchecked", "rawtypes"})
    public static void main(String[] args) throws InstantiationException, IllegalAccessException {

        ByteBuddy byteBuddy = new ByteBuddy();

        ParameterizedTypeImpl make = ParameterizedTypeImpl.make(null, Function.class, String.class, String.class);
        Class<? extends Function> loaded = new ByteBuddy()
                .subclass(Function.class)
                .method(ElementMatchers.named("apply"))
                .intercept(MethodDelegation.to(Delegate.class))
                .make()
                .load(bytebuddy_3.class.getClassLoader(), ClassLoadingStrategy.Default.INJECTION).getLoaded();

        Function<String, String> function = loaded.newInstance();

        System.out.println(function.apply("123"));


    }


}
