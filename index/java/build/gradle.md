---
tags:
  - java/build/grade
date updated: 2025-01-17 23:29
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

### 显示依赖树

```shell
$ gradle dependencies

> Task :dependencies

------------------------------------------------------------
Root project
------------------------------------------------------------

annotationProcessor - Annotation processors and their dependencies for source set 'main'.
No dependencies

apiElements - API elements for main. (n)
No dependencies

archives - Configuration for archive artifacts.
No dependencies

compile - Dependencies for source set 'main' (deprecated, use 'implementation' instead).
No dependencies

compileClasspath - Compile classpath for source set 'main'.
No dependencies

compileOnly - Compile only dependencies for source set 'main'.
No dependencies

default - Configuration for default artifacts.
No dependencies

implementation - Implementation only dependencies for source set 'main'. (n)
No dependencies

runtime - Runtime dependencies for source set 'main' (deprecated, use 'runtimeOnly' instead).
No dependencies

runtimeClasspath - Runtime classpath of source set 'main'.
No dependencies

runtimeElements - Elements of runtime for main. (n)
No dependencies

runtimeOnly - Runtime only dependencies for source set 'main'. (n)
No dependencies

testAnnotationProcessor - Annotation processors and their dependencies for source set 'test'.
No dependencies

testCompile - Dependencies for source set 'test' (deprecated, use 'testImplementation' instead).
No dependencies

testCompileClasspath - Compile classpath for source set 'test'.
+--- org.junit:junit-bom:5.10.0
|    +--- org.junit.jupiter:junit-jupiter:5.10.0 (c)
|    +--- org.junit.jupiter:junit-jupiter-api:5.10.0 (c)
|    +--- org.junit.jupiter:junit-jupiter-params:5.10.0 (c)
|    \--- org.junit.platform:junit-platform-commons:1.10.0 (c)
\--- org.junit.jupiter:junit-jupiter -> 5.10.0
     +--- org.junit.jupiter:junit-jupiter-api:5.10.0
     |    +--- org.opentest4j:opentest4j:1.3.0
     |    +--- org.junit.platform:junit-platform-commons:1.10.0
     |    |    \--- org.apiguardian:apiguardian-api:1.1.2
     |    \--- org.apiguardian:apiguardian-api:1.1.2
     \--- org.junit.jupiter:junit-jupiter-params:5.10.0
          +--- org.junit.jupiter:junit-jupiter-api:5.10.0 (*)
          \--- org.apiguardian:apiguardian-api:1.1.2

testCompileOnly - Compile only dependencies for source set 'test'.
No dependencies

testImplementation - Implementation only dependencies for source set 'test'. (n)
+--- org.junit:junit-bom:5.10.0 (n)
\--- org.junit.jupiter:junit-jupiter (n)

testRuntime - Runtime dependencies for source set 'test' (deprecated, use 'testRuntimeOnly' instead).
No dependencies

testRuntimeClasspath - Runtime classpath of source set 'test'.
+--- org.junit:junit-bom:5.10.0
|    +--- org.junit.jupiter:junit-jupiter:5.10.0 (c)
|    +--- org.junit.jupiter:junit-jupiter-api:5.10.0 (c)
|    +--- org.junit.jupiter:junit-jupiter-engine:5.10.0 (c)
|    +--- org.junit.jupiter:junit-jupiter-params:5.10.0 (c)
|    +--- org.junit.platform:junit-platform-commons:1.10.0 (c)
|    \--- org.junit.platform:junit-platform-engine:1.10.0 (c)
\--- org.junit.jupiter:junit-jupiter -> 5.10.0
     +--- org.junit.jupiter:junit-jupiter-api:5.10.0
     |    +--- org.opentest4j:opentest4j:1.3.0
     |    +--- org.junit.platform:junit-platform-commons:1.10.0
     |    |    \--- org.apiguardian:apiguardian-api:1.1.2
     |    \--- org.apiguardian:apiguardian-api:1.1.2
     +--- org.junit.jupiter:junit-jupiter-params:5.10.0
     |    +--- org.junit.jupiter:junit-jupiter-api:5.10.0 (*)
     |    \--- org.apiguardian:apiguardian-api:1.1.2
     \--- org.junit.jupiter:junit-jupiter-engine:5.10.0
          +--- org.junit.platform:junit-platform-engine:1.10.0
          |    +--- org.opentest4j:opentest4j:1.3.0
          |    +--- org.junit.platform:junit-platform-commons:1.10.0 (*)
          |    \--- org.apiguardian:apiguardian-api:1.1.2
          +--- org.junit.jupiter:junit-jupiter-api:5.10.0 (*)
          \--- org.apiguardian:apiguardian-api:1.1.2

testRuntimeOnly - Runtime only dependencies for source set 'test'. (n)
No dependencies

(c) - dependency constraint
(*) - dependencies omitted (listed previously)

(n) - Not resolved (configuration is not meant to be resolved)

A web-based, searchable dependency report is available by adding the --scan option.

BUILD SUCCESSFUL in 0s
1 actionable task: 1 executed
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

### 生命周期

Gradle的生命周期可以分为三个部分：初始化阶段、配置阶段和执行阶段。

![[Pasted image 20250117224826.png]]

```shell
gradle helloWorld

> Configure project :
I'm Gradle

> Task :helloWorld
first action
hello World null unspecified
last action

> Task :hello1
Hello world!

BUILD SUCCESSFUL in 1s
2 actionable tasks: 2 executed
```

上面示例中的 `> Configure project :` 就是配置阶段执行

## task

### dependsOn

```groovy
task hello  {
	doLast{
	    println 'Hello world!'
	}
}
task hello2  {
	doLast{
	    println 'Hello world2!'
	}
}

task intro(dependsOn: [hello,hello2])  { // hello,hello2并行执行，不保证顺序
	doLast{
	    println "I'm Gradle"
	}
}
```

### finalizedby

```groovy
task helloWorldFinal {
    doLast {
        println 'final'
    }
}
task helloWorld {
    doLast {
        println 'hello World'
    }
}
helloWorld.finalizedby helloWorldFinal      //  最终执行
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
		url 'http://maven.aliyun.com/nexus/content/groups/public/'
    }
}
test {  
    useJUnitPlatform() // 启用 JUnit 5 平台  
}
```

## 依赖配置

排除某些关联依赖

```groovy
implementation("io.leaderli.litool:litool-test:2.3.5"){  
    exclude group: "net.bytebuddy",module:"byte-buddy"  
}
```


排除所有的依赖传递

```groovy
implementation("io.leaderli.litool:litool-test:2.3.5"){  
    transitive  false
}
```


动态版本配置



```groovy
implementation("io.leaderli.litool:litool-test:2.3.+")
```


## 插件


### groovy

设置 groovy-sdk，可以运行调试 groovy脚本

```groovy
plugins {  
    id("groovy")  
}
dependencies {  
    implementation 'org.codehaus.groovy:groovy-all:2.5.23'  
}
```
## 参考文档

[Groovy 基本语法_w3cschool](https://www.w3cschool.cn/groovy/groovy_basic_syntax.html)
