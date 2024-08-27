import os
EXTENSION_WORD_MAP = "extension-worker.js.map"
DIR = "dist"
REPLACE_TABLE = [
	{
		"startswith": ""
	}
]
files = os.listdir(DIR)
for file in files:
	...