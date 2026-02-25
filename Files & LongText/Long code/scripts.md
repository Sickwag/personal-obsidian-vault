---
description: 专门记录各种脚本代码，语言不限
---
# CMake
## 引入资源文件 cmake 模块
```cmake
# ======================================
# EmbedResources.cmake - 跨平台资源嵌入模块
# 功能：将任意文件嵌入到可执行文件中，支持Linux/Windows/macOS
# 用法：embed_resources(target_name [resource_files...])
# ======================================

# 检测操作系统和架构，设置正确的objcopy参数
function(detect_platform_config)
    # 检测操作系统
    if(CMAKE_SYSTEM_NAME STREQUAL "Linux")
        set(OS_TYPE "LINUX" PARENT_SCOPE)
    elseif(CMAKE_SYSTEM_NAME STREQUAL "Windows")
        set(OS_TYPE "WINDOWS" PARENT_SCOPE)
    elseif(CMAKE_SYSTEM_NAME STREQUAL "Darwin")
        set(OS_TYPE "MACOS" PARENT_SCOPE)
    else()
        set(OS_TYPE "UNKNOWN" PARENT_SCOPE)
    endif()
    
    # 检测架构
    if(CMAKE_SIZEOF_VOID_P EQUAL 8)
        set(ARCH_BITS 64 PARENT_SCOPE)
    else()
        set(ARCH_BITS 32 PARENT_SCOPE)
    endif()
    
    # 根据架构设置objcopy格式
    if(CMAKE_SYSTEM_PROCESSOR MATCHES "x86_64|amd64|AMD64")
        set(OBJCOPY_FORMAT "elf64-x86-64" PARENT_SCOPE)
        set(OBJCOPY_ARCH "i386:x86-64" PARENT_SCOPE)
    elseif(CMAKE_SYSTEM_PROCESSOR MATCHES "i386|i686|x86")
        set(OBJCOPY_FORMAT "elf32-i386" PARENT_SCOPE)
        set(OBJCOPY_ARCH "i386" PARENT_SCOPE)
    elseif(CMAKE_SYSTEM_PROCESSOR MATCHES "aarch64|arm64")
        set(OBJCOPY_FORMAT "elf64-littleaarch64" PARENT_SCOPE)
        set(OBJCOPY_ARCH "aarch64" PARENT_SCOPE)
    elseif(CMAKE_SYSTEM_PROCESSOR MATCHES "arm|ARM")
        set(OBJCOPY_FORMAT "elf32-littlearm" PARENT_SCOPE)
        set(OBJCOPY_ARCH "arm" PARENT_SCOPE)
    else()
        # 默认使用通用设置
        set(OBJCOPY_FORMAT "elf64-x86-64" PARENT_SCOPE)
        set(OBJCOPY_ARCH "i386:x86-64" PARENT_SCOPE)
    endif()
endfunction()

# 将单个资源文件转换为目标文件
function(convert_resource_to_obj TARGET RESOURCE_FILE OUTPUT_OBJ)
    get_filename_component(FILENAME ${RESOURCE_FILE} NAME)
    get_filename_component(FILE_BASE ${RESOURCE_FILE} NAME_WE)
    
    # 获取文件扩展名并清理（用于生成符号名）
    string(REPLACE "." "_" SYMBOL_NAME ${FILENAME})
    
    # 确保输出目录存在
    get_filename_component(OBJ_DIR ${OUTPUT_OBJ} DIRECTORY)
    file(MAKE_DIRECTORY ${OBJ_DIR})
    
    # 根据操作系统选择不同的嵌入方法
    detect_platform_config()
    
    if(OS_TYPE STREQUAL "LINUX")
        # Linux平台：使用objcopy
        add_custom_command(
            OUTPUT ${OUTPUT_OBJ}
            COMMAND ${CMAKE_OBJCOPY} 
                -I binary 
                -O ${OBJCOPY_FORMAT}
                -B ${OBJCOPY_ARCH}
                --rename-section .data=.rodata,alloc,load,readonly,data,contents
                ${RESOURCE_FILE} ${OUTPUT_OBJ}
            DEPENDS ${RESOURCE_FILE}
            COMMENT "嵌入资源 [Linux]: ${FILENAME} (${OBJCOPY_FORMAT})"
            VERBATIM
        )
        
    elseif(OS_TYPE STREQUAL "WINDOWS")
        # Windows平台：使用rc编译器生成资源文件
        set(RC_FILE "${CMAKE_CURRENT_BINARY_DIR}/resources/${FILE_BASE}.rc")
        set(RES_FILE "${CMAKE_CURRENT_BINARY_DIR}/resources/${FILE_BASE}.res")
        
        # 生成.rc文件
        file(WRITE ${RC_FILE} "
#include <windows.h>
${SYMBOL_NAME} RCDATA \"${RESOURCE_FILE}\"
")
        
        # 编译资源文件
        if(CMAKE_CXX_COMPILER_ID MATCHES "MSVC")
            add_custom_command(
                OUTPUT ${OUTPUT_OBJ}
                COMMAND rc /fo ${RES_FILE} ${RC_FILE}
                COMMAND link /lib /machine:${ARCH_BITS} /out:${OUTPUT_OBJ} ${RES_FILE}
                DEPENDS ${RESOURCE_FILE} ${RC_FILE}
                COMMENT "嵌入资源 [Windows MSVC]: ${FILENAME}"
                VERBATIM
            )
        else()
            # MinGW
            add_custom_command(
                OUTPUT ${OUTPUT_OBJ}
                COMMAND windres ${RC_FILE} -o ${OUTPUT_OBJ}
                DEPENDS ${RESOURCE_FILE} ${RC_FILE}
                COMMENT "嵌入资源 [Windows MinGW]: ${FILENAME}"
                VERBATIM
            )
        endif()
        
    elseif(OS_TYPE STREQUAL "MACOS")
        # macOS平台：使用ld -r
        add_custom_command(
            OUTPUT ${OUTPUT_OBJ}
            COMMAND ld -r -sectcreate __TEXT __const ${RESOURCE_FILE} -o ${OUTPUT_OBJ}
            DEPENDS ${RESOURCE_FILE}
            COMMENT "嵌入资源 [macOS]: ${FILENAME}"
            VERBATIM
        )
        
    else()
        # 未知平台，回退到C数组生成
        set(CPP_FILE "${CMAKE_CURRENT_BINARY_DIR}/resources/${FILE_BASE}.cpp")
        
        # 生成C++数组
        file(READ ${RESOURCE_FILE} HEX_CONTENT HEX)
        string(REGEX REPLACE "([0-9a-f][0-9a-f])" "0x\\1, " HEX_ARRAY ${HEX_CONTENT})
        
        file(WRITE ${CPP_FILE} "
#include <cstddef>
#include <cstdint>
extern \"C\" {
    const uint8_t _binary_${SYMBOL_NAME}_start[] = { ${HEX_ARRAY} };
    const uint8_t _binary_${SYMBOL_NAME}_end[] = { ${HEX_ARRAY} };
    const size_t _binary_${SYMBOL_NAME}_size = sizeof(_binary_${SYMBOL_NAME}_start);
}
")
        
        add_custom_command(
            OUTPUT ${OUTPUT_OBJ}
            COMMAND ${CMAKE_CXX_COMPILER} -c ${CPP_FILE} -o ${OUTPUT_OBJ}
            DEPENDS ${RESOURCE_FILE} ${CPP_FILE}
            COMMENT "嵌入资源 [Fallback]: ${FILENAME}"
            VERBATIM
        )
    endif()
    
    # 标记为目标文件
    set_source_files_properties(${OUTPUT_OBJ} PROPERTIES
        EXTERNAL_OBJECT TRUE
        GENERATED TRUE
    )
endfunction()

# 主函数：嵌入资源到目标
function(embed_resources TARGET)
    # 如果没有提供资源文件，直接返回
    if(NOT ARGN)
        message(STATUS "没有指定要嵌入的资源文件")
        return()
    endif()
    
    # 创建资源目录
    set(RESOURCES_BIN_DIR "${CMAKE_CURRENT_BINARY_DIR}/embedded_resources")
    file(MAKE_DIRECTORY ${RESOURCES_BIN_DIR})
    
    # 创建一个头文件来声明所有资源
    set(HEADER_FILE "${RESOURCES_BIN_DIR}/embedded_resources.h")
    
    # 生成头文件
    file(WRITE ${HEADER_FILE} 
"#ifndef EMBEDDED_RESOURCES_H
#define EMBEDDED_RESOURCES_H

#include <cstddef>
#include <cstdint>

#ifdef __cplusplus
extern \"C\" {
#endif

")
    
    # 处理每个资源文件
    set(ALL_OBJ_FILES "")
    foreach(RESOURCE ${ARGN})
        get_filename_component(FILENAME ${RESOURCE} NAME)
        string(REPLACE "." "_" SYMBOL_NAME ${FILENAME})
        
        # 设置输出对象文件路径
        set(OUTPUT_OBJ "${RESOURCES_BIN_DIR}/${FILENAME}.o")
        
        # 转换资源
        convert_resource_to_obj(${TARGET} ${RESOURCE} ${OUTPUT_OBJ})
        
        # 收集所有目标文件
        list(APPEND ALL_OBJ_FILES ${OUTPUT_OBJ})
        
        # 在头文件中添加声明
        file(APPEND ${HEADER_FILE} 
"extern const uint8_t _binary_${SYMBOL_NAME}_start[];
extern const uint8_t _binary_${SYMBOL_NAME}_end[];
extern const size_t _binary_${SYMBOL_NAME}_size;
")
    endforeach()
    
    # 完成头文件
    file(APPEND ${HEADER_FILE} 
"#ifdef __cplusplus
}
#endif

#endif // EMBEDDED_RESOURCES_H
")
    
    # 将生成的目标文件添加到目标依赖
    target_sources(${TARGET} PRIVATE ${ALL_OBJ_FILES})
    
    # 添加包含目录
    target_include_directories(${TARGET} PRIVATE ${RESOURCES_BIN_DIR})
    
    # 确保目标文件被链接
    foreach(OBJ_FILE ${ALL_OBJ_FILES})
        target_sources(${TARGET} PRIVATE ${OBJ_FILE})
    endforeach()
    
    message(STATUS "已嵌入 ${CMAKE_MATCH_COUNT} 个资源文件到目标 ${TARGET}")
endfunction()
```