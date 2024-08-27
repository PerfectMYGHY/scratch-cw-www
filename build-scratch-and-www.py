# @echo off
# cd node_modules\scratch-gui
# build-dist
import os
os.chdir("node_modules/scratch-gui")
os.system("build-dist")
os.system("python rename.py")
os.chdir("../../")
os.system("copy node_modules\\scratch-gui\\dist\\chunks static\\scratch-gui-chunks")
os.system("temp.cmd")
