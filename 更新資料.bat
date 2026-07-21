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
echo [2/2] Re-rendering static pages (optional)...
node scripts\prerender-static-site.js
if errorlevel 1 (
  echo.
  echo NOTE: prerender-static-site.js is out of date and was skipped.
  echo       Pages render from assets\data\*.js in the browser, so the
  echo       site is already up to date after step 1.
)
echo.
echo Rebuild complete.
pause
