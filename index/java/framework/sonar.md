---
aliases:  sonar
tags:
- java/框架/sonar
---


## [sonar](https://www.sonarqube.org/)

###  下载

可以下载 [zip包](https://www.sonarqube.org/downloads/)，解压后即可运行

### 启动

```shell
# On other operating systems, as a non-root user execute:
/opt/sonarqube/bin/[OS]/sonar.sh console
# 例如在linux下
/opt/sonarquebe/bin/linux-x86-64/sonar.sh start
```
	
###  查看
	默认情况下，可以通过`localhost:9000`进行访问，默认密码为`admin:admin`
	
### 一些配置

- 配置扫描引擎的jvm大小
	修改`conf/sonar.properties`中的配置项
	```properties
	# 默认大小为512m
	sonar.ce.javaOpts=Xmx2048m -Xms512m -XX:+HeadDumpOnOutOfMemeroyError
	```





## maven集成


项目中配置

```xml
<build>

    <plugins>
      <plugin>
        <groupId>org.sonarsource.scanner.maven</groupId>
        <artifactId>sonar-maven-plugin</artifactId>
        <version>3.7.0.1746</version>
      </plugin>
    </plugins>

</build>
```

默认情况下会连接到  `localhost:9000` 的 sonarqube 服务器，可通过修改 `setting.xml` 修改sonarqube 服务器

```xml
 <profile>
            <id>sonar</id>
            <activation>
                <activeByDefault>true</activeByDefault>
            </activation>
            <properties>
                <!-- Optional URL to server. Default value is http://localhost:9000 -->
                <sonar.host.url>
                  http://myserver:9000
                </sonar.host.url>
            </properties>
</profile>
```