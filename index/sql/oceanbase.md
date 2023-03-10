---
tags:
  - sql/ob
  - sql/oceanbase
date updated: 2022-03-28 15:05
---


## 基础概念

### 表格组
OceanBase 数据库通过引入表格组（table group）来尽可能地减少分布式事务。表格组用于聚集经常一起访问的多张表格。例如，有用户基本信息表（user）和用户商品表（user_item），这两张表格都按照用户编号哈希分布，只需要将二者设置为相同的表格组，系统后台就会自动将同一个用户所在的 user 表分区和 user_item 表分区调度到同一台服务器。这样，即使操作某个用户的多张表格，也不会产生跨机事务。


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


### 查询副本信息

```sql
# locality
select * from  oceanbase.gv$table

select * from  oceanbase.gv$partition
```


## 弱读

从只读副本上执行查询操作

```sql
dbc.url=jdbc:oceanbase:oracle://xxx.xxx.xxx.xxx:2883/dbName?sessionVariables=ob_read_consistency=WEAK  


select /*+read_consistency(weak)*/ * from test where c1=1;

```
## 注意事项


针对分区键做UPDATE时，理论上记录有可能从一个区分移动到另外一个分区，如果系统检测到update操作会导致分区移动，则会禁止这种更新


## 参考文档

[分区](https://www.oceanbase.com/docs/enterprise-oceanbase-database-cn-10000000000358784)