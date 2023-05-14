---
tags:
  - sql/mysql
date updated: 2023-05-14 13:24
---

## 安装

### mysql

使用 [[docker#mysql|docker]] 安装

centos7上安装mysql5.7步骤

```shell

# 卸载默认安装的mariadb
yum remove mariadb.x86_64


# 下载源
wget https://dev.mysql.com/get/mysql57-community-release-el7-11.noarch.rpm

# 本地安装yum源
yum localinstall mysql57-community-release-el7-11.noarch.rpm

# 搜索mysql安装包
yum search mysql

# 安装
yum install -y mysql-community-server.x86_64


# 启动
service mysqld start
service mysqld restart
service mysqld stop

# 查找默认登录密码，可能为空
cat /var/log/mysqld.log | grep password


# 输入登录密码登录
mysql -uroot -p


# 修改登录密码
use mysql;
update user set password = password('123456') where user ='root';
flush privileges;


# 开启外网访问
update user set host="%" where Host='localhost' and user = "root";
flush privileges;

# 修改后只能通过IP去方法

mysql -h 127.0.01 -u root -p
```

### mycli

使用 [[python tutorial#pip|pip]] 安装一个方便mycli，方便操作数据库

```shell
pip3 install mycli

# 登录
mycli -u root -p 123456 

```

配置文件 `~/.myclirc`

修改提示符

```diff
+prompt = '\t \u@\h:\d>
-prompt = '\t >

+key_bindings = emacs
-key_bindings = vi

```

## 常用sql语句

### 查询结果按行打印

在MySQL的sql语句后加上`\G`

```shell
mysql > explain select * from rental where rental_date='2005-05-2517:22:10' and inventory_id=373 and customer_id=343
+----+-------------+--------+------------+--------+---------------+--------+---------+--------+--------+----------+--------------------------------+
| id | select_type | table  | partitions | type   | possible_keys | key    | key_len | ref    | rows   | filtered | Extra                          |
+----+-------------+--------+------------+--------+---------------+--------+---------+--------+--------+----------+--------------------------------+
| 1  | SIMPLE      | <null> | <null>     | <null> | <null>        | <null> | <null>  | <null> | <null> | <null>   | no matching row in const table |
+----+-------------+--------+------------+--------+---------------+--------+---------+--------+--------+----------+--------------------------------+



mysql > explain select * from rental where rental_date='2005-05-2517:22:10' and inventory_id=373 and customer_id=343\G
***************************[ 1. row ]***************************
id            | 1
select_type   | SIMPLE
table         | <null>
partitions    | <null>
type          | <null>
possible_keys | <null>
key           | <null>
key_len       | <null>
ref           | <null>
rows          | <null>
filtered      | <null>
Extra         | no matching row in const table

```

### 示例

```sql
show databases;

show tables

-- 使用`group_concat`函数，可以轻松的把分组后，name 相同的数据拼接到一起，组成一个字符串，用`逗号`分隔。
select name,group_concat(code) from user  group by name;


-- INSERT ignore INTO 忽略异常，返回的执行结果影响行数为 0，它不会重复插入数据。 
-- 当brand中没有 苏三 才会插入成功
INSERT ignore INTO `brand`(`id`, `code`, `name`, `edit_date`)  VALUES (123, '108', '苏三', now(3));

-- on duplicate key update 该语法会在插入数据之前判断，如果主键或唯一索引不存在，则插入数据。如果主键或唯一索引存在，则执行更新操作。

INSERT  INTO `brand`(`id`, `code`, `name`, `edit_date`)  VALUES (123, '108', '苏三', now(3))  on duplicate key update name='苏三',edit_date=now(3);
```

### 设定字段为一个枚举

```sql
create table test (
  sex enum ("男","女")
)
```

### 表字段可以设置默认值，当未插入数据时用默认值

```sql
CREATE TABLE tb_emp1(
  id int(11) AUTO_INCREMENT,
  name VARCHAR(25),
  deptId INT(11) DEFAULT 1234,
  salary FLOAT,
  PRIMARY KEY (id)
);
```

### mysql 如何得到一条记录在所有记录的第几行

```sql
#mysql本身是没有行号的。要想得到查询语句返回的列中包含一列表示该行记录在整个结果集中的行号可以通过自定义set一个变量，然后每条记录+1的方式，返回这个变量的值。

SET @t = 0;
SELECT * FROM (SELECT (@t:=@t+1) as id,s FROM t1) AS A WHERE a.id=2 OR a.id=5;

```

### 从 dump 文件恢复数据

```sql
mysqldump -uroot -pPassword [database name] > [dump file]
```

### 执行 sql 文件

```sql
mysql -u username -p database_name < file.sql
```

### 更改编码

```sql
status;#查看编码
alter database db_name CHARACTER SET utf8;
```

```ad-tip
数据库直接操作时养成习惯不管干啥都先敲个 begin; 确认没问题了再 commit;
```

### 查看数据库信息

```sql
show variables;![[eclipse.lnk]]
show variables like 'character%';
```

## 优化相关

当前session中所有统计参数的值

```sql
show status like 'Com_%';
```

- `Com_select`：执行SELECT操作的次数，一次查询只累加1。
- `Com_insert`：执行INSERT操作的次数，对于批量插入的INSERT操作，只累加一次。
- `Com_update`：执行UPDATE操作的次数。
- `Com_delete`：执行DELETE操作的次数

### EXPLAIN , DESC

获取MySQL如何执行SELECT语句的信息，包括在SELECT语句执行过程中表如何连接和连接的顺序

![[Pasted image 20230514113229.png]]

- `select_type`：表示SELECT的类型，常见的取值有SIMPLE（简单表，即不使用表连接或者子查询）、PRIMARY（主查询，即外层的查询）、UNION（UNION中的第二个或者后面的查询语句）、SUBQUERY（子查询中的第一个SELECT）等。
- `table`：输出结果集的表。
- `type`：表示MySQL在表中找到所需行的方式，或者叫访问类型，常见类型
  - `ALL` 全表扫描，MySQL遍历全表来找到匹配的行
    ```sql
    explain select * from film where rating >9
    ```
  - `index` 索引全扫描，MySQL遍历整个索引来查询匹配的行
    ```sql
    explain select title from film
    ```
  - `range` 索引范围扫描，常见于`< <= > >= between`等操作符
    ```sql
    explain select * from payment where customer_id >= 300 and customer_id <= 350
    ```
  - `ref` 使用非唯一索引扫描或唯一索引的前缀扫描，返回匹配某个单独值的记录行
    ```sql
    explain select * from payment where customer_id =350
    ```
  - `eq_ref` 使用唯一索引扫描或唯一索引的前缀扫描，返回匹配某个单独值的记录行
    ```sql
    explain select * from film a, film_text b where a.film_id = b.film_id
    ```
  - `const/system` 单表中最多有一个匹配行，查询起来非常迅速，所以这个匹配行中的其他列的值可以被优化器在当前查询中当作常量来处理
    ```sql
    explain select * from (select * from customer where email ='AARON.SELBY@sakilacustomer.org')a
    ```
  - `NULL` MySQL不用访问表或者索引，直接就能够得到结果
    ```sql
    explain select 1 from dual where 1
    ```

### explain extended

通过 `explain extended` 加上 show warnings，我们能够看到在SQL真正被执行之前优化器做了哪些SQL改写

### explain partitions

查看SQL所访问的分区

### show profiles

通过profile，我们能够更清楚地了解SQL执行的过程。 可以通过 `select @@have_profiling;` 查看当前mysql版本是否支持。默认profiling是关闭的，可以通过set语句在Session级别开启profiling：

```shell
mysql > select @@profiling
+-------------+
| @@profiling |
+-------------+
| 0           |
+-------------+
1 row in set
mysql> set profiling=1;
```

```shell
mysql > select count(*) from payment;
+----------+
| count(*) |
+----------+
| 16044    |
+----------+
1 row in set
Time: 0.023s


mysql > show profiles

+----------+------------+----------------------------------------------+
| Query_ID | Duration   | Query                                        |
+----------+------------+----------------------------------------------+
| 1        | 0.0060235  | select count(*) from payment                 |
| 2        | 8.175e-05  | show profile cpu ,context for query 1        |
| 3        | 0.00010875 | show profile cpu ,context switch for query 1 |
| 4        | 7.825e-05  | show profile cpu ,context for query 1        |
+----------+------------+----------------------------------------------+
```

通过 `show profile for query` 语句能够看到执行过程中线程的每个状态和消耗的时间：

```shell
mysql > show profile  for query 1
+----------------------+----------+
| Status               | Duration |
+----------------------+----------+
| starting             | 0.003367 |
| checking permissions | 0.000008 |
| Opening tables       | 0.000042 |
| init                 | 0.000027 |
| System lock          | 0.000008 |
| optimizing           | 0.000003 |
| statistics           | 0.000010 |
| preparing            | 0.000020 |
| executing            | 0.000003 |
| Sending data         | 0.002454 |
| end                  | 0.000004 |
| query end            | 0.000019 |
| closing tables       | 0.000006 |
| freeing items        | 0.000029 |
| cleaning up          | 0.000025 |
+----------------------+----------+
15 rows in set
Time: 0.015s
```

> Sending data状态表示MySQL线程开始访问数据行并把结果返回给客户端，而不仅仅是返回结果给客户端。由于在Sending data状态下，MySQL线程往往需要做大量的磁盘读取操作，所以经常是整个查询中耗时最长的状态

MySQL支持进一步选择 all、cpu、block io、context switch、page faults等明细类型来查看MySQL在使用什么资源上耗费了过高的时间

```shell
mysql > show profile cpu ,block io for query 1
+----------------------+----------+----------+------------+--------------+---------------+
| Status               | Duration | CPU_user | CPU_system | Block_ops_in | Block_ops_out |
+----------------------+----------+----------+------------+--------------+---------------+
| starting             | 0.003367 | 0.000015 | 0.000121   | 0            | 0             |
| checking permissions | 0.000008 | 0.000000 | 0.000005   | 0            | 0             |
| Opening tables       | 0.000042 | 0.000005 | 0.000038   | 0            | 0             |
| init                 | 0.000027 | 0.000003 | 0.000025   | 0            | 0             |
| System lock          | 0.000008 | 0.000001 | 0.000006   | 0            | 0             |
| optimizing           | 0.000003 | 0.000000 | 0.000002   | 0            | 0             |
| statistics           | 0.000010 | 0.000001 | 0.000009   | 0            | 0             |
| preparing            | 0.000020 | 0.000002 | 0.000019   | 0            | 0             |
| executing            | 0.000003 | 0.000000 | 0.000001   | 0            | 0             |
| Sending data         | 0.002454 | 0.002456 | 0.000000   | 0            | 0             |
| end                  | 0.000004 | 0.000003 | 0.000000   | 0            | 0             |
| query end            | 0.000019 | 0.000019 | 0.000000   | 0            | 0             |
| closing tables       | 0.000006 | 0.000006 | 0.000000   | 0            | 0             |
| freeing items        | 0.000029 | 0.000029 | 0.000000   | 0            | 0             |
| cleaning up          | 0.000025 | 0.000025 | 0.000000   | 0            | 0             |
+----------------------+----------+----------+------------+--------------+---------------+

```

### trace

了对SQL的跟踪 trace，通过 trace文件能够进一步了解为什么优化器选择A执行计划而不选择B执行计划，帮助我们更好地理解优化器的行为

打开

```shell
mysql> SET OPTIMIZER_TRACE="enabled=on",END_MARKERS_IN_JSON=on;
Query OK, 0 rows affected (0.03 sec)
mysql> SET OPTIMIZER_TRACE_MAX_MEM_SIZE=1000000;
Query OK, 0 rows affected (0.00 sec)
```

执行sql

```shell
mysql> select rental_id from rental where 1=1 and rental_date >='2005-05-25 04:00:00' and rental_date <= '2005-05-25 05:00:00' and inventory_id=4466;
+-----------+
| rental_id |
+-----------+
| 39 |
+-----------+
```

查看trace文件

```shell
mysql > SELECT * FROM INFORMATION_SCHEMA.OPTIMIZER_TRACE
```

### analyze

本语句用于分析和存储表的关键字分布，分析的结果将可以使得系统得到准确的统计信息，使得SQL能够生成正确的执行计划

### check

检查表的作用是检查一个或多个表是否有错误。CHECK TABLE对MyISAM和 InnoDB表有作用。对于MyISAM表，关键字统计数据被更新

### optimize

这个命令可以将表中的空间碎片进行合并，并且可以消除由于删除或者更新造成的空间浪费，但OPTIMIZE TABLE命令只对MyISAM、BDB和 InnoDB表起作用。

## 索引

索引是在MySQL的存储引擎层中实现的

- `B-Tree`索引：最常见的索引类型，大部分引擎都支持B树索引。
- `HASH`索引：只有Memory引擎支持，使用场景简单 。Hash索引适用于Key-Value查询，Hash索引不适用范围查询，例如`<、>、<=、>=`这类操作。
- `R-Tree`索引（空间索引）：空间索引是MyISAM的一个特殊索引类型，主要用于地理空间数据类型，通常使用较少，不做特别介绍。
- `Full-text`（全文索引）：全文索引也是 MyISAM 的一个特殊索引类型，主要用于全文索引，InnoDB从MySQL 5.6版本开始提供对全文索引的支持

MySQL目前不支持函数索引，但是能对列的前面某一部分进行索引，例如标题title字段，可以只取title的前10个字符进行索引，这个特性可以大大缩小索引文件的大小，但前缀索引也有缺点，在排序Order By和分组Group By操作的时候无法使用。

B-Tree索引是最常见的索引，构造类似二叉树，能根据键值提供一行或者一个行集的快速访问，通常只需要很少的读操作就可以找到正确的行。不过，需要注意B-Tree索引中的B 不代表二叉树（binary），而是代表平衡树（balanced）。B-Tree索引并不是一棵二叉树

![[Pasted image 20230514123154.png]]

### 使用索引的常见场景

#### 匹配全值（Match the full value）

对索引中所有列都指定具体值，即是对索引中的所有列都有等值匹配的条件

```shell
mysql > explain  select * from rental where rental_date='2005-05-25 17:22:10' and inventory_id=373 and customer_id=343\G
***************************[ 1. row ]***************************
id            | 1
select_type   | SIMPLE
table         | rental
partitions    | <null>
type          | const
possible_keys | rental_date,idx_fk_inventory_id,idx_fk_customer_id
key           | rental_date
key_len       | 10
ref           | const,const,const
rows          | 1
filtered      | 100.0
Extra         | <null>

1 row in set
Time: 0.002s

```

#### 匹配值的范围查询（Match a range of values）

对索引的值能够进行范围查找

```shell
mysql > explain select * from rental where customer_id >= 373 and customer_id < 400\G
***************************[ 1. row ]***************************
id            | 1
select_type   | SIMPLE
table         | rental
partitions    | <null>
type          | range
possible_keys | idx_fk_customer_id
key           | idx_fk_customer_id
key_len       | 2
ref           | <null>
rows          | 718
filtered      | 100.0
Extra         | Using index condition

1 row in set
Time: 0.003s

```

#### 匹配最左前缀（Match a leftmost prefix）

仅仅使用索引中的最左边列进行查找。例如索引 `idx_payment_date ('payment_date','amount','last_update')`，在使用非最左列时索引不生效

```shell
mysql > explain select * from payment where payment_date = '2006-02-14 15:16:03'and last_update='2006-02-15 22:12:32'\G
***************************[ 1. row ]***************************
id            | 1
select_type   | SIMPLE
table         | payment
partitions    | <null>
type          | ref
possible_keys | idx_payment_date
key           | idx_payment_date
key_len       | 5
ref           | const
rows          | 182
Extra         | Using index condition
```

```shell
mysql > explain select * from payment where amount = 4.99\G
***************************[ 1. row ]***************************
id            | 1
select_type   | SIMPLE
table         | payment
partitions    | <null>
type          | ALL
possible_keys | <null>
key           | <null>
key_len       | <null>
ref           | <null>
rows          | 16086
filtered      | 10.0
Extra         | Using where

```

#### 仅仅对索引进行查询（Index only query）

当查询的列都在索引的字段中时，查询的效率更高

```shell
mysql > explain select last_update from payment where payment_date= '2006-02-14 15:16:03' and amount = 3.98\G
***************************[ 1. row ]***************************
id            | 1
select_type   | SIMPLE
table         | payment
partitions    | <null>
type          | ref
possible_keys | idx_payment_date
key           | idx_payment_date
key_len       | 8
ref           | const,const
rows          | 8
filtered      | 100.0
Extra         | Using index
```

Extra部分变成了Using index，也就意味着，现在直接访问索引就足够获取到所需要的数据，不需要通过索引回表，Using index也就是平常说的覆盖索引扫描。只访问必须访问的数据，在一般情况下，减少不必要的数据访问能够提升效率。

#### 匹配列前缀（Match a column prefix）

仅仅使用索引中的第一列，并且只包含索引第一列的开头一部分进行查找

#### 能够实现索引匹配部分精确而其他部分进行范围匹配（Match one part exactly and match a range on another part）

```shell
mysql > explain select inventory_id from rental where rental_date='2006-02-14 15:16:03' and customer_id >= 300 and customer_id <= 400\G
***************************[ 1. row ]***************************
id            | 1
select_type   | SIMPLE
table         | rental
partitions    | <null>
type          | ref
possible_keys | rental_date,idx_fk_customer_id
key           | rental_date
key_len       | 5
ref           | const
rows          | 182
filtered      | 16.86
Extra         | Using where; Using index

1 row in set
Time: 0.005s
```

#### 其他

- 如果列名是索引，那么使用 column_name is null就会使用索引（区别于Oracle）
- MySQL 5.6引入了 Index Condition Pushdown（ICP）的特性，进一步优化了查询。Pushdown表示操作下放，某些情况下的条件过滤操作下放到存储引擎

### 索引失效

- 以%开头的LIKE查询不能够利用B-Tree索引，执行计划中key的值为NULL表示没有使用索引
- 数据类型出现隐式转换的时候也不会使用索引，特别是当列类型是字符串，那么一定记得在 where 条件中把字符常量值用引号引起来，否则即便这个列上有索引，MySQL 也不会用到
- 复合索引的情况下，假如查询条件不包含索引列最左边部分，即不满足最左原则Leftmost，是不会使用复合索引的
- 如果 MySQL 估计使用索引比全表扫描更慢，则不使用索引。例如，查询以“S”开头的标题的电影，需要返回的记录比例较大，MySQL就预估索引扫描还不如全表扫描更快

### 查看索引使用情况

如果索引正在工作，Handler_read_key 的值将很高，这个值代表了一个行被索引值读的次数，很低的值表明增加索引得到的性能改善不高，因为索引并不经常使用。Handler_read_rnd_next的值高则意味着查询运行低效，并且应该建立索引补救。这个值的含义是在数据文件中读下一行的请求数。如果正进行大量的表扫描，Handler_read_rnd_next的值较高，则通常说明表索引不正确或写入的查询没有利用索引，具体如下。

```shell
mysql >  show status like 'Handler_read%';
+-----------------------+-------+
| Variable_name         | Value |
+-----------------------+-------+
| Handler_read_first    | 2     |
| Handler_read_key      | 14    |
| Handler_read_last     | 0     |
| Handler_read_next     | 28    |
| Handler_read_prev     | 0     |
| Handler_read_rnd      | 0     |
| Handler_read_rnd_next | 32091 |
+-----------------------+-------+
7 rows in set
Time: 0.026s
```

## 常用函数

```sql
-- 字段长度
select length(job) from emp;

-- 截取字符串 字段 起始位(第一位是1) 长度(默认为最大)
select substring(job,1,3) from emp;

-- 查找A在在某个字符串中的位置
select locate('A', "1A")


```

## 常见问题

> fatal error: Please read "Security" section of the manual to find out how to run mysqld as root!

[参考](https://www.cnblogs.com/xushuyi/articles/9082512.html)

不建议使用root用户来操作，而应该使用mysql用户，可通过mysqld --user=root 指定用户来强制执行

> Access denied for user 'root'@'localhost' (using password: YES)

[参考](https://stackoverflow.com/questions/10299148/mysql-error-1045-28000-access-denied-for-user-billlocalhost-using-passw)

## 参考文档

[MySQL 表分区？涨知识了！ - 腾讯云开发者社区-腾讯云](https://cloud.tencent.com/developer/article/1963167)
