/* eslint-disable react/jsx-no-bind */
/* eslint-disable react/jsx-handler-names */
import PropTypes from 'prop-types';

const React = require('react');

const Page = require('../../components/page/www/page.jsx');
const render = require('../../lib/render.jsx');
import UserBox, {requestAPI, fetch} from '../../components/user-box/user-box.jsx';
const Loading = require('../../components/loading_tip/Loading.jsx');
const ReportsList = require('./ReportsList.jsx');
const {REPORT_OPTIONS} = require('../../components/modal/report/report-options.jsx');
const isEqual = require('lodash.isequal');
const bindAll = require('lodash.bindall');
const iziToast = require('izitoast');
const {FormattedMessage} = require('react-intl');
const NotAvailable = require('../../components/not-available/not-available.jsx');

const {connect} = require('react-redux');

require('./wait_reports.scss');

const LIMIT = 10;

class WaitReports extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            loading: true,
            reports: [],
            info: {},
            error: false,
            tab: (window.location.href.indexOf('#') === -1 ? 'projects' : window.location.href.split('#')[1]),
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
            'deleteComment',
            'takeProjectBack',
            'rejectProjectReport',
            'rejectCommentReport',
            'handleReportAction',
            'handleGetMore',
            'getChildren',
            'getReportIntlIdFromReport'
        ]);
    }

    componentDidMount () {
        this.loadData({reset: true});
    }

    componentDidUpdate (prevProps, prevState) {
        if (prevState.tab !== this.state.tab) {
            this.loadData({reset: true});
        }
        if (!isEqual(this.state.info, prevState.info)) {
            this.loadData({reset: true});
        }
    }

    setInfo (state) {
        if (!isEqual(state.info, this.state.info)) {
            this.setState({info: state.info});
        }
    }

    loadData ({reset = false, append = false} = {}) {
        const tab = this.state.tab;
        const offset = reset ? 0 : this.state.offset;

        this.setState({
            loading: !!reset,
            loadingMore: !!append
        });

        fetch(`${process.env.PROJECT_HOST}/scratch-admin/reports/${tab}?offset=${offset}&limit=${LIMIT}`, {
            method: 'POST'
        })
            .then(data => {
                const newReports = append ? [...this.state.reports, ...data] : data;
                this.setState({
                    reports: newReports,
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

    handleLoadMore () {
        if (this.state.loadingMore || !this.state.hasMore) return;
        this.loadData({append: true});
    }

    switchTab (tab) {
        if (this.state.tab !== tab) {
            this.setState({
                tab: tab,
                reports: [],
                offset: 0,
                hasMore: true,
                loading: true,
                error: false
            });
        }
    }

    // ----- 举报操作 -----

    async deleteProject (pid, cid, rid) {
        try {
            await fetch(`${process.env.PROJECT_HOST}/check/report/${rid}/true`, {
                method: 'POST'
            });
            
            requestAPI(`delete_project/${pid}/`, {}, data => {
                if (data.state) {
                    this.setState(prevState => ({
                        reports: prevState.reports.filter(r => r.id !== rid)
                    }));
                    iziToast.success({
                        title: '处理成功',
                        message: '已删除作品并处理举报',
                        timeout: 3000
                    });
                } else {
                    iziToast.error({
                        title: '删除失败',
                        message: `错误信息：${data.msg}`,
                        timeout: 5000
                    });
                }
            }, 'POST', `${process.env.PROJECT_HOST}/`);
            
            await fetch(`${process.env.PROJECT_HOST}/proxy/reports/projects/${rid}`, {
                method: 'DELETE'
            });
        } catch (e) {
            iziToast.error({
                title: '操作失败',
                message: '网络错误，请重试',
                timeout: 5000
            });
        }
    }

    async deleteComment (pid, cid, rid) {
        try {
            await fetch(`${process.env.PROJECT_HOST}/check/report/${rid}/true`, {
                method: 'POST'
            });
            
            await fetch(`${process.env.PROJECT_HOST}/proxy/comments/project/${pid}/comment/${cid}`, {
                method: 'DELETE'
            });
            
            await fetch(`${process.env.PROJECT_HOST}/proxy/reports/comments/${rid}`, {
                method: 'DELETE'
            });
            
            this.setState(prevState => ({
                reports: prevState.reports.filter(r => r.id !== rid)
            }));
            
            iziToast.success({
                title: '处理成功',
                message: '已删除评论并处理举报',
                timeout: 3000
            });
        } catch (e) {
            iziToast.error({
                title: '操作失败',
                message: '网络错误，请重试',
                timeout: 5000
            });
        }
    }

    takeProjectBack (pid) {
        requestAPI(`take_project_go_back/${pid}/`, {}, data => {
            if (data.state) {
                this.setState(prevState => ({
                    reports: prevState.reports.filter(r => r.project?.id !== pid)
                }));
                iziToast.success({
                    title: '恢复成功',
                    message: '作品已从回收站恢复',
                    timeout: 3000
                });
            } else {
                iziToast.error({
                    title: '恢复失败',
                    message: `错误信息：${data.msg}`,
                    timeout: 5000
                });
            }
        }, 'POST', `${process.env.PROJECT_HOST}/`);
    }

    async rejectProjectReport (pid, rid) {
        try {
            await fetch(`${process.env.PROJECT_HOST}/check/report/${rid}/false`, {
                method: 'POST'
            });
            
            await fetch(`${process.env.PROJECT_HOST}/proxy/reports/projects/${rid}`, {
                method: 'DELETE'
            });
            
            this.setState(prevState => ({
                reports: prevState.reports.filter(r => r.id !== rid)
            }));
            
            iziToast.success({
                title: '处理成功',
                message: '已否定该举报',
                timeout: 3000
            });
        } catch (e) {
            iziToast.error({
                title: '操作失败',
                message: '网络错误，请重试',
                timeout: 5000
            });
        }
    }

    async rejectCommentReport (pid, cid, rid) {
        try {
            await fetch(`${process.env.PROJECT_HOST}/check/report/${rid}/false`, {
                method: 'POST'
            });
            
            await fetch(`${process.env.PROJECT_HOST}/proxy/admin/project/${pid}/comment/${cid}/undelete`, {
                method: 'PUT'
            });
            
            this.setState(prevState => ({
                reports: prevState.reports.filter(r => r.id !== rid)
            }));
            
            iziToast.success({
                title: '处理成功',
                message: '已否定举报并恢复评论',
                timeout: 3000
            });
        } catch (e) {
            iziToast.error({
                title: '操作失败',
                message: '网络错误，请重试',
                timeout: 5000
            });
        }
    }

    // 统一处理举报操作
    handleReportAction (pid, cid, rid) {
        const tab = this.state.tab;
        if (tab === 'projects') {
            this.deleteProject(pid, cid, rid);
        } else if (tab === 'comments') {
            this.deleteComment(pid, cid, rid);
        }
    }

    // 更多操作（对接 ReportsList 的 more 回调）
    handleGetMore (pid, report, cid, rid) {
        const tab = this.state.tab;
        if (tab === 'projects') {
            return (
                <a onClick={() => this.rejectProjectReport(pid, rid)}>
                    否定该举报
                </a>
            );
        } else if (tab === 'comments') {
            return (
                <a onClick={() => this.rejectCommentReport(pid, cid, rid)}>
                    否定该举报并打回
                </a>
            );
        }
        return null;
    }

    // 额外信息（对接 ReportsList 的 getChildren 回调）
    getChildren (pid, report) {
        if (!report) return null;
        return [
            <p key="category">
                举报类型：<FormattedMessage id={this.getReportIntlIdFromReport(report)} />
            </p>,
            <p key="notes">举报信息：{report.body?.notes || '无'}</p>
        ];
    }

    getReportIntlIdFromReport (report) {
        const category = report.body?.report_category;
        for (const option of REPORT_OPTIONS) {
            // eslint-disable-next-line eqeqeq
            if (option.value == category) {
                return option.label.id;
            }
            if (option.subcategories) {
                for (const sub of option.subcategories) {
                    // eslint-disable-next-line eqeqeq
                    if (sub.value == category) {
                        return sub.label.id;
                    }
                }
            }
        }
        return '未知类型';
    }

    render () {
        const tabToText = {
            projects: '被举报的作品',
            comments: '被举报的评论'
        };
        const {tab, reports, loading, loadingMore, hasMore, error} = this.state;

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
                                    <h3>等待审核的举报 - {tabToText[tab]}({reports.length})</h3>
                                    <div>
                                        {reports.length > 0 ? (
                                            <>
                                                <ReportsList
                                                    items={reports}
                                                    canRemove={false}
                                                    canTake={false}
                                                    text=""
                                                    onClick={this.handleReportAction}
                                                    more={this.handleGetMore}
                                                    getChildren={this.getChildren}
                                                    btnt={tab === 'comments' ? '确认该举报真实性并删除' : '确认并删除'}
                                                />
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
                                                {!hasMore && reports.length > 0 && (
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

WaitReports.propTypes = {
    username: PropTypes.string
};

const mapStateToProps = state => {
    const user = state.session && state.session.session && state.session.session.user;
    return {
        username: user && user.username
    };
};

const ConnectedWaitReports = connect(mapStateToProps)(WaitReports);

render(<Page><ConnectedWaitReports /></Page>, document.getElementById('app'));
