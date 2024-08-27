//var addons = require("../../../node_modules/scratch-gui/build/addons.jmh");
//var addons = `<!DOCTYPE html>
//<html>
//  <head>
//    <meta charset="UTF-8">
//    <meta name="viewport" content="width=device-width, initial-scale=1">
//    <title>Addon Settings - 更多</title>
//    <style>
//      body[data-splash-theme="dark"] {
//        background: #111;
//      }

//      noscript {
//        font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
//      }
//    </style>
//  </head>
//  <body>
//    <noscript>
//      <h1>This page requires JavaScript</h1>
//    </noscript>

//    <script>
//      (function() {
//        var theme = '';

//        try {
//          var themeSetting = localStorage.getItem('tw:theme');
//        } catch (e) {
//          // ignore
//        }
//        if (themeSetting === 'light') {
//          theme = 'light';
//        } else if (themeSetting === 'dark') {
//          theme = 'dark';
//        } else if (themeSetting) {
//          try {
//            var parsed = JSON.parse(themeSetting);
//            if (parsed.gui === 'dark' || parsed.gui === 'light') {
//              theme = parsed.gui;
//            }
//          } catch (e) {
//            // ignore
//          }
//        }

//        if (!theme) {
//          theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
//        }

//        document.body.setAttribute('data-splash-theme', theme);
//      })();
//    </script>

//    <div id="app"></div>
//  <script src="js/vendors~addon-settings~credits~editor~embed~fullscreen~player.js"></script><script src="js/vendors~addon-settings~editor~embed~fullscreen~player.js"></script><script src="js/addon-settings.js"></script></body>
//</html>
//`;

//addons = addons.replace('<script src="js/vendors~addon-settings~credits~editor~embed~fullscreen~player.js"></script><script src="js/vendors~addon-settings~editor~embed~fullscreen~player.js"></script><script src="js/addon-settings.js"></script>', '');

//var iframe = document.createElement("iframe");
//document.getElementById('app').appendChild(iframe);
//iframe = addons;
//document.getElementById('app').innerHTML = addons;
//(function () {
//    var theme = '';

//    try {
//        var themeSetting = localStorage.getItem('tw:theme');
//    } catch (e) {
//        // ignore
//    }
//    if (themeSetting === 'light') {
//        theme = 'light';
//    } else if (themeSetting === 'dark') {
//        theme = 'dark';
//    } else if (themeSetting) {
//        try {
//            var parsed = JSON.parse(themeSetting);
//            if (parsed.gui === 'dark' || parsed.gui === 'light') {
//                theme = parsed.gui;
//            }
//        } catch (e) {
//            // ignore
//        }
//    }

//    if (!theme) {
//        theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
//    }

//    document.body.setAttribute('data-splash-theme', theme);
//})();
require("scratch-gui/build/js/vendors~addon-settings~credits~editor~embed~fullscreen~player.d8807f4f698703cca88b.js");
require("scratch-gui/build/js/vendors~addon-settings~addons~editor~fullscreen~player.26a9fb885d8946555503.js");
require("scratch-gui/build/js/addon-settings.8974332da7dcfbf9bddd.js");
window.SplashEnd();
