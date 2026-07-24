# 个人学习网站

## 技术方案

- 内容：Markdown
- 生成器：mdBook 0.5.4
- 托管：GitHub Pages
- 部署：GitHub Actions
- 仓库：`moxi-6/moxi-6.github.io`

## 目录结构

```text
.
├── .github/workflows/deploy.yml
├── book.toml
├── theme/
├── src/
│   ├── SUMMARY.md
│   ├── README.md
│   ├── ysyx/
│   ├── projects/
│   └── tools/
└── README.md
```

## 更新流程

```bash
git pull
# 修改 src 中的 Markdown 文件
git add .
git commit -m "更新学习记录"
git push
```

推送完成后，GitHub Actions 自动构建并发布网站。
