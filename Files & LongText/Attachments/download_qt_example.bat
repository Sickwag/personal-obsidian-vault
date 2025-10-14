@echo off
REM Qt 示例项目下载脚本
REM 使用方法：将下面的 URL 替换为您要下载的项目 URL，然后运行脚本

set GIT_URL=https://code.qt.io/cgit/qt/qtbase.git/tree/examples/sql/books?h=6.10

REM 从 URL 提取项目名称
for /f "tokens=6 delims=/" %%i in ("%GIT_URL%") do set PROJECT_NAME=%%i
for /f "tokens=1 delims=?" %%i in ("%PROJECT_NAME%") do set PROJECT_NAME=%%i

echo 正在下载项目: %PROJECT_NAME%

REM 创建项目目录
if not exist "%PROJECT_NAME%" mkdir "%PROJECT_NAME%"
if not exist "%PROJECT_NAME%\images" mkdir "%PROJECT_NAME%\images"

REM 从 URL 提取仓库路径和分支
for /f "tokens=1-3 delims=?&" %%a in ("%GIT_URL%") do (
    set URL_PARTS=%%a
    set BRANCH_PART=%%b
)
for /f "tokens=2 delims==" %%i in ("%BRANCH_PART%") do set BRANCH=%%i

REM 构建基础 URL（移除 /tree/ 部分，替换为 /plain/）
for /f "tokens=1-4 delims=/" %%a in ("%URL_PARTS%") do set REPO_BASE=%%a//%%b/%%c/%%d
for /f "tokens=5-7 delims=/" %%a in ("%URL_PARTS%") do set EXAMPLE_PATH=%%a/%%b/%%c

echo 仓库: %REPO_BASE%
echo 示例路径: %EXAMPLE_PATH%
echo 分支: %BRANCH%

REM 下载文件 (针对 books 示例，您可以根据需要修改文件列表)
echo Downloading files...

curl -s "https://code.qt.io/cgit/%REPO_BASE%/plain/%EXAMPLE_PATH%/main.cpp?h=%BRANCH%" -o "%PROJECT_NAME%\main.cpp"
if %ERRORLEVEL% EQU 0 echo.  ^| Downloaded main.cpp
if %ERRORLEVEL% NEQ 0 echo.  ^| Failed to download main.cpp

curl -s "https://code.qt.io/cgit/%REPO_BASE%/plain/%EXAMPLE_PATH%/bookwindow.cpp?h=%BRANCH%" -o "%PROJECT_NAME%\bookwindow.cpp"
if %ERRORLEVEL% EQU 0 echo.  ^| Downloaded bookwindow.cpp
if %ERRORLEVEL% NEQ 0 echo.  ^| Failed to download bookwindow.cpp

curl -s "https://code.qt.io/cgit/%REPO_BASE%/plain/%EXAMPLE_PATH%/bookwindow.h?h=%BRANCH%" -o "%PROJECT_NAME%\bookwindow.h"
if %ERRORLEVEL% EQU 0 echo.  ^| Downloaded bookwindow.h
if %ERRORLEVEL% NEQ 0 echo.  ^| Failed to download bookwindow.h

curl -s "https://code.qt.io/cgit/%REPO_BASE%/plain/%EXAMPLE_PATH%/bookdelegate.cpp?h=%BRANCH%" -o "%PROJECT_NAME%\bookdelegate.cpp"
if %ERRORLEVEL% EQU 0 echo.  ^| Downloaded bookdelegate.cpp
if %ERRORLEVEL% NEQ 0 echo.  ^| Failed to download bookdelegate.cpp

curl -s "https://code.qt.io/cgit/%REPO_BASE%/plain/%EXAMPLE_PATH%/bookdelegate.h?h=%BRANCH%" -o "%PROJECT_NAME%\bookdelegate.h"
if %ERRORLEVEL% EQU 0 echo.  ^| Downloaded bookdelegate.h
if %ERRORLEVEL% NEQ 0 echo.  ^| Failed to download bookdelegate.h

curl -s "https://code.qt.io/cgit/%REPO_BASE%/plain/%EXAMPLE_PATH%/initdb.h?h=%BRANCH%" -o "%PROJECT_NAME%\initdb.h"
if %ERRORLEVEL% EQU 0 echo.  ^| Downloaded initdb.h
if %ERRORLEVEL% NEQ 0 echo.  ^| Failed to download initdb.h

curl -s "https://code.qt.io/cgit/%REPO_BASE%/plain/%EXAMPLE_PATH%/books.pro?h=%BRANCH%" -o "%PROJECT_NAME%\%PROJECT_NAME%.pro"
if %ERRORLEVEL% EQU 0 echo.  ^| Downloaded %PROJECT_NAME%.pro
if %ERRORLEVEL% NEQ 0 echo.  ^| Failed to download %PROJECT_NAME%.pro

curl -s "https://code.qt.io/cgit/%REPO_BASE%/plain/%EXAMPLE_PATH%/CMakeLists.txt?h=%BRANCH%" -o "%PROJECT_NAME%\CMakeLists.txt"
if %ERRORLEVEL% EQU 0 echo.  ^| Downloaded CMakeLists.txt
if %ERRORLEVEL% NEQ 0 echo.  ^| Failed to download CMakeLists.txt

curl -s "https://code.qt.io/cgit/%REPO_BASE%/plain/%EXAMPLE_PATH%/books.qrc?h=%BRANCH%" -o "%PROJECT_NAME%\%PROJECT_NAME%.qrc"
if %ERRORLEVEL% EQU 0 echo.  ^| Downloaded %PROJECT_NAME%.qrc
if %ERRORLEVEL% NEQ 0 echo.  ^| Failed to download %PROJECT_NAME%.qrc

REM 下载图像文件
curl -s "https://code.qt.io/cgit/%REPO_BASE%/plain/%EXAMPLE_PATH%/images/star.svg?h=%BRANCH%" -o "%PROJECT_NAME%\images\star.svg"
if %ERRORLEVEL% EQU 0 echo.  ^| Downloaded images\star.svg
if %ERRORLEVEL% NEQ 0 echo.  ^| Failed to download images\star.svg

curl -s "https://code.qt.io/cgit/%REPO_BASE%/plain/%EXAMPLE_PATH%/images/star-filled.svg?h=%BRANCH%" -o "%PROJECT_NAME%\images\star-filled.svg"
if %ERRORLEVEL% EQU 0 echo.  ^| Downloaded images\star-filled.svg
if %ERRORLEVEL% NEQ 0 echo.  ^| Failed to download images\star-filled.svg

echo.
echo 下载完成！项目保存在 %PROJECT_NAME% 目录中。
echo.
echo 目录内容：
dir /s "%PROJECT_NAME%"

pause