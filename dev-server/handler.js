/*
 * Constructor
 */
const Handler = function (route) {
    // Handle redirects
    if (route.redirect) {
        return (req, res) => {
            if (req.url.search(new RegExp("/projects/\\d+/editor/js/\\w+.js?$")) == -1)
                res.redirect(route.redirect);
            else
                res.redirect(route.redirect.replace("{}", (req.url.match(new RegExp("js/\\w+.js?$")) + "").slice(3, -3)));
        };
    }

    const url = `/${route.name}.html`;
    return function (req, res, next) {
        req.url = url;
        next();
    };
};

/*
 * Export a new instance
 */
module.exports = function (route) {
    return new Handler(route);
};
