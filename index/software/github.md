---
tags:
  - linux
  - 软件/github
date updated: 2022-04-12 14:24
---

## action

我们可以使用github提供的action，实现自动打包 jar 包应用，以及使用github作为maven的仓库使用

1. 新建一个 maven 项目，在pom文件中添加如下

   ```xml
   <project>
   	<distributionManagement>
   		<repository>
   			<id>github</id>
   			<name>GitHub OWNER Apache Maven Packages</name>
   			<url>https://maven.pkg.github.com/leaderli/litil</url>
   		</repository>
   	</distributionManagement>
   </project>
   ```

   `leaderli` 和 `litil` 分别是 github 账号和 仓库名，也就是项目的名称，需要注意的是项目的 `artifactory` 必须是小写

2. github中的 Action中新建 `Publish Java Package with Maven`  的标准模板

   ```yml
   # This workflow will build a package using Maven and then publish it to GitHub packages when a release is created
   # For more information see: https://github.com/actions/setup-java/blob/main/docs/advanced-usage.md#apache-maven-with-a-settings-path

   name: Maven Package

   on:

   push:
   branches: [ master ] # 表示在push到master时触发action
   pull_request:
   branches: [ master ]

   jobs:
   build:

   runs-on: ubuntu-latest
   permissions:
     contents: read
     packages: write

   steps:
   - uses: actions/checkout@v3
   - name: Set up JDK 8
     uses: actions/setup-java@v3
     with:
   	java-version: '8'
   	distribution: 'temurin'
   	server-id: github # Value of the distributionManagement/repository/id field of the pom.xml
   	settings-path: ${{ github.workspace }} # location for the settings.xml file

   - name: Build with Maven
     run: mvn -B package --file pom.xml

   - name: Publish to GitHub Packages Apache Maven
     run: mvn deploy -s $GITHUB_WORKSPACE/settings.xml
     env:
   	GITHUB_TOKEN: ${{ github.token }}
   ```

3. 项目构建结束后，可以下属两个地方都可以看到构建好的 jar 包

   ![[Pasted image 20220411232737.png|400]]

   ![[Pasted image 20220411232819.png|400]]

4. 其他项目中使用该 jar 包

   maven的 `settings.xml` 配置文件中新增

   ```xml
   <servers>
   	<server>
   		<id>github</id>
   		<username>429243408@qq.com</username>
   		<password>xxx</password>
   	</server>
   </servers>
   ```

   其中password为github的 [token](https://catalyst.zoho.com/help/tutorials/githubbot/generate-access-token.html)

   同时也需要将github package的 repository 地址 添加到 repositories 中，可以作为最后一个， `maven_repository` 是 token的名字

   ```xml
   <repositories>
   	<repository>
   		<id>github</id>
   		<url>https://maven.pkg.github.com/leaderli/maven_repository</url>
   		<snapshots>
   			<enabled>true</enabled>
   		</snapshots>
   	</repository>
   </repositories>
   ```


###  delete-package-versions

 默认情况下，使用action打包jar包时，无法打包相同版本的jar，我们可以通过该 action 进行 clean 操作

```yml
# This workflow will build a package using Maven and then publish it to GitHub packages when a release is created  
# For more information see: https://github.com/actions/setup-java/blob/main/docs/advanced-usage.md#apache-maven-with-a-settings-path  
  
name: Maven Package  
  
on:  
  
  push:  
    branches: [ master ]  
  pull_request:  
    branches: [ master ]  
  
jobs:  
  
  build:  
  
    runs-on: ubuntu-latest  
    permissions:  
      contents: read  
      packages: write  
  
    steps:  
    - uses: actions/delete-package-versions@v3  
      with:  
        package-name: 'io.leaderli.litil'  # 项目package的全限定名
        ignore-versions: '^\\d+\\.\\d+\\.0$'  # 忽略的版本
        min-versions-to-keep: 0    # 设定为0，表示删除所有检测到的版本
    - uses: actions/checkout@v3  
    - name: Set up JDK 8  
      uses: actions/setup-java@v3  
      with:  
        java-version: '8'  
        distribution: 'temurin'  
        server-id: github # Value of the distributionManagement/repository/id field of the pom.xml  
        settings-path: ${{ github.workspace }} # location for the settings.xml file  
  
    - name: Build with Maven  
      run: mvn -B package --file pom.xml  
  
    - name: Publish to GitHub Packages Apache Maven  
      run: mvn deploy -s $GITHUB_WORKSPACE/settings.xml  
      env:  
        GITHUB_TOKEN: ${{ github.token }}

```
## 参考文档

[配置token](https://catalyst.zoho.com/help/tutorials/githubbot/generate-access-token.html)

[GitHub - actions/delete-package-versions](https://github.com/actions/delete-package-versions)