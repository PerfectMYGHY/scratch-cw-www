// 引入React以使用组件及其功能
const React = require('react');
const ReactDOM = require('react-dom');
// 从scratch-gui引入 导出的Scratch Addons 设置组件和 导出设置 函数
const ScratchGUI = require("scratch-gui");
const LoadSettings = ScratchGUI.LoadSettings;
const onExportSettings = ScratchGUI.onExportSettings;
// 加载Settings组件（函数返回的是一个require的结果）
const Settings = LoadSettings().default;
// 为了防止插件设置页面的样式与Scratch编辑器的冲突，我们不能在编辑器页面中也加载组件（同时加载样式），而是在该页面加载组件。

// 渲染组件至页面
ReactDOM.render((
    <Settings
        onExportSettings={onExportSettings}
    />
), document.getElementById('app'));

// 停止显示加载界面
//if (window.SplashEnd) {
//    window.SplashEnd();
//}
