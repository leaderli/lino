---
tags:
  - java/maven/grade
date updated: 2025-01-17 13:15
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

## 命令行示例

### 刷新依赖

```shell
gradle build --refresh-dependencies
```

## 快速入门

新建目录，新增文件`build.gradle`

```groovy
task helloWorld {
    doLast {
        println 'hello World'
    }
}
helloWorld.doFirst { println "first action"}   // 添加一些动作
helloWorld.doLast  { println "last action"}   //  添加一些动作
```

```shell
$ gradle -q helloWorld
first action
hello World
last action
```

任务执行可以使用缩写，只要保证唯一性即可

```shell
$ gradle -q hW
first action
hello World
last action
```


## 基本原理

每个Gradle构建都包含三个基本构建块:project、task和 property。每个构建包含至少一个project，进而又包含一个或多个 task。project和task暴露的属性可以用来控制构建。Gradle构建中的两个基本概念是project和task。在多项目构建中一个 project可以依赖于其他的project。相似的，task可以形成一个依赖关系图来确保它们的执行顺序。

 
![[Pasted image 20250117132859.png]]

task的一些重要功能:任务动作(task action)和任务依赖(task dependency)。任务动作定义了一个当任 务执行时最小的工作单元


## task


### dependsOn

```groovy
task hello << {
    println 'Hello world!'
}

task intro(dependsOn: hello) << {
    println "I'm Gradle"
}
```

定义任务依赖
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
ext { // 定义变量
    myVersion = '1.0.0'
    myLibrary = 'com.example:my-library:${myVersion}'
}
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
repositories {  
	mavenLocal()     //指向本地 Maven 存储库
    mavenCentral()   // 配置中央仓库
	// 使用自定义的第三方 Maven 仓库
    maven {
        url "https://your.custom.maven.repo/repository/maven-releases/"
    }
}
test {  
    useJUnitPlatform() // 启用 JUnit 5 平台  
}
```

## 参考文档

[Groovy 基本语法_w3cschool](https://www.w3cschool.cn/groovy/groovy_basic_syntax.html)
