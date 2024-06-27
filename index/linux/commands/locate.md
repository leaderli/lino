---
tags:
  - linux/commands/locate
date updated: 2024-06-27 12:26
---

`locate  <name>`

查找文件，使用索引去查找文件，系统通过cron会定期执行更新命令`updatedb`来更新索引库（需要root用户）

如果文件更新，不一定会马上刷新到索引


```shell
# 展开索引
strings /var/lib/mlocate/mlocate.db 
```

