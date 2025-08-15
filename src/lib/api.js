const defaults = require('lodash.defaults');
const xhr = require('xhr');

const jar = require('./jar');
const log = require('./log');
const urlParams = require('./url-params');

const Cookies = require('js-cookie');

const CHARS = "abcdefghijklmnopqrstuvwxyz0123456789";

function bytesSum(hexStr) {
  const bytes = new Uint8Array(hexStr.match(/../g).map(h => parseInt(h, 16)));
  return Array.from(bytes).reduce((sum, b) => sum + b, 0);
}

function caesarEncrypt(text, shift) {
  return text.split('').map(c => {
    const idx = CHARS.indexOf(c);
    const newIdx = (idx + shift) % 36;
    return CHARS[newIdx];
  }).join('');
}

const verify = async (opts) => {
    // 1. 获取验证Cookie
    await fetch(`${new URL(opts.uri).origin}/api/verify/`, {
        credentials: 'include'
    }).then(res => res.json());
  
    // 2. 读取Cookie并计算
    const verifyCode = Cookies.get('verify-code'); // 请求完verify后将产生此Cookie。
    const byteSum = bytesSum(verifyCode);
    const secretKey = (byteSum % 102456 * 76332) % 78093;
    const encrypted = caesarEncrypt(verifyCode, secretKey);

    // 3. 获取CSRF Token
    return await fetch(`${new URL(opts.uri).origin}/api/csrf_token/?verifycode=${encrypted}`, {
            credentials: 'include'
        }).then(res => res.json());
};

/**
 * Helper method that constructs requests to the scratch api.
 * Custom arguments:
 *     - useCsrf [boolean] – handles unique csrf token retrieval for POST requests. This prevents
 *       CSRF forgeries (see: https://www.squarefree.com/securitytips/web-developers.html#CSRF)
 *
 * It also takes in other arguments specified in the xhr library spec.
 *
 * @param  {object}   opts     optional xhr args (see above)
 * @param  {Function} callback [description]
 */
module.exports = (opts, callback) => {
    defaults(opts, {
        host: process.env.API_HOST,
        headers: {},
        responseType: 'json',
        useCsrf: false,
        withCredentials: true
    });

    if (opts.host === '') {
        defaults(opts.headers, {
            'X-Requested-With': 'XMLHttpRequest'
        });
    }

    opts.uri = opts.host + opts.uri;

    if (opts.params) {
        opts.uri = [opts.uri, urlParams(opts.params)]
            .join(opts.uri.indexOf('?') === -1 ? '?' : '&');
    }

    if (opts.formData) {
        opts.body = urlParams(opts.formData);
        opts.headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }

    const apiRequest = options => {
        if (options.host !== '') {
            if ('withCredentials' in new XMLHttpRequest()) {
                options.useXDR = false;
            } else {
                // For IE < 10, we must use XDR for cross-domain requests. XDR does not support
                // custom headers.
                options.useXDR = true;
                delete options.headers;
                if (options.authentication) {
                    const authenticationParams = [`x-token=${options.authentication}`];
                    const parts = options.uri.split('?');
                    const qs = (parts[1] || '')
                        .split('&')
                        .concat(authenticationParams)
                        .join('&');
                    options.uri = `${parts[0]}?${qs}`;
                }
            }
        }
        xhr(options, (err, res, body) => {
            if (err) log.error(err);
            if (options.responseType === 'json' && typeof body === 'string') {
                // IE doesn't parse responses as JSON without the json attribute,
                // even with responseType: 'json'.
                // See https://github.com/Raynos/xhr/issues/123
                try {
                    body = JSON.parse(body);
                } catch (e) {
                    // Not parseable anyway, don't worry about it
                }
            }
            // Legacy API responses come as lists, and indicate to redirect the client like
            // [{success: true, redirect: "/location/to/redirect"}]
            try {
                if ('redirect' in body[0]) window.location = body[0].redirect;
            } catch (e) {
                // do nothing
            }
            callback(err, body, res);
        });
    };

    if (typeof jar.get('scratchlanguage') !== 'undefined') {
        opts.headers['Accept-Language'] = `${jar.get('scratchlanguage')}, en;q=0.8`;
    }
    if (opts.useCsrf) {
        verify(opts).then(data => {
            opts.headers['X-CSRFToken'] = data.csrf_token;
            apiRequest(opts);
        }).catch(err => {
            log.error('Error while retrieving CSRF token', err);
            apiRequest(opts);
        });
    } else {
        apiRequest(opts);
    }
};
