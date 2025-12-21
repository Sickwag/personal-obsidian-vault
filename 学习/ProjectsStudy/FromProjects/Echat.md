---
created: 2025年12月19日21:45:45
repo: https://github.com/windy66666/m_project/tree/main
---
# 杂项知识
# 具体文件
## addfriend 模块
包含 `addfriend.h` 和 `addfriend.cpp`
### `time_t` 类型使用
1. **如果 `time_t` 的值在 `int` 的范围内**：
    - 转换会**直接保留数值**，结果正确。
    - 例如：`time_t = 1609459200`（2021-01-01 00:00:00 UTC） → 转换为 `int` 后仍是 `1609459200`，从表示 Unix 纪元（1970年1月1日 00:00:00 UTC）开始经过的秒数
2. **如果 `time_t` 的值超出 `int` 的范围**：
    - **发生整数溢出**，结果未定义（UB），且数值被截断为 `int` 的最大/最小值。
    - 允许使用 longlong 等更大的结构存储
3. 标准库函数 `time(nullptr)` 或者 `time(NULL)` 返回当前时间距离 Unix 纪元的秒数
### 创建圆角头像
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
### 访问图像方式
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
## bubble 对话框模块
包含 `bubble.h` 和 `bubble.cpp`
### 根据文本内容设置气泡组件尺寸
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
- 样式表中的内边距（padding）
所以先重置尺寸，设置好计算的宽度后，调用 `adjustSize()` 函数刷新
计算完气泡组件大小后，计算画布大小，调用 `this->setFixedSize()`，`ui->label->setFixedHeight(labelSize.height());` 让label字体垂直居中

## 数据管理和请求构建模块
### 数据请求流程
包含 `datamanager.h` ， `datamanager.cpp`，`business.h` 和 `business.cpp`
UI 需要跟用户交互，用户的交互产生数据更新的需要，需要从 server 端拉取最新的数据。
程序中的datamanager 类用来专门管理**当前用户**的：信息，好友列表，群组列表，消息缓存和有添加好友和添加群组的请求列表，并且为这些属性添加了一系列 setter 和 getter 接口，这些数据保存在本地 client 端中。

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
### 请求头使用基本数据类型原因
很多需要网络请求的 C++项目中，网络请求的各项信息都被封装在 struct 中，成员使用基本数据类型 int，char，char\[\]等，原因有：
- 网络协议本质上是二进制协议，数据在网络中传输的是字节流不是高级语言对象
- 对于字符串，一般使用字符数组或者字符串指针，C 字符串内存布局完全确定，每个字段的位置和大小都固定，而 `QString` / `std::string`：内部结构复杂，包含额外的元数据（长度、容量、引用计数等），一般在无关网络请求的部分使用**减少代码编写工作量**
- 网络前后端，或者网络协议需要被不同语言实现，使用基本类型能够保证被正确读取，**序列化和反序列化**
- 性能考虑，零拷贝：可以直接发送内存中的数据，内存效率：没有额外的对象开销，并且只包含**实现功能所需的最小的数据**，节省流量
## 自定义消息框
包含 `custommessagebox.h` 和 `custommessagebox.cpp`
继承 QDialog 是因为 QMessageBox 的外观受系统主题影响，并且只能使用**固定的布局（窗口标题，图标，正文内容，确定，否定，取消按钮**），QDialog 则可以完全自定义外观和布局
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
## 聊天列表模块
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
## 登录模块
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
## 用户信息模块
简单显示用户信息窗口
![[PixPin_2025-12-21_12-52-50.png]]

## 主界面模块