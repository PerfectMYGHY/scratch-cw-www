const iziToast = require('izitoast');
const React = require('react');

const api = require('../../lib/api');

const Cookies = require('js-cookie');

const PropTypes = require('prop-types');
const {connect} = require('react-redux');
const {openModalWith} = require('../../redux/news');

require('izitoast/dist/css/iziToast.min.css');
require('./notice.scss');

// window.Cookies = Cookies;
if (!global.ScratchStorage_onZipFetchToolError) {
    global.ScratchStorage_onZipFetchToolError = null;
}
let zipFetchToolErrored = false;
const listenInterval = setInterval(() => {
    if (!global.ScratchStorage_onZipFetchToolError) {
        return;
    }
    global.ScratchStorage_onZipFetchToolError.on('failed', () => {
        if (!zipFetchToolErrored){
            iziToast.error({
                title: '分段压缩上传下载器出错了！',
                message: 'Scratch创世界的新型上传下载器出错了！将继续使用Scratch原版的上传下载器。如有问题，请联系站长！',
                timeout: 8000
            });
            zipFetchToolErrored = true;
            global.ScratchStorage_onZipFetchToolError.off('failed');
        }
    });
    clearInterval(listenInterval);
}, 1);

const log = console;

window.DEVELOPMENT_TOOL_COOKIES_MANAGER = Cookies;

class Notice extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            news: []
        };
        this.sentNews = false;
    }

    getNews () {
        api({
            uri: '/news/?limit=3'
        }, (err, body, resp) => {
            if (resp.statusCode !== 200) {
                return log.error(`Unexpected status code ${resp.statusCode} received from news request`);
            }
            if (!body) return log.error('No response body');
            // if (!err) return this.setState({ news: body });
            let willOpenModal = false;
            const showedOnModal = [];
            for (const item of body) {
                if (!this.props.userLoggedIn && item.need_login) {
                    continue;
                }
                const watched = Cookies.get('scratch-news') ? JSON.parse(Cookies.get('scratch-news')) : {};
                if (watched[item.id] == item.update_time) {
                    continue;
                }
                watched[item.id] = item.update_time;
                Cookies.set('scratch-news', JSON.stringify(watched), {
                    expires: 20,
                    domain: '.scratch-cw.top',  // 关键配置：允许主域名和所有子域名访问
                    path: '/',
                    secure: true,               // 仅HTTPS环境下传输（生产环境推荐）
                    sameSite: 'Lax'             // 防止CSRF攻击
                });
                switch (item.type) {
                case 'info':
                    iziToast.info({
                        title: item.headline,
                        message: item.small || item.copy,
                        timeout: 10000,
                        onClick: this.onclick.bind(this)
                    });
                    break;
                case 'warn':
                    iziToast.warning({
                        title: item.headline,
                        message: item.small || item.copy,
                        timeout: 10000,
                        onClick: this.onclick.bind(this)
                    });
                    break;
                case 'error':
                    iziToast.error({
                        title: item.headline,
                        message: item.small || item.copy,
                        timeout: 10000,
                        onClick: this.onclick.bind(this)
                    });
                    break;
                default:
                    iziToast.info({
                        title: item.headline,
                        message: item.small || item.copy,
                        timeout: 10000,
                        onClick: this.onclick.bind(this)
                    });
                }
                if (item.important) {
                    willOpenModal = true;
                    showedOnModal.push(item);
                }
            }
            this.setState({news: body});
            if (willOpenModal) {
                this.props.handleOpenModal(showedOnModal);
            }
        });
    }

    onclick = (event, options) => {
        if (this.state.news[options.id].onclick) {
            const func = new Function(this.state.news[options.id].onclick);
            func();
        }
        if (this.state.news[options.id].href) {
            window.open(this.state.news[options.id].href, '_new');
        }
    };

    render () {
        if (!this.sentNews) {
            this.getNews();
            this.sentNews = true;
        }
        return (
            <></>
        );
    }
}

Notice.propTypes = {
    handleOpenModal: PropTypes.func,
    userLoggedIn: PropTypes.bool
};

const mapStateToProps = state => {
    const user = state.session && state.session.session && state.session.session.user;
    return {
        userLoggedIn: user && user.username
    };
};

const mapDispatchToProps = dispatch => ({
    handleOpenModal: news => {
        dispatch(openModalWith(news));
    }
});

module.exports = connect(
    mapStateToProps,
    mapDispatchToProps
)(Notice);
