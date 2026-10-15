--
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
### RGBA、HEX 与浮点表达
RGBA 表示红、绿、蓝、Alpha 四个通道；HEX 是数字的十六进制写法；`0～1` 是通道数值的归一化表达范围。它们并非互斥规则：`vec4(1,0,0,1)` 本身就是 RGBA，只是没有用 8 位整数表达。
OpenGL 常用浮点接口，因为插值、光照和混合都需要做连续数值计算；0 表示无贡献、1 表示单位强度，也不把计算精度固定在每通道 8 位。并非所有 OpenGL 数据必须在这个范围，浮点纹理/HDR 颜色可超过 1；纹理还可直接上传 `GL_UNSIGNED_BYTE` 的 0～255 通道。
对于 8 位整数 RGBA，逐通道除以 `255.0f`：`(255,128,64,255)` 对应约 `(1,0.502,0.251,1)`。`#FF8040` 表示相同 RGB，若无 Alpha 则自行采用 1。八位 HEX 的排列并不统一，必须先明确是 `#RRGGBBAA` 还是 `#AARRGGBB`。
```cpp
// 明确采用 0xRRGGBBAA 排列，与内存字节序无关。
constexpr unsigned int rgba = 0xFF8040FFu;
glClearColor(((rgba >> 24) & 0xFFu) / 255.0f,
             ((rgba >> 16) & 0xFFu) / 255.0f,
             ((rgba >> 8) & 0xFFu) / 255.0f,
             (rgba & 0xFFu) / 255.0f);
```
OpenGL 没有通用的 `"#FF8040"` 字符串解析 API；由应用解析或封装这个转换。上面只做数值归一化，不是 sRGB 到线性光强转换。来自网页/设计工具的 HEX 通常是 sRGB 编码，做正确线性光照时，RGB 还需 sRGB 解码，并按输出缓冲配置编码；Alpha 不进行同样的 sRGB 变换。初学先区分“数值范围转换”与“颜色空间转换”。
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
### 编译、链接与运行期加载

| 阶段 | 典型错误 | 需要检查 |
|---|---|---|
| C++ 预处理/编译 | `#error`、`not declared`、`cannot convert` | 头文件顺序、宏、名称、语法和类型 |
| C++ 链接 | `undefined reference to glfwInit` 或 `glad_glCreateShader` | 是否链接 GLFW/GLAD 的实现库 |
| 运行时加载 OpenGL 函数 | GLAD 初始化失败或函数指针无效 | 上下文是否创建成功并已设为当前上下文 |
| 运行时编译/链接 GLSL | `GL_COMPILE_STATUS`/`GL_LINK_STATUS` 失败 | 着色器源码和阶段接口，读取对应日志 |
头文件提供声明，链接库提供实现；运行时 `gladLoadGLLoader` 再取得驱动提供的 OpenGL 函数地址。三个步骤各自解决不同问题，不能互相替代。GLSL 程序的链接也不同于 C++ 可执行文件的链接。
当前 CMake 已有 `find_package(glad CONFIG REQUIRED)`、`find_package(glfw3 CONFIG REQUIRED)`，并链接 `glad::glad` 与 `glfw`；生成的链接命令包含 vcpkg 中的 `libglad.a` 和 `libglfw3.a`，因此已有证据表明此次不是缺少这两个库。
## 属性槽位如何连接到着色器
### 分清槽位、分量和顶点数量
`layout(location = 0) in vec3 aPos` 是开发者声明的输入接口，不是 `aPos` 自己识别了 CPU 数组结构。这里有三个独立维度：属性槽位、每个属性的分量数、此次绘制的顶点数量。

| 概念 | 示例中对应的代码 | 含义 |
|---|---|---|
| 属性槽位 | `location = 0`、`glVertexAttribPointer` 第一个参数 `0` | 当前顶点的位置属性从编号 0 的输入通道读取 |
| 单个属性的分量数 | `vec3`、`glVertexAttribPointer` 第二个参数 `3` | 一个顶点的位置包含 x、y、z 三个分量 |
| VBO 的存储大小 | `glBufferData(..., sizeof(vertices), ...)` | 为顶点字节数据提供存储空间 |
| 本次绘制的顶点数量 | `glDrawArrays(GL_TRIANGLES, 0, 3)` 最后一个参数 | 此次从编号 0 开始处理三个顶点 |
一个属性槽位不是“一个顶点”或“一个三角形”，也不是装着三个顶点的 `vec3` 数组。对每个被处理的顶点，槽位 0 提供一个属性值。在这个例子里，该值是包含三个浮点分量的 `vec3`。
顶点着色器中的一次逻辑执行处理一个顶点。GPU 实际可以并行和批量执行；源码中的 `main()` 不接收整个三角形数组，也不能通过 `aPos` 直接看到另外两个顶点。
### 两端共同约定输入接口
GLSL 声明告诉着色器编译器：“变量 `aPos` 的类型是 `vec3`，位于属性槽位 0”。C++ 配置告诉顶点属性读取机制：“槽位 0 从这个 VBO 中读取三个 `GL_FLOAT`，步长和偏移按以下规则计算”。这两端的约定由开发者保持一致。
```cpp
// 前提：已绑定当前 VAO、对应 VBO，且已上传数据。
glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 3 * sizeof(float), nullptr);
glEnableVertexAttribArray(0);
// 第一个 0：属性槽位。
// 第二个 3：每个顶点在此槽位提供三个分量，不是三个顶点。
// stride：找到下一个顶点同一属性的位置。
// nullptr：该属性从 VBO 的第 0 字节开始。
```
OpenGL 按 VAO 配置读取和转换字节，向着色器提供属性值；不需要构造一个与 CPU `struct Vertex` 完全相同的 C++ 数据结构。GPU 的寄存器布局和取数实现由驱动/硬件决定，程序依赖的是 API 定义的值与接口。
着色器编译/链接不要求提前知道 VAO 布局，`glVertexAttribPointer` 也不需要当前程序已有 `aPos`；两套配置在绘制时结合。这解释了为什么它们可以分别初始化，也解释了为什么错配可能链接成功却画出错误图像。
### 三个顶点的数据如何逐个读取
对于教程的九个浮点数，假设 `sizeof(float) = 4`，调用 `glDrawArrays(GL_TRIANGLES, 0, 3)` 后，逻辑上的输入为：

| 顶点编号 | VBO 字节起点 | 此次执行的 `aPos` |
|---|---|---|
| 0 | `0 + 0 × 12 = 0` | `vec3(-0.5, -0.5, 0.0)` |
| 1 | `0 + 1 × 12 = 12` | `vec3(0.5, -0.5, 0.0)` |
| 2 | `0 + 2 × 12 = 24` | `vec3(0.0, 0.5, 0.0)` |
三个顶点的位置都通过槽位 0 输入，只是在不同顶点的执行中取不同值。`GL_TRIANGLES` 再规定每三个顶点组装为一个三角形。
`glBufferData` 上传 36 字节并不意味着每次必须画三个顶点，OpenGL 不根据 VBO 大小推断此次绘制数量。同一缓冲可以存多个网格的一部分，程序通过绘制参数选择数据范围；必须确保所请求的读取范围实际存在。
### 为什么选槽位零
槽位 0 是教程选择的接口编号，没有“位置必须在槽位 0”的规定。可以改为 `layout(location = 2) in vec3 aPos`，同时将配置和启用函数的属性索引改为 `2`。只改一端，着色器就不能获得原先那份数组数据。
更复杂的顶点可以约定位置为 0、颜色为 1、法线为 2、纹理坐标为 3；每个顶点通过这些槽位分别获得各属性。槽位数量受 `GL_MAX_VERTEX_ATTRIBS` 限制，矩阵输入可占多个连续槽位。
也可不写显式 `layout`：在链接前用 `glBindAttribLocation(program, index, "aPos")` 指定，或链接后用 `glGetAttribLocation(program, "aPos")` 查询分配结果。查询未使用、被优化掉的输入可能返回 `-1`；不能把它直接转成无符号属性索引。显式 `layout` 存在时优先采用它的编号。
### 类型与分量数的匹配边界
`vec3` 是 GLSL 自己的声明，不是从 `glVertexAttribPointer` 自动推导出来。推荐将两端配置清楚地对应，但 OpenGL 的浮点属性读取也允许分量补齐和丢弃：提供两个分量给 `vec3` 时 z 补为 0；提供三个分量给 `vec4` 时 w 补为 1；多余分量可不被输入使用。这些规则不改变 VBO 的数据布局。
整数数据通过 `glVertexAttribPointer` 可以转成浮点输入；若 GLSL 输入是 `ivec*` 或 `uvec*`，使用 `glVertexAttribIPointer`。属性未启用时使用当前通用属性值，而不是自动读取 VBO；因此 `glEnableVertexAttribArray` 也是输入链路的一部分。
[Khronos：顶点输入与属性配置](https://wikis.khronos.org/opengl/Vertex_Specification)
[Khronos：glDrawArrays](https://registry.khronos.org/OpenGL-Refpages/gl4/html/glDrawArrays.xhtml)
## 着色器文件、资源与预编译
### 为什么教程在运行时编译
C++ 编译器把 GLSL 字符串视为普通字符数据，不会理解或编译其中的着色器。OpenGL 程序运行后，通过当前上下文对应的驱动编译 GLSL，针对实际 GPU、驱动和支持能力生成可执行代码，再链接各阶段接口。
这种方式允许分发同一份 GLSL 源码，在不同厂商硬件上由各自驱动处理，不要求开发者提前为所有 GPU 提供机器码。通常在初始化或加载材质时编译一次，而不是在每帧循环中重复编译。
源码不必硬编码。可以放到 `.vert`、`.frag` 文件，用 `std::ifstream` 或 Qt 的文件 API 读取，再交给 `glShaderSource` 或 `QOpenGLShaderProgram`。独立文件便于语法高亮、定位错误、版本管理和开发期间热重载；普通文件部署时需要处理路径和文件分发。
### 能否提前编译
可以提前做部分工作，但要区分资源打包、中间码编译和目标驱动生成最终程序。

| 方案 | 运行前可以完成的工作 | 运行时仍需做什么与限制 |
|---|---|---|
| GLSL 文件/qrc | 保存、组织、打包源码 | 在上下文中编译、链接 |
| 离线 GLSL 检查 | 用工具尽早发现语法/接口错误 | 目标驱动仍要编译；离线检查不能保证所有驱动行为相同 |
| OpenGL 程序二进制缓存 | 之前运行时保存驱动生成的程序二进制 | 加载并检查成功；二进制依赖实现，驱动或环境变化后可能失效，需要源码回退 |
| OpenGL SPIR-V 路径 | 用支持 OpenGL 语义的离线工具生成中间码 | 加载、specialize、链接，驱动仍可能生成/优化 GPU 机器码；需要 OpenGL 4.6 或相应扩展 |
Qt 的 `addCacheableShaderFromSourceFile` 配合 `link()` 可使用程序二进制磁盘缓存：命中有效缓存且上下文支持时，可以跳过源码编译和链接；无缓存或不支持时回退到源码流程。这是跨运行缓存，不代表首次启动前已经完成编译。
SPIR-V 是中间表示，不是通用于所有显卡的最终机器码。其 OpenGL 路径是 `glShaderBinary(..., GL_SHADER_BINARY_FORMAT_SPIR_V, ...)` → `glSpecializeShader(...)` → `glLinkProgram(...)`；不能直接把按 Vulkan 语义编译的任意 SPIR-V 当作 OpenGL 输入。教程的 3.3 Core 基线不保证支持该方案。
对当前学习阶段，推荐独立 GLSL 文件或 qrc + 初始化时编译；熟悉完整输入与绘制链路后再研究缓存和 SPIR-V。上述工具方案仅解释可选能力，本次未安装工具或修改项目依赖。
[Qt：可缓存着色器接口](https://doc.qt.io/qt-6/qopenglshaderprogram.html#addCacheableShaderFromSourceFile)
[Khronos：OpenGL 4.6 与 SPIR-V](https://www.khronos.org/news/press/khronos-releases-opengl-4.6-with-spir-v-support)
[Khronos：程序二进制](https://registry.khronos.org/OpenGL-Refpages/gl4/html/glProgramBinary.xhtml)
## EBO 与索引绘制
### 顶点表与索引序列
EBO（Element Buffer Object，元素缓冲对象）是保存顶点索引的缓冲对象，也称索引缓冲。它和 VBO 都是通过 `glGenBuffers` 创建的普通缓冲对象，只是用途不同：VBO 保存属性数据，EBO 保存要按什么编号读取顶点。
可以类比数组与下标：VBO 是 `vertices` 的数据，EBO 是 `indices` 的数据；读取 `indices[k]` 得到顶点编号 j，再按 VAO 中的属性规则读取顶点 j。索引 j 不是字节地址，也不是属性槽位。
矩形有四个顶点：0 左下、1 右下、2 右上、3 左上。拆成两个三角形时，使用索引 `{0, 1, 2, 2, 3, 0}`：第一个三角形为 0、1、2，第二个为 2、3、0。位置 0 和 2 被重复引用，不需要在 VBO 中重复存储。

| EBO 中的序号 k | 索引值 j | 位置属性读取起点，假设步长 12 字节 |
|---|---|---|
| 0 | 0 | VBO 第 0 字节 |
| 1 | 1 | VBO 第 12 字节 |
| 2 | 2 | VBO 第 24 字节 |
| 3 | 2 | 再次引用第 24 字节 |
| 4 | 3 | VBO 第 36 字节 |
| 5 | 0 | 再次引用第 0 字节 |
这里有四份不同顶点数据、六个索引引用、两个三角形。驱动可能复用重复索引的顶点着色结果，因此不能将六个索引机械理解为六次实际 GPU 着色器执行。
复用是否节省空间取决于重复率和顶点大小：本例仅位置数据，无索引时为 `6 × 12 = 72` 字节；四个位置加六个 32 位索引也是 `4 × 12 + 6 × 4 = 72` 字节。属性越多、重复引用越多时，索引通常越有价值；并不是加入 EBO 就一定更省内存或更快。
一个索引选择该顶点的所有逐顶点属性。如果同一空间位置有不同法线或纹理坐标，例如硬边或 UV 接缝，需要拆成不同的完整顶点记录；不能只因位置相同就合并。实例化属性有不同的取数规则，不属于这里的普通逐顶点索引。
### 解释绘制调用的四个参数
```cpp
glDrawElements(GL_TRIANGLES, 6, GL_UNSIGNED_INT, nullptr);
```
1. `GL_TRIANGLES`：将取出的顶点引用按每三个一组组成三角形。
2. `6`：读取六个索引元素，不是 VBO 有六份不同顶点，也不是六个三角形，更不是六字节。教程称“绘制六个顶点”是在描述引用序列，精确说法是六个索引。
3. `GL_UNSIGNED_INT`：每个索引以 32 位无符号整数解释；不是位置属性的类型。也支持 `GL_UNSIGNED_BYTE` 和 `GL_UNSIGNED_SHORT`，必须与上传数据的实际编码一致。
4. `nullptr`/`0`：从当前 EBO 第 0 字节读取。参数类型虽为指针，但已绑定 EBO 时含义是字节偏移，不是 CPU 索引数组指针。
绘制第二个三角形时，可使用 `count = 3`、偏移 `3 * sizeof(GLuint)`：跳过前三个索引，从 `{2, 3, 0}` 开始。对于基本 `glDrawElements`，取得 j 后，以 `属性偏移 + j × 属性步长` 读取该属性；有 base-vertex 的扩展绘制接口另有顶点编号修正规则。
必须保证 EBO 包含请求读取的索引字节，且各有效索引对应的属性数据范围存在；索引不会自动增加 VBO 存储。若开启 primitive restart，其保留索引会作为重启标记解释，本节普通三角形例子没有启用。
教程提到“未使用 EBO 时传递 CPU 索引数组”属于旧式/兼容模式用法。在当前 OpenGL 3.3 Core 中，应使用 EBO 和缓冲内偏移，不能把这句话套用于核心模式。
[Khronos：glDrawElements](https://registry.khronos.org/OpenGL-Refpages/gl4/html/glDrawElements.xhtml)
### VAO 如何记住 EBO
教程中的“绑定的最后一个元素缓冲区对象”应理解为：每个 VAO 有一个当前 EBO 绑定记录；当该 VAO 为当前 VAO 时，每次 `glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, ...)` 都会覆盖这条记录。它不是所有历史 EBO 的列表，也不是全局最后一次绑定的对象永远作用于所有 VAO。
```cpp
// 初始化网格 A：非零 VAO 已生成，属性配置步骤省略。
glBindVertexArray(vao_a);
glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, ebo_a); // vao_a 记住 ebo_a。
glBufferData(GL_ELEMENT_ARRAY_BUFFER, sizeof(indices_a), indices_a, GL_STATIC_DRAW);

// 初始化网格 B。
glBindVertexArray(vao_b);
glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, ebo_b); // vao_b 记住 ebo_b。
glBufferData(GL_ELEMENT_ARRAY_BUFFER, sizeof(indices_b), indices_b, GL_STATIC_DRAW);

// 绘制 A：恢复其属性配置与 ebo_a，无需再显式绑定 EBO。
glBindVertexArray(vao_a);
glDrawElements(GL_TRIANGLES, count_a, GL_UNSIGNED_INT, nullptr);
// 绘制 B：恢复其属性配置与 ebo_b。
glBindVertexArray(vao_b);
glDrawElements(GL_TRIANGLES, count_b, GL_UNSIGNED_INT, nullptr);
```
这段是状态切换示例，`indices_a/b`、`count_a/b` 等由应用定义。EBO 本身不保存索引类型、要绘制多少个索引、图元模式；这些仍由每次绘制调用提供。

| 调用 | 对当前 VAO 的影响 |
|---|---|
| `glBindBuffer(GL_ARRAY_BUFFER, vbo)` | 仅改变当前 ARRAY_BUFFER 选择，本身不记录属性来源 |
| `glVertexAttribPointer(...)` | 捕获当前 ARRAY_BUFFER 来源与属性读取规则 |
| `glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, ebo)` | 直接修改当前 VAO 的 EBO 记录 |
| `glBindVertexArray(another_vao)` | 恢复另一个 VAO 的属性配置与 EBO 绑定 |
因此，配置 EBO 后不要在当前 VAO 仍绑定时调用 `glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, 0)` 来“清理绑定”，那会真正清除该 VAO 的索引缓冲关联。可以直接切换 VAO，或只取消 VAO 绑定；在 Core 模式没有有效 VAO 时也不要再修改 ELEMENT_ARRAY_BUFFER 绑定。
最后的完整关系是：VAO 选择属性配置和 EBO → 绘制调用指定索引范围与图元类型 → EBO 给出顶点编号 → VBO 按编号提供各属性 → 顶点着色器处理 → 组装与光栅化。VAO 保存连接规则，VBO 保存属性，EBO 保存索引，三者并不互相复制数据。
[Khronos：VAO 与元素缓冲绑定](https://wikis.khronos.org/opengl/Vertex_Specification)
# 着色器
## Uniform 的含义与生命周期
简明定义：Uniform 是 GLSL 中全局作用域声明、由应用设置、着色器内只读的程序参数；需要使用它的着色器阶段须作相应声明。“只需设置一次”指值会保留，不是只能或必须设置一次；时间、摄像机矩阵等参数可每帧更新。同名 uniform 在同一链接程序的兼容声明之间共享，不代表其他程序也能自动访问。
`uniform` 是应用程序向着色器提供的、着色器内只读的程序参数。它不会像顶点属性一样随顶点编号取不同值，也不会像阶段间输出那样被光栅化插值。普通 uniform 在一次绘制使用的各次着色器执行中具有相同值；应用可以在两次绘制之间更新它。
常见用途包括变换矩阵、时间、光源参数、统一颜色和纹理采样器配置。`uniform` 不等于 C++ 的编译期常量：CPU 可以更新，GLSL 中不能给它赋值；随时间变化的 uniform 仍然是 uniform。

| 数据形式           | 谁提供值           | 变化范围             |
| -------------- | -------------- | ---------------- |
| 顶点着色器 `in` 属性  | 顶点属性读取机制       | 通常每个顶点不同         |
| 阶段间 `out`/`in` | 前一着色器阶段与插值机制   | 可随片段位置变化         |
| 普通 `uniform`   | 应用通过 OpenGL 设置 | 本次绘制共享，应用可在绘制间更新 |
| GLSL `const`   | 源码中的常量表达式      | 编译时确定            |
### 程序范围与持久性
uniform 在 GLSL 全局作用域声明，但不是所有程序共享的全局变量。它属于链接后的程序对象：程序 A 和 B 中同名的 `ourColor` 各有自己的值和位置。同一程序的多个阶段若声明同名且兼容的 uniform，链接后共享这个参数；需要使用它的阶段仍须自行声明，不能因片段阶段声明了就直接在顶点阶段访问。
设置后，值保持到下次更新；切换到另一个程序再切回来，不会自动清空。成功重新链接会重新初始化 uniform 值，也需要重新查询位置；无显式初始化器时，普通 uniform 初始为零。位置可以在成功链接后缓存，不必每帧查询。
本节讨论的是默认 uniform 块中的普通变量；uniform block/UBO 用缓冲与块绑定管理，不通过 `glGetUniformLocation` 和 `glUniform*` 更新块成员。
### 未使用的 Uniform 会被优化
声明但不影响可观察输出的 uniform 可以被编译/链接优化移除，最终不是 active uniform，`glGetUniformLocation(program, "name")` 返回 `-1`。即使源码里出现过它，若相关计算结果未被使用，也可能被移除。
> [!Warning]
> 查询结果为 `-1` 不必然是优化：名称拼写错误、查询错误程序，或查询不属于普通 uniform 的对象也可能导致失败。对 `location = -1` 调用 `glUniform*` 会静默忽略该更新，而不是必然报错，这可能掩盖问题。必需参数应检查位置；可选参数可以允许不存在。
位置类型使用 `GLint`，因为 `-1` 是有效的失败标志。uniform 的 location 是程序参数位置，不是 CPU/GPU 内存地址，也不是顶点属性槽位；两个编号系统彼此独立。
### 查询与更新为何有不同要求
`glGetUniformLocation(program, name)` 显式传入程序对象，因此无需先 `glUseProgram`，但程序必须已经成功链接。`glUniform*` 没有程序参数，更新目标来自当前激活的程序，所以教程这套 API 必须先绑定目标程序。
```cpp
// 初始化：program 已成功链接，此时无需先 glUseProgram。
const GLint color_location = glGetUniformLocation(program, "ourColor");
if (color_location < 0) {
    throw std::runtime_error("required uniform ourColor is inactive or missing");
}
// 绘制：更新目标由当前程序决定，随后绘制使用新值。
glUseProgram(program);
glUniform4f(color_location, 0.2f, 0.7f, 0.4f, 1.0f);
glBindVertexArray(vao);
glDrawArrays(GL_TRIANGLES, 0, 3);
```
不能查询 A 的位置却激活 B 后更新：相同整数位置在不同程序中含义不同，可能写错参数或报错。更新接口也要与类型匹配，例如 `vec4` 使用 `glUniform4f`，普通整数使用 `glUniform1i`。
扩展能力：OpenGL 4.1 或相应扩展提供 `glProgramUniform*`，显式指定目标程序，无需先激活；因此“更新 uniform 必须 glUseProgram”限定于教程使用的 `glUniform*` 路径，不是所有版本所有接口的绝对规则。
[Khronos：Uniform](https://wikis.khronos.org/opengl/GLSL_Uniforms)
[Khronos：glGetUniformLocation](https://registry.khronos.org/OpenGL-Refpages/gl4/html/glGetUniformLocation.xhtml)
[Khronos：glUniform](https://registry.khronos.org/OpenGL-Refpages/gl4/html/glUniform.xhtml)
## 片段插值与渐变三角形
### 插值解决的问题
三个顶点只定义了三角形边界和顶点处的属性；三角形覆盖屏幕内部大量采样位置，需要为这些位置计算属性。光栅化判断哪些位置被覆盖，并为片段着色器的可插值输入生成值。
插值是“用已知位置上的值，估计中间位置的值”。在线段两端颜色为 `C_A`、`C_B` 时，从 A 向 B 走过比例 t 的颜色为 `(1-t)C_A + tC_B`。t 为 0 是 A 的颜色，t 为 1 是 B 的颜色，中点为各占一半。
这里插值的是颜色等属性数值，不是凭空增加 VBO 顶点，也不是将三个顶点之间插入大量新顶点。产生的是供片段处理的输入。
### 三角形内的重心权重
三角形上任意内部位置 P 可表示为 `P = λ_A A + λ_B B + λ_C C`，其中三项权重非负且总和为 1，称为重心坐标。它们由片段在三角形中的相对位置决定，不是简单对三个顶点的欧氏距离取倒数。
教程各顶点裁剪坐标 w 都为 1，此时颜色可以按同一组权重计算：`C_P = λ_A C_A + λ_B C_B + λ_C C_C`。R、G、B 各分量分别参与计算。
假设 A 为红 `(1,0,0)`，B 为绿 `(0,1,0)`，C 为蓝 `(0,0,1)`：

| 位置     | 权重 `(λ_A, λ_B, λ_C)` | 插值 RGB                |
| ------ | -------------------- | --------------------- |
| A 顶点   | `(1,0,0)`            | `(1,0,0)`，红           |
| AB 边中点 | `(0.5,0.5,0)`        | `(0.5,0.5,0)`，黄方向的颜色  |
| AC 边中点 | `(0.5,0,0.5)`        | `(0.5,0,0.5)`，品红方向的颜色 |
| BC 边中点 | `(0,0.5,0.5)`        | `(0,0.5,0.5)`，青方向的颜色  |
| 三角形重心  | `(1/3,1/3,1/3)`      | `(1/3,1/3,1/3)`，灰     |
屏幕上大量位置对应不同权重，产生大量不同颜色，看起来像调色板。但它不是 RGB 全部颜色的集合：这组三原色的简单插值满足 `R+G+B=1`，无法得到 `(1,1,1)` 的白色或 `(1,1,0)` 的满强度黄色。最终显示还受帧缓冲量化和颜色编码影响。
### 哪个阶段负责什么
顶点着色器读取每个顶点的颜色，通过自定义 `out` 写出；光栅化相关的插值机制计算每个片段位置对应的颜色；片段着色器的 `in` 接收已经插值的值，再决定输出颜色。
```glsl
// 顶点阶段片段
layout(location = 1) in vec3 aColor;
out vec3 vertexColor;
// 在 main() 中：vertexColor = aColor;
```
```glsl
// 片段阶段片段
in vec3 vertexColor;
out vec4 FragColor;
// 在 main() 中：FragColor = vec4(vertexColor, 1.0);
```
上述是接口片段，沿用已有位置计算与 `main()`，不是两个完整着色器文件。普通片段着色器不需要读取三个顶点并自己计算重心权重；它只看到当前位置的插值结果。因此教程称“在片段着色器中插值”并不严谨，应理解为“为片段着色器输入进行插值”。
如果直接用同一个 uniform 作为所有片段的颜色输出，三角形就是统一颜色；只有三个不同的逐顶点输出经插值后，才出现这种渐变。纹理坐标、用于光照的法线等也可插值；法线插值后通常还要重新归一化。
### 插值限定符与透视修正

| 限定符 | 行为 |
|---|---|
| `smooth`，默认 | 透视正确插值 |
| `noperspective` | 在屏幕空间按重心权重线性插值 |
| `flat` | 不插值，取指定 provoking vertex 的值，三角形内部保持一致 |
三角形各顶点裁剪空间 w 不同时，默认 `smooth` 使用 `C_P = (Σ λ_i C_i/w_i)/(Σ λ_i/w_i)`，λ 是屏幕空间重心权重。这样避免透视投影后纹理等属性扭曲；w 全相同则退化成普通加权和。
GLSL 330 的阶段间接口应保持相应限定符一致；整数类型的片段输入使用 `flat`。因此“所有片段输入都插值”也不准确，uniform、内建输入与 `flat` 输入有各自规则。MSAA、`centroid` 等还会影响插值采样位置，本节先按普通采样理解。
[Khronos：GLSL 类型限定符](https://wikis.khronos.org/opengl/Type_Qualifier_%28GLSL%29)
[Khronos：GLSL 规范](https://registry.khronos.org/OpenGL/specs/gl/GLSLangSpec.4.60.pdf)
## 文件流的异常掩码
教程要求流在特定错误状态出现时通过异常报告。
```cpp
vShaderFile.exceptions(std::ifstream::failbit | std::ifstream::badbit);
fShaderFile.exceptions(std::ifstream::failbit | std::ifstream::badbit);
```
`std::ifstream` 从 `std::basic_ios` 继承该函数。`exceptions()` 无参数版本查询掩码，有参数版本设置掩码；掩码类型为 `std::ios_base::iostate`，这些状态常量可以组合。
### 状态位与异常策略分开保存
流的 `rdstate()` 表示“现在发生了什么”；`exceptions()` 表示“哪些状态需要抛异常”。默认异常掩码为 `goodbit`，即 0，因此一般流错误只设置状态位，程序通过 `if (!file)` 等判断，不会因为这些状态自动抛出 `ios_base::failure`。

| 状态 | 含义 | 当前掩码是否覆盖 |
|---|---|---|
| `goodbit` | 值为 0，未设置错误状态 | 无需处理 |
| `failbit` | 操作未成功，例如打开文件失败、格式化读取转换失败 | 是 |
| `badbit` | 流完整性/底层 I/O 相关的严重失败 | 是 |
| `eofbit` | 输入操作发现到达末尾 | 单独出现时否 |

注意 `fail()` 查询函数检测的是 `failbit` 或 `badbit`，不等于仅检查名字相同的 `failbit`。
### 着色器加载中的作用
开启该掩码后，路径错误导致 `open()` 失败时会抛异常，程序进入 `catch`，能及早区分文件加载失败与后续 GLSL 编译失败。否则未检查的文件错误可能导致空源码继续进入编译，产生误导性着色器日志。
```cpp
std::ifstream shader_file;
try {
    shader_file.exceptions(std::ios::failbit | std::ios::badbit);
    shader_file.open(shader_path);
    // 在此读取源码；读法及参与读取的其他流也需要各自检查错误。
} catch (const std::ios_base::failure& error) {
    std::cerr << "shader file: " << shader_path << ": " << error.what() << '\n';
    // 停止该着色器的后续初始化，或将错误继续向上传递。
}
```
设置掩码本身也可能抛异常：如果流已经带有新掩码覆盖的错误位，调用 `exceptions(mask)` 会立即检查当前状态。因此将配置也放进 `try` 更完整；重新尝试操作时还需明确处理既有状态，必要时 `clear()`，它清除状态位，不修复路径或底层故障。
没有把 `eofbit` 加入掩码并不保证“读到末尾永不抛异常”。例如循环 `getline` 在最后一次未读到任何字符时通常同时设置 `eofbit` 与 `failbit`，后者已经在掩码中。按期望次数读取、循环读到 EOF 与读取整个流缓冲应分别设计错误处理，不要把正常结束误判为加载失败。
掩码仅作用于该流对象，不会传播给 `std::stringstream`，也不会自动检查 GLSL 语法或保证 `rdbuf()` 转移已成功读取所有内容。文件加载、着色器编译、程序链接仍是三个需要各自检查的步骤。
[C++ 标准草案：流状态与异常掩码](https://eel.is/c++draft/iostate.flags)
## 片段、填充与插值的关系
### 片段是什么
片段是某个图元覆盖某个帧缓冲位置时产生的待处理数据，可以先理解为“这个三角形对某个像素的一次候选贡献”。它包含窗口位置、深度、覆盖信息，以及提供给片段着色器的输入值等，不是最终屏幕像素，也不是切下来的微小几何三角形。
像素是帧缓冲中的位置/存储单元；片段是处理过程中的候选数据。两个三角形覆盖同一位置会分别产生片段，深度测试可能丢弃其中一个，混合也可能组合多个片段的颜色。因此多个片段可能影响一个像素，某个片段也可能完全不改变像素。
先按无 MSAA 的简单情况理解：三角形覆盖若干像素中心，光栅化为这些位置生成片段。MSAA 时一个像素有多个采样位置，片段带有采样覆盖信息，不能直接套用“一片段等于一个像素/一个采样”的对应关系。
[Khronos：Fragment](https://wikis.khronos.org/opengl/Fragment)
### 为什么三个点会产生内部区域
只输入三个点并不必然产生填充三角形；关键在于绘制调用选择了 `GL_TRIANGLES`，它明确要求把每组三个顶点解释成具有内部区域的三角形图元。默认多边形模式 `GL_FILL` 要求光栅化其覆盖区域，而不仅绘制三个点或三条边。
这是 API 对“绘制三角形”的规定，正如调用绘制矩形接口不需要再手写扫描每一行像素的循环。驱动/硬件实现规范定义的覆盖规则，开发者提供图元、坐标、属性和着色器。

| 选择 | 图元含义与典型结果 |
|---|---|
| `GL_POINTS` | 三个独立点，各自光栅化为点覆盖区域 |
| `GL_LINE_LOOP` | 三条首尾连接的边，不填充内部 |
| `GL_TRIANGLES` + 默认 `GL_FILL` | 一个填充三角形 |
| `GL_TRIANGLES` + `glPolygonMode(GL_FRONT_AND_BACK, GL_LINE)` | 三角形按线框光栅化；这是桌面 OpenGL 的配置 |
“填充”与“插值”是两个不同任务：填充确定哪些位置属于三角形；插值计算这些位置处某些着色器输入的数值。绘制填充三角形不一定需要渐变颜色，可以在片段着色器中始终输出固定颜色，或者使用 `flat` 输入。
### 代码哪里规定了内部属性
在渐变示例中，顶点着色器的 `out vec3 vertexColor` 和片段着色器匹配的 `in vec3 vertexColor`，构成一个默认 `smooth` 的阶段间接口。这个默认限定符就隐含指定了插值规则，并不是只有显式写权重代码才算描述了内部行为。
OpenGL 不会扫描 VBO 并自动判断某字段是颜色：位置必须由顶点着色器写入 `gl_Position`，颜色必须由应用的着色器代码传递和使用。插值机制只按数值及限定符处理变量，不知道它在业务中代表颜色、纹理坐标还是其他数据。
也不会自动插值所有 CPU 顶点属性：某属性若未通过阶段间接口传到片段阶段，就不会仅因存入 VBO 而成为片段输入。片段着色器可以使用插值结果，也可以忽略它，输出固定值、纹理颜色或程序计算的图案。
整体链路：三个顶点 → `GL_TRIANGLES` 组装图元 → 裁剪、透视除法、视口变换 → 光栅化判断覆盖 → 按接口限定符生成片段输入 → 片段着色器计算颜色 → 测试/混合/写帧缓冲。
GLFW 负责创建窗口与上下文、交换缓冲、处理事件；将坐标映射到帧缓冲位置的是 OpenGL 的坐标变换与视口规则，不是 GLFW 替三维点计算二维坐标。
因此可以将你的理解修正为：OpenGL 内建机制为图元的覆盖位置生成片段，并按声明的插值规则计算需要插值的输入；“封闭”不是触发条件，点和线也能产生片段，线的输入也可插值。
[Khronos：光栅化](https://wikis.khronos.org/opengl/Rasterization)
[Khronos：插值限定符](https://wikis.khronos.org/opengl/Type_Qualifier_%28GLSL%29)
### Uniform 的只读边界
可以把普通 uniform 理解为“CPU 应用通过 OpenGL API 更新、GLSL 着色器中只读的变量”，并补上一个关键特性：其值在本次绘制中供多次着色器执行共享，不随顶点/片段编号自动变化。
这里的只读是语言接口规则，不表示某块物理内存从硬件层面对整个 GPU 永久只读；CPU 也不是直接解引用它的地址修改，而是调用 `glUniform*` 等接口设置程序参数。以后接触 UBO 等机制时还会有不同的存储与更新方式。
## 练习：把位置当成颜色
### 题目要求改变颜色来源
第三题要求把位置属性作为一个自定义输出传到片段阶段，然后将它的三个分量直接用作 RGB；它不再使用原本的顶点颜色属性。下面是完整的两个着色器，适用于教程没有额外变换的三角形。
```glsl
// 顶点着色器
#version 330 core
layout(location = 0) in vec3 aPos;
out vec3 vertexPosition;
void main() {
    gl_Position = vec4(aPos, 1.0);
    vertexPosition = aPos;
}
```
```glsl
// 片段着色器
#version 330 core
in vec3 vertexPosition;
out vec4 FragColor;
void main() {
    FragColor = vec4(vertexPosition, 1.0);
}
```
`gl_Position` 决定图元在哪儿；`vertexPosition` 是自定义数值输入，会插值后进入片段着色器；`FragColor` 将该输入重新解释为颜色。GPU 不要求位置与颜色语义不同，它们在这里都是浮点向量，语义来自程序如何使用值。
它不是直接把 `gl_FragCoord` 当 RGB：后者是窗口坐标，以像素单位表达；`vertexPosition` 是传出的原始位置数据。本例无额外变换且所有 w 为 1，所以其插值结果数值恰好对应三角形中的原始平面坐标。
### 负坐标如何变成黑色
假设正常写入常见的无符号归一化颜色缓冲，且没有额外混合等影响，RGB 写入会被限制在 `[0,1]`。本例因此可按 `R = max(x,0)`、`G = max(y,0)`、`B = 0` 理解，因为坐标最大只有 0.5，无需讨论上界截断。
负坐标在属性输入与插值时仍保持为负，GLSL 的 `vec4(...)` 也不会自动截断；截断发生在颜色进入相应帧缓冲处理/存储的环节。这与 `glVertexAttribPointer` 的 `normalized` 无关，后者的输入仍为 `GL_FLOAT`。

| 位置/插值值 `(x,y,z)` | 输出 RGB，截断后 | 结果 |
|---|---|---|
| 左下顶点 `(-0.5,-0.5,0)` | `(0,0,0)` | 黑 |
| 左下内部 `(-0.2,-0.2,0)` | `(0,0,0)` | 黑 |
| 右下内部 `(0.2,-0.2,0)` | `(0.2,0,0)` | 红 |
| 上部内部 `(-0.05,0.2,0)` | `(0,0.2,0)` | 绿 |
| 上部内部 `(0.05,0.2,0)` | `(0.05,0.2,0)` | 红绿组合，偏绿 |
| 顶点 `(0,0.5,0)` | `(0,0.5,0)` | 绿 |
这些是连续几何位置对应的理论值；实际像素采样未必恰好落在顶点或某条边上。z 始终为 0，所以整个图形没有蓝色分量。所有位于三角形内部且 `x ≤ 0、y ≤ 0` 的位置均为黑色；不是整个左半边都黑，上部左侧只要 y 为正仍有绿色。
题目的英文解释是在说：左下方的 x、y 都为负，作为 R、G 写入普通颜色缓冲后都变为 0；随着位置越过 x=0 或 y=0，对应分量才开始产生正颜色。它不是先把三个顶点的颜色截断再插值。
顺序可验证：底边中点的插值位置为 `(0,-0.5,0)`，再截断得到黑色；若错误地先把左右端点截成 `(0,0,0)` 与 `(0.5,0,0)` 再插值，中点会得到 `(0.25,0,0)`，与本题真实流程不同。
上述黑色解释针对常见无符号归一化帧缓冲；浮点颜色附件能够保存负数，不能把它推广为“GLSL 所有负数输出都会变成零”。
[Khronos：帧缓冲颜色截断](https://wikis.khronos.org/opengl/Draw_Buffer_Blend)
### 映射坐标以避免负分量
如果希望将 `[-0.5,0.5]` 的 x、y 映射到 `[0,1]`，可显式使用 `FragColor = vec4(vertexPosition.xy + vec2(0.5), 0.0, 1.0)`。这不同于将通常的 `[-1,1]` 映射到 `[0,1]`，后者需要 `0.5 * position + 0.5`。
练习的目标是观察“任意浮点属性都可以插值，位置也不例外”，并理解把坐标当颜色时，数值范围与颜色缓冲格式如何影响显示；它不是推荐实际项目用位置代替材质颜色。
# 纹理
## 多级渐远纹理的生成与使用
Mipmaps 是同一纹理图像的一系列逐级缩小版本，通常宽高每级减半，直到 1×1。它们不是多个材质对象，而是一个纹理对象的不同 mip 层。用途是在纹理缩小到屏幕上较少像素时，使用预过滤的低分辨率层，减少闪烁/走样并改善采样效率。
“根据距离选大小”是直观近似；实际普通片段 `texture()` 采样通常根据纹理坐标相对屏幕位置的变化率估计像素覆盖的纹素范围，以决定 LOD。距离、表面倾斜、UV 缩放和投影都会影响它，不是 CPU 每帧测距后手选图片。
### 入门教程中的实际调用
纹理章节先用 `glTexImage2D(..., level=0, ...)` 上传原图，再调用 `glGenerateMipmap(GL_TEXTURE_2D)`，从基础层生成后续缩小层。着色器仍写普通 `texture(sampler, uv)`，不需要给每层额外创建 sampler 或纹理单元。
但“生成”不等于“采样时使用”。当前 `src/textures/textures_combined.cpp` 两张图都生成了 mipmap，却都将 `GL_TEXTURE_MIN_FILTER` 设置为 `GL_LINEAR`，所以实际缩小时不选择较小 mip 层，仅过滤基础层。教程后面的简化示例也可能保留这种设置，应看具体状态而不是只看生成调用。
若要使用生成的层，应将缩小过滤改为 mipmap 模式，例如：
```cpp
// 绑定需要设置的纹理对象后，上传基础图并生成各层。
glGenerateMipmap(GL_TEXTURE_2D);
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR_MIPMAP_LINEAR);
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
```
`GL_LINEAR_MIPMAP_LINEAR` 在每个相邻 mip 层内线性过滤，再在两个层间线性混合，常称三线性过滤；放大过滤只支持 `GL_NEAREST`/`GL_LINEAR`，不使用 mipmap 过滤枚举。
相机拉远或进入倾斜的三维场景后，正确使用 mipmap 的差异更容易观察；但这些场景不会自动把已有 `GL_LINEAR` 改成 mipmap 模式。本次只记录实际使用情况，未修改项目过滤参数。
## S、T 坐标轴与环绕方式
S、T 是二维纹理坐标的第一、第二个轴，常写成 `(s,t)` 或 `(u,v)`；在 GLSL `vec2` 中也可用 `.x`、`.y` 访问。它们属于纹理空间，不是模型位置或窗口坐标轴。三维纹理还有 R 轴，该 R 是第三个坐标分量
普通 `sampler2D` 使用归一化坐标：s 从 0 到 1 对应纹理第一维，t 从 0 到 1 对应第二维。可以先把它们理解为图片横向与纵向的比例位置，而不是像素编号。坐标与图像视觉上下方向的对应还取决于加载的行顺序、纹理上传和 UV 约定；OpenGL 不会读取文件格式中的“朝上”语义。
纹理坐标可以超过 `[0,1]`，因此需要定义超出范围时如何采样。S 与 T 可独立配置，例如横向重复、纵向限制到边缘。配置的目的不是开启两根轴，而是明确每根轴的寻址规则。
```cpp
// 假设 texture_id 已创建并有图像数据。
glActiveTexture(GL_TEXTURE0);
glBindTexture(GL_TEXTURE_2D, texture_id);
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_REPEAT);
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
```
这里修改当前激活纹理单元中绑定到 `GL_TEXTURE_2D` 的纹理对象。环绕参数属于纹理对象，不是整个 OpenGL 的全局模式；切换对象可以使用不同配置。同一个对象绑定到多个单元时共享其对象参数。单独的 sampler object 可提供并覆盖这些采样参数，这是后续扩展能力。

| 环绕模式 | 超范围时的行为 | 直观用途 |
|---|---|---|
| `GL_REPEAT` | 周期重复，沿每段整数区间重复图像 | 平铺地面、墙面 |
| `GL_MIRRORED_REPEAT` | 相邻周期交替正向、反向 | 镜像平铺 |
| `GL_CLAMP_TO_EDGE` | 限制在边缘可采样位置 | 防止采到对侧纹理 |
| `GL_CLAMP_TO_BORDER` | 超范围采样使用边界颜色，边缘过滤可能混合该颜色 | 纹理外的区域使用指定颜色 |
例如 s=1.2，重复模式近似对应 s=0.2，镜像重复近似对应 s=0.8；t 仍独立处理。实际采样还受过滤方式和纹素中心位置影响。默认环绕模式是 `GL_REPEAT`，可以依赖默认值，但显式设置更清楚。
环绕方式与过滤方式不同：环绕决定如何处理坐标边界，过滤决定如何从周围纹素计算采样结果。
[Khronos：glTexParameter](https://registry.khronos.org/OpenGL-Refpages/gl4/html/glTexParameter.xhtml)
## 纹理对象、单元与采样器
### 三层映射
纹理对象保存图像及相关参数；纹理单元是 OpenGL 上下文中的带编号的绑定槽位；GLSL 的 `sampler2D` 是不透明采样器类型的 uniform，它的值选择要使用的纹理单元。
可将映射理解为：`sampler uniform → 纹理单元编号 → 该单元的 GL_TEXTURE_2D 绑定 → 纹理对象`。纹理单元不是图像中的纹素，不是 uniform location，也不是顶点属性 location。
纹理单元在逻辑上有不同纹理目标的绑定；`sampler2D` 使用对应单元的二维纹理绑定。初学阶段推荐每个使用中的单元只安排一种匹配的采样器类型，避免同一单元被不兼容的 active sampler 类型引用。
### 两张纹理的完整连接
```cpp
// 初始化程序参数：program 已成功链接，location 已确认有效。
const GLint base_location = glGetUniformLocation(program, "baseTexture");
const GLint detail_location = glGetUniformLocation(program, "detailTexture");
glUseProgram(program);
glUniform1i(base_location, 0);   // sampler 选择单元 0。
glUniform1i(detail_location, 1); // sampler 选择单元 1。

// 绘制前：把对象绑定到对应单元。
glActiveTexture(GL_TEXTURE0);
glBindTexture(GL_TEXTURE_2D, base_texture_id);
glActiveTexture(GL_TEXTURE1);
glBindTexture(GL_TEXTURE_2D, detail_texture_id);
glBindVertexArray(vao);
glDrawElements(GL_TRIANGLES, index_count, GL_UNSIGNED_INT, nullptr);
```
```glsl
#version 330 core
in vec2 TexCoord;
uniform sampler2D baseTexture;
uniform sampler2D detailTexture;
out vec4 FragColor;
void main() {
    vec4 base = texture(baseTexture, TexCoord);
    vec4 detail = texture(detailTexture, TexCoord);
    FragColor = mix(base, detail, 0.2);
}
```
两个采样调用使用相同 UV，但查询不同单元绑定的图像；也可以给它们不同 UV。`texture` 按坐标、环绕和过滤等规则取得颜色，`mix` 是本例手写的组合规则，OpenGL 不会自动混合所有绑定的纹理。

| 名称/数字                      | 含义                             |
| -------------------------- | ------------------------------ |
| `base_location`            | 程序中 `baseTexture` 的 uniform 位置 |
| `glUniform1i(..., 0)` 中的 0 | 纹理单元编号                         |
| `GL_TEXTURE0`              | 传给 `glActiveTexture` 的枚举       |
| `base_texture_id`          | 纹理对象句柄                         |
不能把纹理对象 ID 或 `GL_TEXTURE0` 枚举值传给 `glUniform1i` 作为纹理单元编号。选择单元 i 时，分别使用 `glActiveTexture(GL_TEXTURE0 + i)` 与 `glUniform1i(location, i)`。
`glActiveTexture` 只选择后续绑定/参数操作针对哪个单元，不表示“绘制时只有该单元激活”。即使最后选择的是单元 1，着色器也可以同时访问单元 0 和 1 中的绑定对象。
### 为什么是 glUniform1i
不存在一个名为 `glUniform` 的通用函数可供调用，它是整个 `glUniform*` 函数族的统称。`1` 表示设置一个标量分量，`i` 表示使用有符号整数参数；这里不是“第一个纹理”，也不是额外增加纹理序号参数的特殊函数。
GLSL sampler 的普通 uniform 值以整数纹理单元编号配置，规范要求使用 `glUniform1i` 或对应的整数数组形式 `glUniform1iv`。即使只用一张纹理，也应使用这个类型对应的接口；这与“片段着色器是否用多张纹理”无关。普通 `uniform int` 同样使用 `glUniform1i`。
OpenGL 的 C API 用不同函数名表达参数类型和分量数量，不能像 C++ 那样只靠重载区分，这是命名背景；真正决定这里选 `1i` 的原因是 sampler 的整数单元选择语义，而不是多纹理需要函数重载。
无显式初始化的 sampler uniform 在成功链接后默认值为 0；OpenGL 初始活动纹理单元也是 0。这是初始简单示例只绑一张纹理到单元 0 时可能正常显示的原因，不表示纹理对象自身天然属于单元 0。
sampler→单元的值保持到更新/重新链接；单元→对象的绑定是上下文状态，可能被后续代码改变。绘制时需确保两层映射正确，不需要每帧重复设置未变化的 sampler uniform。纹理数量的阶段限制可查询 `GL_MAX_TEXTURE_IMAGE_UNITS` 等，组合单元限制查询 `GL_MAX_COMBINED_TEXTURE_IMAGE_UNITS`，不能无限占用。
[Khronos：GLSL Sampler](https://wikis.khronos.org/opengl/Sampler_%28GLSL%29)
[Khronos：glActiveTexture](https://registry.khronos.org/OpenGL-Refpages/gl4/html/glActiveTexture.xhtml)
[Khronos：glUniform](https://registry.khronos.org/OpenGL-Refpages/gl4/html/glUniform.xhtml)
## 着色器阶段职责总览
着色器是 GPU 执行的程序阶段，不是图像或缓冲区。所有阶段可以读取声明的 uniform 和按能力使用纹理等资源，但其主要输入、执行单位与输出不同。

| 阶段 | 主要输入/执行单位 | 主要职责 | 主要输出 | 版本与本项目关系 |
|---|---|---|---|---|
| 顶点着色器 VS | 一个顶点的属性，如位置、颜色、UV，以及 uniform | 位置变换，计算需要传递的属性 | 通常写 `gl_Position`，并写自定义 `out`；有后续顶点处理阶段时位置还可继续处理 | 教程当前使用 |
| 细分控制着色器 TCS | 一个 patch 的控制点，按输出控制点执行 | 设置细分级别、调整控制点和 patch 数据 | 控制点数组、patch 数据、`gl_TessLevelOuter/Inner` | OpenGL 4.0，当前未使用 |
| 细分求值着色器 TES | patch 控制点、patch 数据与 `gl_TessCoord` 指定的生成位置 | 根据参数位置求曲面上的顶点 | 顶点位置与自定义属性 | OpenGL 4.0，当前未使用 |
| 几何着色器 GS | 一个图元的一组顶点，必要时包含邻接顶点 | 可发出零个或多个输出图元 | 通过 `EmitVertex`、`EndPrimitive` 发出位置与属性 | OpenGL 3.2，当前未使用 |
| 片段着色器 FS | 光栅化生成的片段输入，如插值 UV、颜色和 `gl_FragCoord` | 纹理采样、光照、计算颜色，可丢弃片段 | 颜色附件输出，可写 `gl_FragDepth` 等 | 教程当前使用 |
| 计算着色器 CS | 工作组/调用编号，以及显式绑定的缓冲、图像等资源 | 通用并行计算 | 缓冲/图像等显式写入结果，没有固定 `gl_Position` 或片段颜色输出链路 | OpenGL 4.3，独立 dispatch，当前未使用 |
细分中的固定功能生成器根据细分级别生成参数域中的点和图元，TES 再求真实位置；不是 TCS 自己直接把曲面变成最终像素。计算着色器由 `glDispatchCompute` 启动，不插在三角形的顶点到片段链路中。
可选阶段未使用时会被跳过，不是自动运行一份“默认几何着色器”。也不要将“没有可选阶段”理解为删除了光栅化等固定功能阶段。
### 当前纹理示例的数据链路
```text
CPU: VBO 保存位置和 UV，VAO 描述布局，EBO 指定顶点编号
    ↓ 顶点属性读取
VS: aPos → gl_Position；aTexCoord → TexCoord（out）
    ↓ 图元装配、裁剪、透视除法、视口变换、光栅化与插值
FS: TexCoord（in）+ sampler uniform 指向的纹理 → texture(...) → 颜色 out
    ↓ 深度/模板测试、混合等处理
帧缓冲 → 窗口呈现
```
VS 输入的 UV 是逐顶点数据，FS 输入的 UV 是按片段位置计算的插值结果；sampler uniform 的单元编号不被插值。实际测试顺序允许优化，例如提前深度测试。
顶点着色器不是只负责“3D 转 2D”，其输出首先是裁剪空间位置；片段着色器也不是直接改屏幕像素，其颜色输出还可能被丢弃、混合或量化。图元装配、裁剪、视口和光栅化不是这两个着色器中手写执行的代码。
GLSL 不会因变量名叫 `color` 就自动显示颜色，也不会因变量名叫 `uv` 就自动采样图像；开发者必须通过接口声明和计算语句明确其用途。
[Khronos：渲染管线](https://wikis.khronos.org/opengl/Rendering_Pipeline_Overview)
[Khronos：着色器阶段](https://wikis.khronos.org/opengl/Shader_Resource_Limit)
# 变换
## 为什么三维变换通常使用四阶矩阵
三维旋转与缩放可以用 `3×3` 矩阵表示，但仅用它乘 `(x,y,z)` 无法表示一般平移：任何线性矩阵都把零向量映射到零向量，而平移必须能把原点移动到其他位置。
解决办法是引入齐次坐标，把位置写成 `(x,y,z,1)`，用 `4×4` 矩阵把旋转、缩放、平移统一起来。多个变换可以先相乘，再对每个顶点做一次组合矩阵乘法；投影也可使用同样的四维接口。
不使用齐次矩阵也能实现平移，例如显式计算 `A * position + translation`；使用四阶矩阵是统一表示与组合的便利，不是三维世界真的多出一个空间方向。仅处理法线或纯旋转时仍经常使用三阶矩阵；二维齐次变换则通常使用三阶矩阵。
本章采用列向量与 `p' = M p` 的数学约定；矩阵在内存中按列还是按行存储，是另一个问题，不能仅凭存储顺序判断变换顺序。
## 第四行、第四列与 w
### 仿射矩阵的结构
旋转、缩放、平移组合得到的典型仿射矩阵可以写成：
```text
    [ a00 a01 a02 tx ]     [ x ]
M = [ a10 a11 a12 ty ], p= [ y ]
    [ a20 a21 a22 tz ]     [ z ]
    [  0   0   0   1 ]     [ w ]
```
左上三阶部分控制旋转、缩放等；第四列的 tx、ty、tz 提供平移；第四行计算新的 w。两者不要混淆。一般第四行 `(a,b,c,d)` 表示 `w' = ax + by + cz + dw`；仿射变换采用 `(0,0,0,1)`，保证 `w'=w`。
位置通常取 w=1，因此 `x' = a00*x + a01*y + a02*z + tx`；方向取 w=0，因此不会加上 tx、ty、tz。物体移动不会改变“向右”这个方向，齐次表示自然体现了这点。
对于有限齐次点，w 非零时对应三维位置 `(x/w,y/w,z/w)`；`(x,y,z,w)` 与整体乘上任意非零倍数后的坐标表示同一个点。w=0 表示方向/无穷远点，不能按有限位置直接除以零。
### 缩放为何保留最后一个一
普通缩放矩阵为 `diag(sx,sy,sz,1)`，对位置 `(x,y,z,1)` 得到 `(sx*x,sy*y,sz*z,1)`。最后的 1 保持位置表示与齐次尺度不变，使前三项直接对应所需空间缩放。
教程“缩放 w 无意义”应理解为“w 不是第四条空间轴，因此普通三维缩放不应该把它作为空间分量一起缩放”，而不是“改变 w 永远没有影响”。例如只把最后的 1 改成 2，结果是 `(x,y,z,2)`，除以 w 后位置变成 `(x/2,y/2,z/2)`。
若将单位矩阵四个对角项都改成 3，得到 `(3x,3y,3z,3)`，除以 w 后仍是 `(x,y,z)`，反而没有完成三维点的放大。这就是通常只缩放前三项的原因。
投影矩阵会有意改变第四行，例如常见透视投影使 `w'=-z_view`，随后透视除法产生近大远小效果。仿射模型变换保持 w，并不意味着整个渲染链路始终保持 w=1。
[Khronos：坐标变换](https://www.khronos.org/opengl/wiki_opengl/index.php/Coordinate_Transformations)
[MIT：齐次坐标](https://visionbook.mit.edu/homogeneous_coordinates.html)
## 右手坐标系与欧拉角
右手坐标系是三个坐标轴的方向约定：正 x 与正 y 的叉积指向正 z。常用手势是右手食指指向 x、中指指向 y、拇指指向 z；判断绕轴正旋转时，将右手拇指指向轴的正方向，其余手指弯曲方向为正角度方向。
教程常用观察空间中 x 向右、y 向上，摄像机朝负 z 看。OpenGL 并不替应用强制所有模型坐标都使用同一种坐标系；空间约定、投影与面绕序需要相互一致，也不能把观察空间与投影后的 NDC 方向混为一谈。
欧拉角用按指定顺序执行的三个轴旋转描述朝向。游戏中常见 yaw/pitch/roll 分别表达左右转头、抬头低头、侧倾，但对应哪个数学轴取决于引擎坐标约定。
严格数学术语中，使用三个不同轴的 xyz 等称为 Tait–Bryan 角，重复首尾轴的 zxz 等称为经典欧拉角；图形编程中常统称欧拉角。学习时先记住：三个角本身不够，还必须知道轴顺序、内旋/外旋和正方向约定。
朝向是“现在面对哪里、上方在哪里”；它不是完整的旋转历史，转过一整圈可能回到同一朝向。
## 内旋、外旋与顺序
外旋绕固定的世界轴旋转；内旋绕随物体朝向改变的局部轴旋转。两者的旋转顺序通常都会影响结果，三维旋转一般不满足交换律；绕相同轴或特殊角度等情况可能例外。
采用右手系、列向量和主动旋转，给方向 `(0,0,1)` 先绕固定 X 轴转 90°，再绕固定 Y 轴转 90°，结果为 `(0,-1,0)`；反过来先 Y 后 X，结果为 `(1,0,0)`。两个合法操作序列得到不同结果，这本身不是万向节锁。
相同约定下，外旋先 X、再 Y、最后 Z，对应 `R = Rz * Ry * Rx`，最右边的矩阵先作用于向量。内旋依次绕自身 X、Y、Z，则对应 `R = Rx * Ry * Rz`。
相同角度下，内旋 X→Y→Z 与外旋 Z→Y→X 可以描述同一个最终朝向；这是转换约定时常用的对应关系，不是说任意交换顺序都等价。
若 R 把局部坐标变成世界坐标，世界轴增量旋转 ΔR 用 `R_new = ΔR * R`，局部轴增量旋转用 `R_new = R * ΔR`。代码中的前乘/后乘需结合这个约定理解。
## 万向节锁究竟失去了什么
“万向节死锁”更常称万向节锁（Gimbal Lock），它不是线程互相等待的死锁。可以想象三个套在一起的旋转环：某个姿态下，第一和第三个环的轴对齐，原本三个独立旋转控制中，有两个开始产生同一种方向的旋转效果。
最直白的解释是：本来有三个不同方向的旋转旋钮，某个姿态下其中两个旋钮变成控制同一个方向，于是无法再用三个独立旋钮稳定控制朝向。
需要纠正“欧拉角无法描述物体的旋转状态”：欧拉角仍能表示该姿态，也能表示所有朝向；问题是该处表示不唯一、局部控制退化，附近角度反求或插值可能跳变。物体本身没有失去旋转能力，失去的是这种参数化的独立性。
以 `R = Rz(yaw) * Ry(pitch) * Rx(roll)` 为例，pitch=90° 时，最终姿态只依赖 yaw 与 roll 的差，不再独立依赖两个角。此时 `(yaw,roll)=(0°,0°)` 与 `(30°,30°)` 会得到相同朝向；尝试分别微调它们，效果相互重叠，缺少一个独立的局部旋转控制方向。
90° 锁点是上述三个不同轴约定的例子；其他欧拉角顺序的锁点可能不同，不能推广为“任何旋转到了 90° 就锁死”。也不是连续相乘旋转矩阵次数多就必然产生锁：直接用旋转矩阵保存、更新朝向可以避免欧拉角参数化的该问题。
四元数和矩阵转回欧拉角时，锁点的角度不唯一仍然存在，这是转换目标表示的限制。
## 四元数为什么避免万向节锁
这里的正确名称是四元数（Quaternion），不是普通四元组。用于旋转的是单位四元数，包含四个数，但有长度为 1 的约束，因此仍表示三个旋转自由度，并不是凭空增加一个空间轴。
可以先理解为“把整体朝向打包成一个旋转对象”，不再靠三个按固定顺序排列的角度来保存朝向。绕单位轴 `(ax,ay,az)` 旋转 θ 时，常用表示为 `q = (cos(θ/2), ax*sin(θ/2), ay*sin(θ/2), az*sin(θ/2))`；库的分量顺序可能不同。
单位四元数没有欧拉角那种“两个角度的有效轴在某姿态重合”的参数化锁点。使用四元数乘法积累整体旋转，不需要在每次更新时先拆成 yaw/pitch/roll，因此可以穿过抬头 90° 等朝向而不丢失独立旋转控制。
它并没有让旋转满足交换律：世界增量与局部增量仍分别涉及前乘与后乘，顺序仍有影响。实际代码通常保持单位长度，绘制时转为旋转矩阵并与模型、视图、投影矩阵组合。
`q` 与 `-q` 表示同一朝向，所以四元数也不是一一对应的全球唯一坐标；它通过带约束的四参数表示避免欧拉角的奇异控制问题。使用 slerp 插值时通常还要处理符号以选择适当路径。
若先累计三个欧拉角，再每帧转成四元数，而输入控制仍受欧拉角锁点约束，并不会仅因最终类型叫 quaternion 就自动解决控制问题。相反，直接用单位四元数保存状态并应用增量旋转，才能发挥这种表示的作用。
轴角/旋转矩阵本身也可以表示锁点姿态，教程将“一系列旋转矩阵复合”直接归因于万向节锁并不严谨；问题应归因于欧拉角顺序参数化，而不是矩阵乘法这项运算。
[NASA JPL：旋转、欧拉角与四元数](https://naif.jpl.nasa.gov/pub/naif/toolkit_docs/C/req/rotation.html)
# 纹理示例的对象与状态追踪
## 生成、绑定、上传分别做什么
OpenGL 的对象由驱动管理，C++ 中的 `GLuint` 只是对象名称。生成名称、选择操作对象、分配并上传数据是三个不同步骤。绑定的本质是修改当前上下文中的状态，后续 API 通过该状态确定操作对象，而不是把数据移动到某个位置。
下面逐行解释当前代码；执行前必须已有有效且当前的上下文，并完成 GLAD 加载。

| 调用 | 完成的工作 | 尚未完成的工作 |
|---|---|---|
| `glGenVertexArrays(1, &VAO)` | 生成一个未使用的 VAO 名称并写入变量 | 不上传顶点、不指定属性布局、不绘制 |
| `glGenBuffers(1, &VBO)` | 生成一个未使用的缓冲名称 | 不分配顶点数据存储 |
| `glGenBuffers(1, &EBO)` | 再生成一个缓冲名称 | 不生成索引、不上传索引 |
| `glBindVertexArray(VAO)` | 首次绑定创建该名称对应的 VAO 状态，并选择它作为当前 VAO | 还没有属性来源或有效 EBO 数据 |
| `glBindBuffer(GL_ARRAY_BUFFER, VBO)` | 首次绑定创建缓冲对象状态，并将其选为当前 ARRAY_BUFFER | 还没有数据存储；此调用不记录 VAO 属性来源 |
| `glBufferData(GL_ARRAY_BUFFER, sizeof(vertices), vertices, GL_STATIC_DRAW)` | 为当前目标上的 VBO 分配/替换字节存储，并复制 CPU 数组内容 | 不知道哪些字段代表位置、颜色、UV |
| `glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, EBO)` | 创建/选择该缓冲，同时在当前 VAO 记录它作为索引来源 | 还没有索引存储 |
| `glBufferData(GL_ELEMENT_ARRAY_BUFFER, sizeof(indices), indices, GL_STATIC_DRAW)` | 为该 EBO 分配/替换存储并复制索引字节 | 不自动判断索引类型、数量或图元模式 |
VBO 与 EBO 都是普通 buffer object，`glGenBuffers` 没有“创建顶点缓冲专用类型”与“创建索引缓冲专用类型”的分支。用途由绑定目标及绘制时如何使用决定；VAO 是另一类对象，保存属性与索引来源状态。不同对象类型有不同名称空间，即使句柄整数恰好相同也不表示同一个对象。
生成函数中的 1 是名称数量，`&VBO` 是写回名称的 CPU 地址。`glBufferData` 的 `size` 才是存储字节数；数据指针非空时复制源数据，调用返回后不要求原数组为该副本继续存活。存储物理位置由驱动决定，不能把调用直接等同于必然分配独立显卡显存。
`GL_STATIC_DRAW` 是“数据不频繁修改、主要用于绘制”的使用提示，不是禁止修改的只读约束。再次 `glBufferData` 会替换存储；修改部分内容还可使用 `glBufferSubData`。
### 初始化完成后的状态
当前矩形的四个顶点各有八个 float：位置 3、颜色 3、UV 2。当前环境 float 为 4 字节，因此 VBO 上传 128 字节；EBO 六个 32 位索引上传 24 字节。
之后的 `glVertexAttribPointer` 才将 VBO 读取规则记录到当前 VAO：属性 0 为位置，属性 1 为颜色，属性 2 为 UV；各自步长都是 32 字节，偏移分别为 0、12、24 字节。
```text
当前 VAO ── 属性 0/1/2 的来源与布局 ──→ VBO：四份顶点记录
    └────── 索引来源 ─────────────→ EBO：0,1,3,1,2,3
当前 ARRAY_BUFFER ──────────────→ VBO（上下文中的操作选择）
```
调用 `glDrawElements(GL_TRIANGLES, 6, GL_UNSIGNED_INT, nullptr)` 时，VAO 提供 EBO 与属性布局，绘制参数指定索引类型与范围，EBO 给出顶点编号，VBO 提供对应属性。这些初始化 API 都不会自行绘制。
绑定不是 C++ 引用赋值，也不是把缓冲复制进 VAO。VAO 保存对象关联，修改 VBO 后绘制读取新内容。绑定关系通常保持到下一次修改；示例循环未再次绑定 VAO 之所以能工作，是因为初始化后没有其他代码切换当前 VAO。多网格场景建议绘制时明确绑定所需 VAO。
绑定 0 通常表示解除相应绑定，不是删除；删除对象使用 `glDelete*`，且要遵守对象引用与上下文生命周期。尤其在当前 VAO 上解除 EBO 会清除其记录，而解除 ARRAY_BUFFER 不会清除已捕获的属性来源。
[Khronos：glGenBuffers](https://registry.khronos.org/OpenGL-Refpages/gl4/html/glGenBuffers.xhtml)
[Khronos：glBindBuffer](https://registry.khronos.org/OpenGL-Refpages/gl4/html/glBindBuffer.xhtml)
## 每帧清除颜色缓冲
`glClearColor(r,g,b,a)` 设置清除颜色，不立即改变图像；`glClear(GL_COLOR_BUFFER_BIT)` 将当前绘制帧缓冲中选定的颜色缓冲清为该颜色。窗口默认双缓冲时，通常清除的是接下来要绘制的后缓冲，不是删掉纹理、顶点或着色器。
每帧先清屏再绘制，相当于为这一帧准备干净背景。否则未被本帧图形覆盖的位置可能保留旧内容或未定义内容，导致残影等；交换缓冲不保证得到已经清好的画布，也不能假定它必定含上一帧内容。
```cpp
glClearColor(0.2f, 0.3f, 0.3f, 1.0f); // 可在循环外设置，除非希望改变背景。
// 每帧：
glClear(GL_COLOR_BUFFER_BIT);
// 在此绘制本帧图形。
glfwSwapBuffers(window);
```
只清颜色不会清深度或模板；三维深度测试场景通常使用 `GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT`。清除受裁剪测试和写掩码等状态影响，因此“清整屏”是假设这些状态允许全范围写入；它不靠当前着色器绘制，也不受视口范围直接限制。
如果每帧保证完整覆盖所有需要的颜色位置，或明确设计累积绘制，可以不清颜色；清屏是帧初始化策略，不是 OpenGL 强制每次绘制的前置条件。
[Khronos：glClear](https://registry.khronos.org/OpenGL-Refpages/gl4/html/glClear.xhtml)
## 激活纹理单元与绑定纹理
`glActiveTexture` 的准确含义是“选择当前纹理单元”，不是激活某张图片，也不是启动采样。旧式绑定 API 的 `glBindTexture` 没有单元参数，所以先用这个状态指定它要修改哪个单元。

| 代码 | 状态变化 |
|---|---|
| `glActiveTexture(GL_TEXTURE0)` | 当前纹理操作单元设为 0 |
| `glBindTexture(GL_TEXTURE_2D, texture1)` | 单元 0 的二维纹理绑定设为 texture1 |
| `glActiveTexture(GL_TEXTURE1)` | 当前操作单元改为 1，单元 0 的记录仍保留 |
| `glBindTexture(GL_TEXTURE_2D, texture2)` | 单元 1 的二维纹理绑定设为 texture2 |
若省略两次单元选择而连续绑定两张纹理，就只会覆盖同一单元的二维绑定，最终它指向第二张纹理。真正必须保证的是绑定时当前单元正确；若已经正确，不要求每次再重复激活。
绘制时 sampler uniform 值为 0 的变量读取单元 0，值为 1 的变量读取单元 1；最后当前操作单元为 1 不会禁止使用单元 0。`glUseProgram`、VAO 绑定与纹理单元状态各有不同职责，不能互相替代。
参数设置和图像上传也使用当前单元的目标绑定：`glTexParameteri`、`glTexImage2D` 等操作当前单元中绑定到相应目标的纹理对象。`glBindTexture` 本身既不上传图片也不调用片段着色器。
较新的 OpenGL 4.5 提供 `glBindTextureUnit(unit, texture)`，可以显式指定单元而不先改变当前单元；这是其他接口选择，不是教程 3.3 基线的一部分。
## glUseProgram 选择什么
`glUseProgram(program)` 将已成功链接的程序选为当前着色器程序，后续绘制使用其中的阶段代码，后续 `glUniform*` 更新该程序的参数。它不编译源码、不立即执行着色器、不上传顶点、不选择 VAO 或纹理对象。
当前 `Shader::use()` 仅封装 `glUseProgram(ID)`；`ourShader.use()` 因此选择该对象创建的程序。状态保持到下一次切换，不必因为进入新一帧就强制重复调用，但绘制代码明确选择程序可避免其他代码切换后产生错误。
完整状态组合：program 决定如何计算；VAO 决定读哪些顶点/索引以及格式；纹理单元决定 sampler 查询哪张图；当前绘制帧缓冲决定结果写到哪里；绘制调用真正提交图元处理。
[Khronos：glUseProgram](https://registry.khronos.org/OpenGL-Refpages/gl4/html/glUseProgram.xhtml)
## 当前纹理代码的构建与资源问题
当前路径 `/home/azzato/CodeFiles/learning/learnOpenGL-cn` 中执行 `cmake --build --preset release`：`triangle` 成功构建，`textures` 在编译阶段失败。没有证据表明失败来自显卡 OpenGL 4.6 与教程 OpenGL 3.3 不兼容；代码明确请求 3.3 Core，高版本驱动支持该教程能力。
### 实际编译错误
`src/textures/textures_combined.cpp` 首先包含 `<GL/gl.h>`，再包含 GLFW，最后包含 GLAD，触发 GLAD 的 `OpenGL header already included` 错误，后续现代 OpenGL 函数大量“未声明”。应删除直接的 `<GL/gl.h>`，让 GLAD 先于 GLFW：
```cpp
#include <glad/glad.h>
#include <GLFW/glfw3.h>
#include <shader_s.h>
// 在该可执行目标中恰好一个翻译单元定义 stb_image 实现：
#define STB_IMAGE_IMPLEMENTATION
#include <stb_image.h>
```
当前两处 `FileSystem::getPath` 也报“未声明”：它是原教程仓库的资源路径辅助类，不是 OpenGL、GLFW 或 C++ 标准组件。本项目没有该类，可直接改用自己的文件路径，例如根目录启动时使用 `stbi_load("resources/textures/container.jpg", ...)`，或建立统一资源根路径。
[GLFW：GLAD 与头文件顺序](https://www.glfw.org/docs/latest/build_guide.html)
### 编译修正后还需要检查的缺失项
1. 当前项目没有 `STB_IMAGE_IMPLEMENTATION` 的定义，也没有链接其他 stb_image 实现。只包含声明会在后续链接阶段出现 `stbi_load` 等未定义引用；按上面示例在一个翻译单元引入实现即可，无需重复安装依赖。
2. 代码使用 `resources/textures/container.png`，本项目没有该文件；实际有 `container.jpg` 与 `container2.png`。必须选择真实存在且格式/通道匹配的资源；这属于运行时路径问题。
3. `Shader` 请求 `4.2.texture.vs`、`4.2.texture.fs`，当前项目文件列表中没有这两个文件，需要创建相应着色器文件并配置路径。文件中应包含位置和 UV 接口、`texture1`/`texture2` sampler 及对应采样逻辑。
4. 相对路径以进程工作目录为基准，不是源文件目录。若保留根目录相对资源路径，从项目根目录运行 `./build/release/textures`；从 build 目录启动要相应调整路径或配置资源复制/绝对资源根路径。
GLAD 1 和 GLAD 2 的头文件与加载函数名称也可能不同，但当前安装确实提供 `<glad/glad.h>` 和 `gladLoadGLLoader`，与示例一致。本次先解决实际首个错误和项目辅助代码/资源缺失，无需降低驱动版本。
以上为诊断与修改方案；此次未修改用户源码，也未声称纹理目标已经编译或运行成功。
### 修复验证
后续 Debug 构建暴露了格式化重排 include 引入的 GLFW/GLAD 冲突。现为两个 CMake 目标定义 `GLFW_INCLUDE_NONE`，禁止 GLFW 隐式包含系统 OpenGL 头文件，使 include 排序不再引发该冲突；同时将三角形源码的字面量指针改为 `constexpr const char*`。Debug 配置及并行构建、Release 并行构建均已验证通过。此前仅验证 Release 的结论不足以保证后续格式化后的构建状态。
后续按用户要求完成源码修复：GLAD 先于 GLFW，加入单个 stb_image 实现，去除未引入的 `FileSystem`，使用真实存在的 `container.jpg`，新增 `Texture.vert` 与 `Texture.frag`，通过 CMake 提供源码根路径定位资源。
图像解码分别强制 RGB/RGBA，使上传格式与输出通道一致；上传期间使用 `GL_UNPACK_ALIGNMENT=1`，避免 RGB 行长度不是 4 字节倍数时被错误解释为带填充行，完成后恢复默认 4。新增初始化失败检查、初始视口设置和正常退出时的纹理/程序释放。
`cmake --build --preset release` 中 `triangle`、`textures` 均编译链接成功，格式检查通过。运行探测在 GLFW 初始化处失败，当前执行环境未验证窗口显示；桌面终端可运行 `./build/release/textures`。资源路径引用当前源码目录，移动项目后需要重新配置构建，并不是可独立分发的资源打包方案。
# 坐标系统
## 同一个点为什么有不同坐标
坐标不是点本身，而是相对于原点、坐标轴和尺度的描述。可以类比“杯子在桌面右侧 10 厘米”与“杯子在房间坐标 (3,2,1)”：点没有改变，但描述它的参照系不同。模型、世界、观察空间都可这样理解；裁剪与 NDC 还涉及投影和归一化，不只是移动参照系。

| 空间 | 参照与用途 | 谁负责转换 |
|---|---|---|
| 局部/模型空间 | 相对物体自己的原点；建模方便，同一网格可复用 | 模型矩阵 M 转为世界空间 |
| 世界空间 | 相对整个场景；确定不同物体彼此位置 | 观察矩阵 V 转为观察空间 |
| 观察/摄像机空间 | 摄像机为原点，按摄像机轴描述；教程通常朝负 z 看 | 投影矩阵 P 转为裁剪空间 |
| 裁剪空间 | 四分量齐次坐标，供统一裁剪规则使用 | 管线裁剪后进行透视除法 |
| NDC | 除以 w 后的三分量坐标，默认可见范围为各轴 `[-1,1]` | 视口和深度范围变换 |
| 窗口空间 | 帧缓冲中的像素位置及深度 | 随后光栅化并处理片段 |
模型矩阵把物体“摆进场景”；观察矩阵把场景“改用摄像机的尺子测量”；投影矩阵决定“摄像机怎样看”，例如正射或近大远小。观察矩阵通常是摄像机世界变换的逆：摄像机向右移动，场景在摄像机坐标中向左移动。
同一个模型可以使用不同 M 放在不同位置；同一场景可以使用不同 V 从不同摄像机观看；不需要为这些变化重新修改 VBO 中的模型数据。
```glsl
gl_Position = projection * view * model * vec4(aPos, 1.0);
```
这是列向量约定，从右往左应用；结果是裁剪坐标，不是像素坐标。M、V、P 是应用约定与提供的矩阵，现代 OpenGL 不会根据变量名自动计算它们。
## 裁剪空间与图元裁剪
### 可见范围为什么与 w 有关
裁剪空间称为四维，是因为位置用 `(x_c,y_c,z_c,w_c)` 四个分量表示，并不意味着场景有第四条物理空间轴。w 是齐次表示的一部分，也用于携带透视缩放所需信息，见 [[#第四行、第四列 w]]。
本教程默认 OpenGL 裁剪规则为 `-w_c ≤ x_c ≤ w_c`、`-w_c ≤ y_c ≤ w_c`、`-w_c ≤ z_c ≤ w_c`。可见裁剪坐标的 xyz 不必直接落在 `[-1,1]`，例如 `(2,0,0,4)` 位于范围内；它除以 w 后才得到 NDC `(0.5,0,0)`。
因此教程“投影矩阵将指定范围映射到 NDC”的说法省略了透视除法；准确链路是观察坐标 → P → 裁剪坐标 → 裁剪 → 除以 w → NDC。教程每维 `[-1000,1000]` 的例子适合理解正射盒子的缩放，透视可见体则是近窄远宽的视锥台，不能将它理解成固定宽高的盒子。
### 图元不是三个独立点
`GL_TRIANGLES` 将三个顶点解释为带有内部区域的三角形。裁剪判断的是图元与可见体的交集，不能简单删除越界顶点，否则一个角越界就会使整个图形消失。
例如三个裁剪空间顶点均 w=1：A=(-0.5,-0.5,0,1)、B=(1.5,-0.5,0,1)、C=(-0.5,0.5,0,1)。B 超过右边界 x=1，但三角形大部分仍在可见体内。
裁剪把 AB 与 BC 和右边界相交的位置作为新顶点：D=(1,-0.5,0,1)、E=(1,-0.25,0,1)。保留下来的轮廓是 A→D→E→C，形成四边形；逻辑上可拆成两个三角形继续光栅化。
```text
原图元：A → B → C
右边界裁剪后：A → D → E → C
可用三角形表示：A-D-E 与 A-E-C
```
新交点的位置与需要插值的属性由管线按裁剪规则生成，不会追加到应用的 VBO/EBO，也不要求开发者重新提交。它属于后续管线处理，并不会为这些新点重新调用原顶点着色器。
整个图元在外部且不与可见体相交才完全丢弃；部分相交保留交集。即使三个顶点都在外部，也不能单凭这一事实判断三角形一定不可见，一个很大的三角形仍可能覆盖可见区域。
“重建成一个或多个三角形”描述的是裁剪后可见形状，不规定驱动必须以哪种内部数据结构或剖分方式实现；通常由硬件/驱动完成。
[Khronos：顶点后处理与裁剪](https://wikis.khronos.org/opengl/Vertex_Post-Processing)
## 透视除法为什么必要
### 操作与执行位置
透视除法计算 `x_ndc=x_c/w_c`、`y_ndc=y_c/w_c`、`z_ndc=z_c/w_c`，将齐次坐标还原为三分量坐标。正射投影也经过该阶段，只是普通点的 w 保持 1，数值不变。
它不是在顶点着色器 `main()` 内部自动加上一句代码。准确说，在最后一个启用的顶点处理阶段输出位置、完成图元裁剪后，固定功能后处理执行除法；若没有细分或几何着色器，最后的顶点处理阶段就是 VS。
一般应向 `gl_Position` 写未经手动透视除法的裁剪坐标。自行除完再把 w 改成 1，会改变齐次裁剪和透视正确插值所需的信息。
### 为什么除以 w 能形成近大远小
透视摄像机的直观规律来自相似三角形：同样长度的物体，离观察点两倍远，投影长度约为一半。横向投影形式为 `x_projected = f*x_view/distance`；纵向也相同。
普通矩阵乘法不能直接表达“除以另一个输入分量”。因此投影矩阵先构造分子，并把距离信息放入 w；常见右手透视矩阵使 `w_c=-z_view`，后续统一除以 w 完成这种比例缩放。
忽略横纵比例系数，只看 x：点 (1,0,-2) 可产生 x_c=1、w_c=2，得到 x_ndc=0.5；点 (1,0,-4) 可产生 x_c=1、w_c=4，得到 x_ndc=0.25。后者离摄像机更远，同样的横向偏移在屏幕上更小。
z 也除以 w，是为了得到统一的 NDC 深度坐标，之后用于深度范围映射。透视投影中的 z_c 已由 near/far 决定的公式变换，它不是简单把原 z 除以距离；最终深度通常对观察距离非线性，这与深度精度分布有关。
裁剪先于除法，也便于正确处理跨越近面等图元，避免直接在除法后的坐标中处理 w=0 附近或摄像机后方的问题。w=0 不能当作普通有限点直接相除。
[Khronos：渲染管线顺序](https://wikis.khronos.org/opengl/Rendering_Pipeline_Overview)
## 正射投影就是把盒子缩放到统一范围
### 先看二维区间映射
正射投影选择一个观察空间中的长方体，把横纵范围平移并缩放到 NDC 的 `[-1,1]`。它不会根据距离缩小横纵位置，因此远处与近处同样尺寸的物体具有相同投影尺寸。
把 x 的范围 `[left,right]` 映射到 `[-1,1]`，步骤是：减去区间中心 → 除以半宽。即 `x_ndc = (2*x-left-right)/(right-left)`。y 同理：`y_ndc = (2*y-bottom-top)/(top-bottom)`。
例如横向选择 `[0,800]`：x=0 映射到 -1，x=400 映射到 0，x=800 映射到 1。纵向 `[0,600]`：y=0 映射到 -1，y=300 到 0，y=600 到 1。这就是平移加缩放，不必先背矩阵。
### near、far 选的是深度范围
按教程常用右手观察空间约定，摄像机看向负 z，near=1、far=11 对应近平面 z=-1、远平面 z=-11。它们是距摄像机的正距离参数，不是说可见点的观察 z 位于正 1 到正 11。
默认 OpenGL NDC 深度映射公式为 `z_ndc = -2*z_view/(far-near) - (far+near)/(far-near)`：z=-1 得到 -1，z=-11 得到 1。正射深度随观察 z 线性变化。
```cpp
// 示例：GLM 默认右手、NDC 深度 [-1,1] 约定。
glm::mat4 projection = glm::ortho(0.0f, 800.0f, 0.0f, 600.0f, 1.0f, 11.0f);
```
near/far 的含义与数学约定有关；若配置 GLM 的其他手性或零到一深度模式，需要同步调整理解。本节按教程默认值解释。
### 完整数值追踪
取局部点 (1,0,0)，模型仅平移 (399,300,-6)，观察矩阵为单位矩阵，使用上述正射投影，再设置视口 `glViewport(0,0,800,600)`：

| 步骤 | 结果 | 意义 |
|---|---|---|
| 局部 | `(1,0,0)` | 物体自己定义的点 |
| 模型变换 | `(400,300,-6,1)` | 在场景中摆放后的点 |
| 观察变换 | `(400,300,-6,1)` | 摄像机与世界轴重合，因此未变化 |
| 正射投影 | `(0,0,0,1)` | 盒子中心映射到裁剪中心 |
| 裁剪 | 保留 | 满足 `-w≤xyz≤w` |
| 透视除法 | `(0,0,0)` | w=1，得到 NDC |
| 视口/默认深度范围 | `(400,300,0.5)` | 帧缓冲中心位置、归一化深度 |
默认窗口坐标原点在左下。这里 (400,300) 是连续窗口位置，实际片段采样中心不一定恰好是这组整数。窗口 z 默认把 NDC `[-1,1]` 映射到 `[0,1]`，不是屏幕的第三条可见方向。
所以正射投影不直接输出二维像素，也没有丢弃 z；它保留用于裁剪和深度测试的信息，直到后续视口变换才得到窗口位置。
### 为什么改变距离不会缩小
在上述盒子中，点 (400,300,-2) 与 (400,300,-10) 的 x、y 投影完全一致，只是深度不同。正射矩阵的横纵变换不除以距离，而其 w=1，所以没有近大远小。
正射盒子的横向可见宽度为 800；横向宽度 100 的物体占画面宽度的 1/8。把盒子范围宽度改为 1600，该物体占比变为 1/16，看起来变小。这是改变可见范围产生的缩放，不是深度产生的透视缩小。
正射适合二维界面、工程图、建模视图和某些三维游戏；它不等于只能画二维，也不等于所有点距摄像机相同。透视投影更接近普通相机的近大远小，两者是不同观看方式，不是正射数学上不正确。
# 摄像机
## LookAt 是如何得到观察矩阵的
LookAt 是根据“摄像机在哪里、看向哪里、哪边朝上”构造观察矩阵的方法。得到的矩阵把世界坐标转换成摄像机坐标，不是投影矩阵，也不是会自动移动或跟踪目标的摄像机对象。
站在房间里看桌子，同一个杯子有一个房间坐标；站到不同位置或转头后，杯子相对你的前后左右发生变化。LookAt 正是计算如何将“房间坐标”改写为“相对你的坐标”。
### 三个参数各解决什么问题
教程写出 R/U/D/P 是已经求好的摄像机基轴与位置，GLM 接受 eye/center/up 是更方便的原始输入；函数在内部推导相同的信息，并没有缺少参数。R/U/D 是方向向量，不是三个位置向量；P=eye 才是摄像机位置。
按教程右手约定：`P=eye`，`D=normalize(eye-center)`（朝后），`R=normalize(cross(up,D))`，`U=cross(D,R)`。这样三个输入就生成了 P 与三个相互垂直的轴；参考 up 与最终 U 不必相同。
例如 eye=(0,0,3)、center=(0,0,0)、up=(0,1,0)，可得 D=(0,0,1)、R=(1,0,0)、U=(0,1,0)。教程的轴矩阵此时为单位矩阵，负位置平移为 (0,0,-3)，二者相乘就得到 view。
本质上它是“换参照系”：对任意世界点 p，先求 `p-P`，再求它沿 R/U/D 的投影，得到摄像机空间的 xyz。两个四阶矩阵只是将这两步打包成矩阵乘法的写法；GLM 可以直接填入合并结果，无需真的先构造两个临时矩阵再相乘。
```cpp
// GLM 默认右手观察空间；通常由 <glm/gtc/matrix_transform.hpp> 提供。
glm::mat4 view = glm::lookAt(
    glm::vec3(0.0f, 0.0f, 3.0f), // eye：摄像机的世界位置。
    glm::vec3(0.0f, 0.0f, 0.0f), // center：看向的世界位置，不是方向向量。
    glm::vec3(0.0f, 1.0f, 0.0f)  // up：参考上方向，确定画面如何摆正。
);
```
位置与目标可以确定朝前方向，但不能确定绕视线的侧倾：看着同一点，你仍可把头向左或向右歪。因此还需要参考上方向。up 通常取世界正 Y，但不是只能取它，也不必预先与视线垂直，函数会求出正交的摄像机上轴。
若已有单位朝前方向 `front`，应调用 `lookAt(eye, eye + front, up)`，不能把 front 直接当作 center，除非恰好符合你的世界位置关系。目标距离不会直接改变视野大小：沿同一视线选不同距离的目标得到同样朝向，FOV 由投影决定。
### 它内部做的两件事
先把世界点减去摄像机位置，再将差向量投影到摄像机的右、上、后方向。按右手观察空间、列向量约定：
```text
f = normalize(center - eye)   // 朝前，摄像机看向的方向。
r = normalize(cross(f, up))  // 朝右。
u = cross(r, f)              // 修正后的朝上。
b = -f                      // 朝后，对应观察空间正 Z。

对世界位置 p：
x_view = dot(r, p - eye)
y_view = dot(u, p - eye)
z_view = dot(b, p - eye)
```
点积在这里就是“沿这根轴有多远”。摄像机前方的点得到负 z，是教程摄像机朝负 Z 看的约定，不是点落在摄像机后面。
这三个公式可以打包成一张矩阵：
```text
       [ rx ry rz -dot(r,eye) ]
view = [ ux uy uz -dot(u,eye) ]
       [ bx by bz -dot(b,eye) ]
       [  0  0  0      1     ]
```
这是数学上的行列展示；GLM 按列索引/存储，不要直接把每一行当成 `matrix[column]` 赋值。
### 为什么看起来是把世界反向移动
在示例中摄像机位于 (0,0,3)，朝原点看，轴方向与世界轴重合，view 只需沿 z 平移 -3。世界原点变为观察坐标 (0,0,-3)，摄像机自身位置变为 (0,0,0)。若摄像机向右移动，静止物体在观察坐标中应向左移动。
这不是修改 VBO 或真的移动场景，而是在计算另一种坐标描述。对于只包含旋转和平移的摄像机世界变换 C，有 `view = inverse(C)`；LookAt 直接根据几何关系生成这个逆变换。
### 为什么需要它
观察矩阵让场景摆放和摄像机运动分开：模型矩阵确定物体在哪儿，观察矩阵确定从哪儿看。摄像机移动时更新 view，不必修改场景中每个物体的模型数据。LookAt 又避免手动反求摄像机朝向和逆矩阵，只需提供位置、目标与参考上方向。
不是必须使用 LookAt 函数；也可以从摄像机四元数和位置计算观察矩阵，或直接提供组合后的模型观察矩阵。LookAt 是方便且直观的构造方式，不是 OpenGL 规定必须调用的 API。
```glsl
gl_Position = projection * view * model * vec4(aPos, 1.0);
```
model 把点摆进世界，view 改用摄像机坐标描述，projection 决定投影。LookAt 不决定 near/far、FOV、窗口尺寸、透视或正射，它生成的 view 可以与这两种投影分别组合。
### 使用边界
eye 与 center 不能重合；参考 up 不能为零，也不能与视线平行，否则归一化或叉积无法构造有效坐标轴，接近平行时也可能产生不稳定翻转。GLM 的手性配置或显式 `lookAtLH`/`lookAtRH` 会影响方向约定，本节按教程的右手版本解释。
LookAt 不会自动记住或持续跟踪 center。如果摄像机或目标位置改变，应用需要重新计算并上传 view。固定 world-up 的 LookAt 也不等于通用的无锁全姿态控制，观察方向靠近 up 轴时仍需处理退化。
[GLM：观察矩阵与 lookAt](https://glm.g-truc.net/0.9.9/api/a00668.html)
# 光照
## 面法线与顶点法线
一个孤立的点没有唯一法线。面法线描述一个平面的垂直方向；顶点法线是提供给光照计算的表面朝向属性，由建模、导出或应用预处理决定，不是 OpenGL 根据同位置的相邻面自动选出来的。
对于非退化三角形 A、B、C，可计算 `N = normalize(cross(B-A, C-A))`。交换绕序会反转方向；通常按模型外侧约定统一绕序与法线。顶点法线可以采用面法线，也可以采用用于模拟光滑曲面的其他方向。
### 正方体角点属于三个面怎么办
OpenGL 顶点不是只有位置，而是一份完整属性记录，例如 `(position, normal, uv)`。同一几何位置在不同面需要不同法线时，保存多份顶点记录即可。
例如正方体角点 P=(0.5,0.5,0.5)：

| 顶点记录 | 位置 | 法线 | 用在哪个面 |
|---|---|---|---|
| P_right | `(0.5,0.5,0.5)` | `(1,0,0)` | 右面 |
| P_top | `(0.5,0.5,0.5)` | `(0,1,0)` | 上面 |
| P_front | `(0.5,0.5,0.5)` | `(0,0,1)` | 正 Z 面 |
三份记录位置重合，但法线不同，索引各面时选择各自记录。普通索引绘制中一个索引同时选择位置、法线、UV 等逐顶点属性，不能仅用八个共享索引同时为每个角选择三套法线；拆分完整记录是常见方案。
正方体有八个不同几何位置，但硬边模型常存 24 份记录（每个正方形面四份），用 36 个索引绘制十二个三角形；不用索引时也可直接存 36 份记录。这不是重复错误，而是不同表面属性的必要区分。
### 平滑曲面为什么反而共享法线
球面等光滑物体通常是曲面的三角形近似。为了避免每个三角形看起来像独立平板，各顶点可提供不同的光滑表面法线，片段阶段使用插值后再归一化的方向。
球心为 C 时，可直接取 `normalize(P-C)`；一般网格可对平滑区域内相邻面法线按角度或面积等权重平均后归一化。硬边两侧不应混在一起平均，否则正方体边角会产生像被磨圆的明暗过渡，但几何轮廓没有真的变圆。
同一三角形只有一个几何平面法线，但三个顶点可以有不同的着色法线。这是“描述当前三角形平面”与“模拟原本光滑表面”的区别。
## 相同法线为什么在多个顶点中出现
对于确实按平面着色的三角形，你的判断正确：三个角可以使用同一个面法线，不需要分别做三次叉乘。通常在建模或加载阶段计算一次，再把结果关联到三个顶点；教程的立方体更是直接手写固定法线。
“每个顶点具有法线属性”不等于“每次绘制必须为每个顶点重新计算一个不同法线”。常见 VAO 输入是逐顶点结构，为了让每个被读取的顶点都带有相应表面方向，数据里会出现重复值。
当三个输入法线相同时，默认插值结果方向也相同，仍应在光照使用前归一化；有旋转、缩放时还需正确变换法线，与光线方向保持同一坐标空间。非均匀缩放通常需要逆转置法线矩阵，不能简单照搬位置变换。
### 一个面法线相同，为什么仍逐片段算漫反射
教程的基本光照示例在片段着色器里计算 `max(dot(N,L),0)`。平面上的 N 可以固定，但点光源方向 `L = normalize(lightPos-FragPos)` 会随片段位置改变，因此整个面不一定亮度相同。若使用方向光、固定 N，且材质等其他因素相同，该漫反射项才可以整个面一致。
数据链路：模型/应用提供法线 → 顶点着色器变换并输出 → 光栅化插值 → 片段着色器归一化，并结合当前位置的光线方向计算光照。
### 是否可以每个面只提供一份
可以设计其他方案，但不是当前教程使用的数据布局：例如每个三角形单独绘制时用 uniform 提供面法线，代价是增加绘制调用；或利用图元数据访问、几何着色器等机制提供逐面数据。
`flat` 限定符可以让片段输入取 provoking vertex 的值、不进行插值，但它本身不计算面法线，也不能让共享顶点在同一批绘制中自动获得多个所属面的属性。要保证所选顶点携带正确的逐面数据。
还可在片段阶段用世界位置的屏幕导数 `dFdx/dFdy` 求叉积推导平面方向，但需要处理方向约定等细节；它不是初学阶段必须替代顶点法线的方案。
因此先采用两条规则：硬边处拆顶点并使用各面的法线；光滑区域采用连续的顶点法线并在片段阶段插值、归一化。是否重复存储、何时计算和在哪里执行光照是三个不同问题。
[Khronos：完整顶点属性与索引](https://wikis.khronos.org/opengl/Vertex_Specification)
