---
tags:
  - sql/ob
  - sql/oceanbase
date updated: 2022-03-28 15:05
---


## java
```yml
url: jdbc:oceanbase://ip:端口/scheme名 
username: 用户名@租户名#集群名
password: 密码
driver-class-name: com.alipay.oceanbase.jdbc.Driver
```

## 常用sql

### 查询版本号

```sql
show variables like 'version';
```


## 弱读

从只读副本上执行查询操作

```sql
dbc.url=jdbc:oceanbase:oracle://xxx.xxx.xxx.xxx:2883/dbName?sessionVariables=ob_read_consistency=WEAK  


Select /*+read_consistency(weak)*/ * from test where c1=1;

```
## 注意事项


针对分区键做UPDATE时，理论上记录有可能从一个区分移动到另外一个分区，如果系统检测到update操作会导致分区移动，则会禁止这种更新