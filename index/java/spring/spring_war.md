---
aliases: war包启动
tags:
  - java/spring/war
date updated: 2024-01-09 10:05
---

```xml
<?xml version="1.0" encoding="UTF-8"?>  
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"  
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">  
    <modelVersion>4.0.0</modelVersion>  
    <parent>  
        <groupId>org.springframework.boot</groupId>  
        <artifactId>spring-boot-starter-parent</artifactId>  
        <version>2.5.6</version>  
        <relativePath/> <!-- lookup parent from repository -->  
    </parent>  
    <groupId>com.leaderli</groupId>  
    <artifactId>spring-demo</artifactId>  
    <version>0.0.1-SNAPSHOT</version>  
    <name>spring-demo</name>  
    <packaging>war</packaging>  
    <description>Demo project for Spring Boot</description>  
    <properties>  
        <java.version>1.8</java.version>  
    </properties>  
    <dependencies>  
  
        <dependency>  
            <groupId>org.springframework.boot</groupId>  
            <artifactId>spring-boot-starter-web</artifactId>  
        </dependency>  
        <dependency>  
            <groupId>org.springframework.boot</groupId>  
            <artifactId>spring-boot-starter-tomcat</artifactId>  
            <scope>provided</scope>  
        </dependency>  
        <dependency>  
            <groupId>com.google.code.gson</groupId>  
            <artifactId>gson</artifactId>  
            <version>2.8.9</version>  
        </dependency>  
  
  
        <dependency>  
            <groupId>org.springframework.boot</groupId>  
            <artifactId>spring-boot-starter-test</artifactId>  
            <scope>test</scope>  
        </dependency>  
    </dependencies>  
  
    <build>  
        <finalName>demo</finalName>  
        <plugins>  
            <plugin>  
                <groupId>org.springframework.boot</groupId>  
                <artifactId>spring-boot-maven-plugin</artifactId>  
  
            </plugin>  
        </plugins>  
    </build>  
  
</project>
```

```java
package com.leaderli.springdemo;  
  
import org.springframework.boot.autoconfigure.SpringBootApplication;  
import org.springframework.boot.builder.SpringApplicationBuilder;  
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;  
import org.springframework.stereotype.Controller;  
import org.springframework.web.bind.annotation.RequestMapping;  
  
@Controller  
@SpringBootApplication  
public class SpringDemoApplication extends SpringBootServletInitializer {  
  
    @Override  
    protected SpringApplicationBuilder configure(SpringApplicationBuilder application) {  
  
        return application.sources(SpringDemoApplication.class);  
    }  
  
    @RequestMapping("/hello")  
    public String hello() {  
        return "hello";  
    }  
}
```
