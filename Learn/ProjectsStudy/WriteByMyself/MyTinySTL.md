---
created: 2025年10月1日12:40:38
---
# Vector 复现
## alloc 管理内存**分配\构建\销毁\释放**
Allocator操控内存的步骤
1. 内存分配与对象构造
```cpp
// 步骤1：分配原始内存
T* ptr = alloc.allocate(count);  // 只分配内存，不构造对象
// 步骤2：在已分配的内存中构造对象
alloc.construct(ptr, value);     // 在内存位置构造对象
```
2. 内存释放与对象析构
```cpp
// 步骤1：销毁对象（调用析构函数）
alloc.destroy(ptr);              // 调用对象的析构函数，清理对象
// 步骤2：释放内存
alloc.deallocate(ptr, count);    // 释放原始内存块
```

为什么不能跳过destroy？

  原因：
1. 对象生命周期管理：C++对象有明确的构造和析构过程，必须在释放内存前调用析构函数
2. 资源清理：对象的析构函数负责清理资源（如释放动态分配的内存、关闭文件、解锁等）
3. 内存模型：allocate分配的是原始内存，deallocate释放原始内存，对象的构造/析构是独立的操作
# Algorithm 复现
## wchar_t 重载
### 底层实现原理
wchar_t（wide character type，宽字符类型）是C++中用于处理宽字符的标准类型，主要用于：
- 支持Unicode字符集
- 处理多字节字符（如中文、日文等）
- 国际化应用开发
fill_n 和 fill 函数这里的重载用于对宽字符数组的处理
```cpp
inline void fill(wchar_t* first, wchar_t* last, const wchar_t& value) {
    memset(first, static_cast<unsigned char>(value), (last - first) * sizeof(wchar_t));
}

template <class Size>
wchar_t* fill_n(wchar_t* first, Size n, const wchar_t& value) {
    memset(first, static_cast<unsigned char>(value), n * sizeof(wchar_t));
    return first + n;
}
```
其中 memset 是 C 语言函数，由于其直接操作内存块写入数据，比一个个元素赋值要快
- 使用 memset 进行内存块填充，比逐个元素赋值更高效
- memset 是 C 语言的内存填充函数，直接操作字节数组
- `(last - first) * sizeof (wchar_t)` 计算总字节数
### ForwardIterator 和 OutputIterator
fill 函数需要ForwardIterator的原因：
1. 必须能读迭代器指向的值（用于比较first != last）
2. 保证可重复访问（forward iterator的特性）
3. 支持多次遍历，允许对同一范围进行多次操作

fill_n函数只需要OutputIterator的原因：
4. 只需要写入能力（`*first = value`）
5. 不需要读取迭代器指向的值
6. 通过计数器n控制循环，而非迭代器比较
7. 意图只是写入n个元素，不要求能读取或比较迭代器
```cpp
template <class ForwardIterator, class T>
void fill(ForwardIterator first, ForwardIterator last, const T& value) {
    for (; first != last; ++first)
        *first = value;
}

template <class OutputIterator, class Size, class T>
OutputIterator fill_n(OutputIterator first, Size n, const T& value) {
    for (; n > 0; --n, ++first)
        *first = value;
    return first;
}
```
观察代码可知：
- 使用 `ForwardIterator` 是因第一个重载中没有获得 last 到 first 指针的距离，所以只能通过 `first==last` 的比较两个迭代器（本质是指针的值，也就是两个指针指向的内存地址）是否一致。使用到了指针值的比较，就需要使用 ForwardIterator，OutputIterator 不具备这个功能所以不用。
- 但 `last - first` 可以直接得到元素个数，**前提是 first 和 last 都是随机访问迭代器**
-  `ForwardIterator` 不支持减法，只能需使用`!=`比较
## 堆模拟
计算机中：
- 物理存储：计算机内存是线性的，所有数据都存储在连续的地址中
- 逻辑结构：堆是树形结构，有父子关系
这种逻辑和物理上的差异导致了计算机只能通过某种映射关系来让数组中某个位置的元素表示堆中对应元素，对于索引为 i 的节点：
1. 父节点索引: `(i-1)/2`
2. 左子节点索引: `i*2+1`
3. 右子节点索引: `i*2+2`
可以用这些规则来构建一个**表示堆的数组**，而数组在插入元素时，只会将新元素放在数组末尾，删除时只会将后面的元素向前移动一格填充，这会破坏堆的结构，随意需要 up 和 down 函数来重新调整结构
```cpp
template <class RandomAccessIterator, class Compare>
static void up(RandomAccessIterator first, RandomAccessIterator last, RandomAccessIterator head, Compare comp) {  // 1.[first, last], 2.headr points the header of the heap
    if (first != last) {
        int index = last - head;
        auto parentIndex = (index - 1) / 2;
        for (auto cur = last; parentIndex >= 0 && cur != head; parentIndex = (index - 1) / 2) {
            auto parent = head + parentIndex;  // get parent
            if (comp(*parent, *cur))
                TinySTL::swap(*parent, *cur);
            cur = parent;
            index = cur - head;
        }
    }
}
template <class RandomAccessIterator, class Compare>
static void down(RandomAccessIterator first, RandomAccessIterator last, RandomAccessIterator head, Compare comp) {  // 1.[first, last], 2.headr points the header of the heap
    if (first != last) {
        auto index = first - head;
        auto leftChildIndex = index * 2 + 1;
        for (auto cur = first; leftChildIndex < (last - head + 1) && cur < last; leftChildIndex = index * 2 + 1) {
            auto child = head + leftChildIndex;                // get the left child
            if ((child + 1) <= last && *(child + 1) > *child)  // cur has a right child
                child = child + 1;
            if (comp(*cur, *child))
                TinySTL::swap(*cur, *child);
            cur = child;
            index = cur - head;
        }
    }
}
```
## count_if 实现中细节
### typename 显式标注类型名称
```cpp
template <class InputIterator, class UnaryPredicate>
typename iterator_traits<InputIterator>::difference_type
count_if(InputIterator first, InputIterator last, UnaryPredicate pred) {
    typename iterator_traits<InputIterator>::difference_type n = 0;
    for (; first != last; ++first) {
        if (pred(*first))
            ++n;
    }
    return n;
}
```
实现中 `typename` 似乎是多余的
在模板中，当你写：
```cpp
SomeTemplate<Param>::NestedType // 不能确定这是一个子类还是一个类成员变量
```
编译器在解析模板时会遇到歧义：
- 这可能是一个类型（如int）
- 也可能是一个静态成员变量（如int value）
### different_type 表示迭代器间距离
表示两个迭代器之间的距离，这是迭代器类型固有的类型，专门用于表示索引差值。
由于 STL 所有类型都遵守类型一致性，每个 stl 函数都有自己的 `different_type`，如 `vector<int>::different_type` 和 `vector<double>::different_type` 是不同的类型，这也是 STL 设计规范

```cpp
// STL算法都使用difference_type
template <class Iterator>
typename iterator_traits<Iterator>::difference_type
distance(Iterator first, Iterator last) { ... }

template <class InputIterator, class T>
typename iterator_traits<InputIterator>::difference_type
count(InputIterator first, InputIterator last, const T& val) { ... }

// count_if也应该保持一致
template <class InputIterator, class UnaryPredicate>
typename iterator_traits<InputIterator>::difference_type  // 保持一致性
count_if(InputIterator first, InputIterator last, UnaryPredicate pred) { ... }
```

## 使用标签派分
### advance 函数实现
```cpp
// 总的advance函数，根据迭代器类别选择不同实现
template <class InputIterator, class Distance>
void advance(InputIterator& it, Distance n) {
typedef iterator_traits<InputIterator>::iterator_category iterator_category;
 _advance(it, n, iterator_category());  // 传入迭代器类别标签
}
// 对于不同迭代器类别有不同的实现
template <class InputIterator, class Distance>
void _advance(InputIterator& it, Distance n, input_iterator_tag) { /* 慢速实现 */ }

template <class BidirectionIterator, class Distance>
void _advance(BidirectionIterator& it, Distance n, bidirectional_iterator_tag) { /* 支持双向移动 */ }

template <class RandomIterator, class Distance>
void _advance(RandomIterator& it, Distance n, random_access_iterator_tag) { /*快速实现: it += n */ }
```
总 advance 函数通过 `iterator_category()` 构造函数获取当前容器对象的迭代器类型，然后调用对应的重载函数。由于不同重载函数的第三个参数**只用来区分调用**是什么迭代器需要 advance，所以