@echo off
setlocal
cd /d "%~dp0"

set "GIT=git"
where git >nul 2>nul
if errorlevel 1 (
  for /d %%D in ("%LOCALAPPDATA%\GitHubDesktop\app-*") do set "GIT=%%D\resources\app\git\cmd\git.exe"
)

echo.
echo [1/6] git init
"%GIT%" init
if errorlevel 1 goto :fail

echo [2/6] set user config
"%GIT%" config user.name "googoodan-ohy"
"%GIT%" config user.email "ohy0973@gmail.com"

echo [3/6] add files
"%GIT%" add .

echo [4/6] first commit
"%GIT%" commit -m "first commit" -m "Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"

echo [5/6] rename branch to main
"%GIT%" branch -M main

echo [6/6] add remote
"%GIT%" remote add origin https://github.com/googoodan-ohy/googoodan.git

echo.
echo ==========================================================
echo    DONE - local repository is ready.
echo    Now open GitHub Desktop and click "Publish branch".
echo ==========================================================
echo.
pause
exit /b 0

:fail
echo.
echo    ERROR: git not found. Is GitHub Desktop installed?
echo.
pause
exit /b 1
