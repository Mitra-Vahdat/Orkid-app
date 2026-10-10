@echo off
cd /d "%~dp0"
where py >nul 2>nul
if %errorlevel%==0 (
  start "" "http://localhost:8765/index.html"
  py -m http.server 8765
  exit /b
)
where python >nul 2>nul
if %errorlevel%==0 (
  start "" "http://localhost:8765/index.html"
  python -m http.server 8765
  exit /b
)
echo Python was not found.
echo Install Python or run this folder through any local web server on port 8765.
pause
