@echo off
cd /d "%~dp0"
echo [1/4] Rebuilding elite / columns / moms data...
node scripts\rebuild-single-article-data.js
if errorlevel 1 (
  echo.
  echo Rebuild failed. Check the error message above.
  pause
  exit /b 1
)
echo.
echo [2/4] Syncing about-data...
node scripts\sync-about-data.js
if errorlevel 1 (
  echo.
  echo About-data sync failed. Check the error message above.
  pause
  exit /b 1
)
echo.
echo [3/4] SEO prerender (讓 Google / AI 讀得到內文)...
if not exist "node_modules\jsdom" (
  echo   第一次執行，安裝必要工具 jsdom...
  call npm install
)
node scripts\prerender-seo.js
if errorlevel 1 (
  echo.
  echo Prerender failed. Check the error message above.
  pause
  exit /b 1
)
echo.
echo [4/4] Building sitemap.xml / robots.txt...
node scripts\build-sitemap.js
if errorlevel 1 (
  echo.
  echo Sitemap build failed. Check the error message above.
  pause
  exit /b 1
)
echo.
echo NOTE: 舊版 scripts\prerender-static-site.js 已停用；SEO 由 prerender-seo.js 接手。
echo       換網域時：改 site.config.json 的 origin，再執行本檔即可全站更新。
echo.
echo Rebuild complete.
pause
