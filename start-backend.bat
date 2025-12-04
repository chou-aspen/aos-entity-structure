@echo off
REM AOS Blueprint - Start Backend (Windows)
REM Double-click this file to start the backend server

echo ========================================
echo    AOS Blueprint - Backend Server
echo ========================================
echo.

REM Check if .env file exists
if not exist .env (
    echo ERROR: .env file not found!
    echo.
    echo Please create .env file with your Dynamics 365 credentials
    echo See README.md for setup instructions
    echo.
    pause
    exit /b 1
)

REM Activate virtual environment
if exist venv\Scripts\activate.bat (
    call venv\Scripts\activate.bat
) else (
    echo ERROR: Virtual environment not found!
    echo.
    echo Please run setup first:
    echo 1. python -m venv venv
    echo 2. venv\Scripts\activate
    echo 3. pip install -r backend\requirements.txt
    echo.
    pause
    exit /b 1
)

echo Testing Dynamics 365 connection...
python test_connection.py
if errorlevel 1 (
    echo.
    echo ERROR: Connection test failed!
    echo Please check your credentials in .env file
    echo.
    pause
    exit /b 1
)

echo.
echo Connection successful!
echo.
echo Starting FastAPI server...
echo   API: http://localhost:8000
echo   Docs: http://localhost:8000/docs
echo.
echo Press Ctrl+C to stop the server
echo.

REM Start the backend
python backend\app.py

pause
