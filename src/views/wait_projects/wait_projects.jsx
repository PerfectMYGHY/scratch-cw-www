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

const {connect} = require('react-redux');

require('./wait_projects.scss');

const LIMIT = 10; // 每页数量，与后端约定一致

class WaitProjects extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            loading: true,
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
            'getChildren'
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
    loadData ({reset = false, append = false} = {}) {
        const tab = this.state.tab;
        const offset = reset ? 0 : this.state.offset;

        this.setState({
            loading: !!reset,
            loadingMore: !!append
        });

        fetch(`${process.env.PROJECT_HOST}/scratch-admin/projects/not_passed/${tab}?offset=${offset}&limit=${LIMIT}`, {
            method: 'POST'
        })
            .then(data => {
                const newProjects = append ?
                    [...this.state.projects, ...data] :
                    data;
                
                this.setState({
                    projects: newProjects,
                    loading: false,
                    loadingMore: false,
                    offset: offset + data.length,
                    hasMore: data.length === LIMIT,
                    error: false
                });
            })
            .catch(() => {
                this.setState({
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

    // 渲染每个项目的额外信息（审核状态、重复提醒等）
    getChildren (pid, item) {
        const children = [];
        
        // 审核状态
        if (item.reviewed) {
            children.push(
                <p
                    key="reviewed"
                    style={{color: 'red'}}
                >
                    审核未通过
                </p>
            );
        } else {
            children.push(
                <p
                    key="unreviewed"
                    className="orange-color"
                >
                    未审核
                </p>
            );
        }
        
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
                    <p style={{color: 'red'}}>审核时出现错误:</p>
                    <p style={{color: 'red'}}>{item.auto_check_info}</p>
                </div>
            );
        }
        
        return children;
    }

    render () {
        const tabToText = {
            all: '全部',
            unchecked: '未检查的',
            checked: '已检查但未通过的'
        };
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
                    // customLoadData={this.loadData} // 已通过componentDidUpdate监听info变化
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
                                    <h3>等待审核的页面 - {tabToText[tab]}({projects.length})</h3>
                                    <div>
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