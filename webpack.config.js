// ENV设置
if (process.env.USING_DEV_SERVER) {
    const DEV_PORT = process.env.DEV_PORT || 8000;
    const PROJECT_SERVER = `http://127.0.0.1:${DEV_PORT}`;
    const ASSET_SERVER = `http://127.0.0.1:${DEV_PORT}`;
    process.env.PROJECT_HOST = PROJECT_SERVER;
    process.env.USER_HOST = `http://127.0.0.1:${DEV_PORT}`;
    process.env.API_HOST = PROJECT_SERVER;
    process.env.ASSET_HOST = `${ASSET_SERVER}/assets`;
    process.env.BACKPACK_HOST = `${PROJECT_SERVER}/backpack`;
    process.env.STATIC_HOST = `${PROJECT_SERVER}/staticServer`;
    process.env.BASE_HOST = 'https://www.scratch-cw.top';
    process.env.PORT = 8001;
    process.env.ROUTING_STYLE = 'wildcard';
    process.env.CLOUDDATA_HOST = 'wss://cloud.scratch-cw.top';
} else if (!(process.env.PROJECT_HOST && process.env.API_HOST)) { // 如果未配置则使用默认
    const PROJECT_SERVER = 'https://projects.scratch-cw.top';
    const ASSET_SERVER = 'https://assets1.scratch-cw.top';
    process.env.PROJECT_HOST = PROJECT_SERVER;
    process.env.USER_HOST = 'https://users.scratch-cw.top';
    process.env.API_HOST = PROJECT_SERVER;
    process.env.ASSET_HOST = `${ASSET_SERVER}/assets`;
    process.env.BACKPACK_HOST = `${PROJECT_SERVER}/backpack`;
    process.env.STATIC_HOST = `${PROJECT_SERVER}/staticServer`;
    process.env.BASE_HOST = 'https://www.scratch-cw.top';
    process.env.PORT = 8001;
    process.env.ROUTING_STYLE = 'wildcard';
    process.env.CLOUDDATA_HOST = 'wss://cloud.scratch-cw.top';
}

const DEFAULT_RSK = '6Lf6kK4UAAAAABKTyvdSqgcSVASEnMrCquiAkjVW';

const defaults = require('lodash.defaults');
const gitsha = require('git-bundle-sha');
const path = require('path');
const webpack = require('webpack');

// Plugins
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const CopyWebpackPlugin = require('copy-webpack-plugin');
const EmitFilePlugin = require('emit-file-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');

const ProgressBarPlugin = require('progress-bar-webpack-plugin');

// PostCss
const autoprefixer = require('autoprefixer');

/** @type {Array} */
let routes = require('./src/routes.json');
const templateConfig = require('./src/template-config.js');

if (process.env.NODE_ENV !== 'production') {
    routes = routes.concat(require('./src/routes-dev.json')); // eslint-disable-line global-require
}

routes = routes.filter(route => !process.env.VIEW || process.env.VIEW === route.view);

const pageRoutes = routes.filter(route => !route.redirect);

/**
 * Retrieve a version ID string for the current build, to be emitted into `version.txt`.
 * @returns {Promise<string>} A promise that resolves to a version ID string.
 */
const getVersionId = () => {
    if (process.env.WWW_VERSION) {
        return Promise.resolve(process.env.WWW_VERSION);
    }
    return new Promise((resolve, reject) => {
        gitsha({length: 5}, (err, sha) => {
            if (err) {
                reject(err);
            } else {
                resolve(sha);
            }
        });
    });
};

// Prepare all entry points
const entry = {
    
};

pageRoutes.forEach(route => {
    entry[route.name] = [
        './src/init.js',
        `./src/views/${route.view}.jsx`
    ];
});

// HtmlWebpackPlugin v4 removed 'chunks' info that we need for our custom template.
// This plugin is a quick-and-dirty partial implementation of that information.
// Adapted from https://github.com/jantimon/html-webpack-plugin/issues/1369#issuecomment-1049968234
// Thanks, @daniel-nagy!
class HtmlWebpackBackwardsCompatibilityPlugin {
    apply (compiler) {
        compiler
            .hooks
            .compilation
            .tap('HtmlWebpackBackwardsCompatibilityPlugin', compilation => {
                HtmlWebpackPlugin
                    .getHooks(compilation)
                    .beforeAssetTagGeneration
                    .tapAsync(
                        'HtmlWebpackBackwardsCompatibilityPlugin',
                        (data, callback) => {
                            const {publicPath} = data.assets;
                            const chunks = {};

                            for (const entryPoint of compilation.entrypoints.values()) {
                                for (const chunk of entryPoint.chunks) {
                                    const files = Array.from(chunk.files); // convert from Set
                                    chunks[chunk.name] = {
                                        entry: publicPath + files.find(file => file.endsWith('.js')),
                                        css: files
                                            .filter(file => file.endsWith('.css'))
                                            .map(file => publicPath + file)
                                    };
                                }
                            }

                            data.assets.chunks = chunks;

                            callback(null, data);
                        }
                    );
            });
    }
}

let contentHash = '';
if (process.env.NODE_ENV === 'production') {
    contentHash = '.[contenthash]';
}

// Config
module.exports = [{
    entry: entry,
    devtool: process.env.NODE_ENV === 'production' ? false : 'eval',
    mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: `js/[name].bundle${contentHash}.js`,
        publicPath: '/'
    },
    externals: { // 配置一下包使用cdn载入
        'jszip': 'JSZip',
        'highlight.js': 'hljs'
    },
    resolve: {
        fallback: {
            // Node modules are no longer polyfilled by default in Webpack 5, so we need to add these here
            buffer: require.resolve('buffer/'),
            stream: require.resolve('stream-browserify') // jszip
            // "scratch-gui": require.resolve('scratch-gui/dist/scratch-gui.js') // scratch-gui
        },
        symlinks: false // Fix local development with `npm link` packages
    },
    module: {
        rules: [
            {
                test: /\.(?:js|mjs|cjs)x?$/,
                loader: 'babel-loader',
                include: [
                    path.resolve(__dirname, 'src'),
                    /node_modules[\\/]scratch-[^\\/]+[\\/]src/,
                    /node_modules[\\/]pify/,
                    /node_modules[\\/]async/
                ]
            },
            {
                test: /\.(js|jsx)$/,
                include: [
                    /node_modules[\\/]edge-tts/
                ],
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env', '@babel/preset-react']
                    }
                }
            },
            {
                test: /\.(?:scss|css)$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader',
                        options: {
                            url: false
                        }
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            postcssOptions: {
                                plugins: function () {
                                    return [autoprefixer()];
                                }
                            }
                        }
                    },
                    'sass-loader'
                ]
            },
            {
                test: /\.(png|jpg|gif|eot|svg|ttf|woff|md)$/,
                loader: 'url-loader'
            }
        ],
        noParse: /node_modules\/google-libphonenumber\/dist/
    },
    optimization: {
        splitChunks: {
            cacheGroups: {
                common: {
                    chunks: 'all',
                    name: 'common',
                    minSize: 1024,
                    minChunks: pageRoutes.length // Extract only chunks common to all html pages
                },
                formatjs: {
                    test: /[\\/]node_modules[\\/](@formatjs)[\\/]/,
                    name: 'formatjs',
                    chunks: 'all'
                },
                scratch: {
                    test: /[\\/]node_modules[\\/](scratch-gui)[\\/]/,
                    name: 'scratch',
                    chunks: 'all',
                    enforce: true
                },
                // 把 scratch-cw-verify 单独打包成一个 chunk
                verifyChunk: {
                    name: 'verifyChunk',
                    test: /[\\/]node_modules[\\/]scratch-cw-verify[\\/]/,
                    chunks: 'all',
                    priority: 10, // 高优先级
                    enforce: true // 强制打包
                }
            }
        },
        minimizer: [
            new TerserPlugin({
                parallel: 4,
                terserOptions: {
                    compress: {
                        drop_debugger: true,
                        passes: 3, // 增加压缩次数，给我狠狠的压缩！
                        reduce_vars: true, // 优化变量
                        dead_code: true, // 移除死代码
                        conditionals: true,
                        evaluate: true,
                        booleans: true,
                        unused: true,
                        if_return: true,
                        join_vars: true,
                        pure_getters: true
                    },
                    mangle: true,
                    output: {
                        comments: false // 移除注释
                    }
                },
                extractComments: false
            })

        ]
    },
    plugins: [
        process.env.USING_MIDDLEWARE && new ProgressBarPlugin(),
        new MiniCssExtractPlugin({
            filename: `[name]${contentHash}.css`
        }),
        new HtmlWebpackBackwardsCompatibilityPlugin(),
        new EmitFilePlugin({
            filename: 'version.txt',
            content: getVersionId
        }),
        new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer']
        })
    ].concat(pageRoutes
        .map(route => new HtmlWebpackPlugin(defaults({}, {
            title: route.title,
            filename: `${route.name}${contentHash}.html`,
            route: route,
            dynamicMetaTags: (false && route.dynamicMetaTags),
            isProject: route.name === 'projects' || route.name === 'embed' || route.name === 'addons'
        }, templateConfig)))
    ).concat([
        new CopyWebpackPlugin({
            patterns: [
                {from: 'static'},
                {
                    from: 'intl',
                    to: `js/[path][name]${contentHash}.js`
                },
                {
                    from: 'node_modules/izitoast/dist/css/',
                    to: 'css'
                },
                {
                    from: 'node_modules/scratch-gui/dist/static/blocks-media',
                    to: 'static/blocks-media'
                },
                {
                    from: 'node_modules/scratch-gui/dist/chunks',
                    to: 'static/chunks'
                },
                {
                    from: 'node_modules/scratch-gui/dist/extension-worker.js',
                    to: `extension-worker${contentHash}.js`
                },
                {
                    from: 'node_modules/scratch-gui/dist/extension-worker.js.map'
                },
                {
                    from: 'node_modules/scratch-gui/dist/static/assets',
                    to: 'static/assets'
                },
                {
                    from: 'node_modules/scratch-gui/dist/*.hex',
                    to: 'static',
                    flatten: true
                },
                {
                    from: 'node_modules/scratch-gui/dist/chunks/*.js',
                    to: `scratch-gui-chunks/[name]${contentHash}.js`
                }
            ]
        }),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': `"${process.env.NODE_ENV || 'development'}"`,
            'process.env.API_HOST': `"${process.env.API_HOST || 'https://api.scratch.mit.edu'}"`,
            'process.env.RECAPTCHA_SITE_KEY': `"${process.env.RECAPTCHA_SITE_KEY || DEFAULT_RSK}"`,
            'process.env.ASSET_HOST': `"${process.env.ASSET_HOST || 'https://assets.scratch.mit.edu'}"`,
            'process.env.BACKPACK_HOST': `"${process.env.BACKPACK_HOST || 'https://backpack.scratch.mit.edu'}"`,
            'process.env.CLOUDDATA_HOST': `"${process.env.CLOUDDATA_HOST || 'clouddata.scratch.mit.edu'}"`,
            'process.env.PROJECT_HOST': `"${process.env.PROJECT_HOST || 'https://projects.scratch.mit.edu'}"`,
            'process.env.USER_HOST': `"${process.env.USER_HOST || 'https://users.scratch-cw.top'}"`,
            'process.env.STATIC_HOST': `"${process.env.STATIC_HOST || 'https://uploads.scratch.mit.edu'}"`,
            'process.env.SCRATCH_ENV': `"${process.env.SCRATCH_ENV || 'development'}"`,
            'process.env.BASE_HOST': `"${process.env.BASE_HOST}"`,
            'process.env.ROUTING_STYLE': JSON.stringify(process.env.ROUTING_STYLE || 'filehash')
        })
    ])
        .concat(process.env.ANALYZE_BUNDLE === 'true' ? [
            new BundleAnalyzerPlugin()
        ] : [])
}];
