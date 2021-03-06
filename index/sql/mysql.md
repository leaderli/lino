---
tags:
  - sql/mysql
date updated: 2022-04-13 11:09
---

## 安装

使用 [[docker#mysql|docker]] 安装

使用 [[python tutorial#pip|pip]] 安装一个方便mycli，方便操作数据库

```shell
pip3 install mycli

# 登录
mycli -u root -p 123456 

```

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

## 常用sql语句

```sql
show databases;

show tables
```

## 设定字段为一个枚举

```sql
create table test (
  sex enum ("男","女")
)
```

## 表字段可以设置默认值，当未插入数据时用默认值

```sql
CREATE TABLE tb_emp1(
  id int(11) AUTO_INCREMENT,
  name VARCHAR(25),
  deptId INT(11) DEFAULT 1234,
  salary FLOAT,
  PRIMARY KEY (id)
);
```

## mysql 如何得到一条记录在所有记录的第几行

```sql
#mysql本身是没有行号的。要想得到查询语句返回的列中包含一列表示该行记录在整个结果集中的行号可以通过自定义set一个变量，然后每条记录+1的方式，返回这个变量的值。

SET @t = 0;
SELECT * FROM (SELECT (@t:=@t+1) as id,s FROM t1) AS A WHERE a.id=2 OR a.id=5;

```

## 从 dump 文件恢复数据

```sql
mysqldump -uroot -pPassword [database name] > [dump file]
```

## 执行 sql 文件

```sql
mysql -u username -p database_name < file.sql
```

## 更改编码

```sql
status;#查看编码
alter database db_name CHARACTER SET utf8;
```

```ad-tip
数据库直接操作时养成习惯不管干啥都先敲个 begin; 确认没问题了再 commit;
```

## 查看数据库信息

```sql
show variables;![[eclipse.lnk]]
show variables like 'character%';
```

## 常用函数

```sql
-- 字段长度
select length(job) from emp;

-- 截取字符串 字段 起始位(第一位是1) 长度(默认为最大)
select substring(job,1,3) from emp;


```

## 常见问题

> fatal error: Please read "Security" section of the manual to find out how to run mysqld as root!

[参考](https://www.cnblogs.com/xushuyi/articles/9082512.html)

不建议使用root用户来操作，而应该使用mysql用户，可通过mysqld --user=root 指定用户来强制执行

> Access denied for user 'root'@'localhost' (using password: YES)

[参考](https://stackoverflow.com/questions/10299148/mysql-error-1045-28000-access-denied-for-user-billlocalhost-using-passw)
