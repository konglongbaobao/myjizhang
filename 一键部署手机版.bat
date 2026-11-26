@echo off
chcp 65001 >nul
title 记账本手机版 · 一键部署到 GitHub Pages
cd /d "%~dp0"

echo ============================================
echo   记账本手机版 - GitHub Pages 一键部署
echo ============================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo [错误] 未检测到 Node.js。
  echo 请先到 https://nodejs.org/ 下载并安装 LTS 版本（安装时全部默认下一步即可），
  echo 安装完成后重新双击本文件。
  echo.
  pause
  exit /b 1
)

echo 已预填仓库：konglongbaobao / myjizhang
echo 接下来只需粘贴 GitHub 令牌（Fine-grained Token）。
echo 令牌获取路径见同目录《手机版使用说明.md》。
echo.

node deploy-gh-pages.js

echo.
echo 部署脚本已执行完毕。若上方显示部署完成，请到仓库 Settings - Pages 启用站点。
echo.
pause
