import PropTypes from 'prop-types';

const React = require('react');

const Box = require('../../components/box/box.jsx');

const FormattedMessage = require('react-intl').FormattedMessage;
const Page = require('../../components/page/www/page.jsx');
const InplaceInput = require('../../components/forms/inplace-input.jsx');
const render = require('../../lib/render.jsx');
const Formsy = require('formsy-react').default;
const decorateText = require('../../lib/decorate-text.jsx');
const Markdown = require('../../components/markdown/markdown.jsx').default;
const Carousel = require('../../components/carousel/carousel.jsx');
const Thumbnail = require('../../components/thumbnail/thumbnail.jsx');
import UserBox, {requestAPI, fetch} from '../../components/user-box/user-box.jsx';
const UsersCarousel = require('../../components/users-carousel/users-carousel.jsx');
const Loading = require("../../components/loading_tip/Loading.jsx");
const ReportsList = require('./ReportsList.jsx');
const { REPORT_OPTIONS } = require('../../components/modal/report/report-options.jsx');
const isEqual = require('lodash.isequal');
const bindAll = require('lodash.bindall');

const {connect} = require('react-redux');

require('./wait_reports.scss');

const isSubset = (obj1, obj2, debug = false) => {
    for (const key in obj1) {
        if (!(key in obj2) || obj1[key] !== obj2[key]) {
            return false;
        }
    }
    return true;
};

class WaitReports extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            reports: [],
            info: {},
            loading: true
        };
        bindAll(this, [
            'setInfo',
            'customLoadData'
        ]);
    }

    componentDidUpdate(prevProps, prevState) {
        if (!prevState.loading && this.state.loading) {
            setTimeout(() => {
                this.loadData();
            }, 0.2e3);
        }
    }

    setInfo (state) {
        if (!isSubset(state, this.state, true)) {
            this.setState(state);
        }
    }

    loadData() {
        const type = (window.location.href.indexOf("#") != -1 ? window.location.href.split("#")[1] : "projects");
        fetch(`${process.env.PROJECT_HOST}/scratch-admin/reports/${type}`,{
            method: "POST"
        })
        .then(data => {
            this.setState({
                reports: data,
                loading: false
            });
        });
    }

    customLoadData (state) {
        this.loadData();
    }

    async delete_project (pid,cid,rid) {
        await fetch(`${process.env.PROJECT_HOST}/check/report/${rid}/true`, {
            method: "POST"
        });
        requestAPI(`delete_project/${pid}/`,{},function (data){
            if (!data.state){
                alert(`删除失败！信息：${data.msg}`);
            } else {
                lastType = null; // 刷新
            }
            fetch(`${process.env.PROJECT_HOST}/proxy/reports/projects/${rid}`, {
                method: "DELETE"
            });
        },"POST",process.env.PROJECT_HOST+"/");
    }

    delete_comment (pid,cid,rid) {
        fetch(`${process.env.PROJECT_HOST}/proxy/comments/project/${pid}/comment/${cid}`, {
            method: "DELETE"
        });
        fetch(`${process.env.PROJECT_HOST}/proxy/reports/comments/${rid}`, {
            method: "DELETE"
        });
    }

    reject_comment_report (pid, cid, rid) {
        fetch(`${process.env.PROJECT_HOST}/proxy/admin/project/${pid}/comment/${cid}/undelete`, {
            method: "PUT"
        });
    }

    take_project_go_back (pid) {
        requestAPI(`take_project_go_back/${pid}/`,{},function (data){
            if (!data.state){
                alert(`恢复失败！信息：${data.msg}`);
            } else {
                lastType = null; // 刷新
            }
        },"POST",process.env.PROJECT_HOST+"/");
    }

    async reject_project_report (pid,rid) {
        await fetch(`${process.env.PROJECT_HOST}/check/report/${rid}/false`, {
            method: "POST"
        });
        fetch(`${process.env.PROJECT_HOST}/proxy/reports/projects/${rid}`, {
            method: "DELETE"
        });
    }

    getReportIntlIdFromReport (report) {
        for (const option of REPORT_OPTIONS) {
            if (option.value == report.body.report_category) { // 不可以使用===！因为value为字符串，report_category可能为数字，但只要值一致即可
                return option.label.id;
            }
            if (option.subcategories) { // 最多只有2级
                for (const sub of option.subcategories) {
                    if (sub.value == report.body.report_category) {
                        return sub.label.id;
                    }
                }
            }
        }
        return '未知类型'; // ID不存在直接显示ID，这样刚好符合要求...
    }

    render() {
        const type = (window.location.href.indexOf("#") != -1 ? window.location.href.split("#")[1] : "projects");
        const pages = { "projects": "被举报的作品", "comments": "被举报的评论" };
        const getLinks = () => {
            var ret = [];
            for (const page in pages) {
                const name = pages[page];
                ret.push(
                    <a 
                        href={`#${page}`} 
                        onClick={() => {
                            if (type != page) 
                                this.setState({
                                    loading: true
                                });
                        }}>
                        {name}
                    </a>
                );
            }
            return ret;
        }
        // UserBox用法：children中第一个元素被放在Box内部，第二个元素放在Box下方，必须有至少两个元素，多余元素不显示
        return (
            <div className="inner wait_reports" id="pagebox">
                <UserBox
                    setInfo={this.setInfo}
                    customLoadData={this.customLoadData}
                    uname={this.props.username}
                >
                    <div>
                        <h3>相关页面</h3>
                        <p class="about-page">
                            {getLinks()}
                        </p>
                        <div>
                            {this.state.loading ? <Loading /> : [
                                <h3>等待审核的举报 - {pages[type]}({this.state.reports.length})</h3>,
                                <div>
                                    {this.state.reports.length > 0 ? 
                                        <ReportsList items={this.state.reports} canRemove={type != "deleted"} canTake={type == "deleted"} text=""
                                            onClick={async (pid, cid, rid) => {
                                                if (type != "deleted") {
                                                    if (type == "comments") {
                                                        await fetch(`${process.env.PROJECT_HOST}/check/report/${rid}/true`, {
                                                            method: "POST"
                                                        });
                                                    }
                                                    (type == "projects" ? this.delete_project : this.delete_comment)(pid, cid, rid);
                                                } else if (type == "deleted") {
                                                    this.take_project_go_back(pid);
                                                }
                                            }} more={(pid, item, cid, rid) => {
                                                if (type == "projects") {
                                                    return (type == "shared" || item.public) &&
                                                        (<a onClick={() => {
                                                            this.reject_project_report(pid,rid);
                                                        }}>
                                                            否定该举报
                                                        </a>);
                                                } else {
                                                    return [
                                                        <a onClick={() => {
                                                            fetch(`${process.env.PROJECT_HOST}/check/report/${rid}/false`, {
                                                                method: "POST"
                                                            }).then(() => {
                                                                this.reject_comment_report(pid, cid, rid);
                                                            });
                                                        }}>
                                                            否定该举报并打回
                                                        </a>
                                                    ];
                                                }
                                            }}
                                            getChildren={type == "projects" ? ((pid, item, report) => {
                                                return [
                                                    <p>举报类型：<FormattedMessage id={this.getReportIntlIdFromReport(report)} /></p>,
                                                    <p>举报信息：{report.body.notes}</p>
                                                ];
                                            }) : null}
                                            btnt={type == "comments" ? "确认该举报真实性并删除" : "确认并删除"} />
                                    : <p>空空如也</p>}
                                </div>
                            ]}
                        </div>
                    </div>
                    <div>

                    </div>
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
