# Liii STEM 与 Mogan 初见

两个 QML 重构 PR 的完整复盘：项目架构、实现设计、逐文件改动、踩坑记录。写给会 Qt Widgets、不会 QML、Scheme 初学者的自己。

## 这个项目是什么

Mogan STEM（商用名 Liii STEM）是 TeXmacs 的现代化重写。TeXmacs 是数学界老牌所见即所得排版编辑器，类似 Word 但面向科学文档。Mogan 保留了它的内核思想，用 C++ 重写并换上了 Qt 前端。

项目架构分三层：

- **C++ 内核**（`src/`）：排版引擎、编辑器、文件格式。自研容器 `string` / `tree` / `list`，不用 `std::`，所以代码里看不到 `std::string`。
- **Scheme 层**（`TeXmacs/progs/`）：TeXmacs 的灵魂。所有菜单、交互逻辑、偏好设置都用 Scheme 写。这就是为什么改一个菜单项不用重编译 C++，改 `.scm` 文件重启就能生效。
- **Qt 前端**（`src/Plugins/Qt/`）：主窗口、菜单、以及正在从 Qt Widgets 迁移到 QML 的各种弹窗。

这两个 PR 都属于同一类工作：**把旧式交互弹窗迁移成 QML 弹窗**。项目里已经有了一套成熟的 QML 弹窗底座（`QTMQmlDialog`、`DialogShell`、各种 Bridge），任务就是照着现有模式给两个具体功能写新的 QML 弹窗。

## 两个 PR 在说什么

### 任务一（编号 2084）：打印为文件

参考 PR [#4160](https://github.com/MoganLab/mogan/pull/4160)，对应 issue \#4142 。

旧行为：按 `C-F4` 或 `M-S-F4` 触发 `interactive print-to-file`，TeXmacs 的 interactive 机制会**先弹一个参数输入框**（让你输文件名、页码范围），**再弹一个系统保存框**——两段式，页面范围无校验，中文路径还会乱码。

新行为：一个 QML 对话框全搞定。对话框里有文件路径输入框（带 Browse 按钮调系统保存框）、PDF / PostScript 格式下拉、全部页面 / 页面范围切换（带范围校验 1..页数），点 Print 一次性提交。顺带修了两个 bug：非 ASCII 路径传递、打印失败仍提示完成。

### 任务二（编号 2085）：最近文档搜索

参考 PR [#4157](https://github.com/MoganLab/mogan/pull/4157)，对应 issue #4143。

旧行为：编辑菜单「Search recent documents」触发 `interactive docgrep-in-recent`，这是一个全文 grep 搜索，先弹输入框让你输关键词，再对最近文档做全文检索。问题：中文输入法确认候选字时会提前触发搜索；而且「全文搜索」语义和「从最近记录里挑一个打开」的需求不匹配。

新行为：一个 QML 列表对话框，列出最近 25 个文档（文件名 + 完整路径，去重），输入框实时模糊过滤（子序列匹配，文件名优先、路径兜底），上下键移动选择、Enter 或按钮打开，默认不选中避免误开。

### 关键前提：参考 PR 是「已关闭未合并」的

两个参考 PR 都不是被合并的成品，而是**往届笔试提交**。GitHub 上它们的关闭评论是「Closing this PR while the submission scope is revalidated」——公司把它们关了，重新发布为笔试题。所以：

- 编号直接用 PR 标题里的任务号：2084、2085
- 它们的分支本地有引用（`refs/remotes/pr4160`、`refs/remotes/pr4157`），可以直接 `git diff main...pr4160` 看参考实现
- main 分支在这两个 PR 之后又演进了很多（版本弹窗 bridge 重构、UpdaterProgress 弹窗、`run_qml_dialog` 加了参数），所以**不能直接 cherry-pick，要重新移植**

## 我是怎么理解并设计解决方案的

### 先读文档再读代码

项目 `ai-docs/qml/` 下有 QML 弹窗开发指南，`devel/` 下有每个任务的设计文档（如 `devel/2080.md` 是版本弹窗 QML 重构的完整记录）。先把这些读一遍，就能建立「这个项目写 QML 弹窗的标准姿势」：

1. 每个弹窗 = 一个 `.qml` 文件（用 `DialogShell` 当根）+ 一个 Bridge 类（`QObject` 子类，暴露数据给 QML、接收 QML 的动作）+ 一个 glue 入口（C++ 函数，在 `glue_qt.lua` 注册让 Scheme 能调）。
2. `.qml` 要登记进 `moganqml.qrc`（资源文件）和 `qml/qmldir`（模块目录）。
3. Scheme 侧写一个 interactive 入口，菜单或快捷键绑到它。

### 摸清 QML 弹窗底座

读 `QTMQmlDialog.cpp` 理解了核心机制：

- `run_qml_dialog`：阻塞式模态引擎，`QDialog::exec()`。拼一个无边框透明 QDialog + 内嵌 QQuickWidget，先注入 context property，再 `setSource` 加载 QML，检查加载状态，锁定尺寸，处理焦点和 Esc，最后 exec。一次性提交型的弹窗（确认框、表单）用它。
- `run_modal_qml_dialog`：非阻塞模态（`setModal(true) + show()`），用于需要 live 重绘文档的弹窗（字体选择器）。
- `inject_common_context`：注入所有弹窗共用的 context property——`closeBridge`（取消 / 提交 / 拖动）、`dpScale`（DPI 缩放）、`isDark`（深色模式）。
- Bridge 模式：每个弹窗一个独立 `QObject` 子类，通过 `Q_PROPERTY` 暴露只读数据、`Q_INVOKABLE` 暴露可调用方法，注入为 context property 后 QML 直接访问。

### 设计：任务分配与顺序

两个任务各自独立分支、独立 PR。我先做 2085（最近文档搜索）再做 2084（打印为文件），理由：

- 2085 更小（约 370 行新代码 vs 364 行 + 复杂 scheme 分发），先打通「建分支 → 写 bridge + QML → 写 glue + scheme → 写测试 → 构建 → 验收」全流程。
- 两个任务都碰 `QTMQmlDialog.cpp`、`glue_qt.lua`、测试文件，分在两个分支各自独立提交，避免互相污染。
- 每个任务切成 4 个 commit，按项目规范第一个 commit 是 devel 任务文档，方便回溯。

### 设计：测试策略

项目有三类测试（`CLAUDE.md` 有详细说明），我为每个任务各设计了三层：

- **QML 加载测试**（`qml_load_test.cpp`）：写 stub bridge 桩，`setSource` 加载真实 QML，断言 `status() == Ready` 和关键属性默认值。抓 import 缺失、语法错、context property 误用。
- **glue 钩子测试**（`qml_dialog_test.cpp`）：每个 glue 入口都支持环境变量钩子（`MOGAN_TEST_XXX=ok|cancel`），命中时不弹窗直接返回预设值。用 `EnvHook` RAII 类设置环境变量测返回值契约。
- **Scheme 纯逻辑测试**（`print-widgets-test.scm`，仅 2084）：headless 跑，测结果解析和分发逻辑，秒级反馈。

### 验收

每个分支：`xmake b stem` 构建 → `qml_load_test` + `qml_dialog_test`（offscreen）→ 2084 加 `print-widgets-test` → headless 诊断脚本验证 glue 注册和编码 → `git diff --cached --check` 确认无行尾噪声 → 推送 fork。

## 任务二：2085 最近文档搜索逐文件详解

### 数据流全景

```
编辑菜单 → open-search-recent-documents (Scheme, docgrep.scm)
    → cpp-search-recent-documents-dialog (C++ glue, 经 glue_qt.lua 注册)
        → run_qml_dialog 加载 SearchRecentDocuments.qml
            → RecentDocumentsSearchBridge 构造时 eval_scheme 拉最近文档列表
            → QML 本地 fuzzyScore 过滤 + 键盘选择
            → 用户点打开 → bridge.open(path) → done(Accepted)
    → 返回选中的路径 (UTF-8)
→ Scheme 侧 load-document 打开文件
```

### `src/Plugins/Qt/RecentDocumentsSearchBridge.hpp`（新增）

一个 `QObject` 子类，这是「数据 bridge」的标准写法：

```cpp
class RecentDocumentsSearchBridge : public QObject {
  Q_OBJECT
  Q_PROPERTY (QVariantList documents READ documents CONSTANT)
  Q_PROPERTY (QString title READ title CONSTANT)
  Q_PROPERTY (QString placeholder READ placeholder CONSTANT)
  Q_PROPERTY (QString emptyText READ emptyText CONSTANT)

public:
  explicit RecentDocumentsSearchBridge (QDialog* host);
  const QVariantList& documents () const { return m_documents; }
  Q_INVOKABLE void open (const QString& path);
  ...
};
```

设计要点：

- `Q_PROPERTY` 是 Qt 元对象系统把 C++ 成员暴露给 QML 的机制。`READ documents CONSTANT` 表示只读、值不变，QML 里 `recentSearchBridge.documents` 就能拿到。
- `documents` 是候选模型，构造时一次性算好，筛选放 QML 本地做（避免搜索过程改写 Scheme 记录）。
- `open(path)` 是 `Q_INVOKABLE`（QML 可调），记录用户显式选中的路径并结束模态。
- bridge 不挂 parent、不接管宿主生命期——调用方在 exec 返回后 delete。这是项目里所有 bridge 的约定。

### `src/Plugins/Qt/RecentDocumentsSearchBridge.cpp`（新增）

核心是 `recent_documents()` 静态函数：

```cpp
QVariantList
RecentDocumentsSearchBridge::recent_documents () {
  QVariantList  documents;
  QSet<QString> seenPaths;
  tmscm         recentPaths= eval_scheme ("(recent-documents-for-qml)");
  for (tmscm cur= recentPaths; !tmscm_is_null (cur); cur= tmscm_cdr (cur)) {
    tmscm item= tmscm_car (cur);
    if (!tmscm_is_string (item)) continue;
    QString path= QString::fromUtf8 (as_charp (tmscm_to_string (item)));
    ...
    QString normalizedPath= QDir::cleanPath (QDir::fromNativeSeparators (path));
    if (seenPaths.contains (normalizedPath)) continue;
    seenPaths.insert (normalizedPath);
    QVariantMap document;
    document["path"]= path;
    document["name"]= QFileInfo (path).fileName ();
    documents << document;
  }
  return documents;
}
```

要理解的点：

- `eval_scheme("(recent-documents-for-qml)")` 是在 C++ 里调用 Scheme 函数。返回的是 `tmscm`（mogan 的 scheme 类型），用 `tmscm_car` / `tmscm_cdr` / `tmscm_is_null` 遍历列表，`tmscm_to_string` 转成 mogan string，`as_charp` 再转成 C `char*`。
- `QString::fromUtf8` 而非 Cork 转换——这是整个任务的关键编码决策，见后文「踩坑」第 8 条。
- `QDir::cleanPath` 规范化路径做去重，Windows 下再 `toCaseFolded` 大小写折叠。去重用 `QSet<QString>`，保持首次出现。

### `src/Plugins/Qt/qml/SearchRecentDocuments.qml`（新增）

228 行的 QML。结构：根是 `DialogShell`，`content` 里放标题 Text + 搜索输入框 + 结果 ListView + DialogButtons。

关键函数 `fuzzyScore`：

```qml
function fuzzyScore(text, query) {
    var haystack = text.toLocaleLowerCase()
    var needle = query.toLocaleLowerCase()
    var cursor = 0
    var score = 0
    for (var i = 0; i < needle.length; ++i) {
        var index = haystack.indexOf(needle.charAt(i), cursor)
        if (index < 0)
            return -1
        score += index - cursor
        cursor = index + 1
    }
    return score
}
```

这是子序列匹配打分：逐个字符在目标串里找，每个字符跳过越多分越高，匹配得越「散」分越高。`updateMatches` 先按文件名匹配，文件名不中再按完整路径匹配，最后按 score 排序。排序是稳定的（`score` 相同时按 `order`），避免结果跳来跳去。

选择状态留在 QML 本地：`matches`、`selectedIndex` 都是 QML property，搜索不改 bridge 数据。`onActivate`（Enter）和按钮都调 `openSelection()`，只有 `selectedIndex >= 0`（用户显式选过）才调 `bridge.open()`——这就是「默认不选中」的实现。

### `src/Plugins/Qt/moganqml.qrc` + `qml/qmldir`（各 +1 行）

`.qrc` 是 Qt 资源文件，把 QML 编进二进制，运行时用 `qrc:/qml/SearchRecentDocuments.qml` 路径访问。`qmldir` 是 QML 模块目录声明文件。两个都要登记，缺一个加载就失败。

### `src/Plugins/Qt/QTMQmlDialog.cpp` + `.hpp`（glue 入口）

```cpp
string
cpp_search_recent_documents_dialog () {
  string preset= get_env ("MOGAN_TEST_SEARCH_RECENT_DOCUMENTS");
  if (preset != "") return preset == "cancel" ? string ("") : preset;

  array<string> buttons= {string ("Open"), string ("Cancel")};
  QmlDialogBridge* closeBridge= nullptr;
  RecentDocumentsSearchBridge* searchBridge= nullptr;
  run_qml_dialog (
      "qrc:/qml/SearchRecentDocuments.qml", "SearchRecentDocuments.qml",
      [&] (QQuickWidget* qw, QDialog& host) {
        closeBridge= inject_common_context (qw, host);
        searchBridge= new RecentDocumentsSearchBridge (&host);
        qw->rootContext ()->setContextProperty ("recentSearchBridge",
                                                searchBridge);
        qw->rootContext ()->setContextProperty ("dialogButtons",
                                                translate_buttons (buttons));
      },
      520, 450);
  QString path;
  if (searchBridge) path= searchBridge->selectedPath ();
  delete closeBridge;
  delete searchBridge;
  return from_qstring_utf8 (path);
}
```

这是所有一次性提交型弹窗 glue 的标准模板：

1. 环境变量钩子短路（测试用）。
2. `run_qml_dialog` 的第 2 个参数是 lambda，在 `setSource` 前注入 context property。先 `inject_common_context` 注入共用的 `closeBridge` / `dpScale` / `isDark`，再注入本弹窗特有的 `recentSearchBridge` 和 `dialogButtons`。
3. exec 返回后从 bridge 取结果，delete 两个 bridge，返回 UTF-8 字符串。

两个 bridge 分工清晰：`closeBridge`（通用 `QmlDialogBridge`）管取消 / Esc / 拖动，`searchBridge`（专用）管数据和确认。这是项目里「通用外壳行为 vs 领域数据」的分离约定。

### `src/Scheme/L5/glue_qt.lua`（+1 条目）

```lua
{
    scm_name = "cpp-search-recent-documents-dialog",
    cpp_name = "cpp_search_recent_documents_dialog",
    ret_type = "string",
    arg_list = {}
},
```

这就是 glue 注册。mogan 的 glue 是**构建期代码生成**：`xmake/rules/glue.lua` 规则扫描这些 lua 声明，生成 `glue_qt.cpp`，里面用 `tmscm_install_procedure("cpp-search-recent-documents-dialog", ...)` 把 C++ 函数注册成 Scheme 可调用的过程。改 lua 后重新构建就会重新生成。**不要再手动改 `TeXmacs/progs/prog/glue-symbols.scm`**（那是自动生成的补全索引，参考 PR 4160 加了一行是多余的）。

### `TeXmacs/progs/doc/docgrep.scm`（+2 函数）

```scheme
(tm-define (recent-documents-for-qml)
  (map url->system (recent-file-list 25)))

(tm-define (open-search-recent-documents)
  (:interactive #t)
  (let ((path (cpp-search-recent-documents-dialog)))
    (when (not (string=? path ""))
      (load-document (system->url path)))))
```

Scheme 侧的关键概念：

- `tm-define` 是 mogan 定义全局函数的方式（等价于 TeXmacs 的 `define` 增强版，能加交互元数据）。
- `(:interactive #t)` 把这个函数标记为可交互命令，菜单 / 快捷键才能绑到它。
- `recent-file-list 25` 是已有的函数，返回最近 25 个文档的 url 列表；`url->system` 把 url 转成系统路径字符串（UTF-8）。
- `open-search-recent-documents` 调 glue（C++ 弹窗），拿到路径后 `load-document` 打开。`system->url` 是 `url->system` 的反向转换。

### `TeXmacs/progs/texmacs/menus/edit-menu.scm`（1 行改）

```scheme
("Search recent documents" (open-search-recent-documents))
```

原来的 `(interactive docgrep-in-recent)` 换成新的入口。菜单项是 Scheme 数据，`->` 和字符串嵌套表达菜单结构。

### 测试改动

`qml_load_test.cpp` 加 `RecentDocumentsSearchStubBridge`（只读模型 + `open` 桩）和 `test_search_recent_documents_loads`（加载 QML，断言 Ready、`selectedIndex == -1`、按钮标签形状）。`qml_dialog_test.cpp` 加 `test_search_recent_documents_hook`（`MOGAN_TEST_SEARCH_RECENT_DOCUMENTS` 设为中文路径 / cancel 两个断言）。

## 任务一：2084 打印为文件逐文件详解

### 数据流全景

```
C-F4 / M-S-F4 (init-emacs.scm)
    → open-print-to-file / open-page-selection-to-file (Scheme, tm-print.scm)
        → cpp-print-to-file-dialog(filename, page_count, page_range) (C++ glue)
            → run_qml_dialog 加载 PrintToFile.qml
                → printBridge.chooseSaveFile 调系统保存框 (Browse 时)
                → 用户点 Print → closeBridge.submit({file,format,range,first,last})
            → 返回 tuple 树
    → dispatch-print-to-file-result 解析
        → print-to-file / print-pages-to-file (system->url 转换后)
            → edit_main_rep::print_to_file → print_doc
```

### `src/Plugins/Qt/PrintToFileBridge.hpp` + `.cpp`（新增）

这个 bridge 只有一个方法：

```cpp
QString
PrintToFileBridge::chooseSaveFile (const QString& currentFileName,
                                   const QString& format,
                                   const QString& title) {
  const QString filter=
      format == "pdf" ? "PDF files (*.pdf)" : "PostScript files (*.ps)";
  const QString selected=
      QFileDialog::getSaveFileName (m_host, title, currentFileName, filter);
  if (m_host) {
    m_host->raise ();
    m_host->activateWindow ();
  }
  return selected;
}
```

为什么这个 bridge 独立于通用 `QmlDialogBridge`？因为原生文件选择是打印领域特有的交互，塞进通用 bridge 会让所有弹窗都拿到无关 API（参考 PR 4160 就是这么干的，我改成了独立类）。这是「关注点分离」。

`QFileDialog::getSaveFileName` 是 Qt Widgets 的原生保存框（静态方法，模态）。返回后 `raise()` + `activateWindow()` 重新激活宿主窗口——这是踩坑教训：原生对话框关闭后 QML 模态窗可能落到主窗口后面，需要显式拉回来。

### `src/Plugins/Qt/qml/PrintToFile.qml`（新增，280 行）

结构比搜索框复杂：文件输入行（TextInput + Browse 按钮）、格式下拉（`EnumCombo`）、页面模式（`TabBar` all/range）、范围输入行（两个 `IntValidator` 输入框，range 模式才显示）、错误提示、DialogButtons。

两个关键函数：

```qml
function fileWithExtension(path, extension) {
    var separator = Math.max(path.lastIndexOf("/"), path.lastIndexOf("\\"));
    var dot = path.lastIndexOf(".");
    return dot > separator ? path.slice(0, dot + 1) + extension : path + "." + extension;
}

function submit() {
    var first = Number(firstPage);
    var last = Number(lastPage);
    if (fileName.trim().length === 0) {
        errorText = fileText;
        return;
    }
    if (range === "range" && (Math.floor(first) !== first || Math.floor(last) !== last
        || first < 1 || last < first || last > pageCount)) {
        errorText = pageRangeText;
        return;
    }
    closeBridge.submit({...});
}
```

- `fileWithExtension` 处理扩展名：切格式时把 `.ps` 换成 `.pdf`，或补上。`lastIndexOf(".") > separator` 判断点号在文件名里还是在目录里。
- `submit` 做校验：空文件名、范围非法（非整数、<1、last < first、超页数）都阻止提交，`errorText` 显示错误（直接显示字段名，简洁）。校验不过就不调 `closeBridge.submit`，模态不结束。
- `onCancel` 里有个 `if (!root.browsing)` 守卫：Browse 打开原生保存框期间按 Esc 不关闭 QML 弹窗（只关原生框）。

### `QTMQmlDialog.cpp` + `.hpp`（glue 入口）

`cpp_print_to_file_dialog(string filename, int page_count, bool page_range)` 比搜索框 glue 复杂，因为要注入更多东西：

```cpp
QVariantMap defaults;
defaults["file"]  = to_qstring (filename);
defaults["format"]= "postscript";
defaults["range"] = page_range ? "range" : "all";
defaults["first"] = "1";
defaults["last"]  = QString::number (std::max (1, page_count));
...
run_qml_dialog (
    "qrc:/qml/PrintToFile.qml", "PrintToFile.qml",
    [&] (QQuickWidget* qw, QDialog& host) {
      bridge= inject_common_context (qw, host);
      PrintToFileBridge* printBridge= new PrintToFileBridge (&host);
      qw->rootContext ()->setContextProperty ("printBridge", printBridge);
      QObject::connect (&host, &QDialog::destroyed, printBridge,
                        &QObject::deleteLater);
      qw->rootContext ()->setContextProperty ("printDefaults", defaults);
      qw->rootContext ()->setContextProperty ("printTitle", qt_translate ("Print to file"));
      ... 十来个标签 ...
      qw->rootContext ()->setContextProperty ("dialogButtons", translate_buttons (buttons));
    },
    500, 430);
```

结果回流的关键是 `file` 字段用 `from_qstring_utf8`、其余用 `from_qstring`：

```cpp
const string value= it.key () == "file"
                        ? from_qstring_utf8 (it.value ().toString ())
                        : from_qstring (it.value ().toString ());
```

`from_qstring` 会把内容转成 Cork 编码（mogan 内部文本编码），但文件路径是 UTF-8 系统路径，走 Cork 会破坏中文——所以 file 字段单独走 UTF-8 通道。这是两个 bug 修复之一。

### `TeXmacs/progs/texmacs/texmacs/tm-print.scm`（+4 函数）

```scheme
(define (print-to-file-dialog-value values key fallback)
  (let loop ((remaining values))
    (if (null? remaining)
      fallback
      (let* ((entry (car remaining))
             (pair (if (and (pair? entry) (eq? (car entry) 'tuple))
                       (cdr entry) entry)))
        (if (and (pair? pair) (pair? (cdr pair)) (string=? (car pair) key))
          (cadr pair)
          (loop (cdr remaining)))))))

(define (dispatch-print-to-file-result result page-count print-all print-range)
  (let* ((values (cdr (tree->stree result)))
         (name  (print-to-file-dialog-value values "file" ""))
         (range (print-to-file-dialog-value values "range" "all"))
         (first (print-to-file-dialog-value values "first" "1"))
         (last  (print-to-file-dialog-value values "last" (number->string page-count))))
    (when (not (string=? name ""))
      (if (string=? range "range")
          (print-range name first last)
          (print-all name)))))
```

Scheme 初学者要理解的点：

- `let loop` 是 Scheme 的命名 let，本质是递归。这里用来遍历列表查 key，找不到返回 fallback。
- `print-to-file-dialog-value` 做的是「按 key 查值」。为什么不用 `assoc`？因为 C++ 返回的 `QVariantMap` 转成 tuple 后，键值顺序不确定，必须逐项比较 key 而不是靠位置。且要兼容两种形状（`(tuple "file" "x")` 和 `("file" "x")`）。
- `tree->stree` 把 C++ 的 mogan tree 转成 scheme 列表，`cdr` 去掉外层 tuple 标记。
- `dispatch-print-to-file-result` 是高阶函数：`print-all` 和 `print-range` 是两个 lambda，由调用方传入，实现「同一解析、不同动作」的分发。

```scheme
(define (open-print-to-file* page-range?)
  (let ((page-count (get-page-count)))
    (dispatch-print-to-file-result
      (cpp-print-to-file-dialog (propose-postscript-name) page-count page-range?)
      page-count
      (lambda (name) (print-to-file (system->url name)))
      (lambda (name first last) (print-pages-to-file (system->url name) first last)))))

(tm-define (open-print-to-file) (:interactive #t) (open-print-to-file* #f))
(tm-define (open-page-selection-to-file) (:interactive #t) (open-print-to-file* #t))
```

`open-print-to-file*` 是私有辅助，两个 `tm-define` 是公开入口，用 `#f` / `#t` 区分默认「全部页面」还是「页面范围」——对应 C-F4 和 M-S-F4 两个快捷键。

### `TeXmacs/plugins/emacs/progs/init-emacs.scm`（2 行改）

```scheme
("C-F4" (open-print-to-file))
("M-S-F4" (open-page-selection-to-file))
```

这里有个「奇怪的地方」：参考 PR 说改 `generic-kbd.scm`，但当前 main 上 `C-F4` / `M-S-F4` 的唯一定义在 **emacs 仿真插件** 里，`generic-kbd.scm` 根本没有这两个键。这是 main 演进导致参考 PR 描述过时，我在实现时用 `git grep -rn "C-F4"` 找到了真实位置。

### `src/Edit/Editor/edit_main.cpp`（1 处改）

```cpp
void
edit_main_rep::print_to_file (url name, string first, string last) {
  print_doc (name, false, as_int (first), as_int (last));
  if (exists (name)) set_message ("Done printing", "print to file");
  else set_message ("Failed to write output file", "print to file");
}
```

这是 bug 修复之二：原来无条件提示「Done printing」，即使写文件失败。现在用 `exists(name)` 检查输出文件是否真的生成。注意参考 PR 的 diff 是加在 `print_doc` 里，但 main 上 `set_message` 已经移到 `print_to_file` 了（`print_doc` 也被普通打印共用，不能在它里面写「print to file」的提示），所以位置要跟着 main 的实际结构走。

### 测试改动

- `qml_load_test.cpp`：`PrintToFileStubBridge` + `test_print_to_file_loads`（断言 Ready、`fileName` 默认值、`pageCount`、`range`、按钮标签）。
- `qml_dialog_test.cpp`：`test_print_to_file_dialog_hook`（`MOGAN_TEST_PRINT_TO_FILE=ok` 返回 5 字段 tuple，逐 key 查找验证；cancel 返回空 tuple）。
- `print-widgets-test.scm`：`test-print-to-file-dialog-value`（查值 + fallback）和 `test-print-to-file-dispatch`（all 分发到 `("all" name)`、range 分发到 `("range" name first last)`）。

## 踩坑记录（错误与奇怪的地方）

这些是我实际遇到的、花时间定位的问题，按重要性排序。

### 0. `git revert --no-commit` 会把无关的工作区改动带进提交

**现象**：回退菜单接线时用 `git revert --no-commit a9df63d87 && git commit`，结果提交里混进了 `3rdparty/curl/CMakeLists.txt`——那是本地未提交的构建修复，根本不属于这次回退。

**原因**：`--no-commit` 把 revert 结果合进**工作区和暂存区**，此时暂存区里已有的其他改动（curl 的 dl）会被一起 commit。

**处理**：`git reset --soft HEAD~1` 撤销提交（保留暂存），`git restore --staged <curl路径>` 把无关文件退出暂存区，重新 commit。最终提交只含 2 个目标文件。

**教训**：`revert --no-commit` / `cherry-pick --no-commit` 这类「先合并后提交」的操作，动手前先看 `git status`，提交前必须 `git diff --cached --stat` 核对文件清单。

### 0.5 PR 题目可能隐藏在后续评论里：菜单入口接线的教训

**现象**：我按参考 PR 范围只重绑了快捷键，后来用户实测发现菜单没变化；补接菜单后，用户又从 PR 题目原文里发现补充要求：「保留打印为文件菜单入口原有的直接系统保存位置选择，不再弹出 QML 设置窗口」——菜单必须保留旧交互，QML 只上快捷键。

**处理**：`git revert` 掉菜单接线提交（不用 reset+force push，历史保留「接线→按题目回退」轨迹）。

**教训**：做笔试题时把 PR/issue 的**全部评论**读完再动手；题目对「哪些入口要改、哪些保留」的边界描述可能藏在正文细节里。我最初问用户「菜单要不要接」时给的建议方向就错了。

### 1. 工作区 7638 个文件全是 CRLF 行尾噪声

**现象**：`git status` 显示几千个文件被修改，`git diff` 每个文件都是全量增删。

**原因**：仓库在 Windows 上 checkout 过，工作区文件是 CRLF 行尾，而 git 索引里是 LF。`git diff --ignore-cr-at-eol` 显示零差异，证明只是行尾差异、无实质内容变化。

**发现**：一开始 `git status` 就看到了，但没有贸然处理。用 `git ls-files --eol` 和 `file` 命令确认了 `i/lf w/crlf`（索引 LF、工作区 CRLF）。

**教训**：**绝不能 `git add -A` 或 `git add .`**，会把整个仓库的行尾噪声全提交进去。每次都只 `git add` 明确列出路径，提交前 `git diff --cached --check` 验证。

### 2. clang-format 把 CRLF 翻转成 LF 导致全文件 diff

**现象**：对 `QTMQmlDialog.cpp` 跑 `clang-format -i` 后，diff 显示 1600 行增删（本来只应改几十行）。

**原因**：`clang-format -i` 重写文件时把 CRLF 统一成了 LF，导致整文件 diff。

**发现与处理**：`git diff --stat` 看到 1600 行就知道不对了。用 `git restore` 恢复，然后 `perl -i -pe 's/\r\n/\n/'` 先把文件转成 LF（与索引一致），再重新做小范围编辑。新文件直接用 Write 写（本身就是 LF）。

**教训**：在行尾混乱的仓库里，先 `perl` 规范化目标文件为 LF，再编辑和格式化，diff 才干净。

### 3. xmake Qt 包是空壳，配置期报 concat 错误

**现象**：`xmake b stem` 报 `invalid value (nil) at index 2 in table for 'concat'`，回溯指向 `xmake/targets/qwkcore.lua:53` 的 `path.join(qt_package, "include")`。

**原因**：`~/.xmake/packages/q/qt6base/6.8.3/` 目录只有 12K 的 manifest，**SDK 本体没下载**。`get_config("qt")` 拿不到 Qt 路径，`path.join` 收到 nil 就崩。

**发现**：用 `xmake require -y -vD "qt6widgets 6.8.3"` 抓详细回溯，再 `du -sh` 看包目录只有 12K 确认是空壳。

**处理**：`rm -rf ~/.xmake/packages/q/qt6base ~/.xmake/packages/q/qt6widgets` 删掉空壳，重新 `xmake f -c --yes` 触发完整下载（1.6G）。

**教训**：xmake 配置期的诡异 concat/nil 错误，先怀疑依赖包缓存损坏，查 `~/.xmake/packages/` 对应包的体积是否正常。

### 4. 首次构建「成功」是管道假象

**现象**：后台跑 `xmake b -y stem 2>&1 | tail -30` 显示 `exited with code 0`，但实际构建失败。

**原因**：`2>&1 | tail` 的退出码是 `tail` 的退出码（0），不是 `xmake` 的。`build/` 目录其实是空的。

**发现**：检查 `build/linux/x86_64/` 目录为空，意识到构建根本没成功。

**教训**：管道命令的退出码是最后一段的，要判断构建是否成功必须看输出内容或 `build/` 产物，不能信管道退出码。

### 5. `git add` 用 autocrlf=input 时 qrc/qmldir 报 trailing whitespace

**现象**：第一次尝试用 `git -c core.autocrlf=input add` 提交 qrc/qmldir，`git diff --cached --check` 报一堆 trailing whitespace。

**原因**：`core.autocrlf=input` 是「提交时 CRLF→LF、检出时不变」，但 qrc/qmldir 工作区本来就是 CRLF，转换后索引里却仍带了 CR。

**处理**：改用 Write 工具把这两个小文件整体重写为 LF（内容里去掉 CR），再普通 `git add`，diff 干净。

**教训**：小文件（qrc、qmldir、.scm）直接 Write 重写为 LF 最省事，别折腾 autocrlf 配置。

### 6. 参考 PR 说改 generic-kbd.scm，但实际绑定在 emacs 插件

**现象**：按参考 PR 4160 的 diff 去 `TeXmacs/progs/generic/generic-kbd.scm` 找 `C-F4` 绑定，`grep` 无结果。

**发现**：`git grep -rn "C-F4"` 全仓库搜，唯一命中在 `TeXmacs/plugins/emacs/progs/init-emacs.scm`。

**教训**：参考 PR 基于旧 main，文件结构已变。改动前必须 `git grep` 定位当前 main 上符号的真实位置，不能照搬参考 diff 的路径。

### 7. scheme 测试报 unbound variable，因为没加载被依赖模块

**现象**：`xmake r print-widgets-test` 报 `unbound variable print-to-file-dialog-value`。

**原因**：测试文件只 `load` 了 `print-widgets.scm`，而我的新函数在 `tm-print.scm` 里，没被加载。

**处理**：测试文件头部补一行 `(load "./TeXmacs/progs/texmacs/texmacs/tm-print.scm")`，amend 进提交。

**教训**：scheme 测试是独立脚本环境，依赖的模块必须显式 `load`，不像主程序启动时会加载全套。

### 8. 编码决策：路径走 UTF-8 还是 Cork

**现象**：这是设计决策而非 bug。参考 PR 4157 用 `QString::fromUtf8(as_charp(tmscm_to_string(item)))` 直接按 UTF-8 读路径，而项目里其他 bridge（如 PreferencesBridge）用 `cork_to_utf8` 转 Cork。

**分析**：mogan 内部 `string` 对文本内容是 Cork 编码（TeXmacs 老式编码），但**系统路径**经 `url->system` 输出的是 UTF-8。如果对路径再走 `cork_to_utf8`，会把 UTF-8 字节误当成 Cork 解码，中文文件名就乱码。

**验证**：写 headless 诊断脚本 `(display (url->system "/tmp/测试文档/报告最终版.tm"))`，确认输出的是正确 UTF-8；再 `(display (recent-documents-for-qml))` 看到真实中文路径（`中国科学技术大学…tmu`）无乱码，证明 UTF-8 通道正确。

**教训**：编码问题的本质是「这串字节当前处于什么编码」。mogan 里文本内容 = Cork、系统路径 = UTF-8，两者不能混用。遇到路径类数据优先怀疑 Cork/UTF-8 混用。

### 9. clangd 诊断是噪声，别被误导

**现象**：写新 bridge 文件时 clangd 报一堆 `QDialog file not found`、`Unknown type name 'Q_OBJECT'`。

**原因**：clangd 没有 xmake 生成的 compile_commands 索引，找不到 Qt 头文件路径。这不是代码错误。

**处理**：忽略 clangd 诊断，以 `xmake b` 的真实编译为准（最终构建通过）。

**教训**：在没有正确 compile_commands 的项目里，clangd 报错只是索引缺失，编译器和构建系统才是真相。

### 10. gh 未安装、HTTPS 推送 TLS 断连

**现象**：`gh` 命令不存在；`git push` 走 HTTPS 报 `GnuTLS recv error (-110)`。

**处理**：推送改走 SSH（`git push git@github.com:Sickwag/mogan.git ...`），成功。PR 创建由用户在网页操作。

**教训**：fork 推送用 SSH URL 更稳，尤其网络经过代理时 HTTPS 容易 TLS 断连。

## 学习路径建议（针对笔试题）

1. **先读懂 glue 机制**：`glue_qt.lua` → `xmake/rules/glue.lua` → 生成的 `glue_qt.cpp`，理解「改 lua 重新构建生成 C++ 绑定」这条链。这是所有 QML 弹窗任务的第一步。
2. **背下 QML 弹窗标准姿势**：`Q_PROPERTY`（数据）+ `Q_INVOKABLE`（动作）+ `DialogShell` + context property 注入 + qrc/qmldir 登记 + glue 注册 + scheme interactive 入口。这 7 步是固定套路。
3. **理解三类测试的分工**：加载测试抓 QML 语法/绑定错误、hook 测试抓 glue 返回值契约、scheme 纯逻辑测试抓数据解析逻辑。笔试题大概率要求补测试，知道往哪加很关键。
4. **熟悉行尾和编码两个坑**：行尾噪声（提交前 `git diff --cached --check`）、Cork vs UTF-8（文本内容 Cork、路径 UTF-8）。这两个是面试官爱问的「你踩过什么坑」好素材。
5. **Scheme 最小必要语法**：`tm-define`、`(:interactive #t)`、`let` / `let*` / 命名 let 递归、`when` / `if`、`car` / `cdr` / `null?` / `pair?`、`map`、`string=?`、`system->url` / `url->system`。不需要学全，够读懂菜单和分发逻辑即可。

## 正式提交的 PR
[PR #4457：2084 文件 → 打印 → 选择打印为文件采用 QML 重构](https://github.com/MoganLab/mogan/pull/4457)
[PR #4456：2085 QML 重构最近打开文档搜索](https://github.com/MoganLab/mogan/pull/4456)

## 附：两个 PR 的提交序列

2085（分支 `sickwag/2085/qml-recent-documents-search`）：

1. `[2085] 新增 devel/2085.md 任务文档`
2. `[2085] 最近文档搜索 bridge 与 QML 对话框`
3. `[2085] 最近文档搜索 glue 入口与 scheme 菜单接线`
4. `[2085] 最近文档搜索测试与设计稿`

2084（分支 `sickwag/2084/qml-print-to-file`）：

1. `[2084] 新增 devel/2084.md 任务文档`
2. `[2084] 打印为文件 bridge 与 QML 对话框`
3. `[2084] 打印为文件 glue 入口与 scheme 分发`
4. `[2084] 打印为文件测试与设计稿`
