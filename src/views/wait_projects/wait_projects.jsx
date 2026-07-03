/* eslint-disable react/jsx-handler-names */
/* eslint-disable react/jsx-no-bind */
import PropTypes from 'prop-types';

const React = require('react');

const Page = require('../../components/page/www/page.jsx');
const render = require('../../lib/render.jsx');
import UserBox, {requestAPI, fetch} from '../../components/user-box/user-box.jsx';
const Loading = require('../../components/loading_tip/Loading.jsx');
const ProjectsList = require('./ProjectsList.jsx');
const bindAll = require('lodash.bindall');
const NotAvailable = require('../../components/not-available/not-available.jsx');
const iziToast = require('izitoast');
const classNames = require('classnames');

const {connect} = require('react-redux');

require('./wait_projects.scss');

const LIMIT = 10; // 每页数量，与后端约定一致

const getStatus = require('../../components/grab/grab-status.jsx');

class WaitProjects extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            loading: true,
            loadingReset: false,
            projects: [],
            info: {},
            error: false,
            tab: (window.location.href.indexOf('#') === -1 ? 'all' : window.location.href.split('#')[1]),
            offset: 0,
            hasMore: true,
            loadingMore: false
        };
        bindAll(this, [
            'setInfo',
            'loadData',
            'handleLoadMore',
            'switchTab',
            'deleteProject',
            'takeProjectBack',
            'cancelSharing',
            'handleProjectButtonClick',
            'handleGetMore',
            'getChildren',
            'getGrab',
            'handleReload'
        ]);
    }

    componentDidMount () {
        this.loadData({reset: true});
    }

    componentDidUpdate (prevProps, prevState) {
        // 切换tab时重新加载
        if (prevState.tab !== this.state.tab) {
            this.loadData({reset: true});
        }

        // 用户信息更新时重新加载
        if (!this.isSubset(this.state.info, prevState.info)) {
            this.loadData({reset: true});
        }
    }

    // 判断两个对象是否相等（简化版 isEqual）
    isSubset (obj1, obj2) {
        return JSON.stringify(obj1) === JSON.stringify(obj2);
    }

    setInfo (state) {
        if (!this.isSubset(state.info, this.state.info)) {
            this.setState({
                info: state.info
            });
        }
    }

    // 加载数据（支持重置和追加）
    loadData ({reset = false, append = false, limit = LIMIT} = {}) {
        const tab = this.state.tab;
        const offset = reset ? 0 : this.state.offset;

        this.setState({
            loadingReset: !!reset,
            loadingMore: !!append
        });

        fetch(`${process.env.PROJECT_HOST}/scratch-admin/projects/not_passed/${tab}?offset=${offset}&limit=${limit}`, {
            method: 'POST'
        })
            .then(data => {
                const newProjects = append ?
                    [...this.state.projects, ...data] :
                    data;
                
                this.setState({
                    projects: newProjects,
                    loadingReset: false,
                    loading: false,
                    loadingMore: false,
                    offset: offset + data.length,
                    hasMore: data.length === limit,
                    error: false
                });
            })
            .catch(() => {
                this.setState({
                    loadingReset: false,
                    loading: false,
                    loadingMore: false,
                    error: true
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
                projects: [],
                offset: 0,
                hasMore: true,
                loading: true,
                error: false
            });
        }
    }

    // ----- 以下操作直接修改现有数据，不重新加载 -----

    deleteProject (pid) {
        requestAPI(`delete_project/${pid}/`, {}, data => {
            if (data.state) {
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
                this.setState(prevState => ({
                    projects: prevState.projects.map(p =>
                        (p.id === pid ? {...p, public: false} : p)
                    ).filter(p => prevState.tab !== 'shared' || p.id !== pid)
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
            <a onClick={() => this.cancelSharing(pid)}>
                取消分享
            </a>
        );
    }

    getGrab (pid) {
        return () => {
            requestAPI(`grab/?pid=${pid}`, {}, data => {
                if (data.status === 'success') {
                    this.loadData({reset: true, limit: this.state.projects.length});
                } else {
                    iziToast.error({
                        title: '抢单失败',
                        message: `错误信息：${data.msg}`,
                        timeout: 5000
                    });
                    this.loadData({reset: true, limit: this.state.projects.length});
                }
            }, 'POST', `${process.env.PROJECT_HOST}/`);
        };
    }

    handleReload () {
        this.loadData({reset: true});
    }

    // 渲染每个项目的额外信息（审核状态、重复提醒等）
    getChildren (pid, item) {
        const children = [item.grabbed ? (item.grabbed_by_you ? (
            <button disabled>
                您已抢此单
            </button>
        ) : (
            <button disabled>
                此单已被抢
            </button>
        )) : (
            <button onClick={this.getGrab(pid)}>
                抢单
            </button>
        ), (<br key="grabbing_button_br" />)];
        
        // 审核状态
        children.push(getStatus(item));
        
        // 重复项目提示
        if (item.has_similar_project) {
            children.push(
                <div key="similar">
                    <p style={{color: 'red'}}>
                        程序审核发现重复：
                        <a
                            href={`/projects/${item.similar_project.id}/`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {item.similar_project.title}
                        </a>
                    </p>
                </div>
            );
        }
        
        // 自动审核错误信息
        if (item.auto_check_info) {
            children.push(
                <div key="auto_check">
                    <p style={{color: 'red'}}>程序审核时出现错误（请报备站长）:</p>
                    <p style={{color: 'red', whiteSpace: 'pre-wrap'}}>{item.auto_check_info}</p>
                </div>
            );
        }
        
        return children;
    }

    render () {
        const tabToText = {
            all: '全部',
            unchecked: '未审核的',
            checked: '已查看的'
        };
        if (this.state.info && this.state.info.permissions && this.state.info.permissions.webmaster) { // 如果是站长
            tabToText.escalated = '转争议的';
        }
        const {tab, projects, loading, loadingMore, hasMore, error} = this.state;

        if (error) {
            return <NotAvailable />;
        }

        return (
            <div
                className="inner wait_reports"
                id="pagebox"
            >
                <UserBox
                    setInfo={this.setInfo}
                    uname={this.props.username}
                >
                    <div>
                        <h3>相关页面</h3>
                        <p className="about-page">
                            {Object.keys(tabToText).map(key => (
                                <a
                                    key={key}
                                    href={`#${key}`}
                                    onClick={() => this.switchTab(key)}
                                >
                                    {tabToText[key]}
                                </a>
                            ))}
                        </p>
                        <div>
                            {loading ? (
                                <Loading />
                            ) : (
                                <>
                                    <h3>
                                        等待审核的页面 - {tabToText[tab]}
                                        <a
                                            onClick={this.handleReload}
                                            style={{
                                                marginLeft: '5px'
                                            }}
                                        >
                                            刷新
                                        </a>
                                    </h3>
                                    <div className="loading-parent">
                                        <div
                                            className={classNames({
                                                'inner-loading-overlay': true,
                                                'loading': this.state.loadingReset
                                            })}
                                        >
                                            <div className="spinner" />
                                        </div>
                                        {projects.length > 0 ? (
                                            <>
                                                <ProjectsList
                                                    items={projects}
                                                    canRemove={tab !== 'deleted'}
                                                    canTake={tab === 'deleted'}
                                                    text=""
                                                    onClick={this.handleProjectButtonClick}
                                                    more={this.handleGetMore}
                                                    getChildren={this.getChildren}
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
                                                    <p className="bottom-tip">
                                                        — 已加载全部 —
                                                    </p>
                                                )}
                                            </>
                                        ) : (
                                            <p className="bottom-tip">
                                                — 空空如也 —
                                            </p>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                    <div />
                </UserBox>
            </div>
        );
    }
}

WaitProjects.propTypes = {
    username: PropTypes.string
};

const mapStateToProps = state => {
    const user = state.session && state.session.session && state.session.session.user;
    return {
        username: user && user.username
    };
};

const ConnectedWaitProjects = connect(mapStateToProps)(WaitProjects);

render(<Page><ConnectedWaitProjects /></Page>, document.getElementById('app'));
