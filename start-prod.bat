@echo off
rem ═══════════════════════════════════════════════════════════════
rem  Santapris Academy - Production launcher (server + zrok tunnel)
rem  Usage:  start-prod.bat              (normal startup)
rem          start-prod.bat --watchdog   (run as heavy-duty watcher)
rem ═══════════════════════════════════════════════════════════════
setlocal
cd /d "%~dp0"

set LOGDIR=%~dp0\logs
if not exist "%LOGDIR%" mkdir "%LOGDIR%"

rem ── 1. Start the school server (port 8000) if not healthy ──
powershell -NoProfile -Command ^
  "try{(Invoke-WebRequest http://127.0.0.1:8000/health -UseBasicParsing -TimeoutSec 5|Out-Null);exit 0}catch{exit 1}"
if %errorlevel%==1 (
  echo [%date% %time%] Starting school server... >> "%LOGDIR%\watchdog.log"
  start "Santapris Server 8000" /min cmd /c "python school_system.py >> \"%LOGDIR%\server.log\" 2>&1"
) else (
  echo Server healthy on :8000
)

rem ── 2. Start the zrok public tunnel if not already running ──
tasklist /fi "imagename eq zrok2.exe" | find /i "zrok2.exe" >NUL
if %errorlevel%==1 (
  echo [%date% %time%] Starting zrok tunnel... >> "%LOGDIR%\watchdog.log"
  start "zrok Tunnel" /min cmd /c "zrok2 share public http://localhost:8000 -n public:santaprisacademy --headless 2>> \"%LOGDIR%\zrok.log\""
) else (
  echo zrok2 tunnel already running
)

rem ── 3. Optional watchdog loop ──
if /i "%~1"=="--watchdog" (
  echo Watchdog mode: press Ctrl+C to stop.
  :loop
  timeout /t 30 /nobreak >NUL

  rem server /health still up?
  powershell -NoProfile -Command ^
    "try{(Invoke-WebRequest http://127.0.0.1:8000/health -UseBasicParsing -TimeoutSec 5|Out-Null);exit 0}catch{exit 1}"
  if errorlevel 1 (
    echo [%date% %time%] Server DOWN - restarting >> "%LOGDIR%\watchdog.log"
    start "Santapris Server 8000" /min cmd /c "python school_system.py >> \"%LOGDIR%\server.log\" 2>&1"
  )

  rem tunnel still up?
  tasklist /fi "imagename eq zrok2.exe" | find /i "zrok2.exe" >NUL
  if errorlevel 1 (
    echo [%date% %time%] zrok DOWN - restarting >> "%LOGDIR%\watchdog.log"
    start "zrok Tunnel" /min cmd /c "zrok2 share public http://localhost:8000 -n public:santaprisacademy --headless 2>> \"%LOGDIR%\zrok.log\""
  )
  goto loop
)

echo.
echo Started. Public URL: https://santaprisacademy.shares.zrok.io
pause