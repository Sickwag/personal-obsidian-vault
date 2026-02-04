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
{ // 定义每一个联系人信息
    string m_Name;
    int m_Sex;
    int m_Age;
    string m_Phone;
    string m_Addr;
};
struct Addressbooks
{
    struct Person personArray[MAX];
    int m_Size;
};
// add person function

void ChangeorModifyInfo(Addressbooks *abs,int sequence){
    // name
    string name;
    cout << "please input the name : ";
    cin >> name;
    abs->personArray[abs->m_Size].m_Name = name;
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
            abs->personArray[abs->m_Size].m_Sex = sex;
            break;
        }
        cout << "please input number 1 or 2\n";
    }

    // age
    int age = 0;
    cout << "input the age :\n";
    cin >> age;
    abs->personArray[abs->m_Size].m_Age = age;
    // phone
    int phone = 0;
    cout << "input the phone number :\n";
    cin >> phone;
    abs->personArray[abs->m_Size].m_Phone = phone;
    // addre
    string address;
    cout << "input the address :\n";
    cin >> address;
    abs->personArray[abs->m_Size].m_Addr = address;
    // update the m_size
    cout << "you have add a new contact ";
    abs->m_Size++;
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
        // name
        string name;
        cout << "please input the name : ";
        cin >> name;
        abs->personArray[abs->m_Size].m_Name = name;
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
                abs->personArray[abs->m_Size].m_Sex = sex;
                break;
            }
            cout << "please input number 1 or 2\n";
        }

        // age
        int age = 0;
        cout << "input the age :\n";
        cin >> age;
        abs->personArray[abs->m_Size].m_Age = age;
        // phone
        int phone = 0;
        cout << "input the phone number :\n";
        cin >> phone;
        abs->personArray[abs->m_Size].m_Phone = phone;
        // addre
        string address;
        cout << "input the address :\n";
        cin >> address;
        abs->personArray[abs->m_Size].m_Addr = address;
        // update the m_size
        cout << "you have add a new contact ";
        abs->m_Size++;
        std::system("cls");
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
            break;
        case 6:
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