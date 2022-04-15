---
tags:
  - java/框架/assertj
date updated: 2022-04-15 14:51
---

```xml
<dependency>
  <groupId>org.assertj</groupId>
  <artifactId>assertj-core</artifactId>
  <!-- use 2.5.0 for Java 7 projects -->
  <version>3.5.2</version>
  <scope>test</scope>
</dependency>
```

```java
import static org.assertj.core.api.Assertions.assertThat;  // main one
import static org.assertj.core.api.Assertions.atIndex; // for List assertions
import static org.assertj.core.api.Assertions.entry;  // for Map assertions
import static org.assertj.core.api.Assertions.tuple; // when extracting several properties at once
import static org.assertj.core.api.Assertions.fail; // use when writing exception tests
import static org.assertj.core.api.Assertions.failBecauseExceptionWasNotThrown; // idem
import static org.assertj.core.api.Assertions.filter; // for Iterable/Array assertions
import static org.assertj.core.api.Assertions.offset; // for floating number assertions
import static org.assertj.core.api.Assertions.anyOf; // use with Condition
import static org.assertj.core.api.Assertions.contentOf; // use with File assertions
```

示例

```java
@Test  
public void test() {  
    Assertions.assertThat(testMethod()).hasSize(4)  
            .contains("some result", "some other result")  
            .doesNotContain("shouldn't be here");  
  
  
}  
  
private List<String> testMethod() {  
    return new ArrayList<>();  
}
```

断言输出的结果

```java
java.lang.AssertionError: 
Expected size:<4> but was:<0> in:
<[]>

	at com.leaderli.litest.AssertJDemo.test(AssertJDemo.java:19)
```

## 参考文档

[📒 AssertJ](http://joel-costigliola.github.io/assertj/assertj-core-quick-start.html)
