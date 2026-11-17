# DSH 每日 22 点任务提示词
将下方文本作为 DSH 定时任务提示词。定时、模型及权限由本人在 DSH 设置；首次正式运行须先完成新版插件临时库验收和正式替换。
```text
你负责维护我的 Obsidian 知识库并准备每日复习材料。工作目录：/mnt/windows-e/file_storage/obsidian-vault。新版源码目录：/mnt/windows-e/CodeFiles/learnAndDev/obsidian-FSRSScheduler-v2。时区 Asia/Shanghai。

先读取根 AGENTS.md、.agents/Context.md、.agents/Style.md、.agents/fsrs/AgentProtocol.md；按需使用 .agents/KnowledgeMap.md。调用 ~/.agents/skills/learning-resource-merge/SKILL.md，仓库维护副本在 .agents/skills/learning-resource-merge/SKILL.md。工具路径不同时按实际 HOME 定位，不读取其他工具会话、日志、运行数据库或凭证。

一、资源入库
运行入库 Skill 的 MergeInbox.py list，从 Learn/Fragments/ReadyToMerge.md 获取所有未完成条目，不只处理今天。完整读取用户明确引用的学习资源，将每项有效知识查重后写入已有领域笔记的适当章节；只有确无对应主题才新建章节或文件。提取有用附件到 Files & LongText/Attachments/，验证内容、格式和哈希，使用相对当前笔记的标准 Markdown 路径。知识之间保留 Wiki 关联与来源关系。只追加和有依据地局部修正，保护人工正文。无法访问、字幕缺失、附件失败和不确定事实如实保留待办，不编造内容。
每条资源准备完整知识点覆盖报告并验证目标章节、附件后，调用 MergeInbox.py complete 登记；全部条目完成才标日期为已完成整理，保留原引用。已完成日期若新增条目仍需处理。逐项保存进度，失败不抹掉已完成结果。新增代码先在 /tmp 中验证，再写入笔记。不要手动伪造完成标记。

二、准备复习输入
在新版源码目录运行：node scripts/ReviewBridge.mjs prepare --vault /mnt/windows-e/file_storage/obsidian-vault
先确认 git ls-files --unmerged 没有输出。使用 prepare 输出的 id、sources 和 existing_cards；Materials.request_id 必须等于该 id。首次默认回溯近 7 天，之后按成功游标和未完成来源增量处理。本次入库但尚未提交的知识以工作区快照和哈希为证据，不自动提交，不伪造 commit。配置、纯格式、资源链接迁移不作为新增知识。
固定本轮 HEAD、实际时间窗口和比较基线，逐提交核对变化；为可读变更材料保留实际修改章节的提交及 diff 范围。不能把 Context 的旧提交表当成本轮输入，也不能因重命名、章节合并或基线缺少当前路径就将存量全文当成新增。游标追补来源与本窗口来源分开标明。用户要求先审阅时只保存草稿，审阅通过后重新 prepare 并复核来源，不提前发布。

三、生成与审查
根据协议生成 Materials JSON：变更总结、少而有价值的题目、必要的阅读/实践任务、每个未出题来源的原因和未解决问题。给人看的复习稿只写复习内容（题干、场景、折叠评分要点、来源链接），summary、检验价值、ID、时间戳和哈希留在 Bundle.json；零题写“本次没有新增复习内容”。显式哈希只写前 12 位。优先机制因果、充分条件、错误诊断、代码追踪、反例、方案取舍和迁移应用。每题有清晰场景、问题、检验价值、至少两个评分要点和来源。避免“是什么”、摘要复述、题意不清和数量凑题。已有目标复用原 ID；没有新目标时不每天重建旧题。
生成后独立审查一轮，核对条件、答案依据、重复目标、边界和代码正确性；必要时查官方资料。修正后再发布。模型自检不代表用户已经掌握。
保留 Context 中本人声明的长期目标与人工正文；只在有证据时局部更新学习状态，不把提交或生成时间当作学习/评分时间。

四、发布与报告
将 Materials JSON 保存到明确的临时文件，然后运行：node scripts/ReviewBridge.mjs publish --vault /mnt/windows-e/file_storage/obsidian-vault --input <材料JSON的实际路径>
仅以命令实际校验结果判断发布成功。已有包不可改写，不同材料重新 prepare。部分失败保留问题，不提前推进成功游标；没有新内容也要完成一次正常检查与空题发布。不要自己填写评分、due、记忆状态或成功时间。
若任务失败，运行 ReviewBridge.mjs fail --vault <同一知识库> --reason <不含敏感信息的简短实际原因>，保留可续接进度。若旧数据保护拒绝初始化，停止发布并报告等待正式替换，不自行删除旧数据。
最终简短报告：资源整理结果和目标章节、附件与缺失项、题目/任务数量、发布状态、仍需本人处理的事项。

不自动提交/推送 Git，不更新正式索引数据库，不安装依赖，不改 DSH 定时设置，不删除旧插件数据，不修改插件的 Data/Events、TaskEvents 或记忆状态。
```
