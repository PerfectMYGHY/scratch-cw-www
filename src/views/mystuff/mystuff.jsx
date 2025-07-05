import PropTypes from 'prop-types';

const React = require('react');

const Page = require('../../components/page/www/page.jsx');
const render = require('../../lib/render.jsx');
import UserBox, {requestAPI} from '../../components/user-box/user-box.jsx';
const isEqual = require('lodash.isequal');
const ProjectsList = require('./ProjectsList.jsx');
const Loading = require('../../components/loading_tip/Loading.jsx');
const bindAll = require('lodash.bindall');

const {connect} = require('react-redux');

require('./mystuff.scss');

class MyStuff extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            loading: true,
            projects: [],
            info: {},
            tab: (window.location.href.indexOf('#') === -1 ? 'all' : window.location.href.split('#')[1])
        };
        bindAll(this, [
            'handleProjectButtonClick',
            'handleGetMore',
            'loadData',
            'deleteProject',
            'takeProjectBack',
            'cancelSharing',
            'setInfo'
        ]);
    }

    componentDidUpdate (prevProps, prevState, snapshot) {
        if (!prevState.loading && this.state.loading) {
            this.loadData(this.state);
        }
    }

    setInfo (state) {
        if (!isEqual(state.info, this.state.info)) {
            this.setState({
                info: state.info
            });
        }
    }

    loadData (state) {
        const tab = this.state.tab;
        fetch(`${process.env.PROJECT_HOST}/users/${state.info.user.id}/projects/${tab}`, {
            method: 'POST'
        })
            .then(response => response.json())
            .then(data => {
                this.setState({
                    projects: data,
                    loading: false
                });
            });
    }

    deleteProject (pid) {
        requestAPI(`delete_project/${pid}/`, {}, data => {
            if (data.state){
                this.loadData(this.state);
            } else {
                window.alert(`删除失败！信息：${data.msg}`);
            }
        }, 'POST', `${process.env.PROJECT_HOST}/`);
    }

    takeProjectBack (pid) {
        requestAPI(`take_project_go_back/${pid}/`, {}, data => {
            if (data.state){
                this.loadData(this.state);
            } else {
                window.alert(`恢复失败！信息：${data.msg}`);
            }
        }, 'POST', `${process.env.PROJECT_HOST}/`);
    }

    cancelSharing (pid) {
        requestAPI(`unshare/${pid}/`, {}, data => {
            if (data.state){
                this.loadData(this.state);
            } else {
                window.alert(`取消分享失败！信息：${data.msg}`);
            }
        }, 'POST', `${process.env.PROJECT_HOST}/`);
    }

    handleProjectButtonClick (pid) {
        const tab = this.state.tab;
        if (tab !== 'deleted'){
            this.deleteProject(pid);
        } else if (tab === 'deleted'){
            this.takeProjectBack(pid);
        }
    }

    handleGetMore (pid, item) {
        const tab = this.state.tab;
        return (tab === 'shared' || item.public) &&
            (<a
                onClick={() => {
                    this.cancelSharing(pid);
                }}
            >
                取消分享
            </a>);
    }

    getClicker (clickerTab) {
        return () => {
            const tab = this.state.tab;
            if (tab !== clickerTab) {
                this.setState({
                    loading: true,
                    tab: clickerTab
                });
            }
        };
    }

    render () {
        const tabToText = {all: '全部作品', shared: '已分享的作品', unshared: '未分享的作品', deleted: '回收站'};
        const tab = this.state.tab;
        return (
            <UserBox
                setInfo={this.setInfo}
                customLoadData={this.loadData}
                uname={this.props.username}
                needLogin
            >
                <div>
                    <h3>相关页面</h3>
                    <p className="about-page">
                        <a
                            href="#all"
                            onClick={this.getClicker('all')}
                        >全部作品</a>
                        <a
                            href="#shared"
                            onClick={this.getClicker('shared')}
                        >已分享的</a>
                        <a
                            href="#unshared"
                            onClick={this.getClicker('unshared')}
                        >未分享的</a>
                        <a
                            href="#deleted"
                            onClick={this.getClicker('deleted')}
                        >回收站</a>
                    </p>
                    <div>
                        {this.state.loading ? <Loading /> : (
                            <>
                                <h3>{tabToText[tab]}({this.state.projects.length})</h3>
                                <div>
                                    {this.state.projects.length > 0 ?
                                        <ProjectsList
                                            items={this.state.projects}
                                            canRemove={tab !== 'deleted'}
                                            canTake={tab === 'deleted'}
                                            text=""
                                            onClick={this.handleProjectButtonClick}
                                            onGetMore={this.handleGetMore}
                                        /> :
                                        <p>空空如也</p>}
                                </div>
                            </>
                        )}
                    </div>
                </div>
                <></>
            </UserBox>
        );
    }
}

MyStuff.propTypes = {
    username: PropTypes.string
};

const mapStateToProps = state => {
    const user = state.session && state.session.session && state.session.session.user;
    return {
        username: user && user.username
    };
};

const ConnectedMyStuff = connect(mapStateToProps)(MyStuff);

render(<Page><ConnectedMyStuff /></Page>, document.getElementById('app'));
