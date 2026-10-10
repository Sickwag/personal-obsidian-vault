---
参考: https://learnopengl-cn.github.io/
crea: 2026-10-09
---
# Hello Triangle
## VBO 与对象句柄
`GLuint vbo` 保存的是 OpenGL 缓冲对象的名称（句柄），不是缓冲区的数据，也不是可以解引用的内存地址。`GLuint` 是 OpenGL 定义的无符号整数类型；教程写成 `unsigned int`，更推荐使用 API 对应的 `GLuint`。
可以类比 Linux 文件描述符：一个 `int fd` 能标识很大的文件，因为文件内容不在 `fd` 中。同样，一个整数句柄可以标识包含数 MB 顶点数据的缓冲对象。
数据流：CPU 顶点数组 → `glBufferData` 复制数据到 OpenGL 管理的缓冲存储 → VAO 描述读取规则 → 绘制时读取属性 → 顶点着色器。
缓冲存储的具体物理位置由驱动管理，不保证始终位于独立显存；你的 Intel 核显使用共享内存，但 API 抽象不变。VBO 是缓冲对象被用于顶点数据时的称呼，并不是一种 C++ 容器。
```cpp
GLuint vbo = 0;
glGenBuffers(1, &vbo); // 生成对象名称，还没有分配顶点数据存储。
glBindBuffer(GL_ARRAY_BUFFER, vbo); // 首次绑定使名称获得缓冲对象状态。
glBufferData(GL_ARRAY_BUFFER, sizeof(vertices), vertices, GL_STATIC_DRAW);
// glBufferData 分配/替换数据存储；vertices 非空时复制其内容。
// 调用返回后，原 CPU 数组不需要为该副本继续存活。
glDeleteBuffers(1, &vbo); // 在仍有有效上下文时释放对象；vbo 变量不会自动归零。
vbo = 0;
```
复制句柄只会得到指向同一对象的另一个整数，不会复制缓冲数据，也不会自动管理生命周期。封装 RAII 时应明确所有权，通常禁止拥有者拷贝、允许移动，且析构时必须有合适的 OpenGL 上下文。
[Khronos：缓冲对象](https://wikis.khronos.org/opengl/Buffer_Object)
## 批量生成缓冲对象
函数签名为 `void glGenBuffers(GLsizei n, GLuint* buffers)`。第一个参数 `n` 表示要生成多少个缓冲对象名称，第二个参数指向能容纳至少 `n` 个 `GLuint` 的输出空间。它不是缓冲区字节大小，也不是顶点数量。
```cpp
GLuint buffers[3]{};
glGenBuffers(3, buffers); // 分别写入 buffers[0]、buffers[1]、buffers[2]。
```
`glGenBuffers(3, &vbo)` 若 `vbo` 只是一个独立变量，会越界写入，因为 API 需要三个整数的输出空间。返回的名称非零，不保证连续；删除后的名称可能再次被使用。`n = 0` 不生成名称，`n < 0` 产生 `GL_INVALID_VALUE`。
需要先创建并激活 OpenGL 上下文、加载函数入口，再调用这些 API。`glGenBuffers` 只生成名称，真正的数据存储由后续 `glBufferData` 分配。
[Khronos：glGenBuffers](https://registry.khronos.org/OpenGL-Refpages/gl4/html/glGenBuffers.xhtml)
## RGB 的颜色数量
“超过 1600 万种颜色”来自常见的 24 位 RGB 编码：R、G、B 各使用 8 位，每个通道有 `2^8 = 256` 个取值，因此组合数为 `256^3 = 2^24 = 16,777,216`。如果再加 8 位 Alpha，是 32 位 RGBA；Alpha 表示透明度/覆盖相关信息，不是第四种基础颜色。
`0.0～1.0` 是常用颜色数值表达范围，不直接决定颜色数量。用浮点数计算颜色后，写入 RGB8/RGBA8 格式的附件时会量化成相应的 8 位通道值；窗口默认帧缓冲的实际格式取决于创建配置，不能仅凭使用 `vec4` 就认定一定有 24 位 RGB。
例如在线性数值编码下，8 位通道值 `128` 对应约 `128/255 = 0.502`；sRGB 格式还涉及编码/解码，编码值与线性光强不是简单比例。浮点帧缓冲可以保留更高精度，并支持 HDR 中超过 `1.0` 的颜色值。
RGB 是加色模型：`(1, 0, 0)` 为红色，`(0, 1, 0)` 为绿色，`(1, 1, 0)` 为黄色。这是颜色通道叠加，与颜料的减色混合不同，也不等同于开启 OpenGL 的 Alpha 混合功能。
[Khronos：图像格式](https://wikis.khronos.org/opengl/Image_Format)
## 着色器附件与链接顺序
`glAttachShader(program, shader)` 将着色器加入程序的待链接集合；顶点着色器和片段着色器的挂接顺序没有要求。阶段类型在 `glCreateShader(GL_VERTEX_SHADER)` 或 `glCreateShader(GL_FRAGMENT_SHADER)` 时已经确定，链接器不依靠调用顺序猜测类型。
```cpp
// 与先挂接 vertexShader 再挂接 fragmentShader 等价。
glAttachShader(shaderProgram, fragmentShader);
glAttachShader(shaderProgram, vertexShader);
glLinkProgram(shaderProgram);
```
链接器按阶段类型组合程序，并检查阶段间接口是否兼容；执行时按渲染管线规定的阶段顺序运行。挂接不会立即执行着色器，也不会把第一个挂接的着色器“接到”第二个上。
需要区分 API 顺序与附件顺序：创建对象必须先于使用；本次链接需要的对象必须在 `glLinkProgram` 前挂接并成功编译；链接成功后才能正常使用程序。可以先挂接再编译，但首次学习时推荐“创建 → 源码 → 编译并检查 → 挂接 → 链接并检查 → 使用”。编译成功不保证链接成功，应检查 `GL_LINK_STATUS` 和 `glGetProgramInfoLog`。
OpenGL 允许同一阶段挂接多个着色器对象来提供不同的函数实现，但该阶段最终必须形成合法程序，不能出现多个 `main` 或冲突定义。重复挂接同一对象到同一程序会产生 `GL_INVALID_OPERATION`。
[Khronos：glAttachShader](https://registry.khronos.org/OpenGL-Refpages/gl4/html/glAttachShader.xhtml)
[Khronos：着色器编译与链接](https://wikis.khronos.org/opengl/Shader_Compilation)
## 顶点属性的归一化
`glVertexAttribPointer` 的 `normalized` 参数控制整数格式属性如何转换成着色器中的浮点值，不是对整个数组进行 min-max 缩放，也不是将向量长度变为 1，更不是坐标的透视除法。

| 输入数据格式 | `GL_FALSE` | `GL_TRUE` |
|---|---|---|
| `GL_UNSIGNED_BYTE` | `0～255` 直接转为 `0.0～255.0` | 除以 `255`，得到 `0.0～1.0` |
| `GL_BYTE` | `-128～127` 直接转为浮点值 | OpenGL 3.3 的有符号归一化得到 `-1.0～1.0` |
| `GL_FLOAT` | 保持原浮点值 | 参数不影响原浮点值 |
教程使用 `GL_FLOAT`，因此写 `GL_FALSE` 表达“不需要整数归一化转换”；改成 `GL_TRUE`，这里的位置数据不会改变，即使数值超过 `1.0` 也不会因此被压缩或截断。
> [!Note]
> 有符号整数归一化的精确映射存在版本差异：OpenGL 3.3 的 `GL_BYTE` 映射为 `(2c + 1)/255`；OpenGL 4.2 起改为 `max(c/127, -1)`。两者端点范围相同，但零值和内部值略有差异。初学颜色压缩优先使用无符号类型。
典型用途是节省顶点存储与带宽：RGBA 颜色使用四个 `GL_UNSIGNED_BYTE` 只需 4 字节，使用四个 `GL_FLOAT` 需要 16 字节。着色器仍可接收 `vec4`，读取时自动转成 `0～1` 的浮点颜色，代价是量化精度下降。
如果数据语义是骨骼索引等整数，着色器输入为 `ivec*`/`uvec*`，应使用 `glVertexAttribIPointer` 保持整数语义；它没有 `normalized` 参数。不能用浮点属性读取接口来代替真正的整数输入接口。
[Khronos：glVertexAttribPointer](https://registry.khronos.org/OpenGL-Refpages/gl4/html/glVertexAttribPointer.xhtml)
[Khronos：归一化整数](https://wikis.khronos.org/opengl/Normalized_Integer)
## 顶点布局与空隙
教程描述的是示例数组的布局，不是所有顶点必须遵守的格式。VBO 本身只有字节数据，不携带“这是位置、颜色、法线”的含义；属性配置决定如何解释这些字节。
普通属性可使用 1～4 个分量和多种数据类型；位置可以是二维 `vec2`、三维 `vec3` 或齐次 `vec4`。顶点还可包含颜色、法线、纹理坐标等。属性可以交错存储在一个 VBO，也可以分散到多个 VBO。GLSL 矩阵输入需要占用多个属性位置，并分别配置其列。
读取规则：第 `i` 个顶点的某属性起点 = VBO 起点 + `offset` + `i × stride`。对于教程的非实例化绘制，`stride` 是相邻顶点的同一属性起点之间的字节距离，不是属性内部相邻分量的距离。
调用 `glVertexAttribPointer(index, size, type, normalized, stride, offset)` 时，`index` 对应着色器输入位置，`size` 指定分量数，`type` 指定分量格式，最后两个参数以字节为单位。绑定 VBO 时，最后一个参数虽然类型是 `const void*`，含义却是缓冲内字节偏移，不是 CPU 数组地址。
### 顶点之间或属性之间存在空隙
允许。典型结构是“位置 + 颜色”，以及由 C++ 对齐规则产生的尾部填充；使用 `sizeof(Vertex)` 作步长、`offsetof` 作字段偏移，避免硬编码结构布局。
```cpp
#include <cstddef>
#include <type_traits>

struct Vertex {
    float position[3];
    float reserved; // 位置与颜色之间的空隙/其他数据。
    unsigned char color[4];
};
static_assert(std::is_standard_layout_v<Vertex>);
static_assert(sizeof(float) == 4);

// 前提：已绑定非零 VAO 和保存 Vertex 数组的 VBO。
glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, sizeof(Vertex),
    reinterpret_cast<const void*>(offsetof(Vertex, position)));
glEnableVertexAttribArray(0);
glVertexAttribPointer(1, 4, GL_UNSIGNED_BYTE, GL_TRUE, sizeof(Vertex),
    reinterpret_cast<const void*>(offsetof(Vertex, color)));
glEnableVertexAttribArray(1);
// 顶点着色器输入：location 0 为 vec3，location 1 为 vec4。
```
旧式 `glVertexAttribPointer` 中 `stride = 0` 表示该属性自身紧密排列：三个 `GL_FLOAT` 时等效步长为 12 字节。对于上述交错结构，不能用 `0` 代替 `sizeof(Vertex)`。不要将该规则套用到其他顶点绑定 API，它们的零步长语义可能不同。
配置记录在当前 VAO 中，包括属性对应的 VBO、格式、偏移和步长。之后重新绑定 `GL_ARRAY_BUFFER` 不会自动修改已记录的属性来源；`glEnableVertexAttribArray` 是单独的启用操作。
### 同一位置的分量之间存在空隙
普通 `glVertexAttribPointer(..., 3, GL_FLOAT, ...)` 假定同一属性的三个分量连续存储；`stride` 不能指定 x、y、z 之间的间隔。
若数据为 `[x, padding, y, padding, z, padding]`，有两种常见方案：重新打包为连续的三个分量；或将 x、y、z 分别配置成三个 `size = 1` 的属性，设置各自偏移与顶点步长，在顶点着色器中组合成 `vec3`。位置分量也可来自三个独立 VBO。
[Khronos：顶点属性指定](https://wikis.khronos.org/opengl/Vertex_Specification)
## 着色器输入输出与内建位置
`in`/`out` 都是相对于当前着色器阶段而言：`in` 接收输入，`out` 写出输出。顶点着色器的 `in` 通常来自顶点属性读取；片段着色器的 `in` 通常来自前一阶段输出，经光栅化插值。
`gl_Position` 是内建的 `vec4` 输出变量，已经由 GLSL 预先声明，因此无需自己写 `out vec4 gl_Position`。它不是从外部传入的输入；顶点着色器负责为它赋值，管线随后用它进行裁剪和位置变换。
```glsl
// 顶点着色器
#version 330 core
layout(location = 0) in vec3 a_position;
layout(location = 1) in vec4 a_color;
out vec4 vertex_color;
void main() {
    gl_Position = vec4(a_position, 1.0);
    vertex_color = a_color;
}
```
```glsl
// 片段着色器：GLSL 330 中以相同名称和兼容类型匹配该阶段间变量。
#version 330 core
in vec4 vertex_color;
layout(location = 0) out vec4 fragment_color;
void main() {
    fragment_color = vertex_color;
}
```
`vertex_color` 默认按 `smooth` 规则进行透视正确插值，所以三角形内部的颜色可以连续变化。颜色是自定义输出，因此需要声明；`gl_Position` 是内建输出，因此不需要重复声明。核心模式不使用旧教程中的 `gl_FragColor`，片段颜色输出通常自行命名。
`gl_Position` 表示裁剪空间位置 `(x_c, y_c, z_c, w_c)`，不是一般意义上的 NDC。默认 OpenGL 裁剪体满足 `-w_c ≤ x_c,y_c,z_c ≤ w_c`；裁剪之后，透视除法得到 NDC：`(x_c/w_c, y_c/w_c, z_c/w_c)`。教程设置 `w_c = 1`，所以两者数值恰好相同，容易掩盖这一步。
阶段链路：顶点属性 → 顶点着色器 `in` → `gl_Position` 与自定义 `out` → 图元装配、裁剪、光栅化及插值 → 片段着色器 `in` → 颜色 `out` → 深度/模板测试与混合等操作 → 帧缓冲。具体实现允许部分测试提前执行，片段输出也不必然成为最终像素颜色。
片段着色器颜色输出的 `location = 0` 表示输出槽位，不是“连接到顶点属性 0”；它通过绘制缓冲设置映射到帧缓冲目标。片段也不等于最终像素：同一像素可能对应多个片段，MSAA 下还涉及多个采样点。
[Khronos：gl_Position](https://registry.khronos.org/OpenGL-Refpages/gl4/html/gl_Position.xhtml)
[Khronos：着色器阶段接口](https://wikis.khronos.org/opengl/Shader_Compilation)
## 复杂形状与图元
`GL_TRIANGLES` 等常量描述如何把顶点序列组装成基础图元，而不是提供“画球”“画人物”等高级形状。`GL_TRIANGLES` 每三个顶点形成一个独立三角形；顶点的位置、索引连接关系和数量决定最终形状。
复杂模型通常表示为三角网格：建模软件或程序生成顶点与三角形索引 → VBO 保存属性、EBO 保存索引 → `glDrawElements(GL_TRIANGLES, ...)` 绘制所有三角形 → 着色器完成位置变换、光照和材质计算。
```cpp
// 四个顶点组成一个矩形，两个三角形共用一条边。
// 顶点顺序：0 左下，1 右下，2 右上，3 左上。
unsigned int indices[] = {0, 1, 2, 2, 3, 0};
// 前提：已设置顶点属性，并在当前 VAO 上绑定/上传 EBO。
glDrawElements(GL_TRIANGLES, 6, GL_UNSIGNED_INT, nullptr);
// 6 是索引个数；最后一个参数是 EBO 内的字节偏移。
```
圆可通过圆心和圆周采样点组成三角形，球可通过经纬采样或细分多面体形成三角网格；采样越密，轮廓越接近连续曲面，但顶点和图元处理成本越高。三角形必定共面、内部插值规则明确，适合 GPU 统一处理。
任意凹多边形或带孔多边形需要先三角剖分；简单地使用 `GL_TRIANGLE_FAN` 不能正确覆盖所有这类形状。三角形绕序还会影响正反面判定与背面剔除。
动态变形通常保持网格连接关系，通过更新顶点、顶点着色器变换、骨骼蒙皮等改变位置。纹理和片段着色器可以增加表面细节，但不会自动改变网格轮廓。
扩展知识：OpenGL 4.0 起提供细分着色器，可由 `GL_PATCHES` 描述的控制点生成细分图元；你的显卡支持，但教程请求 3.3 Core 时应先按 3.3 能力编写。几何着色器也能生成图元，但有输出限制，不是所有复杂模型的通用生成方案。
另一种方法是在覆盖屏幕的三角形上运行片段着色器，通过有符号距离场、光线步进等计算复杂形状。此时光栅化的基础图元仍是三角形，复杂形状由着色器决定哪些片段保留以及如何着色。
[Khronos：图元](https://wikis.khronos.org/opengl/Primitive)
[Khronos：glDrawElements](https://registry.khronos.org/OpenGL-Refpages/gl4/html/glDrawElements.xhtml)
## 验证练习
1. 将位置属性的 `GL_FLOAT` 配置从 `GL_FALSE` 改为 `GL_TRUE`，图像应不变；再将颜色改为 `GL_UNSIGNED_BYTE`，对比开关归一化后的结果。
2. 在顶点结构中增加一个填充字段，用 `sizeof` 和 `offsetof` 更新布局，验证三角形不变；故意保留旧步长，观察读取错位。
3. 交换顶点与片段着色器的挂接顺序，检查链接状态和显示结果应相同。
4. 用四个顶点和六个索引绘制矩形，再生成圆周顶点与三角形索引，观察采样数量对轮廓的影响。
## VAO 与 VBO 的分工
VBO 保存顶点的实际字节数据；VAO 保存“从哪些缓冲区、按什么格式读取哪些顶点属性”的配置。VAO 不保存顶点数据副本，也不保存着色器程序。
可以类比读取二进制文件：VBO 是文件内容，VAO 是解析描述。例如描述规定“属性 0 来自缓冲 B，每次读取三个浮点数，起始偏移 0，相邻记录间隔 12 字节”。只有数据，没有描述，无法知道字节代表位置还是颜色；只有描述，没有数据，也无法取得顶点。

| 对象 | 保存内容 | 关键操作 |
|---|---|---|
| VBO | 顶点数据的字节存储 | `glBufferData`、`glBufferSubData` |
| VAO | 属性启用状态、属性来源缓冲、分量数、格式、转换规则、步长、偏移，以及 EBO 绑定等 | `glVertexAttribPointer`、`glEnableVertexAttribArray` |
| 着色器程序 | 如何计算顶点位置、片段颜色等 | `glUseProgram` |
### 跟踪自己的三角形代码
你的 `vertices` 有九个浮点数：三个顶点，每个顶点三个分量。`glBufferData` 上传后，VBO 中保存的仍只是九个浮点数对应的字节，不会自动获得“每三个组成一个位置”的语义。
```cpp
glBindVertexArray(VAO); // 选择接下来要配置的 VAO。
glBindBuffer(GL_ARRAY_BUFFER, VBO); // 选择当前 ARRAY_BUFFER 来源。
glBufferData(GL_ARRAY_BUFFER, sizeof(vertices), vertices, GL_STATIC_DRAW);
glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 3 * sizeof(float), nullptr);
// 这一刻将当前 VBO 和读取规则记录进 VAO 的属性 0。
glEnableVertexAttribArray(0); // 在当前 VAO 中启用属性 0。
glBindBuffer(GL_ARRAY_BUFFER, 0); // 不会抹掉此前记录的来源。
glBindVertexArray(0); // 取消当前 VAO 绑定，不会删除其配置。
```
完成配置后，VAO 的属性 0 可理解为下面这条记录：
```text
属性位置 0:
    enabled = true
    source_buffer = VBO
    components = 3
    component_type = GL_FLOAT
    normalized = false
    stride = 12 字节（当前环境 float 为 4 字节）
    offset = 0 字节
```
绘制时：`glBindVertexArray(VAO)` 选择这套配置 → `glDrawArrays(GL_TRIANGLES, 0, 3)` 请求三个顶点 → 从 VBO 偏移 0、12、24 字节各读取三个浮点数 → 分别传给顶点着色器 `layout(location = 0) in vec3 aPos` → 组成三角形。
`glDrawArrays` 提供图元类型、起始顶点和数量；VAO 不保存这些绘制参数。`glUseProgram` 另外选择计算程序；绑定 VAO 不会自动选择着色器。
### 绑定与记录的区别
OpenGL 的绑定可理解为“选择后续特定 API 的操作对象”。它既不复制数据，也不自动执行绘制。
在教程的旧式属性 API 中，单独 `glBindBuffer(GL_ARRAY_BUFFER, VBO)` 不会把 VBO 记录进 VAO；真正建立属性与缓冲关系的是 `glVertexAttribPointer`。调用时，它读取当前 `GL_ARRAY_BUFFER` 绑定，将该来源和格式保存到当前 VAO。
例如先绑定 VBO_A 并配置属性 0，再绑定 VBO_B 但不重新调用属性配置函数，属性 0 仍读取 VBO_A。若更新 VBO_A 的内容，下一次绘制读取新数据，因为 VAO 保存来源引用而非数据快照。
一个 VAO 可以从多个 VBO 读取属性，例如位置来自 VBO_A、颜色来自 VBO_B；多个 VAO 也能引用同一个 VBO，以不同布局或偏移读取。因此 VAO 与 VBO 不是一对一关系，也不是拥有与被拥有的 C++ 对象关系。
EBO 是一个需要特别记忆的例外：`glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, ebo)` 会直接修改当前 VAO 的索引缓冲绑定。在 VAO 仍绑定时将该目标绑定为 0，会解除它的 EBO 关联。
OpenGL Core 模式配置顶点属性和绘制时需要有效的非零 VAO；`glBindVertexArray(0)` 表示没有绑定 VAO，不能把它当成可配置的默认 VAO。
VAO 的作用是保存并复用完整的顶点输入配置：初始化时配置一次，绘制不同网格时绑定相应 VAO，而不必每次重新设置所有属性。它不负责复制或上传数据。
[Khronos：顶点属性与 VAO 状态](https://wikis.khronos.org/opengl/Vertex_Specification)
## 三角形程序的构建错误
排查对象：`/home/azzato/CodeFiles/temporal/learnOpenGLPlaygroud`。2026-10-09 使用 `cmake --build --preset release` 复现；实际错误发生在 C++ 编译阶段，尚未到可执行文件链接阶段。
### 首个错误引发大量后续报错
当前代码先包含 `<GLFW/glfw3.h>`，后包含 `<glad/glad.h>`。默认情况下，GLFW 头文件会包含系统 OpenGL 头文件；GLAD 检测到它已经被包含，触发 `#error OpenGL header already included`。
预处理失败以及系统头文件的 include guard 冲突导致所需的现代 OpenGL 声明不可用，随后出现大量 `glCreateShader`、`glGenBuffers` 等 `was not declared in this scope`。这些错误不能通过反复添加链接库解决，需要先修正头文件包含顺序。
```cpp
#include <glad/glad.h>
#include <GLFW/glfw3.h>
#include <cstddef>
#include <iostream>
```
另一个方案是在包含 GLFW 前定义 `GLFW_INCLUDE_NONE`，阻止它引入系统 OpenGL 头文件。当前示例只需将 GLAD 放在最前面，不需要同时采用两种方案。
### 剩余源码问题

| 位置 | 当前问题 | 修正与原因 |
|---|---|---|
| 第 17、23 行 | `constexpr char*` 指向字符串字面量 | 改为 `constexpr const char*`；字面量内容不可修改 |
| 第 54 行 | `GL_FRAGMENT_SHADER_ARB` | 改为核心枚举 `GL_FRAGMENT_SHADER`；当前 GLAD 生成配置不包含该 ARB 扩展枚举 |
| 第 59 行 | 曾使用全角逗号 `，` | 已由用户改成 ASCII 逗号 `,`，此项已解决 |
| 第 37 行，Apple 分支 | `GLFW_OPENGL_FORWARD_COMPACT` 拼写错误 | 正确名称为 `GLFW_OPENGL_FORWARD_COMPAT`；Linux 下该分支未编译，因此不是当前报错原因 |
`constexpr char*` 中指针是常量表达式，不意味着指向的数据是 `const`。`constexpr const char*` 同时表达编译期指针值与只读字符数据；传给 `glShaderSource` 的 `const GLchar* const*` 参数也需要这种只读来源。
当前机器支持 OpenGL 4.6，因此请求 4.6 不是此次编译错误原因；为与教程一致，也可以请求 3.3 Core。GLSL `#version 330 core` 可以在支持该版本的 4.6 上下文使用。
### 编译、链接与运行期加载

| 阶段 | 典型错误 | 需要检查 |
|---|---|---|
| C++ 预处理/编译 | `#error`、`not declared`、`cannot convert` | 头文件顺序、宏、名称、语法和类型 |
| C++ 链接 | `undefined reference to glfwInit` 或 `glad_glCreateShader` | 是否链接 GLFW/GLAD 的实现库 |
| 运行时加载 OpenGL 函数 | GLAD 初始化失败或函数指针无效 | 上下文是否创建成功并已设为当前上下文 |
| 运行时编译/链接 GLSL | `GL_COMPILE_STATUS`/`GL_LINK_STATUS` 失败 | 着色器源码和阶段接口，读取对应日志 |
头文件提供声明，链接库提供实现；运行时 `gladLoadGLLoader` 再取得驱动提供的 OpenGL 函数地址。三个步骤各自解决不同问题，不能互相替代。GLSL 程序的链接也不同于 C++ 可执行文件的链接。
当前 CMake 已有 `find_package(glad CONFIG REQUIRED)`、`find_package(glfw3 CONFIG REQUIRED)`，并链接 `glad::glad` 与 `glfw`；生成的链接命令包含 vcpkg 中的 `libglad.a` 和 `libglfw3.a`，因此已有证据表明此次不是缺少这两个库。
### 验证结果与构建命令
保持用户源文件不变，在临时编译输入中修正包含顺序、两处字符串类型和片段着色器枚举后，使用 GCC 的 `-std=c++20 -Wall -Wextra -pedantic-errors` 完成编译及链接，只剩回调中未使用 `window` 参数的警告。该验证未确认窗口显示或渲染结果。
项目目前已有 `build/release` 配置，修改后在项目目录执行：
```sh
cmake --preset release
cmake --build --preset release
./build/release/gl
```
若选择 Debug，应先运行 `cmake --preset debug`，再运行 `cmake --build --preset debug`；配置 preset 与构建 preset 是不同步骤，尚未生成 `build/debug` 时直接构建会失败。
后续运行验证应分别检查 `glfwInit`、窗口创建、GLAD 加载、着色器编译和程序链接状态；初始化或着色器失败时应停止后续使用。初始视口可在 GLAD 加载后通过 `glfwGetFramebufferSize` 获取实际帧缓冲尺寸，再调用 `glViewport`；窗口尺寸与帧缓冲尺寸在高 DPI 环境中可能不同。
