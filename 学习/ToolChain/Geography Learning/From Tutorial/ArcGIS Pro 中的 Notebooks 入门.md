---
title: "ArcGIS Pro 中 Notebooks 入门"
source: "https://learn.arcgis.com/zh-cn/projects/get-started-with-notebooks-in-arcgis-pro/"
author:
published:
created: 2025-04-14
description: "开始学习如何在 ArcGIS Pro 中使用笔记本。 编写代码，通过识别离消防站最远的街区来查找火灾覆盖范围的差距。"
tags:
  - "clippings"
---
## 基础知识
### ArcGIS 中“要素”

#### 1. 要素的定义

在 ArcGIS 中，**要素（Feature）** 是具有 **几何形状** 和 **属性** 的地理实体。要素是地理数据的基本单位，通常表示为 **点（Point）**、**线（Polyline）** 或 **面（Polygon）**。

#### 2. 要素的组成部分

|组成部分|说明|
|---|---|
|**几何形状**|要素的空间位置和形状（如点的坐标、线的节点、面的边界）。|
|**属性**|要素的非空间信息（如名称、面积、长度等），存储在字段中。|
|**图层**|要素通常包含在一个图层（Layer）或要素类（Feature Class）中。|

#### 3. 示例

- 点要素：表示城市的位置（如北京市）。
- 线要素：表示河流或道路（如长江）。
- 面要素：表示行政区划或湖泊（如青海湖）。

---

### ArcGIS 中要素、数据集和表的后缀

#### 1. 文件扩展名

|数据类型|文件扩展名|
|---|---|
|**要素类**|在文件地理数据库中以 `.gdb` 为后缀，没有单独的文件扩展名。|
|**Shapefile**|多个文件，主文件以 `.shp` 为后缀。|
|**栅格**|以 `.tif`、`.img` 等为后缀。|
|**表**|在文件地理数据库中无后缀，在 Excel 中以 `.xlsx` 为后缀。|

#### 2. 为什么有些文件没有后缀？

在 **文件地理数据库（File Geodatabase）** 中，要素类、数据集和表 **没有单独的文件扩展名**。它们以文件系统文件夹的形式存储在 `.gdb` 文件夹中。ArcGIS 通过内部的文件结构和元数据来识别这些数据的类型。

#### 3. 文件类型的识别方式

ArcGIS 通过以下方式识别文件类型：

- **文件结构**：检查文件的内部结构和元数据。
- **文件头信息**：读取文件的头部信息，判断数据类型。
- **元数据索引**：在文件地理数据库中，通过元数据索引快速识别要素类、数据集和表。


```python
arcpy.management.AddXY("ambulances")
```
运行该工具的结果显示在下方。在这种情况下，该工具不会生成新的要素类，而是更新现有要素类的属性表。该工具返回的结果是对当前地图中现有 ambulances 要素图层的引用。
1. **识别 `"ambulances"` 这个点要素类**，并为其中每个点几何对象计算 X 和 Y 坐标。
2. **将坐标值添加到属性表中**，作为新的字段（`POINT_X` 和 `POINT_Y`）。
3. ArcGIS 会根据数据的地理或投影坐标系，自动计算每个点的 X 和 Y 坐标。
- **添加字段(而不是筛选出 ambulance 内容)**：执行代码后，属性表中会新增两个字段：
    - `POINT_X`: 存储点的 X 坐标。
    - `POINT_Y`: 存储点的 Y 坐标。
- **不筛选数据**：这段代码并不会筛选出 `"ambulances"` 要素，而是在现有要素类的属性表中添加坐标字段。
---
代码行 `arcpy.management.AddXY("ambulances")` 有多个不同部分。首先是 ArcPy 模块 arcpy，它可以在 Python 中使用 ArcGIS Pro 的大部分功能，包括几乎所有的地理处理工具。下一个元素 management 是添加 XY 坐标工具所在的**数据管理工具箱的工具箱别名**（这个工具箱的工具被打包放在 management 中）。下一个元素是 AddXY，它是 ArcPy 函数的名称，相当于 ArcGIS Pro 中添加 XY 坐标工具。
Arcpy 中注记命名规范为：
```python
arcpy.<toolboxalias>.<toolname>
arcpy.<toolname>_<toolboxalias>
```
两种可以互换使用，这也就是刚才使用 `arcpy.management.GetCount` 和 `arcpyGetCount_management` 功能相同
### 缓冲区
#### 1. 缓冲区的定义
缓冲区是指在地理空间分析中，围绕某个地理要素（如点、线、面）生成的一个特定范围的区域。缓冲区的宽度可以是一个固定值，也可以基于属性表中字段值动态设定。
#### 2. 缓冲区的返回值
缓冲区工具会生成一个新的 **面要素类**，该要素类包含原始要素的缓冲区域。
#### 3. 缓冲区工具的调用
在 `arcpy` 中，缓冲区工具属于 `analysis` 工具箱，可以通过以下两种方式调用：
- `arcpy.analysis.Buffer`
- `arcpy.Buffer_analysis`
#### 内容
`arcpy.Buffer_analysis` 是 ArcGIS 中用于生成缓冲区（Buffer）的工具。缓冲区是指在某个地理要素（如点、线、面）周围指定距离范围内生成的新多边形。这个工具通常用于空间分析，例如识别邻近区域、确定影响范围等。
`arcpy.Buffer_analysis` 的参数列表如下：
#### 必填参数：
- **`in_features`**: 输入的要素类（点、线、面）。这是你要生成缓冲区的要素。
- **`out_feature_class`**: 输出的要素类路径。生成的缓冲区将保存到这个路径。
- **`buffer_distance_or_field`**: 缓冲区距离，可以是一个固定的距离值（如 "100 Meters"），也可以是一个字段（如 "FieldName"），该字段的值将作为每个要素的缓冲区距离。

#### 可选参数（常用）：
- **`line_side`**: 指定缓冲区的生成方式，适用于线要素。可选值有 `"FULL"`（默认，双侧生成缓冲区）、`"LEFT"`（仅在线的左侧生成缓冲区）、`"RIGHT"`（仅在线的右侧生成缓冲区）。
- **`line_end_type`**: 指定线要素缓冲区的末端形状。可选值有 `"ROUND"`（默认，圆形末端）、`"FLAT"`（平直末端）。
- **`dissolve_option`**: 指定是否合并缓冲区。可选值有 `"NONE"`（默认，不合并）、`"ALL"`（合并所有缓冲区）、`"LIST"`（根据指定字段的值合并缓冲区）。
- **`dissolve_field`**: 当 `dissolve_option` 设为 `"LIST"` 时，指定用于合并缓冲区的字段。

#### 其他可选参数：
- **`method`**: 指定缓冲区的计算方法（仅适用于 ArcGIS Pro）。可选值有 `"PLANAR"`（平面计算）或 `"GEODESIC"`（地理计算）。
- **`template`**: 指定输出要素类的模板。
- **`field_values`**: 指定输出要素类的字段值。

`arcpy.Buffer_analysis` 生成的要素类会保存到你指定的 `out_feature_class` 路径中
`rcpy.ListFeatureClasses()` 动态获取工作空间中所有要素类：
```python
arcpy.PairwiseErase_analysis("etobicoke", "fire_buffer", "no_service")
```
这段代码的意思是从 etobicoke 要素（通常是地图块）中减去 fire_buffer 要素之后留下来的内容转化为一个要素，存储在 no_servive 中
### 差集擦除
ArcGIS 中 `arcpy.PairwiseErase_analysis` 工具，它的作用是进行 **“差集”**（Erase）空间分析。具体来说，它会从第一个输入要素类（`"etobicoke"`）中移除与第二个输入要素类（`"fire_buffer"`）重叠的部分，并将结果保存到第三个参数指定的输出要素类（`"no_service"`）中。

### 描述函数的用法

#### 1. 什么是 `arcpy.da.Describe`？

`arcpy.da.Describe` 是 ArcPy 中一个函数，用于 **获取地理数据的元数据信息**。它可以返回一个==字典==，包含指定地理数据集（如要素类、栅格、字段等）的详细信息。

#### 2. 返回值

`arcpy.da.Describe` 的返回值是一个 **字典**，包含了数据的各种属性信息。例如：

- 数据类型（如 `FeatureClass`、`Raster`、`Table`）。
- 路径、名称、坐标系、字段列表等。

#### 3. 使用方法
```python
arcpy.da.Describe(input_data)
```

##### **参数列表**

|参数名称|说明|
|---|---|
|**`input_data`** (必填)|要描述的地理数据（如要素类、栅格、字段等）。|

##### **常用返回值示例**

| 属性                 | 说明                                       |
| ------------------ | ---------------------------------------- |
| `dataType`         | 数据类型（如 `FeatureClass`、`Raster`、`Table`）。 |
| `catalogPath`      | 数据的完整路径。                                 |
| `shapeType`        | 几何类型（如 `Point`、`Polyline`、`Polygon`）。    |
| `spatialReference` | 坐标系信息。                                   |
| `fields`           | 字段列表（包含字段名称、类型等信息）。                      |
### 列出工作空间中要素类，表和数据集
```python
import arcpy
mypath = "C:/Lessons/PythonDesc"
arcpy.env.workspace = mypath
files = arcpy.ListFeatureClasses() #列出要素
files = arcpy.ListTables() 		   #列出表 dbf
files = arcpy.ListDatasets()  	   #数据集
print(files)
```
列出所有工作目录中**要素类**，原型为 `ListFeatureClasses ({wild_card}, {feature_type}, {feature_dataset})`
`arcpy.ListFeatureClasses` 是 ArcPy 中一个函数，用于 **列出当前工作空间中所有要素类（Feature Classes）**。它可以方便地获取指定文件夹、地理数据库或要素数据集中要素类名称列表。

---
#### 返回值
`arcpy.ListFeatureClasses` 的返回值是一个 **Python 列表**，包含当前工作空间中所有要素类的名称。如果没有找到任何要素类，则返回一个空列表 `[]`。

---
#### 使用方法
以下是 `arcpy.ListFeatureClasses` 的完整语法：
```python
arcpy.ListFeatureClasses({wildcard},{feature_type},{feature_dataset})
```
该函数的参数都是 **可选参数**，具体含义如下：

|参数名称|说明|
|---|---|
|**`wildcard`** (可选)|通配符，用于过滤要素类名称（如 `"Road*"` 匹配以 `Road` 开头的要素类）。|
|**`feature_type`** (可选)|要素类型，用于过滤特定类型的要素类（如 `"Point"`、`"Polyline"`、`"Polygon"`）。|
|**`feature_dataset`** (可选)|仅在地理数据库中有效，指定要列出要素类的要素数据集路径。|

---
#### 参数详解
1. `wildcard` (可选)
- 用途：根据名称过滤要素类。
- 示例：
    - `"Road*"`：匹配以 `Road` 开头的要素类。
    - `"*Park*"`：匹配名称中包含 `Park` 的要素类。
2. `feature_type` (可选)
- 用途：根据要素类型过滤要素类。
- 常用值：
    - `"Point"`：仅列出点要素类。
    - `"Polyline"`：仅列出线要素类。
    - `"Polygon"`：仅列出面要素类.
    - `"Annotation"`：仅列出注记要素类。
    - `"Dimension"`：仅列出尺寸标注要素类。
3. `feature_dataset` (可选)
- 用途：在地理数据库中，指定要列出要素类的要素数据集路径。
- 示例：`"C:/data/geodatabase.gdb/Transportation"`，仅列出 `Transportation` 要素数据集中要素类。