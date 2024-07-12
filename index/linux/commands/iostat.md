---
tags:
  - linux/commands/iostat
date updated: 2024-07-12 13:09
---

查看磁盘等block I/O设备的性能和利用率

```shell
$ iostat -x
Linux 3.10.0-1062.el7.x86_64 (CentOS7) 	07/10/2024 	_x86_64_	(2 CPU)

avg-cpu:  %user   %nice %system %iowait  %steal   %idle
           3.95    0.00    1.25    0.01    0.00   94.80

Device:         rrqm/s   wrqm/s     r/s     w/s    rkB/s    wkB/s avgrq-sz avgqu-sz   await r_await w_await  svctm  %util
sda               0.03     0.60    0.47    0.61    18.97    35.78   101.22     0.00    1.13    1.13    1.12   0.21   0.02
dm-0              0.00     0.00    0.43    0.59    18.55    33.53   101.67     0.00    1.23    1.18    1.27   0.21   0.02
dm-1              0.00     0.00    0.07    0.56     0.29     2.25     8.04     0.00    2.87    1.09    3.09   0.04   0.00

```
