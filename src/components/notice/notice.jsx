const iziToast = require('izitoast');
const React = require('react');

const api = require('../../lib/api');

const Cookies = require('js-cookie');

require('izitoast/dist/css/iziToast.min.css');
require('./notice.scss');

// window.Cookies = Cookies;

class Notice extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            news: []
        };
        this.getNews();
    }

    getNews() {
        api({
            uri: '/news/?limit=3'
        }, (err, body, resp) => {
            if (resp.statusCode !== 200) {
                return log.error(`Unexpected status code ${resp.statusCode} received from news request`);
            }
            if (!body) return log.error('No response body');
            //if (!err) return this.setState({ news: body });
            let i = 0;
            for (const item of body) {
                let watched = Cookies.get("scratch-news") ? JSON.parse(Cookies.get("scratch-news")) : [];
                if (watched.includes(item.id)) {
                    continue;
                }
                watched.push(item.id);
                Cookies.set("scratch-news", JSON.stringify(watched));
                switch (item.type) {
                    case "info":
                        /*item.copy, item.headline, {
                            onclick: this.onclick,
                            id: i,
                            timeOut: 10000
                        } */
                        iziToast.info({
                            title: item.headline,
                            message: item.small || item.copy,
                            timeout: 10000,
                            onClick: this.onclick
                        });
                        break;
                    case "warn":
                        iziToast.warn({
                            title: item.headline,
                            message: item.small || item.copy,
                            timeout: 10000,
                            onClick: this.onclick
                        });
                        break;
                    case "error":
                        iziToast.error({
                            title: item.headline,
                            message: item.small || item.copy,
                            timeout: 10000,
                            onClick: this.onclick
                        });
                        break;
                    default:
                        iziToast.info({
                            title: item.headline,
                            message: item.small || item.copy,
                            timeout: 10000,
                            onClick: this.onclick
                        });
                }
                i++;
            }
            this.setState({ news: body });
        });
    }

    onclick = (event, options) => {
        if (this.state.news[options.id].onclick) {
            let func = new Function(this.state.news[options.id].onclick);
            func();
        }
        if (this.state.news[options.id].href) {
            window.open(this.state.news[options.id].href, "_new");
            return;
        }
    }

    render() {
        return (
            <></>
        );
    }
}

module.exports = Notice;
