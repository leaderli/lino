---
tags:
  - linux/commands/rsync
date updated: 2022-04-11 10:11
---

同步命令，可用于备份应用。该命令做数据的同步备份，会对比数据源目录和数据备份目录的数据，并把不同的数据同步到备份目录。其也可以同步到其他服务器，用法类似 scp

- `-v` 显示同步详情

- `-p` 显示同步百分比

- `--delete`  默认情况下 source 中被删除的文件不会同步到 target 中，需要加上该参数才会同步删除命令

- `--exclude`  不同步符合 `[pattern]` 的文件，`[pattern]` 表达式要匹配的相对路径下的文件名称，包含路径
  例如

  ```shell
  rsync -avp   --exclude='dir/*' /etc/ /data/etc/
  ```

- `--include` 要配置 `--exclude` 一起使用，表示不执行符合 `[pattern]` 的 `--exclude`
  例如

  ```shell
  # 表示不同步/etc/log下的文件，除了/etc/log/important相关文件
  rsync -avp  --include='/etc/*' --include='/etc/log/important*' --exclude='/etc/log/*' /etc/ /data/etc/
  ```
