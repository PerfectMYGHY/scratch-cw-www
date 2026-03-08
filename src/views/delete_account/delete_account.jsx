const React = require('react');
const createRef = require('react').createRef;

const Page = require('../../components/page/www/page.jsx');
const render = require('../../lib/render.jsx');
const Button = require('../../components/forms/button.jsx');
const UserBox = require('../../components/user-box/user-box.jsx');
const {requestAPI} = require('../../components/user-info/user-info.jsx');

const {connect} = require('react-redux');

require('./delete_account.scss');

class DeleteAccount extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            info: {}
        };
        this.pwdRef = createRef();
    }

    setInfo = state => {
        this.setState(state);
    };

    customLoadData = () => {
        // ...
    };

    delete_account = () => {
        const pwd = this.pwdRef.current.value;
        requestAPI('delete_account', {user: this.state.info.user.username, pwd: pwd}, data => {
            if (data.status === 'success') {
                alert('账号已删除！');
                window.location.href = '/';
            } else {
                alert(`删除时出现了错误(除了密码不正确、功能暂时停用，其他任何错误都很可怕，遇到其他错误赶快找站长)：${data.msg}`);
            }
        });
    };

    render() {
        return (
            <UserBox setInfo={this.setInfo} customLoadData={this.customLoadData} uname={this.props.username}>
                <div>
                    <h3>删除账号</h3>
                    <i className="important-tip">
                        请注意！你确定要执行此操作吗？该操作会删除你的账号，但是不会立即删除账户数据，而是修改用户名和昵称，在后面加上&quot;-Deleted&quot;。
                        同时，你不能用原来的用户名或新的用户名登录。
                    </i>
                    <p>若您真想删除您的账号，请输入你的密码并点击『确定』按钮。</p>
                    <p>
                        <label htmlFor="pwd">您的密码：</label>
                        <input
                            type="password"
                            name="pwd"
                            id="pwd"
                            ref={this.pwdRef}
                        />
                    </p>
                    <Button onClick={this.delete_account}>
                        确定
                    </Button>
                </div>
                <div />
            </UserBox>
        );
    }
}

const mapStateToProps = state => ({
    username: state.session && state.session.session && state.session.session.user &&
    state.session.session.user.username
});

const ConnectedDeleteAccount = connect(mapStateToProps)(DeleteAccount);

render(<Page><ConnectedDeleteAccount /></Page>, document.getElementById('app'));
