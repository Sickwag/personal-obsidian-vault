# Jenkins-CPP

## Jenkins 解决什么问题
一个人开发时"我本地能跑"就够了，团队协作后不同人的环境差异、忘记跑测试、未经 review 的代码合入主分支，这些问题靠约定管不住。Jenkins 提供一个**独立的、标准化的构建环境**，每次构建在干净的 workspace 中从远程仓库拉取代码、执行编译和测试，结果客观——爆了就是爆了。
代价是代码必须先 `` git push `` 到远程仓库，Jenkins 才能拉得到。这是理解 Jenkins 所有行为的第一条原则：workspace 不等于本地项目目录。
CI（持续集成）确保每次代码变更都经过编译和测试验证；CD（持续交付/部署）在 CI 通过后自动将产物部署或打 Release 包。

## 核心设计
### 工作区与构建节点
`` workspace/ `` 是 Jenkins 的专属工作目录，每次构建从 SCM 拉取代码。SCM 配置告诉 Jenkins 去哪里拉代码（Git URL + 凭据）。忽略 SCM 就需要在 build step 中手动指定本地路径。`agent any` 表示 Jenkins 可以在任意可用节点运行，节点之间 workspace 彼此隔离。
### 触发机制
三种触发方式：**手动触发**（UI 点击 Build Now）、**定时/轮询**（cron 表达式）、**Webhook 触发**（远程仓库主动推送事件）。Webhook 是自动化的关键——push/PR 时仓库发 HTTP 请求到 Jenkins 的特定 URL。这要求 Jenkins URL 能被仓库服务器访问，本地开发需用 ngrok 等内网穿透工具。
### 流水线即代码
Jenkinsfile 存入 Git 仓库随代码版本管理，构建流程可审查可回滚。Declarative 语法（`pipeline { agent ... stages { ... } }`）结构固定适合标准流程；Scripted 语法（`node { stage(...) { ... } }`）基于 Groovy 更灵活。Declarative 需要安装 `pipeline-model-definition` 插件。
Pipeline 模式下，Jenkinsfile 中的 `triggers` 块会覆盖 UI 中的触发配置。配置文件在 `` ~/.jenkins/jobs/<job-name>/config.xml ``，可用 Read 工具直接查看。

## Jenkins 安装与 Job 类型
### 安装
Jenkins 以 Java war 包运行，`~/.jenkins/` 是所有配置的根目录，插件在 `` ~/.jenkins/plugins/ `` 下。`config.xml` 是全局配置，每个 Job 有自己的 `` jobs/<job-name>/config.xml ``。
### Freestyle Project
通过 UI 配置所有构建步骤，适合简单场景。核心配置区域：
- **General** — 描述、参数化构建、并发控制、自定义 workspace。Discard old builds 控制构建产物保留策略。
- **源码管理（SCM）** — 选 Git 后填仓库 URL、凭据、分支。选"无"需在构建步骤中手动指定源码路径。
- **Triggers** — 定时构建、Poll SCM、远程触发、Webhook 触发（需对应插件）。
- **Build Steps** — CMake Build 插件或 Execute shell。CMake Build 字段：Generator（Linux 选 Unix Makefiles 或 Ninja）、源码目录、构建目录（`workingDir`）、构建类型（Release/Debug）、Clean build（每次清空重配）、其他 CMake 参数（如 `-DCMAKE_TOOLCHAIN_FILE`）。CMake Build 插件不识别 CMakePresets。添加构建工具步骤自动执行 `cmake --build`。
- **构建后操作** — Archive the artifacts 归档产物、Publish JUnit test result report 展示测试结果（需 JUnit Plugin）。
### Pipeline Job
Jenkinsfile 控制完整流程。新建时选 Pipeline，在 Pipeline 区域选 `Pipeline script from SCM` → Git → 填仓库 URL、凭据、`*/master`、Script Path（`Jenkinsfile`）。

## SCM 配置与凭据
### 凭据管理
添加 SSH 凭据：Manage Jenkins → Credentials → Global → Add Credentials → 选择 `SSH Username with private key`，**Username 填 `git`**（SSH 协议固定用户），Private Key 选 Enter directly 粘贴私钥内容（`~/.ssh/id_ed25519`）。Repository URL 用 SSH 格式（`git@gitee.com:user/repo.git`）而非 HTTPS，否则会走密码认证与 SSH Key 不匹配。
### Gitee 插件集成
安装 Gitee Plugin 后，Manage Jenkins → System → Gitee 配置中添加 Gitee 链接（URL 填 `https://gitee.com`），在 API Token 中添加 Gitee 个人访问令牌。然后进入 Job 配置 → 勾选 Gitee webhook 触发，确认仓库所有者/仓库名。

## 构建流水线设计
标准 C++ 项目 CI 流水线：Configure → Build → Test。配置阶段用 CMakePresets 统一构建参数，但 `CMakePresets.json` 必须纳入 Git 管理，否则 Jenkins 拉不到。Build 阶段执行编译。Test 阶段运行 ctest，配合 `--gtest_output=xml` 生成 JUnit 格式报告供 Jenkins 解析展示。
Post 阶段 `archiveArtifacts` 将产物保存到构建记录中可从 UI 下载，`fingerprint: true` 记录文件 MD5 用于跨构建追踪。
Tag 触发的 Package 阶段打包发布包：使用 `git tag --points-at HEAD` 检测当前 commit 是否有版本标签（比 `when { tag 'v*' }` 更通用，后者仅 Multibranch Pipeline 支持）。

## 代码质量门禁
Git 只存代码不验证质量，`git push` 永远成功。阻止坏代码进主分支需要保护分支 + PR 工作流：
1. 在 Gitee 中将 master 设为保护分支，移除开发者直接 push 权限
2. 所有变更通过 PR 提交，功能分支开发
3. CI 在 PR 上运行，结果通过 Gitee Plugin 写回 PR 页面
4. 保护分支规则要求 CI 通过才能合并
Gitee 的保护分支设置中，"可推送代码成员"控制谁能直接 push，"要求门禁成功才能合并"在 PR 层面拦截。两者同时配置才能做到：你可以自由 push 功能分支，但坏代码无法合入主分支。

## Gitee Webhook 配置
配置步骤：Gitee 仓库 → 管理 → WebHooks → 添加 webhook。目标 URL 为 Jenkins 的 `http://host:port/gitee-project/<job-name>`，事件勾选 Push、Pull Request、Tag Push。使用 ngrok 暴露本地 Jenkins：`ngrok http 8081`，Gitee 填写 ngrok 提供的公网 URL。ngrok 免费版每次重启 URL 会变，需要更新 webhook 配置。

## 合作流程规范
为他人仓库贡献：Fork 上游仓库 → Clone 本地 + 添加 upstream → 创建功能分支 → 修改并 push 到自己的 fork → 提 PR → 等待 CI + review。核心纪律：不直接 push 主分支、一个 PR 只做一件事、标题写明类型（feat/fix/docs/refactor）、PR 控制在 300 行以内。

## 常见问题
**Jenkins 找不到本地文件** — workspace 独立于项目目录，文件必须 commit + push 到远程仓库。
**Webhook 收不到** — 本地无公网 IP，用 ngrok 暴露端口。
**SSH 认证失败** — URL 必须用 SSH 格式（`git@`）匹配 SSH Key 凭据，HTTPS URL 需要用户名+密码。
**Pipeline 语法不兼容** — `triggerOnPR` 参数名取决于插件版本，可在 UI 配置 trigger 时 Jenkinsfile 不写 triggers 块避免冲突。`when { tag 'v*' }` 仅 Multibranch Pipeline 支持。`giteeNotify` 非所有插件版本内置的 DSL 方法。
**JUnit 报告找不到** — GTest 的 `--gtest_output=xml:test_results/` 相对于工作目录生成，`junit` 步骤中的路径必须精确匹配实际输出位置。
**Freestyle CMake Build 插件 vs CMakePresets** — 插件使用传统 cmake 配置方式不读取 presets。如果使用 CMakePresets，建议切换到 Pipeline 模式用 `cmake --preset` 命令。
