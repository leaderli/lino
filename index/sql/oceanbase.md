---
tags:
  - sql/ob
  - sql/oceanbase
date updated: 2022-03-28 15:05
---


```yml
url: jdbc:oceanbase://ip:端口/scheme名 
username: 用户名@租户名#集群名
password: 密码
driver-class-name: com.alipay.oceanbase.jdbc.Driver
```


## 注意事项


针对分区键做UPDATE时，理论上记录有可能从一个区分移动到另外一个分区，如果系统检测到update操作会导致分区移动，则会禁止这种更新