Set-Location -LiteralPath $PSScriptRoot
git init
git config user.name "googoodan-ohy"
git config user.email "ohy0973@gmail.com"
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/googoodan-ohy/googoodan.git
Write-Host "DONE - open GitHub Desktop and click Publish branch."
