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

## 读写二进制文件
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

## 发送邮件程序
### python 版本
[[Python#发送邮件脚本]]，分[[Python#发送邮件脚本#简易硬编码参数版本|硬编码]] 和[[Python#发送邮件脚本#命令行解析参数版本|参数解析]]版本
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
     * @note 建议主函数开头使用curl_global_init(CURL_GLOBAL_DEFAULT)，发送完邮件之后使用curl_global_cleanup()，释放资源，不建议纳入send_email函数中，否则建立连接和释放连接开销较大
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
    InputValidator& not_emtpy(const std::string& error_msg = "Input cannot be empty.");
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
        iterator operator++(int) {  // 后置自增，可选，因为迭代使用前置
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
hiredis 是纯 C 库，没有 redis api 支持但使用简单，可以直接写原生的 redis 命令，但是由于 C 语言没有对象，返回值需要手动封装 `redisReply* reply = (redisReply*)redisCommand(context, "GET key");`，redisCommand 函数返回类型为 `void*`
boost. redis 是 C++库，但没有 redis api 支持，redis 命令需要用多个字符串保存一条命令中的参数，比如 `set mykey value` 命令要写成 `res.push("set","mykey", "value")` 要麻烦一点，但是和 co_await，asio 配合密切，能直接使用异步和协程。
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

<<<<<<< HEAD
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
=======
```
>>>>>>> 035b40efc510dbdf75916601d2cebe96f9b7e536
