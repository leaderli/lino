---
tags:
  - 软件/gitlab
date updated: 2022-04-05 16:10
---

## 安装

1. 安装必要的依赖

   ```shell
   sudo yum install -y curl policycoreutils-python openssh-server perl
   # Enable OpenSSH server daemon if not enabled: sudo systemctl status sshd
   sudo systemctl enable sshd
   sudo systemctl start sshd

   # Check if opening the firewall is needed with: sudo systemctl status firewalld
   sudo firewall-cmd --permanent --add-service=http
   sudo firewall-cmd --permanent --add-service=https
   sudo systemctl reload firewalld

   ```

   ```shell
   # 邮件服务
   sudo yum install postfix
   sudo systemctl enable postfix
   sudo systemctl start postfix
   ```

2. 安装gitlab

   ```shell
   curl https://packages.gitlab.com/install/repositories/gitlab/gitlab-ee/script.rpm.sh | sudo bash
   ```

   ```shell
   # 设置你的gitlab的访问域名
   sudo EXTERNAL_URL="https://centos7:20001" yum install -y gitlab-ee
   ```

```ad-info

测试环境初始密码:qwer1234
```

## api

gitlab 提供了一系列 [API](https://docs.gitlab.com/ee/api/) 用于访问或操作 gitlab

例如，查询所有项目

```shell
curl "https://gitlab.example.com/api/v4/projects"
```

一般情况下，有些 API 可能涉及到权限问题，我们可以在 gitlab 上个人设置界面，新增一个用于 WEP API 的 token，然后我们在进行 api 请求时，可将 token 带上

```shell

# 通过请求参数
curl "https://gitlab.example.com/api/v4/projects?private_token=<your_access_token>"


# 通过请求头
curl --header "PRIVATE-TOKEN: <your_access_token>" "https://gitlab.example.com/api/v4/projects"
```

有些请求 API 包含一个 path 参数，它们以 `:` 开头，例如

```shell
DELETE /projects/:id/share/:group_id
```

`:id` 就是项目创建时的唯一 id
`:gourp_id` 就是组创建时的唯一 id

默认情况下，最多返回前 20 条数据

可通过参数 `per_page` （默认 20，最大 100）和 `page` (默认为 1)，访问指定位置的数据，我们可以通过指定参数 `pagination=keyset` ，这样返回报文的报文头的 link 字段，将会包含一个 `ref='next'` 的指向下一页的链接

```shell
curl --request GET --header "PRIVATE-TOKEN: <your_access_token>" "https://gitlab.example.com/api/v4/projects?pagination=keyset&per_page=50&order_by=id&sort=asc"

HTTP/1.1 200 OK
...
Links: <https://gitlab.example.com/api/v4/projects?pagination=keyset&per_page=50&order_by=id&sort=asc&id_after=42>; rel="next"
Link: <https://gitlab.example.com/api/v4/projects?pagination=keyset&per_page=50&order_by=id&sort=asc&id_after=42>; rel="next"
Status: 200 OK
...
```

我们可以通过正则表达式，取出 next 代表的链接地址，递归请求直到没有 next

常用的 API 示例

1. 查看所有项目 `GET /projects`

   - owned 是否仅展示属于当前用户的项目，默认为 false

1. 查销户看一个项目的所有 tag `GET /projects/:id/repository/tags`
2. 查询组下所有项目 `GET /groups/:group_id/projects`


### 常用参数

[REST API | GitLab](https://docs.gitlab.com/ee/api/rest/)

| 参数         | 是否笔数 | 备注                                                              |
| ------------ | -------- | ------------------------------------------------------------- |
| `pagination` | yes      | `keyset` (to enable keyset pagination).                       |
| `per_page`   | no       | Number of items to list per page (default: `20`, max: `100`). |
| `order_by`   | yes      | Column by which to order by.                                  |
| `sort`       | yes      | Sort order (`asc` or `desc`)                                  |

## 参考文档

[官方文档](https://about.gitlab.com/install/#centos-7)
