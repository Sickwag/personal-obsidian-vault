#!/usr/bin/env python3
"""
Qt 示例项目下载脚本（简化版）
基于成功实践的方法，适用于类似 books 示例的项目结构
"""

import os
import sys
import subprocess
import re


def download_qt_example_files(git_url, output_dir=None):
    """
    下载 Qt 示例项目文件
    
    Args:
        git_url: Qt Git 仓库中示例项目的 URL
        output_dir: 输出目录名称
    """
    # 解析 URL 得到路径信息
    # 期望格式: https://code.qt.io/cgit/qt/qtbase.git/tree/examples/sql/books?h=6.10
    pattern = r'https://code\.qt\.io/cgit/([^/]+/[^/]+\.git)/tree/([^?]+)\?h=([^&]+)'
    match = re.match(pattern, git_url)
    
    if not match:
        print("错误: URL 格式不正确")
        print("示例: https://code.qt.io/cgit/qt/qtbase.git/tree/examples/sql/books?h=6.10")
        return False
    
    repo_path = match.group(1)  # e.g., qt/qtbase.git
    example_path = match.group(2)  # e.g., examples/sql/books
    branch = match.group(3)  # e.g., 6.10
    
    # 设置输出目录
    if output_dir is None:
        output_dir = example_path.split('/')[-1]
    
    # 创建输出目录结构
    os.makedirs(output_dir, exist_ok=True)
    os.makedirs(os.path.join(output_dir, "images"), exist_ok=True)
    
    print(f"仓库: {repo_path}")
    print(f"示例路径: {example_path}")
    print(f"分支: {branch}")
    print(f"输出目录: {output_dir}")
    
    # 基础 URL
    base_url = f"https://code.qt.io/cgit/{repo_path}/plain/{example_path}"
    
    # 预定义的文件列表，基于典型的 Qt 示例项目结构
    file_patterns = [
        # 通用文件
        "main.cpp",
        "CMakeLists.txt",
        "*.pro",
        "*.qrc",
        
        # Books 示例特定文件
        "bookdelegate.cpp",
        "bookdelegate.h", 
        "bookwindow.cpp",
        "bookwindow.h",
        "initdb.h",
        
        # Images 目录中的文件
        "images/*.svg",
        "images/*.png",
        "images/*.jpg",
        "images/*.jpeg",
        "images/*.gif"
    ]
    
    # 根据示例路径调整预期文件名
    example_name = example_path.split('/')[-1].lower()
    
    # 确定预期文件列表
    expected_files = []
    
    if example_name == "books":
        # Books 示例的特定文件
        expected_files = [
            "main.cpp",
            "bookwindow.cpp",
            "bookwindow.h",
            "bookdelegate.cpp", 
            "bookdelegate.h",
            "initdb.h",
            "books.pro",
            "CMakeLists.txt",
            "books.qrc",
            "images/star.svg",
            "images/star-filled.svg"
        ]
    elif example_name == "querymodel":
        expected_files = [
            "main.cpp",
            "querymodel.cpp",
            "querymodel.h",
            "querymodel.pro",
            "CMakeLists.txt"
        ]
    else:
        # 通用模式 - 尝试下载基于示例名称的文件
        base_name = example_name
        expected_files = [
            "main.cpp",
            f"{base_name}.cpp",
            f"{base_name}.h",
            f"{base_name}delegate.cpp",
            f"{base_name}delegate.h",
            f"{base_name}window.cpp",
            f"{base_name}window.h", 
            "initdb.h",
            f"{base_name}.pro",
            "CMakeLists.txt",
            f"{base_name}.qrc"
        ]
        
        # 添加可能的图像文件
        image_files = [
            "images/star.svg",
            "images/star-filled.svg",
            "images/*.png",
            "images/*.jpg"
        ]
        expected_files.extend(image_files)
    
    downloaded_count = 0
    
    for file_path in expected_files:
        # 对于通配符模式，我们只处理特定的已知文件
        if '*' in file_path:
            if file_path == "images/*.svg":
                # 尝试下载常见的 SVG 文件
                svg_files = ["star.svg", "star-filled.svg", "icon.svg"]
                for svg_file in svg_files:
                    full_path = f"images/{svg_file}"
                    url = f"{base_url}/{full_path}?h={branch}"
                    local_file = os.path.join(output_dir, full_path)
                    
                    if download_single_file(url, local_file):
                        downloaded_count += 1
            elif file_path == "images/*.png":
                # 尝试下载常见的 PNG 文件
                png_files = ["icon.png", "logo.png", "*.png"]
                for png_file in png_files:
                    full_path = f"images/{png_file}"
                    url = f"{base_url}/{full_path}?h={branch}"
                    local_file = os.path.join(output_dir, full_path)
                    
                    if download_single_file(url, local_file):
                        downloaded_count += 1
            continue
        
        url = f"{base_url}/{file_path}?h={branch}"
        local_file = os.path.join(output_dir, file_path)
        
        if download_single_file(url, local_file):
            downloaded_count += 1
    
    print(f"\n完成! 成功下载了 {downloaded_count} 个文件到 '{output_dir}' 目录")
    
    # 显示下载的文件列表
    print("\n下载的文件:")
    for root, dirs, files in os.walk(output_dir):
        for file in files:
            rel_path = os.path.relpath(os.path.join(root, file), output_dir)
            print(f"  - {rel_path}")
    
    return True


def download_single_file(url, local_file):
    """
    使用 curl 下载单个文件
    
    Args:
        url: 文件 URL
        local_file: 本地保存路径
    
    Returns:
        bool: 是否成功下载
    """
    try:
        # 使用 curl 下载
        result = subprocess.run([
            'curl', '-s', url, '-o', local_file
        ], capture_output=True, text=True)
        
        if result.returncode != 0:
            print(f"  × 下载失败: {local_file} (curl 错误)")
            return False
        
        # 检查下载的文件是否为有效的非 HTML 内容
        try:
            with open(local_file, 'r', encoding='utf-8') as f:
                content = f.read(200)  # 读取前 200 字符检查
                if '<html' in content.lower() or '<!doctype' in content.lower():
                    # 如果是 HTML，可能是错误页面或目录列表，删除文件
                    os.remove(local_file)
                    print(f"  × 下载失败: {local_file} (HTML 内容 - 可能是错误页面)")
                    return False
        except UnicodeDecodeError:
            # 如果是二进制文件（如图片），则跳过文本检查
            pass
        except Exception:
            pass  # 其他错误也跳过检查
        
        print(f"  ✓ 已下载: {local_file}")
        return True
        
    except Exception as e:
        print(f"  × 下载出错: {local_file} - {e}")
        # 如果文件已创建但下载失败，删除它
        if os.path.exists(local_file):
            try:
                os.remove(local_file)
            except:
                pass
        return False


def main():
    if len(sys.argv) < 2:
        print("用法: python download_qt_example.py <Qt_Git_URL> [输出目录名]")
        print("")
        print("示例:")
        print("  python download_qt_example.py \"https://code.qt.io/cgit/qt/qtbase.git/tree/examples/sql/books?h=6.10\"")
        print("  python download_qt_example.py \"https://code.qt.io/cgit/qt/qtbase.git/tree/examples/sql/books?h=6.10\" my_books_project")
        print("")
        print("注意: URL 必须包含分支参数 (h=xxx)，如 h=6.10")
        return
    
    git_url = sys.argv[1]
    output_dir = sys.argv[2] if len(sys.argv) > 2 else None
    
    success = download_qt_example_files(git_url, output_dir)
    
    if not success:
        sys.exit(1)


if __name__ == "__main__":
    main()