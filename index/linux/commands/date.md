---
tags:
  - linux/commands/date
date updated: 2022-04-07 09:48
---

显示当前时间

```shell
$ date
Wed Jan 26 08:03:31 CST 2022
$ date +'%Y-%m-%d'
2022-01-26
```

格式设定为一个加号后接数个标记

| 参数 | 解释                                     |
| -- | -------------------------------------- |
| %  | 印出 %                                   |
| %n | 下一行                                    |
| %t | 跳格                                     |
| %H | 小时(00..23)                             |
| %I | 小时(01..12)                             |
| %k | 小时(0..23)                              |
| %l | 小时(1..12)                              |
| %M | 分钟(00..59)                             |
| %p | 显示本地 AM 或 PM                           |
| %r | 直接显示时间 (12 小时制，格式为 hh:mm:ss [AP]M)     |
| %s | 从 1970 年 1 月 1 日 00:00:00 UTC 到目前为止的秒数 |
| %S | 秒(00..61)                              |
| %T | 直接显示时间 (24 小时制)                        |
| %X | 相当于 %H:%M:%S                           |
| %Z | 显示时区                                   |
| %a | 星期几 (Sun..Sat)                         |
| %A | 星期几 (Sunday..Saturday)                 |
| %b | 月份 (Jan..Dec)                          |
| %B | 月份 (January..December)                 |
| %c | 直接显示日期与时间                              |
| %d | 日 (01..31)                             |
| %D | 直接显示日期 (mm/dd/yy)                      |
| %h | 同 %b                                   |
| %j | 一年中的第几天 (001..366)                     |
| %m | 月份 (01..12)                            |
| %U | 一年中的第几周 (00..53) (以 Sunday 为一周的第一天的情形) |
| %w | 一周中的第几天 (0..6)                         |
| %W | 一年中的第几周 (00..53) (以 Monday 为一周的第一天的情形) |
| %x | 直接显示日期 (mm/dd/yy)                      |
| %y | 年份的最后两位数字 (00.99)                      |
| %Y | 完整年份 (0000..9999)                      |


获取时间戳

使用`date --help`查看具体语法

节选部分

```shell
  %p   locale's equivalent of either AM or PM; blank if not known
  %P   like %p, but lower case
  %r   locale's 12-hour clock time (e.g., 11:11:04 PM)
  %R   24-hour hour and minute; same as %H:%M
  %s   seconds since 1970-01-01 00:00:00 UTC
  %S   second (00..60)

```

```shell
timestamp() {
  date +"%s" # seconds since 1970-01-01 00:00:00 UTC

}
```