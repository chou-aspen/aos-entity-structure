@echo off
REM AOS Blueprint - Windows Setup Script
REM Double-click this file to set up the project

echo ========================================
echo    AOS Blueprint - Windows Setup
echo ========================================
echo.
echo This script will:
echo 1. Create Python virtual environment
echo 2. Install backend dependencies
echo 3. Install frontend dependencies
echo 4. Test Dynamics 365 connection
echo.
pause

REM Step 1: Check Python
echo.
echo [1/4] Checking Python installation...
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python not found!
    echo.
    echo Please install Python 3.8+ from https://www.python.org/downloads/
    echo Make sure to check "Add Python to PATH" during installation
    echo.
    pause
    exit /b 1
)
python --version
echo Python found!

REM Step 2: Create virtual environment
echo.
echo [2/4] Creating Python virtual environment...
if exist venv (
    echo Virtual environment already exists, skipping...
) else (
    python -m venv venv
    if errorlevel 1 (
        echo ERROR: Failed to create virtual environment
        pause
        exit /b 1
    )
    echo Virtual environment created!
)

REM Step 3: Install backend dependencies
echo.
echo [3/4] Installing backend dependencies...
echo This may take a few minutes...
call venv\Scripts\activate.bat
pip install -r backend\requirements.txt
if errorlevel 1 (
    echo ERROR: Failed to install backend dependencies
    pause
    exit /b 1
)
echo Backend dependencies installed!

REM Step 4: Check Node.js
echo.
echo [4/4] Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js not found!
    echo.
    echo Please install Node.js 18+ from https://nodejs.org/
    echo.
    pause
    exit /b 1
)
node --version
echo Node.js found!

REM Step 5: Install frontend dependencies
echo.
echo [5/5] Installing frontend dependencies...
echo This may take a few minutes...
cd frontend
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install frontend dependencies
    cd ..
    pause
    exit /b 1
)
cd ..
echo Frontend dependencies installed!

REM Step 6: Check .env file
echo.
echo ========================================
echo    Setup Complete!
echo ========================================
echo.
if not exist .env (
    echo WARNING: .env file not found!
    echo.
    echo Next steps:
    echo 1. Create .env file in project root
    echo 2. Add your Dynamics 365 credentials
    echo 3. See README.md for details
    echo.
) else (
    echo Testing Dynamics 365 connection...
    python test_connection.py
    if errorlevel 1 (
        echo.
        echo WARNING: Connection test failed!
        echo Please check your credentials in .env file
    ) else (
        echo.
        echo Connection successful!
    )
)

echo.
echo To start the application:
echo 1. Double-click start-backend.bat
echo 2. Double-click start-frontend.bat
echo 3. Open http://localhost:5174
echo.
echo For production deployment:
echo 1. Start backend and frontend first
echo 2. Double-click start-aos-production.bat
echo.
pause
