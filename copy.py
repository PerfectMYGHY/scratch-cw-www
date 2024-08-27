import shutil
import os
from tqdm import tqdm
import traceback
import sys

def copy_folder_with_progress(src, dst, _except:list=[]):
    print("正在计算文件个数...")
    # 获取源文件夹中的文件和子文件夹数量
    num_files = sum([len(files) for _, _, files in os.walk(src)])
    num_dirs = sum([len(dirs) for _, dirs, _ in os.walk(src)])
    total_items = num_files + num_dirs
    _excepts = [os.path.join(src,_e) for _e in _except]

    # 使用tqdm来显示进度条
    with tqdm(total=total_items, desc="复制文件") as pbar:
        def copy_with_progress(src, dst):
            try:
                shutil.copy(src, dst)
            except Exception:
                print()
                traceback.print_exc()
            pbar.update()  # 更新进度条

        def copy_tree_with_progress(src, dst):
            # 递归复制文件夹，并更新进度条
            names = os.listdir(src)
            if not os.path.isdir(dst):
                os.makedirs(dst)
            errors = []
            for name in names:
                srcname = os.path.join(src, name)
                dstname = os.path.join(dst, name)
                if srcname in _excepts:
                    continue
                try:
                    if os.path.isdir(srcname):
                        copy_tree_with_progress(srcname, dstname)
                    else:
                        copy_with_progress(srcname, dstname)
                except (IOError, os.error) as why:
                    errors.append((srcname, dstname, str(why)))
            try:
                shutil.copystat(src, dst)
            except OSError as why:
                # 可以忽略某些特定的错误，比如文件不存在
                errors.extend((src, dst, str(why)))
            if errors:
                raise Error("Error during file copy. See error log.")
            pbar.update()  # 对于每个复制的文件夹，也更新进度条

        # 调用自定义的copy_tree_with_progress函数
        copy_tree_with_progress(src, dst)

    # 使用函数


src_folder = sys.argv[1]
dst_folder = sys.argv[2]
copy_folder_with_progress(src_folder, dst_folder)