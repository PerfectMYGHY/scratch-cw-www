# 指南

指南中所有过长的代码可以按下 `Shift` 键加滚轮滑动以横向浏览。

## 第一步：复制模板

首先复制下面模板到你的JavaScript的代码编辑器。（注意，代码是直接在浏览器运行的，不要使用Node.js才有的特性）

``` javascript
// Name: 扩展名称
// ID: 扩展ID(英文数字都行)
// Description: 扩展功能简介
// By: 你的账号名称

(function (Scratch) { // 实际上，该文件的代码只会在加载扩展时调用

  // 定义一些公用变量、函数
  const menuIconURI = ""; // 菜单图标数据
  const blockIconURI = ""; // 积木图标数据

  class 扩展类名 {
    constructor() {
      // Scratch.vm.runtime 可以得到 runtime
    }
    getInfo() {
      // 该方法将返回积木块的设置
      return {
        id: "扩展ID",
        name: "扩展名称",
        docsURI: "你的扩展的说明文档URL", // 可选参数
        menuIconURI: menuIconURI, // 菜单图标，在左侧积木分类栏显示
        blockIconURI: blockIconURI, // 积木图标，显示在积木最左侧
        blocks: [ // 扩展的所有积木的列表
          {
            opcode: "积木1的opcode",
            blockType: Scratch.BlockType.COMMAND, // 积木类型，Scratch.BlockType记录着所有可用的类型
            text: "积木文本",
          },
          { // 示例
            opcode: "hasPermission",
            blockType: Scratch.BlockType.BOOLEAN,
            text: Scratch.translate("has notification permission"), // 为了审核人员添加多语言话的方便，你可以在你的积木文本周围加上Scratch.translate()
            disableMonitor: true, // 不知道干什么的
          },
          {
            opcode: "showNotification",
            blockType: Scratch.BlockType.COMMAND,
            text: "create notification with text [text]", // 可以使用[]来代表积木参数，其中的内容是参数ID
            arguments: { // 该积木的参数列表
              text: { // 上述中的[text]就代表它
                type: Scratch.ArgumentType.STRING, // 这个参数的类型，Scratch.ArgumentType记录着所有参数类型
                defaultValue: "Hello, world!", // 参数的默认值
              },
            },
          },
          { // 多参数用法
            opcode: "showNotificationMore",
            blockType: Scratch.BlockType.COMMAND,
            text: Scratch.translate("create notification with title [title], text [text], other options [opts] (please use extension \"JSON\")"),
            arguments: {
              title: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "来自项目的通知",
              },
              text: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "Hello, world!",
              },
              opts: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "{}",
              },
            },
          },
          "---", // 使用"---"将上下两个积木隔开一点空隙，代表不同的功能
          {
            blockType: Scratch.BlockType.LABEL, // 使用该积木类型，出现的只是一个文本标签，相当于一个功能区的名字
            text: Scratch.translate("advanced setting"), // 文本标签内容
          },
          {
            opcode: "setOptionsItem",
            blockType: Scratch.BlockType.COMMAND,
            text: Scratch.translate("set the option [name] of notification to [value]"),
            arguments: {
              name: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "body", // 参数默认值，这里指菜单默认值。指代的是菜单每项的value属性
                menu: "options", // 使用这个属性指定这个参数的菜单
              },
              value: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "",
              },
            },
          },
        ],
        menus: { // 定义所有菜单的内容
          options: [ // 与之前对应
            { text: Scratch.translate("options body"), value: "body" }, // 定义菜单项的方法之一，表示显示的内容和真实的值不一致
            "菜单2" // 表示文本和值一致
          ],
          menu2: "getMenu" // 如果直接使用字符串，则代表调用该扩展类的 字符串中的名称 的属性获得菜单值
        },
      };
    }

    // 各个积木的实际代码的实现
    // 函数名就是积木的opcode
  }

  Scratch.extensions.register(new 扩展类名()); // 将该扩展注册到scratch中
})(Scratch);

```

## 第二步：更改扩展菜单图标、积木图标

你可以使用Scratch的造型编辑器设计你的扩展图标（最后导出），更厉害的可以用`Adobe Illustrator`设计。注意，导出的是svg。

然后你可以按照下面方法把svg转为代码里的data URL：

> * 用记事本打开svg文件，去掉所有换行
> * 然后把这个内容转换为URL编码（就比如说把空格变为`%20`）
> * 最后在这个内容前面加上`data:image/svg+xml,`

然后替换模板中的变量`blockIconURI`、`menuIconURI`的值。

## 第三步：设置插件名称

首先修改插件类的名字。例如：插件叫`高级音频处理`，则英文名是`AudioProcessing`，那么类名就是`Scratch3AudioProcessing`。不要忘记修改注册部分。

然后来到 `getInfo` 属性下，修改`id`属性为刚才的`AudioProcessing`（记住，是示例！不是说必须），修改`name`为`高级音频处理`（这是要显示的，所以不是英文名。并且发给我们后我们会帮您多语言化）。

## 第四步：添加积木

接下来来到`blocks`属性下，我们将要介绍常用方法。

具体写法模板里有，下面给出的是所有的积木类型（使用`BlockType.积木类型`）。

| 属性 | 作用 |
| ----:|:---- |
| BOOLEAN   | 一个返回布尔值的积木 |
| BUTTON | 一个类似于`创建变量`按钮的按钮，需要指定点击时执行的函数，在类里编写即可。 |
| LABEL    | 直接在此处显示一个文字标签。就和显示每个类别名称的那个标签一样 |
| COMMAND    | 只能执行的积木 |
| CONDITIONAL    | 站长看不懂定义文件给的说明：可以运行也可以不运行子分支的专用命令块，无论是否运行了子分支，线程都会继续执行下一个块 |
| EVENT    | 事件积木，就和 事件 类别里的积木一样，不管官方说明里还有：没有实现功能的专用帽块，只有当其他代码发出相应的事件时，此堆栈才会运行 |
| HAT    | 效果和上面一样。不过这三种有啥区别站长到现在还不明白。官方说明：有条件地启动块堆栈的帽块 |
| LOOP    | 一种循环结构，可以让积木变得和 重复执行 一样，不过站长也不熟悉 |
| REPORTER    | 具有返回值的积木 |
| XML    | 高级用法，小白（包括站长）勿用。官方说明是说这可以直接使用`scratch-blocks`的积木XML来定义一个积木块，可以使用更高级的属性 |

特别说明：

1.`CONDITIONAL`、`EVENT`、`HAT` 类型 站长也不会

2.`LOOP` 类型 站长不熟悉

3.`XML` 类型 站长只是见过`scratch-blocks`的积木XML，但没仔细研究过

接下来我们说明的是参数类型：

| 属性 | 作用 |
| ----:|:---- |
| ANGLE   | 带角度选择器的角度输入框 |
| BOOLEAN | 布尔值输入框 |
| COLOR    | 带颜色选择器的颜色选择框 |
| NUMBER    | 数字输入框 |
| STRING    | 字符串输入框 |
| MATRIX    | 带矩阵字段的字符串值 |
| NOTE    | 带音符选择器（钢琴）字段的MIDI音符编号 |
| IMAGE    | 块上的内联图像（作为标签的一部分） |
| COSTUME    | TurboWarp特有类型：当前角色中造型的名称 |
| SOUND    | TurboWarp特有类型：当前角色中声音的名称 |

这些站长基本都用过。最后两个新增类型的问题：会把菜单的背景色改为相应功能原来所在的类别的颜色（比如使用COSTUME，那么这个菜单的背景颜色则是 造型 类别的）

参数类型几个示例截图：

1.ANGLE

![ANGLE类型示例](/images/make-ext/angle-example.png)

2.BOOLEAN

![BOOLEAN类型示例](/images/make-ext/bool-example.png)

3.COLOR

![COLOR类型示例](/images/make-ext/color-example.png)

4.MATRIX

![MATRIX类型示例](/images/make-ext/matrix-example.png)

5.NOTE

![NOTE类型示例](/images/make-ext/note-example.png)

6.IMAGE

![IMAGE类型示例](/images/make-ext/image-example.png)

7.COSTUME

![COSTUME类型示例](/images/make-ext/costume-example.png)

8.SOUND

![SOUND类型示例](/images/make-ext/sound-example.png)

特殊：

让两个积木块之间有一些空隙（通常表示两个类别，还可以再空隙后面加上标签）：在两个积木的对象直接加入`"---",`，例如：

```js
return {
    blocks: [
        {opcode:"XXX",...},
        "---",
        {opcode:"XXX",...}
    ]
};
```

参数默认值：参数设置里添加`defaultValue`即可：

```js
return {
    blocks: [
        {
            opcode:"XXX",
            ...,
            arguments: {
                NAME: { // 参数名
                    type: ArgumentType.STRING, // 参数类型，这里是字符串
                    defaultValue: "a" // 默认值
                },
            }
        }
    ]
};
```

制作自己的菜单：还是在上面的类型里选一个作为输入类型（要么字符串，要么数字，取决于你想要的菜单的值），然后再积木参数设置里加入属性`menu`，其值为菜单ID（字符串）。

```js
return {
    blocks: [
        {
            opcode:"XXX",
            ...,
            arguments: {
                NAME: { // 参数名
                    type: ArgumentType.STRING, // 参数类型，这里是字符串
                    defaultValue: "wav" // 默认值
                    menu: '菜单ID', // 参数的选择菜单列表名，没有该选项就代表参数可以输入内容
                },
            }
        }
    ]
};
```

然后在`blocks`属性后面添加新属性`menus`，内容如下：

```js
{
    blocks:[...],
    menus: [
        菜单ID: { // 新建一个菜单
            acceptReporters: true, // 未知用处
            items: [ // 菜单选项
                { text: "WAV", value: "wav" }, // text为显示的文字，value为执行积木时传递给函数的字符串
                { text: "MP3", value: "mp3" }
            ]
        }
    ]
}
```

接下来参数就变成选择菜单了。对于菜单的`items`属性，有许多用法，下面是还常用的两种：

```js
{
    items: ["a","b"]
}
```

这表示显示文本和值都是`a`和`b`两个选项。

```js
{
    items: "_getItems"
}
```

高级用法，使每次获取菜单项时都调用扩展类的方法`_getItems`（只是示例）以获取菜单项。`_getItems`函数只需用可以随机应变的返回一个和第一种方法一样的列表即可。

## 第五步：编写积木代码

现在已经创建完积木了，需要编写积木点击时执行的代码。大部分积木类型的实际代码都写在扩展的类里。如模板所示，方法名称就是积木的操作码。

```js
    _getSoundByName(util, name) { // 一个被内部调用的方法，根据声音名称获取util中声音的数据对象
        const sounds = util.target.getSounds();
        for (const sound of sounds) {
            if (sound.name == name) {
                return sound;
            }
        }
        return null;
    }
    readAudioFromSprite(args, util) { // 操作码，这里接受两个参数
        // args是对象，包含了积木所有参数当前的值
        // util是对象，包含了当前角色的所有信息
        // 这是一个示例，是一个只执行的积木，第一个参数AUDIO的类型是`SOUND`，第二个是一个菜单，内容和前面示例的一样
        var { AUDIO, NAME } = args; // 从参数对象中提取积木中定义的AUDIO和NAME参数。
        // 执行积木要执行的代码
        const sound = this._getSoundByName(util, AUDIO); // 获取音频对象
        if (sound) {
            vers[NAME] = { // vers也是自定义的
                data: sound.asset.data,
                type: sound.dataFormat
            }
            this.logToDebugger(`已成功将音频信息存储至内部变量 ${NAME}`); // 自定义的方法，不是内置的
            return;
        }
        this.logToDebugger(`角色中没有名为 "${AUDIO}" 的音频！`,"warn");
    }
```

如上所示，可以接受外部传进来的`args`和`util`参数，`args`是参数，`util`是当前角色信息。`util`的具体内容站长还没有完全清楚，不过上面已经有示例了。

或者，你可以使用`async`这样的异步方法定义函数，因为可能操作需要等待。此时调用时会等待进程结束才会被标记为运行完毕。

## 第六步：测试

将代码保存，然后在Scratch创世界的在线或离线编辑器上再扩展里面找到`自定义扩展`，选择`文件`选项卡，上传你的测试版代码，勾选`不使用沙盒运行扩展`，点击`加载`即可加载扩展。

## 发送给我们你的扩展

当你设计好你的扩展后，可以向`916881890@qq.com`发送以下信息，将你的扩展贡献给我们。

注意：请不要尝试在扩展中加入任何恶意代码或不好的代码。详细请见下面的`审核要求`

如果你的扩展通过了审核，将会获得40Scratch币。

```email
主题: 向Scratch创世界提供扩展
发送者: XXXX@XX.XXX
接受者: 916881890@qq.com

我（账户名：XXX，注册使用的邮箱：XXXX@XX.XXX）打算向Scratch创世界贡献扩展。下面是关于扩展的详细信息：

名称：[扩展名]
扩展功能描述：[描述]
扩展ID：[扩展ID]

我保证该扩展不会包含恶意代码，并愿意承担此造成的后果。

标注：

code.js 为扩展源代码

补充说明(可选)：

XXX

---

附件：

code.js: 你的扩展代码文件
... 其余补充文件
```

# 审核要求

我们在接受到您发来的扩展后，将会审核其代码。如果不通过审核且您的代码包含恶意代码，我们将对您的账号标记1次违规。

匿名发送的扩展不予处理。

下面是审核要求：

1.与现有扩展非常相似的扩展：如果您发来的扩展与现有扩展非常相似，那么您的扩展可能会被拒绝。注意：此类不通过审核不计做违规

2.包含恶意代码：如果我们发现您发来的扩展含有恶意代码，那么我们将会拒绝，并标记您的账号违规1次

3.为了用户的安全，禁止使用`eval()`（防止某些人利用漏洞执行恶意代码）、`new Function()`（原因相同）等可能会导致安全问题的代码


