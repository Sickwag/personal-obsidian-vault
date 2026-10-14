# 开发与验收计划
版本：0.2。用户已批准按本计划开发；当前结果与差异见 [开发记录](../Development.md)。以下阶段保留为设计和验收基线。
## 开发位置
`/mnt/windows-e/CodeFiles/learnAndDev/obsidian-FSRSScheduler`。
实际 Vault 是用户的知识库；开发与自动化测试使用合成测试仓库和测试 Vault，真实宿主验收结果单独记录。
## 技术与依赖

| 组件 | 用途 | 影响 |
| --- | --- | --- |
| TypeScript | 插件与纯业务模块 | 开发依赖 |
| Obsidian API | 生命周期、页面、Vault 访问 | 类型开发依赖，宿主提供运行时 |
| ts-fsrs | 确定性记忆调度 | 固定版本打包 |
| esbuild | 构建 main.js | 开发工具 |
| Markdown/frontmatter 解析 | 章节事实、配置和外部内容 | 优先公开宿主能力，必要时选轻量包 |
| schema 校验 | 文件、事件和交接包 | 一种明确实现 |
| Vitest 或等价工具 | 调度、Git 和恢复测试 | 开发依赖 |
| 本机 Git | 读取历史、启动补提交 | 桌面运行要求 |

不引入 AI SDK、模型供应商适配器、向量库、API 服务、模型密钥管理或外部 Agent 启动器。
实现前核对 Node.js、包管理器、Git、Obsidian 与目标系统，说明必要缺失项。本轮不安装依赖。
目录非 Git 仓库时，开始开发后按用户约定检查 zsh init_repo；不自动创建提交或远端。
## 建议布局
```text
src/
    Main.ts
    domain/
        ReviewService.ts
        ReviewCard.ts
        ReviewEvent.ts
    scheduler/
        SchedulerAdapter.ts
        QueuePlanner.ts
        StudyClock.ts
    git/
        GitReader.ts
        StartupSyncService.ts
        CommitTransaction.ts
        ChangeCollector.ts
    exchange/
        RequestExporter.ts
        PackageImporter.ts
        SourceValidator.ts
    context/
        ContextReader.ts
    storage/
        EventStore.ts
        ContentStore.ts
        ProjectionStore.ts
        LocalJournal.ts
    presentation/
        ReviewView.ts
        ChangesView.ts
        ImportsView.ts
        SettingsView.ts
        ReminderService.ts
tests/
    unit/
    integration/
    fixtures/
```
按实际规模精简，不提前创建大量空壳。
## 阶段
### 环境与数据合同
确认桌面单写入端、现有 Obsidian Git 协作、补提交日期、暂存区例外、外部交接目录和人工确认策略。
验证 ts-fsrs 日期序列化与宿主生命周期；确定 schema、Git 执行适配器和本机写入范围。
退出：最小插件可在测试 Vault 加载；Git Hook/签名、私有索引与标准锁的行为有实验结论。
### 本地复习闭环
手工卡片、真实评分、FSRS、逐题保存、恢复、预算、暂停/稍后、提醒去重、撤销和导出。
退出：断网、缺席、双击、崩溃和保存失败的关键故事通过，完全不依赖外部 Agent。
### 启动 Git 自动化
实现四格检查、自然日计算、无变化不提交、全部非忽略变化快照、明确补提交正文。
实现身份/分支/冲突/暂存区检查、事务 journal、私有索引、ref 比较更新与真实索引恢复。
覆盖现有 Obsidian Git 竞争，不自动修改其设置，不执行 pull/push。
退出：新提交作者/提交者日期正确；真实捕获时间可追溯；每个中断点保留工作，不产生反向暂存差异。
### 内容发现与文档提醒
按 SHA 与祖先关系补扫，解析 first-parent merge 净差异，持久登记 ChangeBatch。
抽取 Markdown 章节与前后版本、生成目录排除、来源失效检测。
没有题目时提供来源阅读任务，已查看与记忆评分分开。
退出：回溯日期不漏扫，配置变更不造学习任务，来源身份可追溯。
### 外部 Agent 协作
实现公开 Request/Manifest/Ready/Receipt，Markdown 候选导入、source/base_revision 校验、批量接受与拒绝。
实现外部评分建议与实际 attempt 关联、规划提案确认、上下文只读展示。
退出：没有 Agent 时仍可工作；未完成包、陈旧包、重复包与恶意路径被正确处理；插件无模型网络调用。
### 长期使用与发布
积压模式、公平选题、临时目标、检查点、迁移、损坏隔离、跨设备分叉提示。
Windows/Linux 验收，10,000 卡与 100,000 事件规模测试。小范围试用两周后再扩大导入。
退出：相应场景通过，打包/格式/许可完整，已知限制明确。
## 验证
### 启动提交测试
- 四格决策覆盖，昨天是否有提交不改变 dirty 行为。
- 修改/新增/删除/模式变化/未跟踪/忽略文件正确。
- 普通日期、跨零点、学习日边界、时区和夏令时。
- 新父旧子时间、一天多次脏启动和无变化重启。
- staged、部分暂存、冲突、detached HEAD、分支不匹配、锁、身份缺失、Hook/签名。
- 在私有索引生成、commit-tree、ref 更新、真实索引发布各阶段注入退出。
- 另一 Git 客户端在预检后抢先提交，确认 CAS 不覆盖其引用。
- 恢复期间实际索引变化，必须进入对账而非 reset。
- 不需要真实远端或用户凭证。
### 调度与存储
固定 Clock、输入状态和参数验证适配器；覆盖 Ready 不逾期、假期不改时间、真实事件与外部建议分开。
验证幂等评分、最新评分撤销、损坏/缺失/分叉事件、缓存重建、导出恢复和版本迁移。
### 增量与交接
临时仓库覆盖合并、重命名、历史改写、浅历史、中文/空格/换行路径。
验证游标与 Agent 覆盖范围独立、补提交不按日期剪枝、原文版本与工作区区分。
导入样例包括完整/半成品/hash 错误/schema 错误/来源过期/无关 HEAD 变化/重复包/恶意路径/旧评级。
检查外部文档编辑不会被插件重写；插入“执行命令”正文不会被执行。
### 宿主
测试启动、焦点、跨日、热重载、弹出窗口、电脑休眠、禁用与重装。
真实库只在用户同意试用范围后接入。配置忽略规则的本轮验证已单独完成，不等于插件功能测试。
## 预期命令
项目脚本尚不存在，下列是开发时应建立的检查：
```text
npm run typecheck
npm run lint
npm run test
npm run build
```
## 试用指标
实际投入分钟、来源待整理量、候选接受原因、题目质量问题、逾期估计耗时、恢复成功率、提交事务失败原因与外部交接延迟。
仅采集本插件必要事实，不读取外部 Agent 会话、遥测、工具数据库或凭证。
## 待审阅
1. 每日预算、新卡上限与 04:00 学习日。
2. 暂存区非空时暂停自动补提交的默认例外。
3. 底层 commit-tree 路径的 Hook/签名约束是否符合仓库习惯。
4. LearningReview 目录、外部文件格式与导入确认方式。
5. 是否默认不持久保存完整用户回答。
6. 第一次绑定从当前 HEAD 开始，或先导入一个主题。
7. 外部 Plan 的手工任务与 FSRS 卡片是否分开显示。
已按用户要求确定不内置 AI，并纳入启动补提交规则，不再把模型端点或密钥作为开发前置条件。
