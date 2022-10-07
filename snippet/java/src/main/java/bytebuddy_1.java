import net.bytebuddy.ByteBuddy;
import net.bytebuddy.agent.ByteBuddyAgent;
import net.bytebuddy.dynamic.loading.ClassReloadingStrategy;
import net.bytebuddy.implementation.MethodDelegation;

import static net.bytebuddy.matcher.ElementMatchers.named;

public class bytebuddy_1 {


    public static class Source {
        public String hello(String name) {
            return null;
        }

    }

    public static class Target {

        public static String hello(String name) {
            return "Hello " + name + "!";
        }
    }

    public static void main(String[] args) {

        ByteBuddyAgent.install();

        ByteBuddy byteBuddy = new ByteBuddy();

        byteBuddy.redefine(Source.class)
                .method(named("hello")).intercept(MethodDelegation.to(Target.class))
                .make()
                .load(Source.class.getClassLoader(), ClassReloadingStrategy.fromInstalledAgent());
        System.out.println(new Source().hello("world")); // Hello world!

        byteBuddy.rebase(Source.class)
                .make()
                .load(Source.class.getClassLoader(), ClassReloadingStrategy.fromInstalledAgent());
        System.out.println(new Source().hello("world"));// null


    }
}


