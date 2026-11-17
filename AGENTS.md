# Obsidian 知识库协作指南
本仓库由本人和 AI Agent 共同编写、维护，供 Obsidian 使用。正文包含双向链接、反向链接、章节/块引用、笔记嵌入、Callout 和插件功能；编辑时保留这些语义。附件兼容性采用标准 Markdown 相对路径。
## 必须读取的说明
- 写入知识前完整读取 [.agents/Style.md](.agents/Style.md)。涉及学习、复习和跨笔记整理时同时读取 [.agents/Context.md](.agents/Context.md)。
- 用 [.agents/KnowledgeMap.md](.agents/KnowledgeMap.md) 定位主题和文件；它保留完整文件地图，实际路径和正文优先。
- 整理 AI 问答、博客、视频、其他笔记等学习资源时，读取 [.agents/skills/learning-resource-merge/SKILL.md](.agents/skills/learning-resource-merge/SKILL.md)。共享安装入口为 `~/.agents/skills/learning-resource-merge/SKILL.md`。
- 求职面试协作分两类：新面试邀约按 JD 生成针对性准备，读 [.agents/skills/interview-prep-from-jd/SKILL.md](.agents/skills/interview-prep-from-jd/SKILL.md)；零散面试题合并进面试题合集，读 [.agents/skills/interview-question-merge/SKILL.md](.agents/skills/interview-question-merge/SKILL.md)。
- 复习协作先读 [.agents/fsrs/UseGuide.md](.agents/fsrs/UseGuide.md)、[文件说明](.agents/fsrs/FileGuide.md) 和 [Agent 协议](.agents/fsrs/AgentProtocol.md)。历史资料不覆盖当前规则。
- 这些是必须打开的依赖文档；Markdown 链接不代表工具会自动加载正文。当前用户指令优先。
## 知识定位与编辑
1. 提取 2–3 个关键词，分别用只读 notes-index lookup 搜索；索引可能陈旧，候选须核对正文，并用 rg 补齐。
2. 优先补充已有章节；无对应章节则在已有领域笔记新增；无领域文件才在对应学科目录新建。
3. 编辑前完整读取目标笔记及紧邻引用；大文件可分段完整读取。用户限定章节时尊重该范围。保留本人段落、措辞、结构和无关改动，只做追加及有依据的局部修正。
4. 原始资料保留来源；逐项覆盖知识点，标明错误、重复与暂缓原因，不编造缺失附件或学习事实。
5. 笔记关联使用 `[[笔记#章节]]`，同名文件增加库内路径消歧。附件使用 `![说明](相对路径)` 或 `[说明](相对路径)`；不把笔记/块嵌入误改成图片链接。
## 目录与数据边界
- `Learn/` 按既有学科组织；算法目录实际为 `Learn/Algorithm/`。`Article/`、`Chores/`、`Daily/` 保留既有职责。
- `Files & LongText/Attachments/` 为统一附件目录；不覆盖已有附件，不擅自移动或重命名知识笔记。
- `.agents/` 保存协作说明、Skill 维护版本及必要的验证工具。根目录只保留 AGENTS.md 作为协作入口。
- `.obsidian/` 是 Obsidian 配置、插件和运行数据；仅修改任务相关设置，不因整理笔记顺手改变插件或主题。
- `.obsidian/notes-index/` 保留索引脚本和生成数据库。FSRS 事实位于 `.obsidian/customDocument/FSRSScheduler/`，正式评分和记忆状态由插件管理。
- `.trash/`、备份、其他工具私有缓存、凭证、会话和遥测不纳入普通检索；不全库扫描敏感隐藏目录。
## 只读检索与验收
```sh
python3 .obsidian/notes-index/notes_index.py lookup "关键词"
python3 .obsidian/notes-index/notes_index.py lookup '协程|线程' --regex
python3 .obsidian/notes-index/notes_index.py check "相对路径.md"
```
- 索引只覆盖前三层标题；更深章节用正文检索。路径陈旧或缺少描述不代表不存在相关知识。
- `update`、`desc` 会写数据库，必须有用户单独授权；写入笔记和自检不会自动授予索引更新权限。
- 普通文档不需要全库构建。检查局部 diff、标题、章节链接、附件实际目标与 `git diff --check`；代码示例按任务要求编译验证。
## Git、安全和配置
- 修改前查看 git status，保护已有修改和暂存内容，只暂存本任务文件。提交、推送需明确授权，按当前任务约定的审阅阶段和范围执行。
- 配置修改前备份到 `/mnt/windows-e/file_storage/configuration/backups/`，报告确切位置。
- 不执行强制推送、破坏性重置或无关清理。安装新版 FSRS 和删除旧数据须等待用户的临时库验收。
- 不伪造掌握程度、学习日期、真实评分或 Git 证据；机器检查、模型自检与真实 Obsidian 验收分开报告。
