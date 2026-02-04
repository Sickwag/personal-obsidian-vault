各种函数使用方法教程 [Python 模块EasyGui详细介绍(转载) - 知乎 (zhihu.com)](https://zhuanlan.zhihu.com/p/93515771)
官方文档 <www.easygui-docs-0.96\tutorial\index. html>
博客园和 csdn 小甲鱼原书内容 [EasyGUI 学习文档【超详细中文版】（from小甲鱼 ） - 廖海清 - 博客园 (cnblogs.com)](https://www.cnblogs.com/hale547/p/13301951.html)
[[扩展阅读] EasyGUI 学习文档【超详细中文版】-CSDN博客](https://blog.csdn.net/vivid117/article/details/104590501)
### 使用 easygui 写窗口程序
```python
import easygui as eg
import sys
while 1 :
    eg.msgbox("first message","first graphic interface window !")
    # ---------------------------定义变量
    msg = "what do you want ?"
    title = "a game waiting on you "
    choices = ["1.programming", "do math","just have fun"]
    # -----------------------------------
    # choice = eg.choicebox(msg,title,choices) # we can define vars in the bracket
    choice = eg.choicebox(msg=msg,title=title,choices= choices) # we can input argument in formal_arg = var ; or just input real arg
    # 编译器会在你输入msg时默认弹出msg= ，也就是说choicebox中的参数都是关键字传参位置确定的
    #---------------------------------定义变量
    msg = "do you wanna replay the game ?"
    title = "make you choice"
    # -----------------------------------------
    if eg.ccbox(re_msg = msg,re_title= title):
        #ccbox only return true or false,what you chose decide what you going to do in if statement
        pass
    else :
        sys.exit()
```
### easygui 演示程序
```python
# 演示程序cmd中运行
python easygui.py
# 或python代码中运行
import easygui as eg
eg.eg.demo()
```
### EasyGUI 函数的默认参数
对于所有对话框而言，前两个参数都是消息主体和对话框标题。

按照这个规律，在某种情况下，这可能不是理想的布局设计（比如当对话框在获取目录或文件名的时候会选择忽略消息参数），但保持这种一致性且贯穿于所有的窗口部件是更为得体的考虑！
绝大部分的 EasyGUI 函数都有默认参数，几乎所有的组件都会显示消息主体和对话框标题。也都能在参数列表中设置 root 选项制定父窗口，image 参数可以指定消息主题显示的图片
标题默认是空字符串，消息主体通常有一个简单的默认值。

### 各种函数使用方法
#### msgbox
`msgbox` 函数接受以下参数：

- `msg`: 要显示的消息文本。
- `title`: 消息框窗口的标题。
- `ok_button`: 显示在按钮上的文本，用于替代默认的“OK”。
- `image`: （可选）显示在消息框中的图片文件名。
- `root`: （可选）指定消息框的父窗口。
函数的返回值是“OK”按钮上的文本。通常情况下，这个返回值是字符串 "OK"，但你可以通过 `ok_button` 参数自定义按钮上的文本。
#### enterbox
函数的返回值是用户输入的文本。如果用户取消了操作（例如点击了取消按钮或关闭了对话框），则返回 `None`。

`enterbox` 函数接受以下参数：

- `msg`: 要显示的消息，通常是对话框的提示信息。
- `title`: 对话框窗口的标题。
- `default`: 当输入框显示时，如果用户没有更改，将返回的默认文本。
- `strip`: 如果设置为 `True`，则在返回之前会去除用户输入文本的首尾空白字符。
- `image`: （可选）显示在对话框中的图片文件名。
- `root`: （可选）指定对话框的父窗口。
#### ynbox
函数的返回值是布尔值 `True` 或 `False`。如果用户选择“是”或关闭对话框（通常被视为肯定回答），则返回 `True`；如果用户选择“否”，则返回 `False`。

`ynbox` 函数接受以下参数：

- `msg`: 要显示的消息文本。
- `title`: 对话框窗口的标题。
- `choices`: 一个列表或元组，包含对话框中显示的选项。默认情况下，它提供的是`“[<F1>]Yes”`和`“[<F2>]No”`。
- `image`: （可选）显示在对话框中的图片文件名。
- `default_choice`: 当对话框出现时，默认高亮显示的选项。
- `cancel_choice: 如果用户按下窗口的关闭按钮（通常为“X”），则默认选择的按钮。

### 文件默认属性保存
用到 restore () 和 store () 函数
`EgStore` 类中的 `restore` 方法用于从文件中恢复之前保存的数据。`restore` 方法不接受任何参数，并且不返回任何值，它直接在 `EgStore` 对象上操作。如果持久化的对象具有与 `EgStore` 对象中初始化的属性相对应的属性，则这些属性的值将相应属性的值替换。如果对象缺少 `EgStore` 对象中将保留其初始化值。如果包含未初始化的属性，则这些属性将被忽略。
`restore` 方法用于将之前通过 `store` 方法保存的设置恢复到 `EgStore` 对象中，以便应用程序可以记住用户的设置。
简而言之：restore () 在函数中是为了保证能够通过实例化得到之前保存的值，store () 调用就保存数值