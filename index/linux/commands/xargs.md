---
tags:
  - linux/commands/xargs
date updated: 2022-04-07 14:25
---

xargs  一般使用 [[configuration#IFS|IFS]] 分割变量

### 引用参数

```shell

ls *.jar|xargs -i  echo {}
#或
ls *.jar|xargs -I {} echo {}
```
