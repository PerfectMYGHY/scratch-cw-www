import PropTypes from 'prop-types';

const React = require('react');

const Page = require('../../components/page/www/page.jsx');
const render = require('../../lib/render.jsx');
import UserBox, {requestAPI, fetch} from '../../components/user-box/user-box.jsx';
const isEqual = require('lodash.isequal');
const ProjectsList = require('./ProjectsList.jsx');
const Loading = require('../../components/loading_tip/Loading.jsx');
const bindAll = require('lodash.bindall');

const {connect} = require('react-redux');
const iziToast = require('izitoast');

require('./mystuff.scss');

const LIMIT = 10; // 每页数量，与后端约定一致

class MyStuff extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            loading: true,
            projects: [],
            info: {},
            tab: (window.location.href.indexOf('#') === -1 ? 'all' : window.location.href.split('#')[1]),
            offset: 0, // 当前偏移量
            hasMore: true, // 是否还有更多数据
            loadingMore: false // 是否正在加载更多
        };
        bindAll(this, [
            'handleProjectButtonClick',
            'handleGetMore',
            'loadData',
            'handleLoadMore',
            'deleteProject',
            'takeProjectBack',
            'cancelSharing',
            'setInfo',
            'switchTab'
        ]);
    }

    componentDidMount () {
        // 初始化加载
        this.loadData({reset: true});
    }

    componentDidUpdate (prevProps, prevState) {
        // 如果切换了tab，重新加载
        if (prevState.tab !== this.state.tab) {
            this.loadData({reset: true});
        }

        if (!isEqual(this.state.info, prevState.info)) { // 用户信息更新时加载
            this.loadData({reset: true});
        }
    }

    setInfo (state) {
        if (!isEqual(state.info, this.state.info)) {
            this.setState({
                info: state.info
            });
        }
    }

    // 加载数据（支持重置和追加）
    loadData ({reset = false, append = false} = {}) {
        const tab = this.state.tab;
        const offset = reset ? 0 : this.state.offset;
        const uid = this.state.info.user?.id;

        if (!uid) {
            // 如果还没有用户信息，等UserBox回调
            return;
        }

        this.setState({
            loading: !!reset,
            loadingMore: !!append
        });

        fetch(`${process.env.PROJECT_HOST}/users/${uid}/projects/${tab}?offset=${offset}&limit=${LIMIT}`, {
            method: 'POST'
        })
            .then(data => {
                // data 应该是数组
                const newProjects = append ?
                    [...this.state.projects, ...data] :
                    data;
                
                this.setState({
                    projects: newProjects,
                    loading: false,
                    loadingMore: false,
                    offset: offset + data.length,
                    hasMore: data.length === LIMIT // 如果返回数量等于limit，说明可能还有更多
                });
            })
            .catch(() => {
                this.setState({
                    loading: false,
                    loadingMore: false
                });
            });
    }

    // 加载更多
    handleLoadMore () {
        if (this.state.loadingMore || !this.state.hasMore) {
            return;
        }
        this.loadData({append: true});
    }

    // 切换tab
    switchTab (tab) {
        if (this.state.tab !== tab) {
            this.setState({
                tab: tab,
                projects: [], // 清空列表
                offset: 0,
                hasMore: true,
                loading: true
            });
        }
    }

    // ----- 以下操作直接修改现有数据，不重新加载 -----

    deleteProject (pid) {
        requestAPI(`delete_project/${pid}/`, {}, data => {
            if (data.state) {
                // 直接从列表中移除该作品
                this.setState(prevState => ({
                    projects: prevState.projects.filter(p => p.id !== pid)
                }));
            } else {
                iziToast.error({
                    title: '删除失败',
                    message: `错误信息：${data.msg}`,
                    timeout: 5000
                });
            }
        }, 'POST', `${process.env.PROJECT_HOST}/`);
    }

    takeProjectBack (pid) {
        requestAPI(`take_project_go_back/${pid}/`, {}, data => {
            if (data.state) {
                // 从回收站恢复后，从列表中移除
                this.setState(prevState => ({
                    projects: prevState.projects.filter(p => p.id !== pid)
                }));
            } else {
                iziToast.error({
                    title: '恢复失败',
                    message: `错误信息：${data.msg}`,
                    timeout: 5000
                });
            }
        }, 'POST', `${process.env.PROJECT_HOST}/`);
    }

    cancelSharing (pid) {
        requestAPI(`unshare/${pid}/`, {}, data => {
            if (data.state) {
                // 更新该作品的 public 状态为 false
                this.setState(prevState => ({
                    projects: prevState.projects.map(p => 
                        p.id === pid ? { ...p, public: false } : p
                    ).filter(p => prevState.tab !== 'shared' || p.id !== pid) // 仅tab=shared时才从列表删除本项目
                }));
            } else {
                iziToast.error({
                    title: '取消分享失败',
                    message: `错误信息：${data.msg}`,
                    timeout: 5000
                });
            }
        }, 'POST', `${process.env.PROJECT_HOST}/`);
    }

    handleProjectButtonClick (pid) {
        const tab = this.state.tab;
        if (tab === 'deleted') {
            this.takeProjectBack(pid);
        } else {
            this.deleteProject(pid);
        }
    }

    handleGetMore (pid, item) {
        const tab = this.state.tab;
        return (tab === 'shared' || item.public) && (
            <a
                onClick={() => {
                    this.cancelSharing(pid);
                }}
            >
                取消分享
            </a>
        );
    }

    getClicker (clickerTab) {
        return () => {
            this.switchTab(clickerTab);
        };
    }

    render () {
        const tabToText = {
            all: '全部作品',
            shared: '已分享的作品',
            unshared: '未分享的作品',
            deleted: '回收站'
        };
        const {tab, projects, loading, loadingMore, hasMore} = this.state;

        return (
            <UserBox
                setInfo={this.setInfo}
                // customLoadData={this.loadData}
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
                        {loading ? (
                            <Loading />
                        ) : (
                            <>
                                <h3>{tabToText[tab]}({projects.length})</h3>
                                <div>
                                    {projects.length > 0 ? (
                                        <>
                                            <ProjectsList
                                                items={projects}
                                                canRemove={tab !== 'deleted'}
                                                canTake={tab === 'deleted'}
                                                text=""
                                                onClick={this.handleProjectButtonClick}
                                                onGetMore={this.handleGetMore}
                                            />
                                            {/* 加载更多按钮 */}
                                            {hasMore && (
                                                <div style={{textAlign: 'center', marginTop: 20, marginBottom: 20}}>
                                                    <a
                                                        onClick={this.handleLoadMore}
                                                        style={{
                                                            display: 'inline-block',
                                                            padding: '8px 24px',
                                                            background: '#f0f0f0',
                                                            borderRadius: 4,
                                                            color: '#333',
                                                            textDecoration: 'none'
                                                        }}
                                                        aria-disabled={loadingMore}
                                                    >
                                                        {loadingMore ? '正在加载...' : '加载更多'}
                                                    </a>
                                                </div>
                                            )}
                                            {!hasMore && projects.length > 0 && (
                                                <p
                                                    style={{
                                                        textAlign: 'center',
                                                        color: '#999',
                                                        marginTop: 20,
                                                        marginBottom: 20
                                                    }}
                                                >
                                                    — 已加载全部 —
                                                </p>
                                            )}
                                        </>
                                    ) : (
                                        <p>空空如也</p>
                                    )}
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
