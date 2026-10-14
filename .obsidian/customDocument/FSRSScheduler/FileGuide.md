# 文件用途与写入边界
下表中路径相对于本工作区，只有 `/Context.md` 相对于 Vault 根目录。尚未使用的功能不会提前创建空文件；ID 命名文件按需增加。
| 路径 | 内容与用途 | 谁可以维护 |
| --- | --- | --- |
| /Context.md | 项目背景、学习目标、当前进度、Agent 协作入口；frontmatter 为插件偏好 | 用户和 Agent 维护正文；插件设置仅更新偏好 |
| UseGuide.md | 安装后操作顺序、命令、复习流程和提示词 | 插件首次生成，用户可补充 |
| FileGuide.md | 本文件，说明各类文件的职责 | 插件首次生成，用户可补充 |
| AgentProtocol.md | 已实现的候选卡、规划、反馈和发布协议 | 插件首次生成；升级以安装包 docs 协议为准 |
| CurrentPlan.md | 当前阶段安排和下一步，不是调度事实 | 用户/Agent 按需创建 |
| Topics/*.md | 主题进展、概念关联、薄弱点和证据 | 用户/Agent 按需维护 |
| Digests/*.md | Git 变更摘要，注明范围和提交证据 | Agent 维护，不等同掌握记录 |
| Practice/ | 综合编码练习与过程记录 | 用户/Agent 维护 |
| Items/<card_id>.md | 正式卡片的可读投影，含问题、评分要点、来源和 revision | 插件生成；修订通过外部成果包 |
| Data/Vault.json | Vault/repo 身份和主写入设备 | 插件管理，迁移保持身份 |
| Data/Content/<revision_id>.json | 不可变题目内容版本 | 插件管理，不直接编辑 |
| Data/Events/<event_id>.json | 真实建卡、评分、撤销、阅读等事件，可重建状态 | 插件追加，Agent 只读 |
| Data/Sources/<source_id>.json | 某次提交的原始笔记版本与 blob、路径、标题、内容 | 插件生成，Agent 按请求读取 |
| Data/ProjectionHashes/ | 检测 Items 人工改动，避免覆盖 | 插件管理 |
| Data/Tasks/ | 当前已接受阅读/实践任务 | 插件管理，通过 Plan 导入 |
| Data/TaskVersions/ | 已接受任务的历史版本 | 插件管理 |
| Data/Attempts/ | 用户明确导出的真实作答；可能含个人内容 | 插件生成，Agent 仅评估用户指定记录 |
| Data/Feedback/ | 已接受的 Agent 评价 | 插件保存；不自动覆盖已发生的评分 |
| Exchange/Requests/<id>/Request.json | 待整理的提交范围、来源 ID、上下文位置和身份 | 插件输出，Agent 从这里取任务 |
| Exchange/Requests/<id>/Request.md | 请求的简要说明 | 插件输出 |
| Exchange/Imports/<package_id>/Cards/*.md | 候选新卡/修订卡，包含来源和评分要点 | Agent 发布 |
| Exchange/Imports/<package_id>/Plan.json | 候选 reading/practice 任务 | Agent 发布 |
| Exchange/Imports/<package_id>/PolicyPatch.json | 预算和保持率等偏好建议 | Agent 提议，用户确认 |
| Exchange/Imports/<package_id>/Feedback/*.json | 关联真实 event/attempt 的评估 | Agent 发布，用户确认 |
| Exchange/Imports/<package_id>/Manifest.json | 包身份、各文件类型与精确 SHA-256 | 打包脚本生成 |
| Exchange/Imports/<package_id>/Ready.json | Manifest 的 SHA-256，最后写入表示发布完成 | 打包脚本生成，发布后不得改包 |
| Exchange/Receipts/<package_id>.json | 已接受 proposal_id，保证重复点击不重复入库 | 插件管理 |
| Exchange/Exports/export-*.json | 事实快照，Context 条目来自 Vault 根目录，恢复也写回根目录 | 插件生成，恢复不覆盖不同内容 |
## Agent 的事实边界
学习进度不是掌握程度，笔记最后修改时间不是答题时间。对推断标注“待验证”；只根据真实作答评估质量。保存用户手写内容，修改前完整阅读目标文档。来源陈旧、删除或修正时先核对，不使用旧请求虚构新证据。
操作系统用户数据目录中的 State.json、Writer.json、ReviewCache 和启动事务文件只供插件使用，不属于 Agent 任务输入，不随知识库同步。不要复制其他工具的日志、会话、数据库或密钥作为学习上下文。
