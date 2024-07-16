---
tags:
  - linux/commands/vmstat
date updated: 2024-07-16 12:32
---

显示系统使用情况的统计信息

```shell
~$ vmstat  -w -S M -s
         1833 M total memory
         1430 M used memory
         1061 M active memory
          409 M inactive memory
          124 M free memory
            0 M buffer memory
          277 M swap cache
         2047 M total swap
          489 M used swap
         1558 M free swap
      2071157 non-nice user cpu ticks
          242 nice user cpu ticks
       652131 system cpu ticks
     49754929 idle cpu ticks
         3398 IO-wait cpu ticks
            0 IRQ cpu ticks
         1939 softirq cpu ticks
            0 stolen cpu ticks
      4643269 pages paged in
      9373240 pages paged out
        17036 pages swapped in
       136396 pages swapped out
    216353699 interrupts
    316985872 CPU context switches
   1720378998 boot time
      1775160 forks

```
