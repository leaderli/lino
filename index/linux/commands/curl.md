---
tags:
  - linux/commands/curl
date updated: 2022-05-06 15:06
---

参数

- `-X` 请求方法 `-X POST`
- `-d` 请求报文 `-d '{"name":"li"}'`
- `-H` 请求头 `-H "Content-type:application/json"`
- `-m` 设置最大处理的时间（秒钟），超时则直接结束
- `-v` 显示请求的详细信息
- `-i` 显示返回报文详细信息

### 示例

```nginx
 server {
           listen 10005;
           server_name "test_location";
           location = / {
                        return 701;
           }
           location / {
                        return 702;
           }
        }

```

```shell

$ curl -v localhost:10005
* About to connect() to localhost port 10005 (#0)
*   Trying ::1...
* Connection refused
*   Trying 127.0.0.1...
* Connected to localhost (127.0.0.1) port 10005 (#0)
> GET / HTTP/1.1
> User-Agent: curl/7.29.0
> Host: localhost:10005
> Accept: */*
> 
< HTTP/1.1 701 
< Server: nginx/1.20.2
< Date: Wed, 04 May 2022 01:47:48 GMT
< Content-Length: 0
< Connection: keep-alive
< 
* Connection #0 to host localhost left intact

$ curl -i localhost:10005
HTTP/1.1 701 
Server: nginx/1.20.2
Date: Wed, 04 May 2022 01:52:35 GMT
Content-Length: 0
Connection: keep-alive


```

### 重定向

当使用`curl`或者在 java 中请求一个远程接口时，当服务器将请求转发即`redirect`时，将无法得到返回报文。
服务器的返回头中，会有 redirect 的目标地址。
若使用 curl，我们可以使用`curl -iL --max-redirs 1 http://example.com`,将返回头打印出来

```shell
HTTP/1.1 301 Moved Permanently
Date: Thu, 18 Apr 2019 02:39:59 GMT
Transfer-Encoding: chunked
Connection: keep-alive
Location: https://example.com/about
```

返回头中的`Location`，即重定向的地址。我们再次请求重定向的地址，即可得到想要的结果

### 获取 http 返回码

```shell
response=$(curl --write-out %{http_code} --silent --output /dev/null servername)
echo $response

```

### 超时

```python
# --coding:utf-8--
# python3
from http.server import BaseHTTPRequestHandler, HTTPServer
from os import path
import sys
import time
from urllib.parse import urlparse

port = 8083
class Handler(BaseHTTPRequestHandler):

    def do_GET(self):
        global port
        print('begin sleep')
        time.sleep(10)
        print('wake up')
        self.send_response(200)
        self.send_header('Content-type', 'text/plain')
        self.send_header('port', port)
        self.end_headers()
        self.wfile.write(b'fuck\r\n')
        print(port,self.headers.get('Host'), self.path,flush=True)

    def do_POST(self):
        self.do_Get()


def run():
    if len(sys.argv) > 1:
        global port
        port = int(sys.argv[1])
        print('port',port)
    server_address = ('', port)
    httpd = HTTPServer(server_address, Handler)
    print('running server...', port)
    httpd.serve_forever()


if __name__ == '__main__':
    run()
```

使用超时参数请求

```shell
$ curl localhost:8083 -m 5
curl: (28) Operation timed out after 5002 milliseconds with 0 out of -1 bytes received

```
