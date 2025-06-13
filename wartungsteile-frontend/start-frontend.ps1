# Start-Frontend.ps1 - Startet Frontend mit automatischer Port-Bereinigung

Write-Host "🧹 Bereinige Port 3000..." -ForegroundColor Yellow

# Finde und beende Prozesse auf Port 3000
$port = 3000
$processes = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue

if ($processes) {
    foreach ($process in $processes) {
        $pid = $process.OwningProcess
        $processName = (Get-Process -Id $pid -ErrorAction SilentlyContinue).Name
        
        Write-Host "❌ Beende Prozess '$processName' (PID: $pid) auf Port $port" -ForegroundColor Red
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
    }
    
    # Kurz warten bis Port frei ist
    Start-Sleep -Seconds 2
}

Write-Host "✅ Port $port ist jetzt frei!" -ForegroundColor Green

# Starte Frontend
Write-Host "🚀 Starte Frontend..." -ForegroundColor Green
npm run dev