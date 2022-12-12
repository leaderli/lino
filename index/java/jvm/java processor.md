---
tags:
  - java/jvm/java_processor
date updated: 2022-10-07 21:25
---


## 快速入门


实现一个自动添加get方法的注解

pom文件，实现在编译阶段不使用预处理器，但是在打包的过程中需要将`processor`打包到jar中

```xml
<?xml version="1.0" encoding="UTF-8"?>  
<project xmlns="http://maven.apache.org/POM/4.0.0"  
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"  
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">  
    <modelVersion>4.0.0</modelVersion>  
  
    <groupId>io.leaderli.litool</groupId>  
    <artifactId>litool-compile</artifactId>  
    <version>1.0</version>  
  
    <properties>  
        <maven.compiler.source>8</maven.compiler.source>  
        <maven.compiler.target>8</maven.compiler.target>  
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>  
    </properties>  
    <dependencies>  
  
        <dependency>  
            <groupId>com.sun</groupId>  
            <artifactId>tools</artifactId>  
            <version>1.6</version>  
            <scope>system</scope>  
            <systemPath>${java.home}/../lib/tools.jar</systemPath>  
        </dependency>  
    </dependencies>  
    <build>  
        <resources>  
            <resource>  
                <directory>src/main/resources</directory>  
                <excludes>  
                    <exclude>META-INF/**/*</exclude>  
                </excludes>  
            </resource>  
        </resources>  
        <plugins>  
            <plugin>  
                <groupId>org.apache.maven.plugins</groupId>  
                <artifactId>maven-resources-plugin</artifactId>  
                <version>2.6</version>  
                <executions>  
                    <execution>  
                        <id>process-META</id>  
                        <phase>prepare-package</phase>  
                        <goals>  
                            <goal>copy-resources</goal>  
                        </goals>  
                        <configuration>  
                            <outputDirectory>target/classes</outputDirectory>  
                            <resources>  
                                <resource>  
                                    <directory>${basedir}/src/main/resources/</directory>  
                                    <includes>  
                                        <include>**/*</include>  
                                    </includes>  
                                </resource>  
                            </resources>  
                        </configuration>  
                    </execution>  
                </executions>  
            </plugin>  
        </plugins>  
    </build>  
</project>
```

```java
package io.leaderli.litool.compile;  
  
import java.lang.annotation.ElementType;  
import java.lang.annotation.Retention;  
import java.lang.annotation.RetentionPolicy;  
import java.lang.annotation.Target;  
  
@Target(ElementType.TYPE)  
@Retention(RetentionPolicy.SOURCE)  
public @interface Getter {  
}
```


```java
package io.leaderli.litool.compile;  
  
import com.sun.source.tree.Tree;  
import com.sun.tools.javac.api.JavacTrees;  
import com.sun.tools.javac.code.Flags;  
import com.sun.tools.javac.processing.JavacProcessingEnvironment;  
import com.sun.tools.javac.tree.JCTree;  
import com.sun.tools.javac.tree.TreeMaker;  
import com.sun.tools.javac.tree.TreeTranslator;  
import com.sun.tools.javac.util.*;  
  
import javax.annotation.processing.*;  
import javax.lang.model.SourceVersion;  
import javax.lang.model.element.Element;  
import javax.lang.model.element.TypeElement;  
import javax.tools.Diagnostic;  
import java.util.Set;  
  
@SupportedAnnotationTypes("io.leaderli.litool.compile.Getter")  
@SupportedSourceVersion(SourceVersion.RELEASE_8)  
public class GetterProcessor extends AbstractProcessor {  
    private Messager messager;  
    private JavacTrees trees;  
    private TreeMaker treeMaker;  
    private Names names;  
  
    @Override  
    public synchronized void init(ProcessingEnvironment processingEnv) {  
        super.init(processingEnv);  
        this.messager = processingEnv.getMessager();  
        this.trees = JavacTrees.instance(processingEnv);  
        Context context = ((JavacProcessingEnvironment) processingEnv).getContext();  
        this.treeMaker = TreeMaker.instance(context);  
        this.names = Names.instance(context);  
    }  
  
    @Override  
    public synchronized boolean process(Set<? extends TypeElement> annotations, RoundEnvironment roundEnv) {  
        Set<? extends Element> set = roundEnv.getElementsAnnotatedWith(Getter.class);  
        set.forEach(element -> {  
            System.out.println(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>"+element);  
            JCTree jcTree = trees.getTree(element);  
            jcTree.accept(new TreeTranslator() {  
                @Override  
                public void visitClassDef(JCTree.JCClassDecl jcClassDecl) {  
                    List<JCTree.JCVariableDecl> jcVariableDeclList = List.nil();  
  
                    for (JCTree tree : jcClassDecl.defs) {  
                        if (tree.getKind().equals(Tree.Kind.VARIABLE)) {  
                            JCTree.JCVariableDecl jcVariableDecl = (JCTree.JCVariableDecl) tree;  
                            jcVariableDeclList = jcVariableDeclList.append(jcVariableDecl);  
                        }  
                    }  
  
                    jcVariableDeclList.forEach(jcVariableDecl -> {  
                        messager.printMessage(Diagnostic.Kind.NOTE, jcVariableDecl.getName() + " has been processed");  
                        jcClassDecl.defs = jcClassDecl.defs.prepend(makeGetterMethodDecl(jcVariableDecl));  
                    });  
                    super.visitClassDef(jcClassDecl);  
                }  
  
            });  
        });  
  
        return true;  
    }  
  
    private JCTree.JCMethodDecl makeGetterMethodDecl(JCTree.JCVariableDecl jcVariableDecl) {  
  
        ListBuffer<JCTree.JCStatement> statements = new ListBuffer<>();  
        statements.append(treeMaker.Return(treeMaker.Select(treeMaker.Ident(names.fromString("this")), jcVariableDecl.getName())));  
        JCTree.JCBlock body = treeMaker.Block(0, statements.toList());  
        return treeMaker.MethodDef(treeMaker.Modifiers(Flags.PUBLIC), getNewMethodName(jcVariableDecl.getName()), jcVariableDecl.vartype, List.nil(), List.nil(), List.nil(), body, null);  
    }  
  
    private Name getNewMethodName(Name name) {  
        String s = name.toString();  
        return names.fromString("get" + s.substring(0, 1).toUpperCase() + s.substring(1, name.length()));  
    }  
}
```

新建资源文件 `META-INF/services/javax.annotation.processing.Processor` 其内容为 `io.leaderli.litool.compile.GetterProcessor` 即我们实现的自定义处理器



使用的项目中仅需要引入即可, `scope` 需要为 `compile` ， 否则不生效

```xml
  
<dependency>  
    <groupId>io.leaderli.litool</groupId>  
    <artifactId>litool-compile</artifactId>  
    <version>1.0</version>  
    <scope>compile</scope>  
</dependency>
```

```java
import io.leaderli.litool.compile.Getter;  
  
@Getter  
public class BasicSalaryCalculator {  
    private double basicSalary;  
}
```

编译后的文件 

```java
package com.test;
  
  
public class BasicSalaryCalculator {
  
    private double basicSalary;
  
  
    public double getBasicSalary() {
  
        return this.basicSalary;
  
    }
}
```
## 参考文档

[Lombok原理分析与功能实现](https://blog.mythsman.com/post/5d2c11c767f841464434a3bf/)  其中引入预处理器的依赖应该声明为`<scope>compile</scope>`javax.annotation.processing.Processor