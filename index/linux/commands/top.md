---
tags:
  - linux/commands/top
date updated: 2024-06-03 22:38
---

监控linux的系统状况

- `-d number` 页面刷新间隔，默认5秒
- `-n number` 显示几次后退出

进入top后可输入按键执行相应功能，区分大小写

- W 保持配置，下次进入top后不用重复设置
- ? 帮助文档
- m 切换内存显示模式（可重复按键切换）
- e 切换底部进程中单位的显示模式（可重复按键切换）
- E 切换摘要显示内存的单位(可重复按键切换)
- M 按内存大小排序
- P 按CPU使用率排序
- N 以PID排序
- T 以进程使用累计时间排序

top命令默认显示字段有限，可以按 `f` 进入字段选择界面，进入后使用`d`切换是否显示，`s`选择排序字段。例如按照使用内存大小排序`%MEM`

![[Pasted image 20220118235153.png|500]]

```ad-info
使用`top` 命令查看进程占用情况，可配合 `grep` 来实现查看想要的信息
 `top|grep java`
```

## 参考文档

[top](https://mp.weixin.qq.com/s/DuwnNyDTWs8Lp2V0TwM_7Q)
