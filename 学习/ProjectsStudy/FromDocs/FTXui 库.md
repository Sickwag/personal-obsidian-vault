# FTXui 架构分层设计
## api 设计逻辑
### 动态组件和静态展示效果 api 

| 类型          | 作用              | 是否需要 `Render()` |
| ----------- | --------------- | --------------- |
| `Component` | 交互逻辑（状态管理、事件处理） | ❌ 不直接渲染         |
| `Element`   | 静态视觉表现（文本、边框等）  | ✅ 渲染时需要         |
- `Component`（如 `Button`、`Slider`）是**活的对象**，内部有状态（例如 `slider_value_1=12`）
- 调用 `Render()` 会**动态生成当前状态对应的 `Element`**（比如用 `█` 画出 12/256 的进度条）
- 如果不调用 `Render()`，系统不知道如何把 `Component` 转换成可视的 `Element`
`Render()` 函数用来渲染有状态的组件，静态的 Element 是直接构建的，所以不需要渲染，同理，如果一个 screen 仅仅由 Element 构成，那么只需要使用 `screen.Print()` 就能一次性渲染所有元素，而如果静态组件（如 `container`） 中包含多个 `componet`，那么需要对 componet 对象使用 `Render()` 之后加入容器中。参考[[#交互式表格]]中设计

| 函数                       | 适用场景      | 原理                                                                                              |
| ------------------------ | --------- | ----------------------------------------------------------------------------------------------- |
| `screen.Loop(component)` | **交互式应用** | 持续循环：<br>1. 调用 `component->Render()`<br>2. 等待用户输入<br>3. 调用 `component->OnEvent()` 更新状态<br>4. 重复 |
| `screen.Print()`         | **静态内容**  | 只渲染一次，无事件处理                                                                                     |
`Print` 是没有事件循环的，打印之后点击按钮（button）没有反应。
1. **Render() 必要性** → 只要涉及 `Component`（带状态的交互元素），就必须调用 `Render()` 转成 `Element`
2. **Loop vs Print** → 有按钮/输入框等交互元素 → 无脑用 `Loop()`；纯展示内容 → 用 `Print()`
# 示例演示
## 表格绘制
### 静态表格
### 交互式表格
```cpp
// Copyright 2020 Arthur Sonzogni. All rights reserved.
// Use of this source code is governed by the MIT license that can be found in
// the LICENSE file.
#include <functional>  // for function
#include <memory>      // for shared_ptr, allocator, __shared_ptr_access
#include <string>      // for string, basic_string
#include <vector>      // for vector

#include "ftxui/component/captured_mouse.hpp"      // for ftxui
#include "ftxui/component/component.hpp"           // for Slider, Checkbox, Vertical, Renderer, Button, Input, Menu, Radiobox, Toggle
#include "ftxui/component/component_base.hpp"      // for ComponentBase
#include "ftxui/component/screen_interactive.hpp"  // for Component, ScreenInteractive
#include "ftxui/dom/elements.hpp"                  // for separator, operator|, Element, size, xflex, text, WIDTH, hbox, vbox, EQUAL, border, GREATER_THAN

using namespace ftxui;

// Display a component nicely with a title on the left.
Component Wrap(std::string name, Component component) {
    return Renderer(component, [name, component] {
        return hbox({
                   text(name) | size(WIDTH, EQUAL, 8),
                   separator(),
                   component->Render() | xflex,
               }) | xflex;
    });
}

int main() {
    auto screen = ScreenInteractive::FitComponent();

    // -- Menu ------------------------------------
    const std::vector<std::string> menu_entries = {
        "Menu 1",
        "Menu 2",
        "Menu 3",
        "Menu 4",
    };
    int menu_selected = 0;
    auto menu = Menu(&menu_entries, &menu_selected);
    menu = Wrap("Menu", menu);

    // -- Toggle----------------------------------
    int toggle_selected = 0;
    std::vector<std::string> toggle_entries = {
        "Toggle_1",
        "Toggle_2",
    };
    auto toggle = Toggle(&toggle_entries, &toggle_selected);
    toggle = Wrap("Toggle", toggle);

    // -- Checkbox --------------------------------
    bool checkbox_1_selected = false;
    bool checkbox_2_selected = false;
    bool checkbox_3_selected = false;
    bool checkbox_4_selected = false;

    auto checkboxes = Container::Vertical({
        Checkbox("checkbox1", &checkbox_1_selected),
        Checkbox("checkbox2", &checkbox_2_selected),
        Checkbox("checkbox3", &checkbox_3_selected),
        Checkbox("checkbox4", &checkbox_4_selected),
    });
    checkboxes = Wrap("Checkbox", checkboxes);

    // -- Radiobox ------------------------------
    int radiobox_selected = 0;
    std::vector<std::string> radiobox_entries = {
        "Radiobox 1",
        "Radiobox 2",
        "Radiobox 3",
        "Radiobox 4",
    };
    auto radiobox = Radiobox(&radiobox_entries, &radiobox_selected);
    radiobox = Wrap("Radiobox", radiobox);

    // -- Input -----------------------------------
    std::string input_label;
    auto input = Input(&input_label, "placeholder");
    input = Wrap("Input", input);

    // -- Button ------------------------------
    std::string button_label = "Quit";
    std::function<void()> on_button_clicked_;
    auto button = Button(&button_label, screen.ExitLoopClosure());
    button = Wrap("Button", button);

    // -- Slider --------------------------------
    int slider_value_1 = 12;
    int slider_value_2 = 56;
    int slider_value_3 = 128;
    auto sliders = Container::Vertical({
        Slider("R:", &slider_value_1, 0, 256, 1),
        Slider("G:", &slider_value_2, 0, 256, 1),
        Slider("B:", &slider_value_3, 0, 256, 1),
    });
    sliders = Wrap("Slider", sliders);

    // A large text:
    auto lorel_ipsum = Renderer([] {
        return vbox({
            text("Lorem ipsum dolor sit amet, consectetur adipiscing elit. "),
            text("Sed do eiusmod tempor incididunt ut labore et dolore magna "
                 "aliqua. "),
            text("Ut enim ad minim veniam, quis nostrud exercitation ullamco "
                 "laboris nisi ut aliquip ex ea commodo consequat. "),
            text("Duis aute irure dolor in reprehenderit in voluptate velit esse "
                 "cillum dolore eu fugiat nulla pariatur. "),
            text("Excepteur sint occaecat cupidatat non proident, sunt in culpa "
                 "qui officia deserunt mollit anim id est laborum. "),

        });
    });
    lorel_ipsum = Wrap("Lorel Ipsum", lorel_ipsum);

    // -- Layout ------------------------
    auto layout = Container::Vertical({
        menu,
        toggle,
        checkboxes,
        radiobox,
        input,
        sliders,
        button,
        lorel_ipsum,
    });
    
    auto component = Renderer(layout, [&] {
        return vbox({
                   menu->Render(),
                   separator(),
                   toggle->Render(),
                   separator(),
                   checkboxes->Render(),
                   separator(),
                   radiobox->Render(),
                   separator(),
                   input->Render(),
                   separator(),
                   sliders->Render(),
                   separator(),
                   button->Render(),
                   separator(),
                   lorel_ipsum->Render(),
               }) | xflex | size(WIDTH, GREATER_THAN, 40) | border;
    });

    screen.Loop(component);

    return 0;
}
```
效果为：
![[Pasted image 20250909140933.png]]
可以使用鼠标选择拖动，也可使用键盘。
