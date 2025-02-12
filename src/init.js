import 'regenerator-runtime/runtime'; // Needed for async/await
const jar = require('./lib/jar');

/**
 * -----------------------------------------------------------------------------
 * L10N
 * -----------------------------------------------------------------------------
 */
(() => {
    /*
     * Bind locale code from cookie if available. Uses navigator language API as a fallback.
     *
     * @return {string}
     */
    const updateLocale = () => {
        let obj = jar.get('scratchlanguage');
        if (typeof obj === 'undefined') {
            obj = window.navigator.userLanguage || window.navigator.language;
            if (['pt', 'pt-pt', 'PT', 'PT-PT'].indexOf(obj) !== -1) {
                obj = 'pt-br'; // default Portuguese users to Brazilian Portuguese due to our user base. Added in 2.2.5.
            }
        } else {
            // delete the old cookie (just hostname) by setting it to null and expiring in the past
            /* eslint-disable max-len */
            document.cookie = `scratchlanguage=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
            /* eslint-enable max-len */
            // create the new cookie
            let opts = {};
            if (window.location.hostname !== 'localhost') {
                opts = {domain: `.${window.location.hostname}`};
            }
            jar.set('scratchlanguage', obj, opts);
        }
        return obj;
    };

    window._locale = updateLocale();
    document.documentElement.lang = window._locale;
})();

/**
 * -----------------------------------------------------------------------------
 * Console warning
 * -----------------------------------------------------------------------------
 */
(() => {
    window.onload = function () {
        /* eslint-disable no-console */
        console.log('%c停止你的操作！', 'color: #F00; font-size: 30px; -webkit-text-stroke: 1px black; font-weight:bold');
        console.log(
            '这是专为开发人员设计的浏览器的一部分。' +
            '如果有人（当然，站长除外，注意：站长唯一邮箱号是916881890@qq.com，其他来源请勿相信！）让你在这里复制粘贴一些东西， ' +
            '不要这么做！这可能会让他们接管你的Scratch创世界的帐户， ' +
            '删除你的所有项目， 或者做许多其他有害的事情。 ' +
            '如果你不明白你在这里到底在做什么，你应该什么都不做就关闭这个窗口。 '
        );
        /* eslint-enable no-console */
    };
})();

// 检验依赖是否加载完毕
if (!window.JSZip || !window.hljs) {
    throw new Error('JSZip or hljs not loaded');
}

SplashEnd(); // 如果没有错误则取消显示正在加载

