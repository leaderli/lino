---
aliases: 
tags:
- java/jvm/字节码/major_version
---
[[bytecode|字节码]] 文件的主要java版本

查看class文件的二进制文件，第8字节就表示版本号，其中34对应十进制位52，即 JDK8
```txt
CAFE BABE 0000 0034
```

### 查看版本
1. [[index/java/command#javap| javap]]
2.  [[file#^dc4f9b|linux file]]

### java版本清单
|Java SE       |Released      |Major   |Supported majors|
|--------------|--------------|--------|----------------|
|1.0.2         |May 1996      |45      |45              |
|1.1           |February 1997 |45      |45              |
|1.2           |December 1998 |46      |45 .. 46        |
|1.3           |May 2000      |47      |45 .. 47        |
|1.4           |February 2002 |48      |45 .. 48        |
|5.0           |September 2004|49      |45 .. 49        |
|6             |December 2006 |50      |45 .. 50        |
|7             |July 2011     |51      |45 .. 51        |
|8             |March 2014    |52      |45 .. 52        |
|9             |September 2017|53      |45 .. 53        |
|10            |              |        |                |
|March 2018    |54            |45 .. 54|                |
|11            |              |        |                |
|September 2018|55            |45 .. 55|                |
|12            |              |        |                |
|March 2019    |56            |45 .. 56|                |
|13            |              |        |                |
|September 2019|57            |45 .. 57|                |
|14            |              |        |                |
|March 2020    |58            |45 .. 58|                |
|15            |              |        |                |
|September 2020|59            |45 .. 59|                |
|16            |              |        |                |
|March 2021    |60            |45 .. 60|                |
|17            |              |        |                |
|September 2021|61            |45 .. 61|                |

### 参考资料
1. [oracle  The class File Format](https://docs.oracle.com/javase/specs/jvms/se17/html/jvms-4.html#jvms-4.1-200-B.2)
2. [https://en.wikipedia.org/wiki/Java_class_file#General_layout](https://en.wikipedia.org/wiki/Java_class_file#General_layout)