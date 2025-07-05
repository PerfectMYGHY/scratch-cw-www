const React = require('react');

const Box = require('../box/box.jsx');

const NotAvailable = require('../not-available/not-available.jsx');
const PropTypes = require('prop-types');
const UserInfo = require('../user-info/user-info.jsx');
const bindAll = require('lodash.bindall');

const {selectHasFetchedSession} = require('../../redux/session');

const {connect} = require('react-redux');

class UserBox extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            info: {},
            notFound: false
        };
        this.loadedData = false;
        this.interval = null;
        bindAll(this, [
            'loadData',
            'startFrushLoop',
            'handleSetInfo',
            'handleNotFound',
            'handleFound'
        ]);
    }

    componentDidUpdate (prevProps, prevState) {
        if (!this.loadedData) {
            if (Object.keys(this.state.info).length !== 0 || this.state.notFound) {
                this.loadedData = true;
                this.loadData();
                this.startFrushLoop();
            }
        }
        if (!this.state.notFound && !this.props.username && this.props.fetchedUsername && this.props.needLogin) {
            this.setState({
                notFound: true
            });
        }
        if (this.state.notFound && !prevProps.username && this.props.username) {
            this.setState({
                notFound: false
            });
        }
    }

    loadData () {
        if (this.state.notFound) {
            return;
        }
        this.props.setInfo(this.state);
        this.props.customLoadData(this.state);
    }

    startFrushLoop () {
        const loadData = this.loadData;
        this.interval = setInterval(() => {
            loadData();
        }, 10000);
    }

    handleSetInfo (info) {
        this.setState({
            info
        });
    }

    handleNotFound () {
        this.setState({
            notFound: true
        });
    }

    handleFound () {
        return new Promise(resolve => {
            this.setState({
                notFound: false
            }, () => {
                resolve();
            });
        });
    }

    render () {
        return this.state.notFound ? (
            <NotAvailable />
        ) : (
            <div
                className="inner users"
                id="pagebox"
            >
                <Box
                    headContent={
                        <UserInfo
                            onSetInfo={this.handleSetInfo}
                            info={this.state.info}
                            onNotFound={this.handleNotFound}
                            onFound={this.handleFound}
                            uname={this.props.uname}
                        />
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
    children: PropTypes.arrayOf(PropTypes.element).isRequired,
    uname: PropTypes.string.isRequired,
    fetchedUsername: PropTypes.bool,
    username: PropTypes.string,
    needLogin: PropTypes.bool
};

UserBox.defaultProps = {

};

const mapStateToProps = state => {
    const user = state.session && state.session.session && state.session.session.user;
    return {
        username: user && user.username,
        fetchedUsername: selectHasFetchedSession(state)
    };
};

const WrappedUserBox = connect(mapStateToProps)(UserBox);

module.exports = WrappedUserBox;
module.exports.requestAPI = UserInfo.requestAPI;
