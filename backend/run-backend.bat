@echo off
echo ==============================================
echo Smart Campus Hub - Backend Runner
echo ==============================================

:: Find JetBrains JDK because Lombok 1.18.36 crashes on Java 24 (the user's system default)
set "JBR_PATH="
for /d %%I in ("C:\Program Files\JetBrains\*") do (
    if exist "%%I\jbr\bin\javac.exe" (
        set "JBR_PATH=%%I\jbr"
        goto :found_jbr
    )
)

:found_jbr
if defined JBR_PATH (
    echo [INFO] Found JetBrains JDK at %JBR_PATH%
    echo [INFO] Temporarily setting JAVA_HOME for this session to avoid Lombok bug.
    set "JAVA_HOME=%JBR_PATH%"
    set "PATH=%JBR_PATH%\bin;%PATH%"
) else (
    echo [WARN] JetBrains JDK not found. If compilation fails, please use Java 17 or 21.
)

echo [INFO] Starting Spring Boot application...
call .\mvnw.cmd spring-boot:run
