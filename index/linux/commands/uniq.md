---
tags:
  - linux/commands/uniq
date updated: 2022-04-14 11:20
---

去重
`uniq` 默认仅会比较相邻的字符串，若需要全部去重，需要先 [[sort]]

会统计重复的次数

```bash
uniq -c
```
