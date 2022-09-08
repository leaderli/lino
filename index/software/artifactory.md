---
aliases: 仓库
tags:
  - linux
  - 软件/artifactory
date updated: 2022-03-28 15:08
---


## API


快速搜索项目

[QuickSearch](https://www.jfrog.com/confluence/display/JFROG/Artifactory+REST+API#ArtifactoryRESTAPI-ArtifactSearch(QuickSearch))

```json
GET /api/search/artifact?name=lib&repos=libs-release-local
{
"results": [
{
            "uri": "http://localhost:8081/artifactory/api/storage/libs-release-local/org/acme/lib/ver/lib-ver.pom"
        },{
            "uri": "http://localhost:8081/artifactory/api/storage/libs-release-local/org/acme/lib/ver2/lib-ver2.pom"
        }
]
}
```