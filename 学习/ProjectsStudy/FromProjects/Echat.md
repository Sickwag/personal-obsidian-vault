---
created: 2025年12月19日21:45:45
repo: https://github.com/windy66666/m_project/tree/main
---
# Client 端
## 具体文件
### addfriend 模块
包含 `addfriend.h` 和 `addfriend.cpp`
#### `time_t` 类型使用
1. **如果 `time_t` 的值在 `int` 的范围内**：
    - 转换会**直接保留数值**，结果正确。
    - 例如：`time_t = 1609459200`（2021-01-01 00:00:00 UTC） → 转换为 `int` 后仍是 `1609459200`，从表示 Unix 纪元（1970年1月1日 00:00:00 UTC）开始经过的秒数
2. **如果 `time_t` 的值超出 `int` 的范围**：
    - **发生整数溢出**，结果未定义（UB），且数值被截断为 `int` 的最大/最小值。
    - 允许使用 longlong 等更大的结构存储
3. 标准库函数 `time(nullptr)` 或者 `time(NULL)` 返回当前时间距离 Unix 纪元的秒数
#### 创建圆角头像
首先绘制圆角头像
```cpp
QPixmap Business::getRoundedPixmap(const QPixmap& src, int radius)
{
    if (src.isNull()) {
        return QPixmap();
    }

    QPixmap result(src.size());
    result.fill(Qt::transparent);

    QPainter painter(&result);
    painter.setRenderHint(QPainter::Antialiasing, true);
    painter.setRenderHint(QPainter::SmoothPixmapTransform, true);

    // 创建圆角路径
    QRect rect = QRect(0, 0, src.width(), src.height());
    QPainterPath path;
    path.addRoundedRect(rect, radius, radius);

    // 设置裁剪区域
    painter.setClipPath(path);
    painter.drawPixmap(rect, src);

    return result;
}
```
`Qt::SmoothTransformation` 是一个优化标志，它启用**高质量的图像缩放算法**：
- **双线性插值**：在缩放时使用周围像素的加权平均值，使缩放后的图像更加平滑
- **抗锯齿效果**：减少缩放后图像的锯齿状边缘
- **更好的视觉效果**：特别是当图像缩放比例较大时，能保持较好的清晰度
设置圆角图片的步骤：
- 绘制符合头像 UI 控件大小的矩形 `QRect rect(0, 0, src.width(), src.height())`
- 对 pixmap 设置透明背景
- 在这个矩形上绘制圆角路径 `path.addRoundRect(rect, radius, radius)`
- 设置剪裁区域和**使用画笔**在剪裁区域绘制 pixmap
#### 访问图像方式
qt 中有两种方式 QImage 和 QPixmap，
QPixmap（像素图）
- 用途：主要用于显示和绘制，返回一些基本图片信息
- 存储格式：内部使用优化的显示格式（通常是硬件加速格式）
- 性能：需要**频繁在屏幕上显示**时性能更好
- 适用场景：GUI 显示、用作图标和作为控件背景图等

QImage（图像）
- 用途：主要用于像素级操作和图像处理，各种 convertTo ，pixel，set 函数，用于精细操作数据，更改数据存储格式，保存数据
- 存储格式：以原始像素数据格式存储（RGB、ARGB 等）
- 性能：**像素级访问和修改更高效**
- 适用场景：图像处理、像素操作、图像算法等
### bubble 对话框模块
包含 `bubble.h` 和 `bubble.cpp`
#### 根据文本内容设置气泡组件尺寸
```cpp
void Bubble::setContent(const QString &text, int parent_width)
{
    ui->content_label->setText(text);

    int max_textwidth = parent_width - 300;
    ui->content_label->setMaximumWidth(max_textwidth);
    ui->content_label->setFont(QFont("Microsoft YaHei", 10));

    // 计算整个字符串的长度占用
    QFontMetrics fm(ui->content_label->font());
    int textWidth = fm.horizontalAdvance(text);
    int optimalWidth = qMin(textWidth + 20, max_textwidth);

    // 重要：先重置尺寸限制，让标签自由计算
    ui->content_label->setMaximumSize(QWIDGETSIZE_MAX, QWIDGETSIZE_MAX);
    ui->content_label->setFixedSize(QWIDGETSIZE_MAX, QWIDGETSIZE_MAX);

    ui->content_label->setFixedWidth(optimalWidth);
    ui->content_label->setWordWrap(textWidth + 20 > max_textwidth);

    // 强制更新布局
    ui->content_label->adjustSize();

    // 获取QLabel自己计算的大小（最准确）
    QSize labelSize = ui->content_label->sizeHint();
//    qDebug() << "最终气泡尺寸:" << labelSize;

    // 根据整个气泡组件的大小，调整组件画布大小
    QSize newBubbleSize = calculateBubbleSize(labelSize, parent_width);
    this->setFixedSize(newBubbleSize);
    ui->content_label->setFixedSize(labelSize); // 根据布局调整
    ui->label->setFixedHeight(labelSize.height());
}
```
设置 setMaximumSize 后，如果文本内容长度超过最大宽度，QLabel
不会自动换行。默认情况下，QLabel 会：
1. 截断文本：超出部分会被截断显示
2. 不自动换行：除非显式设置 `setWordWrap(true)`
  `adjustSize()` 会根据以下因素重新计算并设置控件尺寸：
- 当前设置的固定宽度 (setFixedWidth)
- 是否启用换行 (setWordWrap)
- 文本内容和字体
- 样式表中内边距（padding）
所以先重置尺寸，设置好计算的宽度后，调用 `adjustSize()` 函数刷新
计算完气泡组件大小后，计算画布大小，调用 `this->setFixedSize()`，`ui->label->setFixedHeight(labelSize.height());` 让label字体垂直居中

### 数据管理和请求构建模块
#### 数据请求流程
包含 `datamanager.h` ， `datamanager.cpp`，`business.h` 和 `business.cpp`
UI 需要跟用户交互，用户的交互产生数据更新的需要，需要从 server 端拉取最新的数据。
程序中datamanager 类用来专门管理**当前用户**的：信息，好友列表，群组列表，消息缓存和有添加好友和添加群组的请求列表，并且为这些属性添加了一系列 setter 和 getter 接口，这些数据保存在本地 client 端中。

business 类则用来构建出各种请求头，用于 networkmanager 对象的 `send_message()` 函数来发送网络数据请求，请求的结果被 datamanager 调用保存到 client 程序的内存中，这些数据最终会被用来更新 ui
构建流程
```md
用户操作
    ↓
UI组件（如点击发送按钮）
    ↓
Business::construct_chat_message() (构建协议)
    ↓
NetworkManager::send_message() (发送到服务器)
    ↓
服务器响应
    ↓
NetworkManager接收数据
    ↓
MainWindow::onDataReach() (分发处理)
    ↓
DataManager更新数据
    ↓
UI更新显示
```
#### 请求头使用基本数据类型原因
很多需要网络请求的 C++项目中，网络请求的各项信息都被封装在 struct 中，成员使用基本数据类型 int，char，char\[\]等，原因有：
- 网络协议本质上是二进制协议，数据在网络中传输的是字节流不是高级语言对象
- 对于字符串，一般使用字符数组或者字符串指针，C 字符串内存布局完全确定，每个字段的位置和大小都固定，而 `QString` / `std::string`：内部结构复杂，包含额外的元数据（长度、容量、引用计数等），一般在无关网络请求的部分使用**减少代码编写工作量**
- 网络前后端，或者网络协议需要被不同语言实现，使用基本类型能够保证被正确读取，**序列化和反序列化**
- 性能考虑，零拷贝：可以直接发送内存中数据，内存效率：没有额外的对象开销，并且只包含**实现功能所需的最小的数据**，节省流量
### 自定义消息框
包含 `custommessagebox.h` 和 `custommessagebox.cpp`
继承 QDialog 是因 QMessageBox 的外观受系统主题影响，并且只能使用**固定的布局（窗口标题，图标，正文内容，确定，否定，取消按钮**），QDialog 则可以完全自定义外观和布局
自定义窗口大小布局：
```cpp
void CustomMessageBox::adjustSizeToContent()
{
    // 步骤1: 计算文本所需高度
    m_textEdit->document()->setTextWidth(m_textEdit->width());
    int textHeight = m_textEdit->document()->size().height();

    // 步骤2: 限制最大高度
    QScreen *screen = QApplication::primaryScreen();
    int maxHeight = screen->availableGeometry().height() * 0.6;

    // 步骤3: 设置文本编辑框高度
    int textEditHeight = qMin(textHeight + 10, 200); // 最大200像素
    m_textEdit->setFixedHeight(textEditHeight);

    // 步骤4: 计算总高度
    int totalHeight = 180 + (textEditHeight - 60); // 基础高度 + 额外高度

    // 步骤5: 设置对话框大小
    setFixedSize(350, qMin(totalHeight, maxHeight));
    findChild<QWidget*>("bgWidget")->setFixedSize(350, qMin(totalHeight, maxHeight));
}
```
- 注意对 `m_textEdit->document(m_textEdit->width())` 设置宽度就是设置文本框的宽度为文本控件的宽度，告诉文档系统在进行文本布局和换行计算时，按照这个宽度来换行，文本在长度超过m_textEdit宽度时，在**视觉上自动换行**
- findChild 中提到的名为 `bgWidget` 的 GUI 控件其实是 custommessagebox 类中所有组件（按钮，标题和 message 正文）的画布，将画布的大小设置为其中所有组件的大小让其显示正常
### 聊天列表模块
包含 `frienditem.h` 和 `frienditem.cpp`，`groupmember.cpp` 和 `groupmember.h`
`friendItem::set_users_in_group_list_item` 用于在群成员列表中显示用户信息，*可能是历史原因*在 GroupMember 中也有同名函数用来处理群成员显示，在群成员列表显示控件中显示每一个成员的头像，名称等信息

`setSession()` 函数本质是根据 ` m_session ` 中解析出来的信息来更新 ui 控件
```cpp
void friendItem::setSession_item()
{
    ui->friend_name->setText(m_session_info.name);
    if(m_session_info.sessionType == 1){ // 私聊
         ui->msg_label->setText(m_session_info.lastMessage);
    }else{ // 群聊
        QString displayText = m_session_info.lastMessage;
        // 检查群成员数据是否可用
        if (m_dataManager.m_groupMembers.contains(m_group_info.group_account)) {
            QVector<USER_INFO> users = m_dataManager.m_groupMembers[m_group_info.group_account];

            QString senderName = "";
            // 查找发送者名称是否是在datamanager中被管理起来
            for(int i = 0; i < users.size(); i++) {
                if(QString::fromUtf8(users[i].user_account) == m_session_info.sender) {
                    senderName = QString::fromUtf8(users[i].user_name);
                    break;
                }
            }

            // 如果找到发送者，添加前缀
            if(!senderName.isEmpty()) {
                displayText = senderName + ": " + m_session_info.lastMessage;
            } else if (!m_session_info.sender.isEmpty()) {
                // 如果没找到发送者名称，但sender不为空，显示账号
                displayText = m_session_info.sender + ": " + m_session_info.lastMessage;
            }
        } else {
            qDebug() << "群成员数据未就绪，群账号:" << m_group_info.group_account;
            // 群成员数据未就绪，只显示消息内容
        }

        ui->msg_label->setText(displayText);
    }
    // 更新UI上组件的显示代码...
}
```
由于**当前[[#数据管理和请求构建模块|用户的所有信息]]** 都被 datamanager 存储起来，所以这里的处理方法是**不将最后一个发送人的用户信息**放在请求头中，而是由当前用户存储。
```cpp
for(int i = 0; i < users.size(); i++) {
    if(QString::fromUtf8(users[i].user_account) == m_session_info.sender) {
        senderName = QString::fromUtf8(users[i].user_name);
        break;
    }
}
```
遍历所有已经管理的数据，检查最后一条消息发送者是否存在于 datamanager 中
### 登录模块
重点是 onDataReach 函数，当有消息发送到客户端时，`while(true)` 不断使用 `read_message()` 从 socket 中读取消息，如果读取到的请求头非空，则说明接收到了数据，根据 `msg_header.msg_type` 再通过 `m_NetworkManger` 发送对应的请求，将请求结果通过 `m_dataManager` 记录到本地客户端中
登录回应和注册回应比较复杂
```cpp
case LOGIN_RESPONSE:
	 m_NetworkManager->read_login_message(msg_header, user_query_response_msg);
	 qDebug() << "接收到登陆回应";
	 if (user_query_response_msg.success_flag == 0) {
		 qDebug() <<  user_query_response_msg.response;
		 // 使用自定义消息框
		 CustomMessageBox::showWarning(this, "登陆失败", user_query_response_msg.response);
		 // 登录失败，保持连接但重置认证状态
		 resetUIState();
		 m_connectionState = Connected;
	 }else{
		 qDebug() << user_query_response_msg.response;
		 m_connectionState = Authenticated;

		// 构建m_currentUser，省略
		 // 将头像数据转换为QPixmap用于显示， 省略
		 m_dataManager.setCurrentUser(m_currentUser);
		 // 发出登录成功信号，开始创建主窗口
		 emit loginSuccess();
		 return;
	 }
	break;
case REGISTER_RESPONSE:
	m_NetworkManager->read_remain_message(msg_header, response_msg);
	qDebug() << "接收到注册回应";

	resetUIState();
	// 注册完成后重置连接状态
	m_connectionState = Connected;

	if (response_msg.success_flag == 0) {
		qDebug() <<  response_msg.response;
		// 使用自定义消息框
		CustomMessageBox::showWarning(
			this,  // 父窗口
			"注册失败",
			response_msg.response
		);
	}else{
		qDebug() <<  response_msg.response;
		// 注册成功后自动填充账号
		ui->accountEdit->setText(m_pendingRegisterAccount);
		ui->passwordEdit->setFocus();
		ui->passwordEdit->clear();
		CustomMessageBox::showInformation(this, "注册成功", "账号注册成功，请登录");
	}
	break;
```
### 用户信息模块
简单显示用户信息窗口，在用户点击头像位置 show，widget 会被在 mainwindow 中传入用户头像控件
![[PixPin_2025-12-21_12-52-50.png]]
```cpp
void UserInfoPopup::showAtWidgetSide(QWidget *widget)
{
    if (!widget) return;

    // 获取按钮的全局位置和大小
    QRect widgetRect = widget->rect();
    QPoint widgetTopLeft = widget->mapToGlobal(widgetRect.topLeft());
    QPoint widgetBottomRight = widget->mapToGlobal(widgetRect.bottomRight());

    // 获取屏幕信息
    QScreen *screen = QApplication::screenAt(widgetTopLeft);
    if (!screen) {
        screen = QApplication::primaryScreen();
    }

    int x = widgetBottomRight.x() + 5;
    int y = widgetTopLeft.y();

    this->move(x, y);
    this->show();
    this->raise();
}
```
在 mainwindow 中头像位置偏右**显示并将本窗口置顶**，如果显示窗口后再次点击头像，为避免关闭，使用了 eventFilter
```cpp
bool UserInfoPopup::eventFilter(QObject *watched, QEvent *event)
{
    if (event->type() == QEvent::MouseButtonPress) {
        QMouseEvent *mouseEvent = static_cast<QMouseEvent*>(event);

        // 检查点击位置是否在弹窗外
        if (!geometry().contains(mouseEvent->globalPos())) {
            // 获取点击的控件
            QWidget *clickedWidget = QApplication::widgetAt(mouseEvent->globalPos());

            // 如果点击的是触发按钮，不关闭（避免立即关闭）
            if (clickedWidget && clickedWidget->objectName() != "headimgBtn") {
                hide();
                return true;
            }
        }
    }

    return QWidget::eventFilter(watched, event);
}
```
### 主界面模块
#### 实现细腻滚动
每次滚动的单位是 1 像素，同理类似 temux 终端界面效果只需要将每次滚动的单位长度设置为单行文字高度即可
```cpp
bool mainWindow::eventFilter(QObject *obj, QEvent *event)
{
    if (event->type() == QEvent::Wheel) {
        QWheelEvent *wheelEvent = static_cast<QWheelEvent*>(event);

        if (obj == ui->listWidget->viewport() || obj == ui->chatWidget->viewport()) {
            QAbstractScrollArea *scrollArea = (obj == ui->listWidget->viewport()) ? ui->listWidget : ui->chatWidget;

            if (scrollArea) {
                QScrollBar *vScrollBar = scrollArea->verticalScrollBar();
                int delta = wheelEvent->angleDelta().y();

                // 超细腻滚动：每次只滚动1像素
                int step = (delta > 0) ? -1 : 1;
                vScrollBar->setValue(vScrollBar->value() + step);

                return true;
            }
        }
    }
    return QWidget::eventFilter(obj, event);
}
```
- `angleDelta()` 返回一个 QPoint 对象，表示滚轮的滚动量，传统滚轮：每次滚动通常为 120 或 -120，触摸板/高精度滚轮：可以是更小的值（如 15, 30, 60 等）
```cpp
// 传统做法
vScrollBar->setValue(vScrollBar->value() + delta);

// 细腻滚动
delta = delta > 0 ? -1 : 1;
vScrollBar->setValue(vScrollBar->value() + delta);
```
传统做法这样会根据用户的设备有不同的滚动精度，而细腻滚动在任何设备上滚动效果都是一致的
#### QListWidget 自定义项控件
在 update 消息列表和群消息列表时，使用了这样代码：
```cpp
void mainWindow::update_friendlist(USER_INFO &user_info)
{
    bool flag = false;
    for (int i = 0; i < ui->friend_list->count(); i++) {
        QListWidgetItem* item = ui->friend_list->item(i);
        if (!item) continue;
        friendItem *friItem = qobject_cast<friendItem*>(ui->friend_list->itemWidget(item));
        if(strcmp(friItem->m_friend_info.user_account, user_info.user_account) == 0) {
            friItem->setfriendlist_item(user_info);

            QString notice = "您的好友："+ QString(user_info.user_name) + "   已上线";
            if(user_info.status == 1){
                CustomMessageBox::showInformation(this, "好友上线提醒", notice);
            }
            flag = true;
            break;
        }
    }

    if(!flag){
        add_friendlist(user_info);
    }
}
```
friendItem 构造函数中并没有对 QListWidgetItem 的转换，但 `friendItem *friItem = qobject_cast<friendItem*>(ui->friend_list->itemWidget(item));` 能够被 `qobject_cast` 转换的原因是在对应的 add 函数中使用了
```cpp
QListWidgetItem * m_Item = new QListWidgetItem();
ui->friend_list->insertItem(0, m_Item);
ui->friend_list->setItemWidget(m_Item, friItem);
```
通过 `setItemWidget()` 将 friendItem 与 QListWidgetItem 关联起来， QListWidget 内部管理的仍是 QListWidgetItem 对象，如果需要获取其中单个项，返回结果（如 `itemWidget()`）还是 `QWidget*` 需要手动转换

# Server 端
## 具体文件
### 数据持久化模块
包含 `data_handle.h/cpp`
负责与 SQLite 数据库的交互，处理所有数据的 CRUD 操作，提供：
 - 用户注册/登录验证
 - 好友关系管理
 - 群组信息管理
 - 消息记录存储
 - 头像文件管理
#### C-Style 文件操作
```cpp
FILE* file = fopen(avatar_path, "rb");

fseek(file, 0, SEEK_END);		// 移动指针到尾部
long file_size = ftell(file);	// 计算file指针和当前指针的距离
fseek(file, 0, SEEK_SET);		// 移回开头

struct stat st;
stat(avatar.dir, &st);
mkdir(avatar_dir, 0755			// 创建文件夹
```
- C-style **操作**文件使用的是文件指针指向文件，使用 `fopen()` 函数打开文件 `FILE* file = fopen(avatar_path, "rb");`，这种类似 python 的方式
- 获取文件大小需要先**将文件指针指向文件的尾部位置，然后根据 file 文件指针和尾部位置进行指针运算**得到文件大小。
- 创建文件夹同时设置权限，权限**使用八进制数字表示**，因 [[Linux Basics#文件和权限#通过数字修改权限|linux每一个权限组是3位的]]。
- C-style 中获取文件的信息需要借助 `struct stat` 结构体和 `stat()` 函数，`if (stat(avatar_dir, &st) != 0) ` 判断文件是否存在
#### sqlite3lib 库数据库操作
```cpp
// get_table函数参数
int sqlite3_get_table(
  sqlite3 *db,          /* 数据库连接 */
  const char *zSql,     /* SQL查询语句 */
  char ***pazResult,    /* 查询结果输出 */
  int *pnRow,           /* 行数输出 */
  int *pnColumn,        /* 列数输出 */
  char **pzErrmsg       /* 错误信息输出 */
);

// 使用get_table
if(sqlite3_get_table(m_db, sql, &resultp, &nrow, &ncolumn, &errmsg) != SQLITE_OK) {
    printf("%s", errmsg);
    sqlite3_free(errmsg);  // 释放错误信息内存
    errmsg = NULL;
    return -1;
}

// resultp[0] = "列名1"
// resultp[1] = "列名2"
// resultp[2] = "列名3"
// resultp[3] = "第一行数据1"
// resultp[4] = "第一行数据2"
// resultp[5] = "第一行数据3"
// resultp[6] = "第二行数据1"

// sql语句预处理和参数绑定
const char* sql =
    "INSERT INTO msg_info_from_friend (sendtime, sender_account, receiver_account, msg_type, file_size, read_status, msg_content) "
    "VALUES (?, ?, ?, ?, ?, ?, ?)";

// 准备 SQL 语句
int rc = sqlite3_prepare_v2(m_db, sql, -1, &stmt, nullptr);
if (rc != SQLITE_OK) {
    printf("准备SQL语句失败:%s\n", sqlite3_errmsg(m_db));
    return -1;
}

// 绑定参数
sqlite3_bind_int(stmt, 1, chat_msg->msg_header.timestamp);
sqlite3_bind_text(stmt, 2, chat_msg->sender_account, -1, SQLITE_TRANSIENT)
sqlite3_bind_text(stmt, 3, chat_msg->receiver_account, -1, SQLITE_TRANSIENT)

// 执行简单sql语句
int sqlite3_exec(							/* 返回结果 */
  sqlite3*,                                 /* 数据库连接 */
  const char *sql,                          /* SQL语句 */
  int (*callback)(void*,int,char**,char**), /* 回调函数 */
  void *,                                   /* 传递给回调的参数，SELECT时需要，INSERT/UPDATE/DELETE可为NULL*/
  char **errmsg                             /* 错误信息输出 */
);
```
- `sqlite3_free` 作用是**释放 SQLite 内部分配的内存**，SQLite 在某些操作中会动态分配内存，调用者需要负责释放，比如这里的错误信息字符串长度是**动态的**，只有 sqlite 知道有多长，所以 sql 负责分配，**但调用者负责释放，同理需要手动释放的还有 pazResult 结果集，预处理语句**。必须与 SQLite 的内存分配函数配对使用，不能用 C++的 delete 或 free
- 参数绑定部分需要注意不同类型数据绑定 api 不一样
- 预处理对象需要使用 `sqlite3_stmt` 对象，预处理流程为：
	- 创建预处理对象 stmt
	- 编写预处理 sql 语句
	- 编译预处理语句（如果有 sql 或者 C++中 `？` 放置语法错误会在这里提示）
	- 绑定参数
	- `sqlite3_step(stmt)` 执行语句，返回值为：
		- `SQLITE_ROW`: SELECT 查询有下一行数据
		- `SQLITE_DONE`: 查询完成
		- `SQLITE_ERROR`: 执行错误
	- 执行 `sqlite3_finalize(stmt)` 释放内存
- `sqlite3_exec` 性能较低，并且**不支持绑定参数**，还需要手动解析
### 业务逻辑处理模块
包含 `business.h/cpp`
主要职责是：
1. 消息分发中心
	- 接收来自客户端的**原始消息**
	- 根据消息类型分发到相应的处理函数
	- 统一管理所有业务逻辑的入口
2. 业务逻辑处理器
	- 处理用户注册、登录、好友管理、群组管理、消息传递等业务
	- 协调数据访问层 (data_handler) 和网络层 (tcp_server)
3. 并发控制中心
	- 使用线程池处理客户端请求
	- 为每个客户端维护读写锁，防止并发冲突
#### 线程处理
```cpp
Business::Business(data_handler* DataHandler) {
	/**
	 * - thread_handle: 工作线程函数指针
	 * - this: 传递给工作线程的用户数据
	 * - 20: 线程池最大线程数
	 * - FALSE: FALSE表示不预先创建所有线程
	 * - NULL: 错误处理，NULL表示不关心错误处理
	 */
    m_pool = g_thread_pool_new(thread_handle, this, 20, FALSE, NULL);
    m_db_handler = DataHandler;
}
```
- 使用 `g_thread_pool_new`*较为方便地创建线程池*，其中 thread_handle 是**线程工作函数**，每一个线程需要做什么事在这个函数中定义，定义为：`void (*GFunc) (gpointer data, gpointer user_data)`
- gpointer 是 `typedef void* gpointer`
	- data 是**这个线程工作函数中需要用到的本任务的特定数据**，本项目中是客户端通信的 socket（clientfd），因程序设计为每一个线程用来处理一个客户端的请求任务
	- user_data 是通过 g_thread_pool_new 传递的**全局数据**，在本项目的工作函数中使用的全局数据是 Business 类构造函数中 DataHandler
```cpp
// 基本数据类型转换，需要特殊宏
gpointer ptr = GINT_TO_POINTER(123);
int value = GPOINTER_TO_INT(ptr);
gpointer ptr2 = GUINT_TO_POINTER(456789L);
gulong value2 = GPOINTER_TO_ULONG(ptr2);

// 对象指针转换（不需要特殊宏）
Business *business = new Business(handler);
gpointer ptr = business;  // 直接赋值
Business *recovered = static_cast<Business*>(ptr);  // 类型转换
```

# 总结
## 通信流程
Echat是一个基于C++和Qt框架的即时通讯(IM)系统，采用经典的客户端-服务器(C/S)架构：
```cpp
+-------------------+                    +-------------------+
|                   |                    |                   |
|     Qt客户端       | <------TCP-------> |    epoll服务器     |
|                   |                    |                   |
+-------------------+                    +-------------------+

// 服务端
TCP Server (tcp_server.cpp)
    ↓ (接收客户端连接和消息头)
Business Layer (business.cpp)
    ↓ (业务逻辑处理)
Data Handler Layer (data_handler.cpp)
    ↓ (数据库/文件系统操作)
SQLite3 + File System
```
1. 注册流程: REGISTER_REQUEST → REGISTER_RESPONSE
2. 登录流程: LOGIN_REQUEST → LOGIN_RESPONSE + 好友列表 + 群组列表 + 通知列表
3. 添加好友流程:
  - ADD_FRIEND_REQUEST → FRIEND_ADD_RESPONSE + ADD_FRIEND_NOTICE 双向
  - ACCEPT_FRIEND_ASK/REJECT_FRIEND_ASK → FRIEND_ACCPET_RESPONSE/FRIEND_REJECT_RESPONSE
1. 消息发送流程: SEND_CHAT_MSG → SEND_CHAT_RESPONSE + CHAT_MSG_NOTICE
2. 群聊流程: CREATE_GROUP_REQUEST → CREATE_GROUP_RESPONSE
## 技术栈架构设计
### 客户端
客户端技术栈
- 编程语言: C++
- UI 框架: Qt (包含 Qt Widgets, Qt Network)
- UI 设计: Qt Designer
- 构建系统: qmake (基于. pro 文件)

客户端架构
1. 网络层: NetworkManager 类，基于 QTcpSocket 实现网络通信
2. 业务层: Business 类，处理消息构建和 UI 辅助功能
3. 数据层: DataManager 类，单例模式管理应用数据
4. UI 层: MainWindow 等类，基于 Qt Widgets 实现用户界面
### 服务端
服务器端技术栈
- 编程语言: C++
- 网络编程: Linux epoll + socket 编程
- 并发处理: GLib 线程池
- 数据库: SQLite 3
- 构建系统: CMake
- 操作系统: Linux (根据 README. md 提到部署在云服务器上)
服务器端架构
1. 网络层: TcpServer 类，使用 epoll 实现事件驱动的 I/O 多路复用
2. 业务层: Business 类，使用 GLib 线程池处理客户端请求
3. 数据层: data_handler 类，封装 SQLite 数据库操作
4. 协议层: protocol. h，定义消息格式和通信协议
### 关键技术
高并发处理
- 服务器: 使用 epoll + 线程池模式，支持大量并发连接
- 边缘触发模式: 提高 I/O 效率
- 客户端锁机制: 为每个客户端维护读写锁，防止并发处理同一客户端

通信协议设计
- 自定义二进制协议: 基于结构体的消息格式
- 消息头设计: 包含类型、长度、时间戳等信息
- 柔性数组: 用于处理可变长度的消息体

###