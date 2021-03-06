---
aliases:  背包问题
tags:
- 数据结构/背包问题
- 动态规划
- 状态转移函数
---
## 动态规划

通过把原问题分解为相对简单的子问题的方式来解决复杂问题的方法，动态规划常常适用于有重叠子问题和最优子结构的问题。动态规划背后的基本思想非常简单，大致上，若要解决一个给定问题，我们需要解决不同部分(子问题)，再根据子问题的解得出原问题的解。

通常许多子问题非常相似，为此动态规划试图仅仅解决一次子问题，从而减少计算量，一旦某个给定子问题的解已经算出，则将其记忆化存储，以便下一次需要同一个子问题解之时直接查表。

## 最大子序列和

对于给定序列$\{A_1,A_2,...,A_i\}$,求解最大连续子序列和

状态转移方程：

- $dp(0) = 0$
- $dp(i) = max\{A_i,A_i+dp(i-1)\}$

```java
public int maxSubArray(int... nums) {
    int max = nums[0],int pre = 0;
    for (int num : nums) {
      pre = Math.max(pre + num, num);
      max = Math.max(max , pre);
    }
    return max;
  }
```

## 简单背包问题

一个容量为V的背包，N种不同质量 $N_v$ 的物品，为求解将哪些物品装入背包可使总和最大，不同质量的物品不限数量

状态转移方程：

- $F(0) = 0$
- $F(V) = max\{F(V-1),N_v+F(V-N_v)|N_v \le V\}$

总重量为0，那么物品数量也为0

总重量为V时有两种情况，

- 第一种是该重量无法填满，这对应表达式$F(V-1)$的解。

- 第二种情况是刚好填满，这对应一系列刚好填满的可能性的集合，其中的可能性是指最后放入包中的物品恰好是重量为 $N_v$ 的物品，而这时候我们只需要解出 $F(V-N_v)$ 的值即可。

```java

  public static int max(int[] nums, int V, Integer[] map) {
    if (map == null) {
      map = new Integer[V + 1];
    }
    if (map[V] != null) {
      return map[V];
    }
    int max = V == 0 ? 0 : max(nums, V - 1, map);
    for (int Nv : nums) {
      if (Nv <= V) {
        max = Math.max(Nv + max(nums, V - Nv, map), max);
      }
    }
    map[V] = max;
    return max;
  }
```

## 参考链接

[维基百科-背包问题](https://zh.wikipedia.org/wiki/背包问题)  
[维基百科-动态规划](https://zh.wikipedia.org/wiki/动态规划)
