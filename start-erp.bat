@echo off
TITLE NEXORA Enterprise ERP Launcher
COLOR 0B

echo ========================================================
echo        NEXORA ENTERPRISE ERP - STARTUP MANAGER
echo ========================================================
echo.

:: 1. Start MySQL Server
echo [1/3] Starting MySQL 8.0 Server on port 3306...
start "NEXORA MySQL Server" /min "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqld.exe" --datadir="c:\ERP\mysql-data" --port=3306 --console
timeout /t 3 /nobreak >nul

:: 2. Start Spring Boot Backend
echo [2/3] Starting Java Spring Boot Backend on port 8080...
cd /d "c:\ERP\backend"
start "NEXORA Spring Boot API" cmd /c "C:\Users\sajum\maven\apache-maven-3.9.6\bin\mvn.cmd spring-boot:run"
timeout /t 5 /nobreak >nul

:: 3. Start Vite React Frontend
echo [3/3] Starting React Frontend on port 5173...
cd /d "c:\ERP\frontend"
start "NEXORA React Frontend" cmd /c "npm.cmd run dev"

timeout /t 4 /nobreak >nul
echo.
echo ========================================================
echo  All services initialized!
echo  Frontend URL: http://localhost:5173
echo  Backend API:  http://localhost:8080/api
echo  Default Login: admin@nexora.ae / Admin@123
echo ========================================================
echo Opening browser...
start http://localhost:5173
