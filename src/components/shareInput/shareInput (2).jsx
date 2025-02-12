const React = require('react');
const EdgeTTS = require('edge-tts'); // 自己开发的库，用于语音转文字
const Swal = require('sweetalert2');

const tipText = `请注意阅读下面内容！当文字朗读完毕后，将会继续。

如果您要分享您的作品，就意味着你要让在这个社区的所有人都能看到你的作品。如果你的在作品只是半成品或处于调试情况，最好不要分享。

如果你要分享你的作品，你首先要知道以下几点：

1.你要填写一个恰当的标题，方便别人找到你的作品，并能一眼看出大体内容。请不要使用默认标题！

2.你要填写操作说明，方便别人了解你的作品的使用方式。此项必填！

3.你可以填写备注与鸣谢，在你的作品为转载或改编时，你需要在此填写作品改编自的位置；如果你项目中的某些素材来自别人，请在此处提供下载链接。如果作品完全原创，可以不填。

注意：

1.改编的作品请在备注与鸣谢中表明出处地址！不标注只说明为改编，则审核会被驳回。

2.操作说明和备注与鸣谢中可以使用Markdown语言展示图片，修改字体等

3.操作说明和标题必填，备注与鸣谢选填

4.如果你的作品是一系列的，或者是有关键词，可以在标题后面通过#加名称来辅助搜索。

如："小学生的日常生活"系列作品，则每个作品标题可以这样命名：
"开学 #小学生的日常生活"
"其中考试 #小学生的日常生活"
这样用户只要搜索"小学生的日常生活"，就能搜索到该系列的作品。
或者你希望你的作品可以通过简单的关键词搜索到，也可以使用该方法：
如你希望用户通过搜索"音乐"、"八位音乐"、"音乐播放器"搜索到你的作品，你的作品标题可以如下：
"This day aria [NES Music Tracker Visualization] #音乐 #八位音乐 #音乐播放器"

以上是关于分享作品的所有提示。`;

const inputProjectInformation = (base, callback) => {
    // 第一步：弹出没有按钮且不能关闭的窗口，显示初始文字
    Swal.fire({
        title: '分享作品必知',
        text: tipText,
        showConfirmButton: false,
        allowOutsideClick: false,
        didOpen: async () => {
            const edge_tts = new EdgeTTS(tipText);
            // 代码编写地方！！！！
        }
    }).then(() => {
        // 异步函数执行完毕后，切换内容并给出输入框
        return Swal.fire({
            title: '请输入信息',
            html: `
                    <input id="input1" type="text" class="swal2-input" placeholder="请输入内容1">
                    <input id="input2" type="text" class="swal2-input" placeholder="请输入内容2">
                `,
            showCancelButton: false,
            showConfirmButton: true,
            confirmButtonText: '确定',
            focusConfirm: true
        });
    }).then((result) => {
        if (result.isConfirmed) {
            // 获取输入框内容并进行检测
            const input1Value = document.getElementById('input1').value;
            const input2Value = document.getElementById('input2').value;

            if (!input1Value || !input2Value) {
                return Swal.fire({
                    title: '错误',
                    text: '请填写完整所有输入框内容！',
                    icon: 'error'
                });
            }

            // 这里可以进行更多关于输入内容的处理，比如发送到服务器等

            // 如果输入内容检测通过，关闭窗口
            Swal.close();
        }
    });
};

module.exports.inputProjectInformation = inputProjectInformation;
