@echo off
setlocal

:: Configuration
set "MARIADB_VERSION=11.4.2"
set "MARIADB_MSI=mariadb-%MARIADB_VERSION%-winx64.msi"
set "MARIADB_URL=https://downloads.mariadb.com/MariaDB/mariadb-%MARIADB_VERSION%/winx64-packages/%MARIADB_MSI%"
set "ROOT_PASSWORD=@1234"
set "INSTALL_DIR=C:\Program Files\MariaDB %MARIADB_VERSION%"

echo ========================================================
echo RelyOn POS: MariaDB Automated Installer
echo ========================================================

:: Check for Administrative privileges
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [ERROR] This script must be run as Administrator.
    pause
    exit /b 1
)

:: Download MariaDB if not present
if not exist "%MARIADB_MSI%" (
    echo [INFO] Downloading MariaDB %MARIADB_VERSION%...
    curl -L -O %MARIADB_URL%
    if %errorLevel% neq 0 (
        echo [ERROR] Failed to download MariaDB. Please check your internet connection.
        pause
        exit /b 1
    )
) else (
    echo [INFO] Found existing MariaDB installer.
)

:: Silent Install
echo [INFO] Installing MariaDB silently...
msiexec.exe /i "%MARIADB_MSI%" /qn /norestart ^
    INSTALLDIR="%INSTALL_DIR%" ^
    SERVICENAME="MariaDB" ^
    PORT=3306 ^
    PASSWORD="%ROOT_PASSWORD%" ^
    UTF8=1 ^
    PLUGINS=1

if %errorLevel% neq 0 (
    echo [ERROR] MariaDB installation failed with error code %errorLevel%.
    pause
    exit /b 1
)

echo [SUCCESS] MariaDB installed successfully!
echo [INFO] Service name: MariaDB
echo [INFO] Root password set to: %ROOT_PASSWORD%
echo ========================================================
echo You can now run the RelyOn POS application.
echo ========================================================
pause
endlocal
