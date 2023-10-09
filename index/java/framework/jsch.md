---
date created: 2022-03-22 17:22
aliases: jsch
tags:
  - java/框架/jsch
date updated: 2022-03-28 14:59
---


```xml
<dependencies>
    <dependency>
        <groupId>com.jcraft</groupId>
        <artifactId>jsch</artifactId>
        <version>0.1.55</version>
    </dependency>
</dependencies>
```


同时读取标准错误和标准输出，需要注意的是先获取两个流，然后在进行读取



```java
JSch jsch = new JSch();
Session session = jsch.getSession(username, host, port);
session.setPassword(password);
session.setConfig("StrictHostKeyChecking", "no");
session.connect();


ChannelExec channelExec = (ChannelExec) session.openChannel("exec");
channelExec.setCommand(command);
channelExec.connect();

InputStream in = channelExec.getInputStream(); // 获取标准输出流
InputStream err = channelExec.getErrStream(); // 获取错误输出流

// 读取标准输出
BufferedReader reader = new BufferedReader(new InputStreamReader(in));
String line;
while ((line = reader.readLine()) != null) {
    System.out.println("标准输出: " + line);
}
reader.close();

// 读取错误输出
BufferedReader errReader = new BufferedReader(new InputStreamReader(err));
while ((line = errReader.readLine()) != null) {
    System.out.println("错误输出: " + line);
}
errReader.close();
```
