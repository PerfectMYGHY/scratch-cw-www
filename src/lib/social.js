module.exports = {};

module.exports.projectUrl = projectId => {
    if (projectId) {
        return `${process.env.BASE_HOST}/projects/${projectId}`;
    }
    return '';
};

module.exports.embedHtml = projectId => {
    if (projectId) {
        return `<iframe src="${process.env.BASE_HOST}/projects/${projectId}/embed" ` +
            'allowtransparency="true" width="485" height="402" ' +
            'frameborder="0" scrolling="no" allowfullscreen></iframe>';
    }
    return '';
};

module.exports.embedFullscreenHtml = projectId => {
    if (projectId) {
        return {
            css: '<style>\n' +
                '    .body-on-full-screen {\n' +
                '        overflow: hidden;\n' +
                '    }\n' +
                '    .wrapper-on-full-screen {\n' +
                '        position: fixed;\n' +
                '        top: 0;\n' +
                '        left: 0;\n' +
                '        width: 100%;\n' +
                '        height: 100%;\n' +
                '    }\n' +
                '    .iframe-on-full-screen {\n' +
                '        width: 100%;\n' +
                '        height: 100%;\n' +
                '    }\n' +
                '</style>',
            body: '<div id="showerwrapper">\n' +
                `<iframe src="${process.env.BASE_HOST}/projects/${projectId}/embed" ` +
                'allowtransparency="true" width="485" height="402" ' +
                'frameborder="0" scrolling="no" allowfullscreen></iframe>' +
                '</div>',
            javascript: '<script>\n' +
                        '    const hideScrollWhenFullScreen = true; // 修改为false可以在全屏时显示页面总的滚动条，为true反之。\n' +
                        '    window.addEventListener("message", (event) => {\n' +
                        '        const iframe = document.querySelector("iframe#shower");\n' +
                        '        const wrapper = document.querySelector("div#showerwrapper");\n' +
                        '        if (event.data === "ScratchEmbedSetFullScreen") {\n' +
                        '            if (wrapper && iframe) {\n' +
                        '                if (hideScrollWhenFullScreen)\n' +
                        '                    document.body.classList.add("body-on-full-screen"); // 添加 CSS 类\n' +
                        '                wrapper.classList.add("wrapper-on-full-screen"); // 添加 CSS 类\n' +
                        '                iframe.classList.add("iframe-on-full-screen"); // 添加 CSS 类\n' +
                        '            }\n' +
                        '        } else if (event.data === "ScratchEmbedSetExitFullScreen") {\n' +
                        '            if (wrapper && iframe) {\n' +
                        '                if (hideScrollWhenFullScreen)\n' +
                        '                    document.body.classList.remove("body-on-full-screen"); // 移除 CSS 类\n' +
                        '                wrapper.classList.remove("wrapper-on-full-screen"); // 移除 CSS 类\n' +
                        '                iframe.classList.remove("iframe-on-full-screen"); // 移除 CSS 类\n' +
                        '            }\n' +
                        '        }\n' +
                        '    });\n' +
                        '</script>'
        };
    }
    return {
        css: '',
        body: '',
        javascript: ''
    };
};
