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
const UserInfo = require('../user-info/user-info.jsx');

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

class UserBox extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            info: {},
            notFound: false
        };
        this.loadedData = false;
        this.interval = null;
    }

    componentDidUpdate(prevProps, prevState) {
        if (!this.loadedData) {
            if (Object.keys(this.state.info).length != 0 || this.state.notFound) {
                this.loadedData = true;
                this.loadData();
                this.startFrushLoop();
            }
        }
    }

    loadData = () => {
        if (this.state.notFound) {
            return;
        }
        this.props.setInfo(this.state);
        this.props.customLoadData(this.state);
    }

    startFrushLoop = () => {
        const loadData = this.loadData;
        this.interval = setInterval(() => {
            loadData();
        }, 1000);
    }

    handleSetInfo = (info) => {
        this.setState({
            info
        });
    }

    handleNotFound = () => {
        this.setState({
            notFound: true
        })
    }

    render() {
        return this.state.notFound ? (
            <NotAvailable />
        ) : (
            <div className="inner users" id="pagebox">
                <Box
                    headContent={
                        <UserInfo setInfo={this.handleSetInfo} info={this.state.info} onNotFound={this.handleNotFound} uname={this.props.uname} />
                    }
                >
                    {this.props.children && this.props.children[0]}
                </Box>
                {this.props.children && this.props.children[1]}
            </div>
        );
    }
}

UserBox.propTypes = {
    setInfo: PropTypes.func.isRequired,
    customLoadData: PropTypes.func.isRequired,
    children: PropTypes.array.isRequired,
    uname: PropTypes.string.isRequired
};

UserBox.defaultProps = {

};

const mapStateToProps = (state) => ({
    username: state.session && state.session.session && state.session.session.user && state.session.session.user.username
});

module.exports = connect(mapStateToProps)(UserBox);
