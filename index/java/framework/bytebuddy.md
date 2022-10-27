---
tags:
  - java/框架/bytebuddy
date updated: 2022-10-10 19:47
---

```xml
<dependency>  
    <groupId>net.bytebuddy</groupId>  
    <artifactId>byte-buddy</artifactId>  
    <version>1.12.16</version>  
</dependency>  
<dependency>  
    <groupId>net.bytebuddy</groupId>  
    <artifactId>byte-buddy-agent</artifactId>  
    <version>1.12.16</version>  
</dependency>
```

## 动态生成子类

```java
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
```

### MethodDelegation

@RuntimeType 告诉 Byte Buddy 不要进行严格的参数类型检测，在参数匹配失败时，尝试使用类型转换方式（runtime type casting）进行类型转换，匹配相应方法
@AllArguments 注解：注入目标方法的全部参数，是不是感觉与 Java 反射的那套 API 有点类似了？
@Origin 注解：注入目标方法对应的 Method 对象。如果拦截的是字段的话，该注解应该标注到 Field 类型参数。
@Super 注解：注入目标对象。通过该对象可以调用目标对象的所有方法。
@This 注解：注入目标对象。不可以通过该对象可以调用目标对象的方法，会造成死循环

## 修改已加载类

需要 [[java agent]] 支持

### 使用MethodDelegation

```java
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
```

用来替换现有方法，代理类中的方法不一定需要和原始类方法名相同。

```java
public class GreetingInterceptor {
  public Object greet(Object argument) {
    return "Hello from " + argument;
  }
}

Class<? extends java.util.function.Function> dynamicType = new ByteBuddy()
  .subclass(java.util.function.Function.class)
  .method(ElementMatchers.named("apply"))
  .intercept(MethodDelegation.to(new GreetingInterceptor()))
  .make()
  .load(getClass().getClassLoader())
  .getLoaded();
assertThat((String) dynamicType.newInstance().apply("Byte Buddy"), is("Hello from Byte Buddy"));

```

### 使用Advice

@Advice.Return  `readOnly = false`是否允许修改返回值, `typing = Assigner.Typing.DYNAMIC` 动态返回类型

```java
import io.leaderli.litool.core.type.PrimitiveEnum;  
import io.leaderli.litool.core.util.ConsoleUtil;  
import net.bytebuddy.ByteBuddy;  
import net.bytebuddy.agent.ByteBuddyAgent;  
import net.bytebuddy.asm.Advice;  
import net.bytebuddy.dynamic.loading.ClassReloadingStrategy;  
import net.bytebuddy.implementation.bytecode.assign.Assigner;  
import net.bytebuddy.matcher.ElementMatchers;  
  
import java.lang.reflect.Method;  
  
public class bytebuddy_2 {  
  
  
    public static class Source {  
        public static int hello(String name) {  
            System.out.println("------hello------" + name);  
            return name.length();  
        }  
  
        public int hello2(String name) {  
            System.out.println("------hello2------" + name);  
            return name.length();  
        }  
  
    }  
  
  
    public static void main(String[] args) {  
  
        ByteBuddyAgent.install();  
        ByteBuddy byteBuddy = new ByteBuddy();  
  
        System.out.println("before:" + Source.hello("123"));  
        Source source = new Source();  
        System.out.println("before:" + source.hello2("123"));  
  
        ConsoleUtil.line();  
        new ByteBuddy()  
                .redefine(Source.class)  
                .visit(Advice.to(MockMethodAdvice.class).on(ElementMatchers.named("hello")))  
                .visit(Advice.to(MockMethodAdvice.class).on(ElementMatchers.named("hello2")))  
                .make()  
                .load(Source.class.getClassLoader(), ClassReloadingStrategy.fromInstalledAgent());  
        System.out.println("redefine:" + Source.hello("123"));  
        System.out.println("redefine:" + source.hello2("123"));  
  
        ConsoleUtil.line();  
  
        new ByteBuddy().redefine(Source.class)  
                .make()  
                .load(Source.class.getClassLoader(), ClassReloadingStrategy.fromInstalledAgent());  
        System.out.println("reset" + Source.hello("123"));  
  
    }  
  
  
    public static class MockMethodAdvice {  
        //        @Advice.OnMethodEnter(skipOn = Advice.OnNonDefaultValue.class) //跳过执行原方法，需要当前方法返回值不为void  
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
//            print0(",", method, "real", returned, "mock", mocked);  
            returned = mocked; // 修改方法的返回值  
  
        }  
    }  
  
}
```


## Advice.OnMethodEnter


`skipOn` 表示什么时候忽略实际方法调用，为了跳过 void 方法调用，可以实际返回一个无意义的 `0`

```java
public static class MockMethodAdvice {  
    /**  
     * this is a delegate for all method of mockindg class, will ignore actual inovation of all methods.     * to prevent call actual method on the void-method, return a meaningless 0     *     * @param origin the origin method of mocking class  
     * @return return a meaningless 0     */    @SuppressWarnings("all")  
    @Advice.OnMethodEnter(skipOn = Advice.OnNonDefaultValue.class)  
    public static Object enter(@Advice.Origin Method origin) {  
        if (mockProgress) {  
            mockMethod = origin;  
        }  
        return 0;  
    }  
}
```
## Advice.OnMethodExit

忽略类加载`clinit`抛出的异常导致类无法加载的问题

`@Advice.Thrown`  方法抛出的异常，可以将其赋值为null，忽略异常

```java
if (skipTypeInitError) {  
    byteBuddy.redefine(mockingClass)  
            .visit(Advice.to(MockInitAdvice.class).on(MethodDescription::isMethod))  
            .visit(Advice.to(MockStaticBlock.class).on(MethodDescription::isTypeInitializer))  
            .make()  
            .load(mockingClass.getClassLoader(), ClassReloadingStrategy.fromInstalledAgent());  
    try {  
        Class.forName(mockingClass.getName());  
    } catch (ClassNotFoundException e) {  
        throw new RuntimeException(e);  
    }  
}
```

```java
public static class MockStaticBlock {  
    @Advice.OnMethodExit(onThrowable = Throwable.class)  
    public static void enter(@Advice.Thrown(readOnly = false) Throwable th) {  
        th = null;  
    }  
}
```
## 参考文档

[Byte Buddy - runtime code generation for the Java virtual machine](http://bytebuddy.net/#/)
