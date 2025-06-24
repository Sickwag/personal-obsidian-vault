## 写项目时出现的问题
- 类中的 const 成员必须在类内（最好是构造函数中）通过初始化列表初始化
- `getline` 不接受 const 流（`fstream` 对象被 const 修饰）
- string 类型可以使用 `.open()` 函数打开文件