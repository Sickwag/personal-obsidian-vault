# 外部 Agent 协议
版本：schema 1。本文件描述已实现格式；更广的设计意图见 plan/ExternalAgent.md。
## 角色
Agent 在 Obsidian 外运行。插件不调用、启动或收费，不读取 Agent 的日志、会话、运行数据库或密钥。
Agent 可按用户授权修改笔记、Context、Topics、Digests；正式卡片修订通过 Imports，事件不能被直接改写。
## 读取请求
插件输出 Request.json，含 vault_id、repo_id、base_head、commits、commit_details 和 sources。sources 通过 source_file 指向 Data/Sources/<id>.json。
Source 包含 id、commit、blob、path、heading、text 和 deleted。deleted 或不再匹配当前 HEAD/工作区的来源不能激活卡片。
startup-sync 提交的 archive_date 是归档日，snapshot_captured_at 才是真实捕获时间。不得据此虚构昨天的学习或复习。
Vault 根目录 Context.md 的 frontmatter 是学习偏好，正文为人工与 Agent 的语义记录。不要删除人工补充；标明推断与覆盖范围。
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
接受前显示提案，用户确认后仅修改 Context frontmatter。不会补造复习，也不立即重排所有卡片。
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
默认工作区为 `.obsidian/customDocument/FSRSScheduler/`，根目录 Context.md 指 Vault 根目录。新请求的 context_path_base 为 vault，context_paths 相对于 Vault；source_file 始终相对于工作区。生成和接收包也均位于工作区，不要把来源笔记搬进这里。
