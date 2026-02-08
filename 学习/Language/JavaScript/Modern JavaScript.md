
## 基本了解
### 四十分钟JavaScript入门
#### js 的运行
[四十分钟JavaScript快速入门 | 无废话且清晰流畅 | 手敲键盘 | WEB前端必备程序语言~_哔哩哔哩_bilibili](https://www.bilibili.com/video/BV15L4y1a7or/?spm_id_from=333.788.videopod.episodes&vd_source=876be08bc9c030f4a9ea1fb97e0d0342)
浏览器中 F12 中 console 是一个简单的 JavaScript 控制台
![[Pasted image 20250115203925.png]]
- alert 函数可以让网页弹出提示，内容即参数内容，在 html 中嵌入代码时，最好将 js 代码放在 body 标签尾部，这样可以提高内容显示速度
---
#### 基本数据类型
- js 中定义变量有三个关键字，`var`、`let` 和 `const`，其中 `var` 的作用于是全局的，容易造成冲突，`let` 定义的值**可以被修改**，`const` 不可以并且一定要在**声明时初始化数据**
- 基础数据类型有 `String` ，`Number`，`Boolean`，`null`，`undefined`，在定义变量时并不需要声明数据类型，`null` 表示数据**被定义为空**，`undefined` 表示**没有定义**
- 使用 `console.log(typeof variable_name)` 返回变量类型
- `null `的二进制表示全为 0，而 JS 判断类型时会将二进制前三位全为 0 的判断为 `object` 类型
- 使用 `let` 定义的变量在未初始化时显示的是 `undefined`
![[Pasted image 20250115205036.png|400]]

---
可以通过两种方式连接不同的字符串
![[Pasted image 20250115205804.png]]
Java 方式和 js 方式
两种方式创建数组
![[Pasted image 20250115210216.png]]
末尾添加元素使用 `push()`，首部添加元素使用 `unshift()`，使用 `indexof()` 显示元素的下标

---
通过 `{}` 创建对象，而**不需要关键字**
![[Pasted image 20250115210619.png]]
#### 解构对象
从对象中抽取对应的数据赋值给**变量**，这时变量会被转换为对象，所以 log 才会像输出对象一样输出变量中内容
![[Pasted image 20250115210900.png|350|person成为了一个新的变量]]
对变量使用 `.var_name` 可以为变量创建一个新的属性并赋值
根据这样的特性（`{}` 包裹的内容会变成对象中成员），js 可以和 json 互通有无，使用 `JSON.stringify(obj_name)` 就会将结构后的对象转化为 json 格式数据

---
#### 基本语法
条件判断
js中 `==` 表示值相同，`===` 表示值和类型都相同，这可以省去其他编程语言中在常见数据类型中要比较符合直觉相等（不等）的两个对象还要手动写转换函数的麻烦
如 `const x = "10"` 和 `const y = 10` 比较，`x==y` 返回 `true`, `x===y` 返回 `false`
逻辑运算符，if-else 语句，三目运算符规则，Switch-case和 C++一致

循环语句：
for-i 和 while 语句与 C++一致，for-each 语法中 `:` 改为 `of`
# 主站内容
[现代 JavaScript 教程](https://zh.javascript.info/)
## 基础知识
- JavaScript 的能力很大程度上取决于它运行的环境。例如，[Node.js](https://wikipedia.org/wiki/Node.js) 支持允许 JavaScript 读取/写入任意文件，执行网络请求等的函数。
- 浏览器中 JavaScript 可以做与网页操作、用户交互和 Web 服务器相关事情。
- 网页中 JavaScript 不能读、写、复制和执行硬盘上的任意文件。它没有直接访问操作系统的功能。
#### 简单内容编写规则
```html
<script type="text/javascript"><!--
    ...
//--></script>
```
- 早期 script 标签中强制要求 type 属性并标明 js 格式，这些注释是用于不支持 `<script>` 标签的古老的浏览器隐藏 JavaScript 代码的，下载没有这种问题，所以废弃
- 但如果脚本内容过多，可以添加 `src` 属性从外部引入
	- 如果设置了 `src` 特性，`script` 标签内容将会被忽略。
	- 一个单独的 `<script>` 标签**不能同时有 `src` 特性和内部包裹的代码**。
- 当存在换行符（line break）时，在大多数情况下可以省略分号（但最好加上）
- 在脚本文件顶部输入 `"use strict"` 表示整个脚本文件都将以“现代”模式进行工作（老旧有缺陷的和代码将被忽略，只执行符合现代模式的脚本内容）
- 进入严格模式后不能回退
- 数据类型中使用 Number 进行的数学运算是安全的，最坏的结果是得到 NaN 返回，不会因发生错误而停止脚本
- NaN 是 Int 对象中一个成员函数，**是一个值，不是一个错误**
- `BigInt` 可以创建任意长度的整数
`const bigInt = 1234567890123456789012345678901234567890n`; 数字末尾加 n 表示 `BigInt` 类型
- js 的字符串可以用双引号，单引号和**反引号**定义，反引号是 **功能扩展** 引号。它们允许我们通过将变量和表达式包装在 `${…}` 中，来将它们嵌入到字符串中。
- 反引号中字符串允许**嵌入**，如：
```js
alert( `the result is ${1 + 2}` ); // 这样是允许的
alert( "the result is ${1 + 2}" )// 这样不允许
```
用 alert 定义的信息窗口叫做模态窗，用户不能与页面的其他部分（例如点击其他按钮等）进行交互，直到他们处理完窗口
prompt 函数，语法为：`prompt(title, [default])`，title 表示弹出窗口显示的信息，default 表示输入的默认值，可以用变量传递这个值并操作
```js
let age = prompt('How old are you?', 100);
alert(`You are ${age} years old!`); // You are 100 years old!
```
浏览器会弹出窗口询问并填入默认值 100，然后 alert
confirm 一个带有 question 以及**确定和取消两个按钮**的模态窗口。返回值为 `Boolean`

---
类型转换：
`alert` 会自动将**任何值都转换为字符串**以进行显示。
`/` 用于非 number 类型时会自动转换
`boolean` 非空字符串会被转化为 true（`Boolean("0") == true`），PHP 中为 `false`
- 一元运算符作用于非数字或者一个数字上，没有任何效果，会将非数字转化为**数字**，这个特性可以用于快速将数字字符串转换为数字，而不用*显示转换*
```js
let apples = "2";
let oranges = "3";
// 在二元运算符加号起作用之前，所有的值都被转化为了数字
alert( +apples + +oranges ); // 5
```
- 如果字符串中数字不能转换为数字，`-` 首先尝试强制类型转换为数字，不能则返回 `NaN` ， `+` 操作是字符串连接操作
```js
4 + 5 + "px" = "9px"
"$" + 4 + 5 = "$45"
"4px" - 2 = NaN
"  -9  " + 5 = "  -9  5" // (3)
"  -9  " - 5 = -14 // (4)
```
js 支持**赋值赋值语句**和链式赋值
```js
let a = 1;
let b = 2;
let c = 3 - (a = b + 1);
alert( a ); // 3
alert( c ); // 0
a = b = c = 2 + 2;// abc都赋值为2
```
自增自检运算符**只适用于变量**，不能将它用于常量

---
位运算符
- 按位与 ( `&` )
- 按位或 ( `|` )
- 按位异或 ( `^` )
- 按位非 ( `~` )
- 左移 ( `<<` )
- 右移 ( `>>` )
- 无符号右移 ( `>>>` )
逗号运算符能让我们处理多个表达式，使用 `,` 将它们分开。每个表达式都运行了，但只有最后一个的结果会被返回。
```js
let a = (1 + 2, 3 + 4);
alert( a ); // 7（3 + 4 的结果）
```
字符串中*比较操作*通过按字母比较的的方式判断大于小于，不同类型间的比较，js 会将他们转化为 number 类型后比较
```js
alert( null === undefined ); // false 两者是基本数据类型，不相等
alert( null == undefined ); // true 值相等，都是未定义的值
alert( null > 0 );  // (1) false
alert( null == 0 ); // (2) false
alert( null >= 0 ); // (3) true
alert( undefined > 0 ); // false (1) undefined不能与任何值比较，因undefined转化为number时得到的值是NaN
alert( undefined < 0 ); // false (2)
alert( undefined == 0 ); // false (3)
```
undefined 只与 null `==`
所有链式调用的逻辑运算符，都是**从左到右匹配的**，对于复杂的逻辑，调整逻辑运算符判断表达式的顺序能优化性能
`!` 用于判断**操作数**是否非空
`!!` 用于将数值转换为 bool 值，如 `!!"value"` 表示将字符串转化为 0 后再转化为 1，用于调用并判断一个变量的 bool 结果
空值合并运算符 `??`，`a??b`，如果 a 有定义则返回 a，反之返回 b
```js
let firstName = null;
let lastName = null;
let nickName = "Supercoder";
// 显示第一个已定义的值：
alert(firstName ?? lastName ?? nickName ?? "匿名");
------------------
function showCount(count) {
  // 如果 count 为 undefined 或 null，则提示 "unknown"
  alert(count ?? "unknown");
}
```
- `||` 返回第一个 **真** 值。
- `??` 返回第一个 **已定义的** 值。

---
#### 循环语法
禁止 `break/continue` 在 `?` 的右边，三元表达式中禁用：
`(i > 5) ? alert(i) : continue; ` 是错误的
标签：
**标签** 是在循环之前带有冒号的标识符
```js
outer:
for (let i = 0; i < 3; i++) {
  for (let j = 0; j < 3; j++) {
    let input = prompt(`Value at coords (${i},${j})`, '');
    if (!input) break outer; // (*)
  }
}

alert('Done!');
```
类似 `goto` 跳转至标签位置**并且跳出循环**，也就是这个跳到 `outer` 处会跳出循环，下一步到 `alert`（因是 break 类型的标签跳转），如果使用 continue 类型的标签跳转就只会跳出当前循环

`switch-case` 语句中 case 匹配机制是 `===` **严格相等**

---
#### 函数
js 的函数可以没有返回值，即 `return;`
不要在 return 和返回值之间**添加新行**，因 js 默认在 return 后没有内容时添加 `;`
js 中，函数可以作为**一个值**使用，可以被定义成一个变量的值
- 函数是一个**值**
- 与 C 语言不同的是，不使用 `()` 的函数名称赋值并不会将**函数的地址**赋值给变量，或者将一个函数的指针赋值给变量
- 值为一个函数的变量**也是一个函数**
![[Pasted image 20250118154716.png]]
`func` 变量的类型是一个返回值为 `void` 的函数
js 允许在函数**参数中定义一个函数**，因函数的本质是一个**值**
```js
function ask(question, yes, no) {
  if (confirm(question)) yes()
  else no();
}

ask( // 调用
  "Do you agree?",
  function() { alert("You agreed."); },
  function() { alert("You canceled the execution."); }
);
```
- 函数声明和其他语言没有区别，**函数表达式**只有在函数定义在 `=` 右边时才会被 js 自动创建，并且**在函数声明被定义之前，它就可以被调用**，js 中函数的声明顺序**和位置**没有要求，并且声明后就可以被调用，不关有没有定义内容（函数体）（不像 C++声明必须在定义之前，并且只能定义在**对象或者全局中**）
- 函数表达式不算函数声明，在运行后只会**被看做一个操作**，不会创建函数，更不能调用
```js
sayHi("John"); // error!

let sayHi = function(name) {  // (*) no magic any more
  alert( `Hello, ${name}` );
};
```
- 箭头函数
类似于 kotlin 中 [[Jetpack  Compose开发#lambda 函数|lambda函数]]，如果返回值只有一行，可以直接写在 `=>` 后
```js
let double = (n/*only 1 para () can be omit*/) => /*return*/ n * 2;
// 差不多等同于：let double = function(n) { return n * 2 }
// double变为函数引用
alert( double(3) ); // 6
```
### 代码质量
#### 调试
浏览器中启动调试方法是：打断点后**刷新页面**
![[Pasted image 20250118163341.png]]
1. **`察看（Watch）` —— 显示任意表达式的当前值。**
    你可以点击加号 `+` 然后输入一个表达式。调试器将显示它的值，并在执行过程中自动重新计算该表达式。
2. **`调用栈（Call Stack）` —— 显示嵌套的调用链。**
    此时，调试器正在 `hello()` 的调用链中，被 `index.html` 中一个脚本调用（这里没有函数，因此显示 “anonymous”）
    如果你点击了一个堆栈项，调试器将跳到对应的代码处，并且还可以查看其所有变量。
3. **`作用域（Scope）` —— 显示当前的变量。**
    `Local` 显示当前函数中变量，你还可以在源代码中看到它们的值高亮显示了出来。
    `Global` 显示全局变量（不在任何函数中）。

---
按下 `F8` 表示**恢复**，即跳出断点（不是单步执行 `F9`，跨步 `F10`）
 —— 步入（Step into），快捷键 `F11`。
	和“下一步（Step）”类似，但在异步函数调用情况下表现不同，下一步（Step）”命令会忽略异步行为，例如 `setTimeout`（计划的函数调用），它会过一段时间再执行。而“步入（Step into）”会进入到代码中并等待（如果需要）。详见 [DevTools 手册](https://developers.google.com/web/updates/2018/01/devtools#async)。
 —— “步出（Step out）”：继续执行到当前函数的末尾，`Shift+F11`。
	继续执行当前函数内的**剩余代码**，并暂停在调用当前函数的下一行代码处
### 面向对象编程
#### 对象的组成属性
创建对象就像创建变量一样简单， js 对对象成员变量实现有类似哈希表一样的逻辑：
```js
let obj = {
  for: 1,
  let: 2,
  return: 3
  0: "test"// 等同于 "0": "test"，也是合法的，但出了对象内这样命名不合法，
};
```
对象中读取一个**不存在的属性**会得到 `undefined` 的结果，并不会报错
可以用 `in` 检查一个“键”是否存在于对象中
`"key" in object`
`in` 的左边必须是 **属性名**。通常是一个带引号的字符串。

---
由于对象有**类似哈希表一样的存储逻辑**，创建对象时对象中“**键值对**”有特别的顺序”：整数属性会被进行排序，其他属性则按照创建的顺序显示。

- 其中整数属性由于变量名不能使用整数类型，所以会默认使用**引号包裹起来的纯数字字符**是整数属性，字母字符**或者不是纯数字的字符**是字符串属性
```js
let user = {
  name: "John",
  surname: "Smith"
};
user.age = 25; // 增加一个

// 非整数属性是按照创建的顺序来排列的
for (let prop in user) {
  console.log( prop ); // name, surname, age
}
```
注意获取的对象时对象中**键**而不是对应的值，可以改成 `console.log(user[prop]）` 获取值，删除对象中键方法是 `delete obj.name;`（这种删除方法并**没有删除对象中内容的值**，而是解除 obj 对 name 变量的关联，然后通过[[#内存管理|垃圾回收机制]]使 name 变得不可达后被**回收内存**
#### 对象的引用和复制
对象与原始类型的根本区别之一是，对象是“通过引用”存储和复制的，而原始类型：字符串、数字、布尔值等 —— 总是“作为一个整体”**复制**。
将一个对象赋值给一个变量时，变量接收到的是一个**地址值**
```js
let a = {};
let b = a; // 复制引用
let c = {};

alert( a == b ); // true，都引用同一对象
alert( a === b ); // true
alert( a == c );  // false 因内存地址不一样
alert( a === c ); // false 同上，但两者类型是一样的，都是object
```
如果想要复制一个对象，可以使用循环遍历复制每一个对象属性给目标对象，也可以使用 `obj.assign(targetObj,[src1,src2......])` 实现，可以方便**合并**多个对象，其中，targetObj 中如果有同名属性就会被覆盖
```js
let user = { name: "John" };
let permissions1 = { canView: true };
let permissions2 = { canEdit: true };
// 将 permissions1 和 permissions2 中所有属性都拷贝到 user 中
val combinedObj = Object.assign({},user, permissions1, permissions2);// 先复制到匿名对象{}中，再通过assign的返回值赋值给combinedObj
```
---
带来的麻烦：
- 对结构复杂的对象不会进行深拷贝，对象中对象通过 `obj.assign` 方法在新对象中还是引用复制，**新老对象公用同一个内部的对象**
- const 声明的对象，只是**对象名所指向的函数内存地址**不变，并不是其中内容不变，未声明 `const` 的对象成员可以被外部修改
```js
const user = /*这里不能写const*/{
  name: "John"
};
user.name = "Pete"; // (*)
alert(user.name); // Pete
```
#### 成员方法
##### 自定义成员方法
```js
let user = {
  sayHi() { // 与 "sayHi: function(){...}" 一样
    alert("Hello");
  }
};
```
还可以外部定义函数后使用 `obj.func(){}` 来插入函数
对象中使用 `this` 指代当前**对象**，从技术上来讲，不用 `this` 而用当前对象名也可以，但导致对象在复制时会出现访问旧对象的成员的错误（其他语言中也一样）
箭头函数没有自己的 `this`，因他没有名字，无法对应一块固定的内存来访问
##### 内置函数，方法
构造函数，1. 它们的命名以大写字母开头。2. 它们只能由 `"new"` 操作符来执行。
当一个函数被使用 `new` 操作符执行时，它按照以下步骤：
1. 一个新的空对象被创建并分配给 `this`。
2. 函数体执行。通常它会修改 `this`，为其添加新的属性。
3. 返回 `this` 的值。
```js
function User(name) {
  this.name = name;
  this.isAdmin = false;
}
let user = new User("Jack");
-----------等价于------------
function User(name) {
  // this = {};（隐式创建）
  // 添加属性到 this
  this.name = name;
  this.isAdmin = false;
  // return this;（隐式返回）
}// 然后将这个这个函数**作为函数表达式**返回给变量
------------等价于--------------
function User(name) {
// 注意User仍在外部定义，可以被调用，有名字，这里不是函数表达式
  this.name = name;
  this.isAdmin = false;
}
let user = {
  name: "Jack",
  isAdmin: false
};
```
只是 `new func(){}` 这一部分会被作为函数表达式
和其他语言一样，作为构造函数不能有 return 内容，要么返回空 `return;`（表示返回一个 `this` 指针重新跳回对象中）要么在 return 处构造一个**新的对象覆盖旧的**
```js
function BigUser() {
    this.name = "John";
    return { nick_name: "Godzilla" };  // <-- 返回这个对象，但nickname不存在，会返回undefined，因原来的name已被覆盖
}
console.log( new BigUser().name );
```
创建对象和使用构造函数的核心是：

> - 构造函数只能使用 `new` 来调用。这样的调用意味着在开始时创建了空的 `this`，并在最后返回填充了值的 `this`。

##### 可选链 `?.`
假设有很多 `user` 对象，其中存储用户数据。用户的地址都存储在 `user.address` 中，街道地址存储在 `user.address.street` 中，但有些用户没有提供这些信息。
如果没有提供地址信息而尝试获取 `user.address.street`，会收到一个错误
为了判断用户是否填了信息（或者说用户对应的 `user` 对象中是否含有对应的成员），则需要 `alert(user.address ? user.address.street ? user.address.street.name : null : null);` 这种冗长的代码
所以，引入 `?.`，`?.` 前面的值为 `undefined` 或者 `null`，它会停止运算并返回 `undefined`
- `?.` 可以和 `.` 联系起来使用，来表明那些成员属性是**非空的**，哪些是可以为空的
- `?.` 前对象必须声明
- `?.()` 用来访问一个可能不存在的对象成员方法，`?.[]` 访问可能不存在的对象值
- `?.` 及其变体可以跟 `delete` 一起使用
#### symbol 类型
只有两种原始类型可以用作对象属性键：
- 字符串类型
- symbol 类型
可以使用 `Symbol()` 来创建这种类型的值：
`let id = Symbol();`
创建时可以给 symbol 设置描述（也称为 symbol 名）
`let id = Symbol("id");`
```js
let id1 = Symbol("id");
let id2 = Symbol("id");
alert(id1 == id2); // false
```
- symbol 类型的对象**无法转换成字符串**，不能被 console. log 作为参数，alert 同理
```js
let id = Symbol("id");

let user = {
  name: "John",
  [id]: 123 // 而不是 "id"：123，表明id是一个symbol而不是字符串
};
```
- symbol 保证是唯一的。即使我们创建了许多具有相同描述的 symbol，它们的值也是不同。描述只是一个标签，不影响任何东西。
- 如果一个脚本同时存在于两个代码库（可以类比于“命名空间”），两个空间内对对象创建的 symbol 类型的成员**互相不可见且独立**
- for in 循环会跳过 symbol 类型键，因他们是“**隐藏的**”
- symbol 类型就像普通的数据类型一样，可以被创建在任何位置
- `Symbol.keyfor(Symbol_val_name)` 可以获取**全局** symbol 对象的 value
- `Symbol.for (Symbol_val_name)` 创建或者获取全局 symbol 变量
```js
// 从全局注册表中读取
let id = Symbol.for("id"); // 如果该 symbol 不存在，则创建它
// 再次读取（可能是在代码中另一个位置）
let idAgain = Symbol.for("id");
// 相同的 symbol
alert( id === idAgain ); // true
```
### 对象—— 原始值转换
#### 模板字符串 `${}`
前面说过 js 中有三种字符串字符串定义方式，其中反引号包裹的字符串中可以使用**格式化拼接**方法，`${}` 中表达式会被自动转换为字符串。如果表达式的结果是**对象**，会调用该对象的 `toString()` 方法。
任何一个对象都有默认的 `toString()` 方法
```js
let obj = { name: "张三" };
let str = `The object is ${obj}`; // 输出: The object is [object Object]
```
和 `+` 不同的是，`+` 本质上是在*连接字符串*，作为一元操作符时也会调用操作对象的 `toString()` 方法，使原来对象**看起来类型变成了字符串**
当`+`运算符的一个操作数是字符串时，另一个操作数会被转换为字符串。如果两个操作数都是非字符串类型，`+`运算符会进行数值加法。
#### 对象转换逻辑
JavaScript 不允许自定义运算符对对象的处理方式，实际项目中不存在对对象的数学运算，不支持定义对象之间的计算方式（[[C++ Runoob Tutoral#运算符重载]]）
但 js 提供了 `Symbol.toPrimitive()` 方法，允许开发者**自定义对象在类型转换**过程中行为，这个 symbol 属性**会在对象发生类型转换时**自动调用属性值
```js
let user = {
  name: "John",
  money: 1000,

  /*此处省略了obj关键字*/[Symbol.toPrimitive](hint) {// mark
    alert(`hint: ${hint}`);
    return hint == "string" ? `{name: "${this.name}"}` : this.money;
  }
};
// 转换演示：
alert(user); // hint: string -> {name: "John"}
alert(+user); // hint: number -> 1000
alert(user + 500); // hint: default -> 1500
```
其中，mark 位置表示在 user 对象中定义一个**动态符号属性**
- 并且这个属性的属性名为 symbol 类型（因使用了 `[]`），user 对象中定义了一个属性值为函数，类型为 symbol 的属性
- 这个动态属性是一个函数调用（因使用 `()`），并且接受一个名为 hint 的变量作为参数
- 函数体为：
	- `alert("hint: ${hint}");` **使用插值表达式**：`${hint}` 中 `hint` 的内容会被JavaScript引擎计算其值，然后将计算结果插入到字符串中。
- 在转换演示中：
	- 由于 alter 只能接受字符串类型参数，user 不是——发生类型转换，Symbol. toPrimitive 这个**属性的属性值被调用**，相当于 `alter(user[Symbol.toPrimitive])`
	- 上下文为 alter 括号中内容，他被 JavaScript 引擎解析，解析结果有三种，分别是 `"string"`，`"number"` 和 `"default"`
	- `alert` 显示字符串类型的 `hint: +解析结果`
	- 通过函数的 return 值指导转换演示中 alter 的字符串内容

---
如果没有 `Symbol.toPrimitive`，那么 JavaScript 将根据上下文中解析出的 hint 尝试寻找 `toString` 和 `valueOf` 方法
- 解析结果为 `"string"`，调用 `toString` 方法，如果它不存在，则调用 `valueOf` 
- 解析结果为 `"number"` 或 `"default"`，调用用 `valueOf` 方法，如果它不存在，则调用 `toString` 方法

> 这也就是为什么对于字符串转换，优先调用 `toString`，对于数学运算，优先调用 `valueOf` 方法

- `toString` 方法返回一个字符串 `"[object Object]"`。
- `valueOf` 方法返回对象自身。
```js
let user = {
  name: "John",
  money: 1000,

	toString() {
	  return `{name: "${this.name}"}`;
	},

	// 对于 hint="number" 或 "default"
	valueOf() {
	  return this.money;
	}
};
```
这样写，不需要 `[Symbol.toPrimitive]`，效果一样

---
**转换可以返回任何原始类型**
所有原始转换方法，它们不一定会返回 “hint” 的原始值。没有限制 `toString()` 是否返回字符串，或 `Symbol.toPrimitive` 方法是否为 `"number"` hint 返回数字。一强制性的事情是：这些方法必须返回一个原始值，而不是对象。


### 内存管理
内存管理根据下面几个特性判断一块内存是否应该被释放
- 可达性（Reachability）
1. 固有的可达值明显不能被释放。
    - 当前执行的函数，它的局部变量和参数。
    - 当前嵌套调用链上的其他函数、它们的局部变量和参数。
    - 全局变量。
    - （还有一些其他的，内部实现）
    这些值被称作 **根（roots）**。
2. 如果一个值可以从根通过引用或者引用链进行访问，则认为该值是可达的。
    比方说，如果全局变量中有一个对象，并且该对象有一个属性引用了另一个对象，则 **该对象**被认为是可达的。而且它引用的内容也是可达的。
3. 相互关联的对象
```js
function marry(man, woman) {// 两个对象类型
  woman.husband = man;
  man.wife = woman;
  return {
    father: man,
    mother: woman
  }
}

let family = marry({
  name: "John"
}, {
  name: "Ann"
});
```
产生的内存结构相互关联，不能回收
![[Pasted image 20250118202723.png|350]]
使用 `delete` 可以删除引用，从而使变量**不再被链接应用**被回收
![[Pasted image 20250118203100.png|350]]
图中没有从根指向 father，name 的引用，整个 father 会被回收

---
垃圾回收逻辑算法：
- 垃圾收集器找到所有的根，并“标记”（记住）它们。
- 然后它遍历并“标记”来自它们的所有引用。
- 然后它遍历标记的对象并标记 **它们的** 引用。所有被遍历到的对象都会被记住，以免将来再次遍历到同一个对象。
- ……如此操作（可以看出，这是一个**有固定操作次数的层级操作**），直到所有可达的（从根部）引用都被访问到。
- 没有被标记的对象都会被删除。

## 数据类型

# Mozilla MDN web docs
#