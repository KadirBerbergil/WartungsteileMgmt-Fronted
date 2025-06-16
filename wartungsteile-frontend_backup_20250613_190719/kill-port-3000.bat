@echo off
echo Beende Prozess auf Port 3000...

for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000" ^| findstr "LISTENING"') do (
    echo Beende PID: %%a
    taskkill /F /PID %%a
)

echo Port 3000 ist jetzt frei!
pause