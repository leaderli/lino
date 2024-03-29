---
tags:
  - sql/db2
date updated: 2022-03-28 15:05
---

### 导出表结构

```shell
#该语句会导出所有表结构
db2look -d <db> -e -a -x -i <username> -w <password> -o <file>

#导出指定表结构
db2look -d <db> -e -t <table> -o  <file>

```

```sql
#重设自动自动起始值
alter table <table> alter column <column> restart with <num>
```

### 执行 sql 文件

```shell
    db2 –tvf script1.sql –z script1.log  #需转化为unix格式文本
```

在上面的命令中，

- `-t` 表示语句使用默认的语句终结符——分号；
- `-v` 表示使用冗长模式，这样 DB2 会显示每一条正在执行命令的信息；
- `-f` 表示其后就是脚本文件；
- `-z` 表示其后的信息记录文件用于记录屏幕的输出，方便以后的分析（这是可选的，但我们建议使用该选项）。

当使用了-t 选项而没有标明语句终结符，则分号（；）会默认为语句的终结符。有时可能会出现使用另外的终结符的情况，例如用 SQL PL 编写的的脚本使用其它的符号而不是默认的分号，因为分号在 SQL PL 是用于定义数据库对象过程中的语句结束。

### 常用sql语句

```sql
select * from sysibm.systables where owner = 'SCHEMA' and name like '%CUR%' and type = 'T';
```


#### 查询数据库编码

```shell
db2 get db cfg for app_db|grep 'Database code set'|awk '{print $5}'

```
#### 查询表的表空间

```sql
SELECT * FROM SYSCAT.DATAPARTITIONS WHERE TABSCHEMA = ? AND TABNAME = ? ORDER BY SEQNO
```

#### 查询表的占用大小

```sql
SELECT SUBSTR(TABSCHEMA,1,18) TABSCHEMA,SUBSTR(TABNAME,1,30) TABNAME,
(DATA_OBJECT_P_SIZE + INDEX_OBJECT_P_SIZE + LONG_OBJECT_P_SIZE + LOB_OBJECT_P_SIZE + XML_OBJECT_P_SIZE) AS TOTAL_SIZE_IN_KB,
(DATA_OBJECT_P_SIZE + INDEX_OBJECT_P_SIZE + LONG_OBJECT_P_SIZE + LOB_OBJECT_P_SIZE + XML_OBJECT_P_SIZE)/1024 AS TOTAL_SIZE_IN_MB,
(DATA_OBJECT_P_SIZE + INDEX_OBJECT_P_SIZE + LONG_OBJECT_P_SIZE + LOB_OBJECT_P_SIZE + XML_OBJECT_P_SIZE) / (1024*1024) AS TOTAL_SIZE_IN_GB 
FROM SYSIBMADM.ADMINTABINFO WHERE TABSCHEMA NOT LIKE 'SYS%';
```