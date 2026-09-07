@echo off
title Dullnit V1 - All-In-One Runner
echo =========================================================
echo   Starting Dullnit V1 Platform (Backend + Frontend)
echo =========================================================

where py >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    py -3 run.py
    goto finish
)

where python >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    python run.py
    goto finish
)

where python3 >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    python3 run.py
    goto finish
)

echo [ERROR] Python was not found in PATH.
echo Please install Python 3.10+ and make sure it is added to PATH.
pause

:finish
pause
