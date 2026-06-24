const React = require('react');

const classNames = require('classnames');
const Button = require('../forms/button.jsx');
const PropTypes = require('prop-types');
const bindAll = require('lodash.bindall');
const api = require('../../lib/api.js');

const {connect} = require('react-redux');

const setting = require('../../setting.js'); // 获取设置

const fetch = (u, opts = {}) => new Promise((resolve, reject) => {
    if (opts.credentials === 'include') {
        opts.withCredentials = true;
        delete opts.credentials;
    }
    const url = new URL(u);
    api({
        host: url.origin,
        uri: url.pathname + url.search,
        ...opts
    }, (err, body, res) => {
        if (err) {
            reject(err);
        }
        if (opts.responseType === 'json' && typeof body === 'string') {
            try {
                body = JSON.parse(body);
            } catch (e) {
                reject(e);
            }
        }
        if (res.statusCode >= 400) {
            reject(new Error(`HTTP ${res.statusCode}: ${body}`));
        }
        resolve(body);
    });
});

const requestAPI = (request_api, data, func, typ = 'POST', root) => {
    data = new URLSearchParams(data);
    const inf = {
        method: typ
    };
    if (typ === 'POST' || typ === 'PUT' || typ === 'DELETE' || typ === 'OPTTION') {
        inf.body = data;
        inf.credentials = 'include';
    }
    const req = fetch(`${root || setting.base}api/${request_api}`, inf);
    if (func) {
        return req.then(func);
    }
    return req;

};

class UserInfo extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            thumbnailUrl: null,
            profileLink: null,
            followed: -1,
            mouseOvering: false,
            photoUpdatedCountphotoUpdatedCount: 0
        };
        if (!('info' in props)) {
            throw new Error('致命错误：使用UserInfo组件请传入必要参数info！');
        }
        bindAll(this, [
            'getUserHeadPhotoURL',
            '_fetchedData',
            'updateFollowingInfo',
            'handleChengerMouseOver',
            'handleChengerMouseOut',
            'handleUpdateHeadPhoto',
            'loadData',
            'handleFollowUser',
            'handleUnFollowUser'
        ]);
    }

    componentDidMount () {
        if (this.props.uname) {
            this.loadData();
        }
    }

    componentDidUpdate (prevProps) {
        if (!prevProps.uname && this.props.uname) {
            this.loadData();
        }
        if (!prevProps.username && this.props.username && // 如果用户名改变
            this.props.info && this.props.info.user && this.props.info.user.username // 并且当前查看用户信息已获取
        ) {
            fetch(`${process.env.PROJECT_HOST}/users/${this.props.username}/followed/${this.props.info.user.username}/`)
                .then(this.updateFollowingInfo);
        }
    }

    async getUserHeadPhotoURL () {
        let ret = null;
        await requestAPI('getUserHeadPhotoURL', {
            user: this.props.info.user.username
        }).then(data => {
            if (data.status === 'success') {
                ret = (data.type === 'base' ? setting.base.slice(0, -1) : '') + data.url;
            } else {
                throw new Error('请求失败！');
            }
        });
        return ret;
    }

    _fetchedData (data) {
        if (!data.user) {
            this.props.onNotFound();
            this.props.onSetInfo(data);
            return;
        }
        this.props.onFound()
            .then(() => {
                this.props.onSetInfo(data);
                this.setState({
                    thumbnailUrl: data.user.thumbnailUrl,
                    profileLink: `/users/${data.user.username}/`
                });
                const dateJoined = new Date(data.user.dateJoined);
                // 获取年份、月份和日期
                const year = dateJoined.getFullYear(); // 获取年份（四位数）
                const month = (`0${dateJoined.getMonth() + 1}`).slice(-2); // 获取月份（补零）
                const day = (`0${dateJoined.getDate()}`).slice(-2); // 获取日期（补零）

                // 拼接成所需格式的字符串
                const dateString = `${year}-${month}-${day}`;
                let timeC = dateJoined.getYear() - (new Date().getYear());
                let dw = '年';
                if (timeC === 0) {
                    timeC = dateJoined.getMonth() - (new Date().getMonth());
                    dw = '个月';
                    if (timeC === 0) {
                        timeC = dateJoined.getDay() - (new Date().getDay());
                        dw = '天';
                        if (timeC === 0) {
                            timeC = dateJoined.getHours() - (new Date().getHours());
                            dw = '时';
                            if (timeC === 0) {
                                timeC = dateJoined.getMinutes() - (new Date().getMinutes());
                                dw = '分钟';
                                if (timeC === 0) {
                                    timeC = dateJoined.getSeconds() - (new Date().getSeconds());
                                    dw = '秒';
                                }
                            }
                        }
                    }
                }
                let des;
                switch (Math.round(Math.abs(dateJoined.getYear() - (new Date().getYear())) / 4)) {
                case 0:
                    des = 'Scratcher 新手';
                    break;
                case 1:
                    des = 'Scratcher 熟手';
                    break;
                case 2:
                    des = 'Scratcher 高手';
                    break;
                case 3:
                    des = 'Scratcher 大师';
                    break;
                default:
                    des = 'Scratcher 博士';
                    break;
                }
                this.setState({
                    time_dw: dw,
                    des,
                    dateString,
                    timeC
                });
            });
    }

    updateFollowingInfo (response) {
        this.setState({
            followed: response.followed
        });
    }

    handleChengerMouseOver () {
        this.setState({
            mouseOvering: true
        });
    }

    handleChengerMouseOut () {
        this.setState({
            mouseOvering: false
        });
    }

    async handleUpdateHeadPhoto (e) {
        const file = e.target.files[0];
        const username = this.props.info.user.username; // 用户名

        if (!file) {
            return;
        }

        // === 新增：文件大小检查 ===
        const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
        if (file.size > MAX_FILE_SIZE) {
            // 显示错误提示
            alert(`文件太大啦！请选择小于2MB的图片。\n当前文件: ${(file.size / 1024 / 1024).toFixed(2)}MB\n就想用这个头像？如果你的头像不是动图，可以使用一些软件缩小尺寸再上传。如果你的头像是动图，可以考虑EZGIF这类工具减小体积。`);
            
            // 清空input，允许重新选择同一文件
            e.target.value = '';
            return;
        }

        const formData = new FormData();
        formData.append('photo', file);
        formData.append('user', username); // 添加用户名字段

        try {
            const data = await fetch(`${setting.base}api/updateHeadPhoto`, {
                method: 'POST',
                body: formData
            });

            if (data.status === 'success') {
                this.setState({
                    photoUpdatedCount: this.state.photoUpdatedCount + 1,
                    thumbnailUrl: await this.getUserHeadPhotoURL()
                });
            } else {
                throw new Error(`上传失败！错误信息：${data.msg}`);
            }
        } catch (error) {
            alert(`上传失败！错误信息：${error.message}`);
            throw error;
        }
    }

    loadData () {
        this.setState({
            followed: -1
        });
        fetch(`${setting.base}api/getInfoByUserName/`, {
            method: 'POST',
            credentials: 'include',
            body: JSON.stringify({
                user: this.props.uname
            })
        })
            .then(this._fetchedData);
    }

    handleFollowUser () {
        this.setState({
            followed: -1
        });
        fetch(`${process.env.PROJECT_HOST}/users/${this.props.username}/follow/${this.props.info.user.username}/`, {
            method: 'POST',
            credentials: 'include'
        })
            .then(response => {
                if (response.status === 'success') {
                    this.setState({
                        followed: true
                    });
                }
            });
    }

    handleUnFollowUser () {
        fetch(`${process.env.PROJECT_HOST}/users/${this.props.username}/unfollow/${this.props.info.user.username}/`, {
            method: 'POST',
            credentials: 'include'
        })
            .then(response => {
                if (response.status === 'success') {
                    this.setState({
                        followed: false
                    });
                }
            });
    }

    render () {
        return (
            <div className="box-head">
                <form
                    id="profile-avatar"
                    className={classNames('portrait', this.state.mouseOvering && 'edit')}
                >
                    <div
                        className="avatar"
                        onMouseOver={this.handleChengerMouseOver}
                        onMouseOut={this.handleChengerMouseOut}
                    >
                        <a href={this.state.profileLink}>
                            <img
                                src={this.state.thumbnailUrl}
                                width="55"
                                height="55"
                                key={`headphoto_id_${this.state.photoUpdatedCount}`}
                            />
                            <div className="loading-img s48" />
                        </a>

                        {this.props.username === (this.props.info.user && this.props.info.user.username) && (
                            <div data-control="edit">更改头像
                                <input
                                    className="hidden"
                                    type="file"
                                    accept="image/*"
                                    name="file"
                                    onChange={this.handleUpdateHeadPhoto}
                                />
                            </div>
                        )}


                    </div>
                </form>
                {this.props.username &&
                    this.props.username !== (this.props.info.user && this.props.info.user.username) &&
                    this.state.followed !== -1 && !this.state.followed &&
                    <Button
                        className="button collection-user"
                        onClick={this.handleFollowUser}
                    >
                        {'关注'}
                    </Button>}
                {this.props.username &&
                    this.props.username !== (this.props.info.user && this.props.info.user.username) &&
                    this.state.followed !== -1 && this.state.followed &&
                    <Button
                        className="button uncollection-user"
                        onClick={this.handleUnFollowUser}
                    >
                        {'取消关注'}
                    </Button>
                }
                <div className="header-text">
                    <h2>{this.props.info.user && this.props.info.user.nickname}</h2>
                    <div>
                        <p className="profile-details">

                            <span className="group">
                                {this.state.des}
                            </span>
                            已加入于
                            <span title={this.state.dateString}>{Math.abs(this.state.timeC)} {this.state.time_dw}</span>
                            前
                            <span className="location">中国</span>
                            <span
                                style={{
                                    display: 'block'
                                }}
                            >Scratch币个数：{this.props.info.flags && this.props.info.flags.money}</span>
                        </p>
                    </div>
                </div>
            </div>
        );
    }
}

UserInfo.propTypes = {
    onSetInfo: PropTypes.func.isRequired,
    info: PropTypes.shape({
        user: PropTypes.shape({
            id: PropTypes.number,
            banned: PropTypes.bool,
            should_vpn: PropTypes.bool,
            username: PropTypes.string,
            nickname: PropTypes.string,
            token: PropTypes.string,
            thumbnailUrl: PropTypes.string,
            dateJoined: PropTypes.string,
            email: PropTypes.string
        }),
        permissions: PropTypes.shape({
            admin: PropTypes.bool,
            scratcher: PropTypes.bool,
            new_scratcher: PropTypes.bool,
            invited_scratcher: PropTypes.bool,
            social: PropTypes.bool,
            educator: PropTypes.bool,
            educator_invitee: PropTypes.bool,
            student: PropTypes.bool,
            mute_status: PropTypes.shape({

            })
        }),
        flags: {
            must_reset_password: PropTypes.bool,
            must_complete_registration: PropTypes.bool,
            has_outstanding_email_confirmation: PropTypes.bool,
            show_welcome: PropTypes.bool,
            confirm_email_banner: PropTypes.bool,
            unsupported_browser_banner: PropTypes.bool,
            project_comments_enabled: PropTypes.bool,
            gallery_comments_enabled: PropTypes.bool,
            userprofile_comments_enabled: PropTypes.bool,
            everything_is_totally_normal: PropTypes.bool,
            money: PropTypes.number,
            chances: PropTypes.number,
            bad: PropTypes.number,
            fh: PropTypes.bool
        }
    }).isRequired,
    onNotFound: PropTypes.func.isRequired,
    onFound: PropTypes.func.isRequired,
    uname: PropTypes.string.isRequired,
    username: PropTypes.string
};

UserInfo.defaultProps = {
    info: {}
};

const mapStateToProps = state => {
    const user = state.session && state.session.session && state.session.session.user;
    return {
        username: user && user.username
    };
};

const WrappedUserInfo = connect(mapStateToProps)(UserInfo);

module.exports = WrappedUserInfo;
module.exports.requestAPI = requestAPI;
module.exports.fetch = fetch;
