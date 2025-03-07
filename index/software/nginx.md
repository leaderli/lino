---
tags:
  - 软件/nginx
date updated: 2022-11-16 23:35
---

## 安装

基于 centos

安装依赖工具
` sudo yum install -y yum-utils  `

配置 yum 的源
新建文件`/etc/yum.repos.d/nginx.repo`，并写入以下内容

```properties
[nginx-stable]
name=nginx stable repo
baseurl=http://nginx.org/packages/centos/$releasever/$basearch/
gpgcheck=1
enabled=1
gpgkey=https://nginx.org/keys/nginx_signing.key
module_hotfixes=true

[nginx-mainline]
name=nginx mainline repo
baseurl=http://nginx.org/packages/mainline/centos/$releasever/$basearch/
gpgcheck=1
enabled=0
gpgkey=https://nginx.org/keys/nginx_signing.key
module_hotfixes=true
```

若需要安装最新版，而非调试版本
`sudo yum-config-manager --enable nginx-mainline`

安装 nginx
`sudo yum install nginx`

离线安装

```shell
$ wget https://nginx.org/download/nginx-1.12.2.tar.gz
$ tar xvzf nginx-1.12.2.tar.gz
$ cd ~/nginx-1.12.2

$ useradd nginx
$ usermod -s /sbin/nologin nginx
$ ./configure --user=nginx --group=nginx

$ make
$ make install
```



## 启动

nginx 有一个 master 线程和多个 worker 进程，master 进程用来读取，解析配置文件以及管理 worker 进程，worker 进程才是真正处理请求的进程。worker 进程的个数可通过配置文件去配置或自动设置为 cpu 的核心数。可通过修改配置设定

```nginx
worker_processes 1;
```

使用`nginx`即可启动,一旦 nginx 启动，就可以使用如下命令去控制 nginx

```shell
nginx -s signal

nginx -t # 测试配置文件是否正确
```

- stop — fast shutdown
- quit — graceful shutdown
- reload — reloading the configuration file
- reopen — reopening the log files

当更改配置文件后，可以使用`nginx -s reload`，使配置文件生效。
当 master 进程接收到 reload 的信号后，它首先会校验配置文件语法是否正确然后才会接收新的配置文件，若配置文件修改成功，master 进程会启动新的 worker 进程，并向旧的 worker 进程发送停止命令，旧的 worker 进程会以旧的配置处理请求，在处理完旧的请求后便会退出。

配置开机启动

`vi /usr/lib/systemd/system/nginx.service`

```bash
[Unit]
Description=nginx - high performance web server
Documentation=https://nginx.org/en/docs/
After=network-online.target remote-fs.target nss-lookup.target
Wants=network-online.target

[Service]
Type=forking
PIDFile=/var/run/nginx.pid
ExecStartPre=/usr/sbin/nginx -t -c /etc/nginx/nginx.conf
ExecStart=/usr/sbin/nginx -c /etc/nginx/nginx.conf
ExecReload=/bin/kill -s HUP $MAINPID
ExecStop=/bin/kill -s TERM $MAINPID

[Install]
WantedBy=multi-user.target
```

## 配置

### 可用变量

[官方文档可用变量](http://nginx.org/en/docs/http/ngx_http_core_module.html#variables)

常用变量

- `$arg_<name>` url 请求请求参数 name 的值
- `$query_string` url 整个请求参数字符串，即`?`后面的参数,例如:`a=1&b=2`
- `$upstream_http_<header>` 返回报文的头,header 请求头的名称
- `$http_<header>` 请求报文的头,header 请求头的名称

### 配置文件结构

nginx 的配置文件名为 nginx.conf,，nginx 的组件由配置文件中的指令构成，指令的基本格式有两种

1. 简单的命令：由 name 和 parameters 以及`；`结尾
2. 块命令： 由 name 和一个由大括号 `{}包裹的命令的集合，同时也被称为 context
3. `#` 后面的视为注释
4. 不在任何 context 内的命令则被视为在 [main context](http://nginx.org/en/docs/ngx_core_module.html)中

#### 配置文件路径

一般位于目录

1. /usr/local/nginx/conf
2. /etc/nginx
3. /usr/local/etc/nginx
4. 通过 [[ps]] 命令 查询 nginx 启动时指定的配置文件目录

## 监听请求

我们通过配置 [server](http://nginx.org/en/docs/http/ngx_http_core_module.html#server)来处理请求

例如：

```nginx
server {
    listen      80;
    server_name example.org www.example.org;
    ...
}

server {
    listen      80;
    server_name example.net www.example.net;
    ...
}

server {
    listen      80;
    server_name example.com www.example.com;
    ...
}
```

其中 `port` 表示监听的端口号，`server_name` 表示监听的 `host`（即 IP 地址或域名地址），server_name 与 host 匹配的优先级关系如下

1. 完全匹配

2. 通配符在前的，如 `*.test.com`

3. 在后的，如 `www.test.*`

4. 正则匹配，如 `~^www.test.com$`

如果都不匹配

1. 优先选择 listen 配置项后有 default 或 default_server 的
2. 找到匹配 listen 端口的第一个 server 块

可以通过 [[curl]]  进行测试

## 处理请求

在 [server](http://nginx.org/en/docs/http/ngx_http_core_module.html#server) 下配置 [location](http://nginx.org/en/docs/http/ngx_http_core_module.html#location)，匹配优先级如下

1. `location = /uri` 　　　`=` 开头表示精确匹配，只有完全匹配上才能生效。

2. `location ^~ /uri` 　　`^~`  开头对 URL 路径进行前缀匹配，并且在正则之前。

3. `location ~ pattern` 　`~`  开头表示区分大小写的正则匹配。

4. `location ~* pattern` 　`~*` 开头表示不区分大小写的正则匹配。

5. `location /uri` 　　　　不带任何修饰符，也表示前缀匹配，但是在正则匹配之后。

6. `location /` 　　　　　通用匹配，任何未匹配到其它 location 的请求都会匹配到，相当于 switch 中的 default。

示例

```nginx
server {
    listen 10005;
    server_name  test_location

    location = / {
        return 701;
    }

    location ^~ /123 {
        return 702;
    }
    location ~ /\d {
        return 703;
    }
    location /456 {
        return 704;
    }
    location / {
        return 705;
    }
}



$ curl -i localhost:10005
HTTP/1.1 701 


$ curl -i localhost:10005/123
HTTP/1.1 702 


$ curl -i localhost:10005/4566
HTTP/1.1 703 

$ curl -i localhost:10005/aaa
HTTP/1.1 705 
Server: nginx/1.20.2



```

### 映射静态资源

root 指向静态资源的路径
index 默认首页

```nginx
server {
   listen 8888;
   server_name "test";
   location ~ \.(gif)$ {
         root /home/li/tomcat/webapps/manager;
         index index.html;
   }
}
```

### 代理转发

```nginx
server {
   listen 18080;
   location /api {
	  rewrite /api/(.*) /$1  break;
      proxy_pass http://localhost:12345;
   }
}
```

通过 `rewite` 将请求 `localhost:18080/api/xxx` 的请求转发到 `localhost:12345/xxx` 上

### map转发

根据参数分发到固定的ip和端口上


```nginx
# arg_node 中的 node是实际请求的url上的参数的key，例如 http://ip:8081/aaa?node=1281
# my_uri 是变量
map $arg_node $my_uri{
	default  127.0.0.1:8081 # default必须有，端口必须有
	1281     127.0.0.1:8081
	1282     127.0.0.1:8082
	1382     127.0.0.2:8081
	1382     127.0.0.2:8082
}

server {
	listen 8000
	server_name test
	location /test {
		rewrite ^/test(.*)$ $1 break
		proxy_pass http://$my_uri
	}
}
```

### 增加请求头

配置，这样在服务器端的 headers 中就可以看到名为 name 的指定 header，需要注意的是，当值为空时，nginx 不会发送该请求头

```nginx
server {
   listen 18080;
   location / {
      proxy_pass http://f5;
      proxy_set_header name $arg_name;

   }
}
```

#### 保留原始请求地址

nginx代理无法获取真实ip地址

```nginx
server {
   listen 18080;
   location / {
      proxy_pass http://f5;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
   }
}
```
## 负载均衡

### 测试用脚本

一个测试用的 http 服务端程序

```python
# --coding:utf-8--

from http.server import BaseHTTPRequestHandler, HTTPServer
from os import path
import sys
from urllib.parse import urlparse

port = 8083
class Handler(BaseHTTPRequestHandler):

    def do_GET(self):
        global port
        self.send_response(200)
        self.send_header('Content-type', 'text/plain')
        self.send_header('port', port)
        self.end_headers()
        self.wfile.write(b'')
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

启动多个 http 服务的 shell 脚本

```shell
start(){
 echo 'start'$1
 python http_nginx.py  $1 >> nginx.log  2>&1 &
 echo "kill -9 $! # $1" >> nginx.pid
}
stop(){
echo 'stop'
ps -ef|grep http_nginx|grep -v grep|grep -v start|awk '{print "kill -
9 "$2}'|sh
}

stop
touch nginx.log
touch nginx.pid
:>nginx.log
:>nginx.pid

args=$@
if [ ! -n "$args" ] ;then
  args='18081 18082 18083'
fi
for arg in $args
do
  start $arg &
done

tail -f nginx.log

```

### 负载均衡与 session 保持

```nginx
upstream f5 {

   hash $arg_a;
   server localhost:18081;
   server localhost:18082;
   server localhost:18083;
}
server {
   listen 18080;
   location / {
      proxy_pass http://f5;

      }
}

```

使用测试脚本不断访问

```shell
while [ 1 ]
do
curl localhost:18080/hello?a='123456&b=abc'
sleep 1
done
```

通过观察 http 服务端的日志输出，我们可以发现所有请求都指向了同一个服务器

当请求 url 不带参数`a`时，可以观察到所有请求均衡的分配在每台服务器上

```log
18082 f5 /hello
18081 f5 /hello?a=123456&b=abc
18083 f5 /hello
18081 f5 /hello?a=123456&b=abc
18081 f5 /hello
18082 f5 /hello
18081 f5 /hello?a=123456&b=abc
18083 f5 /hello
18081 f5 /hello?a=123456&b=abc
```

**_当负载服务器停止服务时，nginx 会自动重新计算 hash_**

如果使用`tenginx` 可以基于cookie设置session保持

[ngx_http_upstream_session_sticky_module - The Tengine Web Server](https://tengine.taobao.org/document_cn/http_upstream_session_sticky_cn.html)

```nginx
# 默认配置：cookie=route mode=insert fallback=on  
upstream foo {  
    server 192.168.0.1;  
    server 192.168.0.2;  
    session_sticky;  
}  
  
server {  
    location / {  
        proxy_pass http://foo;  
    }  
}
```

```nginx
#insert + indirect模式：  
upstream test {  
    session_sticky cookie=uid domain=www.xxx.com fallback=on path=/ mode=insert option=indirect;  
    server  127.0.0.1:8080;  
}  
  
server {  
    location / {  
        #在insert + indirect模式或者prefix模式下需要配置session_sticky_hide_cookie  
        #这种模式不会将保持会话使用的cookie传给后端服务，让保持会话的cookie对后端透明  
        session_sticky_hide_cookie upstream=test;  
        proxy_pass http://test;  
    }  
}
```
## 日志

我们可配置`http|log_format`来控制 nginx 的 access_log 日志的输出内容,你可以打印所有 nginx 中有关的 [[#可用变量]]

```nginx
http {
    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" ' '$status $body_bytes_sent "$http_referer" ''"$http_user_agent" "$http_x_forwarded_for"';
    access_log  /var/log/nginx/access.log  main;
}
```

## 禁用浏览器缓存

通过添加返回头

```nginx
server {
    listen      80;
    server_name example.org www.example.org;

    # 设置禁用浏览器缓存
    add_header Cache-Control no-cache;
    ...
}
```

## 常见问题

### 403 Forbidden

修改user

```nginx
user  root;
```

或者是SELinux的缘故，禁止nginx访问static文件，通过下述配置开启即可。

```shell
# 查看SELinux是否开启
/usr/sbin/sestatus -v  |grep SE

sudo setsebool -P httpd_can_network_connect on 

chcon -Rt httpd_sys_content_t /path/to/www
```

```ad-info
修改
/etc/selinux/config
将SELINUX=enforcing改为
SELINUX=disabled
需要重启
```

### Permission denied

> nginx: [emerg] open() "/var/run/nginx.pid" failed (13: Permission denied)

将`nginx.conf`中的

```conf
pid  /var/run/nginx/nginx.pid
```

并将

```shell
chown nginx:nginx /var/run/nginx
```

若是使用systemctl启动，则同时需要修改`/usr/lib/systemd/system/nginx.service`

```shell
PIDFile=/var/run/nginx/nginx.pid
```

### 无法访问虚拟机端口

将防火墙打开

```shell
iptables -I INPUT -p tcp --dport 80 -j ACCEPT  
```
