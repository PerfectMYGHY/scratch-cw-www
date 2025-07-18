﻿const FormattedMessage = require('react-intl').FormattedMessage;
const React = require('react');
const useRef = require('react').useRef;
const useState  = require('react').useState ;

const Box = require('../../components/box/box.jsx');

const Page = require('../../components/page/www/page.jsx');
const InplaceInput = require('../../components/forms/inplace-input.jsx');
const render = require('../../lib/render.jsx');
const ReactDom = require('react-dom');
const classNames = require('classnames');
const Formsy = require('formsy-react').default;
const decorateText = require('../../lib/decorate-text.jsx');
const NotAvailable = require('../../components/not-available/not-available.jsx');
const MarkdownIt = require('markdown-it');
const Carousel = require('../../components/carousel/carousel.jsx');
const Button = require('../../components/forms/button.jsx');
const ReportsList = require('./ReportsList.jsx');
const { reportOptionsShape, REPORT_OPTIONS } = require('../../components/modal/report/report-options.jsx');
const Loading = require("../../components/loading_tip/Loading.jsx");

const Cookies = require('js-cookie');

require('./wait_reports.scss');

const setting = require('/src/setting');

var uname = Cookies.get("user");

var info = {};
var fetched = false;
var stop = false;

function requestAPI(api, data, func, typ = "POST", base = setting.base) {
    data = new URLSearchParams(data);
    var inf = {
        method: typ,
    }
    if (typ == "POST" || typ == "PUT" || typ == "DELETE" || typ == "OPTTION") {
        inf.body = data;
    }
    if (func) {
        return fetch(base + "api/" + api, inf)
            .then(response => response.json())
            .then(func);
    } else {
        return fetch(base + "api/" + api, inf)
            .then(response => response.json());
    }
}

const UserInfo = () => {
    var thumbnailUrl = null;
    const image = useRef();
    const a = useRef();
    const changer = useRef();
    const form = useRef();
    const name = useRef();
    const update = useRef();
    const [content, setContent] = useState([]);
    const [btn, setBtn] = useState([]);
    const getUserHeadPhotoURL = async () => {
        var ret = null;
        await requestAPI("getUserHeadPhotoURL", {
            user: info.user.username
        }).then(function (data) {
            if (data.state) {
                ret = (data.type=="base"?setting.base.slice(0,-1):"")+data.url;
            } else {
                throw "请求失败！";
            }
        });
        return ret;
    }
    if (!stop) {
        stop = true;
        fetch(`${setting.base}api/session/`, {
            method: "POST",
            body: JSON.stringify({
                user: uname
            })
        })
            .then(res => { return res.json() })
            .then(data => {
                fetched = true;
                info = data;
                if (!info.user) {
                    return;
                }
                thumbnailUrl = data["user"]["thumbnailUrl"];
                image.current.src = thumbnailUrl;
                console.log(image.current.src, image.current);
                a.current.href = `/wait_reports/${info.user.username}/`;
                name.current.innerHTML = info.user.username;
                var dateJoined = new Date(info.user.dateJoined);
                // 获取年份、月份和日期
                let year = dateJoined.getFullYear(); // 获取年份（四位数）
                let month = ('0' + (dateJoined.getMonth() + 1)).slice(-2); // 获取月份（补零）
                let day = ('0' + dateJoined.getDate()).slice(-2); // 获取日期（补零）

                // 拼接成所需格式的字符串
                let dateString = `${year}-${month}-${day}`;
                var timeC = dateJoined.getYear() - (new Date().getYear());
                var dw = "年";
                if (timeC == 0) {
                    var timeC = dateJoined.getMonth() - (new Date().getMonth());
                    var dw = "个月";
                    if (timeC == 0) {
                        var timeC = dateJoined.getDay() - (new Date().getDay());
                        var dw = "天";
                        if (timeC == 0) {
                            var timeC = dateJoined.getHours() - (new Date().getHours());
                            var dw = "时";
                            if (timeC == 0) {
                                var timeC = dateJoined.getMinutes() - (new Date().getMinutes());
                                var dw = "分钟";
                                if (timeC == 0) {
                                    var timeC = dateJoined.getSeconds() - (new Date().getSeconds());
                                    var dw = "秒";
                                }
                            }
                        }
                    }
                }
                switch (Math.round(Math.abs(dateJoined.getYear() - (new Date().getYear())) / 4)) {
                    case 0:
                        var des = "Scratcher 新手";
                        break;
                    case 1:
                        var des = "Scratcher 熟手";
                        break;
                    case 2:
                        var des = "Scratcher 高手";
                        break;
                    case 3:
                        var des = "Scratcher 大师";
                        break;
                    default:
                        var des = "Scratcher 博士";
                        break;
                }
                var c = (
                    <div key="user-info-info">
                        <p class="profile-details">

                            <span class="group">
                                {des}
                            </span>
                            已加入于<span title={dateString}>{Math.abs(timeC)}&nbsp;{dw}</span>前
                            <span class="location">中国</span>
                            <span style={{
                                display: "block"
                            }}>Scratch币个数：{info.flags.money}</span>
                        </p>
                    </div>
                );
                setContent([c]);
                setBtn([
                    Cookies.get("user") != info.user.username && 
                        <Button
                            className="button collection-user"
                            key = "collect"
                        >
                            {"关注"}
                        </Button>
                ]);
                changer.current.addEventListener("mouseover", () => {
                    form.current.className += " edit";
                });
                changer.current.addEventListener("mouseout", () => {
                    form.current.className = "portrait";
                });
                update.current.addEventListener('change', async function (e) {
                    var file = e.target.files[0];
                    var username = info.user.username; // 用户名

                    if (!file) {
                        return;
                    }

                    var formData = new FormData();
                    formData.append('photo', file);
                    formData.append('user', username); // 添加用户名字段  

                    try {
                        const response = await fetch(setting.base + 'api/updateHeadPhoto', {
                            method: 'POST',
                            body: formData,
                        });

                        if (!response.ok) {
                            throw new Error('Network response was not ok');
                        }

                        const data = await response.json(); // 假设服务器返回JSON格式的响应  
                        if (data.state) {
                            (async function () {
                                image.current.src = await getUserHeadPhotoURL();
                            })();
                        } else {
                            throw "上传失败！"
                        }
                    } catch (error) {
                        throw error;
                    }
                });
            });
    }
    return (
        <div class="box-head">
            <form id="profile-avatar" class="portrait" ref={form}>
                <div class="avatar" ref={changer}>
                    <a ref={a}>
                        <img src={thumbnailUrl} ref={image} width="55" height="55"></img>
                            <div class="loading-img s48"></div>
                    </a>


                    <div data-control="edit">Change
                        <input class="hidden" type="file" accept="image/*" name="file" ref={update}></input>
                    </div>


                </div>
            </form>
            {btn.map((item) => item)}
            <div class="header-text">
                <h2 ref={name}>Username</h2>
                {content.map((item) => item)}  
            </div>
        </div>
    );
};

var lastType = null;

var urls = window.location.pathname.split("/");

var notFound = false;

var p_info = {
    type: (window.location.href.indexOf("#") != -1 ? window.location.href.split("#")[1] : "projects")
};

var start_time = new Date();

const WaitReports = () => {
    const [content, setContent] = useState([<Loading />]);
    const md = new MarkdownIt();
    const translate = (content) => {
        return content
            .replace("\t", "&nbsp&nbsp&nbsp&nbsp")
            .replace(" ", "&nbsp")
            .replace("\n", "<br />")
        ;
    }
    function Markdown({ children, getContent }) {
        return (
            <div dangerouslySetInnerHTML={{ __html: translate(md.render((getContent ? getContent(children) : children))) }}></div>
        );
    }
    const delete_project = async (pid,cid,rid) => {
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
    };
    const delete_comment = (pid,cid,rid) => {
        fetch(`${process.env.PROJECT_HOST}/proxy/comments/project/${pid}/comment/${cid}`, {
            method: "DELETE"
        });
        fetch(`${process.env.PROJECT_HOST}/proxy/reports/comments/${rid}`, {
            method: "DELETE"
        });
    };
    const back = (pid, cid, rid) => {
        fetch(`${process.env.PROJECT_HOST}/proxy/admin/project/${pid}/comment/${cid}/undelete`, {
            method: "PUT"
        })/*.then(() => {
            fetch(`${process.env.PROJECT_HOST}/proxy/reports/comments/${rid}`, {
                method: "DELETE"
            });
        })*/;
    };
    const take_project_go_back = (pid) => {
        requestAPI(`take_project_go_back/${pid}/`,{},function (data){
            if (!data.state){
                alert(`恢复失败！信息：${data.msg}`);
            } else {
                lastType = null; // 刷新
            }
        },"POST",process.env.PROJECT_HOST+"/");
    };
    const fd = async (pid,rid) => {
        await fetch(`${process.env.PROJECT_HOST}/check/report/${rid}/false`, {
            method: "POST"
        });
        fetch(`${process.env.PROJECT_HOST}/proxy/reports/projects/${rid}`, {
            method: "DELETE"
        });
    };
    var timer = setInterval(function (){
        if (!fetched){
            return;
        }
        p_info = {
            type: (window.location.href.indexOf("#") != -1 ? window.location.href.split("#")[1] : "projects")
        };
        if (lastType == p_info.type && new Date() - start_time < (notFound ? 100 : 500)){
            return;
        }
        if (notFound) {
            uname = Cookies.get("user");
            fetch(`${setting.base}api/session/`, {
                method: "POST",
                body: JSON.stringify({
                    user: uname
                })
            })
                .then(res => res.json())
                .then(data => {
                    console.log(data);
                    info = data;
                });
        }
        //console.log(!info.user || !info.permissions.admin,info);
        start_time = new Date();
        lastType = p_info.type;
        if (!info.user || !info.permissions.admin) {
            //document.getElementById('pagebox').innerHTML = "";
            ReactDom.unmountComponentAtNode(document.getElementById('pagebox'));
            render(<NotAvailable />, document.getElementById('pagebox'));
            notFound = true;
            return;
        } else {
            if (notFound && info.user) {
                ReactDom.unmountComponentAtNode(document.getElementById('pagebox'));
                render(<Box
                    headContent={
                        <UserInfo key="page-user-info-title" />
                    }
                >
                    <h3>相关页面(让站长懒一下)</h3>
                    <p class="about-page">
                        {/* onClick={()=>{setTimeout(()=>{window.location.reload()},100)}}*/}
                        {getLinks()}
                    </p>
                    <h3>等待审核的页面 - {{ "all": "全部", "unchecked": "未检查的", "checked": "已检查但未通过的" }[p_info.type]}</h3>
                    <div>
                        {content.map((item) => item)}
                    </div>
                </Box>, document.getElementById('pagebox'));
                window.location.reload();
            }
            if (info.user) {
                clearInterval(timer);
                notFound = false;
            }
        }
        fetch(`${process.env.PROJECT_HOST}/scratch-admin/reports/${p_info.type}`,{
            method: "POST"
        })
            .then(response => response.json())
            .then(data => {
                setContent([
                    <h3>等待审核的举报 - {{ "projects": "被举报的作品", "comments": "被举报的评论" }[p_info.type]}({data.length })</h3>
                    ,
                    <div>
                        {data.length > 0 ? 
                            <ReportsList items={data} canRemove={p_info.type != "deleted"} canTake={p_info.type == "deleted"} text=""
                                onClick={async (pid, cid, rid) => {
                                    if (p_info.type != "deleted") {
                                        if (p_info.type == "comments") {
                                            await fetch(`${process.env.PROJECT_HOST}/check/report/${rid}/true`, {
                                                method: "POST"
                                            });
                                        }
                                        (p_info.type == "projects" ? delete_project : delete_comment)(pid, cid, rid);
                                    } else if (p_info.type == "deleted") {
                                        take_project_go_back(pid);
                                    }
                                }} more={(pid, item, cid, rid) => {
                                    if (p_info.type == "projects") {
                                        return (p_info.type == "shared" || item.public) &&
                                            (<a onClick={() => {
                                                fd(pid,rid);
                                            }}>
                                                否定该举报
                                            </a>);
                                    } else {
                                        return [
                                            <a onClick={() => {
                                                fetch(`${process.env.PROJECT_HOST}/check/report/${rid}/false`, {
                                                    method: "POST"
                                                }).then(() => {
                                                    back(pid, cid, rid);
                                                });
                                            }}>
                                                否定该举报并打回
                                            </a>
                                        ];
                                    }
                                }}
                                getChildren={p_info.type == "projects" ? ((pid, item, report) => {
                                    return [
                                        <p>举报类型：<FormattedMessage id={REPORT_OPTIONS.find(obj => obj.value == report.body.report_category).label.id} /></p>,
                                        <p>举报信息：{report.body.notes}</p>
                                    ];
                                }) : null}
                                btnt={p_info.type == "comments" ? "确认该举报真实性并删除" : "确认并删除"} />
                        : <p>空空如也</p>}
                    </div>
                ]);
            });
    }, 1);
    const getLinks = () => {
        var ret = [];
        var pages = { "projects": "被举报的作品", "comments": "被举报的评论" };
        for (const page in pages) {
            const name = pages[page];
            ret.push(<a href={`#${page}`} onClick={() => { if (p_info.type != page) setContent([<Loading />]) }}>{name}</a>);
        }
        return ret;
    }
    return (
        <div className="inner wait_reports" id="pagebox">
            <Box
                headContent={
                    <UserInfo key="page-user-info-title" />
                }
            >
                <h3>相关页面(让站长懒一下)</h3>
                <p class="about-page">
                    {/* onClick={()=>{setTimeout(()=>{window.location.reload()},100)}}*/}
                    {getLinks()}
                </p>
                <div>
                    {content.map((item) => item)}
                </div>
            </Box>
        </div>
    );
};

render(<Page><WaitReports /></Page>, document.getElementById('app'));
