---
tags:
  - java/build/groovy
date updated: 2025-01-17 23:29
---



## 一些常用语法




### list

```groovy
[1, 2, 3].each {  
    println "Item: $it" // 隐含变量，对应当前元素
}  
['a', 'b', 'c'].eachWithIndex { it, i -> //  i表示角标
    println "$i: $it"  
}
```

```shell
Item: 1
Item: 2
Item: 3
0: a
1: b
2: c
```


### map


```groovy
def map = [name: 'Gromit', likes: 'cheese', id: 1234]
def emptyMap = [:]



map.each { key, value ->
    println "key: $key value: $value"
}
map.eachWithIndex { key, value, i ->  
    println "$i - key: $key value: $value" }
```



###  `*` 星号操作符


`*`可以对集合中的所有元素调用方法或属性 


```groovy
def map = [name: 'Gromit', likes: 'cheese', id: 1234]
map*.key //  [name, likes, id]


def listOfMaps = [['a': 11, 'b': 12], ['a': 21, 'b':13]]  
  
println listOfMaps.a  // [11, 21]
println listOfMaps*.a // [11, 21]
```



## 执行脚本

```groovy
def process = "ls -l".execute()  
println "Found text ${process.text}"
```

```shell
Found text total 0
drwxr-xr-x  3 li  staff  96 Jan 18 00:08 groovy
drwxr-xr-x  3 li  staff  96 Jan 15 14:42 java
drwxr-xr-x  2 li  staff  64 Jan 15 14:43 resources
```

