### 12.4.2　在屏幕上绘制飞船
`blit` 方法是用来将一个图像（即Surface对象）绘制到另一个Surface对象上的。它的基本作用是将源图像的像素数据复制到目标位置。`blit` 的操作允许你在主屏幕或其他Surface上展示图像、更新游戏画面或是合成不同的图形元素。
```python
self.screen.blit(self.image,self.rect)
```
这个操作将 image 图像按照 rect 所表示的位置**绘制到 screen**Suface 对象上

### 12.6.4　调整飞船的速度
`rect` 的 `centerx` 等属性只能存储整数值，但在 settings 中将速度调整为小数可以精细控制飞船速度，所以
需要稍微调整一下
```python
class Ship():
    def __init__(self,ai_settings,screen):
        self.screen = screen
        self.ai_settings = ai_settings
        self.center = float(self.rect.centerx)
		------snip-------


    def update(self):
        """adjust position base on the move flag"""
        if self.moving_right:
            self.center += self.ai_settings.ship_speed_factor
        if self.moving_left:
            self.center -= self.ai_settings.ship_speed_factor
        self.rect.centerx = self.center
```
- 关键定在于创建一个新的 center 变量接受浮点数速度值，用变量改变 center 值，后传入rect.centerx，不然**用+=操作self.centerx 会导致小数点被截断**
- 并且后面还需要写便捷检查代码，在逻辑上应该先判断是否超出边界，然后再更新 `self.rect.centerx`
-
### 13.5.1　检测子弹与外星人的碰撞
`rect.colliderect(otherRect)` 可以检测两个矩形是否相撞
`sprite.groupcollide()` 可以检测一个 Group 中所有元素**是否出现相互碰撞**，后返回一个字典，每个键值对都是相撞的对象
在更新子弹时，需要**删除子弹和飞船**，这些操作都封装在函数中：
```python
def update_bullets(bullets):
    bullets.update()
    for bullet in bullets.copy():
        if bullet.rect.bottom <= 0:
            bullets.remove(bullet)
    print(f"activated bullet in screen : {len(bullets)}")
    collisions = pygame.sprite.groupcollide(bullets, bullets,True, True)
```


### 13.6.1　检测外星人和飞船碰撞
`pygame.sprite.spritecollideany` 是 Pygame 精灵模块中一个非常实用的方法，用于检测一个精灵是否与精灵组中任意精灵发生碰撞。

|方法|返回类型|特点|
|---|---|---|
|`spritecollideany`|单个精灵或None|返回第一个碰撞的精灵|
|`spritecollide`|精灵列表|返回所有碰撞的精灵|
|`groupcollide`|字典|检测两个精灵组之间的碰撞|

### 13.6.2　响应外星人和飞船碰撞

不能将更新飞船的代码写成
```python
# ship.py
def update(self):
    """adjust position base on the move flag"""
    if self.moving_right and self.rect.right < self.screen_rect.right:
        self.centerx += self.ai_settings.ship_speed_factor
    if self.moving_left and self.rect.left > 0:
        self.centerx -= self.ai_settings.ship_speed_factor
    if self.moving_down and self.rect.bottom < self.screen_rect.bottom:
        self.centery += self.ai_settings.ship_speed_factor
    if self.moving_up and self.rect.top > 0:
        self.centery -= self.ai_settings.ship_speed_factor
    self.rect.centerx = self.centerx
    self.rect.centery = self.centery

def blitme(self):
    """draw ship image in the certain position"""
    self.screen.blit(self.image, self.rect)

def center_ship(self):
    self.rect.centerx = self.screen_rect.centerx
    self.rect.bottom = self.screen_rect.bottom - 10
```
原因是**每次调用 update**时都会充值self.rect，这就相当重置了飞船位置，但相撞后（调用**ship_hit**后）进入下一个循环 `ship.update` 就会将飞船拉回原地，

### 14.1.1　创建  `Button 类
`pygame.display.flip() ` 的作用是将**最近通过 `blit` 和 `draw ` 绘制的图形显示出来**，是一次性统一的绘制

#### 1. 关于 `@classmethod` 装饰器

`@classmethod` 是 Python 中一个装饰器，用于定义类方法。它的主要特点和使用方法如下：
##### 作用：
1. 将方法绑定到类而不是实例
2. 第一个参数是类本身（通常命名为 `cls`）
3. 可以通过类名直接调用，不需要实例化
4. 可以访问类属性，但不能访问实例属性
##### 使用方法：

```python
class MyClass:
    class_var = "class variable"

    @classmethod
    def class_method(cls, arg):
        print(f"Class method called with {arg}")
        print(f"Accessing class variable: {cls.class_var}")

```
#### 与普通方法的区别：

|方法类型|第一个参数|调用方式|访问权限|
|---|---|---|---|
|实例方法|`self`|需要实例化|可访问实例和类属性|
|类方法|`cls`|可直接通过类调用|只能访问类属性|
|静态方法|无|可直接通过类调用|不能访问类或实例属性|

---
### 🤖 Assistant

# Python中参数传递机制

Python的参数传递机制既不是纯粹的"值传递"，也不是纯粹的"引用传递"，而是一种称为**"对象引用传递"**(或"共享对象传递"，"call by object reference")的独特机制。

## Python参数传递的核心特点

1. **传递的是对象的引用**（类似指针的概念）
2. **不可变对象**（如int, float, str, tuple等）在函数内的修改会创建新对象
3. **可变对象**（如list, dict, set等）在函数内的修改会影响原对象

## 示例说明

### 示例1：不可变对象（值表现）

```python
def modify_num(x):
    print("函数内初始id:", id(x))
    x += 10  # 创建新的整数对象
    print("函数内修改后id:", id(x))
    print("函数内x值:", x)

a = 5
print("调用前id:", id(a))
modify_num(a)
print("调用后a的值:", a)
print("调用后id:", id(a))
```

**输出结果**:
```
调用前id: 140736784135168
函数内初始id: 140736784135168
函数内修改后id: 140736784135488
函数内x值: 15
调用后a的值: 5
调用后id: 140736784135168
```

**解释**：数字是不可变对象，函数内修改会创建新对象，不影响原变量。

### 示例2：可变对象（引用表现）

```python
def modify_list(lst):
    print("函数内初始id:", id(lst))
    lst.append(4)  # 在原列表上修改
    print("函数内修改后id:", id(lst))
    print("函数内lst:", lst)

my_list = [1, 2, 3]
print("调用前id:", id(my_list))
modify_list(my_list)
print("调用后my_list:", my_list)
print("调用后id:", id(my_list))
```

**输出结果**:
```
调用前id: 2389768154496
函数内初始id: 2389768154496
函数内修改后id: 2389768154496
函数内lst: [1, 2, 3, 4]
调用后my_list: [1, 2, 3, 4]
调用后id: 2389768154496
```

**解释**：列表是可变对象，函数内修改会影响原对象。

### 示例3：引用重新绑定

```python
def rebind_list(lst):
    print("函数内初始id:", id(lst))
    lst = [4, 5, 6]  # 引用重新绑定到新列表
    print("函数内重新绑定后id:", id(lst))
    print("函数内lst:", lst)

my_list = [1, 2, 3]
print("调用前id:", id(my_list))
rebind_list(my_list)
print("调用后my_list:", my_list)
print("调用后id:", id(my_list))
```

**输出结果**:
```
调用前id: 2389768399360
函数内初始id: 2389768399360
函数内重新绑定后id: 2389768399104
函数内lst: [4, 5, 6]
调用后my_list: [1, 2, 3]
调用后id: 2389768399360
```

**解释**：虽然传入的是引用，但对引用重新赋值（=）不会影响原变量。

## 总结表格

| 对象类型 | 传递方式              | 函数内修改行为               | 外部影响 |
|----------|-----------------------|------------------------------|----------|
| 不可变对象(int, str, tuple等) | 传递对象引用 | 创建新对象                   | 无影响   |
| 可变对象(list, dict, set等) | 传递对象引用       | 在原对象上修改               | 有影响   |
| 任何对象(使用=重新赋值) | 传递对象引用 | 引用重新绑定到新对象       | 无影响   |

## 实际应用建议

1. **避免意外修改**：如果不想函数修改传入的可变对象，可以传递拷贝（如`list.copy()`或`copy.deepcopy()`）
2. **返回新对象**：对不可变对象的修改通常需要返回新对象
3. **明确函数行为**：在函数文档中说明是否会修改传入的可变对象

Python的这种参数传递方式既保证了效率（不复制大对象），又通过不可变对象提供了安全性，同时也保持了灵活性。