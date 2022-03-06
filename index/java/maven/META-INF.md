---
aliases: META-INF
---

jar包指定 `META-INF`的内容

![[Pasted image 20210920003543.png]]

使用标准的目录结构，通过命令 `mvn clean package` 打包后，可以将 
 `resources` 目录下的 `META-INF` 文件夹合并到生成的jar的 `META-INF` 目录下

![[Pasted image 20210920003718.png]]