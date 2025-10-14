#!/usr/bin/env python3
"""
Qt 示例项目批量下载脚本
自动从 Qt Git 仓库下载示例项目的完整文件结构
"""

import os
import re
import requests
from urllib.parse import urljoin, urlparse
from bs4 import BeautifulSoup
import sys


def download_file(url, filepath):
    """
    下载单个文件
    
    Args:
        url: 文件的完整 URL
        filepath: 本地保存路径
    
    Returns:
        bool: 下载是否成功
    """
    try:
        response = requests.get(url)
        if response.status_code == 200:
            # 检查响应内容是否为 HTML（表示不是原始文件）
            content = response.text
            if '<html' in content[:200].lower():
                print(f"  跳过 {filepath}: 内容为 HTML")
                return False
            
            # 创建目录
            os.makedirs(os.path.dirname(filepath), exist_ok=True)
            
            # 以二进制模式保存，处理可能的二进制文件如图片
            if any(filepath.lower().endswith(ext) for ext in ['.svg', '.png', '.jpg', '.jpeg', '.gif', '.ico']):
                # 对于图像文件，以二进制模式保存
                response = requests.get(url)
                with open(filepath, 'wb') as f:
                    f.write(response.content)
            else:
                # 对于文本文件，以文本模式保存
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
            
            print(f"  ✓ 下载成功: {filepath}")
            return True
        else:
            print(f"  × 下载失败: {url} (状态码: {response.status_code})")
            return False
    except Exception as e:
        print(f"  × 下载出错: {url} - {e}")
        return False


def get_directory_contents(url):
    """
    从 Git web 界面获取目录内容
    
    Args:
        url: 目录的 URL
    
    Returns:
        tuple: (文件列表, 子目录列表)
    """
    try:
        response = requests.get(url)
        if response.status_code != 200:
            print(f"无法访问目录: {url}")
            return [], []
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        files = []
        directories = []
        
        # 查找文件列表 (通常在 table 中)
        for row in soup.find_all('tr'):
            # 检查是否有文件/目录链接
            link = row.find('a')
            if link:
                href = link.get('href', '')
                name = link.get_text(strip=True)
                
                # 判断是文件还是目录
                # 查找图标或描述来判断类型
                img = row.find('img')
                if img:
                    img_alt = img.get('alt', '').lower()
                    if 'dir' in img_alt or 'folder' in img_alt or name.endswith('/'):
                        if name.endswith('/'):
                            name = name[:-1]  # 移除末尾斜杠
                        directories.append(name)
                    else:
                        files.append(name)
                else:
                    # 根据链接结构判断
                    if href and 'tree/' in href:  # 目录
                        if name.endswith('/'):
                            name = name[:-1]  # 移除末尾斜杠
                        directories.append(name)
                    elif href and 'plain/' in href:  # 文件
                        files.append(name)
                    else:
                        # 通过其他方式判断
                        size_cell = row.find_all('td')
                        if len(size_cell) >= 3:
                            size_text = size_cell[2].get_text(strip=True) if size_cell[2] else ""
                            if size_text.lower() == 'dir' or size_text == '-':
                                if name.endswith('/'):
                                    name = name[:-1]
                                directories.append(name)
                            elif size_text and size_text != '-':
                                # 可能是文件
                                files.append(name)
        
        return files, directories
        
    except Exception as e:
        print(f"解析目录内容出错: {e}")
        return [], []


def download_qt_example_project(git_url, output_dir=None):
    """
    下载完整的 Qt 示例项目
    
    Args:
        git_url: Git 仓库中示例项目的 URL
        output_dir: 输出目录名称
    """
    print(f"开始下载 Qt 示例项目: {git_url}")
    
    # 解析 URL
    parsed = urlparse(git_url)
    base_url = f"{parsed.scheme}://{parsed.netloc}"
    
    # 构建用于获取原始文件的 URL 模板
    if 'code.qt.io' in git_url:
        # 解析示例路径
        path_parts = parsed.path.strip('/').split('/')
        if len(path_parts) >= 5 and path_parts[2] == 'tree':
            repo_path = '/'.join(path_parts[0:4])  # 例如: qt/qtbase.git
            example_subpath = '/'.join(path_parts[4:])  # 例如: examples/sql/books
            
            # 获取分支参数
            branch = '6.10'  # 默认分支
            if parsed.query:
                for param in parsed.query.split('&'):
                    if param.startswith('h='):
                        branch = param.split('=')[1]
        else:
            print("错误: URL 格式不正确")
            print("示例: https://code.qt.io/cgit/qt/qtbase.git/tree/examples/sql/books?h=6.10")
            return
    else:
        print("错误: 不支持的 Git 仓库 URL")
        return
    
    # 设置输出目录
    if output_dir is None:
        output_dir = example_subpath.split('/')[-1]
    
    print(f"输出目录: {output_dir}")
    print(f"仓库路径: {repo_path}")
    print(f"示例路径: {example_subpath}")
    print(f"分支: {branch}")
    
    # 递归下载函数
    def download_recursive(current_path, local_dir):
        """递归下载目录及子目录"""
        # 构建当前目录的 URL
        dir_url = f"{base_url}/cgit/{repo_path}/tree/{current_path}?h={branch}"
        
        print(f"\n正在处理目录: {current_path}")
        
        # 获取当前目录内容
        files, directories = get_directory_contents(dir_url)
        
        print(f"  发现 {len(files)} 个文件, {len(directories)} 个子目录")
        
        # 下载当前目录的文件
        for filename in files:
            if filename in ['.', '..']:  # 跳过特殊目录
                continue
                
            # 构建原始文件 URL
            file_url = f"{base_url}/cgit/{repo_path}/plain/{current_path}/{filename}?h={branch}"
            local_path = os.path.join(output_dir, local_dir, filename)
            
            download_file(file_url, local_path)
        
        # 递归处理子目录
        for dirname in directories:
            if dirname in ['.', '..']:  # 跳过特殊目录
                continue
                
            sub_path = f"{current_path}/{dirname}"
            sub_local_dir = os.path.join(local_dir, dirname) if local_dir else dirname
            
            download_recursive(sub_path, sub_local_dir)
    
    # 开始递归下载
    download_recursive(example_subpath, "")
    
    print(f"\n项目已成功下载到: {output_dir}")


def main():
    if len(sys.argv) < 2:
        print("用法: python download_qt_example.py <Qt_Git_URL> [输出目录名]")
        print("示例: python download_qt_example.py \"https://code.qt.io/cgit/qt/qtbase.git/tree/examples/sql/books?h=6.10\" books_project")
        return
    
    git_url = sys.argv[1]
    output_dir = sys.argv[2] if len(sys.argv) > 2 else None
    
    download_qt_example_project(git_url, output_dir)


if __name__ == "__main__":
    main()