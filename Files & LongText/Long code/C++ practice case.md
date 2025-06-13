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

### C++ Prime Plus 
#### 第五章编程练习题
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

### 读写二进制文件
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