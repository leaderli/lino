---
aliases: 文件锁
tags:
  - 计算机基础/文件锁
date created: 2022-03-24 16:22
date updated: 2022-04-15 15:29
---

可以使用文件锁来确保只有一个进程访问该文件，确保其他进程（包括其他虚拟机或者其他操作文件的系统)

```java
RandomAccessFile raFile = new RandomAccessFile(new File(filename), "rw")
FileLock lock = raFile.getChannel().lock();
```

使用 RandomAccessFile 拷贝文件

```java
 public static void appendFile(RandomAccessFile main, RandomAccessFile extra) throws IOException {

        // this method uses NIO direct transfer. It delegates the task
        // to the operating system. Only works under 1.4+
        // Unfortunately, can't use this because it crashes with an out of memory error on big files
        //extra.getChannel().transferTo(0, Long.MAX_VALUE, mainFile.getChannel());

        byte[] buf = new byte[1024 * 1024]; // 1 mb
        main.seek(main.length());
        extra.seek(0);

        while (true) {
            int count = extra.read(buf);
            if (count == -1)
                break;
            main.write(buf, 0, count);
        }
    }
```
