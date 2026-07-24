# 赵开山的个人学习网站

这是为 `moxi-6.github.io` 准备的 mdBook 网站源码。

## 本地预览

安装 mdBook：

```bash
cargo install mdbook --version 0.5.4 --locked
```

在仓库根目录运行：

```bash
mdbook serve --open
```

## 更新内容

1. 在 `src/` 中修改或新增 Markdown 文件；
2. 在 `src/SUMMARY.md` 中添加目录链接；
3. 提交并推送到 `main`；
4. GitHub Actions 自动构建并发布。

```bash
git add .
git commit -m "更新学习记录"
git push origin main
```

## 首次发布设置

进入仓库：`Settings → Pages → Build and deployment → Source`，选择 **GitHub Actions**。
