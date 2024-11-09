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

require('./delete_account.scss');

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

class DeleteAccount extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            info: {}
        };
        this.pwdRef = createRef();
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

    render() {
        return (
            <UserBox setInfo={this.setInfo} customLoadData={this.customLoadData} uname={this.props.username}>
                <div>
                    <h3>删除账号</h3>
                    <i class="important-tip">请注意！你确定要执行此操作吗？该操作会删除你在数据库里的账号、任何与之关联的项目、消息等，可能会导致改编自你的作品的人的链接失效！请慎重考虑。</i>
                    <p>若您真想删除您的账号，请输入你的密码并点击『确定』按钮。</p>
                    <p>
                        <label for="pwd">您的密码：</label>
                        <input type="password" name="pwd" id="pwd" ref={this.pwdRef} />
                    </p>
                    <Button onClick={this.delete_account}>
                        确定
                    </Button>
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

const ConnectedDeleteAccount = connect(mapStateToProps)(DeleteAccount);

render(<Page><ConnectedDeleteAccount /></Page>, document.getElementById('app'));
