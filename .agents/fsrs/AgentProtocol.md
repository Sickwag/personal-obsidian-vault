# DSH 与 FSRS 文件协议
版本：2。当前实现 1.0.0；旧协议仅保存在 legacy 中，不自动迁移旧事实。
## 执行顺序
1. DSH 读取仓库说明，调用共享 learning-resource-merge Skill 处理 ReadyToMerge 未完成条目。
2. 在新版源码目录运行 `node scripts/ReviewBridge.mjs prepare --vault <vault>`，获得完整请求。默认首次回溯近 7 天，后续使用成功游标。
3. 根据请求 sources 和 existing_cards 生成并审查 Materials JSON，保存到明确的临时文件。
4. 运行 `node scripts/ReviewBridge.mjs publish --vault <vault> --input <JSON>`，校验后发布；异常使用 fail 记录安全的失败原因。
5. 插件刷新后读取完整包，自动展示新题。插件只在用户真实评分时更新记忆。
prepare、publish、fail 可以在 Obsidian 关闭时运行；不以插件先启动为前提。桥仅调用只读 Git 和确定性的 Python 收件检查脚本，绝不运行模型或提交。
## 提交证据与审阅
- 调用桥接命令前确认 `git ls-files --unmerged` 为空；有冲突时停止生成，不把冲突标记或任意一侧正文当作学习变化。
- 固定 HEAD、窗口起止和比较基线。首次或明确重建采用连续近 7 天，按实际提交者时间筛选，并分别保留作者时间；归档日期、补提交日期不证明实际学习时间。
- 逐提交核对知识增量。重命名、章节合并、纯格式、附件路径和引用迁移不等于新增知识；本来已经存在的内容不得因当前路径在基线中缺失而整篇重新出题。
- 可读 Changes 文档须给出实际修改章节的提交、路径、完整标题层级和 diff 范围。Source 的 commit 标识来源快照，不应假称它首次写下了整段内容；额外审计证据独立保存，不向 Materials 填入协议未支持字段。
- Context 中的历史声明和旧提交表不是本次来源。游标追补超出本窗口时单独标注；未提交入库来源明确为 workspace，不混称最近提交所得。
- 用户要求先审阅时，仅写独立草稿及证据，不发布、不推进游标、不产生正式评分；通过后重新 prepare、绑定真实 id 并复核来源哈希。
## 来源与请求
工作区为 `.obsidian/customDocument/FSRSScheduler/`。`Requests/<id>.json` 包含 schema_version、id、vault_id、created_at、base_head、head、sources、existing_cards、receipt_ids。
Source 包含 id、path、section、hash、text、before、kind；kind 为 git 或 workspace，只有 git 来源带 commit。章节身份包含完整标题层级和重复标题序号，围栏内的伪标题不参与分段。
来源 ID 是 `SHA256(path + NUL + section + NUL + hash)`；hash 针对规范换行后的章节文本。发布与作答前检查当前对应章节的哈希；同文件其他章节变化不应使本章节失效。
默认学习来源为 Learn 和 Chores/JobInterviews，排除收件记录、配置、维护说明、生成复习材料和备份。资源路径转换及行尾空白变化不单独生成新知识。来源未提交时必须标 workspace，不虚构 commit。
本次入库的完成收据会引入相关目标文件的工作区快照。收据处理与 Git 游标只在全部成功后推进；部分失败保留重试。
## Materials
```json
{
  "schema_version": 2,
  "request_id": "prepare 返回的 id",
  "summary": "变更机制和知识关系，不声称掌握",
  "questions": [{
    "id": "稳定知识目标 ID",
    "objective": "独立检验目标",
    "scenario": "自洽的场景与充分条件",
    "question": "需要推导、诊断或迁移的问题",
    "kind": "diagnosis",
    "why": "检验价值",
    "rubric": ["第一个评分要点", "第二个评分要点"],
    "source_ids": ["请求中实际存在的来源 ID"],
    "estimated_seconds": 90,
    "priority": 0.5
  }],
  "tasks": [],
  "skipped": [{"source_id": "其他来源 ID", "reason": "没有独立检验价值的依据"}],
  "issues": []
}
```
- kind 支持 causality、diagnosis、trace、tradeoff、counterexample、application。至少两个评分要点，必须有实际来源、场景和检验价值。
- 每个来源须出现在题目、任务或 skipped 中。允许零题；不要为了数量生成“是什么”问答，不照搬摘要，不把模型自检当学术正确性的保证。
- 同一知识目标复用已有卡片 ID。只更新来源等元数据且问题/目标/评分要点相同的修订可以保留记忆；实质修改须由用户确认等价保留或重新学习。
- tasks 为独立行动：id、title、kind（reading/practice）、due_at（明确时区）、source_ids、estimated_seconds。不同日期的不同任务使用不同 ID；完成任务不更新 FSRS。
- 不允许题目字段指定 due_at、rating、memory_state 或可执行命令。自由回答和其他工具历史不属于默认输入。
## 完整发布与重试
先写不可变 Bundle.json 和归档 Review.md，最后写 Ready.json，Ready 含 Bundle 精确字节的 SHA-256。插件忽略没有 Ready 的半成品，校验身份和哈希后导入。
归档 Review.md 是给人看的，只含复习内容（题干、场景、折叠评分要点、来源链接）。summary、why、目标 ID、时间戳和哈希一律留在 Bundle.json，不写进人类文档；零题发布时写明“本次没有新增复习内容”。显式哈希只写前 12 位。
同请求重复发布只能使用相同材料；中断可补齐 Ready 和游标，不能改写已发布包。不同材料必须重新 prepare 获得新请求。跨请求复用知识目标 ID，避免重复建卡。
Bridge/State.json 分别保存 last_attempt_at、last_success_at、last_content_updated_at、cursor、receipt_ids、status 和 issues。资源仍有待办时发布 partial，不推进成功游标；没有变化的成功运行只更新成功时间。
## 事实边界
Agent 可以写知识正文、资源收据、Requests、Bundles、变更材料和桥接状态。插件管理正式内容、真实评分、任务完成、导入收据和记忆状态。
原始笔记、手工修改的材料和旧评分不因重复生成被覆盖。时间区分资料时间、捕获时间、生成时间和真实评分时间。禁止为漏复习补造事件。
