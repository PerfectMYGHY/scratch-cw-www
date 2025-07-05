const React = require('react');
const Page = require('../../components/page/www/page.jsx');
const render = require('../../lib/render.jsx');
const bindAll = require('lodash.bindall');
const UserBox = require('../../components/user-box/user-box.jsx');
const Button = require('../../components/forms/button.jsx');
const createRef = require('react').createRef;
const { connect } = require('react-redux');

const setting = require('/src/setting'); // 获取设置

require('./password_change.scss');

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

const isSubset = (obj1, obj2, debug = false) => {
    for (const key in obj1) {
        if (!(key in obj2) || obj1[key] !== obj2[key]) {
            return false;
        }
    }
    return true;
};

class PasswordChange extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            info: {},
            fetched: false
        };
        this.oldPwd = createRef();
        this.newPwd = createRef();
        this.rePwd = createRef();
        bindAll(this, [
            'setInfo',
            'customLoadData',
            'reset'
        ]);
    }

    setInfo (state) {
        if (!isSubset(state, this.state, true)) {
            this.setState(state);
        }
    }

    customLoadData (state) {
        
    }

    reset () {
        const old_pwd = this.oldPwd.current.value;
        const new_pwd = this.newPwd.current.value;
        const re_pwd = this.rePwd.current.value;
        if (new_pwd == re_pwd){
            requestAPI("resetPwd",{user:this.state.info.user.username,old_pwd:old_pwd,new_pwd:new_pwd},(data) => {
                if (data.state){
                    alert("设置成功！");
                } else {
                    alert(`设置失败！信息：${data.msg}`);
                }
            });
        } else {
            alert("新密码和重复密码不一致！");
        }
    }

    render() {
        return (
            <UserBox
                setInfo={this.setInfo}
                customLoadData={this.customLoadData}
                uname={this.props.username}
            >
                <div>
                    <h3>相关页面(让站长懒一下)</h3>
                    <p class="about-page">
                        <a href="/accounts/settings/">账号设置</a>
                        <a href="/accounts/password_change/">密码设置</a>
                        <a href="/accounts/my_money/">邮箱设置</a>
                        <a href="/accounts/my_money/">我的财富</a>
                    </p>
                    <h3>密码设置</h3>
                    <div>
                        <p>
                            <strong>重置密码：</strong>
                        </p>
                        <i>{"换密码，输入旧密码，新密码，再确认密码，就是这么简单！"}</i>
                        <p>
                            <label for="old_pwd">旧密码：</label>
                            <input type="password" name="old_pwd" ref={this.oldPwd} />
                        </p>
                        <p>
                            <label for="new_pwd">新密码：</label>
                            <input type="password" name="new_pwd" ref={this.newPwd} />

                        </p>
                        <p>
                            <label for="re_pwd">重复密码：</label>
                            <input type="password" name="re_pwd" ref={this.rePwd} />

                        </p>
                        <Button onClick={this.reset}>
                            重置密码
                        </Button>
                    </div>
                </div>
                <div>
                    
                </div>
            </UserBox>
        );
    }
}

const mapStateToProps = (state) => ({
    username: state.session && state.session.session && state.session.session.user && state.session.session.user.username
});

const ConnectedPasswordChange = connect(mapStateToProps)(PasswordChange);

render(<Page><ConnectedPasswordChange /></Page>, document.getElementById('app'));
