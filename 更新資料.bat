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
echo [2/2] Re-rendering static pages...
node scripts\prerender-static-site.js
if errorlevel 1 (
  echo.
  echo Prerender failed. Check the error message above.
  pause
  exit /b 1
)
echo.
echo Rebuild complete.
pause
