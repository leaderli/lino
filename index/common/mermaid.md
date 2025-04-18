---
aliases: 流程图插件
tags:
  - 常用/mermaid
date updated: 2022-04-13 10:35
---

mermaid 是一个流程图插件的语法，可定义多种类型的流程图，详细文档参考

## 流程图

基本的语法

> 不要使用 `;` 结尾，否则 hexo 可能会渲染会失败，有些关键词不能作为 id，比如 `end`

````txt
	```mermaid
	graph LR
		Start --> Stop
	```
````

```mermaid
graph LR
    Start --> Stop
```

graph 标明当前为流程图，LR 标明方向

### 方向

- TB - top to bottom
- TD - top-down/ same as top to bottom
- BT - bottom to top
- RL - right to left
- LR - left to right

````txt
	```mermaid
	graph TB
		Start --> Stop
	```
````

```mermaid
graph TB
    Start --> Stop
```
### 节点形状

节点可以设置显示文本用于区分与唯一 id

1. `id1[text1]`
2. `id2(text2)`

```mermaid
graph LR
   id1[text1]
   id2(text2)
```

### 线条

线条的长度可以用`-`来增加

1. `A-->B;`
2. `A---B;`
3. `A---|text|B`
4. `A-->|text|B`
5. `A-.->B;`
6. `A-.->|text|B`
7. `A ==> B`

文字可以统一在线条语法后使用`|text|`的方式来

```mermaid
graph LR
    A-->|1|B;
    A---|2|B;
    A---|3|B
    A-->|4|B
    A-.->|5|B;
    A-.->|6|B
    A ==>|7|B
```

### 子图

语法

```text
subgraph title
    graph definition
end
```

例如

```txt
graph TB
    c1-->a2
    subgraph one
    a1-->a2
    end
    subgraph two
    b1-->b2
    end
    subgraph three
    c1-->c2
    end
```

```mermaid
graph TB
    c1-->a2
    subgraph one
    a1-->a2
    end
    subgraph two
    b1-->b2
    end
    subgraph three
    c1-->c2
    end
```

### css 样式

```txt
graph LR
    id1(Start)-->id2(Stop)
    id3:::red-->id2(Stop)
    style id1 fill:#f9f,stroke:#333,stroke-width:4px
    style id2 fill:#bbf,stroke:#f66,stroke-width:2px,color:#fff,stroke-dasharray: 5 5

```

```mermaid
graph LR
    id1(Start)-->id2(Stop)
    id3:::red-->id2(Stop)
    style id1 fill:#f9f,stroke:#333,stroke-width:4px
    style id2 fill:#bbf,stroke:#f66,stroke-width:2px,color:#fff,stroke-dasharray: 5 5

```

可定义 class

```txt
graph LR
    A:::someclass --> B
    classDef someclass fill:#f96;
```

```mermaid
graph LR
    A:::someclass --> B
    classDef someclass fill:#f96;
```

## 状态图

```mermaid
stateDiagram-v2
direction LR
S-->S:b
S-->A:b
A-->A:a
```

```mermaid
graph LR
  start-->0
  0-- < -->1
  0-- + -->3
  1-- = -->2:::terminal
  3-- + -->4:::terminal
  style start fill:#fff ,stroke:#fff;
  classDef terminal fill:#f96;
```

## 参考文档

[官方文档](https://mermaid-js.github.io/mermaid)
