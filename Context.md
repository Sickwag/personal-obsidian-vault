---
schema_version: 1
timezone: Asia/Shanghai
study_day_start: "04:00"
daily_review_budget_minutes: 10
new_card_daily_limit: 3
desired_retention: 0.9
---
# 学习与复习上下文
本文件位于 Obsidian 知识库根目录，是本人、FSRS Scheduler 和外部 Agent 的共同入口。记录日期：2026-10-15；笔记和提交只证明内容变化，掌握程度须由真实作答检验。
## 项目基本信息
- 长期目标：C++ 后端与基础架构开发，同时学习图形学和医学三维可视化。
- 原始知识笔记保留在 Learn 等目录；复习工作区为 `.obsidian/customDocument/FSRSScheduler/`。
- 插件源码项目：`/mnt/windows-e/CodeFiles/learnAndDev/obsidian-FSRSScheduler`。
- 插件负责 Git 变更发现、用户确认、真实事件记录、FSRS 调度和提醒；总结、出题、评估、规划和语义文档维护交给外部 Agent。
- 每天约 10 分钟，最多 3 张新卡；时间不固定，允许中断。缺席不记失败，只阅读答案不记独立回忆成功。
## 当前学习主线
| 主线 | 材料与目标 | 当前状态 |
| --- | --- | --- |
| OpenGL | 跟随 LearnOpenGL，理解渲染管线、纹理、变换、坐标、摄像机和光照；笔记为 `Learn/Language/C C++/OpenGL.md` | 正在学习，已掌握范围待检验 |
| VTK | 配合 OpenGL 理解数据处理、可视化与渲染机制 | 正在学习，章节和代码位置待补充 |
| 医学三维视图软件 | 使用 C++，结合 OpenGL、VTK、ITK 开发医疗医学三维视图软件 | 当前功能阶段、数据格式、代码仓库待确认 |
| Linux I/O 复用 | 理解 select/poll/epoll、阻塞/非阻塞、LT/ET、就绪处理与调度；笔记为 `Learn/Bases/Paradigm/IO复用模型.md` | 正在学习，薄弱点待真实作答验证 |
## 近期提交证据
- 本人提交基线 `37e353d`（2026-10-15）；此前 OpenGL 在 10 月 10、12、13、15 日的近期提交中持续变化，可优先增量整理。
- Linux I/O 复用模型在 `4871b52`（10 月 14 日）和 `37e353d` 涉及变化，目录调整后使用当前 Paradigm 路径并核对 diff。
- 同期还有数据结构、网络、操作系统、计算机组成等文件变化，可能包含移动和整理，不自动将全部历史资料列为当前主线。
- 插件补提交 `951e6b2` 曾被撤回；后续补提交的归档日期也不代表学习或复习日期。无真实作答证据时不声称已经掌握。
## Agent 协作顺序
1. 先读本文件及工作区 UseGuide.md、FileGuide.md、AgentProtocol.md，确认本轮重点和可用时间。
2. 优先读取指定 `Exchange/Requests/<id>/Request.json` 和关联 `Data/Sources/<id>.json`，按需核对当前原始笔记与 Git diff；无请求时先让本人执行“登记最近 7 次提交中的学习变化”。
3. 区分新增、纠错、补充、移动和格式修改；合并同一目标的重复变化，不遍历整库、不一次激活全部历史。
4. 首批围绕 OpenGL 和 Linux I/O 复用合计生成约 3—5 个候选问题，每题一个目标，给出来源、评分要点和预计耗时；VTK、ITK 的具体进度先确认。综合编码安排 practice，阅读安排 reading。
5. 按协议将候选包发布到 `Exchange/Imports/<package_id>/`。先内容，再 Manifest，最后 Ready；使用源码项目 scripts/PreparePackage.mjs 生成哈希，由本人回到插件刷新、校验、审阅和接受。
6. 根据本人真实回答或明确导出的 Attempt 给出评估，说明正确点与误区；不直接改写 Data/Events、Data/Content、Vault 身份、调度状态或虚构昨天的作答。
7. 简短维护当前进度、真实薄弱点、未完成事项和下一步，详细主题记录放 Topics、变更摘要放 Digests。修改前读取全文，保留人工内容；推断标注“待验证”。
## 检验偏好
- 优先问机制与原因、调用/数据流、边界条件、错误后果和最小 C++ 代码分析。
- OpenGL 可围绕 VAO/VBO/EBO、纹理单元、模型/观察/投影、透视除法和法线选题，具体覆盖以真实变更为准。
- I/O 可围绕就绪与完成、ET 读到 EAGAIN、read 返回分支、对端关闭、缓冲区残留及生命周期选题。
- 不读取工具会话、日志、运行数据库或凭证；不自动推送，不执行破坏性 Git 操作。
