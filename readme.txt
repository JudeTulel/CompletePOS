To run your startUp.bat file at startup and keep it hidden, follow these steps:

### 1. Create a Shortcut to the Batch File
- Right-click startUp.bat → **Create shortcut**.

### 2. Set the Shortcut to Run Minimized
- Right-click the shortcut → **Properties**.
- In the **Shortcut** tab, set **Run:** to **Minimized**.

### 3. Move the Shortcut to the Startup Folder
- Press `Win + R`, type `shell:startup`, and press Enter.
- Move your shortcut into this folder.

### 4. (Optional) Use a VBS Script for Complete Hiding
Batch files can only be minimized, not fully hidden. To fully hide the window, use a small VBScript:

Create a file named `startUp.vbs` with this content:
````vbscript
Set WshShell = CreateObject("WScript.Shell")
WshShell.Run chr(34) & "e:\POS\startUp.bat" & chr(34), 0
Set WshShell = Nothing
````

- Place the `.vbs` file in the **Startup** folder instead of the batch file shortcut.

**Result:**  
Your batch file will run at startup with no visible window.