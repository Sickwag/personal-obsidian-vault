## 创建并遍历要素类列表
创建工作空间，可以省去写入绝对路径的字符
```python
arcpy.env.workspace = "C:/PythonStart"
count = arcpy.management.GetCount("ambulances.shp")
print(count)
```
