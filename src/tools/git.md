# Git 与 GitHub

## 日常更新网站

```bash
cd ~/moxi-6.github.io
git pull

# 修改内容后
git status
git add .
git commit -m "更新网站内容"
git push origin main
```

## 查看提交

```bash
git log --oneline --decorate -10
```

## 撤销尚未提交的单个文件修改

```bash
git restore 文件名
```
