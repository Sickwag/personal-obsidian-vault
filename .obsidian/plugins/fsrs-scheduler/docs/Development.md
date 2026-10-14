# 开发记录
日期：2026-10-15。实现版本：0.1.0。设计基线：v0.2，已获用户批准开发。
开发根目录：`/mnt/windows-e/CodeFiles/learnAndDev/obsidian-FSRSScheduler`。
## 当前结果
已具备可构建、可打包、可在测试 Vault 试用的桌面插件。本轮不向真实知识库安装，也不提交真实笔记；实际 Git 写入测试全部使用临时仓库。
项目已初始化本地 Git，未创建项目提交和远端。依赖为项目局部安装，密钥/模型服务不属于插件实现。
## 实现与设计对应

| 设计项 | 实现入口 | 验证 |
| --- | --- | --- |
| 昨天有/无提交与干净/脏四格规则 | src/git/StartupSync.ts | Git.test.ts |
| 昨天 23:59:59 与真实捕获时间 | core/Time.ts、StartupSync.ts | Time.test.ts、Git.test.ts |
| 私有索引、CAS、恢复和 Hook 保护 | StartupSync.ts | Git.test.ts、GitMore.test.ts |
| 非单调日期增量、删除来源 | GitReader.ts | Git.test.ts、GitMore.test.ts |
| 真实作答、去重、撤销、隔离 | ReviewService.ts | Review.test.ts、ReviewEdges.test.ts |
| 时间预算、新卡、积压与公平排序 | Queue.ts | Review.test.ts、ReviewEdges.test.ts |
| 外部卡片、反馈、计划和策略 | Exchange.ts | Exchange.test.ts、ExchangeMore.test.ts |
| 上下文偏好与人工正文保护 | Context.ts | Context.test.ts |
| 单写入端、只读设备与接管 | Runtime.ts | Runtime.test.ts |
| Markdown 可读视图与手工修改保护 | Runtime.ts | Runtime.test.ts |
| 导出恢复与不覆盖 | Snapshot.ts | Snapshot.test.ts |
| 设备侧检查点和内容变化识别 | ReviewService.ts、Files.ts | Checkpoint.test.ts |
| 实际视图/弹窗交互 | Main.ts | Ui.test.ts，使用宿主替身 |
| 外部发布包工具 | scripts/PreparePackage.mjs | PackageCli.test.ts |

表中 core 等路径均位于 src。设计场景矩阵共 144 项是长期验收清单，不等于本轮已在真实宿主逐项验证。
## 自动化验证
在 Node.js v24.13.0、Git 2.43.0 的 Linux 环境运行：
- `npm run typecheck`：通过。
- `npm run lint`：Prettier 格式检查通过。
- `npm run test:coverage`：13 个文件，84 项测试通过。
- `npm run build`：通过，生成 main.js。
- npm 官方完整依赖审计：0 个已知漏洞。
覆盖率统计范围为 src/core、src/git、src/exchange；不把宿主适配层算进该数值：
- 语句：90.50%。
- 分支：85.96%。
- 函数：91.66%。
- 行：93.13%。
UI 的 4 项无界面交互测试包含实际插件视图与弹窗代码，宿主 API 由测试替身提供，不能替代真实 Obsidian 验收。
## 规模测试
脚本：`npm run benchmark -- 100000`。数据是独立临时目录中的合成数据，结束后只清理该目录。
当前一轮结果：

| 指标 | 结果 |
| --- | --- |
| 卡片数 | 10,000 |
| 事件数 | 100,000 |
| 首次冷恢复 | 13,741 ms |
| 有效检查点恢复 | 1,404 ms |
| 一次评分保存 | 570 ms |
| 生成今日队列 | 42 ms |
| 该合成测试进程 RSS | 约 834 MB |

这些是 Linux /tmp 文件系统数据，不是 Windows/NTFS 或真实 Obsidian 的性能保证。首次完整校验明显慢于检查点恢复；加速缓存可丢弃重建。
检查点会核对事件清单与文件指纹。完整校验命令绕过缓存，重新验证所有内容和事件链；哈希不提供对恶意本机篡改的身份认证。
## 重要工程处理
- 单条评分事件完整保存后才向 UI 返回成功；Markdown 视图或缓存失败不伪装成评分未保存。
- 外部包只有 Manifest/Ready 完整、身份/来源/版本验证通过后才可审阅。
- 外部评分只关联真实事件或明确导出的回答，最终确认由用户完成。
- 普通 Git Hook、引用 Hook 和 post-index-change Hook 有活动配置时暂停底层自动路径，不静默绕过。
- Git 日期不参与记忆事实推断；补提交按拓扑发现，避免回溯日期漏扫。
- 本机运行状态与检查点不进入 Vault，不会每次打开自我制造新 Git 变化。
- 依赖审计发现过 YAML 旧版漏洞，已升级并锁定 yaml 2.9.1；没有更改全局 npm registry。
## 当前限制与后续验收
1. 真实 Obsidian 桌面加载、Windows Git/索引发布、休眠与多窗口行为尚需手工验收。
2. Markdown 当前按完整变更文件登记，以标题导航；复杂章节切分由外部 Agent 处理。单文件上限 1 MB，超限会明确停止对应扫描，不隐瞒覆盖不足。
3. 主题依赖图、自动参数拟合、复杂跨 schema 迁移、移动端、远端 pull/push 尚未交付。
4. 支持最新评分撤销，不支持直接删除或重算同卡中间历史事件。
5. Items 的直接手改不会自动改变正式题库；通过外部修订包导入。重建命令检测到手改会保护原文。
6. 完整恢复到另一个已初始化身份时不会自动覆盖其 Data/Vault.json。迁移应保留原数据身份，或在空目录恢复。
7. 首版采用单写入端约束，不能提供跨设备离线分布式锁保证。
## 建议的首次人工验收
使用测试 Vault：
1. 新建 Git 仓库并正常做一次初始提交，安装 dist 中插件。
2. 修改一篇笔记但不提交，重新打开，核对补提交时间、父关系、正文真实捕获时间和干净索引。
3. 只有 workspace.json、cursor-positions.json 变化时确认不补提交。
4. 放入一个外部候选包，核对 Ready 前后、接受、重复接受和陈旧来源保护。
5. 完成一次自评、关闭再打开、撤销并核对历史。
6. 模拟已有暂存内容、活动 Hook、未知锁，确认只提示并保留用户工作。
7. 验证 Context 偏好写入保留人工正文，导出恢复保护同名不同内容。
## 0.1.1 工作区调整
- 默认工作区迁至 `.obsidian/customDocument/FSRSScheduler/`，Vault 根 `Context.md` 作为唯一活动上下文，偏好与侧栏读取均已适配。
- 首次启动生成 UseGuide、FileGuide、AgentProtocol，已有同名说明不覆盖。旧 LearningReview 数据复制迁移，身份最后发布，冲突拒绝，旧目录保留。
- 快照 Context 条目导出自 Vault 根目录，恢复回 Vault 根目录；历史快照同样按调用者路径映射，禁止覆盖不同内容。
- 新 Agent 请求标明 context_path_base、generated_root、source_file_base；扫描排除根 Context 与保留的旧目录。
- 验证：90 项测试通过，核心语句覆盖率 90.67%，类型、格式和构建检查通过。真实 Windows Obsidian 更新仍需人工验收。
## 0.1.2 旧目录探测修复
0.1.1 首次启动检查旧 LearningReview 时调用 Files.exists，其内部 path 会先 mkdir 根路径，因此仅检查也会生成空旧目录。改为先通过无写入的 lstat 检查旧根目录，再探测身份文件；同时拒绝旧根为符号链接。新增首次与再次打开均不创建旧目录、旧根符号链接拒绝两项回归测试。92 项测试、类型、格式与构建检查通过，核心语句覆盖率 90.75%。
