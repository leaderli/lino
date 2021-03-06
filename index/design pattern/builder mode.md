---
aliases:  建造者模式,静态内部类的泛型
tags:
  - 设计模式/建造者模式
  - 泛型
---

静态内部类的泛型和外部类的泛型没有任何关系，即使使用同一个字母。

```java
package com.li.springboot.bean;

import java.util.List;

public class LayuiResponse<T> {

    private final int code;
    private final String msg;
    private final List<T> data;
    private final Integer count;

    public int getCode() {
        return code;
    }

    public String getMsg() {
        return msg;
    }

    public List<T> getData() {
        return data;
    }

    public int getCount() {
        return count;
    }

    public static <T> Builder<T> builder() {
        return new Builder<T>();
    }

    private LayuiResponse(Builder<T> builder) {
        this.code = builder.code;
        this.msg = builder.msg;
        this.data = builder.data;
        this.count = builder.count;
    }

    public static class Builder<R> {
        private int code;
        private String msg;
        private List<R> data;
        private Integer count;

        public Builder<R> code(int code) {
            this.code = code;
            return this;
        }

        public Builder<R> msg(String msg) {
            this.msg = msg;
            return this;
        }

        public Builder<R> data(List<R> data) {
            this.data = data;
            return this;
        }

        public Builder<R> count(int count) {
            this.count = count;
            return this;
        }

        public LayuiResponse<R> build() {
            return new LayuiResponse<>(this);
        }
    }
}

```

使用时，需指定内部类的泛型

```java
List<String> list = new ArrayList<>();
list.add("123");
LayuiResponse<String> ok = LayuiResponse.<String>builder().code(0).msg("ok").data(list).build();
```

使用构造器模式，主要是为了使属性在构建时一次性初始化好，不允许中间过程去设置属性，保持`bean`的状态一致性。同时也是为了清晰化构建过程。推荐使用`final`来修饰被构建对象的属性值，
确保成员属性不会被赋值。
