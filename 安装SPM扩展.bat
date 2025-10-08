@echo off
chcp 65001 >nul
title SPM Status Monitor 扩展自动安装器

echo.
echo 🚀 SPM Status Monitor 扩展自动安装器
echo =======================================
echo.

:: 设置当前目录
set "CURRENT_DIR=%~dp0"
set "EXTENSION_NAME=spm-status-monito"

:: 常见的SillyTavern安装路径
set "ST_PATHS[0]=C:\SillyTavern"
set "ST_PATHS[1]=D:\SillyTavern"
set "ST_PATHS[2]=E:\SillyTavern"
set "ST_PATHS[3]=C:\AI\SillyTavern"
set "ST_PATHS[4]=D:\AI\SillyTavern"
set "ST_PATHS[5]=E:\AI\SillyTavern"

echo 🔍 正在搜索SillyTavern安装目录...
echo.

set "FOUND_PATH="
for /L %%i in (0,1,5) do (
    call set "CHECK_PATH=%%ST_PATHS[%%i]%%"
    if exist "!CHECK_PATH!\public\scripts\extensions" (
        echo ✅ 找到SillyTavern: !CHECK_PATH!
        set "FOUND_PATH=!CHECK_PATH!"
        goto :found
    )
)

echo ❌ 未在常见位置找到SillyTavern安装目录
echo.
echo 请手动指定SillyTavern安装路径:
set /p "CUSTOM_PATH=请输入完整路径 (例如: C:\SillyTavern): "

if exist "%CUSTOM_PATH%\public\scripts\extensions" (
    set "FOUND_PATH=%CUSTOM_PATH%"
    echo ✅ 找到SillyTavern: %CUSTOM_PATH%
) else (
    echo ❌ 指定路径中未找到SillyTavern扩展目录
    echo 请确保路径正确且包含 public\scripts\extensions 目录
    goto :error
)

:found
setlocal enabledelayedexpansion
set "TARGET_DIR=%FOUND_PATH%\public\scripts\extensions\%EXTENSION_NAME%"

echo.
echo 📦 开始安装扩展...
echo 源目录: %CURRENT_DIR%
echo 目标目录: !TARGET_DIR!
echo.

:: 检查目标目录是否存在，如果存在则提示覆盖
if exist "!TARGET_DIR!" (
    echo ⚠️ 扩展目录已存在: !TARGET_DIR!
    set /p "OVERWRITE=是否覆盖现有扩展? (Y/N): "
    if /i "!OVERWRITE!" neq "Y" (
        echo ❌ 安装已取消
        goto :end
    )
    echo 🗑️ 删除现有扩展目录...
    rmdir /s /q "!TARGET_DIR!" 2>nul
)

:: 创建目标目录
echo 📁 创建扩展目录...
mkdir "!TARGET_DIR!" 2>nul

:: 复制文件
echo 📋 复制扩展文件...

set "FILES=manifest.json main.js st-extension.js style.css package.json README.md LICENSE"

for %%f in (%FILES%) do (
    if exist "%CURRENT_DIR%%%f" (
        copy "%CURRENT_DIR%%%f" "!TARGET_DIR!\%%f" >nul
        if !errorlevel! equ 0 (
            echo ✅ 已复制: %%f
        ) else (
            echo ❌ 复制失败: %%f
            goto :error
        )
    ) else (
        echo ⚠️ 文件不存在: %%f
    )
)

echo.
echo 🎯 验证安装...

:: 验证关键文件
set "CRITICAL_FILES=manifest.json main.js st-extension.js style.css"
set "ALL_OK=1"

for %%f in (%CRITICAL_FILES%) do (
    if exist "!TARGET_DIR!\%%f" (
        echo ✅ 验证通过: %%f
    ) else (
        echo ❌ 验证失败: %%f
        set "ALL_OK=0"
    )
)

if "%ALL_OK%" equ "1" (
    echo.
    echo 🎉 SPM Status Monitor 扩展安装成功！
    echo.
    echo 📋 后续步骤:
    echo 1. 重启SillyTavern或刷新浏览器页面
    echo 2. 在扩展面板中启用 "SPM Status Monitor"
    echo 3. 点击右下角的SPM图标开始使用
    echo.
    echo 💡 安装位置: !TARGET_DIR!
) else (
    echo.
    echo ❌ 安装验证失败，请检查文件完整性
    goto :error
)

goto :end

:error
echo.
echo ❌ 安装过程中出现错误
echo 💡 您可以尝试手动安装:
echo    1. 将 spm-status-monito 文件夹复制到 SillyTavern\public\scripts\extensions\
echo    2. 重启SillyTavern
echo.

:end
echo.
echo 按任意键退出...
pause >nul