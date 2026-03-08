import PropTypes from 'prop-types';

import React, {createRef} from 'react';

const Page = require('../../components/page/www/page.jsx');
const render = require('../../lib/render.jsx');
const Button = require('../../components/forms/button.jsx');
import UserBox from '../../components/user-box/user-box.jsx';
const bindAll = require('lodash.bindall');
const {requestAPI} = require('../../components/user-info/user-info.jsx');

const {connect} = require('react-redux');

require('./settings.scss');

class Settings extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            info: {}
        };
        bindAll(this, [
            'setInfo',
            'customLoadData',
            'handleUsernameChange',
            'handleNicknameChange'
        ]);
        this.uc_username_ref = createRef();
        this.uc_password_ref = createRef();
        this.nc_nickname_ref = createRef();
        this.nc_password_ref = createRef();
    }

    setInfo () {

    }

    customLoadData () {

    }

    handleUsernameChange () {
        const username = this.uc_username_ref.current.value;
        const password = this.uc_password_ref.current.value;
        requestAPI('username/change/', {username: username, password: password}, data => {
            if (data.status === 'success') {
                alert('设置用户名成功！刷新页面即可生效！');
            } else {
                alert(`设置用户名失败，信息：${data.msg}`);
            }
        });
    }

    handleNicknameChange () {
        const nickname = this.nc_nickname_ref.current.value;
        const password = this.nc_password_ref.current.value;
        requestAPI('nickname/change/', {username: nickname, password: password}, data => {
            if (data.status === 'success') {
                alert('设置用户名成功！刷新页面即可生效！');
            } else {
                alert(`设置用户名失败，信息：${data.msg}`);
            }
        });
    }

    render () {
        return (
            <UserBox
                setInfo={this.setInfo}
                customLoadData={this.customLoadData}
                uname={this.props.username}
            >
                <div>
                    <h3>相关页面</h3>
                    <p className="about-page">
                        <a href="/accounts/settings/">账号设置</a>
                        <a href="/accounts/password_change/">密码设置</a>
                        <a href="/accounts/email_change/">邮箱设置</a>
                        <a href="/accounts/my_money/">我的财富</a>
                    </p>
                    <h3>账号设置</h3>
                    <div>
                        <h3>账号信息</h3>
                        <p>用户名：{this.props.username}</p>
                        <p>用户昵称：{this.props.nickname}</p>
                        <hr />
                        <h3>修改用户名</h3>
                        <p>
                            <label htmlFor="new_username">新的用户名：</label>
                            <input
                                name="new_username"
                                id="new_username"
                                ref={this.uc_username_ref}
                            />
                        </p>
                        <p>
                            <label htmlFor="uc_password">密码确认：</label>
                            <input
                                name="uc_password"
                                id="uc_password"
                                ref={this.uc_password_ref}
                            />
                        </p>
                        <Button onClick={this.handleUsernameChange}>
                            确定
                        </Button>
                        <hr />
                        <h3>修改昵称</h3>
                        <p>
                            <label htmlFor="new_nickname">新的昵称：</label>
                            <input
                                name="new_nickname"
                                id="new_nickname"
                                ref={this.nc_nickname_ref}
                            />
                        </p>
                        <p>
                            <label htmlFor="nc_password">密码确认：</label>
                            <input
                                name="nc_password"
                                id="nc_password"
                                ref={this.nc_password_ref}
                            />
                        </p>
                        <Button onClick={this.handleNicknameChange}>
                            确定
                        </Button>
                        <hr />
                        <h3>注销账号</h3>
                        <p>
                            <a
                                href="/accounts/delete/account/"
                                className="destroy-account"
                            >
                                注销账号
                            </a>
                        </p>
                    </div>
                </div>
                <></>
            </UserBox>
        );
    }
}

Settings.propTypes = {
    username: PropTypes.string,
    nickname: PropTypes.string
};

const mapStateToProps = state => {
    const user = state.session && state.session.session && state.session.session.user;
    return {
        username: user && user.username,
        nickname: user && user.nickname
    };
};

const ConnectedSettings = connect(mapStateToProps)(Settings);

render(<Page><ConnectedSettings /></Page>, document.getElementById('app'));
