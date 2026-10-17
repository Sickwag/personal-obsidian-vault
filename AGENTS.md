# Repository Guidelines
本仓库是个人 Obsidian 知识库。本指南帮助 AI 快速判断应该读哪些笔记、如何安全编辑，以及哪些目录属于 Obsidian 配置或插件数据。知识库会持续变化；文件地图是本次盘点快照，实际路径、笔记正文和索引结果始终优先。
## 必读入口与工作原则
- `Context.md` 记录用户背景、当前学习主线和 AI 协作约定。学习规划、复习、FSRS 或跨笔记整理任务开始前先读它；当前目标可能变化，不要把本指南中的主题示例当作最新进度。
- `Style.md` 是笔记内容与 AI 写入格式的唯一权威。新增或修改知识笔记前完整阅读相关规则；与模型默认格式冲突时按 `Style.md` 执行。
- 用户已有笔记是个人知识记录。编辑前完整读取目标文件及其紧邻引用；默认只追加或做有依据的局部修正，保留原作者段落、措辞和结构，不为统一格式整篇重写。
- 这是知识库，不是应用源码仓库；没有全库构建或测试套件。不要为了“整理”而批量格式化、重命名或移动笔记。
- 新知识先定位已有主题并查重，再决定追加到现有笔记或新建单主题笔记。只读本轮相关文件，不需要遍历整库。
## 推荐的 AI 工作流程
1. 明确任务属于新知识学习、已有笔记编辑、求职材料、日常记录还是 Obsidian/插件配置。
2. 涉及当前学习目标或复习工作流时先读 `Context.md`；按下方主题入口和文件地图选出候选笔记。
3. 从问题中提炼 2–3 个关键词，分别使用 notes-index 的 `lookup` 搜索；需要模式匹配时使用 `--regex`（Python 正则，不区分大小写）。打开命中笔记核对语义，再用 `rg` 搜索正文中的术语或 wikilink 补齐关联文件。索引候选不等于内容已核实。
4. 写入前完整读取目标笔记。优先沿用原章节、术语、目录和链接；重复内容并入已有笔记，复杂主题才拆成新笔记并建立 `[[wikilink]]`。
5. 写入后检查标题层级、链接、附件引用和局部 diff。需要索引校验时运行单文件 `check`；不要自行运行会写库的全量索引更新。
6. 对外部资料或时效性结论标明来源与版本；不确定的推断标成“待验证”，不要把笔记最后修改时间当作掌握或验证证据。
## 主题检索路线
以下是高关联入口，不是完整依赖图。打开目标笔记后继续沿其 wikilink、标题和参考来源追踪。

| 主题或任务 | 建议先读 | 常见关联 |
| --- | --- | --- |
| C++ 语言、模板、对象与生命周期 | `Learn/Language/C C++/模板元编程.md`、`Learn/Bases/Paradigm/C++开发范式和术语.md`、`Learn/Books/Modern C++.md` | `Learn/Books/Effective C++（侯捷）.md`、`Learn/Books/现代C++语言核心特性解析.md`、`Learn/Books/深度探索C++对象模型阅读指南.md` |
| 并发、线程安全、协程与网络服务 | `Learn/Bases/Paradigm/IO复用模型.md`、`Learn/Books/C++并发编程实战（第二版）.md`、`Learn/ProjectsStudy/FromRemote/Tencent Libco.md` | `Learn/ProjectsStudy/FromRemote/FiberLib.md`、`Learn/ProjectsStudy/FromDocs/Sylar Backend Collection.md`、`Learn/ProjectsStudy/WriteByMyself/CPP网络编程实战.md`、`Chores/JobInterviews/简历项目.md` |
| TCP/IP、socket、select/poll/epoll | `Learn/Bases/Paradigm/IO复用模型.md`、`Learn/Bases/Network/小林Coding 计算机网络.md` | `Learn/Bases/Network/王道考研计算机网络.md`、`Learn/Books/Linux高性能服务器编程.md`、`Learn/ProjectsStudy/FromRemote/WebServer-Chat.md` |
| OpenGL、图形学与三维可视化 | `Learn/Language/C C++/OpenGL.md` | `Context.md` 含当前主线与已学范围。当前未发现独立的 VTK/ITK 笔记；涉及这两者时先核对 Context 和用户提供的资料，再确定是否新建笔记。`Learn/Language/C C++/OpenGL.RewriteBackup.md` 是备份文件，默认以 `OpenGL.md` 为当前入口。 |
| 数据结构、算法与刷题 | `Learn/algorithm/刷题路线.md`、`Learn/algorithm/题型分类.md` | `Learn/algorithm/用法导向知识.md`、`Learn/algorithm/分析优化.md`、`Learn/Bases/DataStructure/` |
| 数据库 | `Learn/Language/DB/MySQL.md`、`Learn/Language/DB/MongoDB.md` | `Learn/Books/Redis 设计与实现.md`、`Learn/Books/高性能MySQL第三版阅读指南.md`、`Files & LongText/Long code/Mysql Snippets.md` |
| CMake、编译、CI/CD 与开发工具 | `Learn/ToolChain/CMake.md`、`Learn/ToolChain/CICD.md` | `Learn/ToolChain/Dev Tool.md`、`Learn/ToolChain/Components.md`、`Learn/ProjectsStudy/FromRemote/01Star-Punchase-Sale-Inventory.md` |
| Qt、QML、Android 与桌面应用 | `Learn/Books/QT6开发指南.md`、`Learn/Language/C C++/QML.md` | `Learn/ProjectsStudy/FromDocs/Qt Official Tutorial.md`、`Learn/ProjectsStudy/FromRemote/QTExamples.md`、`Learn/Language/Android/` |
| 求职与面试 | `Chores/JobInterviews/简历项目.md`、`Chores/JobInterviews/面试题知识.md` | `Chores/JobInterviews/面试题合集.md`、`Chores/JobInterviews/questions精简.md`、`Chores/JobInterviews/收集的面试题.md`、`Chores/JobInterviews/面试复盘.md`、`Chores/JobInterviews/自我介绍.md` |
| FSRS 复习插件与成果包 | `Context.md` 及 `.obsidian/customDocument/FSRSScheduler/` 下的三份协作文档 | 先读 `UseGuide.md`、`FileGuide.md`、`AgentProtocol.md`，再按明确请求读取其指定来源 |
## 目录结构与配置边界
- `Learn/`：技术学习主区。基础原理放 `Bases/`，语言和框架放 `Language/`，书籍笔记放 `Books/`，工具链放 `ToolChain/`，算法放 `algorithm/`，项目源码学习按 `ProjectsStudy/FromDocs`、`FromRemote`、`WriteByMyself` 区分来源，零散材料放 `Fragments/`。
- `Learn/Bases/` 当前实际子目录为 `ComputerComposition/`、`DataStructure/`、`Network/`、`OperatingSystem/`、`Paradigm/`。旧版 `Style.md` 中的部分示例仍写作中文目录名，新增或引用时以实际磁盘路径为准。
- `Article/`：哲学与个人感悟文章。`Chores/`：求职、生活和设备问题。`Daily/`：按日期记录学习、复习和观察。
- `Files & LongText/Attachments/`：附件统一目录；`.obsidian/app.json` 当前将 `attachmentFolderPath` 设为该路径。正文使用 Obsidian 附件嵌入语法，不手写相对路径。`Files & LongText/Long code/` 存放跨主题代码片段。
- `.obsidian/`：Obsidian 配置、插件、主题、CSS snippets 和工作区设置。改配置时只触碰任务所需文件：附件目录看 `app.json`，插件启用清单看 `community-plugins.json` / `core-plugins.json`，模板看 `templates.json`，外观看 `appearance.json`、`themes/` 或 `snippets/`。不因笔记编辑顺手调整插件、主题或工作区。
- `.obsidian/notes-index/`：`notes_index.py` 及 SQLite 索引 `index.db`，用于标题/描述检索与单文件核验；数据库是生成索引，不能手工编辑。
- `.obsidian/customDocument/FSRSScheduler/`：FSRS 插件的 Agent 交接、复习文档与插件数据。工作流入口是 `UseGuide.md`、`FileGuide.md`、`AgentProtocol.md`。严格遵守文档中的来源校验和写入边界；不要直接伪造或改写 `Data/Events`、`Data/Content`、`Data/Tasks`、`Data/Attempts` 或调度事实。仅按具体请求读取对应 `Request.json` 及所列 source。
- `.obsidian/plugins/fsrs-scheduler/README.md` 说明插件功能和限制；插件开发代码仓库不在本知识库目录内，插件源码任务应先确认实际源码路径。
- `.trash/` 是 Obsidian 删除项归档，不属于当前知识库索引；除非用户要求恢复或查找历史内容，不纳入检索与迁移。
- 活跃文件地图列出本次盘点的 162 篇可见 Markdown 笔记，不逐项展开隐藏插件文档、生成数据和二进制附件。新增或移动后以目录实际内容为准，并更新本节相关分类。
## 活跃笔记文件地图
### 根目录
- `AGENTS.md`：本仓库 AI 与贡献指南。
- `Context.md`：用户背景、当前学习主线、复习插件协作方式和事实边界。
- `Style.md`：笔记结构、写作风格、命名、索引工具及 AI 写入检查清单。
### 学习笔记
#### 人工智能
- `Learn/AI/Pytorch basic.md`：PyTorch 基础和官方教程摘记。
#### 计算机基础与设计范式
##### 计算机组成
- `Learn/Bases/ComputerComposition/Hardware Animation.md`：硬件及网络基础概念速记，含 DNS、局域网、主板等。
- `Learn/Bases/ComputerComposition/王道考研计算机组成原理.md`：王道课程体系，覆盖数据表示、存储、指令和 CPU。
- `Learn/Bases/ComputerComposition/计组---刘宏伟.md`：刘宏伟计算机组成原理课程笔记。
##### 数据结构
- `Learn/Bases/DataStructure/dsacpp 3rd.md`：英文数据结构与算法教材的阅读摘记。
- `Learn/Bases/DataStructure/数据结构.md`：抽象数据类型及数据结构基本概念。
- `Learn/Bases/DataStructure/数据结构和算法图解.md`：数据结构、算法复杂度和大 O 分析。
- `Learn/Bases/DataStructure/深入浅出数据结构.md`：视频课程式数据结构学习笔记。
- `Learn/Bases/DataStructure/王道考研数据结构.md`：王道数据结构课程，覆盖线性表、栈队列、树等。
##### 计算机网络
- `Learn/Bases/Network/OSI七层模型.md`：OSI 七层模型的层次与服务关系。
- `Learn/Bases/Network/小林Coding 计算机网络.md`：TCP/IP、HTTP、DNS、协议栈和 TCP 详解。
- `Learn/Bases/Network/王道考研计算机网络.md`：按物理层到应用层组织的课程笔记。
##### 操作系统
- `Learn/Bases/OperatingSystem/Linux 源码学习.md`：以 Linux 0.11 源码追踪启动、进程、内存、文件系统和设备。
- `Learn/Bases/OperatingSystem/小林 Coding 图解操作系统.md`：硬件、中断、内核、虚拟内存等图解基础。
- `Learn/Bases/OperatingSystem/王道考研操作系统（OS）.md`：进程、内存、文件系统和 I/O 管理课程笔记。
##### 设计与通用机制
- `Learn/Bases/Paradigm/C++开发范式和术语.md`：RAII、生命周期及常用 C/C++ 术语和机制。
- `Learn/Bases/Paradigm/IO复用模型.md`：socket 到 select/poll/epoll/AIO/io_uring 的模型与调用机制。
- `Learn/Bases/Paradigm/常用算法和情景处理.md`：缓存淘汰、常见算法及场景处理。
- `Learn/Bases/Paradigm/架构设计.md`：进程线程、无锁队列等架构和系统设计碎片。
- `Learn/Bases/Paradigm/设计模式.md`：设计模式分类、原则和常见模式。
#### 书籍笔记
- `Learn/Books/C++ prime plus.md`：C++ 入门书章节摘记与语言基础。
- `Learn/Books/C++并发编程实战（第二版）.md`：C++ 并发概念、线程管理和实践。
- `Learn/Books/C++高性能编程阅读指南.md`：高性能 C++ 阅读路线、观点审查和实践主题。
- `Learn/Books/Effective C++（侯捷）.md`：Effective C++ 条款和相关语言知识。
- `Learn/Books/Google C++ Style Guide.md`：Google C++ 风格指南的文件、头文件和声明规则。
- `Learn/Books/Linux多线程服务端编程 使用muduo C++网络库.md`：陈硕 muduo 相关多线程服务端编程读书笔记。
- `Learn/Books/Linux高性能服务器编程.md`：TCP/IP、Linux 网络 API 和服务器实现章节笔记。
- `Learn/Books/Linux高性能服务器编程阅读指南.md`：该书版本边界、阅读路线和机制核查指南。
- `Learn/Books/Modern C++.md`：现代 C++ 语言、项目结构与特性笔记。
- `Learn/Books/Python编程三剑客.md`：Python 入门、快速上手和实践摘记。
- `Learn/Books/QT6开发指南.md`：Qt 6 GUI、元对象系统、布局和构建笔记。
- `Learn/Books/QT样式表合集.md`：Qt 样式表语法、盒模型和样式参考。
- `Learn/Books/Redis 设计与实现.md`：Redis 内部数据结构、对象与实现章节笔记。
- `Learn/Books/以日为鉴：衰退时代生存指南.md`：书籍阅读路线、观点与事实核验记录。
- `Learn/Books/四本技术书阅读路线.md`：多本技术书的联合阅读顺序和输出安排。
- `Learn/Books/汇编语言---王爽.md`：王爽汇编语言教材学习笔记。
- `Learn/Books/深度探索C++对象模型阅读指南.md`：C++ 对象模型的版本边界、阅读路线和核心主题。
- `Learn/Books/现代C++语言核心特性解析.md`：现代 C++ 核心特性章节摘记。
- `Learn/Books/算法竞赛入门经典.md`：算法竞赛入门章节、数学与程序设计练习。
- `Learn/Books/计算机是怎样跑起来的.md`：计算机基本组成、程序执行及书籍章节摘记。
- `Learn/Books/软件工程.md`：软件工程教材和设计模式相关章节笔记。
- `Learn/Books/高性能MySQL第三版阅读指南.md`：MySQL 第三版版本纠偏、阅读路线和机制审查。
#### 编程语言与工具
##### Android
- `Learn/Language/Android/Android Development.md`：Android 官方教程、Compose 和 UI 入门。
- `Learn/Language/Android/Jetpack Compose入门到精通.md`：Jetpack Compose 编译与运行机制。
- `Learn/Language/Android/Jetpack  Compose开发.md`：Compose Modifier 与界面开发实践。
- `Learn/Language/Android/Kotlin + xml传统开发.md`：Kotlin、传统 XML 布局和 Android 基础。
- `Learn/Language/Android/项目开发过程.md`：Android 项目开发过程和零散实现记录。
##### C 与 C++、Qt、图形
- `Learn/Language/C C++/Communication protocol.md`：Modbus、MQTT QoS 等通信协议摘记。
- `Learn/Language/C C++/C++ Runoob Tutoral.md`：C++ 基础语法和 Runoob 教程摘记。
- `Learn/Language/C C++/OpenGL.md`：LearnOpenGL 学习主笔记，按问题解释渲染管线和 API。
- `Learn/Language/C C++/OpenGL.RewriteBackup.md`：OpenGL 重写过程的备份稿，非当前首选入口。
- `Learn/Language/C C++/QML.md`：QML、图像提供器和焦点作用域等 Qt Quick 主题。
- `Learn/Language/C C++/Ros2.md`：ROS 2 工作空间、ament、构建和 Qt 集成对比。
- `Learn/Language/C C++/模板元编程.md`：C++ 模板、元编程及编译期机制。
##### 数据库、前端与脚本
- `Learn/Language/DB/MongoDB.md`：MongoDB 基本概念和操作。
- `Learn/Language/DB/MySQL.md`：MySQL 环境配置、SQL 语法和常见操作。
- `Learn/Language/Fronted/CSS.md`：CSS 基础语法和样式。
- `Learn/Language/Fronted/HTML.md`：HTML 与 HTML5 基础。
- `Learn/Language/Java/java编程的逻辑.md`：Java 语言基础和《Java 编程的逻辑》章节笔记。
- `Learn/Language/ScriptLangs/Bash shell.md`：Shell 命令、通配符和脚本语法。
- `Learn/Language/ScriptLangs/From Official.md`：TypeScript/JavaScript 官方文档学习摘记。
- `Learn/Language/ScriptLangs/Ragel.md`：Ragel 状态机编译器的定位、工作流和原理。
##### 工具链
- `Learn/ToolChain/CMake.md`：CMake 规范、查找依赖和构建问题。
- `Learn/ToolChain/CICD.md`：Jenkins、C++ CI/CD 流程和配置。
- `Learn/ToolChain/Components.md`：Redis、CI/CD、Docker 等组件和概念汇总。
- `Learn/ToolChain/Dev Tool.md`：clang-format、Qt 格式配置和开发工具记录。
#### 算法
- `Learn/algorithm/SQL刷题记录.md`：SQL 题目练习和解法记录。
- `Learn/algorithm/分析优化.md`：算法错误经验、简化思路和优化技巧。
- `Learn/algorithm/刷题路线.md`：按题型组织的算法练习路线和外部题单。
- `Learn/algorithm/用法导向知识.md`：容器、位运算、哈希和 C++ 特性的实用写法。
- `Learn/algorithm/题型分类.md`：按常见算法模型和题型归类的解题笔记。
#### 项目源码学习
##### 官方文档与教程
- `Learn/ProjectsStudy/FromDocs/Agent Learning.md`：Claude Code 文档学习，含 CLAUDE.md、Hooks 等。
- `Learn/ProjectsStudy/FromDocs/Alien Invasion.md`：Python/Pygame 项目学习与语言机制摘记。
- `Learn/ProjectsStudy/FromDocs/args库（3000行）.md`：Taywee args 命令行库源码结构。
- `Learn/ProjectsStudy/FromDocs/Boost库学习.md`：Boost 库使用与测试组件笔记。
- `Learn/ProjectsStudy/FromDocs/OpenCV 官方文档.md`：OpenCV 官方文档、图像入门和 core 模块。
- `Learn/ProjectsStudy/FromDocs/Qt Official Tutorial.md`：Qt 官方教程，含信号槽和属性绑定。
- `Learn/ProjectsStudy/FromDocs/Sylar Backend Collection.md`：Sylar 后端、libevent、Reactor 和服务端架构学习。
##### 外部项目
- `Learn/ProjectsStudy/FromRemote/01Star-Punchase-Sale-Inventory.md`：多模块进销存项目，含 Oat++、MySQL 和 CMake 分层。
- `Learn/ProjectsStudy/FromRemote/Agent2Agent Protocol.md`：A2A 协议及其 C++ SDK 架构。
- `Learn/ProjectsStudy/FromRemote/cJSON.md`：cJSON 数据结构、hooks 和 C/C++ 实现风格。
- `Learn/ProjectsStudy/FromRemote/CLI11.md`：CLI11 参数、选项、校验和解析过程。
- `Learn/ProjectsStudy/FromRemote/CommStudio.md`：CommStudio 程序入口、界面与模块调用学习。
- `Learn/ProjectsStudy/FromRemote/Echat.md`：Echat 客户端结构、通信流程和文件阅读记录。
- `Learn/ProjectsStudy/FromRemote/FastLog.md`：FastLog 架构、开发问题和 C++ 特性摘记。
- `Learn/ProjectsStudy/FromRemote/FiberLib.md`：用户态协程库的线程、调度器和切换机制。
- `Learn/ProjectsStudy/FromRemote/github python learning projects.md`：GitHub Python 学习项目和课程路线。
- `Learn/ProjectsStudy/FromRemote/httpd.md`：Tinyhttpd 项目源码阅读入口。
- `Learn/ProjectsStudy/FromRemote/MCP-Protocol CPP.md`：MCP 协议、C++ Server 架构与设计。
- `Learn/ProjectsStudy/FromRemote/Pooling Components.md`：通用连接池、RAII 借用和锁粒度设计。
- `Learn/ProjectsStudy/FromRemote/QSimpleScada.md`：Qt SCADA 项目的定位、模块和阅读顺序。
- `Learn/ProjectsStudy/FromRemote/QTExamples.md`：Qt moc、UI 生成及 Make/qmake/CMake 运行机制。
- `Learn/ProjectsStudy/FromRemote/Sudoku.md`：C++ 数独项目的结构和设计练习。
- `Learn/ProjectsStudy/FromRemote/Tencent Libco.md`：腾讯 libco 的上下文切换、epoll 和 Hook 机制。
- `Learn/ProjectsStudy/FromRemote/WebServer-Chat.md`：WebServer-Chat 服务端项目和协程实现学习。
##### 自己编写的项目
- `Learn/ProjectsStudy/WriteByMyself/AzzatoChat.md`：自研聊天项目的 UI、gateServer 和池化封装。
- `Learn/ProjectsStudy/WriteByMyself/BookManageSystem+mysql.md`：图书管理系统、MySQL 和 C++ 实现问题。
- `Learn/ProjectsStudy/WriteByMyself/CodeLineCounter.md`：当前为空文件，代码行数统计项目占位。
- `Learn/ProjectsStudy/WriteByMyself/CPP网络编程实战.md`：网络请求、socket 和网络编程流程实践。
- `Learn/ProjectsStudy/WriteByMyself/DevFoundations.md`：CSVReader、fast-cpp-csv-parse 源码和开发问题。
- `Learn/ProjectsStudy/WriteByMyself/MyTinySTL.md`：容器复现、Vector 和内存分配/构造/销毁。
- `Learn/ProjectsStudy/WriteByMyself/nanochat.md`：nanochat 的通信结构和 UI 架构记录。
- `Learn/ProjectsStudy/WriteByMyself/netease music cover downloader.md`：网易云音乐封面下载器的网络请求实现。
- `Learn/ProjectsStudy/WriteByMyself/Pammic LC.md`：Pammic 后端系统的激活跨系统一致性协议、调用链与后续学习路线。
- `Learn/ProjectsStudy/WriteByMyself/PicToAscii.md`：图片转 ASCII 工具和命令行参数处理。
- `Learn/ProjectsStudy/WriteByMyself/Protect Eyes.md`：当前文件为空，是护眼工具主题的占位文件。
- `Learn/ProjectsStudy/WriteByMyself/template_restructured.md`：重整后的 C++ 算法竞赛模板。
#### 零散知识与考试
- `Learn/Fragments/CS self-taugh/missing semester.md`：Missing Semester 的 Shell、命令行和开发工具学习。
- `Learn/Fragments/编程相关/基本知识/Regular Expression.md`：正则语法、优先级和常用结构。
- `Learn/Fragments/编程相关/基本知识/报错日志和代码异常分析.md`：C++ 编译约束和 API 使用报错分析。
- `Learn/Fragments/编程相关/操作经验/乱码对照表及其解决方法.md`：字符编码乱码现象与排查方法。
- `Learn/Fragments/编程相关/操作经验/使用adb禁用应用.md`：使用 ADB 禁用应用的命令记录。
- `Learn/Fragments/编程相关/操作经验/网络连接问题解决.md`：SSH、端口、Redis 远程访问和网络排错。
- `Learn/Fragments/编程相关/操作经验/软件使用错误.md`：Qt MySQL 驱动缺失等软件问题。
- `Learn/Fragments/装机/制作系统盘.md`：制作系统安装盘的步骤。
- `Learn/Fragments/装机/装机.md`：PC 硬件选择与装机流程。
- `Learn/Fragments/计算机二级考试/Excel操作题.md`：计算机二级 Excel 操作题。
- `Learn/Fragments/计算机二级考试/Excel选择题.md`：计算机二级 Excel 选择题。
- `Learn/Fragments/计算机二级考试/PowerPoint操作题.md`：计算机二级 PowerPoint 操作题。
- `Learn/Fragments/计算机二级考试/PowerPoint选择题.md`：计算机二级 PowerPoint 选择题。
- `Learn/Fragments/计算机二级考试/Word操作题.md`：计算机二级 Word 操作题。
- `Learn/Fragments/计算机二级考试/Word选择题.md`：计算机二级 Word 选择题。
- `Learn/Fragments/计算机二级考试/函数宝典中没有的函数.md`：Office 函数补充记录。
- `Learn/Fragments/计算机二级考试/奇校验和偶校验.md`：奇偶校验的概念和题目。
- `Learn/Fragments/计算机二级考试/押题卷.md`：计算机二级模拟与押题。
- `Learn/Fragments/计算机二级考试/数据库设计.md`：E-R 图到关系模型的数据库设计题。
- `Learn/Fragments/计算机二级考试/数据结构与算法.md`：计算机二级数据结构和算法题。
- `Learn/Fragments/计算机二级考试/笔记-公共基础&计算机基础.md`：计算机二级公共基础和计算机基础合并笔记。
- `Learn/Fragments/计算机二级考试/计算机公共基础知识.md`：计算机公共基础知识点。
- `Learn/Fragments/计算机二级考试/计算机基础知识.md`：计算机基础、存储和硬件知识点。
- `Learn/Fragments/计算机二级考试/选择题做题.md`：计算机二级选择题错题与知识点。
- `Learn/Fragments/计算机二级考试/靠记的题.md`：需要记忆的计算机二级题目和测试概念。
### 文章、工作与生活
#### 文章
- `Article/哲学/人在苦难中，更像一个人.md`：关于苦难、人的处境和韧性的个人思考。
- `Article/哲学/沉思录.md`：当前为空文件，保留为哲学阅读主题占位。
- `Article/感悟/内外兼修？.md`：内向者、自我认知和应对工具的个人感悟。
- `Article/感悟/大学生活快与慢.md`：大学生活节奏与成长体验。
#### 求职面试
- `Chores/JobInterviews/questions精简.md`：按 C++、并发、内存、网络和系统设计整理的精简题库。
- `Chores/JobInterviews/具体公司的了解以及面试准备.md`：目标公司背景、产品与面试准备；内容可能随求职阶段变化。
- `Chores/JobInterviews/反问环节.md`：面试末尾向面试官提出的问题。
- `Chores/JobInterviews/收集的面试题.md`：收集的原始面试问题和部分回答素材。
- `Chores/JobInterviews/简历项目.md`：自研项目和实习项目的简历表述、技术追问与回答。
- `Chores/JobInterviews/自我介绍.md`：通用及不同岗位/公司的自我介绍版本。
- `Chores/JobInterviews/面试复盘.md`：具体面试过程与复盘记录。
- `Chores/JobInterviews/面试题合集.md`：覆盖 Qt、C++、并发、网络和系统设计的详细题库。
- `Chores/JobInterviews/面试题知识.md`：面试题背后的原理，配合题库和回答话术使用。
#### 生活与设备
- `Chores/Life/Renting House.md`：租房沟通、合同和检查事项。
- `Chores/computer learning puzzles.md`：CentOS、yum、MySQL 和网络配置故障记录。
- `Chores/operation in devices.md`：Windows、设备、同步和软件操作备忘。
#### 日常记录
- `Daily/LearningRecord/LearnDaily.md`：按日记录的学习内容、感悟和待办。
- `Daily/LearningRecord/Learned Record.md`：按月份汇总的学习历史，适合回顾时间线。
- `Daily/Observations/工作职场.md`：工作与职场观察。
- `Daily/Observations/正常交际.md`：日常沟通和社交观察。
### 长文本与附件中的 Markdown
- `Files & LongText/Long code/C++ Code Snippets.md`：跨主题 C++ 代码片段、算法和数据库示例。
- `Files & LongText/Long code/Mysql Snippets.md`：数据库脚本片段；部分内容注明按 SQL Server 实现，使用时核对方言。
- `Files & LongText/Long code/scripts.md`：CMake 等脚本和可复用命令。
- `Files & LongText/Attachments/039【算法】动态规划背包模型 - A.md`：背包动态规划模型、例题和代码。
- `Files & LongText/Attachments/%E6%AD%A3%E5%88%99%E8%A1%A8%E8%BE%BE%E5%BC%8F.md`：正则表达式基础翻译与语法说明。
- `Files & LongText/Attachments/README.md`：附件区相关辅助脚本的说明。
- `Files & LongText/Attachments/开发常用正则表达式.md`：常用业务正则表达式集合。
## Obsidian 与索引命令
在知识库根目录执行。索引脚本使用 Python 3.8+ 标准库，不需要安装第三方包。
- `python3 .obsidian/notes-index/notes_index.py lookup "关键词"`：按关键词查找可能相关的标题与笔记；传入 `--regex` 可用 Python 正则匹配标题和描述，例如 `lookup '协程|线程' --regex`。
- `python3 .obsidian/notes-index/notes_index.py check "相对路径.md"`：核对单篇笔记标题索引。
- `python3 .obsidian/notes-index/notes_index.py update --no-write`：预览全库索引变化，不写入数据库。
- `python3 .obsidian/notes-index/notes_index.py update` 会写入索引；只在用户明确要求时执行。新标题的描述按 `Style.md` 要求处理。
Obsidian 配置修改后只核验被改文件和相关引用；不需要为普通 Markdown 编辑构建应用。检查笔记附件引用是否存在，路径使用当前配置的附件目录。
## 命名、写作与链接
- 新笔记放入现有学科目录，遵循 `Style.md` 中的命名规则。现有目录或文件名包含空格、中文或拼写历史时保留原样；不要顺手重命名。
- 技术笔记默认中文、高信息密度。先说明问题，再按机制、数据流/调用链、实现、取舍、边界和验证组织内容；涉及方案对比使用表格，代码块必须提供正文之外的信息。
- 标题层级从 `#` 开始，不跳级、不加序号。列表层级缩进 4 个空格。数字、英文、行内代码与中文之间留空格。
- 知识笔记使用 `[[Note]]` 或 `[[Note#Heading]]` 建立关联；图片和附件使用 `![[filename.png]]`。不要手写跨目录相对路径。
- 面试题口径稿与原理详解分开放置：题目/回答素材放 `面试题合集.md`、`questions精简.md` 等，原理放 `面试题知识.md` 或对应 `Learn/` 主题笔记。
## 版本控制与验收
- 仓库含自动 `vault backup` 与 Obsidian 同步提交。修改前检查 `git status --short`，仅处理本任务文件；不覆盖、暂存或撤销用户已有变更。
- 普通笔记编辑的最小验收：查看 `git diff --check` 与 `git diff -- <文件>`，确认改动范围、Markdown 标题、链接、附件和索引检查结果。
- 不运行全库索引更新，不改索引数据库，不提交、不推送；只有用户明确要求时才进行这些仓库操作。
- 此仓库没有常规 PR 模板或独立测试框架。若用户明确要求提交，使用简短描述型消息，例如 `docs: update OpenGL notes`；同步和自动备份提交不作为手工提交风格依据。
## 安全与隐私
- 不把凭证、Token、个人会话数据、工具运行数据库、插件私有缓存或机器专属路径写入知识笔记或版本控制。
- 只读与当前任务相关的设置。插件状态、FSRS 事件、复习答案和提交来源可能是事实记录；遵循插件协议，不能为补齐学习叙事而编造或直接篡改。
- 发现笔记中的旧路径或旧结论时，先核对现存文件与上下文，再做局部修正；不因目录地图过期而批量移动内容。
