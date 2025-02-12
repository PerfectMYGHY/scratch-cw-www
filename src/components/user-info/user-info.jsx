const FormattedMessage = require('react-intl').FormattedMessage;
const React = require('react');
const useRef = require('react').useRef;
const useState = require('react').useState;

const Box = require('../box/box.jsx');

const Page = require('../page/www/page.jsx');
const InplaceInput = require('../forms/inplace-input.jsx');
const render = require('../../lib/render.jsx');
const ReactDom = require('react-dom');
const classNames = require('classnames');
const Formsy = require('formsy-react').default;
const decorateText = require('../../lib/decorate-text.jsx');
const NotAvailable = require('../not-available/not-available.jsx');
const Markdown = require("../markdown/markdown.jsx").default;
const Carousel = require('../carousel/carousel.jsx');
const Button = require('../forms/button.jsx');
const Slider = require('react-slick').default;
const Thumbnail = require('../thumbnail/thumbnail.jsx');
const defaults = require('lodash.defaults');
const PropTypes = require('prop-types');

const frameless = require('../../lib/frameless.js');

const { connect } = require('react-redux');

const setting = require('/src/setting'); // 获取设置

function requestAPI(api, data, func, typ = "POST") {
    data = new URLSearchParams(data);
    var inf = {
        method: typ,
    }
    if (typ == "POST" || typ == "PUT" || typ == "DELETE" || typ == "OPTTION") {
        inf.body = data;
    }
    if (func) {
        return fetch(setting.base + "api/" + api, inf)
            .then(response => response.json())
            .then(func);
    } else {
        return fetch(setting.base + "api/" + api, inf)
            .then(response => response.json());
    }
}

class UserInfo extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            thumbnailUrl: null,
            profileLink: null,
            followed: false,
            mouseOvering: false,
            photoUpdatedCountphotoUpdatedCount: 0,
        };
        if (!("info" in props)) {
            throw "致命错误：使用UserInfo组件请传入必要参数info！";
        }
        if (this.props.uname) {
            this.loadData();
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (!prevProps.uname && this.props.uname) {
            this.loadData();
        }
    }

    getUserHeadPhotoURL = async () => {
        var ret = null;
        await requestAPI("getUserHeadPhotoURL", {
            user: this.props.info.user.username
        }).then(function (data) {
            if (data.state) {
                ret = (data.type == "base" ? setting.base.slice(0, -1) : "") + data.url;
            } else {
                throw "请求失败！";
            }
        });
        return ret;
    }

    _fetchedData = (data) => {
        if (!data.user) {
            this.props.onNotFound();
            this.props.setInfo(data);
            return;
        }
        this.props.setInfo(data);
        this.setState({
            thumbnailUrl: data["user"]["thumbnailUrl"],
            profileLink: `/users/${this.props.info.user.username}/`
        });
        var dateJoined = new Date(this.props.info.user.dateJoined);
        // 获取年份、月份和日期
        let year = dateJoined.getFullYear(); // 获取年份（四位数）
        let month = ('0' + (dateJoined.getMonth() + 1)).slice(-2); // 获取月份（补零）
        let day = ('0' + dateJoined.getDate()).slice(-2); // 获取日期（补零）

        // 拼接成所需格式的字符串
        let dateString = `${year}-${month}-${day}`;
        var timeC = dateJoined.getYear() - (new Date().getYear());
        var dw = "年";
        if (timeC == 0) {
            timeC = dateJoined.getMonth() - (new Date().getMonth());
            dw = "个月";
            if (timeC == 0) {
                timeC = dateJoined.getDay() - (new Date().getDay());
                dw = "天";
                if (timeC == 0) {
                    timeC = dateJoined.getHours() - (new Date().getHours());
                    dw = "时";
                    if (timeC == 0) {
                        timeC = dateJoined.getMinutes() - (new Date().getMinutes());
                        dw = "分钟";
                        if (timeC == 0) {
                            timeC = dateJoined.getSeconds() - (new Date().getSeconds());
                            dw = "秒";
                        }
                    }
                }
            }
        }
        var des;
        switch (Math.round(Math.abs(dateJoined.getYear() - (new Date().getYear())) / 4)) {
            case 0:
                des = "Scratcher 新手";
                break;
            case 1:
                des = "Scratcher 熟手";
                break;
            case 2:
                des = "Scratcher 高手";
                break;
            case 3:
                des = "Scratcher 大师";
                break;
            default:
                des = "Scratcher 博士";
                break;
        }
        this.setState({
            time_dw: dw,
            des,
            dateString,
            timeC
        })
        fetch(`${process.env.PROJECT_HOST}/users/${this.props.username}/followed/${this.props.info.user.username}/`)
            .then(response => response.json())
            .then(this.updateFollowingInfo);
    }

    updateFollowingInfo = (response) => {
        this.setState({
            followed: response.followed
        });
    }

    handleChengerMouseOver = () => {
        this.setState({
            mouseOvering: true
        });
    }

    handleChengerMouseOut = () => {
        this.setState({
            mouseOvering: false
        });
    }

    handleUpdateHeadPhoto = async (e) => {
        var file = e.target.files[0];
        var username = this.props.info.user.username; // 用户名

        if (!file) {
            return;
        }

        var formData = new FormData();
        formData.append('photo', file);
        formData.append('user', username); // 添加用户名字段  

        try {
            const response = await fetch(setting.base + 'api/updateHeadPhoto', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            if (data.state) {
                this.setState({
                    photoUpdatedCount: this.state.photoUpdatedCount + 1,
                    thumbnailUrl: await this.getUserHeadPhotoURL()
                });
                console.log("已经更新头像");
            } else {
                throw "上传失败！"
            }
        } catch (error) {
            throw error;
        }
    }

    loadData = () => {
        fetch(`${setting.base}api/getInfoByUserName/`, {
            method: "POST",
            body: JSON.stringify({
                user: this.props.uname
            })
        })
            .then(res => { return res.json() })
            .then(this._fetchedData);
    }

    handleFollowUser = () => {
        const base = this;
        fetch(`${process.env.PROJECT_HOST}/users/${this.props.username}/follow/${this.props.info.user.username}/`)
            .then(response => response.json())
            .then((response) => {
                if (response.state == "successfully") {
                    base.setState({
                        followed: true
                    });
                }
            });
    }

    handleUnFollowUser = (info) => {
        const base = this;
        fetch(`${process.env.PROJECT_HOST}/users/${this.props.username}/unfollow/${this.props.info.user.username}/`)
            .then(response => response.json())
            .then((response) => {
                if (response.state == "successfully") {
                    base.setState({
                        followed: false
                    });
                }
            });
    }

    render() {
        return (
            <div class="box-head">
                <form id="profile-avatar" class={classNames("portrait", this.state.mouseOvering && "edit")}>
                    <div class="avatar" onMouseOver={this.handleChengerMouseOver} onMouseOut={this.handleChengerMouseOut}>
                        <a href={this.state.profileLink}>
                            <img src={this.state.thumbnailUrl} width="55" height="55" key={`headphoto_id_${this.state.photoUpdatedCount}`}></img>
                            <div class="loading-img s48"></div>
                        </a>

                        {this.props.username == (this.props.info.user && this.props.info.user.username) && (
                            <div data-control="edit">更改头像
                                <input class="hidden" type="file" accept="image/*" name="file" onChange={this.handleUpdateHeadPhoto}></input>
                            </div>
                        )}


                    </div>
                </form>
                {this.props.username != (this.props.info.user && this.props.info.user.username) && !this.state.followed &&
                    <Button
                        className="button collection-user"
                        onClick={this.handleFollowUser}
                    >
                        {"关注"}
                    </Button>}
                {this.props.username != (this.props.info.user && this.props.info.user.username) && this.state.followed &&
                    <Button
                        className="button uncollection-user"
                        onClick={this.handleUnFollowUser}
                    >
                        {"取消关注"}
                    </Button>}
                <div class="header-text">
                    <h2>{this.props.info.user && this.props.info.user.username}</h2>
                    <div>
                        <p class="profile-details">

                            <span class="group">
                                {this.state.des}
                            </span>
                            已加入于<span title={this.state.dateString}>{Math.abs(this.state.timeC)}&nbsp;{this.state.time_dw}</span>前
                            <span class="location">中国</span>
                            <span style={{
                                display: "block"
                            }}>Scratch币个数：{this.props.info.flags && this.props.info.flags.money}</span>
                        </p>
                    </div>
                </div>
            </div>
        );
    }
}

UserInfo.propTypes = {
    setInfo: PropTypes.func.isRequired,
    info: PropTypes.object.isRequired,
    onNotFound: PropTypes.func.isRequired,
    uname: PropTypes.string.isRequired
};

UserInfo.defaultProps = {
    info: {}
};

const mapStateToProps = (state) => ({
    username: state.session && state.session.session && state.session.session.user && state.session.session.user.username
});


module.exports = connect(mapStateToProps)(UserInfo);
