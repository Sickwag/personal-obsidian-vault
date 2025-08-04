# Get Started  
## 为 JavaScript 程序员准备的 TypeScript
### 定义类型
可以通过赋值创建对象
```ts
const user = {
  name: "Hayes",
  id: 0,
};
```
通过 interface 声明内部数据类型
```ts
// 接口不能用const修饰
interface User {
  name: string;
  id: number;
}
```
但可以用对象实现接口
```ts
interface User {
  name: string;
  id: number;
}
// ---分割线---
const user: User = {
  name: "Hayes",
  id: 0,
};
```
构造函数声明：
```ts
interface User {
  name: string;
  id: number;
}
 
class UserAccount {
  name: string;  // name: string = "hello"可以这样赋值
  id: number;
 
  constructor(name: string, id: number) {
    this.name = name;
    this.id = id;
  }
}
 
const user: User = new UserAccount("Murphy", 1);
```
### 组合类型
有两种流行的方法可以做到这一点：联合和泛型。
#### 联合类型
使用联合，可以声明类型可以是许多类型中的一种。例如，可以将 boolean 类型描述为 true 或 false ：
```ts
type MyBool = true | false;
```
注意：如果将鼠标悬停在上面的 MyBool 上，您将看到它被归类为 boolean。这是结构化类型系统的一个属性。下面有更加详细的信息。
***所以他像是 C++的 union+ enum + unordered_map<int,string or other types>***

联合类型的一个流行用法是描述 string 或者 number 的字面量的合法值。
```ts
type WindowStates = "open" | "closed" | "minimized";
type LockStates = "locked" | "unlocked";
type PositiveOddNumbersUnderTen = 1 | 3 | 5 | 7 | 9;
```
函数参数也可以是联合体
```ts
function getLength(obj: string | string[]) {
  return obj.length;
}
```
#### 泛型类型
```ts
interface Backpack<Type> {
    contents: Type;
    add: (obj: Type) => void;
    get: () => Type;
}

declare const backpack: Backpack<string>; // 就像C++中的函数或者变量声明一样，提前告诉编译器这里有一个名为backpack的变量
backpack.add("hello");
const object = backpack.get();
```
`declare` 表示“告诉 TypeScript：在运行时，**会有一个名为 `backpack` 的常量，它的类型是 `Backpack<string>`**”，但 **不需要在这里提供实现**。
这段代码没有提供 backpack 对象的实现但是又提前声明了有这个对象存在，所以**编译期不会报错，运行期会**

### 结构化的类型系统（structural type system）
```ts
interface Point {
  x: number;
  y: number;
}
 
function logPoint(p: Point) {
  console.log(`${p.x}, ${p.y}`);
}
 
// 打印 "12, 26"
const point = { x: 12, y: 26 };
logPoint(point);
```
`point` 变量从未声明为 `Point` 类型。但是，在类型检查中，TypeScript 将 `point` 的结构与 `Point` 的结构进行比较。类似 C++的[[Modern C++#初始化列表|初始化列表]]
类和对象确定结构的方式没有区别
```ts
interface Point {
  x: number;
  y: number;
}
 
function logPoint(p: Point) {
  console.log(`${p.x}, ${p.y}`);
}
// ---分割线---
class VirtualPoint {
  x: number;
  y: number;
 
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}
 
const newVPoint = new VirtualPoint(13, 56);
logPoint(newVPoint); // 打印 "13, 56"
```
# # TypeScript 新手指南
js 的缺陷
JavaScript 的相等运算符（ == ）会强制转换其操作数，导致意外的行为：
```js
if ("" == 0) {
  // It is! But why??
}
if (1 < x < 3) {
  // True for *any* value of x!
}
```
JavaScript 还允许访问不存在的属性：
```js
const obj = { width: 10, height: 15 };
// Why is this NaN? Spelling is hard!
const area = obj. width * obj. heigth;// 这里拼错了height，但是没有抛出异常
```
从 JavaScript 移动到 TypeScript，它保证会以相同的方式运行，即使 TypeScript 认为代码存在类型错误。一旦 TypeScript 的编译器检查完你的代码，它会将类型信息擦除，以生成最终的“编译”代码。这意味着一旦你的代码被编译，生成的普通 JS 代码将不再包含类型信息。