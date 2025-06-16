# Kill-Port-3000.ps1
$port = 3000

Write-Host "Suche Prozesse auf Port $port..." -ForegroundColor Yellow

$connections = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue

if ($connections) {
    foreach ($conn in $connections) {
        $process = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
        if ($process) {
            Write-Host "Beende $($process.ProcessName) (PID: $($process.Id))" -ForegroundColor Red
            Stop-Process -Id $process.Id -Force
        }
    }
    Write-Host "Port $port ist jetzt frei!" -ForegroundColor Green
} else {
    Write-Host "Port $port ist bereits frei!" -ForegroundColor Green
}