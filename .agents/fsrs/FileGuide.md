# 文件用途与所有权
## 维护说明
- `.agents/Context.md`：目标、路径与建议偏好；保留人工正文，不凭提交推断掌握程度。
- `.agents/Style.md` 与 `KnowledgeMap.md`：写入规范和主题入口。
- `.agents/fsrs/`：当前使用指南、文件协议及 DSH 提示词；legacy 只供历史核查。
- `.agents/skills/learning-resource-merge/`：入库 Skill 的维护版本；`~/.agents/skills/learning-resource-merge/` 为共享安装版本。
- `.agents/merge/Receipts/`：每条学习资源整理收据，记录知识覆盖、目标和附件哈希，不是复习评分。
- `Learn/Fragments/ReadyToMerge.md`：本人按天放置的资源引用与完成状态，处理后保留来源。
## 插件工作区
以下路径相对于 `.obsidian/customDocument/FSRSScheduler/`：

| 路径 | 用途 | 写入方 |
| --- | --- | --- |
| Identity.json | 新版库身份，schema 2 | 初始化程序 |
| Requests/*.json | 固定 Git 范围、章节快照、已有目标 | 外部桥接命令 |
| Bundles/<id>/Bundle.json、Ready.json | 不可变语义材料和完整发布标记 | 外部桥接命令 |
| Bridge/State.json | 成功游标、运行状态与两种更新时间 | 外部桥接命令 |
| Data/Content/*.json | 正式题目内容版本 | 插件 |
| Data/Events/*.json | 真实创建、评分、撤销、阅读等事件 | 插件 |
| Receipts/*.json | 已导入包记录 | 插件 |
| Revisions/*.json、RevisionReceipts/*.json | 待确认修订及实际接受结果 | 插件 |
| Tasks/*.json、TaskEvents/*.json | 阅读/实践任务和真实完成记录 | 插件 |
| Publish.lock、Data/Events.lock | 本地并发写入保护，不是学习事实 | 执行中的程序 |

`Chores/reviewDocs/YYYY-MM-DD/<run-id>/Review.md` 保存可读归档，每次发布使用独立目录，不覆盖手写日计划。
旧 `Data/Vault.json` 存在时新版拒绝自动初始化；这是正式替换前的数据保护。正式旧数据清理、单库旧缓存核对和安装仅在临时库验收后执行，不改写 Git 历史，不动其他库数据。
