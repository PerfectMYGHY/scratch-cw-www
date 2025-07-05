@echo off
echo 正在复制...
xcopy ..\scratch-gui\dist node_modules\scratch-gui\dist /s /e /h /y
xcopy ..\scratch-gui\dist\chunks static\scratch-gui-chunks /s /e /h /y
echo 复制完毕！
