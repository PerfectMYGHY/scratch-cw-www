const React = require('react');
const FormattedMessage = require('react-intl').FormattedMessage;
const Box = require('../../components/box/box.jsx');
const Page = require('../../components/page/www/page.jsx');
const InplaceInput = require('../../components/forms/inplace-input.jsx');
const render = require('../../lib/render.jsx');
const classNames = require('classnames');
const Formsy = require('formsy-react').default;
const decorateText = require('../../lib/decorate-text.jsx');
const NotAvailable = require('../../components/not-available/not-available.jsx');
const Markdown = require("../../components/markdown/markdown.jsx").default;
const Carousel = require('../../components/carousel/carousel.jsx');
const Button = require('../../components/forms/button.jsx');
const Cookies = require('js-cookie');
require('./users.scss');
const setting = require('/src/setting');

class Users extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            info: {},
            fetched: false,
            stop: false,
            content: [],
            btn: [],
            description: [],
            recently: [],
            shared: [],
            favourites: []
        };

        this.imageRef = React.createRef();
        this.aRef = React.createRef();
        this.changerRef = React.createRef();
        this.formRef = React.createRef();
        this.nameRef = React.createRef();
        this.updateRef = React.createRef();

        this.getUserHeadPhotoURL = this.getUserHeadPhotoURL.bind(this);
        this.handleFollowUser = this.handleFollowUser.bind(this);
        this.makeHandleUpdate = this.makeHandleUpdate.bind(this);
    }

    componentDidMount() {
        this.fetchUserData();
    }

    getUserHeadPhotoURL = async () => {
        let ret = null;
        await requestAPI("getUserHeadPhotoURL", {
            user: this.state.info.user.username
        }).then(data => {
            if (data.state) {
                ret = (data.type === "base" ? setting.base.slice(0, -1) : "") + data.url;
            } else {
                throw new Error("请求失败！");
            }
        });
        return ret;
    }

    handleFollowUser = () => {
        // Follow user logic here
    }

    fetchUserData = async () => {
        if (!this.state.stop) {
            this.setState({ stop: true });
            const uname = window.location.pathname.split("/")[2];
            fetch(`${setting.base}api/session/`, {
                method: "POST",
                body: JSON.stringify({ user: uname })
            })
                .then(res => res.json())
                .then(data => {
                    this.setState({ fetched: true, info: data });
                    if (!data.user) return;
                    const thumbnailUrl = data.user.thumbnailUrl;
                    this.imageRef.current.src = thumbnailUrl;
                    this.aRef.current.href = `/users/${data.user.username}/`;
                    this.nameRef.current.innerHTML = data.user.username;

                    // Calculate time since joining and set user description
                    this.setUserInfo(data.user);
                });
        }
    }

    setUserInfo = (user) => {
        const dateJoined = new Date(user.dateJoined);
        const timeDiff = new Date() - dateJoined;
        const timeUnits = this.calculateTimeUnits(timeDiff);
        const des = this.getUserDescription(dateJoined);

        const content = (
            <div>
                <p className="profile-details">
                    <span className="group">{des}</span>
                    已加入于<span title={dateJoined.toISOString()}>{timeUnits}</span>
                    <span className="location">中国</span>
                    <span style={{ display: "block" }}>Scratch币个数：{user.flags.money}</span>
                </p>
            </div>
        );

        this.setState({ content: [content] });
        this.setState({
            btn: [
                Cookies.get("user") !== user.username && (
                    <Button className="button collection-user" onClick={this.handleFollowUser}>
                        关注
                    </Button>
                )
            ]
        });
    }

    calculateTimeUnits = (timeDiff) => {
        const seconds = Math.floor(timeDiff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const months = Math.floor(days / 30);
        const years = Math.floor(months / 12);

        if (years > 0) return `${years}年`;
        if (months > 0) return `${months}个月`;
        if (days > 0) return `${days}天`;
        if (hours > 0) return `${hours}小时`;
        if (minutes > 0) return `${minutes}分钟`;
        return `${seconds}秒`;
    }

    getUserDescription = (dateJoined) => {
        const years = Math.floor((new Date() - dateJoined) / (1000 * 60 * 60 * 24 * 365));
        switch (years) {
            case 0: return "Scratcher 新手";
            case 1: return "Scratcher 熟手";
            case 2: return "Scratcher 高手";
            case 3: return "Scratcher 大师";
            default: return "Scratcher 博士";
        }
    }

    makeHandleUpdate = (typ) => {
        return (data) => {
            requestAPI(`setInfo/${this.state.info.user.id}`, data);
        };
    }

    render() {
        return (
            <div className="inner users" id="pagebox">
                <Box headContent={<UserInfo info={this.state.info} {...this} />}>
                    <h3>个人简介</h3>
                    {this.state.description.map((item) => item)}
                    <h3>最近</h3>
                    {this.state.recently.map((item) => item)}
                </Box>
                <Box title="分享的作品">
                    {this.state.shared.map((item) => item)}
                </Box>
                <Box title="收藏的作品">
                    {this.state.favourites.map((item) => item)}
                </Box>
                <Box title="正在关注">
                    <p>还没有</p>
                </Box>
            </div>
        );
    }
}

const requestAPI = (api, data, func, typ = "POST") => {
    const params = new URLSearchParams(data);
    const config = { method: typ };
    if (["POST", "PUT", "DELETE", "OPTION"].includes(typ)) {
        config.body = params;
    }
    return fetch(`${setting.base}api/${api}`, config)
        .then(response => response.json())
        .then(func);
};

class UserInfo extends React.Component {
    render() {
        return (
            <div className="box-head">
                <form id="profile-avatar" className="portrait" ref={this.props.formRef}>
                    <div className="avatar" ref={this.props.changerRef}>
                        <a ref={this.props.aRef}>
                            <img src={this.props.thumbnailUrl} ref={this.props.imageRef} width="55" height="55" alt="用户头像" />
                            <div className="loading-img s48"></div>
                        </a>

                        {Cookies.get("user") === (this.props.info.user && this.props.info.user.username) && (
                            <div data-control="edit">更改头像
                                <input className="hidden" type="file" accept="image/*" ref={this.props.updateRef} />
                            </div>
                        )}
                    </div>
                </form>
                {this.props.btn}
                <div className="header-text">
                    <h2 ref={this.props.nameRef}>Username</h2>
                    {this.props.content}
                </div>
            </div>
        );
    }
}

render(<Page><Users /></Page>, document.getElementById('app'));
