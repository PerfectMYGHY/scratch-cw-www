const FormattedMessage = require('react-intl').FormattedMessage;
const React = require('react');
const createRef = require('react').createRef;

const Box = require('../../components/box/box.jsx');

const Page = require('../../components/page/www/page.jsx');
const InplaceInput = require('../../components/forms/inplace-input.jsx');
const render = require('../../lib/render.jsx');
const ReactDom = require('react-dom');
const classNames = require('classnames');
const Formsy = require('formsy-react').default;
const decorateText = require('../../lib/decorate-text.jsx');
const NotAvailable = require('../../components/not-available/not-available.jsx');
const Markdown = require("../../components/markdown/markdown.jsx").default;
const Carousel = require('../../components/carousel/carousel.jsx');
const Button = require('../../components/forms/button.jsx');
const Thumbnail = require('../../components/thumbnail/thumbnail.jsx');
const PropTypes = require('prop-types');
const UserBox = require('../../components/user-box/user-box.jsx');
const UsersCarousel = require('../../components/users-carousel/users-carousel.jsx');

const { connect } = require('react-redux');

const setting = require('/src/setting'); // 获取设置

require('./email_change.scss');

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

class EmailChange extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            info: {}
        };
        this.resendPwd = createRef();
        this.resetEmail = createRef();
        this.resetPwd = createRef();
    }

    setInfo = (state) => {
        this.setState(state);
    }

    customLoadData = (state) => {
        // ...
    }

    delete_account = () => {
        var pwd = pwdRef.current.value;
        requestAPI("delete_account", { user: info.user.id, pwd: pwd }, (data) => {
            if (data.state) {
                alert("账号已删除！");
                Cookies.remove("user");
                window.location.href = "/";
            } else {
                alert(`删除时出现了错误(除了密码不正确，其他任何错误都很可怕)：${data.msg}`);
            }
        });
    };

    reset = () => {
        const pwd = this.resetPwd.current.value;
        const email = this.resetEmail.current.value;
        if (this.resetEmail.current.checkValidity()) {
            requestAPI("resetEmail", { user: this.state.info.user.username, pwd: pwd, email: email }, (data) => {
                if (data.state) {
                    alert("设置成功！");
                    window.location.reload();
                } else {
                    alert(`设置失败！信息：${data.msg}`);
                }
            });
        } else {
            //alert(`不是一个正确的邮箱号！`);
            this.resetEmail.current.reportValidity();
        }
    }

    resend = () => {
        const pwd = this.resendPwd.current.value;
        requestAPI("resend", { user: this.state.info.user.username, pwd: pwd }, (data) => {
            if (data.state) {
                alert("发送成功！请等待一会儿并查看手机邮箱。");
            } else {
                alert(`发送失败！信息：${data.msg}`);
            }
        });
    };

    render() {
        return (
            <UserBox setInfo={this.setInfo} customLoadData={this.customLoadData} uname={this.props.username}>
                <div>
                    <h3>相关页面(让站长懒一下)</h3>
                    <p class="about-page">
                        <a href="/accounts/settings/">账号设置</a>
                        <a href="/accounts/password_change/">密码设置</a>
                        <a href="/accounts/email_change/">邮箱设置</a>
                        <a href="/accounts/my_money/">我的财富</a>
                    </p>
                    <h3>邮箱设置</h3>
                    <div>
                        <p>
                            <strong>当前邮箱：</strong>
                        </p>
                        <p>{this.state.info.user && this.state.info.user.email}</p>
                        <p>{this.state.info.permissions && this.state.info.permissions.social ?
                            <span style={{
                                color: "green"
                            }}>{"邮箱已验证"}</span>
                            :
                            <span style={{
                                color: "red"
                            }}>{"邮箱未验证"}</span>
                        }</p>
                        {(!(this.state.info.permissions && this.state.info.permissions.social)) && <div>
                            <hr />
                            <p>
                                <strong>重新发送：</strong>
                            </p>
                            <i>{"如果您未收到我们发来的验证邮箱，并在垃圾邮箱里也未找到,或者说几年后才知道要验证，可以输入密码以重新发送。"}</i>
                            <p>
                                <label for="pwd">密码：</label>
                                <input type="password" name="pwd" ref={this.resendPwd} />
                            </p>
                            <Button onClick={this.resend}>
                                重新发送
                            </Button>
                        </div>}
                        <hr />
                        <div>
                            <p>
                                <strong>重置邮箱：</strong>
                            </p>
                            <i>{"邮箱不再使用？邮箱输入错误？可以再次更换邮箱并确认。"}</i>
                            <p>
                                <label for="email">新邮箱：</label>
                                <input type="email" name="email" ref={this.resetEmail} />
                            </p>
                            <p>
                                <label for="cpwd">密码：</label>
                                <input type="password" name="cpwd" ref={this.resetPwd} />
                            </p>
                            <Button onClick={this.reset}>
                                更换邮箱
                            </Button>
                        </div>
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

const ConnectedEmailChange = connect(mapStateToProps)(EmailChange);

render(<Page><ConnectedEmailChange /></Page>, document.getElementById('app'));
