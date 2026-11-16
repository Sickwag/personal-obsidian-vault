> 当前为旧版历史说明。旧插件已停用；新版协议将在临时库验收前更新，本文件中的 Codex 自动化与补提交流程不再执行。

# 外部 Agent 协议
版本：schema 1。本文件描述已实现格式；更广的设计意图见 plan/ExternalAgent.md。
## 角色
Agent 通常在 Obsidian 外运行。插件默认不调用 AI，也不包含模型 API 客户端；仅当用户在设置中明确启用限定数据分享后，插件才可在后台启动本机 Codex CLI。插件不读取 Codex 的日志、会话文件、运行数据库或密钥。
Agent 可按用户授权修改笔记、Context、Topics、Digests；正式卡片修订通过 Imports，事件不能被直接改写。
### Codex 自动化的数据边界
分享开关保存在本机。0.2.0 固定使用 `gpt-6-luna / max`，以 `codex exec` 进行两轮出题与审题。输入范围为 Request 指定的当前章节来源（旧完整来源可派生章节）、同文件父级和邻接章节、根 Context、本文，以及已有卡片的目标、题目、状态、到期时间、复习次数和用户提交的题目质量反馈；不输入自由文本作答或 CLI 历史记录。
自动任务处理所有未完成来源，失败最多自动尝试 3 次，也可手动重试。复习时间与题量由用户决定。参考预算不得成为拒绝继续复习的依据。
模型只返回符合 `src/agent/Materials.ts` 所定义 JSON Schema 的内容：summary、exercises、skipped。题目必须包含 objective、kind、scenario、question、rubric、why、misconceptions、source_ids、estimated_seconds、quality_review。允许空题目列表；不允许为凑数生成定义问答或照搬笔记摘要。第二轮检查推理需求、充分条件、重复目标与答案依据。
插件校验结构与来源，生成 Manifest/Ready 并发布草稿；同一检验目标保留稳定卡片 ID。正式接受、修订和真实评分继续遵守下文协议。CLI 以只读工具沙箱运行，其最终结构化回复由宿主接收；插件负责归档，模型不直接改写笔记或事实目录。
## 读取请求
插件输出 Request.json，含 vault_id、repo_id、base_head、commits、commit_details 和 sources。sources 通过 source_file 指向 Data/Sources/<id>.json。
Source 包含 id、commit、blob、path、heading、text 和 deleted；新来源额外记录 section（key、行号、hash、before、kind）。章节来源按当前 HEAD 与工作区对应章节哈希校验，旧完整来源仍按文件 blob 校验。deleted 或不再匹配的来源不能激活卡片。
startup-sync 提交的 archive_date 是归档日，snapshot_captured_at 才是真实捕获时间。不得据此虚构昨天的学习或复习。
Vault `.agents/Context.md` 的 frontmatter 是学习偏好，正文为人工与 Agent 的语义记录。不要删除人工补充；标明推断与覆盖范围。
## 发布文件
```text
Exchange/Imports/package-id/
    Cards/Card.md
    Plan.json
    PolicyPatch.json
    Feedback/Feedback.json
    Manifest.json
    Ready.json
```
按需要选择内容，至少一个文件，不要求所有类型都有。单文件最多 1 MB、每包最多 100 个文件、总内容最多 5 MB。路径不得包含绝对路径、反斜线、冒号、空段、点段或符号链接。
先写内容，再写 Manifest，最后写 Ready。推荐使用 scripts/PreparePackage.mjs 生成哈希；该脚本只打包文件，不运行模型。
## 候选卡
```markdown
---
schema_version: 1
proposal_id: unique-proposal-id
source_ids:
    - source-id-from-request
estimated_seconds: 90
priority: 0.5
---
# 检验目标
一个独立、明确的回忆目标。
## 问题
可独立回答的问题，不提前透露答案。
## 评分要点
- 第一项。
- 第二项。
```
已有卡片修订增加 card_id 和 base_revision_id。默认接受修订会重新学习；只有用户确认等价时才保留原记忆状态。
插件通过 source_ids 验证完整来源版本，不自动验证学术真实性。没有出处的手动题目可使用空列表，但需要用户明确审阅。
## Plan
```json
{
    "proposal_id": "plan-example",
    "tasks": [
        {
            "task_id": "read-et",
            "task_type": "reading",
            "title": "重新阅读 ET 边界",
            "due_at": "2026-10-16T20:00:00+08:00",
            "estimated_seconds": 180,
            "source_ids": []
        }
    ]
}
```
task_type 支持 reading、practice；due_at 必须明确时区。更新已有任务增加 base_revisions，映射 task_id 到此前任务 revision。阅读任务完成不更新 FSRS。
## PolicyPatch
```json
{
    "proposal_id": "policy-example",
    "based_on_policy_revision": "current-policy-hash",
    "changes": {
        "budget_minutes": 10,
        "new_card_limit": 3,
        "timezone": "Asia/Shanghai",
        "study_start": 4,
        "retention": 0.9
    }
}
```
策略 revision 是对规范 JSON 策略对象的 SHA-256。对象字段顺序按键排序，默认策略为 budget_minutes、new_card_limit、retention、study_start、timezone。可从插件实际读取结果计算，或优先在设置页修改。
预算和新卡数字仅作为参考，0.2.0 的自由复习不按这些值截断。接受前显示提案，用户确认后仅修改 Context frontmatter。不会补造复习，也不立即重排所有卡片。
## Feedback
对已经发生的复习：
```json
{
    "proposal_id": "feedback-example",
    "event_id": "actual-grade-event-id",
    "card_id": "actual-card-id",
    "content_revision_id": "actual-revision-id",
    "comment": "说明实际回答中的正确点和薄弱点。",
    "suggested_rating": 3
}
```
保存反馈不自动改变已有评分。纠正最新评级可以先撤销，再按真实表现评分；不任意改写中间事件。
待评估回答由用户在问题弹窗中明确导出，保存在 Data/Attempts/<attempt_id>.json。Feedback 使用 attempt_id 替代 event_id，关联 card_id/content_revision_id；用户在收件箱明确确认后，插件才按真实作答时间评分。
已显示答案的导出记录标记受提示，不能经外部反馈变成独立回忆。没有真实事件或导出回答记录的评分不被接受。
## Manifest 与 Ready
```json
{
    "schema_version": 1,
    "package_id": "package-id",
    "vault_id": "from-request",
    "repo_id": "from-request",
    "files": [
        {
            "path": "Cards/Card.md",
            "kind": "card",
            "sha256": "sha256-of-exact-file-bytes"
        }
    ]
}
```
kind 支持 card、plan、policy、feedback。Ready.json 为 {"manifest_sha256":"Manifest.json 精确文件字节的 SHA-256"}。换行也参与文件哈希。
同一个已发布 package_id 的内容不能修改；重发用新 package_id。重复确认具有幂等性，Receipt 列出已接受 proposal_id。
不要在包中放 due_at/memory_state 来冒充卡片记忆状态，不要放可执行命令。插件只把这些文件当数据。

## 工作区路径
默认工作区为 `.obsidian/customDocument/FSRSScheduler/`，`.agents/Context.md` 指 Vault 根目录。新请求的 context_path_base 为 vault，context_paths 相对于 Vault；source_file 始终相对于工作区。生成和接收包也均位于工作区，不要把来源笔记搬进这里。
