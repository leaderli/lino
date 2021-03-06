---
tags:
  - linux/fork
date updated: 2022-04-05 16:01
---

```cpp
#include<stdio.h>
#include<string.h>
#include<stdlib.h>
#include<unistd.h>

void main()
{
    char str[6]="hello";

    pid_t pid=fork();

    if(pid==0)
    {
        str[0]='b';
        printf("子进程中str=%s\n",str);
        printf("子进程中str指向的首地址:%x\n",(unsigned int)str);
    }
    else
    {
        sleep(1);
        printf("父进程中str=%s\n",str);
        printf("父进程中str指向的首地址:%x\n",(unsigned int)str);
    }
}
// 子进程中str=bello
// 子进程中str指向的首地址:bfdbfc06
// 父进程中str=hello
// 父进程中str指向的首地址:bfdbfc06
```

这里涉及到逻辑地址（或称虚拟地址）和物理地址的概念。

- 逻辑地址：CPU 所生成的地址。
- 物理地址：内存单元所看到的地址。

用户程序看不到真正的物理地址。用户只生成逻辑地址，且认为进程的地址空间为 0 到 max。物理地址的方位从<red>R+0</red>到<red>R+MAX</red>。R 为基地址，内存管理单元（MMU），根据基地址将程序地址空间使用的逻辑地址变换为内存中的物理地址过程称为地址映射。

fork（）会产生一个和父进程完全相同的子进程，但子进程在此后会多 exec 系统调用。出于效率考虑。linux 中引入了 `写时复制` 技术，也就是只有进程空间的各段（代码段，数据段，堆栈）的内容要发生变化时，在会将父进程的内容复制一份给子进程。在 fork 之后 exec 之前两个进程用的是相同的物理空间（内存区），子进程的代码段、数据段、堆栈都是执行父进程的物理空间，也就是说，两者的虚拟空间不同，但其对应的物理空间是同一个。当父子进程有更改相应段的行为发生后，再为子进程相应的段分配物理空间。

fork 时子进程获得父进程数据空间，堆和栈的复制，所以变量的地址（虚拟地址）也是一样的，每个进程都有自己的虚拟空间，不同进程的相同的虚拟地址可以对应不同的物理地址。

fork 子进程完全复制父进程的栈空间，也复制了页表，但没有复制物理页面，所以这时虚拟地址相同，物理地址也相同，但是会把父子共享的页面标记为 `只读` ,如果父子进程一直对这个页面是同一个页面，直到其中任何一个进程要对共享的页面进行写操作，这时内核会复制一个物理页面给这个进程使用，同时修改页表，而把原来的只读页面标记为可写，留给另外一个进程使用。

内核一般会先调度子进程，很多情况下子进程要马上执行 exec，会情况栈，堆。这些和父进程共享的空间，加载新的代码段，这就避免了 `写时复制` 拷贝共享页面的机会。如果父进程先调度很可能写共享页面，会造成 `写时复制` 无用。

假定父进程 malloc 的指针指向 0x12345678, fork 后，子进程中的指针也是指向 0x12345678，但是这两个地址都是虚拟内存地址 （virtual memory)，经过内存地址转换后所对应的 物理地址是不一样的。所以两个进城中的这两个地址相互之间没有任何关系。

```ad-info
（注 1：在理解时，你可以认为 fork 后，这两个相同的虚拟地址指向的是不同的物理地址，这样方便理解父子进程之间的独立性）

（注 2：但实际上，linux 为了提高 fork 的效率，采用了 copy-on-write 技术，fork 后，这两个虚拟地址实际上指向相同的物理地址（内存页），只有任何一个进程试图修改这个虚拟地址里的内容前，两个虚拟地址才会指向不同的物理地址（新的物理地址的内容从原物理地址中复制得到））
```

### ForkJoinPool

```java
//使用公共的线程池
ForkJoinPool pool = ForkJoinPool.commonPool();
```

无返回值的调用

```java
class PrintStack extends RecursiveAction{  
  
  
    private static final int THRED_HOLD = 9;  
  
  
  
    private final int start;  
    private final  int end;  
  
    private PrintStack(int start, int end) {  
        this.start = start;  
        this.end = end;  
    }  
  
  
    @Override  
    protected void compute() {  
        if(end-start<THRED_HOLD){  
  
            for (int i = start ; i <end ; i++) {  
  
                System.out.println(Thread.currentThread().getName()+" i="+i);  
            }  
        }else{  
  
            int middle  = (start+end)/2;  
  
            PrintStack firstTask  = new PrintStack(start, middle);  
            PrintStack secondTask= new PrintStack(middle+1, end);  
  
            invokeAll(firstTask,secondTask);  
        }  
  
    }  
}
```

```java
ForkJoinPool pool = new ForkJoinPool();  
  
PrintStack task= new PrintStack(0, 50);  
pool.submit(task);  
  
pool.awaitTermination(2, TimeUnit.SECONDS);  
pool.shutdown()
```

有返回值的调用

```java
class CalculateStack extends RecursiveTask<Integer> {  
  
  
    private static final int THRED_HOLD = 9;  
  
  
  
    private final int start;  
    private final  int end;  
  
    private CalculateStack(int start, int end) {  
        this.start = start;  
        this.end = end;  
    }  
  
  
    @Override  
    protected Integer compute() {  
        if(end-start<THRED_HOLD){  
  
            int result = 0;  
            for (int i = start ; i <end ; i++) {  
  
                result +=i;  
            }  
            return result;  
        }else{  
  
            int middle  = (start+end)/2;  
  
            CalculateStack firstTask  = new CalculateStack(start, middle);  
            CalculateStack secondTask= new CalculateStack(middle+1, end);  
  
            invokeAll(firstTask,secondTask);  
  
            return firstTask.join() + secondTask.join();  
        }  
  
    }  
}
```

```java
ForkJoinPool pool = new ForkJoinPool();  
  
CalculateStack task= new CalculateStack(0, Integer.MAX_VALUE);  
pool.submit(task);  
System.out.println(task.get());  
  
pool.awaitTermination(2, TimeUnit.SECONDS);  
pool.shutdown();
```
