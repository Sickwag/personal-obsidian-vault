## 算法题解
### 敲桌子
```C++
#include<iostream>
using namespace std;
int main(){
    int count, i;
    for (i = 1; i <= 100; i++){
        if (i %7 == 0 || i/10==7 || i % 10 == 7){
            cout << "knock the desk !" << endl;
        }else{
            cout << "now is the number : " << i << endl;
        }
    }
}
```

### 九九乘法表
```C++
#include <iostream>
using namespace std;
int main(){
    for (int line = 1; line <= 9;line++){
        for (int column = 1; column <= line;column++){
            cout << column << " * " << line << " = " << line * column<<"\t";
        }
        cout << endl;
    }
}
```

### 体重最重
```C++
#include <iostream>
using namespace std;
int main(){
    int weigh[5] = {1, 2, 3, 4, 5};
    int max = weigh[0];
    for (int i = 0; i < 5;i++){
        if (max < weigh[i]){
            max = weigh[i];
        }
    }
    cout << "the max is :" << max << endl;
    return 0;
}
```

### 数组元素逆序
```C++
#include <iostream>
#include<algorithm>   //reverse函数
#include<vector>	//定义vector数组才有begin和end迭代器，普通数组没有
using namespace std;
int main()
{
    vector<int> vec = {1, 2, 3, 4, 5};
    int length = vec.size();
    reverse(vec.begin(),vec.end());
    for (int i = 0; i < length; i++){
        cout << vec[i] << endl;
    }
        return 0;
}
```

### 电影打分机制
```C++
#include <iostream>
using namespace std;
int main()
{
    int star;
    cout << "input degree :1~5\t";
    cin >> star;
    switch (star)
    {
    case 5:
    cout << "perfect\n";
        break;
    case 4:
        cout << "excellent\n";
        break;
    case 3:
        cout << "good\n";
        break;
    case 2:
        cout << "fine\n";
        break;
    case 1:
        cout << "crack\n";
        break;
    default:
        cout << "invaild number ,you should input number 1~5 ! ";
        break;
    }
    return 0;
}
```

### 水仙花数
```C++
#include<cmath>
#include<iostream>
int main(){
    using namespace std;
    int i=100;

    while(i>=100&&i<1000){
        int hundred = i / 100;
        int tenth = (i - 100 * hundred) / 10;
        int bit = (i - 100 * hundred - 10 * tenth);
        if (i == pow(hundred, 3) + pow(tenth, 3) + pow(bit, 3)){
            cout << i << " is shuixianhuashu \n";
        }
        i++;
    }
    return 0;
}
```

### 成绩录入系统
![C++ Basics \> 基于范围的 for 循环](C++%20Basics.md#基于范围的%20for%20循环) ]
### 通讯录管理系统
```C++
/*
通讯录是一个可以记录亲人、好友信息的工具。

本教程主要利用C++来实现一个通讯录管理系统

系统中需要实现的功能如下：

* 添加联系人：向通讯录中添加新人，信息包括（姓名、性别、年龄、联系电话、家庭住址）最多记录1000人
* 显示联系人：显示通讯录中所有联系人信息
* 删除联系人：按照姓名进行删除指定联系人
* 查找联系人：按照姓名查看指定联系人信息
* 修改联系人：按照姓名重新修改指定联系人
* 清空联系人：清空通讯录中所有信息
* 退出通讯录：退出当前使用的通讯录

*/

// menu sys
#include <iostream>
#include <string>
#define MAX 1000

using namespace std;
void showMenu()
{
    cout << "****************************************\n"
         << "*********\t1.添加联系人\t********\n"
         << "*********\t2.显示联系人\t********\n"
         << "*********\t3.删除联系人\t********\n"
         << "*********\t4.查找联系人\t********\n"
         << "*********\t5.修改联系人\t********\n"
         << "*********\t6.清空联系人\t********\n"
         << "*********\t0.退出通讯录\t********\n"
         << "****************************************\n";
}
struct Person
{ // 定义每一个联系人信息,every person is a struct ,has 5 attributes
    string m_Name;
    int m_Sex;
    int m_Age;
    string m_Phone;
    string m_Addr;
};
struct Addressbooks
{//addressbook is an struct ,each element is a person
    struct Person personArray[MAX];
    int m_Size;
};
// add person function

void AddorModifyInfo(Addressbooks *abs,int sequence){

    /*
    core function ,add and modify have to call it beacuse they have simmilar module
    add--- check the wherther the content == MAX and add 'abs->m_Size ++;' update the m_size
    */
    // name
    string name;
    cout << "please input the name : ";
    cin >> name;
    abs->personArray[sequence].m_Name = name;
    // gender
    cout << "input the gender :\n"
         << "1------male\n"
         << "2------female\n"
         << endl;
    int sex = 0;
    while (true)
    {
        cin >> sex;
        if (sex == 1 || sex == 2)
        {
            abs->personArray[sequence].m_Sex = sex;
            break;
        }
        cout << "please input number 1 or 2\n";
        }

        // age
        int age = 0;
        cout << "input the age :\n";
        cin >> age;
        abs->personArray[sequence].m_Age = age;
        // phone
        int phone = 0;
        cout << "input the phone number :\n";
        cin >> phone;
        abs->personArray[sequence].m_Phone = phone;
        // addre
        string address;
        cout << "input the address :\n";
        cin >> address;
        abs->personArray[sequence].m_Addr = address;
        // update the m_size
        cout << "you have add a new contact ";
        std::system("pause");
        std::system("cls");
}

void addPerson(Addressbooks *abs)
{
    if (abs->m_Size == MAX)
    { // judge whether the book it is full
        cout << "the dialogue book is full" << endl;
        return;
    }
    else
    {
        AddorModifyInfo(abs, abs->m_Size);
        abs->m_Size++;
    }
}

// display all info
void showPerson(Addressbooks * abs)
{
    if (abs->m_Size == 0)
    {
        cout << "we have nothing to display \n";
    }
    else
    {
        for (int i = 0; i < abs->m_Size; i++)
        {
            cout << " name: " << abs->personArray[i].m_Name << "\t";
            cout << " sex: " << (abs->personArray[i].m_Sex == 1 ? "male" : "female") << "\t";
            cout << " age: " << abs->personArray[i].m_Age << "\t";
            cout << " phone: " << abs->personArray[i].m_Phone << "\t";
            cout << " address: " << abs->personArray[i].m_Addr << "\t\n";
        }
    }
    std::system("pause");
    std::system("cls");
}

// delete info if contact is exist return the position in array,either -1

int isExist(Addressbooks *abs, string name)
{
    // receipt argument make function know where to check the info

    for (int i = 0; i < abs->m_Size; i++)
    {
        if (abs->personArray[i].m_Name == name){
            return i;
        }
    }
    return -1; // in C++ return 0 means the process is fine,so use -1
    // if not found return the sequence in array
}

void deletePerson(Addressbooks *abs)
{
    cout << "please input the contact you wanna delete :";
    string name; // case 3 hase declare var name string ,omit
    cin >> name;
    int res = isExist(abs, name);
    if (res != 1){
        for (int i = res; i < abs->m_Size;i++){
            abs->personArray[i] = abs->personArray[i + 1];
            //attension ! assign the lastest var to the forehead var
            abs->m_Size--; // overwriter forward 1 seat
        }
        cout << "you have delete the " << name << endl;
    }else{
        cout << "we have found no one ";
    }
    std::system("pause");
    std::system("cls");
}
void findPerson(Addressbooks *abs){
    //find someone in special
    cout << "please input the name you wanna find :";
    string name;
    cin >> name;
    int ret = isExist(abs, name);
    if (ret != -1){
        cout << "name:" << abs->personArray[ret].m_Name << "\t";
        cout << "gender:" << abs->personArray[ret].m_Sex << "\t";
        cout << "age:" << abs->personArray[ret].m_Age << "\t";
        cout << "phone:" << abs->personArray[ret].m_Phone << "\t";
        cout << "addr:" << abs->personArray[ret].m_Addr << endl;
    }else{
        cout << "we have found no one ";
    }
    std::system("pause");
    std::system("cls");
}
void modifyPerson(Addressbooks *abs){
    cout << "please input the name to modify the corresponding info :";
    string name;
    cin >> name;
    int ret = isExist(abs, name);
    if (ret != -1){
        AddorModifyInfo(abs, ret);
    }
}

void truncateinfo(Addressbooks *abs)
{
    cout << "are you sure to truncate all info you have storage ?\n";
    cout << "input \"YES\" to certify, \"NO\"to back the menu : ";
    while (true){
        string choose;
        cin >> choose;
        if (choose == "YES")
        {
            abs->m_Size = 0;
            break;
        }
        else if (choose == "NO")
        {
            cout << "OK" << endl;
            break;
        }
        else
        {
            cout << "please input \"YES\" or \"NO\" !";
        }
    }
}
    int main()
    {
        int select = 0;
        Addressbooks abs;
        abs.m_Size = 0;
        while (true)
        {
            showMenu();
            cin >> select;
            switch (select)
            {
            case 1:
                addPerson(&abs);
                break;
            case 2:
                showPerson(&abs);
                break;
            case 3:
                deletePerson(&abs);
                break;
            case 4:
                findPerson(&abs);
                break;
            case 5:
                modifyPerson(&abs);
                break;
            case 6:
                truncateinfo(&abs);
                break;
            case 0:
                cout << "welcome to use this system next time";
                return 0;
                break;
            default:
                break;
            }
        }
    }
```

## C++ Prime Plus
### 第五章编程练习题
```cpp
//chapter 5 practice

void input_2_numbers(){
    int first, second, result = 0;
    cin >> first >> second;
    for (int i = first; i <= second; i ++){
        result += i;
    }
    cout << "the result : " << result << endl;
}

void refactoring_program_5_4(){
    const int artSize = 100;
    long double factorials[artSize];
    factorials[0] = factorials[1] = 1;
    for (int i = 2; i <= artSize; i++){
        factorials[i] = factorials[i - 1] * i;
    }
    for (int k = 0; k < artSize;k++){
        cout << k << "! =" << ios::fixed << factorials[k] << endl;
    }
}

void ask_for_input(){
    int input;
    int sum = 0;
    while(true){
        char flowing_input= ' ';
        cin >> input;
        if (cin.fail()){
            flowing_input = cin.get();
            cin.clear();
            cin.ignore(numeric_limits<streamsize>::max(), '\n');
            if (flowing_input == 'q'){
                break;
            }
            cerr << "invalid input !" << endl;
        }else{
            sum += input;
            cout << sum << endl;
        }
    }
}
void get_words(){
    char input_word[]{};
    int word_count = 0;
    while(true){
        cin >> input_word;
        if (strcmp(input_word, "done") == 0){
            cout << "you have inputted : " << word_count << endl;
            break;
        }
        word_count++;
    }
}


void get_word_string_version(){
    string input_word;
    int word_count = 0;
    while(true){
        cin >> input_word;
        if (input_word == "done"){
            cout << "you have inputted : " << word_count << endl;
            break;
        }
        word_count++;
    }
}

void display_the_asterisk(){
    int count;
    cin >> count;
    for (int row = 4; row > 0; row --){
        for (int col = 0; col < row; col ++){
            cout << ".";
        }
        for (int col = 0; col < 5 - row;col++)
            cout << "*";
        cout << endl;
    }
}
void ask_for_input(){
    int sum = 0;
    std::string input;
    while(true){
        std::cin >> input;
        if(input == "q"){
            break;
        }
        try {
            int num = std::stoi(input);
            sum += num;
            std::cout << sum << std::endl;
        } catch (const std::invalid_argument& e) {
            std::cout << "Please enter a valid number or 'q' to quit." << std::endl;
        }
    }
}
int main(){
    input_2_numbers();
    refactoring_program_5_4();
    ask_for_input();
    get_words();
    get_word_string_version();
    display_the_asterisk();
}
```

## 读写文件
### 检查文件是否而二进制文件
#### 可疑字符比例换算法
```cpp
#include <fstream>
#include <cctype>

bool is_likely_text_file(const std::string& filename, 
                        size_t max_check = 4096) {
    std::ifstream file(filename, std::ios::binary);
    if (!file) return false;
    
    unsigned char c;
    size_t bytes_checked = 0;
    size_t suspicious_chars = 0;
    
    while (file.read(reinterpret_cast<char*>(&c), 1) && 
           bytes_checked < max_check) {
        bytes_checked++;
        
        // 二进制文件的强烈迹象
        if (c == 0) return false; // NULL字节
        
        // 控制字符（除了常见的空白字符）
        if (c < 32 && c != 9 && c != 10 && c != 13 && c != 26) {
            suspicious_chars++;
        }
        
        // 如果可疑字符超过一定比例
        if (suspicious_chars > max_check / 100) { // 1%
            return false;
        }
    }
    
    // 如果文件为空或全是可打印字符
    return bytes_checked > 0;
}
```
#### 检查二进制控制字符
```cpp
#include <fstream>
#include <iostream>
#include <cctype>

bool is_binary_file(const std::string& filename) {
    std::ifstream file(filename, std::ios::binary);
    if (!file) {
        return false; // 无法打开
    }
    
    char buffer[1024];
    size_t bytes_read = 0;
    const size_t max_check = 4096; // 检查前4KB通常足够
    
    while (file.read(buffer, sizeof(buffer)) && bytes_read < max_check) {
        size_t chunk_size = file.gcount();
        
        for (size_t i = 0; i < chunk_size; ++i) {
            unsigned char c = buffer[i];
            
            // ASCII控制字符（除了\t, \n, \r）
            if (c < 32 && c != 9 && c != 10 && c != 13) { // 9=\t, 10=\n, 13=\r
                return true; // 找到二进制控制字符
            }
            
            // 检查UTF-8 BOM（可选）
            if (bytes_read + i == 0 && c == 0xFF) {
                // 可能的UTF-8 BOM开始
                if (chunk_size > 2 && 
                    static_cast<unsigned char>(buffer[1]) == 0xFE &&
                    static_cast<unsigned char>(buffer[2]) == 0xFF) {
                    return false; // UTF-16 BE BOM，其实是文本
                }
            }
        }
        
        bytes_read += chunk_size;
    }
    
    return false; // 很可能是文本文件
}
```
### C++读写二进制文件
```cpp
struct Record {
    int id;
    string name;
    double value;
};


bool writeRecordsToFile(const string& filename, const vector<Record>& records) {
    ofstream file(filename, ios::out | ios::binary);
    if (!file) {
        return false;
    }
    for (const auto& iteration_record : records) {
        file.write(reinterpret_cast<const char*>(&iteration_record.id), sizeof(iteration_record.id));
        // Write the length of the name
        size_t nameLength = iteration_record.name.size();
        file.write(reinterpret_cast<const char*>(&nameLength), sizeof(nameLength));
        // Write the name characters
        file.write(iteration_record.name.data(), nameLength);
        file.write(reinterpret_cast<const char*>(&iteration_record.value), sizeof(iteration_record.value));
    }
    file.close();
    return true;
}

bool readRecordsFromFile(const string& filename, vector<Record>& records) {
    ifstream file(filename, ios::in | ios::binary);
    if (!file) {
        return false;
    }
    Record record;
    while (file.read(reinterpret_cast<char*>(&record.id), sizeof(record.id))) {
        // Read the length of the name
        size_t nameLength;
        file.read(reinterpret_cast<char*>(&nameLength), sizeof(nameLength));
        record.name.resize(nameLength);
        // Read the name characters
        file.read(&record.name[0], nameLength);
        file.read(reinterpret_cast<char*>(&record.value), sizeof(record.value));
        records.push_back(record);
    }
    file.close();
    return true;
}

int main() {
    vector<Record> records = {
        {1, "Alice", 23.5},
        {2, "Bob", 45.6},
        {3, "Charlie", 67.7}
    };

    if (writeRecordsToFile("records.dat", records)) {
        cout << "Records written to file successfully." << endl;
    } else {
        cout << "Failed to write records to file." << endl;
    }

    vector<Record> loadedRecords;
    if (readRecordsFromFile("records.dat", loadedRecords)) {
        cout << "Records read from file successfully." << endl;
        for (const auto& iteration_record : loadedRecords) {
            cout << "ID: " << iteration_record.id << "\tName: " << iteration_record.name << "\tValue: " << iteration_record.value << endl;
        }
    } else {
        cout << "Failed to read records from file." << endl;
    }
    return 0;
}
```
### 目录中所有代码文件整理为 md 文件
```cpp
#include <filesystem>
#include <fstream>
#include <iostream>
#include <algorithm>
#include <string>
#include <vector>

namespace fs = std::filesystem;

bool mergeFilesInDirectory(const std::string& sourceDir,
                           const std::string& outputFile) {
    if (!fs::exists(sourceDir) || !fs::is_directory(sourceDir)) {
        std::cerr << "错误：源目录不存在或不是目录" << std::endl;
        return false;
    }

    std::ofstream outFile(outputFile, std::ios::binary);
    if (!outFile.is_open()) {
        std::cerr << "错误：无法创建输出文件" << std::endl;
        return false;
    }

    const size_t bufferSize = 65536;  // 64KB
    std::vector<char> buffer(bufferSize);

    size_t fileCount = 0;

    for (const auto& entry : fs::recursive_directory_iterator(sourceDir)) {
        if (entry.is_regular_file()) {
            std::string relativePath = fs::relative(entry.path(), sourceDir).string();

            std::ifstream inFile(entry.path(), std::ios::binary);
            if (!inFile.is_open()) {
                std::cerr << "警告：无法打开文件 " << relativePath << "，跳过" << std::endl;
                continue;
            }
            outFile << "\n文件名: " << relativePath << "\n```cpp\n";
            while (inFile.read(buffer.data(), bufferSize)) {
                outFile.write(buffer.data(), bufferSize);
            }
            if (inFile.gcount() > 0) {
                outFile.write(buffer.data(), inFile.gcount());
            }
            outFile << "\n```\n";

            inFile.close();
            fileCount++;

            std::cout << "已处理文件: " << relativePath << std::endl;
        }
    }
    outFile << "\n```\n\n";

    outFile.close();

    std::cout << "完成！共处理 " << fileCount << " 个文件" << std::endl;
    return true;
}

int main(int argc, char** argv) {
    std::string sourceDirectory = argv[1];  // 源目录
    std::string outputFile = "./merged_output.txt";  // 输出文件

    if (mergeFilesInDirectory(sourceDirectory, outputFile)) {
        std::cout << "文件合并成功完成！" << std::endl;
    } else {
        std::cout << "文件合并失败！" << std::endl;
    }
    return 0;
}

```
- 并没有实现 exclude 排除规则，默认读取文件夹中所有文件。
## 发送邮件程序
### python 版本
[[Python编程三剑客#发送邮件脚本]]，分[[Python编程三剑客#发送邮件脚本#简易硬编码参数版本|硬编码]] 和[[Python编程三剑客#发送邮件脚本#命令行解析参数版本|参数解析]]版本
### C++ curl 库版本
#### 定义
```cpp
#pragma once
#include <string>
#include <vector>

struct EmailData {
    std::vector<std::string> parts;
    size_t current_part;
    size_t pos_in_part;
};

class SimpleEmailSender {
   public:
    /**
     * @note 建议主函数开头使用curl_global_init(CURL_GLOBAL_DEFAULT)，发送完邮件后使用curl_global_cleanup()，释放资源，不建议纳入send_email函数中，否则建立连接和释放连接开销较大
     */
    bool send_email(const std::string& smtp_server,
                           int port,
                           const std::string& username,
                           const std::string& password,
                           const std::string& from,
                           const std::string& to,
                           const std::string& subject,
                           const std::string& body,
                           const std::vector<std::string>& attachments);
   private:
    std::string simple_base64_encode(const std::string& data);
    std::vector<std::string> encode_file_chunks(const std::string& filepath);
    std::string get_filename(const std::string& filepath);
    void prepare_email_content(EmailData& email_data,
                               const std::string& from,
                               const std::string& to,
                               const std::string& subject,
                               const std::string& body,
                               const std::vector<std::string>& attachments);
    size_t payload_source(void* ptr, size_t size, size_t nmemb, void* userp);
};
```
添加了 base 64 简易文件加密
#### 实现
```cpp
#include "email_sender.h"
#include <curl/curl.h>
#include <algorithm>
#include <fstream>
#include <iostream>
#include <sstream>
#include <string>
#include <vector>

// 简单的base64编码（简化版）
std::string SimpleEmailSender::simple_base64_encode(const std::string& data) {
    static const char* chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    std::string result;
    int val = 0, valb = -6;

    for (unsigned char c : data) {
        val = (val << 8) + c;
        valb += 8;
        while (valb >= 0) {
            result.push_back(chars[(val >> valb) & 0x3F]);
            valb -= 6;
        }
    }
    if (valb > -6)
        result.push_back(chars[((val << 8) >> (valb + 8)) & 0x3F]);
    while (result.size() % 4)
        result.push_back('=');
    return result;
}

// 分块读取文件并编码
std::vector<std::string> SimpleEmailSender::encode_file_chunks(const std::string& filepath) {
    std::vector<std::string> chunks;
    std::ifstream file(filepath, std::ios::binary);
    if (!file.is_open()) {
        throw std::runtime_error("Cannot open file: " + filepath);
    }

    const size_t chunk_size = 57;  // base64编码后为76字符
    char buffer[chunk_size];

    while (file.read(buffer, chunk_size) || file.gcount() > 0) {
        std::string chunk(buffer, file.gcount());
        chunks.push_back(simple_base64_encode(chunk) + "\r\n");
    }

    return chunks;
}

std::string SimpleEmailSender::get_filename(const std::string& filepath) {
    size_t pos = filepath.find_last_of("/\\");
    return (pos != std::string::npos) ? filepath.substr(pos + 1) : filepath;
}

// 准备邮件内容
void SimpleEmailSender::prepare_email_content(EmailData& email_data,
                                              const std::string& from,
                                              const std::string& to,
                                              const std::string& subject,
                                              const std::string& body,
                                              const std::vector<std::string>& attachments) {
    std::string boundary = "----=_NextPart_SimpleBoundary";

    if (attachments.empty()) {
        // 简单邮件
        std::stringstream ss;
        ss << "From: " << from << "\r\n"
           << "To: " << to << "\r\n"
           << "Subject: " << subject << "\r\n"
           << "\r\n"
           << body << "\r\n"
           << ".\r\n";
        email_data.parts.push_back(ss.str());
    } else {
        std::stringstream ss;
        ss << "From: " << from << "\r\n"
           << "To: " << to << "\r\n"
           << "Subject: " << subject << "\r\n"
           << "MIME-Version: 1.0\r\n"
           << "Content-Type: multipart/mixed; boundary=" << boundary << "\r\n"
           << "\r\n"
           << "This is a multi-part message in MIME format.\r\n"
           << "--" << boundary << "\r\n"
           << "Content-Type: text/plain; charset=UTF-8\r\n"
           << "\r\n"
           << body << "\r\n";
        email_data.parts.push_back(ss.str());

        // 每个附件
        for (const auto& filepath : attachments) {
            try {
                // 附件分隔符
                std::stringstream header_ss;
                header_ss << "\r\n--" << boundary << "\r\n"
                          << "Content-Type: application/octet-stream\r\n"
                          << "Content-Transfer-Encoding: base64\r\n"
                          << "Content-Disposition: attachment; filename=\"" << get_filename(filepath) << "\"\r\n"
                          << "\r\n";
                email_data.parts.push_back(header_ss.str());

                // 附件内容（分块添加）
                auto chunks = encode_file_chunks(filepath);
                for (const auto& chunk : chunks) {
                    email_data.parts.push_back(chunk);
                }
            } catch (const std::exception& e) {
                std::cerr << "Warning: Failed to process attachment " << filepath << ": " << e.what() << std::endl;
            }
        }

        // 结束边界
        std::stringstream end_ss;
        end_ss << "\r\n--" << boundary << "--\r\n.\r\n";
        email_data.parts.push_back(end_ss.str());
    }
}

size_t SimpleEmailSender::payload_source(void* ptr, size_t size, size_t nmemb, void* userp) {
    EmailData* data = static_cast<EmailData*>(userp);
    size_t max_size = size * nmemb;
    size_t copied = 0;
    char* buffer = static_cast<char*>(ptr);

    while (data->current_part < data->parts.size() && copied < max_size) {
        const std::string& part = data->parts[data->current_part];
        size_t part_remaining = part.size() - data->pos_in_part;

        if (part_remaining > 0) {
            // size_t to_copy = std::min(max_size - copied, part_remaining);
            size_t to_copy = max_size - copied > part_remaining ? part_remaining : max_size - copied;
            memcpy(buffer + copied, part.data() + data->pos_in_part, to_copy);
            data->pos_in_part += to_copy;
            copied += to_copy;
        }

        if (data->pos_in_part >= part.size()) {
            data->current_part++;
            data->pos_in_part = 0;
        }
    }
    return copied;
}

bool SimpleEmailSender::send_email(const std::string& smtp_server,
                                   int port,
                                   const std::string& username,
                                   const std::string& password,
                                   const std::string& from,
                                   const std::string& to,
                                   const std::string& subject,
                                   const std::string& body,
                                   const std::vector<std::string>& attach_files) {
    CURL* curl = curl_easy_init();
    if (!curl)
        return false;

    CURLcode res = CURLE_OK;
    struct curl_slist* recipients = nullptr;

    // 设置基本SMTP参数
    std::string url = "smtp://" + smtp_server + ":" + std::to_string(port);
    curl_easy_setopt(curl, CURLOPT_URL, url.c_str());
    curl_easy_setopt(curl, CURLOPT_USE_SSL, (long)CURLUSESSL_ALL);
    curl_easy_setopt(curl, CURLOPT_USERNAME, username.c_str());
    curl_easy_setopt(curl, CURLOPT_PASSWORD, password.c_str());
    curl_easy_setopt(curl, CURLOPT_MAIL_FROM, from.c_str());

    recipients = curl_slist_append(recipients, to.c_str());
    curl_easy_setopt(curl, CURLOPT_MAIL_RCPT, recipients);

    // 准备邮件数据
    EmailData email_data = {};
    email_data.current_part = 0;
    email_data.pos_in_part = 0;

    try {
        prepare_email_content(email_data, from, to, subject, body, attach_files);
    } catch (const std::exception& e) {
        std::cerr << "Error preparing email: " << e.what() << std::endl;
        curl_slist_free_all(recipients);
        curl_easy_cleanup(curl);
        return false;
    }

    // 设置数据读取回调
    curl_easy_setopt(curl, CURLOPT_READFUNCTION, payload_source);
    curl_easy_setopt(curl, CURLOPT_READDATA, &email_data);
    curl_easy_setopt(curl, CURLOPT_UPLOAD, 1L);
    // curl_easy_setopt(curl, CURLOPT_VERBOSE, 1L); // send email process debug

    res = curl_easy_perform(curl);

    if (res != CURLE_OK) {
        std::cerr << "curl_easy_perform() failed: " << curl_easy_strerror(res) << std::endl;
    }else {
        std::cout << "send email from " + from + " to " + to + " successfully!";
    }

    curl_slist_free_all(recipients);
    curl_easy_cleanup(curl);

    return res == CURLE_OK;
}
```
## MySQL 数据库程序
### qt QSQL 编程
```cpp
#ifndef MYSQL_LOGIN_PAGE_H
#define MYSQL_LOGIN_PAGE_H

#include <QWidget>
#include <QtSql/QSqlDatabase>


QT_BEGIN_NAMESPACE
namespace Ui {
class mysql_login_page;
}
QT_END_NAMESPACE

class mysql_login_page : public QWidget
{
    Q_OBJECT

public:
    mysql_login_page(QWidget *parent = nullptr);
    ~mysql_login_page();

private:
    Ui::mysql_login_page *ui;
    QSqlDatabase default_db;


private slots:
    void on_button_login_clicked();
    void on_button_register_clicked();
};
#endif // MYSQL_LOGIN_PAGE_H


#include "./ui_mysql_login_page.h"
#include "mysql_login_page.h"
#include <QDebug>
#include <QSqlError>
#include <QMessageBox>
#include <QCryptographicHash>
#include <QSqlQuery>

mysql_login_page::mysql_login_page(QWidget *parent)
    : QWidget(parent)
    , ui(new Ui::mysql_login_page), default_db(QSqlDatabase::addDatabase("QMYSQL", "default mysql db"))
{
    ui->setupUi(this);
    ui->lineedit_account->setMaxLength(11);
    ui->lineedit_password->setEchoMode(QLineEdit::EchoMode::Password);
    ui->lineedit_password->setMaxLength(8);

    // mysql -h mysql2.sqlpub.com -P 3307 -usickwag -pLqX9jBDqvDJYeooE

    default_db.setHostName("mysql2.sqlpub.com");
    default_db.setPort(3307);
    default_db.setDatabaseName("sickwag_learning");
    default_db.setUserName("sickwag");
    default_db.setPassword("LqX9jBDqvDJYeooE");

    if (!default_db.open()) {
        qDebug() << "MySQL connect failed:";
        qDebug() << "Error:" << default_db.lastError().text();
        qDebug() << "Error Code:" << default_db.lastError();
        qDebug() << "Connection name:" << default_db.connectionName();
        qDebug() << "Host:" << default_db.hostName();
        qDebug() << "Port:" << default_db.port();
        qDebug() << "Database:" << default_db.databaseName();
        qDebug() << "Username:" << default_db.userName();
    } else {
        qDebug() << "MySQL connected successfully!";
    }
}

mysql_login_page::~mysql_login_page()
{
    delete ui;
}


void mysql_login_page::on_button_login_clicked()
{
    QString account = ui->lineedit_account->text();
    QString password = ui->lineedit_password->text();
    if(account.isEmpty() || password.isEmpty()){
        QMessageBox::warning(this, "error","account or password cannot be empty.");
        return;
    }

    QString password_hash = QString::fromUtf8(QCryptographicHash::hash(password.toUtf8(), QCryptographicHash::Sha256).toHex());

    qDebug() << "Login attempt - Account:" << account;
    qDebug() << "Login attempt - Password hash:" << password_hash;
    qDebug() << "Login attempt - Password hash length:" << password_hash.length();

    QSqlQuery query(default_db);
    QString sql_string = "select id, password_hash from qt_examples qe where qe.account = :account";
    query.prepare(sql_string);
    query.bindValue(":account", account);

    if(query.exec() && query.next()){
        QString stored_hash = query.value("password_hash").toString();
        qDebug() << "Stored hash from database:" << stored_hash;
        qDebug() << "Stored hash length:" << stored_hash.length();
        qDebug() << "Hashes match:" << (stored_hash == password_hash);

        if(stored_hash == password_hash){
            QMessageBox::information(this,"success","login successed");
        }else{
            QMessageBox::warning(this,"error","login failed");
        }
    }else{
        QMessageBox::warning(this,"error","login failed - account not found");
    }
}

void mysql_login_page::on_button_register_clicked()
{
    QString account = ui->lineedit_account->text();
    QString password = ui->lineedit_password->text();
    if(account.isEmpty() || password.isEmpty()){
        QMessageBox::warning(this,"error", "account or password cannot be empty.");
        return;
    }

    // 使用指定的数据库连接
    QSqlQuery query(default_db);
    QString sql_string = "select id from qt_examples qe where qe.account = ?";
    query.prepare(sql_string);
    query.addBindValue(account);

    if(query.exec() && query.size() == 0){
        qDebug() << QString(account + " is not in db, enable to register");
        // 现在我们使用.toHex()转换，确保和登录时一致
        QString password_hash = QString::fromUtf8(QCryptographicHash::hash(password.toUtf8(), QCryptographicHash::Sha256).toHex());
        qDebug() << "Register - Password hash to store:" << password_hash;
        qDebug() << "Register - Password hash length:" << password_hash.length();

        QString register_string = "insert into qt_examples(account, password_hash) values(?,?)";
        QSqlQuery reg_query(default_db);  // 使用指定的数据库连接
        reg_query.prepare(register_string);
        reg_query.addBindValue(account);
        reg_query.addBindValue(password_hash);

        if(reg_query.exec() && reg_query.numRowsAffected() == 1){
            QMessageBox::information(this,"success","register successed");
        } else {
            QMessageBox::warning(this,"error", QString("register failed: %1").arg(reg_query.lastError().text()));
        }
    } else {
        QMessageBox::warning(this,"error", "register failed, this account already existed.");
    }
}

```
### mysql-connector-cpp 链接模板
```cpp
// mysql_db.h
#pragma once

#include <algorithm>
#include <mysql_driver.h>
#include <cppconn/resultset.h>
#include <string>
#include <filesystem>
#include <iosfwd>
#include <fstream>
#include <vector>
#include <memory>
#include <cppconn/connection.h>
#include <cppconn/statement.h>
#include <cppconn/prepared_statement.h>
#include <cppconn/exception.h>
#include <list>
#include <unordered_map>
#include <unordered_set>
#include <chrono>
#include <format>

using ColumnInfo = std::unordered_map<std::string, std::unordered_set<std::string>>;

class MySQLDB {
public:
	MySQLDB(const std::string& host, int port, const std::string& user, const std::string& password, const std::string& db = "");
	MySQLDB(sql::ConnectOptionsMap options);

	ColumnInfo describe_table(std::string& table_name, const std::vector<std::string>& info = {"Field", "Type", "Null", "Key", "Default", "Extra"}) const;
	std::unique_ptr<sql::ResultSet> query(const std::string& sql);
	int execute(const std::string& sql);

	std::unique_ptr<sql::ResultSet> prepare_query(const std::string& sql, const std::vector<std::string>& params);
	int prepare_execute(const std::string& sql, const std::vector<std::string>& params);
	int prepare_execute(const std::string& sql, const std::vector<std::vector<std::string>>& params);

	void executeFromFile(const std::string& filePath);

	// 事务控制
	void begin_transaction();
	void commit();
	void rollback();

	bool is_connect() const;
	static void print_sql_error(const sql::SQLException& e);

private:

	std::unique_ptr<sql::Connection> con;
	sql::mysql::MySQL_Driver* driver;
};
```
---
```cpp
// mysql_db.cpp
#include "mysql_db.h"
#include <cppconn/connection.h>

MySQLDB::MySQLDB(const std::string& host, int port, const std::string& user, const std::string& password, const std::string& db_name) : driver(sql::mysql::get_driver_instance()) {
	std::string connStr = "tcp://" + host + ":" + std::to_string(port);
	con.reset(driver->connect(connStr, user, password));  // 更稳定，兼容多数认证方式

	if (!db_name.empty()) {
		con->setSchema(db_name);
	} else {
		throw std::runtime_error("undefined db schema!");
	}

	con->setAutoCommit(false);
}

MySQLDB::MySQLDB(sql::ConnectOptionsMap options) : driver(sql::mysql::get_driver_instance()) {
	con.reset(driver->connect(options));
	try {
		if (!options["schema"].get<sql::SQLString>()) {
			throw std::runtime_error("undefined db schema!");
		}
		con->setSchema(options["schema"].get<sql::SQLString>()->asStdString());
		con->setAutoCommit(false);
	}
	catch (const sql::SQLException& e) {
		print_sql_error(e);
	}
}

ColumnInfo MySQLDB::describe_table(std::string& table_name, const std::vector<std::string>& info) const {
	std::unique_ptr<sql::Statement> stmt(con->createStatement());
	std::unique_ptr<sql::ResultSet> res(stmt->executeQuery("DESC " + table_name + ";"));
	ColumnInfo ci;
	while (res->next()) {
		auto field = res->getString(info[0]);
		for (int i = 1; i < info.size(); i++) {
			ci[field].insert(res->getString(info[i]));
		}
	}
	return ci;
}

std::unique_ptr<sql::ResultSet> MySQLDB::query(const std::string& sql) {
	std::unique_ptr<sql::Statement> stmt(con->createStatement());
	sql::ResultSet* rawRes = stmt->executeQuery(sql);
	return std::unique_ptr<sql::ResultSet>(rawRes);
}

int MySQLDB::execute(const std::string& sql) {
	std::unique_ptr<sql::Statement> stmt(con->createStatement());
	int changed_rows = stmt->executeUpdate(sql);
	return changed_rows;
}
/*
std::vector<std::string> params = {"Bob", "28"};
db.prepareExecute("INSERT INTO users (name, age) VALUES (?, ?)", params);
*/

/**
 * @brief 执行带参数的 SQL 查询语句并返回结果集。
 *
 * @param sql 带占位符（`?`）的 SQL 查询语句。
 * @param params 参数列表，按顺序替换 SQL 中占位符。
 * @return std::unique_ptr<sql::ResultSet> 查询结果集的智能指针。
 * @throw sql::SQLException 如果 SQL 执行失败。
 *
 * @note 参数索引从 1 开始（JDBC 标准）。
 * @warning 不支持参数化表名或列名，仅支持值参数化。
 */
std::unique_ptr<sql::ResultSet> MySQLDB::prepare_query(
	const std::string& sql,
	const std::vector<std::string>& params
) {
	std::unique_ptr<sql::PreparedStatement> pstmt(con->prepareStatement(sql));
	for (size_t i = 0; i < params.size(); ++i) {
		pstmt->setString(i + 1, params[i]);  // 参数索引从 1 开始
	}
	sql::ResultSet* rawRes = pstmt->executeQuery();
	return std::unique_ptr<sql::ResultSet>(rawRes);
}


/**
 * @brief 执行带参数（如 INSERT, UPDATE, DELETE）的 SQL 查询语句并返回结果集。
 *
 * @param sql 带占位符（`?`）的 SQL 查询语句。
 * @param params 参数列表，按顺序替换 SQL 中占位符。
 * @return std::unique_ptr<sql::ResultSet> 查询结果集的智能指针。
 * @throw sql::SQLException 如果 SQL 执行失败。
 *
 * @note 参数索引从 1 开始（JDBC 标准）。
 * @warning 不支持参数化表名或列名，仅支持值参数化。
 */
int MySQLDB::prepare_execute(const std::string& sql, const std::vector<std::string>& params) {
	std::unique_ptr<sql::PreparedStatement> pstmt(con->prepareStatement(sql));
	for (size_t i = 0; i < params.size(); ++i) {
		pstmt->setString(i + 1, params[i]);
	}
	return pstmt->executeUpdate();
}
/**
 * @brief 批量执行带参数的 SQL 更新/插入语句。
 *
 * @param sql 带占位符（`?`）的 SQL 语句（适用于所有参数行）。
 * @param params 批量参数列表，每一行对应一次 SQL 执行的参数。
 * @return int 成功执行的语句数量。
 * @throw sql::SQLException 如果某条 SQL 执行失败。
 * @warning 批量操作不支持事务回滚，建议在调用前手动开启事务。
 * @code
 * ```cpp
 * std::vector<std::vector<std::string>> batchParams = {
 * 	{"Alice", "25"},
 * 	{"Bob", "30"}
 * };
 * int statementsExecuted = prepareExecute(
 * 	"INSERT INTO users (name, age) VALUES (?, ?)",
 * 	batchParams
 * );
 * std::cout << "Statements executed: " << statementsExecuted << std::endl;
 * ```
 */
int MySQLDB::prepare_execute(const std::string& sql, const std::vector<std::vector<std::string>>& params) {
	for (const auto& item : params) {
		prepare_execute(sql, item);
	}
	return params.size();
}

void MySQLDB::executeFromFile(const std::string& filePath) {
	std::ifstream f(filePath, std::ios::binary);
	if (!f.is_open()) {
		throw std::runtime_error("cannot open this file: " + filePath);
	}

	// skip utf-8 with bom 3 chars start
	char bom[3];
	f.read(bom, 3);
	if (!(bom[0] == '\xEF' && bom[1] == '\xBB' && bom[2] == '\xBF')) {
		f.seekg(0);
	}

	std::string line, statement;
	while (std::getline(f, line)) {
		line.erase(line.begin(), std::find_if(line.begin(), line.end(), [](unsigned char ch) {
			return !std::isspace(ch);
				   }));
		if (line.empty() || line.starts_with("--") || line.starts_with("#")) {
			continue;
		}
		statement += line;
	}

	// 逐条执行 SQL 语句（根据分号分隔）
	std::istringstream sqlStream(statement);
	std::string sqlStmt;
	while (std::getline(sqlStream, sqlStmt, ';')) {
		if (!sqlStmt.empty()) {
			std::unique_ptr<sql::Statement> stmt(con->createStatement());
			try {
				stmt->execute(sqlStmt + ';');  // 补全分号
			}
			catch (const sql::SQLException& e) {
				print_sql_error(e);
			}
		}
	}
	std::cout << "execute form " + filePath + "successfully!\n";
	f.close();
}

void MySQLDB::begin_transaction() {
	con->setAutoCommit(false);
}

void MySQLDB::commit() {
	con->commit();
}

void MySQLDB::rollback() {
	con->rollback();
}

bool MySQLDB::is_connect() const {
	return con && con->isValid();
}

void MySQLDB::print_sql_error(const sql::SQLException& e) {
	std::cerr << "sql error code: " << e.getErrorCode() << '\n'
		<< "sql statement: " << e.getSQLState() << '\n'
		<< "sql description: " << e.what();
}

```
### boost.mysql 异步连接版本
#### 定义
```cpp
#pragma once

#include <boost/asio.hpp>
#include <boost/mysql.hpp>
#include <boost/mysql/pfr.hpp>
#include <string_view>
#include <vector>
#include <stdexcept>
namespace mysql = boost::mysql;
namespace asio = boost::asio;
using asio::awaitable;
using asio::use_awaitable;

// 连接配置结构体
struct conn_cfg {
    std::string host;
    std::uint16_t port = 3306;
    std::string user;
    std::string password;
    std::string database;
    mysql::ssl_mode ssl = mysql::ssl_mode::disable;
};

// SQL错误异常类
struct sql_error : std::runtime_error {
    using std::runtime_error::runtime_error;
};

// 用户结构体示例
struct user {
    std::optional<int> id;
    std::optional<std::string> name;
};

// MySQL数据库操作类
class MySQLDB {
public:
    MySQLDB() = delete;

    /**
     * @param ex 通常传入io_context对象的executor，如果传入asio::this_coro::executor表示当前协程被 co_spawn 时绑定的那个 executor
     * @waring param ex 的生命周期必须要比MySQLDB类对象的长，否则会引发悬空引用
     */
    explicit MySQLDB(asio::any_io_executor ex) : conn_(ex) {}
    awaitable<void> connect(const conn_cfg& cfg);
    awaitable<size_t> execute(std::string_view sql);
    awaitable<size_t> execute_script(const std::string& script);
    awaitable<void> execute_multi(std::string_view sql_batch);

    template <typename... Args>
    awaitable<mysql::results> query(std::string_view sql, Args&&... args) {
        auto stmt = co_await conn_.async_prepare_statement(sql, use_awaitable);
        mysql::results res;
        co_await conn_.async_execute(stmt.bind(std::forward<Args>(args)...), res, use_awaitable);
        co_return res;
    }

    template <typename T>
    awaitable<std::vector<T>> query_into(std::string_view sql) {
        mysql::static_results<mysql::pfr_by_name<T>> res;
        co_await conn_.async_execute(sql, res);
        std::vector<T> results;
        if(res.rows().empty()) {
            throw std::runtime_error("sql matched nothing.");
            co_return std::vector<T>();
        }else{
            for(const auto& row : res.rows()){
                const T& res_struct = row;
                results.emplace_back(res_struct);
            }
        }
        co_return results;
    }
    awaitable<void> begin();
    awaitable<void> commit();
    awaitable<void> rollback();
    awaitable<void> close() noexcept;

private:
    mysql::any_connection conn_;
    static std::vector<std::string_view> split_script(const std::string& script);
};
```
#### 实现
```cpp
// MySQLDB.cpp
#include "MySQLDB.h"
#include <iostream>
#include <fstream>
#include <boost/algorithm/string/trim.hpp>

namespace mysql = boost::mysql;
namespace asio = boost::asio;
using asio::awaitable;
using asio::use_awaitable;

// 连接到数据库
awaitable<void> MySQLDB::connect(const conn_cfg& cfg) {
    mysql::connect_params params;
    params.server_address.emplace_host_and_port(cfg.host, cfg.port);
    params.username = cfg.user;
    params.password = cfg.password;
    params.database = cfg.database;
    params.ssl = cfg.ssl;

    co_await conn_.async_connect(params, use_awaitable);
}

// ---------- 1. 执行单条语句 ----------
awaitable<size_t> MySQLDB::execute(std::string_view sql) {
    mysql::results res;
    auto stmt = co_await conn_.async_prepare_statement(sql, use_awaitable);
    co_await conn_.async_execute(stmt.bind(), res, use_awaitable);
    if (res.affected_rows() == static_cast<std::uint64_t>(-1)){
        throw sql_error("execute failed");
    }
    co_return res.affected_rows();
}

// ---------- 2. 执行整个SQL脚本 ----------
awaitable<size_t> MySQLDB::execute_script(const std::string& script_path) {
    size_t total_affected = 0;
    std::ifstream ifs(script_path);
    if(!ifs){
        throw std::runtime_error("cannot open " + script_path + " this file");
    }
    std::ostringstream oss;
    oss<<ifs.rdbuf();
    std::string content = oss.str();
    std::vector<std::string_view> stmts = split_script(content);
    for (const auto& stmt : stmts) {
        if (!stmt.empty()) {
            total_affected += co_await execute(stmt);
        }
    }
    co_return total_affected;
}

awaitable<void> MySQLDB::execute_multi(std::string_view sql_batch) {
    auto executor = co_await boost::asio::this_coro::executor;
    std::vector<std::string_view> statements;

    size_t start = 0;
    bool in_statement = false;

    // 手动解析：跳过空白，按 ';' 拆分
    for (size_t i = 0; i <= sql_batch.size(); ++i) {
        if (i < sql_batch.size()) {
            char c = sql_batch[i];
            if (!std::isspace(static_cast<unsigned char>(c))) {
                if (!in_statement) {
                    start = i;
                    in_statement = true;
                }
            }
            if (c == ';' && in_statement) {
                size_t len = i - start;
                if (len > 0) {
                    statements.emplace_back(sql_batch.substr(start, len));
                }
                in_statement = false;
            }
        } else {
            if (in_statement) {
                size_t len = sql_batch.size() - start;
                statements.emplace_back(sql_batch.substr(start, len));
            }
        }
    }
    for (auto& stmt : statements) {
        auto trimmed = boost::trim_copy(std::string(stmt));
        if (!trimmed.empty()){
            co_await execute(stmt);
        }
    }
    co_return;
}

// ---------- 5. 事务操作 ----------
awaitable<void> MySQLDB::begin() { co_await execute("START TRANSACTION"); }
awaitable<void> MySQLDB::commit() { co_await execute("COMMIT"); }
awaitable<void> MySQLDB::rollback() { co_await execute("ROLLBACK"); }

// ---------- 6. 关闭连接 ----------
awaitable<void> MySQLDB::close() noexcept {
    boost::system::error_code ec;
    co_await conn_.async_close(asio::redirect_error(use_awaitable, ec));
}

// 分割SQL脚本为多个语句
std::vector<std::string_view> MySQLDB::split_script(const std::string& script) {
    std::vector<std::string_view> statements;
    size_t start = 0;
    size_t pos = 0;

    while (pos < script.length()) {
        // 查找分号
        pos = script.find(';', start);
        if (pos == std::string_view::npos) {
            pos = script.length();
        }

        // 提取语句
        std::string_view stmt = script.substr(start, pos - start);

        // 去除首尾空白字符
        while (!stmt.empty() && (stmt.front() == ' ' || stmt.front() == '\t' || stmt.front() == '\n' || stmt.front() == '\r')) {
            stmt.remove_prefix(1);
        }
        while (!stmt.empty() && (stmt.back() == ' ' || stmt.back() == '\t' || stmt.back() == '\n' || stmt.back() == '\r')) {
            stmt.remove_suffix(1);
        }

        if (!stmt.empty()) {
            statements.push_back(stmt);
        }
        start = pos + 1;
    }

    return statements;
}
```

## 输入验证器
### 对象实例化版本
#### 定义
```cpp
#pragma once
#include <algorithm>
#include <format>  // C++20
#include <functional>
#include <iostream>
#include <limits>
#include <regex>
#include <string>
#include <numeric>
#include <algorithm>
#include <format>
#include <functional>
#include <iostream>
#include <limits>
#include <regex>
#include <string>
#include <vector>

/**
 * @brief A versatile input validator class template.
 *
 * This class provides a flexible way to validate user inputs of various types.
 * It supports a wide range of built-in validators and allows for custom validation functions.
 * The class is designed to be used in a chainable manner for ease of use.
 *
 * @tparam T The type of the input to be validated.
 */
template <typename T>
class InputValidator {
   public:
    using ValidatorFunc = std::function<bool(const T&)>;
    using ValidatorPair = std::pair<ValidatorFunc, std::string>;
    InputValidator();
    bool validate(const T& input) const;
    InputValidator& prompt(const std::string& prompt);
    InputValidator& enum_str(const std::vector<std::string>& allowed, const std::string& error_msg = "You must input one of ({}).");

    template <typename U = T, typename = std::enable_if_t<std::is_arithmetic_v<U>>>
    InputValidator& range(U min, U max, const std::string& error_fmt = "Must be between {} and {}.");
    InputValidator& regex(const std::string& pattern, const std::string& error_msg = "Input does not match the required pattern.");
    InputValidator& length_range(size_t min, size_t max, const std::string& error_fmt = "Length must be between {} and {}.");
    InputValidator& not_empty(const std::string& error_msg = "Input cannot be empty.");
    InputValidator& not_contains(const std::vector<std::string>& not_allowed, const std::string& error_msg = "Input must not contain ({}).");
    InputValidator& contains(const std::vector<std::string>& must_contains, const std::string& error_msg = "Input must contain ({}).");
    InputValidator& custom(ValidatorFunc condition, const std::string& error_msg);
    InputValidator& yes_or_no(const std::string& error_msg = "Please input yes (Y, Yes, YES) or no (N, No, NO).");
    InputValidator& email(const std::string& error_msg = "Invalid email format.");
    InputValidator& url(const std::string& error_msg = "Invalid URL format.");
    InputValidator& numeric(const std::string& error_msg = "Input must be a valid number.");
    InputValidator& date(const std::string& error_msg = "Invalid date format. Use YYYY-MM-DD.");
    InputValidator& password_strength(const std::string& error_msg = "Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character.");
    T render() const;

   private:
    std::string prompt_;
    std::string general_error_msg_;
    std::vector<ValidatorPair> validators_;
    void handleInputError(const std::string& error_msg) const;
};

template <typename T>
InputValidator<T>::InputValidator()
    : prompt_("Input: "), general_error_msg_("Invalid input, please try again.") {}

template <typename T>
InputValidator<T>& InputValidator<T>::prompt(const std::string& prompt) {
    if (!prompt.empty()) {
        prompt_ = prompt;
    }
    return *this;
}

template <typename T>
InputValidator<T>& InputValidator<T>::enum_str(const std::vector<std::string>& allowed, const std::string& error_msg) {
    if (allowed.empty()) {
        throw std::invalid_argument("Allowed list cannot be empty.");
    }
    std::string allowed_str = std::accumulate(allowed.begin() + 1, allowed.end(), allowed[0],
                                              [](const std::string& a, const std::string& b) { return a + ", " + b; });
    std::string msg = std::format(error_msg, allowed_str);
    validators_.emplace_back(
        [allowed](const std::string& s) {
            return std::find(allowed.begin(), allowed.end(), s) != allowed.end();
        },
        msg);
    return *this;
}

template <typename T>
template <typename U, typename>
InputValidator<T>& InputValidator<T>::range(U min, U max, const std::string& error_fmt) {
    std::string msg = std::format(error_fmt, min, max);
    validators_.emplace_back(
        [min, max](const U& value) { return value >= min && value <= max; },
        msg);
    return *this;
}

template <typename T>
InputValidator<T>& InputValidator<T>::regex(const std::string& pattern, const std::string& error_msg) {
    std::regex re(pattern);
    validators_.emplace_back(
        [re](const std::string& s) { return std::regex_match(s, re); },
        error_msg);
    return *this;
}

template <typename T>
InputValidator<T>& InputValidator<T>::length_range(size_t min, size_t max, const std::string& error_fmt) {
    std::string msg = std::format(error_fmt, min, max);
    validators_.emplace_back(
        [min, max](const std::string& s) { return s.size() >= min && s.size() <= max; },
        msg);
    return *this;
}

template <typename T>
InputValidator<T>& InputValidator<T>::not_emtpy(const std::string& error_msg) {
    validators_.emplace_back(
        [](const std::string& s) { return !s.empty(); },
        error_msg);
    return *this;
}

template <typename T>
InputValidator<T>& InputValidator<T>::not_contains(const std::vector<std::string>& not_allowed, const std::string& error_msg) {
    if (not_allowed.empty())
        return *this;
    std::string not_allowed_str = std::accumulate(not_allowed.begin() + 1, not_allowed.end(), not_allowed[0],
                                                  [](const std::string& a, const std::string& b) { return a + ", " + b; });
    std::string msg = std::format(error_msg, not_allowed_str);
    validators_.emplace_back(
        [not_allowed](const std::string& s) {
            return std::none_of(not_allowed.begin(), not_allowed.end(),
                                [&s](const std::string& str) { return s.find(str) != std::string::npos; });
        },
        msg);
    return *this;
}

template <typename T>
InputValidator<T>& InputValidator<T>::contains(const std::vector<std::string>& must_contains, const std::string& error_msg) {
    if (must_contains.empty())
        return *this;
    std::string must_contains_str = std::accumulate(must_contains.begin() + 1, must_contains.end(), must_contains[0],
                                                    [](const std::string& a, const std::string& b) { return a + ", " + b; });
    std::string msg = std::format(error_msg, must_contains_str);
    validators_.emplace_back(
        [must_contains](const std::string& s) {
            return std::all_of(must_contains.begin(), must_contains.end(),
                               [&s](const std::string& str) { return s.find(str) != std::string::npos; });
        },
        msg);
    return *this;
}

template <typename T>
InputValidator<T>& InputValidator<T>::custom(ValidatorFunc condition, const std::string& error_msg) {
    validators_.emplace_back(condition, error_msg);
    return *this;
}

template <typename T>
InputValidator<T>& InputValidator<T>::yes_or_no(const std::string& error_msg) {
    validators_.emplace_back(
        [](const std::string& s) {
            std::string lower_s = s;
            std::transform(lower_s.begin(), lower_s.end(), lower_s.begin(), ::tolower);
            return lower_s == "y" || lower_s == "yes" || lower_s == "n" || lower_s == "no";
        },
        error_msg);
    return *this;
}

template <typename T>
InputValidator<T>& InputValidator<T>::email(const std::string& error_msg) {
    return regex(R"(^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$)", error_msg);
}

template <typename T>
InputValidator<T>& InputValidator<T>::url(const std::string& error_msg) {
    return regex(R"(^(https?://)?([a-zA-Z0-9.-]+)(\.[a-zA-Z]{2,})(:\d+)?(/.*)?$)", error_msg);
}

template <typename T>
InputValidator<T>& InputValidator<T>::numeric(const std::string& error_msg) {
    return regex(R"(^-?\d+(\.\d+)?([eE][-+]?\d+)?$)", error_msg);
}

template <typename T>
InputValidator<T>& InputValidator<T>::date(const std::string& error_msg) {
    return regex(R"(^\d{4}-\d{2}-\d{2}$)", error_msg);
}

template <typename T>
InputValidator<T>& InputValidator<T>::password_strength(const std::string& error_msg) {
    validators_.emplace_back(
        [](const std::string& s) {
            bool has_upper = std::any_of(s.begin(), s.end(), ::isupper);
            bool has_lower = std::any_of(s.begin(), s.end(), ::islower);
            bool has_digit = std::any_of(s.begin(), s.end(), ::isdigit);
            bool has_special = std::any_of(s.begin(), s.end(), [](char c) { return !std::isalnum(c); });
            return has_upper && has_lower && has_digit && has_special;
        },
        error_msg);
    return *this;
}

template <typename T>
bool InputValidator<T>::validate(const T& input) const {
    for (const auto& validator_pair : validators_) {
        if (!validator_pair.first(input)) {
            return false;
        }
    }
    return true;
}

template <typename T>
T InputValidator<T>::render() const {
    T value;
    while (true) {
        std::cout << prompt_;
        std::cin >> value;
        if (std::cin.fail()) {
            handleInputError(general_error_msg_);
            continue;
        }
        bool valid = true;
        for (const auto& [cond, msg] : validators_) {
            if (!cond(value)) { // Changed from cond(value) to cond(value)
                std::cout << msg << '\n';
                handleInputError(msg);
                valid = false;
                break;
            }
        }
        if (valid)
            break;
    }
    return value;
}

template <typename T>
void InputValidator<T>::handleInputError(const std::string& error_msg) const {
    std::cin.clear();
    std::cin.ignore((std::numeric_limits<std::streamsize>::max)(), '\n');
    std::cout << error_msg << std::endl;
}

```
#### 实现
由于这是头文件模板类，模板定义放在头文件中
## 支持 for-range 的自定义 vector 数据结构
```cpp
template <typename T>
class MyVector {
   public:
    class iterator {
        T* ptr_ = nullptr;

       public:
        iterator() = default;
        explicit iterator(T* ptr) : ptr_(ptr) {};
        T& operator*() const { return *ptr_; }  // 必须，迭代器需要解引用
        T* operator->() const { return ptr_; }  // 可选
        iterator& operator++() {                // 必须
            ++ptr_;
            return *this;
        }
        iterator operator++(int) {  // 后置自增，可选，因迭代使用前置
            iterator tmp{ptr_};
            ++ptr_;
            return tmp;
        }
        friend bool operator==(const iterator& a, const iterator& b)  { return a.ptr_ == b.ptr_; }  // 必须
        friend bool operator!=(const iterator& a, const iterator& b) { return a.ptr_ != b.ptr_; }  // 必须
        // 可以将这两个函数作为成员函数，实现为：
        // bool operator==(const iterator& mv) const {
        //     return this->ptr_ == mv.ptr_;
        // }
        // bool operator!=(const iterator& mv) const {
        //     return this->ptr_ != mv.ptr_;
        //     return !(*this == other); // 复用==函数
        // }
        // ps：作为成员函数时最好加上const修饰函数体，所有基本的数组操作，delete，delete[]，size()都应该使用const noexcept。这些原子操作不会返回错误
    };
    MyVector() : data_(nullptr), size_(0), capacity_(0) {}
    ~MyVector() noexcept { delete[] data_; }

    void reserve(size_t new_cap) {
        if (new_cap <= capacity_)
            return;
        T* new_data = new T[new_cap];
        for (size_t i = 0; i < size_; i++) {
            new_data[i] = data_[i];
        }
        delete[] data_;
        data_ = new_data;
        capacity_ = new_cap;
    }

    void push_back(const T& value) {
        if (size_ == capacity_) {
            reserve(capacity_ ? capacity_ * 2 : 4);
        }
        data_[size_++] = value;
    }
    // 添加移动语义，右值插入操作，可选
    void push_back(T&& value) {
        if (size_ == capacity_) {
            reserve(capacity_ ? capacity_ * 2 : 4);
        }
        data_[size_++] = std::move(value);
    }
    iterator begin() noexcept { return iterator(data_); }        // 必须
    iterator end() noexcept { return iterator(data_ + size_); }  // 必须

    using const_iterator = const T*;  // 实现const版，可选
    const_iterator cbegin() const noexcept { return data_; }
    const_iterator cend() const noexcept { return data_ + size_; }

    // 下标访问，可选
    T& operator[](size_t index) {
        if (index >= size_)
            throw std::out_of_range("index out of range.");
        return data_[index];
    }
    // const版本，可选
    const T& operator[](size_t index) const {
        if (index >= size_)
            throw std::out_of_range("index out of range.");
        return data_[index];
    }
    size_t size() const noexcept { return size_; }

    // 拷贝构造函数，可选，实现MyVector mv1(mv2);
    MyVector(const MyVector& other) : data_(new T[other.capacity_]), size_(other.size_), capacity_(other.capacity_){
        for (size_t i = 0; i < capacity_; i++){
            data_[i] = other.data_[i];
        }
    }
    // 拷贝赋值运算符重载，可选，实现MyVector mv1 = mv2;
    MyVector& operator=(const MyVector& other){
        if(this != &other){
            delete[] data_;
            data_ = new T[other.size_];
            capacity_ = other.capacity_;
            size_ = other.size_;
            for (size_t i = 0; i < capacity_; i++){
                data_[i] = other.data_[i];
            }
        }
        return *this;
    }

    // 实现移动语义，提高性能，拷贝移动语义
    MyVector(MyVector&& other): data_(other.data_), size_(other.size_), capacity_(other.capacity_){
        other.data_ = nullptr;
        other.capacity_ = 0;
        other.size_ = 0;
    }
    // 赋值移动语义
    MyVector& operator=(MyVector&& other) noexcept{
        if(this != &other){
            delete[] data_;
            data_ = other.data_;
            size_ = other.size_;
            capacity_ = other.capacity_;
            delete[] other.data_;
            other.data_ = nullptr;
            other.size_ = 0;
            other.capacity_ = 0;
        }
        // 或者将上面if语句中全部内容替换为swap(*this, other);
        return *this;
    }

   private:
    T* data_;
    size_t size_;
    size_t capacity_;
};
```
## C++11 SFINAE 与 C++20 Concept 对照表
为避免 [[#SFINAE 地狱出现|SFINAE 地狱出现]]，C++20 引入了 concept，两种情况下的代码写法如下

| 约束需求              | C++11/14/17 SFINAE 写法                      | C++20 Concept 等价写法                                     | 白话解释              |                |      |                 |     |
| ----------------- | ------------------------------------------ | ------------------------------------------------------ | ----------------- | -------------- | ---- | --------------- | --- |
| **基础类型约束**        | ```cpp                                     | ```cpp                                                 | 只允许整数类型           |                |      |                 |     |
| (只允许整型)           | template<typename T,                       | template<std::integral T>                              |                   |                |      |                 |     |
|                   | typename = std::enable_if_t<               | void foo(T);                                           |                   |                |      |                 |     |
|                   | std::is_integral<T>::value                 | ```                                                    |                   |                |      |                 |     |
|                   | >                                          |                                                        |                   |                |      |                 |     |
|                   | > void foo(T);                             |                                                        |                   |                |      |                 |     |
|                   | ```                                        |                                                        |                   |                |      |                 |     |
| **复合类型约束**        | ```cpp                                     | ```cpp                                                 | 要求可迭代&&返回int      |                |      |                 |     |
| (可遍历+返回整型)        | template<typename T,                       | template<typename T>                                   |                   |                |      |                 |     |
|                   | typename = std::enable_if_t<               | requires {                                             |                   |                |      |                 |     |
|                   | std::is_integral<                          | requires std::integral<decltype(*begin(T{}))>;         |                   |                |      |                 |     |
|                   | decltype(*std::declval<T>().begin())       | { begin(std::declval<T>()) } -> std::forward_iterator; |                   |                |      |                 |     |
|                   | >::value                                   | }                                                      |                   |                |      |                 |     |
|                   | >                                          | void print_first(T container) { /*...*/ }              |                   |                |      |                 |     |
|                   | > void print_first(T container);           | ```                                                    |                   |                |      |                 |     |
|                   | ```                                        |                                                        |                   |                |      |                 |     |
| **表达式存在性约束**      | ```cpp                                     | ```cpp                                                 | 要求类型有.size()方法    |                |      |                 |     |
| (是否有 size() 方法)   | template<typename T>                       | template<typename T>                                   |                   |                |      |                 |     |
|                   | auto get_size(T obj)                       | requires requires(T t) { t.size(); }                   |                   |                |      |                 |     |
|                   | -> decltype(obj.size(), void())            | auto get_size(T obj) { return obj.size(); }            |                   |                |      |                 |     |
|                   | { return obj.size(); }                     | ```                                                    |                   |                |      |                 |     |
|                   | ```                                        |                                                        |                   |                |      |                 |     |
| **返回值类型约束**       | ```cpp                                     | ```cpp                                                 | 要求+操作返回相同类型       |                |      |                 |     |
| (加法返回相同类型)        | template<typename T>                       | template<typename T>                                   |                   |                |      |                 |     |
|                   | auto add(T a, T b)                         | requires requires(T x, T y) {                          |                   |                |      |                 |     |
|                   | -> decltype(a + b, std::declval<T>())      | { x + y } -> std::same_as<T>;                          |                   |                |      |                 |     |
|                   | { return a + b; }                          | }                                                      |                   |                |      |                 |     |
|                   | ```                                        | T add(T a, T b) { return a + b; }                      |                   |                |      |                 |     |
|                   |                                            | ```                                                    |                   |                |      |                 |     |
| **嵌套类型约束**        | ```cpp                                     | ```cpp                                                 | 要求有::iterator嵌套类型 |                |      |                 |     |
| (是否有 iterator 类型) | template<typename C>                       | template<typename C>                                   |                   |                |      |                 |     |
|                   | void process_container(C& c)               | requires requires {                                    |                   |                |      |                 |     |
|                   | typename C::iterator;  // 触发 SFINAE        | typename C::iterator;                                  |                   |                |      |                 |     |
|                   | // 函数实现...                                 | }                                                      |                   |                |      |                 |     |
|                   | ```                                        | void process_container(C& c) { /*...*/ }               |                   |                |      |                 |     |
|                   |                                            | ```                                                    |                   |                |      |                 |     |
| **多条件复合约束**       | ```cpp                                     | ```cpp                                                 | 整数 && (32位        |                | 64位) |                 |     |
| (复杂类型组合)          | template<typename T>                       | template<typename T>                                   |                   |                |      |                 |     |
|                   | using Enable = std::enable_if_t<           | requires {                                             |                   |                |      |                 |     |
|                   | std::is_integral_v<T> &&                   | requires std::integral<T>;                             |                   |                |      |                 |     |
|                   | (sizeof(T) == 4                            |                                                        | sizeof(T) == 8)   | sizeof(T) == 4 |      | sizeof(T) == 8; |     |
|                   | >;                                         | }                                                      |                   |                |      |                 |     |
|                   | template<typename T, typename = Enable<T>> | void handle_int(T);                                    |                   |                |      |                 |     |
|                   | void handle_int(T);                        | ```                                                    |                   |                |      |                 |     |
|                   | ```                                        |                                                        |                   |                |      |                 |     |
|                   |                                            |                                                        |                   |                |      |                 |     |


## redis
hiredis 是纯 C 库，没有 redis api 支持但使用简单，可以直接写原生的 redis 命令，但由于 C 语言没有对象，返回值需要手动封装 `redisReply* reply = (redisReply*)redisCommand(context, "GET key");`，redisCommand 函数返回类型为 `void*`
boost. redis 是 C++库，但没有 redis api 支持，redis 命令需要用多个字符串保存一条命令中参数，比如 `set mykey value` 命令要写成 `res.push("set","mykey", "value")` 要麻烦一点，但和 co_await，asio 配合密切，能直接使用异步和协程。
### hiredis 连接
```cpp
#include <hiredis/hiredis.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

void handleError(redisContext* c, const char* operation) {
    if (c->err) {
        printf("Error in %s: %s\n", operation, c->errstr);
        redisFree(c);
        exit(1);
    }
}

void testStringOperations(redisContext* c) {
    printf("\n=== String Operations ===\n");

    // SET command
    redisReply* reply = (redisReply*)redisCommand(c, "SET name Redis_Test");
    if (reply->type == REDIS_REPLY_ERROR) {
        printf("SET Error: %s\n", reply->str);
    } else {
        printf("SET name \"Redis Test\" -> %s\n", reply->str);
    }
    freeReplyObject(reply);

    // GET command
    reply = (redisReply*)redisCommand(c, "GET name");
    if (reply->type == REDIS_REPLY_ERROR) {
        printf("GET Error: %s\n", reply->str);
    } else {
        printf("GET name -> %s\n", reply->str);
    }
    freeReplyObject(reply);

    // INCR command
    reply = (redisReply*)redisCommand(c, "SET counter 10");
    freeReplyObject(reply);

    reply = (redisReply*)redisCommand(c, "INCR counter");
    if (reply->type == REDIS_REPLY_ERROR) {
        printf("INCR Error: %s\n", reply->str);
    } else {
        printf("INCR counter -> %lld\n", reply->integer);
    }
    freeReplyObject(reply);
}

void testHashOperations(redisContext* c) {
    printf("\n=== Hash Operations ===\n");

    // HSET command
    redisReply* reply = (redisReply*)redisCommand(c, "HSET user:1000 name \"Alice\" age 25 email \"alice@example.com\"");
    if (reply->type == REDIS_REPLY_ERROR) {
        printf("HSET Error: %s\n", reply->str);
    } else {
        printf("HSET user:1000 -> %lld fields added\n", reply->integer);
    }
    freeReplyObject(reply);

    // HGETALL command
    reply = (redisReply*)redisCommand(c, "HGETALL user:1000");
    if (reply->type == REDIS_REPLY_ERROR) {
        printf("HGETALL Error: %s\n", reply->str);
    } else if (reply->type == REDIS_REPLY_ARRAY) {
        printf("HGETALL user:1000:\n");
        for (size_t i = 0; i < reply->elements; i += 2) {
            printf("  %s: %s\n", reply->element[i]->str, reply->element[i+1]->str);
        }
    }
    freeReplyObject(reply);
}

void testListOperations(redisContext* c) {
    printf("\n=== List Operations ===\n");

    // LPUSH command
    redisReply* reply = (redisReply*)redisCommand(c, "LPUSH mylist \"item1\" \"item2\" \"item3\"");
    if (reply->type == REDIS_REPLY_ERROR) {
        printf("LPUSH Error: %s\n", reply->str);
    } else {
        printf("LPUSH mylist -> %lld elements\n", reply->integer);
    }
    freeReplyObject(reply);

    // LRANGE command
    reply = (redisReply*)redisCommand(c, "LRANGE mylist 0 -1");
    if (reply->type == REDIS_REPLY_ERROR) {
        printf("LRANGE Error: %s\n", reply->str);
    } else if (reply->type == REDIS_REPLY_ARRAY) {
        printf("LRANGE mylist:\n");
        for (size_t i = 0; i < reply->elements; i++) {
            printf("  [%zu]: %s\n", i, reply->element[i]->str);
        }
    }
    freeReplyObject(reply);
}

void testSetOperations(redisContext* c) {
    printf("\n=== Set Operations ===\n");

    // SADD command
    redisReply* reply = (redisReply*)redisCommand(c, "SADD myset \"member1\" \"member2\" \"member3\" \"member1\"");
    if (reply->type == REDIS_REPLY_ERROR) {
        printf("SADD Error: %s\n", reply->str);
    } else {
        printf("SADD myset -> %lld elements added\n", reply->integer);
    }
    freeReplyObject(reply);

    // SMEMBERS command
    reply = (redisReply*)redisCommand(c, "SMEMBERS myset");
    if (reply->type == REDIS_REPLY_ERROR) {
        printf("SMEMBERS Error: %s\n", reply->str);
    } else if (reply->type == REDIS_REPLY_ARRAY) {
        printf("SMEMBERS myset:\n");
        for (size_t i = 0; i < reply->elements; i++) {
            printf("  [%zu]: %s\n", i, reply->element[i]->str);
        }
    }
    freeReplyObject(reply);
}

int main() {
    // 连接到远程Redis服务器
    const char* hostname = "121.43.98.198";
    int port = 6379;
    const char* password = "123456";

    printf("Connecting to Redis server at %s:%d...\n", hostname, port);

    // 建立连接
    redisContext* c = redisConnect(hostname, port);
    if (c == NULL || c->err) {
        if (c != NULL) {
            printf("Connection Error: %s\n", c->errstr);
            redisFree(c);
        } else {
            printf("Can't allocate redis context\n");
        }
        exit(1);
    }

    printf("Connected successfully!\n");

    // 进行身份验证
    redisReply* auth_reply = (redisReply*)redisCommand(c, "AUTH %s", password);
    if (auth_reply == NULL || c->err) {
        if (c->err) {
            printf("Authentication Error: %s\n", c->errstr);
        } else {
            printf("Authentication failed: NULL reply\n");
        }
        if (auth_reply) {
            freeReplyObject(auth_reply);
        }
        redisFree(c);
        exit(1);
    }

    if (auth_reply->type == REDIS_REPLY_ERROR) {
        printf("Authentication Error: %s\n", auth_reply->str);
        freeReplyObject(auth_reply);
        redisFree(c);
        exit(1);
    }

    printf("Authenticated successfully!\n");
    freeReplyObject(auth_reply);

    // 测试各种Redis操作
    testStringOperations(c);
    testHashOperations(c);
    testListOperations(c);
    testSetOperations(c);

    // 清理测试数据
    printf("\n=== Cleaning up ===\n");
    redisReply* reply = (redisReply*)redisCommand(c, "DEL name counter user:1000 mylist myset");
    printf("Cleaned up %lld keys\n", reply->integer);
    freeReplyObject(reply);

    // 关闭连接
    redisFree(c);
    printf("\nConnection closed. All tests completed successfully!\n");

    return 0;
}

```
### tcp 连接
```cpp
#include <boost/asio.hpp>
#include <iostream>
#include <sstream>
#include <string>
#include <vector>

using boost::asio::ip::tcp;
namespace net = boost::asio;
using namespace std::literals;

/**
 * 构造 Redis RESP 协议格式的请求
 * 例如: SET mykey hello  -->  *3\r\n$3\r\nSET\r\n$5\r\nmykey\r\n$5\r\nhello\r\n
 */
std::string make_resp(const std::vector<std::string>& args) {
    std::string result;
    result += "*" + std::to_string(args.size()) + "\r\n";
    for (const auto& arg : args) {
        result += "$" + std::to_string(arg.size()) + "\r\n";
        result += arg + "\r\n";
    }
    return result;
}

int main() {
    try {
        net::io_context ioc;
        tcp::resolver resolver(ioc);
        tcp::socket socket(ioc);
        const std::string host = "121.43.98.198";
        const std::string port = "6379";

        // 1. 解析 DNS 并连接
        std::cout << "Resolving " << host << "...\n";
        auto endpoints = resolver.resolve(host, port);
        net::connect(socket, endpoints);

        // 2. 认证（如果有密码）
        {
            const std::string password = "123456";
            if (!password.empty()) {
                auto req = make_resp({"AUTH", password});
                net::write(socket, net::buffer(req));

                std::string resp(1024, 0);
                size_t len = socket.read_some(net::buffer(resp));
                resp.resize(len);
                std::cout << "AUTH response: " << resp << "\n";
                if (resp.find("+OK") != 0) {
                    std::cerr << "❌ Authentication failed!\n";
                    return 1;
                }
            }
        }

        // 3. SET 命令示例
        {
            auto req = make_resp({"SET", "hello", "world via Boost.Asio"});
            net::write(socket, net::buffer(req));

            std::string resp(1024, 0);
            size_t len = socket.read_some(net::buffer(resp));
            resp.resize(len);
            std::cout << "SET response: " << resp;
        }

        // 4. GET 命令示例
        {
            auto req = make_resp({"GET", "hello"});
            net::write(socket, net::buffer(req));

            std::string resp(1024, 0);
            size_t len = socket.read_some(net::buffer(resp));
            resp.resize(len);
            std::cout << "GET response: " << resp;

            // 示例响应: $17\r\nworld via Boost.Asio\r\n
            // 提取实际值（简化示例）
            if (resp.size() > 4 && resp[0] == '$') {
                size_t pos = resp.find("\r\n", 0);
                if (pos != std::string::npos) {
                    pos += 2;
                    std::string value = resp.substr(pos, resp.size() - pos - 2);
                    std::cout << "✅ Extracted value: " << value << "\n";
                }
            }
        }

        // 关闭连接
        boost::system::error_code ec;
        socket.shutdown(tcp::socket::shutdown_both, ec);
        if (ec && ec != boost::asio::error::eof) {
            std::cerr << "Socket shutdown error: " << ec.message() << "\n";
        }

    } catch (const std::exception& e) {
        std::cerr << "❌ Exception: " << e.what() << "\n";
    }

    return 0;
}
```
### boost. redis 和 boost. asio 连接
```cpp
#include <boost/redis.hpp>
#include <boost/redis/src.hpp>
#include <boost/asio.hpp>
#include <iostream>
#include <string>

using namespace boost;

int main() try
{
    std::cout << "Starting Redis client..." << std::endl;

    // 配置连接到远程 Redis 服务器
    redis::config cfg;
    cfg.addr.host = "121.43.98.198";  // 远程 Redis 服务器地址
    cfg.addr.port = "6379";           // Redis 默认端口
    cfg.username = "default";         // 用户名，默认为 "default"
    cfg.password = "123456";          // Redis 服务器密码

    std::cout << "Connecting to Redis server at " << cfg.addr.host << ":" << cfg.addr.port
              << " with password authentication" << std::endl;

    // 创建 io_context 和连接
    asio::io_context ioc;
    auto conn = std::make_shared<redis::connection>(ioc);

    // 启动连接并等待连接完成
    std::cout << "Starting connection..." << std::endl;
    conn->async_run(cfg, {}, [&](boost::system::error_code ec) {
        if (ec) {
            std::cerr << "Connection error: " << ec.message() << std::endl;
        } else {
            std::cout << "Connected successfully!" << std::endl;
        }
    });

    // PING 命令测试连接
    std::cout << "Sending PING command..." << std::endl;
    redis::request req;
    req.push("PING");

    conn->async_exec(req, redis::ignore, [&](boost::system::error_code ec, std::size_t) {
        if (ec) {
            std::cerr << "PING command error: " << ec.message() << std::endl;
        } else {
            std::cout << "PING command executed successfully!" << std::endl;
        }
    });

    // 运行 io_context 来处理异步操作
    std::cout << "Running io_context..." << std::endl;
    ioc.run();

    std::cout << "Redis client finished." << std::endl;

    return 0;
} catch (const std::exception& e) {
    std::cerr << "Exception: " << e.what() << std::endl;
    return 1;
}
```
### boost. redis 常用 api 参考
```cpp
#include <boost/redis.hpp>
#include <boost/redis/src.hpp>
#include <boost/asio.hpp>
#include <iostream>
#include <string>
#include <vector>
#include <functional>

using namespace boost;

class RedisDemo {
private:
    asio::io_context ioc;
    std::shared_ptr<redis::connection> conn;
    redis::config cfg;

public:
    RedisDemo() {
        // 配置连接到远程 Redis 服务器
        cfg.addr.host = "121.43.98.198";  // 远程 Redis 服务器地址
        cfg.addr.port = "6379";           // Redis 默认端口
        cfg.username = "default";         // 用户名，默认为 "default"
        cfg.password = "123456";          // Redis 服务器密码

        conn = std::make_shared<redis::connection>(ioc);
    }

    void connect() {
        std::cout << "Connecting to Redis server at " << cfg.addr.host << ":" << cfg.addr.port
                  << " with password authentication" << std::endl;

        conn->async_run(cfg, {}, [this](boost::system::error_code ec) {
            if (ec) {
                std::cerr << "Connection error: " << ec.message() << std::endl;
            } else {
                std::cout << "Connected successfully!" << std::endl;
            }
        });
    }

    void run() {
        ioc.run();
    }

    asio::io_context& getIoContext() {
        return ioc;
    }

    // 1. PING 命令模块
    void testPing() {
        std::cout << "\n=== PING Command Test ===" << std::endl;
        redis::request req;
        req.push("PING");

        conn->async_exec(req, redis::ignore, [](boost::system::error_code ec, std::size_t) {
            if (ec) {
                std::cerr << "PING error: " << ec.message() << std::endl;
            } else {
                std::cout << "PING command executed successfully!" << std::endl;
            }
        });
    }

    // 2. 字符串操作模块
    void testStringOperations() {
        std::cout << "\n=== String Operations Test ===" << std::endl;

        // SET 命令
        redis::request set_req;
        set_req.push("SET", "test_key", "Hello Redis from C++!");
        conn->async_exec(set_req, redis::ignore, [this](boost::system::error_code ec, std::size_t) {
            if (ec) {
                std::cerr << "SET error: " << ec.message() << std::endl;
            } else {
                std::cout << "SET command executed successfully!" << std::endl;

                // GET 命令
                redis::request get_req;
                get_req.push("GET", "test_key");
                conn->async_exec(get_req, redis::ignore, [](boost::system::error_code ec, std::size_t) {
                    if (ec) {
                        std::cerr << "GET error: " << ec.message() << std::endl;
                    } else {
                        std::cout << "GET command executed successfully!" << std::endl;
                    }
                });
            }
        });
    }

    // 3. 哈希操作模块
    void testHashOperations() {
        std::cout << "\n=== Hash Operations Test ===" << std::endl;

        // HSET 命令
        redis::request hset_req;
        hset_req.push("HSET", "user:1000", "name", "Alice", "age", "25", "city", "Beijing");
        conn->async_exec(hset_req, redis::ignore, [this](boost::system::error_code ec, std::size_t) {
            if (ec) {
                std::cerr << "HSET error: " << ec.message() << std::endl;
            } else {
                std::cout << "HSET command executed successfully!" << std::endl;

                // HGET 命令
                redis::request hget_req;
                hget_req.push("HGET", "user:1000", "name");
                conn->async_exec(hget_req, redis::ignore, [](boost::system::error_code ec, std::size_t) {
                    if (ec) {
                        std::cerr << "HGET error: " << ec.message() << std::endl;
                    } else {
                        std::cout << "HGET command executed successfully!" << std::endl;
                    }
                });
            }
        });
    }

    // 4. 列表操作模块
    void testListOperations() {
        std::cout << "\n=== List Operations Test ===" << std::endl;

        // LPUSH 命令
        redis::request lpush_req;
        lpush_req.push("LPUSH", "fruits", "apple", "banana", "orange");
        conn->async_exec(lpush_req, redis::ignore, [this](boost::system::error_code ec, std::size_t) {
            if (ec) {
                std::cerr << "LPUSH error: " << ec.message() << std::endl;
            } else {
                std::cout << "LPUSH command executed successfully!" << std::endl;

                // LRANGE 命令
                redis::request lrange_req;
                lrange_req.push("LRANGE", "fruits", "0", "-1");
                conn->async_exec(lrange_req, redis::ignore, [](boost::system::error_code ec, std::size_t) {
                    if (ec) {
                        std::cerr << "LRANGE error: " << ec.message() << std::endl;
                    } else {
                        std::cout << "LRANGE command executed successfully!" << std::endl;
                    }
                });
            }
        });
    }

    // 5. 集合操作模块
    void testSetOperations() {
        std::cout << "\n=== Set Operations Test ===" << std::endl;

        // SADD 命令
        redis::request sadd_req;
        sadd_req.push("SADD", "languages", "C++", "Python", "JavaScript");
        conn->async_exec(sadd_req, redis::ignore, [this](boost::system::error_code ec, std::size_t) {
            if (ec) {
                std::cerr << "SADD error: " << ec.message() << std::endl;
            } else {
                std::cout << "SADD command executed successfully!" << std::endl;

                // SMEMBERS 命令
                redis::request smembers_req;
                smembers_req.push("SMEMBERS", "languages");
                conn->async_exec(smembers_req, redis::ignore, [](boost::system::error_code ec, std::size_t) {
                    if (ec) {
                        std::cerr << "SMEMBERS error: " << ec.message() << std::endl;
                    } else {
                        std::cout << "SMEMBERS command executed successfully!" << std::endl;
                    }
                });
            }
        });
    }

    // 6. 有序集合操作模块
    void testSortedSetOperations() {
        std::cout << "\n=== Sorted Set Operations Test ===" << std::endl;

        // ZADD 命令
        redis::request zadd_req;
        zadd_req.push("ZADD", "scores", "90", "Alice", "85", "Bob", "95", "Charlie");
        conn->async_exec(zadd_req, redis::ignore, [this](boost::system::error_code ec, std::size_t) {
            if (ec) {
                std::cerr << "ZADD error: " << ec.message() << std::endl;
            } else {
                std::cout << "ZADD command executed successfully!" << std::endl;

                // ZRANGE 命令
                redis::request zrange_req;
                zrange_req.push("ZRANGE", "scores", "0", "-1", "WITHSCORES");
                conn->async_exec(zrange_req, redis::ignore, [](boost::system::error_code ec, std::size_t) {
                    if (ec) {
                        std::cerr << "ZRANGE error: " << ec.message() << std::endl;
                    } else {
                        std::cout << "ZRANGE command executed successfully!" << std::endl;
                    }
                });
            }
        });
    }

    // 7. 其他常用命令模块
    void testOtherCommands() {
        std::cout << "\n=== Other Common Commands Test ===" << std::endl;

        // EXISTS 命令
        redis::request exists_req;
        exists_req.push("EXISTS", "test_key");
        conn->async_exec(exists_req, redis::ignore, [this](boost::system::error_code ec, std::size_t) {
            if (ec) {
                std::cerr << "EXISTS error: " << ec.message() << std::endl;
            } else {
                std::cout << "EXISTS command executed successfully!" << std::endl;

                // TTL 命令
                redis::request ttl_req;
                ttl_req.push("TTL", "test_key");
                conn->async_exec(ttl_req, redis::ignore, [this](boost::system::error_code ec, std::size_t) {
                    if (ec) {
                        std::cerr << "TTL error: " << ec.message() << std::endl;
                    } else {
                        std::cout << "TTL command executed successfully!" << std::endl;

                        // DEL 命令
                        redis::request del_req;
                        del_req.push("DEL", "test_key");
                        conn->async_exec(del_req, redis::ignore, [](boost::system::error_code ec, std::size_t) {
                            if (ec) {
                                std::cerr << "DEL error: " << ec.message() << std::endl;
                            } else {
                                std::cout << "DEL command executed successfully!" << std::endl;
                            }
                        });
                    }
                });
            }
        });
    }
};

int main() try {
    std::cout << "Starting Redis client demo with modular design..." << std::endl;

    RedisDemo demo;
    demo.connect();

    // 等待连接建立
    std::this_thread::sleep_for(std::chrono::seconds(2));

    // 依次执行各个测试模块
    demo.testPing();
    // std::this_thread::sleep_for(std::chrono::milliseconds(500));

    demo.testStringOperations();
    // std::this_thread::sleep_for(std::chrono::milliseconds(500));

    demo.testHashOperations();
    // std::this_thread::sleep_for(std::chrono::milliseconds(500));

    demo.testListOperations();
    // std::this_thread::sleep_for(std::chrono::milliseconds(500));

    demo.testSetOperations();
    // std::this_thread::sleep_for(std::chrono::milliseconds(500));

    demo.testSortedSetOperations();
    // std::this_thread::sleep_for(std::chrono::milliseconds(500));

    demo.testOtherCommands();
    // std::this_thread::sleep_for(std::chrono::milliseconds(500));

    std::cout << "\nRunning io_context to process all async operations..." << std::endl;
    demo.run();

    std::cout << "\nAll Redis operations completed successfully!" << std::endl;

    return 0;
} catch (const std::exception& e) {
    std::cerr << "Exception: " << e.what() << std::endl;
    return 1;
}
```
## 通用文件遍历接口
### C++实现
文件名: include/Logger. h
```cpp
#ifndef LOGGER_H
#define LOGGER_H

#include <string>
#include <memory>

// Abstract base class for logger implementations
class Logger {
public:
    virtual ~Logger() = default;

    // Log levels
    enum class Level {
        DEBUG,
        INFO,
        WARNING,
        ERROR
    };

    // Pure virtual function for logging messages
    virtual void log(Level level, const std::string& message) = 0;

    // Convenience methods for different log levels
    void debug(const std::string& message) { log(Level::DEBUG, message); }
    void info(const std::string& message) { log(Level::INFO, message); }
    void warning(const std::string& message) { log(Level::WARNING, message); }
    void  error(const std::string& message) { log(Level::ERROR, message); }
};

// Default console logger implementation
class ConsoleLogger : public Logger {
public:
    void log(Level level, const std::string& message) override;
};

// Factory for creating loggers
class LoggerFactory {
public:
    static std::unique_ptr<Logger> createConsoleLogger();
};

#endif // LOGGER_H
```

文件名: include/File_processor. h
```cpp
#ifndef FILE_PROCESSOR_H
#define FILE_PROCESSOR_H

#include <filesystem>
#include <functional>
#include <string>
#include <vector>
#include <memory>
#include "Logger.h"
#include "Error_handler.h"

namespace fs = std::filesystem;

class FileProcessor {
public:
    // Type alias for processor function (can return any value)
    template<typename ReturnType>
    using ProcessorFunc = std::function<ReturnType(const fs::path&)>;

    // Type alias for callback function
    using CallbackFunc = std::function<void(const fs::path&)>;

    // Process a single file
    template<typename ReturnType>
    static void process_single_file(
        const fs::path& filepath,
        ProcessorFunc<ReturnType> processor,
        const std::string& exclude = "",
        CallbackFunc callback = [](const fs::path&) {},
        std::unique_ptr<ErrorHandler> error_handler = ErrorHandlerFactory::createDefaultHandler(),
        std::unique_ptr<Logger> logger = LoggerFactory::createConsoleLogger()
    );

    // Process a directory recursively
    template<typename ReturnType>
    static void process_directory(
        const fs::path& dirpath,
        ProcessorFunc<ReturnType> processor,
        const std::string& exclude = "",
        CallbackFunc callback = [](const fs::path&) {},
        std::unique_ptr<ErrorHandler> error_handler = ErrorHandlerFactory::createDefaultHandler(),
        std::unique_ptr<Logger> logger = LoggerFactory::createConsoleLogger()
    );

private:
    // Helper function to match exclude pattern
    static bool matches_exclude_pattern(const fs::path& path, const std::string& exclude);
};

#include "File_processor.tpp"

#endif // FILE_PROCESSOR_H
```

文件名: include/Error_handler. h
```cpp
#pragma once

#include <string>
#include <vector>
#include <memory>
#include <iostream>

// Abstract base class for error types
class Error {
public:
    virtual ~Error() = default;
    virtual std::string getMessage() const = 0;
    virtual std::string getType() const = 0;
};

// Concrete error types
class FileError : public Error {
private:
    std::string message;

public:
    explicit FileError(const std::string& msg) : message(msg) {}
    std::string getMessage() const override { return "File Error: " + message; }
    std::string getType() const override { return "FileError"; }
};

class ProcessingError : public Error {
private:
    std::string message;

public:
    explicit ProcessingError(const std::string& msg) : message(msg) {}
    std::string getMessage() const override { return "Processing Error: " + message; }
    std::string getType() const override { return "ProcessingError"; }
};

// Abstract base class for error handlers
class ErrorHandler {
public:
    virtual ~ErrorHandler() = default;
    virtual void handle(const Error& error) = 0;
    virtual std::vector<std::string> getErrorMessages() const = 0;
    virtual void clearErrors() = 0;
};

// Default error handler implementation
class DefaultErrorHandler : public ErrorHandler {
private:
    std::vector<std::string> errorMessages;

public:
    void handle(const Error& error) override;
    std::vector<std::string> getErrorMessages() const override { return errorMessages; }
    void clearErrors() override { errorMessages.clear(); }
};

// Factory for creating error handlers
class ErrorHandlerFactory {
public:
    static std::unique_ptr<ErrorHandler> createDefaultHandler();
};

```

文件名: include/File_processor. tpp
```cpp
#include <iostream>
#include "File_processor.h"

template <typename ReturnType>
void FileProcessor::process_single_file(
    const fs::path& filepath,
    ProcessorFunc<ReturnType> processor,
    const std::string& exclude,
    CallbackFunc callback,
    std::unique_ptr<ErrorHandler> error_handler,
    std::unique_ptr<Logger> logger) {
    if (matches_exclude_pattern(filepath, exclude)) {
        return;
    }
    try {
        if (!fs::exists(filepath)) {
            throw FileError("File does not exist: " + filepath.string());
        }

        processor(filepath);
        logger->info("Successfully processed file: " + filepath.string());

        callback(filepath);
    } catch (const Error& e) {
        // Handle known errors
        error_handler->handle(e);
        logger->error("[Known Error] Failed to process file: " + filepath.string() + " - " + e.getMessage());
    } catch (const std::exception& e) {
        // Handle standard exceptions
        ProcessingError pe(e.what());
        error_handler->handle(pe);
        logger->error("[Std Error] Failed to process file: " + filepath.string() + " - " + std::string(e.what()));
    } catch (...) {
        // Handle unknown exceptions
        ProcessingError pe("Unknown error occurred");
        error_handler->handle(pe);
        logger->error("[Unknown Error] Failed to process file: " + filepath.string() + " - Unknown error occurred");
    }
}

/**
 * \brief Process files in a directory recursively
 */
template <typename ReturnType>
void FileProcessor::process_directory(
    const fs::path& dirpath,
    ProcessorFunc<ReturnType> processor,
    const std::string& exclude,
    CallbackFunc callback,
    std::unique_ptr<ErrorHandler> error_handler,
    std::unique_ptr<Logger> logger) {
    // Check if directory exists
    if (!fs::exists(dirpath) || !fs::is_directory(dirpath)) {
        FileError error("Directory does not exist or is not a directory: " + dirpath.string());
        error_handler->handle(error);
        logger->error("Failed to process directory: " + dirpath.string());
        return;
    }

    try {
        error_handler->clearErrors();
        for (auto it = fs::recursive_directory_iterator(dirpath); it != fs::recursive_directory_iterator(); ++it) {
            const fs::path& entry_path = it->path();

            if (!exclude.empty() && fs::is_regular_file(entry_path) && matches_exclude_pattern(entry_path, exclude)) {
                continue;
            }
            if (!exclude.empty() && fs::is_directory(entry_path) && matches_exclude_pattern(entry_path, exclude)) {
                it.disable_recursion_pending();
                continue;
            }
            if (fs::is_regular_file(entry_path)) {
                // Process the file
                process_single_file<ReturnType>(
                    entry_path,
                    processor,
                    exclude,
                    callback,
                    ErrorHandlerFactory::createDefaultHandler(),
                    LoggerFactory::createConsoleLogger()
                );
            }
        }

        // Report results
        auto errors = error_handler->getErrorMessages();
        if (errors.empty()) {
            logger->info("Successfully processed all files in directory: " + dirpath.string());
        } else {
            logger->warning("Finished processing directory with " + std::to_string(errors.size()) + " errors: " + dirpath.string());
            for (const auto& error : errors) {
                logger->error(error);
            }
        }
    } catch (const std::exception& e) {
        ProcessingError error(e.what());
        error_handler->handle(error);
        logger->error("Failed to process directory: " + dirpath.string() + " - " + std::string(e.what()));
    } catch (...) {
        ProcessingError error("Unknown error occurred");
        error_handler->handle(error);
        logger->error("Failed to process directory: " + dirpath.string() + " - Unknown error occurred");
    }
}

bool FileProcessor::matches_exclude_pattern(const fs::path& path, const std::string& exclude) {
    if (exclude.empty()) {
        return false;
    }

    // Simple pattern matching implementation
    // This is a simplified version - in a real implementation, you might want to use
    // a more robust glob matching library

    std::string path_str = path.string();
    // Check if the exclude pattern is in the path
    return path_str.find(exclude) != std::string::npos;
}
```

文件名: src/Logger. cpp
```cpp
#include "Logger.h"
#include <ctime>
#include <iomanip>
#include <iostream>
#include <sstream>
#include <string>

void ConsoleLogger::log(Logger::Level level, const std::string& message) {
    // Get current time
    auto now = std::time(nullptr);
    auto local_time = std::localtime(&now);

    // Format time
    std::ostringstream time_stream;
    time_stream << std::put_time(local_time, "%Y-%m-%d %H:%M:%S");

    // Map level to string
    std::string level_str;
    switch (level) {
        case Level::DEBUG:
            level_str = "DEBUG";
            break;
        case Level::INFO:
            level_str = "INFO";
            break;
        case Level::WARNING:
            level_str = "WARNING";
            break;
        case Level::ERROR:
            level_str = "ERROR";
            break;
    }

    // Print log message
    std::cout << "[" << time_stream.str() << "] [" << level_str << "] " << message << std::endl;
}

std::unique_ptr<Logger> LoggerFactory::createConsoleLogger() {
    return std::make_unique<ConsoleLogger>();
}
```

文件名: src/Error_handler. cpp
```cpp
#include "Error_handler.h"
#include <iostream>

void DefaultErrorHandler::handle(const Error& error) {
    std::string errorMessage = error.getMessage();
    errorMessages.push_back(errorMessage);
    std::cerr << errorMessage << std::endl;
}

std::unique_ptr<ErrorHandler> ErrorHandlerFactory::createDefaultHandler() {
    return std::make_unique<DefaultErrorHandler>();
}
```

文件处理器提供了处理文件和目录的工具。

#### 设计模式
- **模板设计**：支持任何具有不同返回类型的处理器函数
- **策略模式**：处理器函数可以为不同操作定制
- **观察者模式**：回调函数用于后处理操作

#### 特性
1. `process_single_file`：使用自定义处理器函数处理单个文件
2. `process_directory`：递归处理目录中所有文件
3. 排除模式支持，跳过某些文件/目录
4. 回调支持，用于后处理操作
5. 集成错误处理和日志记录

#### 使用方法
```cpp
// 处理单个文件
FileProcessor::process_single_file(
    filepath,
    processor_function,
    callback_function,
    error_handler,
    logger
);

// 处理目录
FileProcessor::process_directory(
    dirpath,
    processor_function,
    exclude_pattern,
    callback_function,
    error_handler,
    logger
);
```

#### 实现细节
#### 文件处理器中模板设计
文件处理器使用模板来处理任何处理器函数返回类型：
```cpp
template<typename ReturnType>
using ProcessorFunc = std::function<ReturnType(const fs::path&)>;

template<typename ReturnType>
static void process_single_file(
    const fs::path& filepath,
    ProcessorFunc<ReturnType> processor,
    CallbackFunc callback = [](const fs::path&) {},
    std::unique_ptr<ErrorHandler> error_handler = ErrorHandlerFactory::createDefaultHandler(),
    std::unique_ptr<Logger> logger = LoggerFactory::createConsoleLogger()
);
```

这种设计允许文件处理器与返回任何类型的处理器函数配合使用，同时保持类型安全。

#### 与工具的集成

在工具中使用工具库：

1. 在 CMakeLists. txt 中添加库作为依赖：
```cmake
target_link_libraries(your_tool PRIVATE utils)
```

2. 包含必要的头文件：
```cpp
#include "File_processor.h"
#include "Logger.h"
#include "Error_handler.h"
```

3. 根据需要使用组件：
```cpp
auto logger = LoggerFactory::createConsoleLogger();
auto error_handler = ErrorHandlerFactory::createDefaultHandler();

FileProcessor::process_single_file(
    filepath,
    processor_function,
    callback_function,
    std::move(error_handler),
    std::move(logger)
);
```

在代码中使用组件示例
```cpp
// 创建日志记录器和错误处理器
auto logger = LoggerFactory::createConsoleLogger();
auto error_handler = ErrorHandlerFactory::createDefaultHandler();

// 处理文件
FileProcessor::process_single_file<ReturnType>(
    filepath,
    your_processor_function,
    "exclude_pattern",  // 可选的排除模式
    your_callback_function,  // 可选的回调函数
    std::move(error_handler),
    std::move(logger)
);
```

## 计算文件哈希码
### C++方法汇总
| 方法                | 执行时间 | 内存占用 | 跨平台 | 依赖        |
| ----------------- | ---- | ---- | --- | --------- |
| OpenSSL           | 2.1s | 16KB | ✓   | libcrypto |
| Windows CryptoAPI | 2.3s | 16KB | ✗   | 系统自带      |
| PicoSHA2 (纯头文件)   | 3.8s | 全文件  | ✓   | 无         |
| Boost.Uuid (不推荐)  | >10s | 全文件  | ✓   | Boost     |

| 方法                | 执行时间 | 内存占用 | 跨平台 | 依赖        |
| ----------------- | ---- | ---- | --- | --------- |
| OpenSSL           | 2.1s | 16KB | ✓   | libcrypto |
| Windows CryptoAPI | 2.3s | 16KB | ✗   | 系统自带      |
| PicoSHA2 (纯头文件)   | 3.8s | 全文件  | ✓   | 无         |
| Boost.Uuid (不推荐)  | >10s | 全文件  | ✓   | Boost     |

#### OpenSSL 加密方式
```cpp
#include <openssl/md5.h>
#include <fstream>
#include <iomanip>
#include <sstream>
#include <vector>

// 计算文件的 MD5 哈希值
std::string calculateMD5(const std::string& filename) {
    std::ifstream file(filename, std::ios::binary);
    if (!file) {
        throw std::runtime_error("无法打开文件: " + filename);
    }

    MD5_CTX md5Context;
    MD5_Init(&md5Context);

    // 分块读取文件（处理大文件）
    std::vector<char> buffer(16384); // 16KB 缓冲区
    while (file.read(buffer.data(), buffer.size()) || file.gcount()) {
        MD5_Update(&md5Context, buffer.data(), file.gcount());
    }

    unsigned char digest[MD5_DIGEST_LENGTH];
    MD5_Final(digest, &md5Context);

    // 转换为十六进制字符串
    std::stringstream ss;
    ss << std::hex << std::setfill('0');
    for (int i = 0; i < MD5_DIGEST_LENGTH; ++i) {
        ss << std::setw(2) << static_cast<int>(digest[i]);
    }

    return ss.str();
}

// 使用示例
int main() {
    try {
        std::string hash = calculateMD5("example.txt");
        std::cout << "MD5: " << hash << std::endl;
        // 输出示例：d41d8cd98f00b204e9800998ecf8427e
    } catch (const std::exception& e) {
        std::cerr << "错误: " << e.what() << std::endl;
    }
    return 0;
}
```
#### windows API
```cpp
#include <windows.h>
#include <wincrypt.h>
#include <iostream>
#include <iomanip>
#include <sstream>

std::string getFileMD5Win(const std::string& filename) {
    HCRYPTPROV hProv = 0;
    HCRYPTHASH hHash = 0;
    HANDLE hFile = NULL;
    constexpr DWORD BUFSIZE = 16384;
    BYTE rgbFile[BUFSIZE];
    DWORD cbRead = 0;

    // 打开文件
    hFile = CreateFileA(filename.c_str(), GENERIC_READ, FILE_SHARE_READ,
                       NULL, OPEN_EXISTING, FILE_FLAG_SEQUENTIAL_SCAN, NULL);
    if (INVALID_HANDLE_VALUE == hFile) {
        throw std::runtime_error("文件打开失败");
    }

    // 初始化加密上下文
    if (!CryptAcquireContext(&hProv, NULL, NULL, PROV_RSA_FULL, CRYPT_VERIFYCONTEXT)) {
        CloseHandle(hFile);
        throw std::runtime_error("加密上下文初始化失败");
    }

    if (!CryptCreateHash(hProv, CALG_MD5, 0, 0, &hHash)) {
        CryptReleaseContext(hProv, 0);
        CloseHandle(hFile);
        throw std::runtime_error("哈希创建失败");
    }

    // 读取文件并更新哈希
    while (ReadFile(hFile, rgbFile, BUFSIZE, &cbRead, NULL) && (cbRead > 0)) {
        if (!CryptHashData(hHash, rgbFile, cbRead, 0)) {
            CryptDestroyHash(hHash);
            CryptReleaseContext(hProv, 0);
            CloseHandle(hFile);
            throw std::runtime_error("哈希计算失败");
        }
    }

    // 获取哈希值
    DWORD dwHashLen = MD5_DIGEST_LENGTH;
    BYTE rgbHash[MD5_DIGEST_LENGTH];
    if (!CryptGetHashParam(hHash, HP_HASHVAL, rgbHash, &dwHashLen, 0)) {
        throw std::runtime_error("获取哈希值失败");
    }

    // 清理资源
    CryptDestroyHash(hHash);
    CryptReleaseContext(hProv, 0);
    CloseHandle(hFile);

    // 转换为十六进制字符串
    std::ostringstream oss;
    oss << std::hex << std::setfill('0');
    for (DWORD i = 0; i < dwHashLen; i++) {
        oss << std::setw(2) << static_cast<int>(rgbHash[i]);
    }
    return oss.str();
}

```
#### 使用 C++17 标准库 + 第三方头文件（无外部依赖）
```cpp
// 使用 https://github.com/okdshin/PicoSHA2 单头文件方案
#include "picosha2.h"
#include <fstream>
#include <iterator>

std::string calculateMD5_PicoSHA(const std::string& filename) {
    std::ifstream f(filename, std::ios::binary);
    std::vector<unsigned char> buffer(std::istreambuf_iterator<char>(f), {});
    return picosha2::hash256_hex_string(buffer);
}
```


## Qt 项目代码
### quick_example qt 6高级开发书籍
#### 2.3 代码化 UI 设计
```cpp
#include <QColor>
#include <QFont>
#include <QHBoxLayout>
#include <QPushButton>
#include <QVBoxLayout>
#include <QPlainTextEdit>
#include <QTextCharFormat>
#include <QTextCursor>
#include <QBrush>
#include "quickwidget.h"
#include <QGridLayout>
#include <QRadioButton>
#include <QCheckBox>
#include "./ui_quickwidget.h"

quickWidget::quickWidget(QWidget *parent)
    : QWidget(parent)
    , ui(new Ui::quickWidget)
{
    ui->setupUi(this);
    QVBoxLayout* mainLayout = new QVBoxLayout(this);

    QGridLayout* optionsLayout = new QGridLayout();
    UnderLineCheckbox = new QCheckBox("Underline", this);
    ItalicCheckbox = new QCheckBox("Italic", this);
    BoldCheckbox = new QCheckBox("Bold", this);
    BlackColorButton = new QRadioButton("Black", this);
    RedColorButton = new QRadioButton("Red", this);
    BlueColorButton = new QRadioButton("Blue", this);
    optionsLayout->addWidget(UnderLineCheckbox,0,0);
    optionsLayout->addWidget(ItalicCheckbox, 0,1);
    optionsLayout->addWidget(BoldCheckbox,0,2);
    optionsLayout->addWidget(BlackColorButton, 1,0);
    optionsLayout->addWidget(RedColorButton,1,1);
    optionsLayout->addWidget(BlueColorButton,1,2);
    mainLayout->addLayout(optionsLayout);

    display_area = new QPlainTextEdit(this);
    display_area->setPlainText("hello world\n你好世界");
    mainLayout->addWidget(display_area);

    QHBoxLayout* buttonLayout = new QHBoxLayout();
    QPushButton* updateButton = new QPushButton("update", this);
    QPushButton* exitButton = new QPushButton("quit", this);
    exitButton->setShortcut(Qt::CTRL | Qt::Key_Q);
    buttonLayout->addWidget(updateButton);
    buttonLayout->addWidget(exitButton);
    mainLayout->addLayout(buttonLayout);

    connect(updateButton, &QPushButton::clicked, this, &quickWidget::onUpdateButtonClicked);
    connect(exitButton, &QPushButton::clicked, this, &quickWidget::onExitButtonClicked);
}

quickWidget::~quickWidget()
{
    delete ui;
}

void quickWidget::onUpdateButtonClicked()
{
    QFont font = this->display_area->font();

    // 获取当前光标并选中所有文本
    QTextCursor cursor = display_area->textCursor();
    cursor.select(QTextCursor::Document);

    QTextCharFormat format;
    if(this->BlackColorButton->isChecked()){
        format.setForeground(QBrush(QColor("black")));
    } else if(this->BlueColorButton->isChecked()){
        format.setForeground(QBrush(QColor("blue")));
    } else if(this->RedColorButton->isChecked()){
        format.setForeground(QBrush(QColor("red")));
    }

    if(this->BoldCheckbox->isChecked()){
        font.setBold(true);
    } else {
        font.setBold(false);
    }
    if(this->ItalicCheckbox->isChecked()){
        font.setItalic(true);
    } else {
        font.setItalic(false);
    }
    if(this->UnderLineCheckbox->isChecked()){
        font.setUnderline(true);
    } else {
        font.setUnderline(false);
    }

    display_area->setFont(font);
    cursor.mergeCharFormat(format);  // 应用颜色格式
    display_area->setTextCursor(cursor);
}

void quickWidget::onExitButtonClicked(){
    QApplication::quit();
}
```
#### 4.10 QMainWindow 和 QAction
ui 文件
```xml
<?xml version="1.0" encoding="UTF-8"?>
<ui version="4.0">
 <class>TextEditorMainWindow</class>
 <widget class="QMainWindow" name="TextEditorMainWindow">
  <property name="geometry">
   <rect>
    <x>0</x>
    <y>0</y>
    <width>736</width>
    <height>443</height>
   </rect>
  </property>
  <property name="windowTitle">
   <string>MainWindow</string>
  </property>
  <widget class="QWidget" name="centralwidget">
   <widget class="QPlainTextEdit" name="plainTextEdit">
    <property name="geometry">
     <rect>
      <x>20</x>
      <y>10</y>
      <width>681</width>
      <height>341</height>
     </rect>
    </property>
   </widget>
  </widget>
  <widget class="QMenuBar" name="menubar">
   <property name="geometry">
    <rect>
     <x>0</x>
     <y>0</y>
     <width>736</width>
     <height>24</height>
    </rect>
   </property>
   <widget class="QMenu" name="menufile">
    <property name="title">
     <string>file</string>
    </property>
    <addaction name="actionnew_file"/>
    <addaction name="actionopen_file"/>
    <addaction name="actionsave"/>
    <addaction name="actionquit"/>
   </widget>
   <widget class="QMenu" name="menuedit">
    <property name="title">
     <string>edit</string>
    </property>
    <addaction name="actioncut"/>
    <addaction name="actioncopy"/>
    <addaction name="actionpaste"/>
    <addaction name="actionundo"/>
    <addaction name="actionredo"/>
    <addaction name="actionselect_all"/>
    <addaction name="actionclear_all"/>
   </widget>
   <widget class="QMenu" name="menuformat">
    <property name="title">
     <string>format</string>
    </property>
    <widget class="QMenu" name="menulanguage">
     <property name="title">
      <string>language</string>
     </property>
     <addaction name="action_chinese_lang"/>
     <addaction name="action_english_lang"/>
    </widget>
    <addaction name="actionbold"/>
    <addaction name="actionitalic"/>
    <addaction name="actionunderline"/>
    <addaction name="actiondisplay_button_text"/>
    <addaction name="menulanguage"/>
   </widget>
   <addaction name="menufile"/>
   <addaction name="menuedit"/>
   <addaction name="menuformat"/>
  </widget>
  <widget class="QStatusBar" name="statusbar"/>
  <widget class="QToolBar" name="toolBar">
   <property name="windowTitle">
    <string>toolBar</string>
   </property>
   <attribute name="toolBarArea">
    <enum>TopToolBarArea</enum>
   </attribute>
   <attribute name="toolBarBreak">
    <bool>false</bool>
   </attribute>
   <addaction name="actionnew_file"/>
   <addaction name="actionopen_file"/>
   <addaction name="actionsave"/>
   <addaction name="separator"/>
   <addaction name="actioncut"/>
   <addaction name="actioncopy"/>
   <addaction name="actionpaste"/>
   <addaction name="separator"/>
   <addaction name="actionundo"/>
   <addaction name="actionredo"/>
   <addaction name="separator"/>
   <addaction name="actionbold"/>
   <addaction name="actionitalic"/>
   <addaction name="actionunderline"/>
   <addaction name="separator"/>
   <addaction name="action_chinese_lang"/>
   <addaction name="action_english_lang"/>
  </widget>
  <action name="actionnew_file">
   <property name="icon">
    <iconset theme="QIcon::ThemeIcon::DocumentNew"/>
   </property>
   <property name="text">
    <string>new file</string>
   </property>
   <property name="toolTip">
    <string>make a new file</string>
   </property>
   <property name="shortcut">
    <string>Ctrl+Shift+N</string>
   </property>
   <property name="menuRole">
    <enum>QAction::MenuRole::NoRole</enum>
   </property>
  </action>
  <action name="actionopen_file">
   <property name="icon">
    <iconset theme="QIcon::ThemeIcon::DocumentOpen"/>
   </property>
   <property name="text">
    <string>open file</string>
   </property>
   <property name="toolTip">
    <string>open a existed file</string>
   </property>
   <property name="shortcut">
    <string>Ctrl+Alt+O</string>
   </property>
   <property name="menuRole">
    <enum>QAction::MenuRole::NoRole</enum>
   </property>
  </action>
  <action name="actionsave">
   <property name="icon">
    <iconset theme="QIcon::ThemeIcon::DocumentSave"/>
   </property>
   <property name="text">
    <string>save</string>
   </property>
   <property name="toolTip">
    <string>save current file</string>
   </property>
   <property name="shortcut">
    <string>Ctrl+S</string>
   </property>
   <property name="menuRole">
    <enum>QAction::MenuRole::NoRole</enum>
   </property>
  </action>
  <action name="actionquit">
   <property name="icon">
    <iconset theme="QIcon::ThemeIcon::ApplicationExit"/>
   </property>
   <property name="text">
    <string>quit</string>
   </property>
   <property name="toolTip">
    <string>quit this program</string>
   </property>
   <property name="shortcut">
    <string>Ctrl+Q</string>
   </property>
   <property name="menuRole">
    <enum>QAction::MenuRole::NoRole</enum>
   </property>
  </action>
  <action name="actioncut">
   <property name="icon">
    <iconset theme="QIcon::ThemeIcon::EditCut"/>
   </property>
   <property name="text">
    <string>cut</string>
   </property>
   <property name="toolTip">
    <string>cut text</string>
   </property>
   <property name="shortcut">
    <string>Ctrl+X</string>
   </property>
   <property name="menuRole">
    <enum>QAction::MenuRole::NoRole</enum>
   </property>
  </action>
  <action name="actionpaste">
   <property name="icon">
    <iconset theme="QIcon::ThemeIcon::EditPaste"/>
   </property>
   <property name="text">
    <string>paste</string>
   </property>
   <property name="toolTip">
    <string>paste text</string>
   </property>
   <property name="shortcut">
    <string>Ctrl+V</string>
   </property>
   <property name="menuRole">
    <enum>QAction::MenuRole::NoRole</enum>
   </property>
  </action>
  <action name="actioncopy">
   <property name="icon">
    <iconset theme="QIcon::ThemeIcon::EditCopy"/>
   </property>
   <property name="text">
    <string>copy</string>
   </property>
   <property name="toolTip">
    <string>copy text</string>
   </property>
   <property name="shortcut">
    <string>Ctrl+C</string>
   </property>
   <property name="menuRole">
    <enum>QAction::MenuRole::NoRole</enum>
   </property>
  </action>
  <action name="actionundo">
   <property name="icon">
    <iconset theme="QIcon::ThemeIcon::EditUndo"/>
   </property>
   <property name="text">
    <string>undo</string>
   </property>
   <property name="toolTip">
    <string>undo previous step</string>
   </property>
   <property name="shortcut">
    <string>Ctrl+Z</string>
   </property>
   <property name="menuRole">
    <enum>QAction::MenuRole::NoRole</enum>
   </property>
  </action>
  <action name="actionredo">
   <property name="icon">
    <iconset theme="QIcon::ThemeIcon::EditRedo"/>
   </property>
   <property name="text">
    <string>redo</string>
   </property>
   <property name="toolTip">
    <string>redo previous step</string>
   </property>
   <property name="shortcut">
    <string>Ctrl+Y</string>
   </property>
   <property name="menuRole">
    <enum>QAction::MenuRole::NoRole</enum>
   </property>
  </action>
  <action name="actionselect_all">
   <property name="icon">
    <iconset theme="QIcon::ThemeIcon::EditSelectAll"/>
   </property>
   <property name="text">
    <string>select all</string>
   </property>
   <property name="toolTip">
    <string>select all text</string>
   </property>
   <property name="shortcut">
    <string>Ctrl+A</string>
   </property>
   <property name="menuRole">
    <enum>QAction::MenuRole::NoRole</enum>
   </property>
  </action>
  <action name="actionclear_all">
   <property name="icon">
    <iconset theme="QIcon::ThemeIcon::EditClear"/>
   </property>
   <property name="text">
    <string>clear all</string>
   </property>
   <property name="toolTip">
    <string>cleal all text</string>
   </property>
   <property name="shortcut">
    <string>Ctrl+Alt+Backspace</string>
   </property>
   <property name="menuRole">
    <enum>QAction::MenuRole::NoRole</enum>
   </property>
  </action>
  <action name="actionbold">
   <property name="icon">
    <iconset theme="QIcon::ThemeIcon::FormatTextBold"/>
   </property>
   <property name="text">
    <string>bold</string>
   </property>
   <property name="toolTip">
    <string>make font bold</string>
   </property>
   <property name="shortcut">
    <string>Ctrl+B</string>
   </property>
   <property name="menuRole">
    <enum>QAction::MenuRole::NoRole</enum>
   </property>
  </action>
  <action name="actionitalic">
   <property name="icon">
    <iconset theme="QIcon::ThemeIcon::FormatTextItalic"/>
   </property>
   <property name="text">
    <string>italic</string>
   </property>
   <property name="toolTip">
    <string>make font italic</string>
   </property>
   <property name="shortcut">
    <string>Ctrl+I</string>
   </property>
   <property name="menuRole">
    <enum>QAction::MenuRole::NoRole</enum>
   </property>
  </action>
  <action name="actionunderline">
   <property name="icon">
    <iconset theme="QIcon::ThemeIcon::FormatTextUnderline"/>
   </property>
   <property name="text">
    <string>underline</string>
   </property>
   <property name="toolTip">
    <string>make font underline</string>
   </property>
   <property name="shortcut">
    <string>Ctrl+U</string>
   </property>
   <property name="menuRole">
    <enum>QAction::MenuRole::NoRole</enum>
   </property>
  </action>
  <action name="actiondisplay_button_text">
   <property name="text">
    <string>display button text</string>
   </property>
   <property name="toolTip">
    <string>display the text in front of button</string>
   </property>
   <property name="menuRole">
    <enum>QAction::MenuRole::NoRole</enum>
   </property>
  </action>
  <action name="action_chinese_lang">
   <property name="text">
    <string>中文</string>
   </property>
   <property name="menuRole">
    <enum>QAction::MenuRole::NoRole</enum>
   </property>
  </action>
  <action name="action_english_lang">
   <property name="text">
    <string>English</string>
   </property>
   <property name="menuRole">
    <enum>QAction::MenuRole::NoRole</enum>
   </property>
  </action>
 </widget>
 <resources/>
 <connections/>
</ui>
```
头文件
```cpp
#ifndef TEXTEDITORMAINWINDOW_H
#define TEXTEDITORMAINWINDOW_H
#include <qfont.h>
#include <qspinbox.h>
#include <QProgressBar>
#include <QFontComboBox>
#include <qactiongroup.h>
#include <QMainWindow>
#include <qlabel.h>
#include <qgroupbox.h>

QT_BEGIN_NAMESPACE
namespace Ui { class TextEditorMainWindow; }
QT_END_NAMESPACE

class TextEditorMainWindow : public QMainWindow
{
    Q_OBJECT

public:
    TextEditorMainWindow(QWidget *parent = nullptr);
    ~TextEditorMainWindow();

private:
    QLabel *labelCurrentFile;
    QLabel *labelOfFontInfo;
    QProgressBar *progressbarOfFontSize;
    QSpinBox *spinForFontSize;
    QFontComboBox *comboFontNames;
    QActionGroup * groupLanguages;

    void buildUI();
    void buildSignalsSlots();

private slots:
    void do_fontsize_changed(int fontsize);
    void do_font_selected(const QFont &font);

    void on_actionitalic_triggered(bool checked);
    void on_actionunderline_triggered(bool checked);
    void on_actionbold_triggered(bool checked);

    void on_actionsave_triggered();

public slots:

private:
    Ui::TextEditorMainWindow *ui;
};

#endif // TEXTEDITORMAINWINDOW_H

```
源文件
```cpp
#include "texteditormainwindow.h"
#include "ui_texteditormainwindow.h"
#include <qfontcombobox.h>

TextEditorMainWindow::TextEditorMainWindow(QWidget *parent)
    : QMainWindow(parent)
    , ui(new Ui::TextEditorMainWindow)
{
    ui->setupUi(this);
    buildUI();
    buildSignalsSlots();
}

TextEditorMainWindow::~TextEditorMainWindow()
{
    delete ui;
}

void TextEditorMainWindow::buildUI()
{
    labelCurrentFile = new QLabel("current file:", this);
    labelCurrentFile->setMinimumWidth(150);
    ui->statusbar->addWidget(labelCurrentFile);

    ui->plainTextEdit->setPlainText("this is plain text.");

    progressbarOfFontSize = new QProgressBar(this);
    progressbarOfFontSize->setMinimum(5);
    progressbarOfFontSize->setMaximum(50);
    progressbarOfFontSize->setMinimumWidth(200);
    progressbarOfFontSize->setValue(ui->plainTextEdit->font().pointSize());
    ui->statusbar->addWidget(progressbarOfFontSize);

    labelOfFontInfo = new QLabel("current font: ", this);
    ui->statusbar->addPermanentWidget(labelOfFontInfo);

    groupLanguages = new QActionGroup(this);
    groupLanguages->addAction(ui->action_chinese_lang);
    groupLanguages->addAction(ui->action_english_lang);
    groupLanguages->setExclusive(true);
    ui->action_chinese_lang->setChecked(true);

    spinForFontSize = new QSpinBox(this);
    spinForFontSize->setMinimum(5);
    spinForFontSize->setMaximum(50);
    spinForFontSize->setValue(ui->plainTextEdit->font().pointSize());
    ui->toolBar->addWidget(spinForFontSize);  // 不添加这一行spinbox会默认在工具栏的0，0坐标位置添加

    comboFontNames = new QFontComboBox(this);
    comboFontNames->setMinimumWidth(150);
    ui->toolBar->addWidget(comboFontNames);
    ui->toolBar->addSeparator();

    this->labelOfFontInfo->setText(ui->plainTextEdit->font().toString());
    this->labelCurrentFile->setText("[tempoal file]");
    ui->actionbold->setCheckable(true);
    ui->actionitalic->setCheckable(true);
    ui->actionunderline->setCheckable(true);
}

void TextEditorMainWindow::buildSignalsSlots()
{
    connect(this->spinForFontSize, &QSpinBox::valueChanged, this, &TextEditorMainWindow::do_fontsize_changed);
    connect(this->comboFontNames, &QFontComboBox::currentFontChanged, this, &TextEditorMainWindow::do_font_selected);
}

void TextEditorMainWindow::do_fontsize_changed(int fontsize)
{
    QTextCursor cursor = ui->plainTextEdit->textCursor();

    QTextCharFormat format;
    format.setFontPointSize(fontsize);
    if (cursor.hasSelection()) {
        cursor.mergeCharFormat(format);
    } else {
        ui->plainTextEdit->mergeCurrentCharFormat(format);
        QFont currentFont = ui->plainTextEdit->font();
        currentFont.setPointSize(fontsize);
        ui->plainTextEdit->setFont(currentFont);
    }

    progressbarOfFontSize->setValue(fontsize);
}

void TextEditorMainWindow::do_font_selected(const QFont &font)
{
    this->labelOfFontInfo->setText(QString("current font family: %1").arg(font.family()));
    QTextCursor cursor = ui->plainTextEdit->textCursor();

    QTextCharFormat format;
    format.setFontFamily(font.family());
    if (cursor.hasSelection()) {
        cursor.mergeCharFormat(format);  // 对光标选中字符有效
    } else {
        ui->plainTextEdit->mergeCurrentCharFormat(format); // 对接下来输入的内容有效

        // cursor.select(QTextCursor::Document);  // 对文档中所有文字有效
        // cursor.mergeCharFormat(format);
    }
}

void TextEditorMainWindow::on_actionbold_triggered(bool checked)
{
    QTextCharFormat fmt = ui->plainTextEdit->currentCharFormat();
    if(checked){
        fmt.setFontWeight(QFont::Bold);
    }else{
        fmt.setFontWeight(QFont::Normal);
    }
    ui->plainTextEdit->mergeCurrentCharFormat(fmt);
}

void TextEditorMainWindow::on_actionitalic_triggered(bool checked)
{
    QTextCharFormat fmt = ui->plainTextEdit->currentCharFormat();
    fmt.setFontItalic(checked);
    ui->plainTextEdit->mergeCurrentCharFormat(fmt);
}

void TextEditorMainWindow::on_actionunderline_triggered(bool checked)
{
    QTextCharFormat fmt = ui->plainTextEdit->currentCharFormat();
    fmt.setFontUnderline(checked);
    ui->plainTextEdit->mergeCurrentCharFormat(fmt);
}


void TextEditorMainWindow::on_actionsave_triggered()
{
    ui->plainTextEdit->document()->setModified(false);
    labelCurrentFile->setText("current file saved.");
}
```
#### 4.11 QLIstWidget
```xml
<?xml version="1.0" encoding="UTF-8"?>
<ui version="4.0">
 <class>ListWidgetMainWindow</class>
 <widget class="QMainWindow" name="ListWidgetMainWindow">
  <property name="geometry">
   <rect>
    <x>0</x>
    <y>0</y>
    <width>618</width>
    <height>487</height>
   </rect>
  </property>
  <property name="windowTitle">
   <string>MainWindow</string>
  </property>
  <widget class="QWidget" name="centralwidget">
   <widget class="QListWidget" name="listWidget">
    <property name="geometry">
     <rect>
      <x>180</x>
      <y>90</y>
      <width>421</width>
      <height>281</height>
     </rect>
    </property>
   </widget>
   <widget class="QToolBox" name="toolBox">
    <property name="geometry">
     <rect>
      <x>10</x>
      <y>10</y>
      <width>161</width>
      <height>291</height>
     </rect>
    </property>
    <property name="currentIndex">
     <number>1</number>
    </property>
    <widget class="QWidget" name="page_list_item_operate">
     <property name="geometry">
      <rect>
       <x>0</x>
       <y>0</y>
       <width>161</width>
       <height>189</height>
      </rect>
     </property>
     <attribute name="label">
      <string>列表项操作</string>
     </attribute>
     <widget class="QWidget" name="layoutWidget">
      <property name="geometry">
       <rect>
        <x>10</x>
        <y>0</y>
        <width>111</width>
        <height>181</height>
       </rect>
      </property>
      <layout class="QVBoxLayout" name="layout_vertical_buttons">
       <item>
        <widget class="QToolButton" name="toolButton_init_list">
         <property name="text">
          <string>init list</string>
         </property>
        </widget>
       </item>
       <item>
        <widget class="QToolButton" name="toolButton_clear_list">
         <property name="text">
          <string>clear list</string>
         </property>
        </widget>
       </item>
       <item>
        <widget class="QToolButton" name="toolButton_delete_item">
         <property name="text">
          <string>delete item</string>
         </property>
        </widget>
       </item>
       <item>
        <widget class="QToolButton" name="toolButton_insert_item">
         <property name="text">
          <string>insert item</string>
         </property>
        </widget>
       </item>
       <item>
        <widget class="QToolButton" name="toolButton_add_item">
         <property name="text">
          <string>add item</string>
         </property>
        </widget>
       </item>
      </layout>
     </widget>
    </widget>
    <widget class="QWidget" name="page_list_item_sort">
     <property name="geometry">
      <rect>
       <x>0</x>
       <y>0</y>
       <width>161</width>
       <height>189</height>
      </rect>
     </property>
     <attribute name="label">
      <string>列表排序</string>
     </attribute>
     <widget class="QCheckBox" name="checkbox_allow_sort">
      <property name="geometry">
       <rect>
        <x>20</x>
        <y>10</y>
        <width>100</width>
        <height>25</height>
       </rect>
      </property>
      <property name="text">
       <string>allow sort</string>
      </property>
     </widget>
     <widget class="QToolButton" name="toolButton_asc">
      <property name="geometry">
       <rect>
        <x>30</x>
        <y>50</y>
        <width>71</width>
        <height>31</height>
       </rect>
      </property>
      <property name="text">
       <string>asc</string>
      </property>
     </widget>
     <widget class="QToolButton" name="toolButton_desc">
      <property name="geometry">
       <rect>
        <x>30</x>
        <y>100</y>
        <width>71</width>
        <height>31</height>
       </rect>
      </property>
      <property name="text">
       <string>desc</string>
      </property>
     </widget>
    </widget>
    <widget class="QWidget" name="page_signal_shot_time">
     <property name="geometry">
      <rect>
       <x>0</x>
       <y>0</y>
       <width>161</width>
       <height>189</height>
      </rect>
     </property>
     <attribute name="label">
      <string>信号发射时机</string>
     </attribute>
    </widget>
   </widget>
   <widget class="QLabel" name="label_item_change">
    <property name="geometry">
     <rect>
      <x>180</x>
      <y>10</y>
      <width>101</width>
      <height>21</height>
     </rect>
    </property>
    <property name="text">
     <string>item change</string>
    </property>
   </widget>
   <widget class="QLineEdit" name="lineEdit_item_change">
    <property name="geometry">
     <rect>
      <x>282</x>
      <y>10</y>
      <width>171</width>
      <height>27</height>
     </rect>
    </property>
   </widget>
   <widget class="QCheckBox" name="checkBox_is_editable">
    <property name="geometry">
     <rect>
      <x>470</x>
      <y>10</y>
      <width>100</width>
      <height>25</height>
     </rect>
    </property>
    <property name="text">
     <string>ediable</string>
    </property>
   </widget>
   <widget class="QWidget" name="layoutWidget">
    <property name="geometry">
     <rect>
      <x>180</x>
      <y>50</y>
      <width>422</width>
      <height>30</height>
     </rect>
    </property>
    <layout class="QHBoxLayout" name="horizontalLayout">
     <item>
      <widget class="QToolButton" name="toolButton_select_buttons">
       <property name="text">
        <string>select buttons</string>
       </property>
       <property name="popupMode">
        <enum>QToolButton::ToolButtonPopupMode::InstantPopup</enum>
       </property>
      </widget>
     </item>
     <item>
      <widget class="QToolButton" name="toolButton_select_all">
       <property name="text">
        <string>select all</string>
       </property>
      </widget>
     </item>
     <item>
      <widget class="QToolButton" name="toolButton_select_none">
       <property name="text">
        <string>select none</string>
       </property>
      </widget>
     </item>
     <item>
      <widget class="QToolButton" name="toolButton_select_inves">
       <property name="text">
        <string>select inves</string>
       </property>
      </widget>
     </item>
    </layout>
   </widget>
  </widget>
  <widget class="QMenuBar" name="menubar">
   <property name="geometry">
    <rect>
     <x>0</x>
     <y>0</y>
     <width>618</width>
     <height>24</height>
    </rect>
   </property>
  </widget>
  <widget class="QStatusBar" name="statusbar"/>
  <widget class="QToolBar" name="toolBar">
   <property name="windowTitle">
    <string>toolBar</string>
   </property>
   <property name="toolButtonStyle">
    <enum>Qt::ToolButtonStyle::ToolButtonTextUnderIcon</enum>
   </property>
   <attribute name="toolBarArea">
    <enum>TopToolBarArea</enum>
   </attribute>
   <attribute name="toolBarBreak">
    <bool>false</bool>
   </attribute>
   <addaction name="action_init_list"/>
   <addaction name="action_clear_list"/>
   <addaction name="action_insert_item"/>
   <addaction name="action_append_item"/>
   <addaction name="action_delete_item"/>
   <addaction name="action_exit"/>
  </widget>
  <action name="action_init_list">
   <property name="icon">
    <iconset theme="QIcon::ThemeIcon::DocumentNew"/>
   </property>
   <property name="text">
    <string>init list</string>
   </property>
   <property name="menuRole">
    <enum>QAction::MenuRole::NoRole</enum>
   </property>
  </action>
  <action name="action_clear_list">
   <property name="icon">
    <iconset theme="QIcon::ThemeIcon::ApplicationExit"/>
   </property>
   <property name="text">
    <string>clear list</string>
   </property>
   <property name="menuRole">
    <enum>QAction::MenuRole::NoRole</enum>
   </property>
  </action>
  <action name="action_insert_item">
   <property name="icon">
    <iconset theme="QIcon::ThemeIcon::EditDelete"/>
   </property>
   <property name="text">
    <string>insert item</string>
   </property>
   <property name="menuRole">
    <enum>QAction::MenuRole::NoRole</enum>
   </property>
  </action>
  <action name="action_append_item">
   <property name="icon">
    <iconset theme="QIcon::ThemeIcon::MailMessageNew"/>
   </property>
   <property name="text">
    <string>append item</string>
   </property>
   <property name="menuRole">
    <enum>QAction::MenuRole::NoRole</enum>
   </property>
  </action>
  <action name="action_delete_item">
   <property name="icon">
    <iconset theme="QIcon::ThemeIcon::EditClear"/>
   </property>
   <property name="text">
    <string>delete item</string>
   </property>
   <property name="menuRole">
    <enum>QAction::MenuRole::NoRole</enum>
   </property>
  </action>
  <action name="action_exit">
   <property name="icon">
    <iconset theme="QIcon::ThemeIcon::MediaRecord"/>
   </property>
   <property name="text">
    <string>exit</string>
   </property>
   <property name="menuRole">
    <enum>QAction::MenuRole::NoRole</enum>
   </property>
  </action>
  <action name="action_select_all">
   <property name="checkable">
    <bool>false</bool>
   </property>
   <property name="icon">
    <iconset theme="QIcon::ThemeIcon::EditCopy"/>
   </property>
   <property name="text">
    <string>select all</string>
   </property>
   <property name="menuRole">
    <enum>QAction::MenuRole::NoRole</enum>
   </property>
  </action>
  <action name="action_select_none">
   <property name="icon">
    <iconset theme="QIcon::ThemeIcon::GoHome"/>
   </property>
   <property name="text">
    <string>select none</string>
   </property>
   <property name="menuRole">
    <enum>QAction::MenuRole::NoRole</enum>
   </property>
  </action>
  <action name="action_select_inves">
   <property name="icon">
    <iconset theme="QIcon::ThemeIcon::HelpAbout"/>
   </property>
   <property name="text">
    <string>select inves</string>
   </property>
   <property name="menuRole">
    <enum>QAction::MenuRole::NoRole</enum>
   </property>
  </action>
 </widget>
 <resources/>
 <connections/>
</ui>
```
```cpp
// 头文件
#ifndef LISTWIDGETMAINWINDOW_H
#define LISTWIDGETMAINWINDOW_H
#include <QListWidget>
#include <QMainWindow>

QT_BEGIN_NAMESPACE
namespace Ui { class ListWidgetMainWindow; }
QT_END_NAMESPACE

class ListWidgetMainWindow : public QMainWindow
{
    Q_OBJECT

public:
    ListWidgetMainWindow(QWidget* parent = nullptr);
    ~ListWidgetMainWindow();

private slots:
    void on_action_init_list_triggered();
    void on_action_clear_list_triggered();
    void on_action_insert_item_triggered();
    void on_action_append_item_triggered();
    void on_action_delete_item_triggered();
    void on_action_exit_triggered();
    void on_action_select_all_triggered();
    void on_toolButton_asc_clicked();
    void on_toolButton_desc_clicked();
    void on_listWidget_currentItemChanged(QListWidgetItem *current, QListWidgetItem *previous);
    void on_listWidget_customContextMenuRequested(const QPoint &pos);

private:
    Ui::ListWidgetMainWindow *ui;

    void set_actions_for_buttons();
    void build_UI();
    void create_selection_menu();
};
#endif // LISTWIDGETMAINWINDOW_H
// 源文件
#include <qmessagebox.h>
#include "listwidgetmainwindow.h"
#include "ui_listwidgetmainwindow.h"

ListWidgetMainWindow::ListWidgetMainWindow(QWidget* parent)
    : QMainWindow(parent), ui(new Ui::ListWidgetMainWindow)
{
    ui->setupUi(this);
    build_UI();
    set_actions_for_buttons();
    create_selection_menu();
}

ListWidgetMainWindow::~ListWidgetMainWindow()
{
    delete ui;
}

void ListWidgetMainWindow::on_action_init_list_triggered()
{
    ui->listWidget->clear();
    bool is_editable = ui->checkBox_is_editable->isChecked();

    for(int i = 0;i<5;i++){
        QListWidgetItem* item = new QListWidgetItem(QString("item%1").arg(i), this->ui->listWidget);
        item->setCheckState(Qt::CheckState::Unchecked);
        if(is_editable){
            item->setFlags(Qt::ItemIsSelectable | Qt::ItemIsEditable | Qt::ItemIsUserCheckable | Qt::ItemIsEnabled);
        }else{
            item->setFlags(Qt::ItemIsSelectable | Qt::ItemIsUserCheckable | Qt::ItemIsEnabled);
        }
        ui->listWidget->addItem(item);
    }
}

void ListWidgetMainWindow::set_actions_for_buttons()
{
    ui->toolButton_init_list->setDefaultAction(ui->action_init_list);
    ui->toolButton_init_list->setToolButtonStyle(Qt::ToolButtonTextOnly);
    ui->toolButton_add_item->setDefaultAction(ui->action_append_item);
    ui->toolButton_add_item->setToolButtonStyle(Qt::ToolButtonTextOnly);
    ui->toolButton_clear_list->setDefaultAction(ui->action_clear_list);
    ui->toolButton_clear_list->setToolButtonStyle(Qt::ToolButtonTextOnly);
    ui->toolButton_delete_item->setDefaultAction(ui->action_delete_item);
    ui->toolButton_delete_item->setToolButtonStyle(Qt::ToolButtonTextOnly);
    ui->toolButton_insert_item->setDefaultAction(ui->action_insert_item);
    ui->toolButton_insert_item->setToolButtonStyle(Qt::ToolButtonTextOnly);
    ui->toolButton_select_all->setDefaultAction(ui->action_select_all);
    ui->toolButton_select_all->setToolButtonStyle(Qt::ToolButtonTextOnly);
    ui->toolButton_select_none->setDefaultAction(ui->action_select_none);
    ui->toolButton_select_none->setToolButtonStyle(Qt::ToolButtonTextOnly);
    ui->toolButton_select_inves->setDefaultAction(ui->action_select_none);
    ui->toolButton_select_inves->setToolButtonStyle(Qt::ToolButtonTextOnly);
}

void ListWidgetMainWindow::build_UI()
{
    ui->listWidget->setContextMenuPolicy(Qt::CustomContextMenu);
    for(int i = 0; i< ui->layout_vertical_buttons->count(); i++){
        QToolButton* button = qobject_cast<QToolButton*>(ui->layout_vertical_buttons->itemAt(i)->widget());
        button->setSizePolicy(QSizePolicy::Expanding, QSizePolicy::Fixed);
    }
    ui->listWidget->setSelectionMode(QAbstractItemView::ExtendedSelection);
    ui->toolBox->setCurrentIndex(0);
}

void ListWidgetMainWindow::create_selection_menu()
{
    QMenu* menu_selection = new QMenu(this);
    menu_selection->addAction(ui->action_select_all);
    menu_selection->addAction(ui->action_select_inves);
    menu_selection->addAction(ui->action_select_none);

    // QToolButton* button = new QToolButton(this);
    ui->toolButton_select_buttons->setPopupMode(QToolButton::InstantPopup);
    ui->toolButton_select_buttons->setToolButtonStyle(Qt::ToolButtonTextUnderIcon);
    ui->toolButton_select_buttons->setMenu(menu_selection);
}

void ListWidgetMainWindow::on_action_clear_list_triggered()
{
    ui->listWidget->clear();
}


void ListWidgetMainWindow::on_action_insert_item_triggered()
{
    auto selected_items = ui->listWidget->selectedItems();
    int order = ui->listWidget->currentRow();
    QListWidgetItem* item = new QListWidgetItem(QString("insert item"), this->ui->listWidget);
    if(selected_items.size() == 1){
        if(ui->checkBox_is_editable){
            item->setFlags(Qt::ItemIsSelectable | Qt::ItemIsUserCheckable | Qt::ItemIsEnabled | Qt::ItemIsEditable);
            item->setCheckState(Qt::Unchecked);
        }else{
            item->setFlags(Qt::ItemIsSelectable | Qt::ItemIsUserCheckable | Qt::ItemIsEnabled);
        }
        ui->listWidget->insertItem(order, item);
    }else{
        on_action_append_item_triggered();
        delete item;
    }
}


void ListWidgetMainWindow::on_action_append_item_triggered()
{
    QListWidgetItem* item = new QListWidgetItem(QString("append item"), this->ui->listWidget);
    item->setCheckState(Qt::Unchecked);
    if(ui->checkBox_is_editable){
        item->setFlags(Qt::ItemIsSelectable | Qt::ItemIsUserCheckable | Qt::ItemIsEnabled | Qt::ItemIsEditable);
    }else{
        item->setFlags(Qt::ItemIsSelectable | Qt::ItemIsUserCheckable | Qt::ItemIsEnabled);
    }
    ui->listWidget->addItem(item);
}


void ListWidgetMainWindow::on_action_delete_item_triggered()
{
    if(ui->listWidget->selectedItems().size() == 0){
        QMessageBox::warning(this,"Warring","you must choose 1 item at least.");
        return;
    }
    for(int i = 0;i<ui->listWidget->count();i++){
        if(ui->listWidget->item(i)->isSelected()){
            QListWidgetItem *taked_item = ui->listWidget->takeItem(i);
            delete taked_item;
        }
    }
}


void ListWidgetMainWindow::on_action_exit_triggered()
{
    QApplication::exit();
}


void ListWidgetMainWindow::on_action_select_all_triggered()
{
    ui->listWidget->selectAll();
}


void ListWidgetMainWindow::on_toolButton_asc_clicked()
{
    if(!ui->checkbox_allow_sort->isChecked()){
        QMessageBox::warning(this,"Warring","you have to allow sort list.");
        return ;
    }
    ui->listWidget->sortItems(Qt::AscendingOrder);
}


void ListWidgetMainWindow::on_toolButton_desc_clicked()
{
    if(!ui->checkbox_allow_sort->isChecked()){
        QMessageBox::warning(this,"Warring","you have to allow sort list.");
        return ;
    }
    ui->listWidget->sortItems(Qt::DescendingOrder);
}


void ListWidgetMainWindow::on_listWidget_currentItemChanged(QListWidgetItem *current, QListWidgetItem *previous)
{
    QString display;
    if(current != nullptr){
        // display+="current item: " + ui->listWidget->currentItem()->text();
        display+="current item: " + current->text();
    }
    if(current != nullptr && previous != nullptr) display += " | ";
    if(previous != nullptr){
        display += "previous item: " + previous->text();
    }

    ui->lineEdit_item_change->setText(display);
}


void ListWidgetMainWindow::on_listWidget_customContextMenuRequested(const QPoint &pos)
{
    if(ui->listWidget->itemAt(pos) == nullptr){
        QPoint global_pos = ui->listWidget->viewport()->mapToGlobal(pos);
        QMenu* press_menu = new QMenu(this);
        press_menu->addAction(ui->action_init_list);
        press_menu->addAction(ui->action_insert_item);
        press_menu->addAction(ui->action_append_item);
        press_menu->addAction(ui->action_delete_item);
        press_menu->addSeparator();
        press_menu->addAction(ui->action_select_all);
        press_menu->addAction(ui->action_select_none);
        press_menu->addAction(ui->action_select_inves);

        press_menu->exec(global_pos);
    }
}

```
#### 4.12 QTreeWidget
```xml
<RCC>
    <qresource prefix="/common">
        <file>icons/folder.svg</file>
        <file>icons/pic.svg</file>
    </qresource>
</RCC>
```
```xml
<?xml version="1.0" encoding="UTF-8"?>
<ui version="4.0">
 <class>TreeWidgetMainWindow</class>
 <widget class="QMainWindow" name="TreeWidgetMainWindow">
  <property name="geometry">
   <rect>
    <x>0</x>
    <y>0</y>
    <width>804</width>
    <height>600</height>
   </rect>
  </property>
  <property name="windowTitle">
   <string>MainWindow</string>
  </property>
  <widget class="QWidget" name="centralwidget">
   <widget class="QScrollArea" name="scrollArea">
    <property name="geometry">
     <rect>
      <x>0</x>
      <y>0</y>
      <width>511</width>
      <height>471</height>
     </rect>
    </property>
    <property name="widgetResizable">
     <bool>true</bool>
    </property>
    <widget class="QWidget" name="scrollAreaWidgetContents">
     <property name="geometry">
      <rect>
       <x>0</x>
       <y>0</y>
       <width>509</width>
       <height>469</height>
      </rect>
     </property>
     <layout class="QHBoxLayout" name="horizontalLayout_2">
      <item>
       <widget class="QLabel" name="label">
        <property name="text">
         <string>TextLabel</string>
        </property>
       </widget>
      </item>
     </layout>
    </widget>
   </widget>
  </widget>
  <widget class="QMenuBar" name="menubar">
   <property name="geometry">
    <rect>
     <x>0</x>
     <y>0</y>
     <width>804</width>
     <height>24</height>
    </rect>
   </property>
   <widget class="QMenu" name="menu_dir_tree">
    <property name="title">
     <string>目录树</string>
    </property>
   </widget>
   <widget class="QMenu" name="menu_view">
    <property name="title">
     <string>视图</string>
    </property>
   </widget>
   <addaction name="menu_dir_tree"/>
   <addaction name="menu_view"/>
  </widget>
  <widget class="QStatusBar" name="statusbar"/>
  <widget class="QToolBar" name="toolBar">
   <property name="windowTitle">
    <string>toolBar</string>
   </property>
   <property name="toolButtonStyle">
    <enum>Qt::ToolButtonStyle::ToolButtonTextUnderIcon</enum>
   </property>
   <attribute name="toolBarArea">
    <enum>TopToolBarArea</enum>
   </attribute>
   <attribute name="toolBarBreak">
    <bool>false</bool>
   </attribute>
   <addaction name="actionadd_folder"/>
   <addaction name="actionadd_files"/>
   <addaction name="actiondelete_item"/>
   <addaction name="actionscan_items"/>
   <addaction name="actionzoom_in"/>
   <addaction name="actionzoom_out"/>
   <addaction name="actionzoom_real_size"/>
   <addaction name="actionzoom_fit_width"/>
   <addaction name="actionzoom_fit_height"/>
   <addaction name="actiondock_float"/>
   <addaction name="actiondock_visible"/>
   <addaction name="actionquit"/>
  </widget>
  <widget class="QDockWidget" name="dock_left_side">
   <attribute name="dockWidgetArea">
    <number>1</number>
   </attribute>
   <widget class="QWidget" name="dockWidgetContents">
    <layout class="QHBoxLayout" name="horizontalLayout">
     <item>
      <widget class="QTreeWidget" name="treeWidget_files">
       <column>
        <property name="text">
         <string notr="true">1</string>
        </property>
       </column>
      </widget>
     </item>
    </layout>
   </widget>
  </widget>
  <action name="actionadd_folder">
   <property name="icon">
    <iconset theme="QIcon::ThemeIcon::AddressBookNew"/>
   </property>
   <property name="text">
    <string>add_folder</string>
   </property>
   <property name="menuRole">
    <enum>QAction::MenuRole::NoRole</enum>
   </property>
  </action>
  <action name="actionadd_files">
   <property name="icon">
    <iconset theme="QIcon::ThemeIcon::DocumentNew"/>
   </property>
   <property name="text">
    <string>add_files</string>
   </property>
   <property name="menuRole">
    <enum>QAction::MenuRole::NoRole</enum>
   </property>
  </action>
  <action name="actionzoom_in">
   <property name="icon">
    <iconset theme="QIcon::ThemeIcon::ZoomIn"/>
   </property>
   <property name="text">
    <string>zoom_in</string>
   </property>
   <property name="menuRole">
    <enum>QAction::MenuRole::NoRole</enum>
   </property>
  </action>
  <action name="actionzoom_out">
   <property name="icon">
    <iconset theme="QIcon::ThemeIcon::ZoomOut"/>
   </property>
   <property name="text">
    <string>zoom_out</string>
   </property>
   <property name="menuRole">
    <enum>QAction::MenuRole::NoRole</enum>
   </property>
  </action>
  <action name="actionzoom_real_size">
   <property name="icon">
    <iconset theme="QIcon::ThemeIcon::DocumentPrint"/>
   </property>
   <property name="text">
    <string>zoom_real_size</string>
   </property>
   <property name="menuRole">
    <enum>QAction::MenuRole::NoRole</enum>
   </property>
  </action>
  <action name="actiondelete_item">
   <property name="icon">
    <iconset theme="QIcon::ThemeIcon::EditDelete"/>
   </property>
   <property name="text">
    <string>delete_item</string>
   </property>
   <property name="menuRole">
    <enum>QAction::MenuRole::NoRole</enum>
   </property>
  </action>
  <action name="actionquit">
   <property name="icon">
    <iconset theme="QIcon::ThemeIcon::WindowClose"/>
   </property>
   <property name="text">
    <string>quit</string>
   </property>
   <property name="menuRole">
    <enum>QAction::MenuRole::NoRole</enum>
   </property>
  </action>
  <action name="actionzoom_fit_width">
   <property name="icon">
    <iconset theme="QIcon::ThemeIcon::FormatJustifyCenter"/>
   </property>
   <property name="text">
    <string>zoom_fit_width</string>
   </property>
   <property name="menuRole">
    <enum>QAction::MenuRole::NoRole</enum>
   </property>
  </action>
  <action name="actionzoom_fit_height">
   <property name="icon">
    <iconset theme="QIcon::ThemeIcon::GoUp"/>
   </property>
   <property name="text">
    <string>zoom_fit_height</string>
   </property>
   <property name="menuRole">
    <enum>QAction::MenuRole::NoRole</enum>
   </property>
  </action>
  <action name="actionscan_items">
   <property name="icon">
    <iconset theme="QIcon::ThemeIcon::DocumentOpen"/>
   </property>
   <property name="text">
    <string>scan_items</string>
   </property>
   <property name="menuRole">
    <enum>QAction::MenuRole::NoRole</enum>
   </property>
  </action>
  <action name="actiondock_visible">
   <property name="icon">
    <iconset theme="QIcon::ThemeIcon::InsertImage"/>
   </property>
   <property name="text">
    <string>dock_visible</string>
   </property>
   <property name="toolTip">
    <string>dock_visible</string>
   </property>
   <property name="menuRole">
    <enum>QAction::MenuRole::NoRole</enum>
   </property>
  </action>
  <action name="actiondock_float">
   <property name="icon">
    <iconset theme="QIcon::ThemeIcon::EditSelectAll"/>
   </property>
   <property name="text">
    <string>dock_float</string>
   </property>
   <property name="toolTip">
    <string>dock_float</string>
   </property>
   <property name="menuRole">
    <enum>QAction::MenuRole::NoRole</enum>
   </property>
  </action>
 </widget>
 <resources/>
 <connections/>
</ui>
```
```cpp
#ifndef TREEWIDGETMAINWINDOW_H
#define TREEWIDGETMAINWINDOW_H

#include <qspinbox.h>
#include <QLabel>
#include <qpixmap.h>
#include <qmainwindow.h>
#include <QTreeWidgetItem>
QT_BEGIN_NAMESPACE
namespace Ui { class TreeWidgetMainWindow; }
QT_END_NAMESPACE


class TreeWidgetMainWindow : public QMainWindow
{
    Q_OBJECT
public:
    explicit TreeWidgetMainWindow(QMainWindow *parent = nullptr);
    ~TreeWidgetMainWindow();

private:
    Ui::TreeWidgetMainWindow* ui;
    enum    Tree_Type{itTopItem=1001, itGroupItem, itImageItem};
    enum    Tree_Col_Num{colItem=0, colItemType, colDate}; //目录树列的序号
    QLabel* label_filename;
    QLabel* label_node_text;
    QSpinBox *spinBox_ratio;
    QPixmap pixmap_;
    float ratio_;

    void build_ui();
    void    build_tree_header();                           //构建目录树表头
    void    init_tree();                                   //初始化目录树
    void    add_folder_item(QTreeWidgetItem *parent_item, QString dir_name);  //添加目录节点
    QString get_final_folder_name(const QString &full_path_name);           //提取目录名称
    void    add_image_item(QTreeWidgetItem *partition_item,QString filename);  //添加图片节点
    void    display_image(QTreeWidgetItem *item);           //显示一个图片节点关联的图片
    void    change_item_caption(QTreeWidgetItem *item);      //遍历改变节点标题
    void    delete_item(QTreeWidgetItem *partition_item, QTreeWidgetItem *item);//删除一个节点

signals:
private slots:
    void on_actionadd_folder_triggered();
    void on_actionadd_files_triggered();
    void on_treeWidget_files_currentItemChanged(QTreeWidgetItem *current, QTreeWidgetItem *previous);
    void on_actiondelete_item_triggered();
    void on_actionscan_items_triggered();
    void on_actiondock_float_triggered(bool checked);
    void on_actiondock_visible_triggered(bool checked);
};

#endif // TREEWIDGETMAINWINDOW_H

```

```cpp
#include "treewidgetmainwindow.h"
#include "ui_treewidgetmainwindow.h"
#include <QFileDialog>

TreeWidgetMainWindow::TreeWidgetMainWindow(QMainWindow *parent)
    : QMainWindow(parent), ui(new Ui::TreeWidgetMainWindow)
{
    ui->setupUi(this);
    build_ui();

    this->label_node_text = new QLabel("node title", this);
    this->label_node_text->setMinimumWidth(200);
    ui->statusbar->addWidget(this->label_node_text);

    this->spinBox_ratio = new QSpinBox(this);
    this->spinBox_ratio->setRange(0,2000);
    this->spinBox_ratio->setValue(100);
    this->spinBox_ratio->setSuffix(" %");
    this->spinBox_ratio->setReadOnly(true);
    this->spinBox_ratio->setButtonSymbols(QAbstractSpinBox::NoButtons);
    ui->statusbar->addPermanentWidget(this->spinBox_ratio);

    this->label_filename = new QLabel("filename", this);
    ui->statusbar->addPermanentWidget(this->label_filename);

    build_tree_header();
    init_tree();
}

TreeWidgetMainWindow::~TreeWidgetMainWindow()
{
    delete ui;
}

void TreeWidgetMainWindow::build_ui()
{
    this->setCentralWidget(ui->scrollArea);
}

void TreeWidgetMainWindow::build_tree_header()
{
    ui->treeWidget_files->clear();
    QTreeWidgetItem* header = new QTreeWidgetItem();
    header->setText(TreeWidgetMainWindow::colItem,      "dir and files");
    header->setText(TreeWidgetMainWindow::colItemType,  "node type");
    header->setText(TreeWidgetMainWindow::colDate,      "last modified");
    header->setTextAlignment(colItem,       Qt::AlignCenter);
    header->setTextAlignment(colItemType,   Qt::AlignCenter);
    ui->treeWidget_files->setHeaderItem(header);
}

void TreeWidgetMainWindow::init_tree()
{
    QIcon icon(":/common/pic.svg");

    if(icon.isNull()){
        qDebug()<< "open file "<< icon.name() << " failed";
    }
    QTreeWidgetItem* item = new QTreeWidgetItem(TreeWidgetMainWindow::itTopItem);
    item->setIcon(TreeWidgetMainWindow::colItem, icon);
    item->setText(TreeWidgetMainWindow::colItem, "pictures");
    item->setText(TreeWidgetMainWindow::colItemType, "Top item");
    item->setFlags(Qt::ItemIsSelectable | Qt::ItemIsUserCheckable | Qt::ItemIsEnabled | Qt::ItemIsAutoTristate);
    item->setCheckState(TreeWidgetMainWindow::colItem, Qt::Checked);
    ui->treeWidget_files->addTopLevelItem(item);
}

void TreeWidgetMainWindow::add_folder_item(QTreeWidgetItem *parent_item, QString dir_name)
{
    QIcon icon(":/common/folder.svg");
    QString node_next = get_final_folder_name(dir_name);
    QTreeWidgetItem* item = new QTreeWidgetItem(itGroupItem);
    item->setIcon(colItem, icon);
    item->setText(colItem, node_next);
    item->setText(colItemType, "group item");
    item->setFlags(Qt::ItemIsSelectable | Qt::ItemIsUserCheckable | Qt::ItemIsEnabled | Qt::ItemIsAutoTristate);
    item->setCheckState(colItem, Qt::Checked);
    item->setData(colItem, Qt::UserRole, QVariant(dir_name));
    parent_item->addChild(item);
}

QString TreeWidgetMainWindow::get_final_folder_name(const QString &full_path_name)
{
    return QFileInfo(full_path_name).fileName();
}

void TreeWidgetMainWindow::add_image_item(QTreeWidgetItem *parent_item, QString filename)
{
    QIcon icon(":/common/pic.svg");
    QFileInfo fileinfo (filename);
    QString node_text = fileinfo.fileName();
    QDateTime birth_date =  fileinfo.lastModified();

    QTreeWidgetItem* item = new QTreeWidgetItem(TreeWidgetMainWindow::itImageItem);
    item->setIcon(colItem, icon);
    item->setText(colItem, node_text);
    item->setText(colItemType, "Image Item");//第二列文字
    item->setText(colDate, birth_date.toString("yyyy-MM-dd")); //第三列文字
    item->setFlags(Qt::ItemIsSelectable | Qt::ItemIsUserCheckable                    | Qt::ItemIsEnabled | Qt::ItemIsAutoTristate);
    item->setCheckState(colItem,Qt::Checked);
    item->setData(colItem, Qt::UserRole, QVariant(filename));  //设置用户数据，存储完整文件名
    parent_item->addChild(item);   //在父节点下面添加子节点
}

void TreeWidgetMainWindow::display_image(QTreeWidgetItem *item)
{
    QString filepath = item->data(colItem, Qt::UserRole).toString();
    this->label_filename->setText(filepath);
    this->label_node_text->setText(item->text(colItem));

    if (pixmap_.load(filepath)) {
        // 将图片显示在 scrollArea 中 label 上，调整大小以适应标签并保持宽高比
        ui->label->setPixmap(pixmap_.scaled(ui->label->size(), Qt::KeepAspectRatio, Qt::SmoothTransformation));
        ui->label->setAlignment(Qt::AlignCenter);
        ui->label->setScaledContents(false); // 确保图片缩放适应显示
    } else {
        qDebug() << "Failed to load image:" << filepath;
    }

    ui->actionzoom_fit_height->setEnabled(true);
    ui->actionzoom_fit_width->setEnabled(true);
    ui->actionzoom_in->setEnabled(true);
    ui->actionzoom_out->setEnabled(true);
    ui->actionzoom_real_size->setEnabled(true);
}

void TreeWidgetMainWindow::change_item_caption(QTreeWidgetItem *item)
{
    QString str = "*" + item->text(colItem);
    item->setText(colItem, str);
    if(item->childCount() > 0){
        for(int i = 0; i< item->childCount(); i++){
            change_item_caption(item->child(i));
        }
    }
}

void TreeWidgetMainWindow::delete_item(QTreeWidgetItem *parent_item, QTreeWidgetItem *item)
{
    if(item->childCount() > 0) {
        int count = item->childCount();
        QTreeWidgetItem* temporal_item = item;
        for(int i = count -1;i>=0;i--){
            delete_item(temporal_item,temporal_item->child(i));
        }
    }
    parent_item->removeChild(item);
    delete item;
}

void TreeWidgetMainWindow::on_actionadd_folder_triggered()
{
    QString dir = QFileDialog::getExistingDirectory();
    if(dir.isEmpty()) return;
    QTreeWidgetItem* current_item = ui->treeWidget_files->currentItem();
    if(current_item == nullptr) return;
    if(current_item->type() != TreeWidgetMainWindow::itImageItem){
        add_folder_item(current_item, dir);
    }
}


void TreeWidgetMainWindow::on_actionadd_files_triggered()
{
    QStringList files = QFileDialog::getOpenFileNames(this,"choose files","","Images(*.jpg)");
    if(files.isEmpty()) return;
    QTreeWidgetItem *parent = nullptr;
    QTreeWidgetItem *item = ui->treeWidget_files->currentItem();
    if(item == nullptr){
        item = ui->treeWidget_files->topLevelItem(0);
    }
    if(item->type() == TreeWidgetMainWindow::itImageItem){
        parent = item->parent();
    }else{
        parent = item;
    }
    for(int i = 0; i < files.size(); i++){
        QString file = files.at(i);
        add_image_item(parent, file);
    }
    parent->setExpanded(true);
}


void TreeWidgetMainWindow::on_treeWidget_files_currentItemChanged(QTreeWidgetItem *current, QTreeWidgetItem *previous)
{
    qDebug("currentItemChanged() is emitted");
    if (current == nullptr)                 //当前节点为空
        return;
    if (current == previous)                //没有切换节点，只是列变化
        return;
    int var= current->type();               //节点的类型
    switch(var)     {
    case itTopItem:                        //顶层节点
        ui->actionadd_folder->setEnabled(true);
        ui->actionadd_files->setEnabled(true);
        ui->actiondelete_item->setEnabled(false);//不允许删除顶层节点
        break;
    case itGroupItem:      //分组节点
        ui->actionadd_folder->setEnabled(true);
        ui->actionadd_files->setEnabled(true);
        ui->actiondelete_item->setEnabled(true);
        break;
    case  itImageItem:      //图片节点
        ui->actionadd_folder->setEnabled(false);//图片节点下不能添加目录节点
        ui->actionadd_files->setEnabled(true);
        ui->actiondelete_item->setEnabled(true);
        display_image(current);
    }

}


void TreeWidgetMainWindow::on_actiondelete_item_triggered()
{
    QTreeWidgetItem *item= ui->treeWidget_files->currentItem();    //当前节点
    if(item == nullptr) return;
    QTreeWidgetItem *parent_item= item->parent();               //当前节点的父节点
    delete_item(parent_item, item);
}



void TreeWidgetMainWindow::on_actionscan_items_triggered()
{
    for(int i = 0;i<ui->treeWidget_files->topLevelItemCount(); i++){
        QTreeWidgetItem* item = ui->treeWidget_files->topLevelItem(i);
        change_item_caption(item);
    }
}


void TreeWidgetMainWindow::on_actiondock_float_triggered(bool checked)
{
    ui->dock_left_side->setFloating(checked);
}



void TreeWidgetMainWindow::on_actiondock_visible_triggered(bool checked)
{
    ui->dock_left_side->setVisible(checked);
}
```
## html/xml 解析
### pugixml 解析
配合 curl 库获取 html 源码实现解析豆瓣书单中所有书籍信息
```cpp
#include <curl/curl.h>
#include <fstream>
#include <iostream>
#include <pugixml.hpp>
#include <regex>
#include <string>
#include <vector>

namespace {
static size_t WriteCallback(void* contents, size_t size, size_t nmemb, std::string* userp) {
    size_t total_size = size * nmemb;
    userp->append((char*)contents, total_size);
    return total_size;
}

std::string ltrim(const std::string& s) {
    size_t start = s.find_first_not_of(" \t\n\r\f\v");
    return (start == std::string::npos) ? "" : s.substr(start);
}
std::string rtrim(const std::string& s) {
    size_t end = s.find_last_not_of(" \t\n\r\f\v");
    return (end == std::string::npos) ? "" : s.substr(0, end + 1);
}

std::string trim(const std::string& s) {
    return rtrim(ltrim(s));
}

std::vector<std::string> separate_str(const std::string& input, const std::string& separator) {
    std::vector<std::string> result;
    if (separator.empty()) {
        result.push_back(input);
        return result;
    }
    std::string::size_type start = 0;
    std::string::size_type end = input.find(separator);
    while (end != std::string::npos) {
        std::string token = input.substr(start, end - start);
        result.push_back(trim(token));
        start = end + separator.length();
        end = input.find(separator, start);
    }
    std::string token = input.substr(start);
    result.push_back(trim(token));
    return result;
}
}  // namespace

static void init_curl() {
    curl_global_init(CURL_GLOBAL_DEFAULT);
}

static void cleanup_curl() {
    curl_global_cleanup();
}

std::string get_html_content(const std::string& web_site_url) {
    CURL* curl = curl_easy_init();
    if (!curl) {
        std::cout << "curl init failed.\n";
        return "";
    }

    struct curl_slist* headers = NULL;
    headers = curl_slist_append(headers, "Referer:https://www.douban.com");
    headers = curl_slist_append(headers, "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0");

    std::string html_content;

    curl_easy_setopt(curl, CURLOPT_URL, web_site_url.c_str());
    curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, WriteCallback);
    curl_easy_setopt(curl, CURLOPT_WRITEDATA, &html_content);
    curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);

    curl_easy_setopt(curl, CURLOPT_TIMEOUT, 30L);

    if (web_site_url.substr(0, 5) == "https") {
        curl_easy_setopt(curl, CURLOPT_SSL_VERIFYPEER, 1L);
        curl_easy_setopt(curl, CURLOPT_SSL_VERIFYHOST, 1L);
    }

    CURLcode ec = curl_easy_perform(curl);
    if (ec != CURLE_OK) {
        std::cout << "curl easy perform failed: " << curl_easy_strerror(ec) << '\n';
    } else {
        std::cout << "curl perform done\n";
        std::cout << "HTML content length: " << html_content.length() << " characters\n";
    }

    curl_slist_free_all(headers);
    curl_easy_cleanup(curl);

    return html_content;
}

struct BookInfo {
    std::string book_title_, author_, description_, publisher_, published_time_;
    float rating;
    unsigned int rated_nums;
    void print() {
        std::cout << "================\n";
        std::cout << "title:" << book_title_ << "\n";
        std::cout << "author:" << author_ << "\n";
        std::cout << "description:" << description_ << "\n";
        std::cout << "publish:" << publisher_ << "\n";
        std::cout << "published time:" << published_time_ << "\n";
        std::cout << "rating:" << rating << "\n";
        std::cout << "candidate:" << rated_nums << "\n";
    }
};

class GetDoubanBookSetInfo {
   public:
    GetDoubanBookSetInfo(const std::string& url) : url_(url), page_sum_(0) {
        std::string html_content = get_html_content(url);

        this->page_sum_ = get_page_sum_from_content(html_content);
        if (this->page_sum_ == 0) {
            this->page_sum_ = 1;
        }

        pugi::xml_parse_result result = doc_.load_string(html_content.c_str(),
                                                         pugi::parse_default | pugi::parse_comments | pugi::parse_escapes | pugi::parse_wconv_attribute |
                                                             pugi::parse_eol | pugi::parse_trim_pcdata | pugi::parse_declaration | pugi::parse_doctype |
                                                             pugi::parse_pi | pugi::parse_cdata);
        if (!result) {
            std::cout << "HTML parsing failed: " << result.description() << std::endl;
        }
    }

    std::vector<BookInfo> get_serialized_data() {
        std::vector<BookInfo> books;

        for (int i = 1; i <= this->page_sum_; i++) {
            std::string current_url = this->url_;
            if (i > 1) {
                if (!current_url.ends_with("/"))
                    current_url.append(1, '/');
                current_url += "?page=" + std::to_string(i);

                std::string page_content = get_html_content(current_url);
                pugi::xml_document page_doc;
                pugi::xml_parse_result result = page_doc.load_string(page_content.c_str(),
                                                                     pugi::parse_default | pugi::parse_comments | pugi::parse_escapes | pugi::parse_wconv_attribute |
                                                                         pugi::parse_eol | pugi::parse_trim_pcdata | pugi::parse_declaration | pugi::parse_doctype |
                                                                         pugi::parse_pi | pugi::parse_cdata);
                if (!result) {
                    std::cout << "Failed to parse page " << i << std::endl;
                    continue;
                }

                extract_books_from_doc(page_doc, books);
            } else {
                extract_books_from_doc(doc_, books);
            }
        }
        return books;
    }

   private:
    void extract_books_from_doc(pugi::xml_document& doc, std::vector<BookInfo>& books) {
        std::string info_xpath = "//ul[@class='subject-list']/li/div[@class='info']";
        pugi::xpath_node_set node_set = doc.select_nodes(info_xpath.c_str());

        for (const auto& node : node_set) {
            BookInfo info;
            auto title_node = node.node().child("h2").child("a");
            auto author_pub_node = node.node().find_child([](pugi::xml_node& n) {
                return std::string(n.name()) == "div" &&
                       std::string(n.attribute("class").value()) == "pub";
            });

            auto rating_nums_node = node.node().select_node("./div[@class='star clearfix']/span[@class='rating_nums']").node();
            auto pl_node = node.node().select_node("./div[@class='star clearfix']/span[@class='pl']").node();
            auto desc_node = node.node().child("p");

            info.book_title_ = trim(title_node.text().as_string());
            const auto strs = separate_str(author_pub_node.text().as_string(), "/");
            size_t size = strs.size();
            if (size == 5) {
                info.author_ = strs[0] + "/" + strs[1];
                info.publisher_ = strs[2];
                info.published_time_ = strs[3];
            } else if (size == 4) {
                info.author_ = strs[0];
                info.publisher_ = strs[1];
                info.published_time_ = strs[2];
            } else {
                std::cerr << "Warning: invalid book info in book: " << info.book_title_ << std::endl;
                continue;
            }
            info.description_ = trim(desc_node.text().as_string());
            info.rating = rating_nums_node.text().as_float();
            std::string pl_str = trim(pl_node.text().as_string());
            size_t start = pl_str.find('(');
            size_t end = pl_str.find("人评价");
            if (start != std::string::npos && end != std::string::npos && end > start) {
                std::string num_str = pl_str.substr(start + 1, end - start - 1);
                try {
                    info.rated_nums = std::stoi(num_str);
                } catch (...) {
                    info.rated_nums = 0;
                }
            } else {
                info.rated_nums = 0;
            }
            books.emplace_back(std::move(info));
        }
    }

    size_t get_page_sum_from_content(const std::string& html_content) {
        std::regex page_pattern1(R"(/series/\d+\?page=(\d+)" > (\d +) < / a >) ");
            std::regex page_pattern2(R"(href="[^"]*page=(\d+)[^"]*">(\d+)</a>)");
        std::regex page_pattern3(R"(>(\d+)</a>\s*<span class=\"next\">)");

        std::sregex_iterator iter(html_content.begin(), html_content.end(), page_pattern2);
        std::sregex_iterator end;

        int max_page = 0;
        for (; iter != end; ++iter) {
            std::smatch match = *iter;
            if (match.size() >= 3) {
                try {
                    int page_num = std::stoi(match[2].str());
                    if (page_num > max_page)
                        max_page = page_num;
                } catch (...) {
                }
            }
        }

        if (max_page == 0) {
            size_t pos = 0;
            while ((pos = html_content.find("page=", pos)) != std::string::npos) {
                pos += 5;
                size_t start_num = pos;
                while (start_num < html_content.length() && !isdigit(html_content[start_num])) {
                    start_num++;
                }

                if (start_num < html_content.length()) {
                    size_t end_num = start_num;
                    while (end_num < html_content.length() && isdigit(html_content[end_num])) {
                        end_num++;
                    }

                    std::string num_str = html_content.substr(start_num, end_num - start_num);
                    try {
                        int page_num = std::stoi(num_str);
                        if (page_num > max_page)
                            max_page = page_num;
                    } catch (...) {
                    }
                }
            }
        }

        size_t next_pos = html_content.find("后页&gt;");
        if (next_pos != std::string::npos) {
            size_t search_start = std::max(0, (int)next_pos - 100);

            for (int i = next_pos; i > search_start && i >= 0; i--) {
                if (isdigit(html_content[i])) {
                    size_t num_start = i;
                    while (num_start > search_start && isdigit(html_content[num_start - 1])) {
                        num_start--;
                    }

                    if (num_start == 0 || !isdigit(html_content[num_start - 1])) {
                        size_t num_end = i + 1;
                        while (num_end < html_content.length() && isdigit(html_content[num_end])) {
                            num_end++;
                        }

                        std::string num_str = html_content.substr(num_start, num_end - num_start);
                        try {
                            int page_num = std::stoi(num_str);
                            if (page_num + 1 > max_page)
                                max_page = page_num + 1;
                            break;
                        } catch (...) {
                        }
                    }
                }
            }
        }

        return max_page > 0 ? max_page : 1;
    }

   private:
    std::string url_;
    size_t page_sum_;
    pugi::xml_document doc_;
};

int main() {
    init_curl();

    try {
        const std::string url = "https://book.douban.com/series/697";
        GetDoubanBookSetInfo gd(url);
        auto data = gd.get_serialized_data();
        std::cout << "Found " << data.size() << " books" << std::endl;
        for (auto& x : data) {
            x.print();
        }
    } catch (const std::exception& e) {
        std::cout << "Exception occurred: " << e.what() << std::endl;
    }

    cleanup_curl();
    return 0;
}

```
# 网络请求
## 基本网络请求
### POST 请求实现 Deepseek API 调用
#### httplib 库实现
```cpp
// httplib_version.h
#define CPPHTTPLIB_OPENSSL_SUPPORT
#include <string>
#include <utility>
#include <httplib.h>
#include <memory>
#include <nlohmann/json.hpp>

using json = nlohmann::json;

class DeepseekClient {
public:
	DeepseekClient(const std::string& key = "", const std::string& url = "https://api.deepseek.com");
	void set_proxy(const std::string proxy_host, unsigned int port);
	void set_timeout(unsigned short connection, unsigned short read, unsigned short write);
	json chat_completions_create(const json& message);

	std::string simple_chat(const std::string& user_message, const std::string& system_message = "you're a helpful assissant");
	void list_available_models();
	std::string get_api_key();

private:
	std::unique_ptr<httplib::SSLClient> client;
	std::string base_url;
	std::string api_key;
	std::string model = "deepseek-chat";
	double temperature = 0.7;
	unsigned int max_tokens = 2048;
	int connection_timeout = 30, read_timeout = 60, write_timeout = 30;
	bool stream = false;
};

std::pair<std::string, std::string> parse_url(const std::string& url);

// http_version.cpp
// deepseek_client_httplib.cpp
#define CPPHTTPLIB_OPENSSL_SUPPORT
#include <httplib.h>  // cpp-httplib库
#include <fstream>
#include <iostream>
#include <stdexcept>
#include <boost/url.hpp>

#include "httplib_version.h"

namespace urls = boost::urls;

std::pair<std::string, std::string> parse_url(const std::string& url) {
	urls::url_view uv = urls::parse_uri(url).value();
	std::string host = uv.host();
	std::string path = uv.path();
	return {host, path};
}

DeepseekClient::DeepseekClient(const std::string& key, const std::string& url)
	: base_url(url) {
	if (key.empty()) {
		api_key = get_api_key();
	} else {
		api_key = key;
	}
	auto [host, _] = parse_url(base_url);
	client = std::make_unique<httplib::SSLClient>(host);
	client->set_connection_timeout(this->connection_timeout);
	client->set_read_timeout(this->read_timeout);
	client->set_write_timeout(this->write_timeout);
}

void DeepseekClient::set_proxy(const std::string proxy_host, unsigned int port) {
	client->set_proxy(proxy_host, port);
}

void DeepseekClient::set_timeout(unsigned short connection, unsigned short read, unsigned short write) {
	this->client->set_connection_timeout(connection);
	this->client->set_read_timeout(read);
	this->client->set_write_timeout(write);
}

json DeepseekClient::chat_completions_create(const json& message) {
	json request_body = {
			{"model", this->model},
			{"messages", message},
			{"stream", this->stream},
			{"temperature", this->temperature},
			{"max_tokens", this->max_tokens}};
	auto [_, base_path] = parse_url(base_url);
	if (base_path.empty()) {
		base_path.append("/");
	}
	std::string path = base_path + (base_path.back() == '/' ? "" : "/") + "chat/completions";
	httplib::Headers headers = {{"Authorization", "Bearer " + api_key},
								{"Content-Type", "application/json"},
								{"Accept", "application/json"},
								{"User-Agent", "sDeepSeek-CPP-Client/1.0"}};
	auto response = client->Post(path, headers, request_body.dump(), "application/json"); // have not use path.c_str()
	if (!response) {
		throw std::runtime_error("request failed, no response");
	}
	if (response->status != 200) {
		std::string api_error_message = "API Error: " + std::to_string(response->status);
		if (response->body.empty()) {
			try {
				auto error_json = json::parse(response->body);
				if (error_json.contains("error") && error_json["error"].is_object()) {
					auto error_obj = error_json["error"];
					if (error_obj.contains("message") && error_obj["message"].is_string()) {
						api_error_message += " - " + error_obj["message"].get<std::string>();
					}
				}
			}
			catch (...) {
				api_error_message += response->body;
			}
		}
		throw std::runtime_error(api_error_message);
	}
	try {
		return json::parse(response->body);
	}
	catch (const json::parse_error& e) {
		throw std::runtime_error("Failed to parse JSON response: " + std::string(e.what()) + "\nRaw response: " + response->body);
	}
}


std::string DeepseekClient::simple_chat(const std::string& user_message, const std::string& system_message) {
	if (user_message.empty()) throw std::runtime_error("you have to input user message");
	json message = {
		{
			{"role", "system"},
			{"content", system_message}
		},
		{
			{"role", "user"},
			{"content", user_message}
		}
	};
	auto response = chat_completions_create(message);
	if (response.contains("choices") &&
		response["choices"].is_array() &&
		!response["choices"].empty() &&
		response["choices"][0].contains("message") &&
		response["choices"][0]["message"].contains("content")) {
		return response["choices"][0]["message"]["content"].get<std::string>();
	} else {
		throw std::runtime_error("Invalid response format: " + response.dump());
	}
}

void DeepseekClient::list_available_models() {
	auto [_, base_path] = parse_url(base_url);
	if (base_path.empty()) {
		base_path.append("/");
	}
	std::string path = base_path + (base_path.back() == '/' ? "" : "/") + "models";

	httplib::Headers headers = {
		{"Authorization", "Bearer " + api_key},
		{"Accept", "application/json"}};

	auto response = client->Get(path.c_str(), headers);
	if (!response) {
		throw std::runtime_error("Request failed: No response received");
	}
	if (response->status != 200) {
		throw std::runtime_error("API Error: " + std::to_string(response->status) + " - " + response->body);
	}
	try {
		json models_json = json::parse(response->body);
		if (models_json.contains("data") && models_json["data"].is_array()) {
			std::cout << "available models:\n";
			for (const auto& model : models_json["data"]) {
				if (model.contains("id") && model["id"].is_string()) {
					std::cout << "- " << model["id"].get<std::string>() << '\n';
				}
			}
		}
	}
	catch (const json::parse_error& e) {
		throw std::runtime_error("Failed to parse JSON response: " + std::string(e.what()));
	}
}

std::string DeepseekClient::get_api_key() {
	std::string api_key = std::getenv("DEEPSEEK_API_KEY");
	if (api_key.empty()) {
		std::fstream file("api_key.txt");
		std::getline(file, api_key);
		if (api_key.empty()) {
			throw std::runtime_error("have no way to get api_key");
		}
	}
	return api_key;
}

```
#### boost 库实现
```cpp
// boost_version.h
#pragma once
#include <boost/asio.hpp>
#include <boost/beast.hpp>
#include <boost/beast/ssl.hpp>
#include <nlohmann/json.hpp>
#include <boost/asio/ip/tcp.hpp>
#include <memory>
#include <string>

namespace asio = boost::asio;
namespace beast = boost::beast;
namespace ssl = boost::asio::ssl;
namespace http = beast::http;
using json = nlohmann::json;
using tcp = boost::asio::ip::tcp;

class DeepseekClient {
public:
    DeepseekClient(const std::string& api = "", const std::string& url = "https://api.deepseek.com");
    std::pair<std::string, std::string> parse_url(const std::string& url);
    http::request<http::string_body> create_request(const std::string& host, const std::string& path, const std::string& method, const std::string& body = "");
    std::string send_request(const http::request<http::string_body>& req);
    json chat_completions_create(const json& message, const std::string& model_id = "deepseek-chat", bool stream = false, double temperature = 0.7);
    std::string simple_chat(const std::string& user_message, const std::string& system_message = "you're a helpful assistant");

private:
    asio::io_context ioc;
    ssl::context ctx{ssl::context::tlsv12_client};
    std::unique_ptr<ssl::stream<tcp::socket>> stream;
    std::string api_key, base_url;
};

// boost_version.cpp
#include "boost_version.h"
#include <boost/asio/ssl/verify_mode.hpp>
#include <boost/url.hpp>
#include <boost/url/url_view.hpp>
#include <fstream>

namespace urls = boost::urls;

std::string get_api_key();

DeepseekClient::DeepseekClient(const std::string& api, const std::string& url)
	: base_url(url) {
	if (api.empty()) {
		api_key = get_api_key();
	}
	ctx.set_verify_mode(ssl::verify_none);
}

std::pair<std::string, std::string> DeepseekClient::parse_url(const std::string& url) {
	std::string host, path;
	urls::url_view uv = urls::parse_uri(url).value();
	host = uv.host();
	path = uv.path();
	return {host, path};
}

http::request<http::string_body> DeepseekClient::create_request(const std::string& host, const std::string& path, const std::string& method, const std::string& body) {
	http::request<http::string_body> req{http::verb::post, path, 11};
	req.set(http::field::host, host);
	req.set(http::field::user_agent, "DeepSeek-CPP-Client/1.0");
	req.set(http::field::content_type, "application/json");
	req.set(http::field::authorization, "Bearer " + api_key);
	req.set(http::field::accept, "application/json");

	if (!body.empty()) {
		req.body() = body;
		req.prepare_payload();
	}
	return req;
}

std::string DeepseekClient::send_request(const http::request<http::string_body>& req) {
	auto [host, path] = parse_url(base_url);
	tcp::resolver resolver(ioc);
	auto results = resolver.resolve(host, "443");
	this->stream = std::make_unique<ssl::stream<tcp::socket>>(ioc, ctx);

	// validate sni field
	if (!SSL_set_tlsext_host_name(stream->native_handle(), host.c_str())) {
		beast::error_code ec{static_cast<int>(::ERR_get_error()), asio::error::get_ssl_category()};
		throw beast::system_error(ec);
	}
	asio::connect(beast::get_lowest_layer(*stream), results);
	stream->handshake(ssl::stream_base::client);
	http::write(*stream, req);
	beast::flat_buffer buffer;
	http::response<http::dynamic_body> res;
	http::read(*stream, buffer, res);

	beast::error_code ec;
	stream->shutdown(ec);

	if (ec == asio::error::eof || ec == ssl::error::stream_truncated)  ec = {};
	if (ec) throw beast::system_error(ec);

	std::string response_body = beast::buffers_to_string(res.body().data());

	if (res.result() != http::status::ok) {
		throw std::runtime_error("HTTP error: " + std::to_string(static_cast<int>(res.result())) +
			", response: " + response_body);
	}

	return response_body;
}

json DeepseekClient::chat_completions_create(const json& message, const std::string& model_id, bool stream, double temperature) {
	json request_body = {
			{"model", model_id},
			{"messages", message},
			{"stream", stream},
			{"temperature", temperature}
	};

	auto [host, path] = parse_url(base_url);
	path += "/chat/completions";

	const auto req = create_request(host, path, "POST", request_body.dump());
	const auto response_body = send_request(req);
	try {
		return json::parse(response_body);
	}
	catch (const json::parse_error& e) {
		throw std::runtime_error("Failed to parse json response: " + std::string(e.what()) + "\nraw response: " + response_body);
	}
}

std::string DeepseekClient::simple_chat(const std::string& user_message, const std::string& system_message) {
	json messages = {
		{{"role", "system"}, {"content", system_message}},
		{{"role", "user"}, {"content", user_message}}
	};
	const auto response = chat_completions_create(messages);

	if (response.contains("choices") && response["choices"].is_array() && !response["choices"].empty()) {
		const auto& choice = response["choices"][0];
		if (choice.contains("message") && choice["message"].contains("content")) {
			return choice["message"]["content"];
		}
	}

	throw std::runtime_error("Invalid response format: " + response.dump());
}

std::string get_api_key() {
	std::string api_key = std::getenv("DEEPSEEK_API_KEY");
	if (api_key.empty()) {
		std::ifstream file("api_key.txt");
		std::getline(file, api_key);
		if (api_key.empty()) throw std::runtime_error("failed to get api key");
	}
	return api_key;
}
```
### GET 请求将文本转二维码 base 64 编码信息
#### httplib 库实现
```cpp
// API.h
#pragma once
#define CPPHTTPLIB_OPENSSL_SUPPORT
#include <memory>
#include <httplib.h>
#include <boost/url.hpp>
#include <nlohmann/json.hpp>
#include <string>
#include <string_view>

namespace urls = boost::urls;
using json = nlohmann::json;


class API {
public:
	API(const std::string url);
	void make_request();
	json send_request(const std::string& user_message);
	std::string get_needs_from_response(const json& response);
	void set_timeout(httplib::SSLClient& cnt, unsigned int connection = 30, unsigned int read = 80, unsigned int write = 30);

private:
	std::unique_ptr<httplib::SSLClient> client;
	std::string host;
	std::string path;
	std::string method;

	void parse_url(const std::string& url);
};

// API.cpp
#include "API.h"
#include <iostream>
#include <fstream>
#include <vector>

API::API(const std::string api_url) {
	parse_url(api_url);
	client = std::make_unique<httplib::SSLClient>(host);
	set_timeout(*client);
}

void API::make_request() {
}

void API::parse_url(const std::string& url) {
	urls::url_view uv = urls::parse_uri(url).value();
	this->host = uv.host();
	this->path = uv.path();
}

void API::set_timeout(httplib::SSLClient& cnt, unsigned int connection, unsigned int read, unsigned int write) {
	cnt.set_connection_timeout(connection);
	cnt.set_read_timeout(read);
	cnt.set_write_timeout(write);
}

json API::send_request(const std::string& user_message) {
	httplib::Headers headers = {
		//{"Host", "uapi.cn"},
		//{"Content-Type", "application/json"}
	};
	httplib::Params params;
	params.emplace("text", user_message);
	params.emplace("size", "256");
	params.emplace("format", "json");
	const auto response = client->Get(path, params, headers);
	int status = response->status;
	if (status == httplib::StatusCode::OK_200) {
		json parsed_content = json::parse(response->body);
		std::cout << "response: " + response->body;
		return parsed_content;
	} else {
		const std::string error_msg = std::string("status: ") + httplib::status_message(status);
		throw std::runtime_error(error_msg);
	}
}

std::string API::get_needs_from_response(const json& response) {
	return response.at("qrcode_base64").get<std::string>();
}
```
### Http 客户端和服务端通信
#### client.h
```cpp
class HttpClient {

  public:
	HttpClient(asio::io_context& ctx);
	bool connect(const std::string& host, const std::string& port);
	http::response<http::string_body>
		 send_request(http::verb verb, const std::string& target, const std::string& body = "");
	void close();

  private:
	tcp::resolver	  resolver_;
	beast::tcp_stream stream_;
	beast::error_code ec_;
};
```
client.cpp
```cpp
#include <iostream>
#include "client.h"

HttpClient::HttpClient(asio::io_context& ctx)
	: resolver_(ctx)
	, stream_(ctx) {}

bool HttpClient::connect(const std::string& host, const std::string& port) {
	try{
		const auto result = resolver_.resolve(host, port);
		beast::get_lowest_layer(stream_).connect(result);
	}catch(const std::exception& e){
		std::cout << "connection failed: " << e.what() << '\n';
		return false;
	}
	return true;
}

http::response<http::string_body>
HttpClient::send_request(http::verb verb, const std::string& target, const std::string& body) {
	http::request<http::string_body> req;
	req.version(11);
	req.target(target);
	req.method(verb);
	req.set(http::field::host, "127.0.0.1");
	req.set(http::field::user_agent, "HttpClient/1.0");
	req.set(http::field::content_type, "text/plain");
	if(!body.empty()){
		req.body() = body;
		req.prepare_payload();
	}

	// sendout request
	ec_.clear();
	http::write(stream_, req, ec_);
	if(ec_){
		std::cout << "write error: " << ec_.message() << '\n';
		return http::response<http::string_body>();
	}

	// make callback to process response
	ec_.clear();
	beast::flat_buffer buffer;
	http::response<http::string_body> res;
	http::read(stream_, buffer, res, ec_);
	if(ec_){
		std::cout << "Read error: " << ec_.message() << std::endl;
		return http::response<http::string_body>();
	}
	return res;
}

void HttpClient::close() {
	ec_.clear();
	stream_.close();
}

```
#### server.h
```cpp
class HttpServer {
  public:
	  HttpServer(asio::io_context &ctx, const tcp::endpoint &endpoint);
	  void init_routers();
	  void run();

  private:
	  void do_accept();
	  asio::io_context& ctx_;
	  tcp::acceptor acceptor_;
	  std::unordered_map<std::string, // key->http target
						 std::function<void(const http::request<http::string_body> &,
											http::response<http::string_body> &)> // value->router handler
						 >
		  route_handlers_;

	  friend HttpSession;
};
```
#### session.h
```cpp
// 前向声明
class HttpServer;

class HttpSession : public std::enable_shared_from_this<HttpSession> {
  public:
	explicit HttpSession(tcp::socket socket, HttpServer* server_ptr);
	void run();

  private:
	void							  do_read();
	void							  handle_request();
	void							  do_write();
	tcp::socket						  socket_;
	beast::flat_buffer				  buffer_;
	http::request<http::string_body>  request_;
	http::response<http::string_body> response_;
	HttpServer*		  server_ptr_;

	friend HttpServer;
};

```
#### client.cpp
```cpp
#include <iostream>
#include "client.h"

HttpClient::HttpClient(asio::io_context& ctx)
	: resolver_(ctx)
	, stream_(ctx) {}

bool HttpClient::connect(const std::string& host, const std::string& port) {
	try{
		const auto result = resolver_.resolve(host, port);
		beast::get_lowest_layer(stream_).connect(result);
	}catch(const std::exception& e){
		std::cout << "connection failed: " << e.what() << '\n';
		return false;
	}
	return true;
}

http::response<http::string_body>
HttpClient::send_request(http::verb verb, const std::string& target, const std::string& body) {
	http::request<http::string_body> req;
	req.version(11);
	req.target(target);
	req.method(verb);
	req.set(http::field::host, "127.0.0.1");
	req.set(http::field::user_agent, "HttpClient/1.0");
	req.set(http::field::content_type, "text/plain");
	if(!body.empty()){
		req.body() = body;
		req.prepare_payload();
	}

	// sendout request
	ec_.clear();
	http::write(stream_, req, ec_);
	if(ec_){
		std::cout << "write error: " << ec_.message() << '\n';
		return http::response<http::string_body>();
	}

	// make callback to process response
	ec_.clear();
	beast::flat_buffer buffer;
	http::response<http::string_body> res;
	http::read(stream_, buffer, res, ec_);
	if(ec_){
		std::cout << "Read error: " << ec_.message() << std::endl;
		return http::response<http::string_body>();
	}
	return res;
}

void HttpClient::close() {
	ec_.clear();
	stream_.close();
}

```
#### server.cpp
```cpp
#include "server.h"
#include "session.h"

HttpServer::HttpServer(asio::io_context& ctx, const tcp::endpoint& endpoint)
	: ctx_(ctx)
	, acceptor_(ctx) {
	acceptor_.open(endpoint.protocol());
	acceptor_.set_option(net::socket_base::reuse_address(true));
	acceptor_.bind(endpoint);
	acceptor_.listen(asio::socket_base::max_listen_connections);
	init_routers();
}

void HttpServer::init_routers() {
	// GET handler
	route_handlers_["GET"] = [](const http::request<http::string_body>& req,
								http::response<http::string_body>&		res) {
		std::cout << "[GET REQUEST] Received GET request to: " << req.target() << std::endl;
		std::cout << "[GET REQUEST] Headers: " << req.base() << std::endl;

		res.result(http::status::ok);
		res.set(http::field::content_type, "text/plain");
		res.body() = "This is a GET request handler. Hello from GET!";
	};

	// POST handler
	route_handlers_["POST"] = [](const http::request<http::string_body>& req,
								 http::response<http::string_body>&		 res) {
		std::cout << "[POST REQUEST] Received POST request to: " << req.target() << std::endl;
		std::cout << "[POST REQUEST] Body: " << req.body() << std::endl;
		std::cout << "[POST REQUEST] Headers: " << req.base() << std::endl;

		res.result(http::status::ok);
		res.set(http::field::content_type, "text/plain");
		res.body() = "This is a POST request handler. Received data: " + req.body();
	};

	// DELETE handler
	route_handlers_["DELETE"] = [](const http::request<http::string_body>& req,
								   http::response<http::string_body>&	   res) {
		std::cout << "[DELETE REQUEST] Received DELETE request to: " << req.target() << std::endl;
		std::cout << "[DELETE REQUEST] Headers: " << req.base() << std::endl;

		res.result(http::status::ok);
		res.set(http::field::content_type, "text/plain");
		res.body() = "This is a DELETE request handler. Resource deleted successfully!";
	};
}

void HttpServer::run() { do_accept(); }

void HttpServer::do_accept() {
	acceptor_.async_accept([this](beast::error_code ec, tcp::socket socket) -> void {
		if(!ec) {
			std::make_shared<HttpSession>(std::move(socket), this)->run();
		}
		do_accept();
	});
}
```
#### session.cpp
```cpp
#include "server.h"
#include "session.h"

HttpServer::HttpServer(asio::io_context& ctx, const tcp::endpoint& endpoint)
	: ctx_(ctx)
	, acceptor_(ctx) {
	acceptor_.open(endpoint.protocol());
	acceptor_.set_option(net::socket_base::reuse_address(true));
	acceptor_.bind(endpoint);
	acceptor_.listen(asio::socket_base::max_listen_connections);
	init_routers();
}

void HttpServer::init_routers() {
	// GET handler
	route_handlers_["GET"] = [](const http::request<http::string_body>& req,
								http::response<http::string_body>&		res) {
		std::cout << "[GET REQUEST] Received GET request to: " << req.target() << std::endl;
		std::cout << "[GET REQUEST] Headers: " << req.base() << std::endl;

		res.result(http::status::ok);
		res.set(http::field::content_type, "text/plain");
		res.body() = "This is a GET request handler. Hello from GET!";
	};

	// POST handler
	route_handlers_["POST"] = [](const http::request<http::string_body>& req,
								 http::response<http::string_body>&		 res) {
		std::cout << "[POST REQUEST] Received POST request to: " << req.target() << std::endl;
		std::cout << "[POST REQUEST] Body: " << req.body() << std::endl;
		std::cout << "[POST REQUEST] Headers: " << req.base() << std::endl;

		res.result(http::status::ok);
		res.set(http::field::content_type, "text/plain");
		res.body() = "This is a POST request handler. Received data: " + req.body();
	};

	// DELETE handler
	route_handlers_["DELETE"] = [](const http::request<http::string_body>& req,
								   http::response<http::string_body>&	   res) {
		std::cout << "[DELETE REQUEST] Received DELETE request to: " << req.target() << std::endl;
		std::cout << "[DELETE REQUEST] Headers: " << req.base() << std::endl;

		res.result(http::status::ok);
		res.set(http::field::content_type, "text/plain");
		res.body() = "This is a DELETE request handler. Resource deleted successfully!";
	};
}

void HttpServer::run() { do_accept(); }

void HttpServer::do_accept() {
	acceptor_.async_accept([this](beast::error_code ec, tcp::socket socket) -> void {
		if(!ec) {
			std::make_shared<HttpSession>(std::move(socket), this)->run();
		}
		do_accept();
	});
}

```
#### client_main.cpp
```cpp
#include "client.h"
#include <iostream>

int main(){
	try {
		asio::io_context ioc;

		std::cout << "Creating HTTP client..." << std::endl;
		HttpClient client(ioc);

		// Connect to server on port 3599
		std::string host = "127.0.0.1";
		std::string port = "3599";

		std::cout << "Connecting to " << host << ":" << port << std::endl;

		// Connect to server
		if(!client.connect(host, port)) {
			std::cout << "Failed to connect to server" << std::endl;
			return 1;
		}

		std::cout << "Connected successfully!" << std::endl;

		// Send GET request
		std::cout << "\nSending GET request..." << std::endl;
		auto get_res = client.send_request(http::verb::get, "/");
		std::cout << "GET Response: " << get_res.result_int() << " " << get_res.body() << std::endl;

		// Send POST request with data
		std::cout << "\nSending POST request..." << std::endl;
		auto post_res = client.send_request(http::verb::post, "/", "Hello from POST request!");
		std::cout << "POST Response: " << post_res.result_int() << " " << post_res.body() << std::endl;

		// Send DELETE request
		std::cout << "\nSending DELETE request..." << std::endl;
		auto delete_res = client.send_request(http::verb::delete_, "/");
		std::cout << "DELETE Response: " << delete_res.result_int() << " " << delete_res.body() << std::endl;

		// Send unsupported method to test error handling
		std::cout << "\nSending PUT request (should be unsupported)..." << std::endl;
		auto put_res = client.send_request(http::verb::put, "/");
		std::cout << "PUT Response: " << put_res.result_int() << " " << put_res.body() << std::endl;

		client.close();
		std::cout << "\nClient finished." << std::endl;

	} catch(std::exception const& e) {
		std::cerr << "Error: " << e.what() << std::endl;
		return 1;
	}

	return 0;
}
```
#### server_main.cpp
```cpp
#include <server.h>

int main() {
	try {
		// Set up io_context
		asio::io_context ioc;

		// Listen on port 3599
		tcp::endpoint endpoint(asio::ip::make_address("0.0.0.0"), 3599);

		std::cout << "Starting HTTP server on port 3599..." << std::endl;
		std::cout << "Available endpoints:" << std::endl;
		std::cout << "  GET    http://localhost:3599/" << std::endl;
		std::cout << "  POST   http://localhost:3599/ (with data)" << std::endl;
		std::cout << "  DELETE http://localhost:3599/" << std::endl;

		HttpServer server(ioc, endpoint);

		server.run();

		// Run the I/O service
		ioc.run();

	} catch(std::exception const& e) {
		std::cerr << "Error: " << e.what() << std::endl;
		return 1;
	}

	return 0;
}
```
# 手撕代码系列
## 智能指针
```cpp
template<typename T>
struct ControlBlock {
    T*                ptr;
    std::atomic<int>  strong_count;
    std::atomic<int>  weak_count;  // 控制块自身也算一个 weak 引用

    ControlBlock(T* p)
        : ptr(p), strong_count(1), weak_count(1) {}

    void add_strong() { strong_count.fetch_add(1, std::memory_order_relaxed); }

    void add_weak() { weak_count.fetch_add(1, std::memory_order_relaxed); }

    // 释放强引用：strong 归零时销毁对象，然后释放弱引用
    void release_strong() {
        if (strong_count.fetch_sub(1, std::memory_order_acq_rel) == 1) {
            delete ptr;                          // 销毁对象
            release_weak();                      // 释放控制块自身的 weak 引用
        }
    }

    // 释放弱引用：weak 归零时销毁控制块
    void release_weak() {
        if (weak_count.fetch_sub(1, std::memory_order_acq_rel) == 1) {
            delete this;                         // 销毁控制块
        }
    }
};

template<typename T>
class WeakPtr;

template<typename T>
class SharedPtr {
    template<typename U>
    friend class WeakPtr;

    ControlBlock<T>* ctrl_ = nullptr;

public:
    SharedPtr() = default;
    explicit SharedPtr(T* raw) : ctrl_(raw ? new ControlBlock<T>(raw) : nullptr) {}

    SharedPtr(const SharedPtr& other) : ctrl_(other.ctrl_) {
        if (ctrl_) ctrl_->add_strong();
    }

    SharedPtr& operator=(const SharedPtr& other) {
        if (this != &other) {
            if (ctrl_) ctrl_->release_strong();
            ctrl_ = other.ctrl_;
            if (ctrl_) ctrl_->add_strong();
        }
        return *this;
    }

    SharedPtr(SharedPtr&& other) noexcept : ctrl_(other.ctrl_) {
        other.ctrl_ = nullptr;
    }

    SharedPtr& operator=(SharedPtr&& other) noexcept {
        if (this != &other) {
            if (ctrl_) ctrl_->release_strong();
            ctrl_ = other.ctrl_;
            other.ctrl_ = nullptr;
        }
        return *this;
    }

    ~SharedPtr() {
        if (ctrl_) ctrl_->release_strong();
    }

    T& operator*()  const noexcept { return *ctrl_->ptr; }
    T* operator->() const noexcept { return  ctrl_->ptr; }
    T* get()        const noexcept { return ctrl_ ? ctrl_->ptr : nullptr; }
    int use_count() const noexcept { return ctrl_ ? ctrl_->strong_count.load() : 0; }
    explicit operator bool() const noexcept { return ctrl_ != nullptr; }

    void reset(T* raw = nullptr) {
        if (ctrl_) ctrl_->release_strong();
        ctrl_ = raw ? new ControlBlock<T>(raw) : nullptr;
    }

    void swap(SharedPtr& other) noexcept { std::swap(ctrl_, other.ctrl_); }
};

// ============================================================================
// WeakPtr
// ============================================================================
template<typename T>
class WeakPtr {
    template<typename U>
    friend class SharedPtr;

    ControlBlock<T>* ctrl_ = nullptr;

public:
    WeakPtr() = default;

    WeakPtr(const SharedPtr<T>& sp) : ctrl_(sp.ctrl_) {
        if (ctrl_) ctrl_->add_weak();
    }

    WeakPtr(const WeakPtr& other) : ctrl_(other.ctrl_) {
        if (ctrl_) ctrl_->add_weak();
    }

    WeakPtr(WeakPtr&& other) noexcept : ctrl_(other.ctrl_) {
        other.ctrl_ = nullptr;
    }

    WeakPtr& operator=(const WeakPtr& other) {
        if (this != &other) {
            if (ctrl_) ctrl_->release_weak();
            ctrl_ = other.ctrl_;
            if (ctrl_) ctrl_->add_weak();
        }
        return *this;
    }

    WeakPtr& operator=(const SharedPtr<T>& sp) {
        if (ctrl_) ctrl_->release_weak();
        ctrl_ = sp.ctrl_;
        if (ctrl_) ctrl_->add_weak();
        return *this;
    }

    WeakPtr& operator=(WeakPtr&& other) noexcept {
        if (this != &other) {
            if (ctrl_) ctrl_->release_weak();
            ctrl_ = other.ctrl_;
            other.ctrl_ = nullptr;
        }
        return *this;
    }

    ~WeakPtr() {
        if (ctrl_) ctrl_->release_weak();
    }

    // lock: 原子检查强引用是否 > 0，是则增加并返回 SharedPtr
    SharedPtr<T> lock() const {
        SharedPtr<T> result;
        if (!ctrl_) return result;
        // CAS 循环：只有当 strong_count > 0 时才增加
        int old = ctrl_->strong_count.load(std::memory_order_relaxed);
        while (old > 0) {
            if (ctrl_->strong_count.compare_exchange_weak(
                    old, old + 1,
                    std::memory_order_acquire,
                    std::memory_order_relaxed)) {
                result.ctrl_ = ctrl_;
                return result;
            }
        }
        return result;  // 对象已销毁，返回空
    }

    bool expired() const noexcept {
        return !ctrl_ || ctrl_->strong_count.load(std::memory_order_acquire) == 0;
    }

    int use_count() const noexcept {
        return ctrl_ ? ctrl_->strong_count.load(std::memory_order_relaxed) : 0;
    }

    void swap(WeakPtr& other) noexcept { std::swap(ctrl_, other.ctrl_); }
};

// ============================================================================
// 面试手撕版 UniquePtr
// ============================================================================
template<typename T, typename Deleter = std::default_delete<T>>
class UniquePtr {
    T*      ptr_    = nullptr;
    Deleter deleter_;

public:
    UniquePtr() noexcept = default;
    explicit UniquePtr(T* raw) noexcept : ptr_(raw) {}

    UniquePtr(const UniquePtr&) = delete;
    UniquePtr& operator=(const UniquePtr&) = delete;

    UniquePtr(UniquePtr&& other) noexcept : ptr_(other.ptr_) {
        other.ptr_ = nullptr;
    }

    UniquePtr& operator=(UniquePtr&& other) noexcept {
        if (this != &other) {
            reset();
            ptr_       = other.ptr_;
            other.ptr_ = nullptr;
        }
        return *this;
    }

    ~UniquePtr() { reset(); }

    T& operator*()  const noexcept { return *ptr_; }
    T* operator->() const noexcept { return  ptr_; }
    T* get()        const noexcept { return  ptr_; }
    explicit operator bool() const noexcept { return ptr_ != nullptr; }

    T* release() noexcept {
        T* tmp = ptr_;
        ptr_   = nullptr;
        return tmp;
    }

    void reset(T* new_ptr = nullptr) noexcept {
        T* old = ptr_;
        ptr_   = new_ptr;
        if (old) deleter_(old);
    }

    void swap(UniquePtr& other) noexcept { std::swap(ptr_, other.ptr_); }
};

// ============================================================================
// 辅助函数
// ============================================================================
template<typename T, typename... Args>
SharedPtr<T> make_shared(Args&&... args) {
    return SharedPtr<T>(new T(std::forward<Args>(args)...));
}

template<typename T, typename... Args>
UniquePtr<T> make_unique(Args&&... args) {
    return UniquePtr<T>(new T(std::forward<Args>(args)...));
}

```