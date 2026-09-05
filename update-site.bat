@echo off
setlocal
cd /d "%~dp0"

echo.
echo ===========================================================
echo    Updating googoodan site
echo ===========================================================
echo.

where node >nul 2>nul
if errorlevel 1 goto :nonode

set "GIT=git"
where git >nul 2>nul
if errorlevel 1 (
  for /d %%D in ("%LOCALAPPDATA%\GitHubDesktop\app-*") do set "GIT=%%D\resources\app\git\cmd\git.exe"
)

echo [1/4] Scanning work folder...
node build-structure.js
if errorlevel 1 goto :fail

echo [2/4] Staging changes...
"%GIT%" rm --cached -q --ignore-unmatch init-git.bat init-git.ps1 >nul 2>nul
"%GIT%" add -A

echo [3/4] Committing...
"%GIT%" commit -m "update site"

echo [4/4] Pushing to GitHub...
"%GIT%" push origin main
if errorlevel 1 goto :pushfail

echo.
echo ===========================================================
echo    DONE. The site will refresh in about 1 minute.
echo ===========================================================
echo.
pause
exit /b 0

:nonode
echo    ERROR: Node.js not found.
echo    Install the LTS version from https://nodejs.org/ and run this again.
echo.
pause
exit /b 1

:pushfail
echo.
echo    Push failed. Open GitHub Desktop and click "Push origin" instead.
echo.
pause
exit /b 1

:fail
echo.
echo    Build failed - structure.json was not created.
echo.
pause
exit /b 1
