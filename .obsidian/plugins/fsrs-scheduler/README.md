# FSRS Scheduler
面向 Obsidian 的桌面插件：启动时保存 Git 快照，按已有题目和文档提醒复习，使用 FSRS 记录真实回忆，与外部 Agent 通过文件协作。插件没有模型客户端、API Key 或 AI 网络请求。
当前版本：0.1.1，初始可试用版本。开发根目录：`/mnt/windows-e/CodeFiles/learnAndDev/obsidian-FSRSScheduler`。
## 已实现
- 每次启动检查仓库；非忽略内容相对 HEAD 有变化时，创建作者/提交者日期均为昨天 23:59:59 的本地补提交，正文保存真实捕获时间。
- 暂存区、冲突、未知锁、分支不符、活动 Hook 或签名要求存在时暂停自动提交，不代替用户处理。
- 私有索引、分支比较更新、设备侧事务 journal，支持更新分支后中断恢复；不自动拉取或推送。
- 按 SHA 与拓扑遍历 Git 增量；登记完整 Markdown 文件及标题导航，生成外部整理请求。
- 无题目时按来源提醒阅读；已查看不会计成成功回忆。
- 手动建卡、四档自评、真实时间调度、撤销最新评分、暂停/归档/来源核查、阅读事实与可中断会话。
- 时间预算、新卡配额、积压限流、等待最久任务避让，支持外部明确日期的阅读/实践计划。
- Manifest/Ready/Receipt 文件交换；支持候选题、版本修订、Plan、PolicyPatch、实际复习反馈。
- Context.md 语义内容只读；偏好修改仅更新 frontmatter，保留人工正文。
- 公开事件与内容版本、可读 Items Markdown、完整性校验、损坏/分叉隔离、设备侧加速检查点。
- 导出与补齐式恢复快照，保护已有不同内容；主写入设备保护。
## 安装试用
先使用测试 Vault 验证启动补提交行为，再接入长期知识库。尚未在真实 Obsidian 桌面窗口和 Windows 文件系统完成手工验收；自动化验证使用 Linux 临时仓库及无界面宿主替身。
1. 使用 `dist/fsrs-scheduler/` 中的 `main.js`、`manifest.json`、`styles.css`。
2. 将文件放入测试 Vault 的 `.obsidian/plugins/fsrs-scheduler/`。也可解压同目录发布 ZIP。
3. 在 Obsidian 中启用社区插件 FSRS Scheduler。
4. 设置 Git 可执行程序、绑定分支和学习来源目录，确认复习预算。
5. 点击侧栏脑形图标或执行“打开复习与外部成果”命令。
插件默认启用已约定的启动补提交。自动提交只捕获磁盘已保存内容，不能恢复每个修改的真实日期。现有 Obsidian Git 与本插件若同时启动自动提交，建议只保留一个触发方；本插件不会修改另一个插件的设置。
存在预先暂存的内容时，补提交按“保护暂存区”规则暂停；请先完成普通提交。
## 日常使用
打开时先恢复本地记录与检查 Git。干净仓库不创建空提交；有普通变化则补保存当前快照，随后登记新的学习来源。
无题目时打开来源阅读，并在需要时交给外部 Agent 总结出题。已有题目直接独立回忆，查看答案后按真实表现评分。Hard 表示困难但答对，忘记了应使用 Again。
漏几天后只保留每卡一个当前到期项，不补写缺席期间的作答。假期可在设置关闭提醒或暂停卡片，真实时间仍继续经过。
“已受提示，仅记阅读”不更新记忆状态。导出回答会按明确操作把回答保存在本地交接目录，默认评分不保存全文。
Items 是可读视图，手工修改不会被重建命令覆盖。修订通过外部导入包进入正式内容；不要直接修改 Data/Events。
## 外部 Agent
见 [AgentProtocol.md](docs/AgentProtocol.md)。插件只生成事实清单和读取成果，用户自行在 Obsidian 外启动 Agent。
典型流程：
1. Agent 读取 `.obsidian/customDocument/FSRSScheduler/Exchange/Requests/<request_id>/Request.json`、相关 source 文件及 Context.md。
2. Agent 在其授权范围内维护笔记与上下文，并写 `Exchange/Imports/<package_id>/`。
3. 在项目根运行：
```sh
node scripts/PreparePackage.mjs /绝对路径/Request.json /绝对路径/Exchange/Imports/package-id
```
4. 在成果收件箱校验、审阅并确认。不会因为目录出现就自动接受，Ready 发布前忽略半成品。
## 数据与设备
可同步事实位于 `.obsidian/customDocument/FSRSScheduler/`；Git 扫描游标、提醒去重、写入设备 ID、补提交 journal 和检查点位于操作系统用户数据目录下的 `obsidian-fsrs-scheduler/<vault-path-hash>/`。
插件禁用后 Markdown 与 JSON 数据仍保留。主写入设备变化前先同步，在设置中显式切换。首版不支持两个设备离线同时评分；出现事件分叉会隔离相关卡片。
快照导出默认不包含 Data/Attempts 中的自由文本回答、设备状态或缓存。恢复只补齐缺失文件，不覆盖同名不同内容。迁移完整知识库时优先复制整个复习工作区及根 Context.md；跨身份恢复需要先在空目录恢复事实，不能覆盖已经初始化的另一个 Vault 身份。
## 开发
需要 Node.js 22+ 和本机 Git，Obsidian 最低版本声明为 1.5.0。依赖精确版本由 package-lock.json 固定。
```sh
npm ci
npm run check
npm run package
npm run benchmark -- 100000
```
`npm run check` 包含类型、格式、测试覆盖率和构建。`lint` 当前为 Prettier 格式检查，类型安全由严格 TypeScript 检查。
所有 Git 集成测试只创建临时仓库。测试不会提交真实笔记，不需要远端或凭证。
## 当前边界
- 首版读取完整变更 Markdown 文件，以首个标题导航；精细章节切分与同主题语义归并由外部 Agent 完成。
- 外部修订基于相关源 blob 校验；文件其他位置改动也可能触发保守核查，插件不判断语义等价。
- 补提交底层接口不会自动运行普通提交 Hook；检测到活动提交/引用 Hook 或签名要求时阻止自动路径。
- 最新评分可撤销；同卡历史中间事件的任意重算尚未提供。
- 暂停/预算和卡片优先级已实现，主题级依赖图、自动参数拟合、远端同步和移动端留待后续。
- 数据 schema 高于当前版本时拒绝写入；复杂跨版本迁移尚无真实历史数据可验收。
- 检查点通过文件清单和大小/时间指纹识别变化；“完整校验复习事件”命令绕过缓存重新核对内容。首次冷恢复与大快照操作可能较慢。
- 禁用/卸载不清除数据。历史中的数据删除和远端副本清理需要单独处理。
完整设计基线见 [docs/plan/README.md](docs/plan/README.md)，实际验证及限制见 [docs/Development.md](docs/Development.md)。

## 0.1.1 路径调整
默认工作区改为 `.obsidian/customDocument/FSRSScheduler/`，Context.md 位于知识库根目录。旧默认设置自动升级，旧目录保留，冲突时停止迁移。首次启动生成 UseGuide.md、FileGuide.md、AgentProtocol.md，具体操作见 [使用指南](docs/UseGuide.md)。隐藏目录使用文件系统读写，根 Context 偏好修改使用 Obsidian 的文档接口。
