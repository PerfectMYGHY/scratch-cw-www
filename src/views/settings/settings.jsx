import PropTypes from 'prop-types';

const React = require('react');

const Box = require('../../components/box/box.jsx');

const Page = require('../../components/page/www/page.jsx');
const InplaceInput = require('../../components/forms/inplace-input.jsx');
const render = require('../../lib/render.jsx');
const Formsy = require('formsy-react').default;
const decorateText = require('../../lib/decorate-text.jsx');
const Markdown = require('../../components/markdown/markdown.jsx').default;
const Carousel = require('../../components/carousel/carousel.jsx');
const Thumbnail = require('../../components/thumbnail/thumbnail.jsx');
import UserBox, {requestAPI} from '../../components/user-box/user-box.jsx';
const UsersCarousel = require('../../components/users-carousel/users-carousel.jsx');
const isEqual = require('lodash.isequal');
const bindAll = require('lodash.bindall');

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
            'customLoadData'
        ]);
    }

    setInfo () {

    }

    customLoadData () {

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
                        <i>功能正在制作中...</i>
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
    username: PropTypes.string
};

const mapStateToProps = state => {
    const user = state.session && state.session.session && state.session.session.user;
    return {
        username: user && user.username
    };
};

const ConnectedSettings = connect(mapStateToProps)(Settings);

render(<Page><ConnectedSettings /></Page>, document.getElementById('app'));
