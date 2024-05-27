---
tags:
  - linux/commands/tracepath
---


用于显示数据包到达目的主机时途中经过的所有路由信息

```
tracepath www.baidu.com
```


当两台主机之间无法正常 ping 通时，要考虑两台主机之间是否有错误的路由信息，导致
数据被某一台设备错误地丢弃。这时便可以使用 tracepath 命令追踪数据包到达目的主机时途中的所有路由信息，以分析是哪台设备出了问题