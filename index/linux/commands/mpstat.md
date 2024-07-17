---
tags:
  - linux/commands/mpstat
date updated: 2024-07-16 12:32
---


查看每个CPU的使用信息


```shell
~$ mpstat  -P ALL
Linux 3.10.0-1062.el7.x86_64 (leaderli) 	07/11/2024 	_x86_64_	(2 CPU)

04:22:54 AM  CPU    %usr   %nice    %sys %iowait    %irq   %soft  %steal  %guest  %gnice   %idle
04:22:54 AM  all    3.95    0.00    1.24    0.01    0.00    0.00    0.00    0.00    0.00   94.80
04:22:54 AM    0    3.96    0.00    1.24    0.01    0.00    0.00    0.00    0.00    0.00   94.79
04:22:54 AM    1    3.93    0.00    1.24    0.01    0.00    0.00    0.00    0.00    0.00   94.81
```
