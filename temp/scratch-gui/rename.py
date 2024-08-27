import os  
import re  
  
# 定义目标目录  
target_dir = 'dist'  
  
# 排除的目录名  
excluded_dir = 'chunks'  

print("开始重命名(去除Hash以保证引入成功)...")
  
# 匹配文件名的正则表达式  
# 注意：这里假设 'abc.def' 部分不包含连续的 '.'  
file_pattern = re.compile(r'^(.*?)\.([^.]*?)\.js(\.LICENSE\.txt)?$')  
  
# 遍历目标目录中的所有文件和子目录  
for root, dirs, files in os.walk(target_dir):  
    # 排除 'chunks' 目录  
    if excluded_dir in dirs:  
        dirs.remove(excluded_dir)  
      
    # 遍历文件  
    for file in files:  
        # 检查文件名是否匹配给定的模式
        match = file_pattern.match(file)  
        if match:  
            # 获取匹配的组  
            prefix, suffix, license = match.groups()  
              
            # 构造新的文件名  
            new_file = f"{prefix}.js"
            if license:  
                new_file += license  
              
            # 获取旧文件的完整路径  
            old_file_path = os.path.join(root, file)  
              
            # 构造新文件的完整路径  
            new_file_path = os.path.join(root, new_file)  
              
            # 重命名文件  
            os.rename(old_file_path, new_file_path)  
            print(f"重命名 '{old_file_path}' 为 '{new_file_path}'")

os.rename("dist/extension worker.js","dist/extension-worker.js")
# os.rename("dist/extension worker.js.LICENSE.txt","dist/extension-worker.js.LICENSE.txt")
os.system("copy extension-worker.js.map dist\\extension-worker.js.map")
  
# 脚本结束  
print("所有文件以重命名.")