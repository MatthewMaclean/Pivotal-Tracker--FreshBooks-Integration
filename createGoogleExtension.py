import os
import sys
import shutil
from distutils.dir_util import copy_tree

currentDir = os.getcwd()
fileNamesRequired = ["jquery.sexy-combo-2.1.3\\css\\sexy-combo.css", "Chrome_Specific_Files\\manifest.json", "main.js", "Chrome_Specific_Files\\jquery-ui-1.7.3.custom.min.js", "Chrome_Specific_Files\\jquery-ui-1.7.3.custom.css", "jquery.sexy-combo-2.1.3\\jquery.sexy-combo.min.js", "Chrome_Specific_Files\\jquery.js", "Chrome_Specific_Files\\googlechrome.js"]
foldersRequired = ["Chrome_Specific_Files\\images"]

updatedExtension =  currentDir + "\\\\ChromeFreshbooksIntegration"
if os.path.exists(updatedExtension):
    shutil.rmtree(updatedExtension)
    
os.makedirs(updatedExtension)



for fileName in fileNamesRequired:
    shutil.copy2(currentDir + "\\" + fileName, updatedExtension)

for folder in foldersRequired:
    copy_tree(currentDir + "\\" + folder, updatedExtension + "\\images")
