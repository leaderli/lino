---
tags:
  - rust/rust
date updated: 2023-06-17 21:54
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
