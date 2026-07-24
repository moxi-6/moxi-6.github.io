# Moxi 个人网站 · mdBook 版

这一版保留当前网站的视觉效果：

- 蓝色双层顶部导航；
- 左侧当前栏目目录；
- 中间文章正文；
- 右侧本页目录；
- 明暗主题、标题搜索和手机侧栏；
- 所有正文由 Markdown 管理。

底层已经改为 mdBook，不需要 Python、pip 或虚拟环境。

## 本地预览

```bash
cd ~/moxi-6.github.io
mdbook serve --open
```

默认地址：

```text
http://localhost:3000
```

## 修改内容

正文全部位于：

```text
src/
```

常用目录：

```text
src/index.md                 首页
src/about/                   我与个人经历
src/ysyx/                    一生一芯
src/ysyx/e5/                 E5 笔记
src/development/             开发记录
src/tools/                   工具教程
src/essays/                  随笔
```

左侧导航和上一篇/下一篇顺序由下面的文件决定：

```text
src/SUMMARY.md
```

## 新增文章

示例：

```bash
python3 scripts/new_page.py e5 "组合逻辑学习笔记" combinational-logic
python3 scripts/new_page.py tools "Git 使用记录" git-notes
python3 scripts/new_page.py development "Verilog 开发记录" verilog-notes
python3 scripts/new_page.py essays "七月记录" 2026-07
```

脚本会创建 Markdown 文件并自动加入 `SUMMARY.md`。

## 发布

```bash
git add -A
git commit -m "Update website"
git push origin main
```

GitHub Actions 会运行 `mdbook build`，并发布 `book/` 目录。
