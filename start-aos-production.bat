@echo off
REM AOS Blueprint - Start Production (Windows)
REM Double-click this file to start ngrok tunnels

echo ========================================
echo    AOS Blueprint - Production Ngrok
echo ========================================
echo.

REM Check if backend is running
powershell -Command "Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue" >nul 2>&1
if errorlevel 1 (
    echo ERROR: Backend not running on port 8000
    echo.
    echo Please start the backend first:
    echo 1. Double-click start-backend.bat
    echo.
    pause
    exit /b 1
) else (
    echo Backend running on port 8000
)

REM Check if frontend is running
powershell -Command "Get-NetTCPConnection -LocalPort 5174 -ErrorAction SilentlyContinue" >nul 2>&1
if errorlevel 1 (
    echo ERROR: Frontend not running on port 5174
    echo.
    echo Please start the frontend first:
    echo 1. Double-click start-frontend.bat
    echo.
    pause
    exit /b 1
) else (
    echo Frontend running on port 5174
)

echo.
echo Starting ngrok with reserved domains...
echo.

REM Kill any existing ngrok processes
taskkill /F /IM ngrok.exe >nul 2>&1

REM Start ngrok
ngrok start --all --config config\ngrok.yml

if errorlevel 1 (
    echo.
    echo ERROR: ngrok failed to start
    echo.
    echo Please check:
    echo 1. ngrok is installed
    echo 2. config\ngrok.yml exists
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo    Production URLs
echo ========================================
echo.
echo Frontend: https://aos-entity-map-frontend.ngrok.app
echo Backend:  https://aos-entity-map-backend.ngrok.app
echo.
echo Press Ctrl+C to stop ngrok
echo.

pause
