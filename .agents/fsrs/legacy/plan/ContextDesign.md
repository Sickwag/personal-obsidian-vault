# 学习上下文
版本：0.2。语义上下文由用户和外部 Agent 维护，插件只读消费。
## 目的
Context.md 为外部 Agent 提供当前目标、学习约束、材料位置和证据索引。插件读取其中结构化偏好与路径，将已发生事实导出供外部维护，不在内部总结进度。
入口保持短小，主题细节放 Topics，语义摘要放 Digests，真实复习记录保存在 Events。
## 目录
```text
LearningReview/
    Context.md
    CurrentPlan.md
    Topics/
        IoMultiplexing.md
    Digests/2026/
        2026-10-15.md
    Items/
    Practice/
    Exchange/
        Requests/
        Imports/
        Receipts/
    Data/
        Vault.json
        Sources/
        Content/
        Events/
        Checkpoints/
```
生成与协作文档可由用户 Git 提交保存，但不重新作为学习来源扫描。插件的本机运行日志、游标、启动 journal 和临时文件不写进被跟踪目录。
## 全局上下文模板
```markdown
---
schema_version: 1
document_kind: learning_context
timezone: Asia/Shanghai
study_day_start: "04:00"
daily_review_budget_minutes: 10
new_card_daily_limit: 3
---

# 学习上下文
## 人工声明
### 长期方向
- C++ 后端开发与基础架构开发。
### 当前目标
- 目标 ID：goal_backend_2026。
- 能够解释并实现网络 I/O 与并发调度。
### 当前主线
- 主题：[[Topics/IoMultiplexing]]。
- 材料：[[Learn/Bases/Paradigm/IO复用模型]]。
- 自述进度：正在理解 epoll ET 模式。
- 下一步：分析非阻塞读取与 EAGAIN。
### 现实约束
- 工作日时间不固定；允许只做一题。
- 长编码题安排在周末。
### 检验偏好
- 原理、调用链、边界条件与最小反例。

<!-- fsrs:agent-observed:start -->
## 外部 Agent 整理的事实
- 维护时间：待填写。
- 覆盖的提交 SHA：待填写。
- 覆盖的复习事件：待填写。
- 最近薄弱点：附具体回答与来源。
<!-- fsrs:agent-observed:end -->

<!-- fsrs:agent-inferred:start -->
## 外部 Agent 推断
- 每条标明依据、待确认项与是否已被用户否认。
<!-- fsrs:agent-inferred:end -->
```
示例学习状态并未核实。插件不会因模板存在就认为已经学习这些内容。
上述托管标记属于外部 Agent 的编辑约定。插件不写这些区域，外部工具按用户授权维护并保护人工区。
## 配置权威
学习偏好 frontmatter 是对应字段的单一权威源，设置页更新同一字段；原文目标和语义进度保持只读展示。
改变目标保持率或重要策略时，通过结构化 PolicyPatch/设置页记录版本。CurrentPlan.md 的建议正文不会自动覆盖 FSRS。
本机 Git 路径、分支绑定、缓存、提醒去重和启动事务是设备配置。插件没有模型端点、API Key 或 token 预算配置。
字段错误时沿用最后已验证值并提示，不能解释为零。Context 删除或无法解析时已有复习继续可用，提示选择/恢复上下文路径。
## 主题模板
```markdown
---
schema_version: 1
document_kind: topic_state
topic_id: topic_io_example
title: I/O 多路复用
status: active
priority: high
goal_ids:
    - goal_backend_2026
---

# I/O 多路复用
## 人工目标
- 解释 LT/ET 触发语义与非阻塞读取的关系。
## 材料进度
| 材料 | 人工状态 | 位置 |
| --- | --- | --- |
| I/O 笔记 | 阅读中 | [[Learn/Bases/Paradigm/IO复用模型]] |
## 已验证证据
- 实际 ReviewEvent 或实践结果，首次可为空。
## 薄弱点
- 外部 Agent 根据实际回答整理并链接事件。
## 待确认推断
- 推断、依据、覆盖范围和确认状态。
## 下一步
- 人工指示与 Agent 建议分别标明。
```
材料状态可用 planned、reading、read、practiced、paused。插件不按提交行数自动推进材料进度。
## 进度分维度

| 维度 | 依据 | 处理方 |
| --- | --- | --- |
| 材料阅读进度 | 用户声明与明确检查点 | 用户/外部 Agent |
| 内容变化 | 提交、blob、章节事实 | 插件采集 |
| 检验覆盖 | 已接受目标的首次检验记录 | 插件机械统计 |
| 回忆表现 | 真实、合格的作答事件 | 插件统计，外部分析 |
| 实践表现 | 用户提供的运行、测试和结果 | 用户/外部 Agent |
| 记忆预测 | FSRS 状态与参数 | 插件给出估计 |

阅读完成不等于掌握；一道题成功不代表整个主题掌握。插件不将多个维度合成无依据的百分比。
## 插件提供给外部的事实
用户手动导出或有新任务时生成有限范围的 Request：
- 源章节及其版本、普通/补提交标记和真实捕获时间；
- 相关主题/上下文文件路径与 hash；
- 相关题目内容版本与实际复习事件；
- 尚未处理的 source_id、NeedsValidation 和用户反馈；
- 当前生效的参数/预算版本。
插件不负责选择模型上下文窗口。外部 Agent 自行按任务读取必要资料，避免无差别读取整个知识库或不相关私人目录。
## 事实、推断与日期
人工目标保留其声明时间；外部整理注明最后维护时间和覆盖范围。未覆盖的新提交显示为待整理，不能冒充已经总结。
startup-sync 的 archive_date 只是归档日。上下文进度优先采用实际自述与作答证据，不能把补提交自动写成昨天完成的学习。
AI 推断被用户否认后应记录更正，后续外部整理回到原始来源核对，避免摘要层层强化错误。
## 更新与并发
插件读取文件后缓存 hash。外部 Agent 或用户保存新版本时重新解析，不在用户编辑时覆盖正文。
外部工具维护标记区应使用读-改-版本检查，不整篇覆盖人工内容。标记缺失或重复时由外部工具提示用户，插件仅显示维护异常。
语义文档维护失败不阻塞评分。插件可以导出事实，等待下次外部整理，不自行补写“推测完成”。
## 现有文档的接入
普通正文用于展示和外部阅读。能触发提醒的日期、任务 ID、任务类型与关联路径必须使用约定 frontmatter 或 [外部协议](ExternalAgent.md) 的 Plan 条目。
自由文本“下周复习一下”不会被插件用 NLP 猜成某个日期。外部 Agent 可将其转为明确任务，用户确认后导入。
已有题库可手动映射到公开 schema，原始文档保持不变；导入时保存来源链接与版本。
