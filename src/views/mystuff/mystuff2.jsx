import PropTypes from 'prop-types';

const React = require('react');

const Box = require('../../components/box/box.jsx');

const Page = require('../../components/page/www/page.jsx');
const InplaceInput = require('../../components/forms/inplace-input.jsx');
const render = require('../../lib/render.jsx');
const Formsy = require('formsy-react').default;
const decorateText = require('../../lib/decorate-text.jsx');
const Markdown = require('../../components/markdown/markdown.jsx').default;
const Carousel = require('../../components/carousel/carousel.jsx');
const Thumbnail = require('../../components/thumbnail/thumbnail.jsx');
import UserBox, {requestAPI} from '../../components/user-box/user-box.jsx';
const UsersCarousel = require('../../components/users-carousel/users-carousel.jsx');
const isEqual = require('lodash.isequal');
const bindAll = require('lodash.bindall');

const {connect} = require('react-redux');

require('./mystuff.scss');

const setting = require('/src/setting');

const uname = Cookies.get('user');

let info = {};
let fetched = false;
let stop = false;

function requestAPI (api, data, func, typ = 'POST', base = setting.base) {
    data = new URLSearchParams(data);
    const inf = {
        method: typ
    };
    if (typ == 'POST' || typ == 'PUT' || typ == 'DELETE' || typ == 'OPTTION') {
        inf.body = data;
    }
    if (func) {
        return fetch(`${base}api/${api}`, inf)
            .then(response => response.json())
            .then(func);
    }
    return fetch(`${base}api/${api}`, inf)
        .then(response => response.json());

}

const UserInfo = () => {
    let thumbnailUrl = null;
    const image = useRef();
    const a = useRef();
    const changer = useRef();
    const form = useRef();
    const name = useRef();
    const update = useRef();
    const [content, setContent] = useState([]);
    const [btn, setBtn] = useState([]);
    const getUserHeadPhotoURL = async () => {
        let ret = null;
        await requestAPI('getUserHeadPhotoURL', {
            user: info.user.username
        }).then(data => {
            if (data.state) {
                ret = (data.type == 'base' ? setting.base.slice(0, -1) : '') + data.url;
            } else {
                throw '请求失败！';
            }
        });
        return ret;
    };
    if (!stop) {
        stop = true;
        fetch(`${setting.base}api/session/`, {
            method: 'POST',
            body: JSON.stringify({
                user: uname
            })
        })
            .then(res => res.json())
            .then(data => {
                fetched = true;
                info = data;
                if (!info.user) {
                    return;
                }
                thumbnailUrl = data.user.thumbnailUrl;
                image.current.src = thumbnailUrl;
                a.current.href = `/mystuff/${info.user.username}/`;
                name.current.innerHTML = info.user.username;
                const dateJoined = new Date(info.user.dateJoined);
                // 获取年份、月份和日期
                const year = dateJoined.getFullYear(); // 获取年份（四位数）
                const month = (`0${dateJoined.getMonth() + 1}`).slice(-2); // 获取月份（补零）
                const day = (`0${dateJoined.getDate()}`).slice(-2); // 获取日期（补零）

                // 拼接成所需格式的字符串
                const dateString = `${year}-${month}-${day}`;
                var timeC = dateJoined.getYear() - (new Date().getYear());
                var dw = '年';
                if (timeC == 0) {
                    var timeC = dateJoined.getMonth() - (new Date().getMonth());
                    var dw = '个月';
                    if (timeC == 0) {
                        var timeC = dateJoined.getDay() - (new Date().getDay());
                        var dw = '天';
                        if (timeC == 0) {
                            var timeC = dateJoined.getHours() - (new Date().getHours());
                            var dw = '时';
                            if (timeC == 0) {
                                var timeC = dateJoined.getMinutes() - (new Date().getMinutes());
                                var dw = '分钟';
                                if (timeC == 0) {
                                    var timeC = dateJoined.getSeconds() - (new Date().getSeconds());
                                    var dw = '秒';
                                }
                            }
                        }
                    }
                }
                switch (Math.round(Math.abs(dateJoined.getYear() - (new Date().getYear())) / 4)) {
                case 0:
                    var des = 'Scratcher 新手';
                    break;
                case 1:
                    var des = 'Scratcher 熟手';
                    break;
                case 2:
                    var des = 'Scratcher 高手';
                    break;
                case 3:
                    var des = 'Scratcher 大师';
                    break;
                default:
                    var des = 'Scratcher 博士';
                    break;
                }
                const c = (
                    <div>
                        <p className="profile-details">

                            <span className="group">
                                {des}
                            </span>
                            已加入于<span title={dateString}>{Math.abs(timeC)}&nbsp;{dw}</span>前
                            <span className="location">中国</span>
                            <span
                                style={{
                                    display: 'block'
                                }}
                            >Scratch币个数：{info.flags.money}</span>
                        </p>
                    </div>
                );
                setContent([c]);
                setBtn([
                    Cookies.get('user') != info.user.username &&
                        <Button
                            className="button collection-user"
                        >
                            {'关注'}
                        </Button>
                ]);
                changer.current.addEventListener('mouseover', () => {
                    form.current.className += ' edit';
                });
                changer.current.addEventListener('mouseout', () => {
                    form.current.className = 'portrait';
                });
                update.current.addEventListener('change', async e => {
                    const file = e.target.files[0];
                    const username = info.user.username; // 用户名

                    if (!file) {
                        return;
                    }

                    const formData = new FormData();
                    formData.append('photo', file);
                    formData.append('user', username); // 添加用户名字段

                    try {
                        const response = await fetch(`${setting.base}api/updateHeadPhoto`, {
                            method: 'POST',
                            body: formData
                        });

                        if (!response.ok) {
                            throw new Error('Network response was not ok');
                        }

                        const data = await response.json(); // 假设服务器返回JSON格式的响应
                        if (data.state) {
                            (async function () {
                                image.current.src = await getUserHeadPhotoURL();
                            }());
                        } else {
                            throw '上传失败！';
                        }
                    } catch (error) {
                        throw error;
                    }
                });
            });
    }
    return (
        <div className="box-head">
            <form
                id="profile-avatar"
                className="portrait"
                ref={form}
            >
                <div
                    className="avatar"
                    ref={changer}
                >
                    <a ref={a}>
                        <img
                            src={thumbnailUrl}
                            ref={image}
                            width="55"
                            height="55"
                        />
                        <div className="loading-img s48" />
                    </a>


                    <div data-control="edit">Change
                        <input
                            className="hidden"
                            type="file"
                            accept="image/*"
                            name="file"
                            ref={update}
                        />
                    </div>


                </div>
            </form>
            {btn.map(item => item)}
            <div className="header-text">
                <h2 ref={name}>Username</h2>
                {content.map(item => item)}
            </div>
        </div>
    );
};

let lastType = null;

const urls = window.location.pathname.split('/');

let p_info = {
    type: (window.location.href.indexOf('#') != -1 ? window.location.href.split('#')[1] : 'all')
};

const MyStuff = () => {
    const [content, setContent] = useState([
        <Loading />
    ]);
    const md = new MarkdownIt();
    const translate = content => content
        .replace('\t', '&nbsp&nbsp&nbsp&nbsp')
        .replace(' ', '&nbsp')
        .replace('\n', '<br />');

    function Markdown ({children, getContent}) {
        return (
            <div dangerouslySetInnerHTML={{__html: translate(md.render((getContent ? getContent(children) : children)))}} />
        );
    }
    const delete_project = pid => {
        requestAPI(`delete_project/${pid}/`, {}, data => {
            if (!data.state){
                alert(`删除失败！信息：${data.msg}`);
            } else {
                lastType = null; // 刷新
            }
        }, 'POST', `${process.env.PROJECT_HOST}/`);
    };
    const take_project_go_back = pid => {
        requestAPI(`take_project_go_back/${pid}/`, {}, data => {
            if (!data.state){
                alert(`恢复失败！信息：${data.msg}`);
            } else {
                lastType = null; // 刷新
            }
        }, 'POST', `${process.env.PROJECT_HOST}/`);
    };
    const unshare = pid => {
        requestAPI(`unshare/${pid}/`, {}, data => {
            if (!data.state){
                alert(`取消分享失败！信息：${data.msg}`);
            } else {
                lastType = null; // 刷新
            }
        }, 'POST', `${process.env.PROJECT_HOST}/`);
    };
    var timer = setInterval(() => {
        if (!fetched){
            return;
        }
        p_info = {
            type: (window.location.href.indexOf('#') != -1 ? window.location.href.split('#')[1] : 'all')
        };
        if (lastType == p_info.type){
            return;
        }
        lastType = p_info.type;
        clearInterval(timer);
        if (!info.user){
            document.getElementById('pagebox').innerHTML = '';
            render(<NotAvailable />, document.getElementById('pagebox'));
            return;
        }
        fetch(`${process.env.PROJECT_HOST}/users/${info.user.id}/projects/${p_info.type}`, {
            method: 'POST'
        })
            .then(response => response.json())
            .then(data => {
                setContent([
                    <h3>{{all: '全部作品', shared: '已分享的作品', unshared: '未分享的作品', deleted: '回收站'}[p_info.type]}({data.length })</h3>,
                    <div>
                        {data.length > 0 ?
                            <ProjectsList
                                items={data}
                                canRemove={p_info.type != 'deleted'}
                                canTake={p_info.type == 'deleted'}
                                text=""
                                onClick={pid => {
                                    if (p_info.type != 'deleted'){
                                        delete_project(pid);
                                    } else if (p_info.type == 'deleted'){
                                        take_project_go_back(pid);
                                    }
                                }}
                                more={(pid, item) => (p_info.type == 'shared' || item.public) &&
                                (<a
                                    onClick={() => {
                                        unshare(pid);
                                    }}
                                >
                                    取消分享
                                </a>)}
                            /> :
                            <p>空空如也</p>}
                    </div>
                ]);
            });
    }, 1);
    return (
        <div
            className="inner mystuff"
            id="pagebox"
        >
            <Box
                headContent={
                    <UserInfo />
                }
            >
                <h3>相关页面(让站长懒一下)</h3>
                <p className="about-page">
                    {/* onClick={()=>{setTimeout(()=>{window.location.reload()},100)}}*/}
                    <a
                        href="#all"
                        onClick={() => {
                            if (p_info.type != 'all') setContent([<Loading />]);
                        }}
                    >全部作品</a>
                    <a
                        href="#shared"
                        onClick={() => {
                            if (p_info.type != 'shared') setContent([<Loading />]);
                        }}
                    >已分享的</a>
                    <a
                        href="#unshared"
                        onClick={() => {
                            if (p_info.type != 'unshared') setContent([<Loading />]);
                        }}
                    >未分享的</a>
                    <a
                        href="#deleted"
                        onClick={() => {
                            if (p_info.type != 'deleted') setContent([<Loading />]);
                        }}
                    >回收站</a>
                </p>
                <div>
                    {content.map(item => item)}
                </div>
            </Box>
        </div>
    );
};

render(<Page><MyStuff /></Page>, document.getElementById('app'));
