---
tags:
  - rust/rust
date updated: 2023-06-17 19:50
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


配置