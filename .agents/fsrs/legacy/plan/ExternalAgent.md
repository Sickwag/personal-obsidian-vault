# 外部 Agent 协作协议
## 责任边界

| 工作 | 插件 | 外部 Agent |
| --- | --- | --- |
| Git 启动检查、补提交、增量遍历 | 执行确定性协议 | 可读取事实 |
| 总结、知识归并、问题与参考答案 | 不生成 | 根据 Git 与文档生成 |
| 当前目标、语义进度和长期上下文 | 读取与展示 | 按用户指令维护 |
| FSRS 与预算队列 | 确定性计算 | 可以提出参数或优先级建议 |
| 复习质量分析 | 保存真实记录与反馈引用 | 分析用户回答，给出建议 |
| 笔记修改与文档维护 | 不改笔记正文 | 在外部工具授权范围内修改 |
| 导入校验与确认 | schema、版本、来源、幂等 | 提供完整结果和依据 |
| 模型服务、密钥、费用与外部命令 | 完全不管理 | 由用户与外部工具管理 |

用户可以只用人工编辑 Markdown，不依赖任何特定 Agent 产品或协议服务器。首版无需 MCP、HTTP 服务、外部进程或常驻服务。
## 文件布局
以下均是未来 Vault 中的建议路径：
```text
LearningReview/
    Context.md
    Topics/
    Digests/
    Items/
    Exchange/
        Requests/<request_id>/
            Request.json
            Request.md
        Imports/<package_id>/
            Manifest.json
            Cards/
            Feedback/
            PolicyPatch.json
            Ready.json
        Receipts/<package_id>.json
    Data/
        Content/
        Events/
        Sources/
```
目录可配置。Requests 只包含确定性事实、问题清单与索引；不要求插件把全库内容复制一遍。
Requests 和 Receipts 仅在有新任务或导入状态变化时写入，不在每次启动改 last_open。可同步的交接文件与设备侧轮询/处理游标分别保存。
## 交接请求
Request.json 至少包含 request_id、schema_version、vault_id、repo_id、base_head、source_ids、相关文件路径/版本、真实生成时间、请求类型和覆盖范围。
Request.md 是给人和外部 Agent 阅读的说明，明确目标、允许输出、事实与推断分界。模板内容为固定说明，不是插件生成的语义学习总结。
任务类型可以是 summarize_changes、generate_cards、validate_sources、review_feedback、plan_revision、context_maintenance。
插件创建这些任务仅代表需要用户在外部处理，不自动运行 Agent。UI 可复制任务路径或打开文件，不自动执行其中的任何命令。
## 外部结果发布
1. Agent 或用户在外部工具中按已有授权读取请求、Git、相关文档与复习记录。
2. 如需修改原始笔记、Context/Topics/Digests，在外部工具中完成；插件只检测并读取新版本。
3. 结构化候选、反馈和规划建议写入一个新的包目录。
4. 最后写 Ready.json，包含 Manifest 的 hash，作为包完成信号。
5. 插件发现 Ready 后才校验，不能因为目录存在就读取半写入结果。
6. 用户在插件中审阅差异并选择接受、部分接受、拒绝或要求刷新。
7. 内容与事件保存后生成回执；重复读取同一包返回同一处理结果。
Manifest 列出每个文件的相对路径、内容 hash、类型、外部来源标记、创建时间、请求关联和来源版本。用随机 package_id 避免时间排序冲突。
Ready 是完成约定，不是信任签名。插件仍需校验文件完整性；用户授权和明确确认决定其能否生效。
## 候选卡 Markdown 示例
```markdown
---
schema_version: 1
document_kind: review_card_proposal
proposal_id: proposal_et_example
unit_id: unit_et_example
base_revision_id: null
source_ids:
    - source_et_example
estimated_seconds: 90
---

# 检验目标
解释非阻塞 socket 使用 ET 时持续读取至 EAGAIN 的原因。
## 问题
为什么 ET 事件处理中通常需要持续读取到 EAGAIN？
## 评分要点
- 说明触发语义与仍有未读数据的关系。
- 说明当前无法继续读取的退出条件。
- 区分对端关闭、可重试错误与其他错误。
## 适用边界
Linux epoll，非阻塞 socket。
## 来源
source_et_example；附章节定位与可验证短引文。
## 不确定性
明确写需要核实的前提；没有则注明暂无。
```
plugin 不信任 Markdown 中自带的 due_at、memory_state 或任意脚本。上述是候选内容，经校验和确认后再创建不可变内容版本。
## 版本与来源校验
- vault_id、repo_id 必须匹配当前绑定；路径限定在配置目录，拒绝向上跳转和跨根符号链接。
- package_id、proposal_id、request_id 和关联卡片必须合法且可追踪。
- Manifest 与 Ready、每个文件 hash 必须一致。
- 源引用属于请求或明确允许的源集合，短引文确实存在。
- base_head 不必等于当前 HEAD，但必须可追踪，并且相关章节/blob 版本未发生不兼容变化。
- 若 HEAD 只新增了无关插件设置或交接文件，不应让全部候选无条件作废。
- 相关原文被 Agent 先修改时，声明预期工作区内容 hash；可导入为待确认，但在对应新版本得到稳定来源标识前不激活。
- 已有卡片修订必须声明 base_revision_id；存在新版本时进入冲突审阅。
- 数量、文件大小、字段长度、代码围栏与必填 rubric 有上限与校验。
插件不进行“语义等价”的自动裁决。外部声明和用户确认一起形成修订管理事件，评分历史保留旧版本。
## 复习质量评估
支持两条路径：
- 用户在插件中回忆并自评；之后外部 Agent 阅读已保存记录，分析薄弱点和改进建议。
- 用户实际回答后在外部工具中得到评价，通过 Feedback 包导入评级建议，由用户确认。
Feedback 必须关联 card_id、content_revision_id、真实 attempt_id 或有效 ReviewEvent，说明依据、是否受提示和建议评级。
对尚未记分的真实作答，保存真实发生时间，并在确认时校验没有后来评分或内容变化；导入时间不能冒充回忆发生时间。异常时仅导入评论，用户重新测试。
已经评分的事件收到外部不同建议时，默认追加分析说明；如需改评级，遵循撤销最新有效评分与替代事件的规则，不能改写历史文件。
只有一句“掌握良好”、一个评分百分比或 Agent 自行虚构的回答记录，不足以创建 FSRS 事件。
用户默认不保存完整回答时，可在外部提供必要内容；外部工具如何保留数据由其设置和用户授权决定，插件不管理这部分。
## 规划建议
外部 Agent 可以维护 CurrentPlan.md，也可提交结构化 PolicyPatch，建议：
- 主题优先级、暂时目标、结束日期；
- 每日预算、新卡上限、主题暂停；
- 复习策略和目标保持率；
- 需要补学的前置知识、练习建议。
PolicyPatch 声明 based_on_policy_revision、建议变更与原因。插件预览并经用户确认后保存新的策略版本。
确定性 FSRS 的下一次 due 仍由真实作答计算。外部手工日期作为 execution_hint 或明确的管理重排提案，不能当作真实复习，也不覆盖 last_review。
首版默认只让新策略影响未来选择和后续调度。批量改 due 需独立预览、管理事件和可回退能力，未实现前明确不支持。
## 显式任务清单
外部 Plan 可包含 task_id、task_type、source_ids/路径、due_at、timezone、estimated_seconds、completion_criterion 和计划版本。
reading/practice 任务按明示日期提醒，完成后记录相应事实；card 任务只引用已有 card_id，不能携带未经确认的记忆状态。
CurrentPlan.md 自由正文用于展示；需要执行的任务使用明确 frontmatter 或包内 Plan.json。日期带时区、ID 稳定，修改已有任务需声明 base_revision。
用户确认后可按这些文档任务直接提醒，即使还没有任何检验题也能使用。手工任务到期与 FSRS 记忆到期分组，避免双重权威。
## 外部维护文档
Context/Topics/Digests 的语义内容全部由用户或外部 Agent 维护；插件只读。外部编辑应保留人工声明区，标注推断、来源和覆盖范围。
Agent 可直接编辑原始笔记，但不能直接改 Data/Events、已发布 Content 或缓存来伪造状态。修订通过 Imports 或手动导入完成。
用户在外部工具中明确授权的操作由该工具负责；本插件不会反过来限制外部 Agent 的通用能力，也不将其操作默认归为插件行为。
## 失败与长期不使用 Agent
未发布、hash 不符、schema 错误、来源过期和冲突包进入收件箱错误区，可修订后用新版本重发，保留处理回执。
长期没有外部 Agent 时，已有卡片与手动题库继续工作；新变化显示待整理任务，不生成空题或失败。
插件升级后不能悄悄重写旧包。更新 schema 需要兼容映射或明确提示。
