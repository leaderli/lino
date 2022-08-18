---
aliases: 单元测试
tags:
  - java/框架/junit
date updated: 2022-08-19 05:45
---

### 快速入门

```xml
<dependency>
	<groupId>org.junit.jupiter</groupId>
	<artifactId>junit-jupiter-engine</artifactId>
	<version>5.8.1</version>
	<scope>test</scope>
</dependency>
<dependency>
	<groupId>org.junit.jupiter</groupId>
	<artifactId>junit-jupiter-api</artifactId>
	<version>5.8.1</version>
	<scope>test</scope>
</dependency>
<dependency>
	<groupId>org.junit.jupiter</groupId>
	<artifactId>junit-jupiter-params</artifactId>
	<version>5.8.1</version>
	<scope>test</scope>
</dependency>
<dependency>
	<groupId>org.junit.platform</groupId>
	<artifactId>junit-platform-commons</artifactId>
	<version>1.8.1</version>
	<scope>test</scope>
</dependency>

<dependency>
	<groupId>org.junit-pioneer</groupId>
	<artifactId>junit-pioneer</artifactId>
	<version>1.5.0</version>
	<scope>test</scope>
</dependency>
```

```java
public class TestJunit {

    @ParameterizedTest
    @ValueSource(strings = { "racecar", "radar", "able was I ere I saw elba" })
    void parameters(String candidate) {
        System.out.println(candidate);
    }
}

```

![[Pasted image 20220221002914.png|left]]

```java
@CartesianTest  
void myCartesianTestMethod(  
	@CartesianTest.Values(ints = { 1, 2 }) int x ,  
	@CartesianTest.Values(ints = { 3, 4 }) int y ) {  
  
 System.out.println(x+" "+ y);  
}
```

![[Pasted image 20220221003545.png|left]]

### 自定义junit工具类

需要使用 junit5
自定义一个注解，只要在注解上标记 `@TestTemplate` ，则表明这个注解是一个 junit 注解，当用该自定义注解方法时，则该方法则被视为测试方法，ide 配合junit插件，maven配合[[maven#测试|插件]]，就可以执行。

```java
@TestTemplate  
@ExtendWith(LiTestExtension.class)  
@Target(ElementType.METHOD)  
@Retention(RetentionPolicy.RUNTIME)  
public @interface LiTest {  
}
```

仅使用 `@TestTemplate` 是无法实际执行的，需要注解一个实际执行测试方法的插件，插件可以定义测试的实际执行过程。

```java
  
import org.junit.jupiter.api.extension.*;  
import java.lang.reflect.Method;  
import java.util.ArrayList;  
import java.util.Arrays;  
import java.util.List;  
import java.util.stream.Stream;  
  
  
public class LiTestExtension implements TestTemplateInvocationContextProvider {  
  

    @Override  
    public boolean supportsTestTemplate(ExtensionContext context) {  
		// 返回该方法是否支持测试
        return true;  
    }  

	// 返回多个执行上下文，每一个执行上下文，表明一次测试
    @Override  
    public Stream<TestTemplateInvocationContext> provideTestTemplateInvocationContexts(ExtensionContext extensionContext) {  
  
  
        Method templateMethod = extensionContext.getRequiredTestMethod();  
        String displayName = extensionContext.getDisplayName();  
  
        List<TestTemplateInvocationContext> list = new ArrayList<>();  
        list.add(new MyTestTemplateInvocationContext(3, 3, 3));  
  
        return list.stream();  
    }  
  
}
```

测试执行上下文

```java
class MyTestTemplateInvocationContext implements TestTemplateInvocationContext {  
    private final Object[] parameters;  
  
    MyTestTemplateInvocationContext(Object... parameters) {  
        this.parameters = parameters;  
    }  


    @Override  
    public String getDisplayName(int invocationIndex) {  
		// 方法 junit 插件的提示符
        return "li:" + Arrays.toString(parameters);  
    }  
  
    @Override  
    public List<Extension> getAdditionalExtensions() {  
	    // 方法 junit 执行过程中的一些行为插件，例如 @Before  @After ，或者一些测试方法需要参数，可以使用参数提供插件
        return new ArrayList<>();  
    }  
}
```

```java
class MyCartesianProductResolver implements ParameterResolver {  
  
    private final Object[] parameters;  
  
    MyCartesianProductResolver(Object[] parameters) {  
        this.parameters = parameters;  
    }  
  
    @Override  
    public boolean supportsParameter(ParameterContext parameterContext, ExtensionContext extensionContext) {  
		// 方法 插件是否执行使用
        return true;  
    }  
  
    @Override  
    public Object resolveParameter(ParameterContext parameterContext, ExtensionContext extensionContext) {  
		// index 表明方法参数的角标
        return parameters[parameterContext.getIndex()];  
    }  
}
```

### junit断言异常

#junit4

```java
public class Student {
    public boolean canVote(int age) {
        if (i<=0) throw new IllegalArgumentException("age should be +ve");
        if (i<18) return false;
        else return true;
    }
}
public class TestStudent{

    @Rule
    public ExpectedException thrown= ExpectedException.none();

    @Test
    public void canVote_throws_IllegalArgumentException_for_zero_age() {
        Student student = new Student();
        thrown.expect(IllegalArgumentException.class);
        thrown.expectMessage("age should be +ve");
        student.canVote(0);
    }
}
```

#test5

```java
RuntimeException thrown = Assertions.assertThrows(RuntimeException.class, () -> {


		throw new RuntimeException("hello");

});
Assertions.assertEquals("hello", thrown.getLocalizedMessage());

```

### 参考文档

[📒 JUnit 5 User Guide](https://junit.org/junit5/docs/current/user-guide/#overview)

一个用于生成笛卡尔积参数的框架

[📒 junit-pioneer](https://github.com/junit-pioneer/junit-pioneer)
