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

[AQL](https://www.jfrog.com/confluence/display/JFROG/Artifactory+REST+API#ArtifactoryRESTAPI-ArtifactoryQueryLanguage(AQL))


```json
POST /api/search/aql 
items.find(
    {
        "repo":{"$eq":"libs-release-local"}
    }
)
```

```json
{
    "results" : [
    {
        "repo" : "libs-release-local",
        "path" : "org/jfrog/artifactory",
        "name" : "artifactory.war",
        "type" : "item type",
        "size" : "75500000",
        "created" : "2015-01-01T10:10;10",
        "created_by" : "Jfrog",
        "modified" : "2015-01-01T10:10;10",
        "modified_by" : "Jfrog",
        "updated" : "2015-01-01T10:10;10"
    }
    ],
    "range" : {
    "start_pos" : 0,
    "end_pos" : 1,
    "total" : 1
    }
}
```
## 参考文档

[Artifactory REST API](https://www.jfrog.com/confluence/display/JFROG/Artifactory+REST+API)


[Artifactory Query Language - JFrog - JFrog Documentation](https://www.jfrog.com/confluence/display/JFROG/Artifactory+Query+Language#ArtifactoryQueryLanguage-Sorting)