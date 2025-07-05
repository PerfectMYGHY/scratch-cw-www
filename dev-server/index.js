// ENV设置
// process.env.PROJECT_HOST = "http://192.168.8.104:8006";
// process.env.API_HOST = "http://192.168.8.104:8006";
// process.env.ASSET_HOST = "http://192.168.8.104:8006/assets";
// process.env.BACKPACK_HOST = "http://192.168.8.104:8006/backpack";
// process.env.STATIC_HOST = "http://192.168.8.104:8006/staticServer";
// process.env.BASE_HOST = "http://192.168.8.104:8001";
// process.env.PORT = 8001;
// process.env.ROUTING_STYLE = "wildcard";
// process.env.CLOUDDATA_HOST = "ws://192.168.8.104:8765";
// process.env.USING_MIDDLEWARE = true;

// process.env.VIEW = "preview/preview";
const PROJECT_SERVER = 'https://scratch-cw.top:8006';
// const PROJECT_SERVER = 'http://127.0.0.1:8006';
process.env.PROJECT_HOST = PROJECT_SERVER;
process.env.API_HOST = PROJECT_SERVER;
process.env.ASSET_HOST = `${PROJECT_SERVER}/assets`;
process.env.BACKPACK_HOST = `${PROJECT_SERVER}/backpack`;
process.env.STATIC_HOST = `${PROJECT_SERVER}/staticServer`;
process.env.BASE_HOST = 'https://www.scratch-cw.top';
process.env.PORT = 8001;
process.env.ROUTING_STYLE = 'wildcard';
process.env.CLOUDDATA_HOST = 'wss://scratch-cw.top:8765';
process.env.USING_MIDDLEWARE = true;

const express = require('express');
const proxy = require('express-http-proxy');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpack = require('webpack');

const compiler = webpack(require('../webpack.config.js'));
const handler = require('./handler');
const log = require('./log');
const fs = require('fs');
const files = fs.readdirSync('static/scratch-gui-chunks');
var i = 0;
process.stdout.write('正在配置规则...\n');
const routes = require('../src/routes.json').concat(require('../src/routes-dev.json'))
    .filter(route => !process.env.VIEW || process.env.VIEW === route.view)
    .concat(files.map(file => {
        process.stdout.write(`\r进度：[${'='.repeat(Math.round(((i + 1) / (files.length * 3) * 50)))}${' '.repeat(Math.round((1 - (i + 1) / (files.length * 3)) * 50))}]    `);
        i++;
        return {
            name: 'chunks-loader',
            pattern: `^/projects/\\d+/chunks/${file}?(\\\\?.*)?$`,
            routeAlias: `/projects/\\d+/chunks/${file}?$`,
            redirect: `/scratch-gui-chunks/${file}`
        };
    }))
    .concat(files.map(file => {
        process.stdout.write(`\r进度：[${'='.repeat(Math.round(((i + 1) / (files.length * 3) * 50)))}${' '.repeat(Math.round((1 - (i + 1) / (files.length * 3)) * 50))}]    `);
        i++;
        return {
            name: 'chunks-loader',
            pattern: `^/projects/\\d+/editor/chunks/${file}?(\\\\?.*)?$`,
            routeAlias: `/projects/\\d+/editor/chunks/${file}?$`,
            redirect: `/scratch-gui-chunks/${file}`
        };
    }))
    .concat(files.map(file => {
        process.stdout.write(`\r进度：[${'='.repeat(Math.round(((i + 1) / (files.length * 3) * 50)))}${' '.repeat(Math.round((1 - (i + 1) / (files.length * 3)) * 50))}]    `);
        i++;
        return {
            name: 'chunks-loader',
            pattern: `^/projects/editor/chunks/${file}?(\\\\?.*)?$`,
            routeAlias: `/projects/editor/chunks/${file}?$`,
            redirect: `/scratch-gui-chunks/${file}`
        };
    }));
process.stdout.write('\n');

// Create server
const app = express();
app.disable('x-powered-by');

// Server setup
app.use(log());

// Bind routes
process.stdout.write('正在配置分发URL...\n');
var i = 0;
routes.forEach(route => {
    process.stdout.write(`\r进度：[${'='.repeat(Math.round(((i + 1) / Object.keys(routes).length * 50)))}${' '.repeat(Math.round((1 - (i + 1) / Object.keys(routes).length) * 50))}]    `);
    i++;
    app.get(route.pattern, handler(route));
});
process.stdout.write('\n');

const middlewareOptions = {
    // progress: true
};

app.use(webpackDevMiddleware(compiler, middlewareOptions));

const proxyHost = process.env.FALLBACK || '';
if (proxyHost !== '') {
    // Fall back to scratchr2 in development
    // This proxy middleware must come last
    app.use('/', proxy(proxyHost));
}

// Start listening
const port = process.env.PORT || 8333;
app.listen(port, () => {
    process.stdout.write(`Server listening on port ${port}\n`);
    if (proxyHost) {
        process.stdout.write(`Proxy host: ${proxyHost}\n`);
    }
});
