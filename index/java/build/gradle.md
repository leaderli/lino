---
tags:
  - java/maven/grade
date updated: 2022-04-05 16:15
---


基于5.2.1的版本

## 什么是构建工具


以可执行和有序的任务来表达自动化需求，任务和它们的相互依赖被模块化成一个有向非循环图（DAG）

![[Pasted image 20241209134000.png]]



## 安装

```shell
curl -LO https://services.gradle.org/distributions/gradle-5.2.1-bin.zip
unzip gradle-5.2.1-bin.zip
mv gradle-5.2.1 /usr/local/gradle

# ~/.bash_profile
export GRADLE_HOME=/usr/local/gradle
export PATH=$PATH:$GRADLE_HOME/bin


gradle -v
```



## 命令行参数


- `-v` 显示版本信息
- `-q` 仅显示任务执行输出


##  快速入门


新建目录，新增文件`build.gradle`


```groovy
task helloWorld {
    doLast {
        println 'hello World'
    }
}
```

```shell
$ gradle -q helloWorld
hello World
```


任务执行可以使用缩写，只要保证唯一性即可

```shell
$ gradle -q hw
hello World
```


## 目录结构


```groovy
plugins {
    id 'java'
    id 'maven-publish'
}

// 修改默认构建目录，默认为build
buildDir = 'out'
```



## 常用配置


```groovy
sourceSets {  
    main {  
        java {  
            srcDirs = ['src/main/java']  //修改源码目录
        }  
    }  
    test {  
        java {  
            srcDirs = ['src/test/java']  // 修改测试目录
        }  
    }  
}

dependencies {  
    testImplementation 'org.junit.jupiter:junit-jupiter:5.8.1' // 引入 JUnit 测试框架  
}
test {  
    useJUnitPlatform() // 启用 JUnit 5 平台  
}
```
## 刷新依赖

```shell
gradle build --refresh-dependencies
```


## 参考文档

[Groovy 基本语法\_w3cschool](https://www.w3cschool.cn/groovy/groovy_basic_syntax.html)