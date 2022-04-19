---
tags:
  - middleware/redis/data_type
date updated: 2022-04-19 14:58
---

## 基本的数据类型

- string

- hash

- list

- set

- zset 有序集合

## 类型和编码

redisObject是 [[redis]]  的核心，数据库中的每个键、值、以及redis本身处理的参数，都表示未这种数据类型。

redisObject 的定义位于 redis.h：

```c
/*
 * Redis 对象
 */
typedef struct redisObject {

    // 类型
    unsigned type:4;

    // 对齐位
    unsigned notused:2;

    // 编码方式
    unsigned encoding:4;

    // LRU 时间（相对于 server.lruclock）
    unsigned lru:22;

    // 引用计数
    int refcount;

    // 指向对象的值
    void *ptr;

} robj;
```

type、encoding 和 ptr 是最重要的三个属性

- `type` 记录了对象锁保持的值的类型
  ```c
  /*
   * 对象类型
   */
  #define REDIS_STRING 0  // 字符串
  #define REDIS_LIST 1    // 列表
  #define REDIS_SET 2     // 集合
  #define REDIS_ZSET 3    // 有序集
  #define REDIS_HASH 4    // 哈希表
  ```

- `encoding` 记录了对象所保存的值的编码

  ```c
  /*
   * 对象编码
   */
  #define REDIS_ENCODING_RAW 0            // 编码为字符串
  #define REDIS_ENCODING_INT 1            // 编码为整数
  #define REDIS_ENCODING_HT 2             // 编码为哈希表
  #define REDIS_ENCODING_ZIPMAP 3         // 编码为 zipmap
  #define REDIS_ENCODING_LINKEDLIST 4     // 编码为双端链表
  #define REDIS_ENCODING_ZIPLIST 5        // 编码为压缩列表
  #define REDIS_ENCODING_INTSET 6         // 编码为整数集合
  #define REDIS_ENCODING_SKIPLIST 7       // 编码为跳跃表
  ```

- `ptr`  是一个指针，执行实际保存值的数据结构，这个数据结构由 `type` 和 `encoding` 决定

下图展示了 redisObject、redis所有数据类型、redis所有编码方式的关系

![[Pasted image 20220418110108.png|600]]

### 字符串类型的内部实现方式

字符串类型的编码又如下三种：

- `int`  8个字节的长整型
- `embstr` 小于等于44个字节的字符串
- `raw` 大于44个字节的字符串

可通过 `ojbect encoding key` 查看存储的类型

```shell
127.0.0.1:6379> set one-more-num 1
OK
127.0.0.1:6379> object encoding one-more-num
"int"
```

在C语音中，字符串是以空字符串结尾的 [[c#字符串|字符串数组]] 。在redis中没有直接使用 C 语言的  [[c#字符串|字符串]] 。而是定义了一个叫做简单动态字符串（Simple Dynamic String，SDS） 的结构，并把其作为redis默认的字符串表示。

简单动态字符串有三个属性：

- `len` 记录buf字符数组已使用的字节数量

- `free` 记录buf字符数组中未使用的字节数量

- `buf[]` 字符数组，用于保存字符串

例如：

```shell
127.0.0.1:6379> set one-more-str OneMore
OK
```

其对应的简单动态字符串就是这样字的

![[Pasted image 20220419145948.png|400]]


优点：

- 获取字符串长度的时间复杂度未 `O(1)`
- 可以保存字节数组，支持安全的二进制数据存储
- 