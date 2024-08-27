import os

commands="@echo off\n"

def call(command,show=False):
	global commands
	if show:
		print(">>>",command)
	commands+=command+"\n"

print("Tip: Python files will successfully complete the task of building the dist directory on Windows.")
print("Please input some CMD command before building.(These commands will not run when you press Enter key.They will run when you do the following thing)")
print("Input blank and press Enter key to continue.")
call("set NODE_ENV=production",show=True)
while 1:
	command = input(">>> ")
	if not command:
		break
	call(command)
call("npm run build:high")
with open("temp.cmd","w") as wf:
	wf.write(commands)
print("Returned",os.system("temp.cmd"))
print("Finished.")