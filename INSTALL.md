# 替换现有仓库的方法

建议先备份现有仓库，然后在本地执行：

```bash
cd ~/moxi-6.github.io

git pull
mkdir -p ../moxi-site-backup
cp -a . ../moxi-site-backup/

# 将本压缩包解压后的全部文件复制到当前仓库
cp -a /你的解压目录/moxi-mdbook-site/. .

git add .
git commit -m "改造为 mdBook 学习网站"
git push origin main
```

然后进入 GitHub 仓库：

`Settings → Pages → Build and deployment → Source → GitHub Actions`

最后进入 `Actions` 查看 `Deploy mdBook to GitHub Pages` 是否出现绿色对号。
