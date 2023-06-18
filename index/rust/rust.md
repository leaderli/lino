---
tags:
  - rust/rust
date updated: 2023-06-18 18:32
---

## 安装

[Getting started - Rust Programming Language](https://www.rust-lang.org/learn/get-started)

新增RUSTUP_HOME，CARGO_HOME 分别指向.rustup，.cargo。必须先建好目录

编辑"Path"变量，新增"%RUSTUP_HOME%"，"%CARGO_HOME%"，"%CARGO_HOME%bin"

```shell
# 更新
rustup update

# 卸载
rustup self uninstall
```

IntelliJ中安装rust插件，配置 `Language & Frameworks|Rust|toolchain location`为`D:\resource\rust\.rustup\toolchains\stable-x86_64-pc-windows-msvc\bin`

配置镜像

`~/.cargo/config:`

[RsProxy](http://rsproxy.cn/)

```toml
[source.crates-io]
# To use sparse index, change 'rsproxy' to 'rsproxy-sparse'
replace-with = 'rsproxy'

[source.rsproxy]
registry = "https://rsproxy.cn/crates.io-index"
[source.rsproxy-sparse]
registry = "sparse+https://rsproxy.cn/index/"

[registries.rsproxy]
index = "https://rsproxy.cn/crates.io-index"

[net]
git-fetch-with-cli = true
```

## 常用命令

- `cargo build` 打包
- `cargo run` 编译并运行
- `cargo check` 检测，运行速度快

## 所有权与作用域

1. 每个值都有一个变量，这个变量是该值的所有者
2. 每个值同时只能有一个所有者
3. 当所有者超出作用域（scope）时，该值将被删除（通过drop函数）
4. 函数在返回值的过程中同样也会发生所有权的转移
5. 一个变量的所有权总是遵循以下规则：
   1. 把一个值赋给其他变量时总会发生移动
   2. 当一个包含heap数据的变量离开作用域时，它的值就会被drop函数清理，除非所有权移动到另外一个变量上

## 常用方法

```rust
let v = vec![1,2,3];   // 初始化Vec
println!("{:?}", v);
println!("{:#?}", v);
```
