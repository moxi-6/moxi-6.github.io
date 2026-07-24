# Codex：在 Linux 中使用

<div class="page-meta">工具获取 · Linux 已实践</div>

Codex 可以在终端中读取项目、修改文件、运行命令并解释代码。核心原则是：在正确的项目目录启动，并始终审查它准备执行的操作。

## 安装与登录

常用安装方式：

```bash
npm install -g @openai/codex
codex
```

也可以使用官方当前提供的安装入口。登录时优先选择 **Sign in with ChatGPT**，不要把 API Key 粘贴到聊天、截图或公开仓库中。

## 信任目录提示

第一次在目录中启动时，Codex 可能询问：

```text
You are in /home/xl
Do you trust the contents of this directory?
```

自己的项目目录、内容已经检查过，可以继续；下载的陌生仓库、压缩包或包含未知配置的目录，应先退出并检查文件。

## 推荐工作流

```bash
cd ~/moxi-6.github.io
git status
codex
```

完成修改后：

```bash
git diff
```

确认本地预览正常，再提交和推送。

## 网站修改提示词结构

```text
目标：重构个人学习网站。
必须保留：一生一芯学习进度与随笔模块。
新增：工具获取、个人经历、E5 笔记。
视觉：左侧分类导航、清晰层级、移动端适配。
限制：不要删除已有文章；不要自动推送。
验收：本地可打开、链接无 404、git diff 清晰。
```
