import os

DIR = "www"
dirs = os.listdir(DIR)
for i, d in enumerate(dirs):
	print("处理文件夹",os.path.join(DIR,d),f"({round((i+1)/len(dirs)*100,2)}%)")
	files = os.listdir(os.path.join(DIR,d))
	for idx, file in enumerate(files):
		if not file.startswith("zh"):
			os.remove(os.path.join(DIR,d,file))
			print("删除文件",os.path.join(DIR,d,file),f"({round((idx+1)/len(files)*100,2)}%)")
print("执行完毕")