# 网站构建

<div class="page-meta">mdBook · GitHub Pages · Markdown</div>

这个网站使用 mdBook 构建，正文保存在 `src/` 目录的 Markdown 文件中，导航由 `src/SUMMARY.md` 生成。

## 为什么这样设计

旧版本直接维护多个 HTML 页面，新增文章时需要同时修改导航、页面和搜索内容。现在每篇文章都是独立的 Markdown 文件，更适合长期更新。

## 当前结构

```text
src/
├── about/        我
├── ysyx/         一生一芯
├── development/  开发
├── tools/        工具
├── essays/       随笔
└── SUMMARY.md    网站导航
```

## 新增文章

例如新增一篇开发文章：

```bash
python3 scripts/new_page.py development "文章标题" article-slug
```

脚本会创建 Markdown 文件，并自动把文章加入导航。

## 本地预览

```bash
mdbook serve --open
```

## 发布

推送到 GitHub 的 `main` 分支后，GitHub Actions 会自动构建并发布网站。
