@echo off  
setlocal enabledelayedexpansion  
  
set "sourceDir=dist"  
set "destDir=dist\chunks"  
  
if not exist "!destDir!" mkdir "!destDir!"  
  
for %%F in ("!sourceDir!\vendors*") do (  
    move "%%F" "!destDir!\"  
)  
for %%F in ("!sourceDir!\addon*") do (  
    move "%%F" "!destDir!\"  
) 
  
cd dist
rename "extension worker.js" "extension-worker.js"
rename "extension worker.js.map" "extension-worker.js.map"
cd ../

echo 文件移动完成。  