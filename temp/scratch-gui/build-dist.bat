@echo off
echo *****  生成dist  *****
echo *                    *
pause
set NODE_ENV=production
set BUILD_MODE=dist
npm run "build%1"
echo *****  生成完毕  *****
echo 准备复制必要文件
pause
cls
copy 30d09ba32a17082ef820b57d52d60b7b.hex dist\30d09ba32a17082ef820b57d52d60b7b.hex
echo *****  复制完毕  *****
pause