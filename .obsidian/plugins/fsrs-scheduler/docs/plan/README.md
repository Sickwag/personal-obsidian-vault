# Obsidian FSRSScheduler 设计方案
版本：0.2。日期：2026-10-15。状态：v0.2 已获用户批准并进入开发；当前 0.1.0 验证状态见 [开发记录](../Development.md)。
后续开发根目录：`/mnt/windows-e/CodeFiles/learnAndDev/obsidian-FSRSScheduler`。
方案目录：`docs/plan`。本目录保留设计基线，实际实现、验证结果和暂未覆盖项见 ../Development.md；测试只使用独立临时仓库。
## 本轮确定的职责
插件负责确定性操作：每次启动检查 Git、按约定创建本地补提交、登记内容变化、读取现有文档、提醒复习、记录真实作答、执行 FSRS 和预算队列、交换结构化数据。
外部 Agent 负责语义工作：总结变化、出题、评估复习质量、调整学习规划、修改笔记、维护上下文和其他学习文档。插件不内置模型客户端、API Key、云端请求、模型选择或费用管理，也不启动外部 Agent 进程。
外部 Agent 在 Obsidian 外运行，由用户选择和授权。插件通过开放的 Markdown/JSON 文件提供事实清单并接收结果；用户可直接维护文档，不被特定 Agent 工具绑定。
## 启动补提交
每次打开 Obsidian，先恢复本地状态，再运行启动 Git 检查；补提交完成后，扫描新的固定 HEAD。
昨天按配置时区的自然日计算，独立于默认 04:00 的复习学习日。

| 昨天有提交 | 当前相对 HEAD 有非忽略内容变化 | 启动行为 |
| --- | --- | --- |
| 是 | 否 | 不创建提交 |
| 是 | 是 | 创建补提交，时间为昨天 23:59:59 |
| 否 | 否 | 不创建提交，不补空提交 |
| 否 | 是 | 创建补提交，时间为昨天 23:59:59 |

提交信息明确写明“为了保证仓库同步的 Git 补提交”，保存真实捕获时间与逻辑归档日期。仅创建本地提交，不自动 pull/push。
补提交是当前磁盘内容快照，可能包含今天的修改；它无法证明这些内容昨天就存在。复习状态始终使用真实作答时间。完整协议与异常见 [StartupGit.md](StartupGit.md)。
## 阅读路线

| 文档 | 重点 |
| --- | --- |
| [ProductDesign.md](ProductDesign.md) | 用户路径、复习界面、外部 Agent 分工 |
| [StartupGit.md](StartupGit.md) | 四种启动情况、时间、提交事务、并发、恢复 |
| [GitAiPipeline.md](GitAiPipeline.md) | Git 补扫、事实清单、向外部 Agent 交接 |
| [ExternalAgent.md](ExternalAgent.md) | 文件契约、结果导入、评分建议和规划提案 |
| [SchedulerDesign.md](SchedulerDesign.md) | 漏复习、预算、暂停、外部规划与 FSRS 边界 |
| [ContextDesign.md](ContextDesign.md) | Agent 维护的上下文、学习进度和只读消费规则 |
| [DataArchitecture.md](DataArchitecture.md) | 存储、接口、持久化、恢复与写入边界 |
| [ScenarioMatrix.md](ScenarioMatrix.md) | 日常与故障场景 |
| [ImplementationPlan.md](ImplementationPlan.md) | 分阶段开发与验收 |

## 已确定的边界
- 每次启动执行 Git 检查，不以昨天已经有提交为理由跳过脏工作区。
- 干净工作区不创建空提交；只有忽略文件变化也视为无需提交。
- 插件不维护 AI 服务配置，不执行模型返回的命令，不主动连接或唤醒 Agent。
- 外部 Agent 可以在其已有授权范围修改笔记与学习文档；插件本身只消费原笔记。
- 无题目或 Agent 尚未处理时，仍能按变更清单提醒阅读相关章节，但不能虚构评分、题目或已掌握状态。
- 日历归档时间、真实捕获时间、学习进度声明、实际复习时间分别保存。
- 昨天有提交仅是历史事实；它不代表昨天完成复习，也不证明存在语义学习。
## 建议默认值与待审阅项

| ID | 建议或已确定方案 | 状态 |
| --- | --- | --- |
| D01 | 桌面单写入端，手机后续支持 | 建议 |
| D02 | 从当前 HEAD 建立增量基线，旧主题逐步导入 | 建议 |
| D03 | 外部题目导入后先确认，再首次检验 | 建议 |
| D04 | 外部 Agent 给评分建议，用户确认后更新调度 | 按新分工修订 |
| D05 | 每日 10 分钟，首次检验新卡最多 3 张，积压时限流 | 建议 |
| D06 | 缺席不记失败，按实际作答调度 | 保留 |
| D07 | 假期暂停提醒，真实间隔继续经过 | 保留 |
| D08 | 插件不改笔记正文；外部 Agent 按用户授权维护 | 已按要求修订 |
| D09 | 完全移除内置 AI、模型端点与密钥 | 已按要求确定 |
| D10 | 复习事实入 Vault，本机运行状态与缓存不入 Git | 建议 |
| D11 | 学习目标与评分标准稳定，综合任务独立记录 | 保留 |
| D12 | 已获用户批准开始开发，实际交付状态见开发记录 | 已批准 |
| D13 | 每次启动按四格规则补提交，作者/提交者时间均为昨天 23:59:59 | 按用户要求 |
| D14 | Asia/Shanghai 自然日，学习日默认 04:00 | 建议 |
| D15 | 冲突、预存暂存内容、签名/Hook 不兼容时暂停补提交并说明 | 可靠性例外，待审阅 |
| D16 | 新增补提交不重写父提交，不自动推送 | 保留范围 |

## Git 忽略策略
实际知识库保留 .obsidian 插件、data.json 设置、主题、快捷键、启用列表和手动保存的 workspaces.json。
忽略当前工作区 workspace.json、移动端/变体工作区、cursor-positions.json、笔记索引数据库及其伴随文件和明确缓存目录。
已跟踪的 index.db 已从 Git 索引移除，本地继续使用。其取消跟踪需要随用户下一次提交记录，现有历史不被清理。
.gitignore 不支持忽略单个 JSON 字段。设置与临时状态混存在同一 data.json 时，首版保留该文件同步，不能通过全局忽略所有插件 data.json 来消除噪声。
## 不变量
1. 无真实作答就无回忆成功/失败事件，Git 日期不冒充学习日期。
2. 每卡只有一个当前记忆状态，不补做每个漏掉的历史检查点。
3. 到期、推迟提醒、执行预算和外部规划分别建模。
4. 评分先保存后确认，缓存可重建。
5. 外部结果经 schema、来源、版本和用户确认后生效。
6. 稳定 ID 独立于路径、内容哈希和时间。
7. Git 自动提交仅追加历史；有竞争或不完整状态时停止写入并保留工作。
8. 启动检查产生的本机游标/日志不进入自动提交范围，避免每次打开自我制造脏状态。
## 资料依据
产品阈值与队列权重是待实测的设计值。
- [Obsidian 官方 API](https://github.com/obsidianmd/obsidian-api/blob/master/obsidian.d.ts)。
- [Obsidian 移动端约束](https://docs.obsidian.md/oo/plugin)。
- [ts-fsrs](https://github.com/open-spaced-repetition/ts-fsrs)。
- [FSRS 接口](https://open-spaced-repetition.github.io/ts-fsrs/classes/FSRS.html)。
- [FSRS 评分语义](https://docs.ankiweb.net/manual/deck-options)。
- [Git 忽略规则](https://git-scm.com/docs/gitignore)。
- [Git commit-tree 与时间字段](https://git-scm.com/docs/git-commit-tree)。
- [Git update-ref 比较并更新](https://git-scm.com/docs/git-update-ref)。
- [Git diff](https://git-scm.com/docs/git-diff)。
- [间隔学习研究](https://pubmed.ncbi.nlm.nih.gov/19076480/)。
- [主动回忆研究](https://pubmed.ncbi.nlm.nih.gov/16507066/)。
