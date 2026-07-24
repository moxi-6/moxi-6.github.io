# 内容维护指南

## 日常更新

```bash
cd ~/moxi-6.github.io
mdbook serve --open
```

然后编辑 `src/` 中的 Markdown 文件。保存后，mdBook 会自动重新构建页面。

## Markdown 结构

每篇文章保留一个一级标题：

```markdown
# 文章标题

这里是摘要。

## 第一部分

正文。

### 小节

更多内容。
```

右侧目录会自动读取 `##`、`###` 和 `####` 标题。

## 导航维护

`src/SUMMARY.md` 是网站目录的唯一数据源：

- 顶部栏目保持固定；
- 左侧栏目树根据 `SUMMARY.md` 自动生成；
- 上一篇和下一篇根据 `SUMMARY.md` 自动生成；
- 搜索标题也根据 `SUMMARY.md` 自动生成。

手动新增页面时，需要在 `SUMMARY.md` 中补一行：

```markdown
  - [文章标题](tools/example.md)
```

也可以使用自动脚本：

```bash
python3 scripts/new_page.py tools "文章标题" example
```

## 界面文件

```text
theme/index.hbs          页面结构
theme/css/general.css    全站样式
theme/book.js            导航、目录、搜索和主题交互
```

正常增加文章时不需要修改这些文件。
