---
tags:
  - java/框架ognl
date updated: 2022-04-05 17:27
---


## 快速入门

```xml
<dependency>
    <groupId>ognl</groupId>
    <artifactId>ognl</artifactId>
    <version>3.3.4</version>
</dependency>
```



```java

package io.leaderli.demo;

import io.leaderli.litool.core.collection.LiMapUtil;
import ognl.Ognl;
import ognl.OgnlException;
import org.junit.jupiter.api.Test;

public class OgnlTest {
    @Test
    void test() throws OgnlException {
        System.out.println(Ognl.getValue("name", null, LiMapUtil.newHashMap("name", "123")));
        Object name = Ognl.parseExpression("name");
        System.out.println(Ognl.getValue(name, null, LiMapUtil.newHashMap("name", "123")));

    }
}

```


## 参考
[OGNL - Apache Commons OGNL - Language Guide](https://commons.apache.org/dormant/commons-ognl/language-guide.html)