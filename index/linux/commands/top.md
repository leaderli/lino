---
tags:
  - linux/commands/top
date updated: 2022-04-14 11:11
---

- m 切换内存显示模式（可重复按键切换）
- e 切换底部进程中单位的显示模式（可重复按键切换）

`shift + e` 切换显示内存的单位

top命令默认显示字段有限，可以按 `f` 进入字段选择界面

![[Pasted image 20220118235153.png|500]]

```ad-info
使用`top` 命令查看进程占用情况，可配合 `grep` 来实现查看想要的信息
 `top|grep java`
```

## 参考文档

[top](https://mp.weixin.qq.com/s/DuwnNyDTWs8Lp2V0TwM_7Q)
