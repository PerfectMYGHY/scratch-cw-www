const React = require('react');
const Page = require('../../components/page/www/page.jsx');
const render = require('../../lib/render.jsx');
const bindAll = require('lodash.bindall');
const UserBox = require('../../components/user-box/user-box.jsx');
const { connect } = require('react-redux');

require('./my_money.scss');

const isSubset = (obj1, obj2, debug = false) => {
    for (const key in obj1) {
        if (!(key in obj2) || obj1[key] !== obj2[key]) {
            return false;
        }
    }
    return true;
};

class MyMoney extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            info: {},
            fetched: false
        };
        bindAll(this, [
            'setInfo',
            'customLoadData'
        ]);
    }

    setInfo (state) {
        if (!isSubset(state, this.state, true)) {
            this.setState(state);
        }
    }

    customLoadData (state) {
        
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
                    <h3>邮箱设置</h3>
                    <div>
                        <p>你当前的Scratch币个数：{this.state.info && this.state.info.flags && this.state.info.flags.money}</p>
                        <h3>如何获得更多的Scratch币？</h3>
                        <p>1.向朋友推荐我们的网站，复制下面邀请链接发给朋友，并让朋友注册账号，你和你的朋友可同时在原来的基础上获得20Scratch币。</p>
                        <p>2.发布你自己的作品，可以根据管理员给你的评价获得不同数量的Scratch币(可以见<a href="/community_mechanism">社区机制</a>)</p>
                        <p>3.捐赠我们(没有这个们)，可以根据Money数量获得不同的Scratch币。</p>
                        <h3>向朋友转发的链接</h3>
                        <i style={{color:"red"}}>注意：请不要修改URL中的任何一点，否则万一改错了，Scratch币可就加在别人身上了。</i>
                        <p>
                            <code>{`${process.env.BASE_HOST}/join?from=${this.state.info && this.state.info.user && this.state.info.user.id}`}</code>
                        </p>
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

const ConnectedMyMoney = connect(mapStateToProps)(MyMoney);

render(<Page><ConnectedMyMoney /></Page>, document.getElementById('app'));
