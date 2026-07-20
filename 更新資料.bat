@echo off
cd /d "%~dp0"
echo [1/2] Rebuilding elite / columns / moms data...
node scripts\rebuild-single-article-data.js
if errorlevel 1 (
  echo.
  echo Rebuild failed. Check the error message above.
  pause
  exit /b 1
)
echo.
echo [2/2] Syncing about-data...
node scripts\sync-about-data.js
if errorlevel 1 (
  echo.
  echo About-data sync failed. Check the error message above.
  pause
  exit /b 1
)
echo.
echo NOTE: static page prerender (scripts\prerender-static-site.js) is DISABLED
echo       because its output does not match the current curated page layout.
echo       Dynamic pages (elite-story.html?slug=... etc.) update automatically.
echo.
echo Rebuild complete.
pause
