---
tags:
  - middleware/redis/tutorial
date updated: 2024-01-27 22:53
---

## 安装

在 centos 上使用 yum 安装

```shell
# 安装源
sudo yum install epel-release yum-utils
sudo yum install http://rpms.remirepo.net/enterprise/remi-release-7.rpm
sudo yum-config-manager --enable remi

sudo yum install redis
```

离线安装

```shell
$ wget -c http://download.redis.io/redis-stable.tar.gz
$ tar -xvzf redis-stable.tar.gz
$ cd redis-stable
$ make 
$ sudo make install
```

gui客户端

[tiny-redis](https://github.com/tiny-craft/tiny-rdm/releases)

## 单点启动

```shell
sudo systemctl start redis
sudo systemctl enable redis


# 查看启动状态
sudo systemctl status redis

# 也可以使用redis-server启动，其中redis.conf中可以配置后台进程启动
redis-server redis.conf
```

**_可通过查看 redis 日志来查看启动过程或者运行过程中的各种问题_**

日志开启需要在 `redis.conf` 配置

```conf
logfile /var/log/redis/redis.log
```

## 配置

在 redis 客户端可以使用 `config set` 设定临时配置，该配置仅临时有效，可通过 `config rewrite` 将临时配置写入到 `redis.conf` 中使其永久有效

1. maxmemory 设定最大内存使用

   ```conf
   # 设置为5m
   maxmemory 5m
   ```

2. maxmemory_policy 过期策略

   [[redis maxmemory policy]]

## 执行过程

redis 使用 cs 服务架构，执行一条命令的过程如下

1. 客户端发送一个请求到服务器

2. 服务器通过 socket 读取命令，通常以阻塞的方式读取

3. 服务器通过`read()`指令将命令从内存加载到内核执行

4. 核心执行命令将执行结果写回内存

5. 将执行结果返回客户端

redis 执行命令的速度是较快的，当执行大量命令时，那么大部分时间将花费在请求返回，读取写回上。
redis 提供了管道命令，可以批量执行命令，依次执行，然后等执行完成后将执行结果打包返回给客户端。

当然也可以使用 [[redis lua]] 去执行大量命令，来达到批量执行的目的。

## shell

使用 `shell` 执行 `redis` 命令

```shell

#标准语法
redis-cli keys '*'

#
echo keys '*'|redis-cli -h '127.0.0.1' -p 6379 -a 'password'

# 逐行批量执行
cat commands.txt|redis-cli -h '127.0.0.1' -p 6379 -a 'password'


# 加载lua脚本执行，可带参数
$ cat /tmp/script.lua
return redis.call('set',KEYS[1],ARGV[1])
$ redis-cli --eval /tmp/script.lua foo , bar
OK

```

## 布隆过滤器

[[Bloom Filter|布隆过滤器]]

## 相关操作

### 查看所有没有过期时间的 key

```shell
echo keys '*' |redis-cli |awk '{print "echo -n "$1"_"" && echo ttl " $1 " |redis-cli"}'|sh|grep '\-1$'|sed  's/_-1//' > 2.txt
```

### 批量删除key

```shell
redis-cli --scan --pattern "foo*" |xargs -L 1 redis-cli del
```

### 查询所有key，以及过期时间

```shell
echo keys '*' |redis-cli |awk '{print "echo -n "$1    " && echo ttl " $1 " |redis-cli"}'|sh
```

### 查看占用内存较多的 key

```shell
~$ redis-cli --bigkeys

# Scanning the entire keyspace to find biggest keys as well as
# average sizes per key type.  You can use -i 0.1 to sleep 0.1 sec
# per 100 SCAN commands (not usually needed).

[00.00%] Biggest string found so far 'hello3' with 3 bytes

-------- summary -------

Sampled 3 keys in the keyspace!
Total key length in bytes is 17 (avg len 5.67)

Biggest string found 'hello3' has 3 bytes

0 lists with 0 items (00.00% of keys, avg size 0.00)
0 hashs with 0 fields (00.00% of keys, avg size 0.00)
3 strings with 6 bytes (100.00% of keys, avg size 2.00)
0 streams with 0 entries (00.00% of keys, avg size 0.00)
0 sets with 0 members (00.00% of keys, avg size 0.00)
0 zsets with 0 members (00.00% of keys, avg size 0.00)

```

### 查看运行时相关配置

```shell
127.0.0.1:6379> info
# Server
redis_version:6.0.3
redis_git_sha1:00000000
redis_git_dirty:0
redis_build_id:eb1391459d1a8dbb
redis_mode:standalone
os:Linux 3.10.0-1062.el7.x86_64 x86_64
arch_bits:64
multiplexing_api:epoll
atomicvar_api:atomic-builtin
gcc_version:8.3.1
process_id:6077
run_id:963b3a75b32efa8801d755a1d8ef0129a009ffc8
tcp_port:6379
uptime_in_seconds:307
uptime_in_days:0
hz:10
configured_hz:10
lru_clock:6921052
executable:/root/redis-server
config_file:/etc/redis.conf

# Clients
connected_clients:1
client_recent_max_input_buffer:2
client_recent_max_output_buffer:0
blocked_clients:0
tracking_clients:0
clients_in_timeout_table:0

# Memory
used_memory:867312
used_memory_human:846.98K
used_memory_rss:3375104
used_memory_rss_human:3.22M
used_memory_peak:867312
used_memory_peak_human:846.98K
used_memory_peak_perc:100.18%
used_memory_overhead:820850
used_memory_startup:803712
used_memory_dataset:46462
used_memory_dataset_perc:73.05%
allocator_allocated:1019552
allocator_active:1335296
allocator_resident:3698688
total_system_memory:1922482176
total_system_memory_human:1.79G
used_memory_lua:37888
used_memory_lua_human:37.00K
used_memory_scripts:0
used_memory_scripts_human:0B
number_of_cached_scripts:0
maxmemory:0
maxmemory_human:0B
maxmemory_policy:noeviction
allocator_frag_ratio:1.31
allocator_frag_bytes:315744
allocator_rss_ratio:2.77
allocator_rss_bytes:2363392
rss_overhead_ratio:0.91
rss_overhead_bytes:-323584
mem_fragmentation_ratio:4.09
mem_fragmentation_bytes:2550304
mem_not_counted_for_evict:0
mem_replication_backlog:0
mem_clients_slaves:0
mem_clients_normal:16986
mem_aof_buffer:0
mem_allocator:jemalloc-5.1.0
active_defrag_running:0
lazyfree_pending_objects:0

# Persistence
loading:0
rdb_changes_since_last_save:3
rdb_bgsave_in_progress:0
rdb_last_save_time:1600756265
rdb_last_bgsave_status:ok
rdb_last_bgsave_time_sec:-1
rdb_current_bgsave_time_sec:-1
rdb_last_cow_size:0
aof_enabled:0
aof_rewrite_in_progress:0
aof_rewrite_scheduled:0
aof_last_rewrite_time_sec:-1
aof_current_rewrite_time_sec:-1
aof_last_bgrewrite_status:ok
aof_last_write_status:ok
aof_last_cow_size:0
module_fork_in_progress:0
module_fork_last_cow_size:0

# Stats
total_connections_received:4
total_commands_processed:22
instantaneous_ops_per_sec:0
total_net_input_bytes:633
total_net_output_bytes:18936
instantaneous_input_kbps:0.00
instantaneous_output_kbps:0.00
rejected_connections:0
sync_full:0
sync_partial_ok:0
sync_partial_err:0
expired_keys:0
expired_stale_perc:0.00
expired_time_cap_reached_count:0
expire_cycle_cpu_milliseconds:5
evicted_keys:0
keyspace_hits:12
keyspace_misses:0
pubsub_channels:0
pubsub_patterns:0
latest_fork_usec:0
migrate_cached_sockets:0
slave_expires_tracked_keys:0
active_defrag_hits:0
active_defrag_misses:0
active_defrag_key_hits:0
active_defrag_key_misses:0
tracking_total_keys:0
tracking_total_items:0
tracking_total_prefixes:0
unexpected_error_replies:0

# Replication
role:master
connected_slaves:0
master_replid:4b6a97cd5859089f722814036486d8d06bbf8432
master_replid2:0000000000000000000000000000000000000000
master_repl_offset:0
master_repl_meaningful_offset:0
second_repl_offset:-1
repl_backlog_active:0
repl_backlog_size:1048576
repl_backlog_first_byte_offset:0
repl_backlog_histlen:0

# CPU
used_cpu_sys:0.233602
used_cpu_user:0.263460
used_cpu_sys_children:0.000000
used_cpu_user_children:0.000000

# Modules

# Cluster
cluster_enabled:0

# Keyspace
db0:keys=3,expires=0,avg_ttl=0

```

## 问题集锦

### 访问`redis`集群

访问集群报错

> Connection refused: /127.0.0.1:7000

需要对 redis 集群配置对外访问的 ip 地址，更改每个节点下的`redis.conf`配置，修改或增加配置

```conf
bind  xxx.xxx.xxx.xxx
```

### `del`的相关问题

在使用`redis-cli`连接`redis`集群，进行数据操作时，有报错

> (error) MOVED 5798 192.24.54.2:6379

这种情况一般是因为启动`redis-cli`时没有设置集群模式所导致。启动时使用`-c`参数来启动集群模式，命令如下：

```shell
redis-cli -c
```

del 删除 key 时内存不会 redis 占用的内存不会回收，而是由 redis 持续占用，在 redis 做其他操作时会去使用这部分内存

### 启动时没有启动成功

> (error) CLUSTERDOWN Hash slot not served

需要重新分配 `hash槽`

### 重启时

> Node 127.0.0.1:7000 is not empty. Either the node already knows other nodes (check with CLUSTER NODES) or contains some key in database 0.

因为 `hash槽` 已经分配过了，无需重新分配。若要重新分配，将每个节点对应的 `node.conf` 删除掉再重新执行即可。
