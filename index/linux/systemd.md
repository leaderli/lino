---
aliases: 开机执行
tags:
  - linux/systemd
date updated: 2022-04-07 11:18
---


新建配置文件`/lib/systemd/system/json_server.service`

```shell
[Unit]
Description=json_server
Documentation=json_server 
After=network.target

[Service]
PIDFile=/home/li/app/li-nav/json_server.pid
ExecStart=/home/li/app/li-nav/start_json_server.sh
ExecReload=/bin/kill -s HUP $MAINPID
ExecStop=/bin/kill -s TERM $MAINPID

User=li

[Install]
WantedBy=multi-user.target
```

-  `After=network.target`   表示在网络可连接后执行

```shell
systemctl daemon-reload
systemctl enable json_server
systemctl start json_server
```

