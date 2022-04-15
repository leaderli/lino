---
tags:
  - java/框架/poi
  - office
  - excel
date updated: 2022-04-15 15:02
---

在生成`excel`时，当为单元格填充内容为数字时，生成的 excel 的数字单元格左上角提示绿色小三角。可在填充单元格值时使用`Double`类型

```java
XSSFCell cell = row.createCell(cellNum);
cell.setCellType(Cell.CELL_TYPE_STRING);
if(value.matches("\\d+")){
    cell.setCellValue(Double.valueOf(value));
}else{
    cell.setCellValue(value);
}
```
