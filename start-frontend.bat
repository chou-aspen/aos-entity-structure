@echo off
REM AOS Blueprint - Start Frontend (Windows)
REM Double-click this file to start the frontend server

echo ========================================
echo    AOS Blueprint - Frontend Server
echo ========================================
echo.

cd frontend

REM Check if node_modules exists
if not exist node_modules (
    echo Installing dependencies...
    echo This may take a few minutes...
    echo.
    call npm install
    if errorlevel 1 (
        echo.
        echo ERROR: npm install failed!
        echo Please make sure Node.js is installed
        echo.
        pause
        exit /b 1
    )
)

echo Starting Vite dev server...
echo   App: http://localhost:5174
echo.
echo Press Ctrl+C to stop the server
echo.

REM Start the frontend
call npm run dev

pause
