@echo off
echo ========================================
echo   Frontend Start mit Port-Bereinigung
echo ========================================
echo.

:: Port 3000 prüfen und bereinigen
echo [INFO] Pruefe Port 3000...
netstat -ano | findstr :3000 >nul
if %errorlevel%==0 (
    echo [WARNUNG] Port 3000 ist bereits belegt!
    echo [INFO] Beende blockierende Prozesse...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
        echo [INFO] Beende Prozess mit PID: %%a
        taskkill /F /PID %%a >nul 2>&1
    )
    echo [OK] Port 3000 wurde freigegeben!
    timeout /t 2 /nobreak > nul
) else (
    echo [OK] Port 3000 ist frei!
)

:: Frontend starten
echo.
echo [Frontend] Starte Frontend auf Port 3000...
npm run dev

pause