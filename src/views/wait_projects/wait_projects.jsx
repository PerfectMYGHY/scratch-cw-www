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
const ProjectsList = require('./ProjectsList.jsx');
const isEqual = require('lodash.isequal');
const bindAll = require('lodash.bindall');

const {connect} = require('react-redux');

require('./wait_projects.scss');

const isSubset = (obj1, obj2, debug = false) => {
    for (const key in obj1) {
        if (!(key in obj2) || obj1[key] !== obj2[key]) {
            return false;
        }
    }
    return true;
};

class WaitProjects extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            projects: [],
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
        const type = (window.location.href.indexOf("#") != -1 ? window.location.href.split("#")[1] : "all");
        fetch(`${process.env.PROJECT_HOST}/scratch-admin/projects/not_passed/${type}`,{
            method: "POST"
        })
            .then(data => {
                this.setState({
                    projects: data,
                    loading: false
                });
            });

    }

    customLoadData (state) {
        this.loadData();
    }

    delete_project (pid) {
        requestAPI(`delete_project/${pid}/`,{},function (data){
            if (!data.state){
                alert(`删除失败！信息：${data.msg}`);
            } else {
                lastType = null; // 刷新
            }
        },"POST",process.env.PROJECT_HOST+"/");
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

    unshare (pid) {
        requestAPI(`unshare/${pid}/`,{},function (data){
            if (!data.state){
                alert(`取消分享失败！信息：${data.msg}`);
            } else {
                lastType = null; // 刷新
            }
        },"POST",process.env.PROJECT_HOST+"/");
    }

    render() {
        const type = (window.location.href.indexOf("#") != -1 ? window.location.href.split("#")[1] : "all");
        const pages = {"all": "全部", "unchecked": "未检查的", "checked": "已检查但未通过的"};
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
                                <h3>等待审核的页面 - {pages[type]}({this.state.projects.length})</h3>,
                                <div>
                                    {this.state.projects.length > 0 ? 
                                        <ProjectsList items={this.state.projects} canRemove={type != "deleted"} canTake={type == "deleted"} text=""
                                        onClick={(pid)=>{
                                            if (type != "deleted"){
                                                this.delete_project(pid);
                                            } else if (type == "deleted"){
                                                this.take_project_go_back(pid);
                                            }
                                        }} more={(pid,item)=>{
                                            return (type == "shared" || item.public) && 
                                            (<a onClick={()=>{
                                                this.unshare(pid);
                                            }}>
                                                取消分享
                                            </a>);
                                        }}
                                        getChildren={(pid,item)=>{
                                            return [
                                                item.looked ? <p style={{
                                                    color: "red"
                                                }}>审核未通过</p> : <p class="orange-color">未审核</p>
                                                ,
                                                item.liked && 
                                                <div>
                                                    <p style={{
                                                        color: "red"
                                                    }}>
                                                        程序审核发现重复：
                                                        <a href={`/projects/${item.liked_project}/`} target="_blank">{item.liked_project}</a>
                                                    </p>
                                                </div>
                                            ];
                                        }} />
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
