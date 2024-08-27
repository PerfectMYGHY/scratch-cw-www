# 指南

指南中所有过长的代码可以按下 `Shift` 键加滚轮滑动以横向浏览。

## 第一步：复制模板

首先复制下面模板到你的node.js的代码编辑器（这里用作正式版）。建议：可以先从GitHub上下载`TurboWarp`的`scratch-vm`库的源代码，然后可以在`src/blocks`中新建文件并粘贴代码。这样一些引用的文件都可以看到。

``` js
const BlockType = require('../extension-support/block-type'); // scratch-vm 库中的文件，存储了积木块类型
const ArgumentType = require('../extension-support/argument-type'); // 积木块参数类型

/* 扩展图标的data URL */
const blockIconURI = 'data:image/svg+xml,%3Csvg id="rotate-counter-clockwise" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"%3E%3Cdefs%3E%3Cstyle%3E.cls-1%7Bfill:%233d79cc;%7D.cls-2%7Bfill:%23fff;%7D%3C/style%3E%3C/defs%3E%3Ctitle%3Erotate-counter-clockwise%3C/title%3E%3Cpath class="cls-1" d="M22.68,12.2a1.6,1.6,0,0,1-1.27.63H13.72a1.59,1.59,0,0,1-1.16-2.58l1.12-1.41a4.82,4.82,0,0,0-3.14-.77,4.31,4.31,0,0,0-2,.8,4.25,4.25,0,0,0-1.34,1.73,5.06,5.06,0,0,0,.54,4.62A5.58,5.58,0,0,0,12,17.74h0a2.26,2.26,0,0,1-.16,4.52A10.25,10.25,0,0,1,3.74,18,10.14,10.14,0,0,1,2.25,8.78,9.7,9.7,0,0,1,5.08,4.64,9.92,9.92,0,0,1,9.66,2.5a10.66,10.66,0,0,1,7.72,1.68l1.08-1.35a1.57,1.57,0,0,1,1.24-.6,1.6,1.6,0,0,1,1.54,1.21l1.7,7.37A1.57,1.57,0,0,1,22.68,12.2Z"/%3E%3Cpath class="cls-2" d="M21.38,11.83H13.77a.59.59,0,0,1-.43-1l1.75-2.19a5.9,5.9,0,0,0-4.7-1.58,5.07,5.07,0,0,0-4.11,3.17A6,6,0,0,0,7,15.77a6.51,6.51,0,0,0,5,2.92,1.31,1.31,0,0,1-.08,2.62,9.3,9.3,0,0,1-7.35-3.82A9.16,9.16,0,0,1,3.17,9.12,8.51,8.51,0,0,1,5.71,5.4,8.76,8.76,0,0,1,9.82,3.48a9.71,9.71,0,0,1,7.75,2.07l1.67-2.1a.59.59,0,0,1,1,.21L22,11.08A.59.59,0,0,1,21.38,11.83Z"/%3E%3C/svg%3E';

/**
 * 使用扩展实例实现的示例核心块。
 * 这不是作为VM中核心块的一部分加载的，而是提供的
 * 并用作测试的一部分。
 */
class Scratch3CoreExample { // Scratch3 + 扩展英文名
    constructor (runtime) { // 类初始化，参数runtime为Scratch运行状态
        /**
         * 实例化此块包的运行时。
         * @type {Runtime}
         */
        this.runtime = runtime;
    }

    /**
     * @returns {object} 此扩展及其块的元数据。
     */
    getInfo () {
        return {
            id: 'coreExample', // 扩展ID
            name: 'CoreEx', // 此字符串不需要翻译，因为此扩展名仅用作示例。
            menuIconURI: menuIconURI, // 菜单图标（干什么的不知道）
            blockIconURI: blockIconURI, // 每个积木左侧的图标
            color1: '#CF63CF', // 扩展的所有积木的背景颜色(没有则默认是绿色)
            color2: '#C94FC9', // 扩展的所有积木的选择菜单的背景颜色(没有则默认是深绿色)
            color3: '#BD42BD', // 3级颜色
            color4: '#BD42BD', // 4级颜色
            // 3、4级颜色通常和1级一样，不一样相差也不大，干啥的也不知道。
            blocks: [
                { // 一个按钮类型（切勿乱用，如果你真的想要一个按钮，请在发送正式版至我们的邮箱时说明！因为按钮的执行方法是内置函数，你可以另外发一份你希望的按钮处理方式的代码）
                    func: 'MAKE_A_VARIABLE', // 按钮执行函数名（内置的，还是上面所说）
                    blockType: BlockType.BUTTON, // 表明该积木是按钮类型（就像你在 变量 选项卡里看到的 创建变量 的按钮一样）
                    text: '创建一个变量 (CoreEx)' // 积木名称（你可以只写简体中文，当我们收到你的插件后，我们会在此处用`React Intl`对他进行多语言化）
                },
                {
                    opcode: 'exampleOpcode', // 积木的操作码（至关重要，尤其是不能与已存在的冲突）
                    blockType: BlockType.REPORTER, // 积木类型，表示是一个有返回值的积木（就像 运动 里的 X坐标）。
                    text: '示例积木'
                },
                {
                    opcode: 'exampleWithInlineImage',
                    blockType: BlockType.COMMAND, // 这代表积木是一个只执行的积木（就像 运动 里的 移动()步）
                    text: '一个显示图像 [CLOCKWISE] 积木块', // 里面用英文方括号括起来的将替换为积木参数，里面是参数名，与下面属性里的对应
                    arguments: {
                        CLOCKWISE: {
                            type: ArgumentType.IMAGE, // 设置参数类型，是一个显示图片的参数，意思就是把参数的地方替换为一个图片（只显示，不能选择上传）
                            dataURI: blockIconURI // 图片的地址
                        }
                    }
                }
            ]
        };
    }

    /**
     * 示例操作码只返回第一个角色的名称。
     * @returns {string} 项目中第一个角色的名称。
     */
    exampleOpcode () {
        const stage = this.runtime.getTargetForStage();
        return stage ? stage.getName() : 'no stage yet';
    }

    exampleWithInlineImage () { // 不执行什么
        return;
    }

}

module.exports = Scratch3CoreExample;

```

## 第二步：更改扩展图标

你可以使用Scratch的造型编辑器设计你的扩展图标（最后导出），更厉害的可以用`Adobe Illustrator`设计。注意，导出的是svg。

然后你可以按照下面方法把svg转为代码里的data URL：

> * 用记事本打开svg文件，去掉所有换行
> * 然后把这个内容转换为URL编码（就比如说把空格变为`%20`）
> * 最后在这个内容前面加上`data:image/svg+xml,`

然后替换模板中的变量`blockIconURI`的值。

## 第三步：设置插件名称

首先修改插件类的名字。例如：插件叫`高级音频处理`，则英文名是`AudioProcessing`，那么类名就是`Scratch3AudioProcessing`。不要忘记修改导出部分。

然后来到 `getInfo` 属性下，修改`id`属性为刚才的`AudioProcessing`（记住，是示例！不是说必须），修改`name`为`高级音频处理`（这是要显示的，所以不是英文名。并且发给我们后我们会帮您多语言化）。

## 第四步：添加积木

接下来来到`blocks`属性下，我们将要介绍常用方法。

具体写法模板里有，下面给出的是所有的积木类型（使用`BlockType.积木类型`）。

| 属性 | 作用 |
| ----:|:---- |
| BOOLEAN   | 一个返回布尔值的积木 |
| BUTTON | 一个类似于`创建变量`按钮的按钮，需要指定点击时执行的函数，但函数不是在此处定义，因此可以自己另外写一个文件作为按钮处理代码，发给我们时说明即可。 |
| LABEL    | 直接在此处显示一个文字标签。就和显示每个类别名称的那个标签一样 |
| COMMAND    | 只能执行的积木 |
| CONDITIONAL    | 站长看不懂定义文件给的说明：可以运行也可以不运行子分支的专用命令块，无论是否运行了子分支，线程都会继续执行下一个块 |
| EVENT    | 事件积木，就和 事件 类别里的积木一样，不管官方说明里还有：没有实现功能的专用帽块，只有当其他代码发出相应的事件时，此堆栈才会运行 |
| HAT    | 效果和上面一样。不过这三种有啥区别站长到现在还不明白。官方说明：有条件地启动块堆栈的帽块 |
| LOOP    | 一种循环结构，可以让积木变得和 重复执行 一样，不过站长也不熟悉 |
| REPORTER    | 具有返回值的积木 |
| XML    | 高级用法，小白（包括站长）勿用。官方说明是说这可以直接使用`scratch-blocks`的积木XML来定义 |

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

现在已经创建完积木了，需要编写积木点击时执行的代码。除了`BUTTON`类型积木外，大部分积木类型的实际代码都写在扩展的类里。如模板所示，方法名称就是积木的操作码。

不过模板中是通过调用`this.runtime`扩展运行时来获取当前状态的，还有另一种方法：

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

现在我们为了测试，需要把正式版转为临时的测试版。

首先再新建一个文件，然后按照下面格式修改你的代码（扩展名以`Skins`为例）：

```js
(function (Scratch) {
  const BlockType = Scratch.BlockType; // 获取积木类型
  const ArgumentType = Scratch.ArgumentType; // 获取参数类型
  ... // 对Skins扩展类的定义
  Scratch.extensions.register(new Skins());
})(Scratch);
```

注意：这种模式下无法获取扩展运行时，所以说过最好不要用他。

保存后可以在Scratch创世界的在线或离线编辑器上再扩展里面找到`自定义扩展`，选择`文件`选项卡，上传你的测试版代码，点击`加载`即可。

不过由于各种各样的原因，这个测试环境还是不稳定的。如果你真的了解`Scratch`的机制（这很复杂，你需要使用`scratch-gui`，并且修改`scratch-vm`，而里面有`Redux Store`、`React Redux`等一堆刚开始差点搞蒙站长的东西，不好理解），那么你可以尝试将正式版直接在`scratch-vm`中加入内置扩展，然后运行`scratch-gui`以调试。~~不过站长在想：你都会到这一步了，干嘛还把扩展贡献给我？~~
