---
tags:
  - linux/commands/getopts
date updated: 2022-05-13 11:27
---

shell 命令行参数解析工具，不支持长参数的语法

基本语法

`getopts optstring name [arg...]`

- `optstring`  对应 shell 可以识别出的所有参数，例如 `-a` , `-f` ，对应的参数即是 `af`，如果参数还跟随一个值，则相应的 `optstring` 后面加冒号，例如 `a:f` 表示 `a` 参数 后面会有一个值出现，`-a value` 或 `-avalue` ,  `getopt` 执行匹配到  `a` 的时候，会把 `value` 存放到一个叫 `OPTARG` 的 shell 变量中。 如果 `optstring` 以 `:` 开头，则表示 `optstring` 没有的参数或者参数没有值不提示错误信息。
- `name` 表示参数的名称，每次执行 `getopt` ，会从命令行获取下一个参数，然后存放到 `name` 当中。 如果获取到的参数不在 `optstring` 当中，则 `name` 会被设置为 `?` 。命令行中的所有参数都有一个 `index` ，第一个参数从 `1` 开始。另外有一个 `OPTIND` 的 shell变量存放下一个要处理的参数的 index 。

示例：

```shell
#!/bin/bash
 
func() {
    echo "Usage:"
    echo "test.sh [-j S_DIR] [-m D_DIR]"
    echo "Description:"
    echo "S_DIR,the path of source."
    echo "D_DIR,the path of destination."
    exit 1
}
 
upload="false"
 
while getopts 'h:j:m:u' OPT; do
    case $OPT in
        j) S_DIR="$OPTARG";;
        m) D_DIR="$OPTARG";;
        u) upload="true";;
        h) func;;
        ?) func;;
    esac
done
 
echo $S_DIR
echo $D_DIR
echo $upload

# Shift the option arguments
shift $((OPTIND - 1))

# Process extra arguments
while [[ $# -gt 0 ]]; do
  extra_arg=$1
  echo "Extra argument: $extra_arg"
  shift
done
```

对于剩余的其他参数，可以使用 [[shift]] 来读取
