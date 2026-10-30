@echo off
setlocal
set "MAVEN_VERSION=3.9.11"
set "BASE_DIR=%USERPROFILE%\.m2\wrapper\dists"
set "MAVEN_HOME=%BASE_DIR%\apache-maven-%MAVEN_VERSION%"
set "ARCHIVE=%BASE_DIR%\apache-maven-%MAVEN_VERSION%-bin.zip"
set "URL=https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/%MAVEN_VERSION%/apache-maven-%MAVEN_VERSION%-bin.zip"

if not exist "%MAVEN_HOME%\bin\mvn.cmd" (
  echo Descargando Maven %MAVEN_VERSION%...
  if not exist "%BASE_DIR%" mkdir "%BASE_DIR%"
  powershell -NoProfile -ExecutionPolicy Bypass -Command "$ErrorActionPreference='Stop'; Invoke-WebRequest -UseBasicParsing -Uri '%URL%' -OutFile '%ARCHIVE%'; Expand-Archive -Path '%ARCHIVE%' -DestinationPath '%BASE_DIR%' -Force"
  if errorlevel 1 exit /b 1
)

call "%MAVEN_HOME%\bin\mvn.cmd" %*
endlocal
