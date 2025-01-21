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


## ConfigSlurper

读取groovy脚本形式配置文件的工具类


```groovy
def config = new ConfigSlurper().parse(''' app.date = new Date() // 1
app.age = 42
app { // 2
        name = "Test${42}"
    }
''')
assert config.app.date instanceof Date 
assert config.app.age == 42
assert config.app.name == 'Test42'
```

## 命令链


groovy可以使你省略顶级语句方法调用中参数外面的括号

```groovy
// 等同于 turn(left).then(right) 
turn left then right

// 等同于 take(2.pills).of(chloroquinine).after(6.hours) 
take 2.pills of chloroquinine after 6.hours

// 等同于 paint(wall).with(red, green).and(yellow)
paint wall with red, green and yellow
// 命令参数
// 等同于 check(that: margarita).tastes(good) 
check that: margarita tastes good
// 闭包作为参数
// 等同于 given({}).when({}).then({})
given { } when { } then { }

// 不带参数，需要括号

// select(all).unique().from(names) 
select all unique() from names

// 命令链包含奇数个元素
// 等同于 take(3).cookies  
// 等同于 take(3).getCookies() 
take 3 cookies
```