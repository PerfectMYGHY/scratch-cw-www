/**
 * Default options for the html-webpack-plugin HTML renderer
 *
 * See https://github.com/ampedandwired/html-webpack-plugin#configuration
 * for possible options. Any other options will be available to the template
 * under `htmlWebpackPlugin.options`
 */

module.exports = {
    // html-webpack-plugin options
    template: './src/template.ejs',
    inject: false,

    // Search and metadata
    title: '想象、编程、分享',
    description:
        'Scratch创世界是一个免费的编程语言和在线社区，' +
        '在那里你可以创建自己的互动故事、游戏' +
        '以及动画。',

    // override if mobile-friendly
    viewportWidth: 'device-width',

    // Open graph
    og_image: 'https://www.scratch-cw.top/images/scratch-og.png',
    og_image_type: 'image/png',
    og_image_width: 986,
    og_image_height: 860,

    // Analytics & Monitoring
    // ----------------------

    // Google Tag Manager ID
    // Looks like 'GTM-XXXXXXX'
    gtm_id: process.env.GTM_ID || '',

    // Google Tag Manager env & auth info for alterative GTM environments
    // Looks like '&gtm_auth=0123456789abcdefghijklm&gtm_preview=env-00&gtm_cookies_win=x'
    // Taken from the middle of: GTM -> Admin -> Environments -> (environment) -> Get Snippet
    // Blank for production
    gtm_env_auth: process.env.GTM_ENV_AUTH || '',
    // 使用cdn加载
    //inject: 'body', // 或者 'head'，根据需要将CDN脚本插入到<body>或<head>标签中
    //cdn: {
    //    js: [
    //        'https://cdnjs.cloudflare.com/ajax/libs/react/17.0.2/umd/react.production.min.js',
    //        'https://cdnjs.cloudflare.com/ajax/libs/react-dom/17.0.2/umd/react-dom.production.min.js',
    //        'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.6.0/jszip.min.js'
    //    ]
    //}
};
