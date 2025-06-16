@echo off
echo 🧹 Bereinige Port 3000...

REM Finde Prozess auf Port 3000
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
    echo ❌ Beende Prozess mit PID: %%a
    taskkill /PID %%a /F >nul 2>&1
)

echo ✅ Port 3000 ist jetzt frei!
echo 🚀 Starte Frontend...

REM Warte kurz
timeout /t 2 /nobreak >nul

REM Starte Frontend
npm run dev