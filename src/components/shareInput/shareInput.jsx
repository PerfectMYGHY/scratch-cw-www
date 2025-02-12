const React = require('react');
const EdgeTTS = require('edge-tts').default; // 自己开发的库，用于语音转文字
const Swal = require('sweetalert2');

require('./shareInput.scss');

const tipText = `请注意阅读下面内容！
如果您要分享您的作品，就意味着你要让在这个社区的所有人都能看到你的作品。如果你的作品只是半成品或处于调试情况，最好不要分享。
如果你要分享你的作品，你首先要知道以下几点：
1.你要填写一个恰当的标题，方便别人找到你的作品，最好能让用户一眼看出大体内容。
2.你要填写操作说明，方便别人了解你的作品的使用方式。此项必填！
3.你可以填写备注与鸣谢，在你的作品为改编或改编时，你需要在此填写作品改编自的位置；如果你项目中的某些素材来自别人，请在此处提供下载链接。如果作品完全原创，可以不填。
注意：
1.改编的作品请在备注与鸣谢中表明出处地址！不标注出处而只说明为改编，则审核会被驳回。
2.操作说明和备注与鸣谢中可以使用Markdown语言展示图片，修改字体等
3.操作说明和标题必填，备注与鸣谢选填
4.如果你的作品是一系列的，或者是有关键词，可以在第标题后面通过#加名称来辅助搜索。
如："小学生的日常生活"系列作品，则每个作品标题可以这样命名：
"开学 #小学生的日常生活"
"期中考试 #小学生的日常生活"
这样用户只要搜索"小学生的日常生活"，就能搜索到该系列的作品。
或者你希望你的作品可以通过简单的关键词搜索到，也可以使用该方法：
如你希望用户通过搜索"音乐"、"八位音乐"、"音乐播放器"搜索到你的作品，你的作品标题可以如下：
"This day aria [NES Music Tracker Visualization] #音乐 #八位音乐 #音乐播放器"
以上是关于分享作品的所有提示。`;

function mergeArrayBuffersWithDataView(li) {
    let totalLength = 0;
    for (let i = 0; i < li.length; i++) {
        totalLength += li[i].byteLength;
    }
    let merged = new ArrayBuffer(totalLength);
    let offset = 0;
    let dataView = new DataView(merged);
    for (let i = 0; i < li.length; i++) {
        let bufferView = new DataView(li[i]);
        for (let j = 0; j < bufferView.byteLength; j++) {
            dataView.setUint8(offset + j, bufferView.getUint8(j));
        }
        offset += li[i].byteLength;
    }
    return merged;
}

const inputProjectInformation = (base, callback) => {
    // 创建一个audio标签
    const audio = document.createElement("audio");
    // 标记是否结束
    let stopped = false;
    // 第一步：弹出没有按钮且不能关闭的窗口，显示初始文字
    Swal.fire({
        title: '分享作品必知',
        html: '<div class="custom-swal-content">' + tipText.split('\n').join('<br>') + '</div>',
        showConfirmButton: true,
        //allowOutsideClick: true,
        showCancelButton: true,
        cancelButtonText: '关闭',
        customClass: {
            popup: 'custom-swal-popup',
        },
        didOpen: async () => {
            // EdgeTTS文字转语音对象
            const edge_tts = new EdgeTTS(tipText);
            // 用于提示子线程是否结束加载的标志
            const confirmButton = Swal.getConfirmButton();

            // 创建下一步按钮对象，并设置初始状态为禁用
            const nextButton = {
                text: '下一步（5秒后可用）',
                disabled: true,
                visible: true,
                click: async () => {
                    // 若子线程在加载音频，则标记使其停止
                    stop = true;
                    // 停止播放音频
                    audio.pause();
                    audio.src = '';
                    // 实际关闭连接使用方法
                    edge_tts.websocket.close();
                    // 跳转到第二个窗口
                    return Swal.fire({
                        title: '警告！',
                        text: `当你点击确定后，将会分享作品；点击取消则取消。分享后请尽快填写标题、操作说明和备注与鸣谢！`,
                        showCancelButton: true,
                        showConfirmButton: true,
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        focusConfirm: true
                    }).then((result) => {
                        if (result.isConfirmed) {
                            callback();
                        }
                    });
                }
            };

            // 设置一个定时器，5秒后启用下一步按钮，并更新按钮文本显示剩余秒数
            let remainingSeconds = 10;
            confirmButton.innerHTML = '下一步（正在加载...）';
            confirmButton.disabled = true;

            let [data, WordBoundary] = [[], []];
            try {
                [data, WordBoundary] = await edge_tts.send();
            } catch (e) {
                return Swal.fire({
                    title: '发生了错误！',
                    text: `加载音频数据时发生了错误！请将下面信息反馈给管理人员：\n错误信息：${e}`,
                    //showCancelButton: true,
                    showConfirmButton: true,
                    confirmButtonText: '确定',
                    //cancelButtonText: '取消',
                    focusConfirm: true
                })
            }
            const blob = new Blob(data);
            const url = URL.createObjectURL(blob);
            audio.src = url;
            if (!stopped) {
                audio.play();

                // 启动定时器
                confirmButton.innerHTML = nextButton.text;
                confirmButton.onclick = nextButton.click;
                const timer = setInterval(() => {
                    remainingSeconds--;
                    if (remainingSeconds === 0) {
                        clearInterval(timer);
                        confirmButton.disabled = false;
                        confirmButton.innerHTML = '下一步';
                    } else {
                        confirmButton.innerHTML = `下一步（${remainingSeconds}秒后可用）`;
                    }
                }, 1000);
            }
        }
    }).then(() => {
        audio.pause();
        stopped = true;
    });
};

module.exports.inputProjectInformation = inputProjectInformation;