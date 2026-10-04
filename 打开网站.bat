@echo off
start "" http://localhost:3000
netstat -ano | findstr ":3000 " | findstr "LISTENING" >nul 2>&1
if errorlevel 1 npm run dev
