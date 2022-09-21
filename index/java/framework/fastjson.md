---
tags:
  - java/框架/fastjson
date updated: 2022-04-15 14:54
---

```java
// 默认为null的字符串不会被序列化，可通过如下方法使其返回一个默认的空字符串
JSONObject.toJSONString(obj,SerializerFeature.WriteNullStringAsEmpty);
```


带泛型的parse

```java
JSONObject.parseObject(json,new TypeReference<List<Integer>>(){})
// parameterizedType 实际声明时的泛型类型
JSONObject.parseObject(json,parameterizedType);
```
