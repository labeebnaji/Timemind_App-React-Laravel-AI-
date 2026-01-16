@echo off
echo ========================================
echo   Starting TimeMind AI for Mobile
echo ========================================
echo.

echo [1/3] Getting your IP address...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
    set IP=%%a
    set IP=!IP: =!
    echo Your IP: !IP!
    goto :found
)
:found

echo.
echo [2/3] Starting Backend on 0.0.0.0:8000...
start "TimeMind Backend" cmd /k "cd backend && php artisan serve --host=0.0.0.0"
timeout /t 3 /nobreak >nul

echo.
echo [3/3] Starting Frontend...
start "TimeMind Frontend" cmd /k "cd frontend && npm run dev"
timeout /t 5 /nobreak >nul

echo.
echo ========================================
echo   TimeMind AI is ready!
echo ========================================
echo.
echo Open on your phone:
echo   http://%IP%:3000
echo.
echo Press any key to stop servers...
pause >nul

echo.
echo Stopping servers...
taskkill /FI "WINDOWTITLE eq TimeMind*" /F >nul 2>&1
echo Done!
