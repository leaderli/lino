---
tags:
  - java/spring/ioc
  - source
date updated: 2022-04-17 20:24
---

## BeanDefinition

`BeanDefinition` 是 `Spring` 用来定义一个类的元数据，它定义了

1. 如何创建一个`Bean`

2. `Bean`的生命周期

3. `Bean`的依赖关系


详细属性值如下图所示：

![BeanDefinition|400](spring-ioc-源码_BeanDefinition.png)

`Spring` 在扫描类后将类的 `BeanDefiniton` 元数据存储在 `BeanFactory` 中，当需要时，`BeanFactory` 根据 `BeanDefinition` 信息生成 `Bean` 
