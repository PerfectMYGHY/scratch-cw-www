const React = require('react');

require("./Loading.scss");

const Loading = (props) => {
    setTimeout(() => {
        (function () {
            'use strict';

            var theme = '';
            var accent = '#ff4c4c';

            try {
                var themeSetting = localStorage.getItem('tw:theme');
            } catch (e) {
                // ignore
            }
            if (themeSetting === 'light') {
                theme = 'light';
            } else if (themeSetting === 'dark') {
                theme = 'dark';
            } else if (themeSetting) {
                try {
                    var parsed = JSON.parse(themeSetting);
                    if (parsed.accent === 'purple') {
                        accent = '#855cd6';
                    } else if (parsed.accent === 'blue') {
                        accent = '#4c97ff';
                    }
                    if (parsed.gui === 'dark' || parsed.gui === 'light') {
                        theme = parsed.gui;
                    }
                } catch (e) {
                    // ignore
                }
            }

            if (!theme) {
                theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            }

            var splash = document.querySelector('.spash-waiting-for-js');
            splash.setAttribute('data-theme', theme);
            if (theme !== 'dark') {
                splash.style.backgroundColor = accent;
                splash.style.color = 'white';
            }
            splash.hidden = false;

            var splashErrorTitle = document.querySelector('.splash-error-title');
            var splashError = document.querySelector('.splash-errors');
            var splashReset = document.querySelector('.splash-reset');

            var totalErrors = 0;
            window.onerror = function (event, source, line, col, err) {
                if (++totalErrors > 5) return; // dont bother logging more
                splashErrorTitle.hidden = splashError.hidden = splashReset.hidden = false;
                var el = document.createElement('div');
                el.textContent = 'Error (splash) in ' + source + ' (' + line + ':' + col + '): ' + err;
                splashError.appendChild(el);
            };

            splashReset.onclick = function () {
                splashReset.disabled = true;
                function hardRefresh() {
                    var search = location.search.replace(/[?&]nocache=\d+/, '');
                    location.replace(location.pathname + search + (search ? '&' : '?') + 'nocache=' + Math.floor(Math.random() * 100000));
                }
                if ('serviceWorker' in navigator) {
                    setTimeout(hardRefresh, 5000);
                    navigator.serviceWorker.getRegistration("")
                        .then(function (registration) {
                            if (registration) {
                                return registration.unregister();
                            }
                        })
                        .then(hardRefresh)
                        .catch(hardRefresh);
                } else {
                    hardRefresh();
                }
            };

            window.SplashEnd = () => {
                splash.hidden = true;
                window.onerror = null;
            };
        })();
    }, 100);
    return (
        <>
            <noscript>
                <div class="splash-screen">
                    <div>
                        <h1>TurboWarp requires JavaScript</h1>
                        <p>Consider using <a href="https://desktop.turbowarp.org/">TurboWarp Desktop</a> if you are afraid of remote JavaScript.</p>
                    </div>
                </div>
            </noscript>

            <div class="splash-screen spash-waiting-for-js" hidden>
                <div class="splash-spinner"></div>
                <div class="splash-error-title" hidden>Something went wrong. <a href="https://scratch.mit.edu/users/GarboMuffin/#comments" target="_blank" rel="noreferrer">Please report</a> with the information below.</div>
                <div class="splash-errors" hidden></div>
                <button class="splash-reset" hidden>Click here to reset caches (can fix some errors)</button>
            </div>
        </>
    );
};

module.exports = Loading;
