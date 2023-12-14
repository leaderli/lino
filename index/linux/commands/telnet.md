---
tags:
  - linux/commands/telnet
  - socket
date updated: 2022-04-10 12:28
---

使用telent可以去测试对应服务器IP和端口是否可以访问

```shell
# 安装
yum -y install telnet
```

`telnet [hostname/ipaddress] [port number]`


例如

```shell
telnet 127.0.0.1 22
Trying 127.0.0.1...
Connected to 127.0.0.1.
Escape character is '^]'.
```

使用`QUIT`命令退出telnet


redis中使用telnet来交互


```shell
telnet 127.0.0.1 6379
Trying 127.0.0.1...
Connected to 127.0.0.1.
Escape character is '^]'.

# 输入密码
AUTH  xxx 
+OK

# 下面就可以执行redis的命令了 
KEYS * 
*1
$1
k1

GET k1
$1
v1
```


java中可以通过模拟发送 `ping` 消息来测试

```java
package com.leaderli.litest;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.Socket;

public class TestTelnet {

        public static void main(String[] args) throws IOException {

            Socket pingSocket = null;
            PrintWriter out = null;
            BufferedReader in = null;

            try {
                pingSocket = new Socket("192.168.111.129", 22);
                out = new PrintWriter(pingSocket.getOutputStream(), true);
                in = new BufferedReader(new InputStreamReader(pingSocket.getInputStream()));
            } catch (IOException e) {
                e.printStackTrace();
                return;
            }

            out.println("ping");
            System.out.println(in.readLine());
            out.close();
            in.close();
            pingSocket.close();
        }
}
```
