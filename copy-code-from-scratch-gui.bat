@echo off
echo ���ڸ���...
xcopy ..\scratch-gui\dist node_modules\scratch-gui\dist /s /e /h /y
xcopy ..\scratch-gui\dist\chunks static\scratch-gui-chunks /s /e /h /y
echo ������ϣ�
