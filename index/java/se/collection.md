---
aliases: 集合
tags:
  - java/se/collection
date updated: 2023-03-12 13:44
---

## ArrayList

ArrayList 底层通过数组实现，允许存入 `null` 元素。 ArrayList 都有一个容量（capacity），表示底层数组的实际大小，容器中存储元素的个数（size）不能多于当前容量。必要时，底层数组会进行扩容，将老数组中的元素拷贝到一个新的数组中，每次扩容数组容量的增长大约是其原容量的1.5倍。

ArrayList 的插入删除等都是通过操作底层数组来实现的，并且采用了 `Fail-Fast` 机制，通过记录`modCount` 参数来实现，在面对并发的修改时，迭代器很快就会失败。

## LinkedList

LinkedList 同时实现了 List 接口和 Deque 接口。 底层通过双向链表实现，双向链表的每个节点使用内部类 `Node` 表示。其实现方式决定了所有和下标相关的操作都是 `O(n)`，而在首段或者末尾插入删除则是 `O(1)`

## ArrayDeque

ArrayDeque 底层通过数组实现，为了满足同时在数组两端插入或删除元素的需求，该数组还必须是循环的，即循环数组，即数组的任何一点都可以被看做是起点或终点。

![[Pasted image 20230217042445.png]]

该容器不允许放入 `null` 元素。

该容器对添加，删除，取值都有两套接口，它们功能相同，区别是对失败情况的处理不同，一套接口遇到失败就会抛出异常，另一套遇到失败则会返回特殊值（ `false` 或 `null` ）。

## PriorityQueue

优先队列使用 [[heap#小顶堆]] 实现，保证每次取出的元素都是队列中权值最小的元素。

## LinkedHashMap

继承于HashMap，相对于HashMap来说，LinkedHashMap多维护了一个链表来维护插入的顺序。

## WeakHashMap

继承于HashMap，相对于HashMap来说，它的 entry 是 [[reference#弱引用]] ，可能被GC自动删除，适用于需要做缓存的场景。
