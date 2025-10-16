@echo off
echo Color Detection System Launcher
echo ================================
echo.

REM Change to the script directory
cd /d "%~dp0"

REM Run the Python launcher
python launcher.py

REM Keep window open if there's an error
if errorlevel 1 (
    echo.
    echo An error occurred. Press any key to exit.
    pause >nul
)