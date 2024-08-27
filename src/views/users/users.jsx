const FormattedMessage = require('react-intl').FormattedMessage;
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
const Markdown = require("../../components/markdown/markdown.jsx").default;
const Carousel = require('../../components/carousel/carousel.jsx');
const Button = require('../../components/forms/button.jsx');

const Cookies = require('js-cookie');

require('./users.scss');

const setting = require('/src/setting');

const uname = window.location.pathname.split("/")[2];

var info = {};
var fetched = false;
var stop = false;

function requestAPI(api, data, func, typ = "POST") {
    data = new URLSearchParams(data);
    var inf = {
        method: typ,
    }
    if (typ == "POST" || typ == "PUT" || typ == "DELETE" || typ == "OPTTION") {
        inf.body = data;
    }
    if (func) {
        return fetch(setting.base + "api/" + api, inf)
            .then(response => response.json())
            .then(func);
    } else {
        return fetch(setting.base + "api/" + api, inf)
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
                a.current.href = `/users/${info.user.username}/`;
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
                    <div>
                        <p class="profile-details">

                            <span class="group">
                                {des}
                            </span>
                            已加入于<span title={dateString}>{Math.abs(timeC)}&nbsp;{dw}</span>前
                            <span class="location">中国</span>
                            <span style={{
                                display: "block"
                            }}>S币个数：{info.flags.money}</span>
                        </p>
                    </div>
                );
                setContent([c]);
                setBtn([
                    Cookies.get("user") != info.user.username && 
                        <Button
                            className="button collection-user"
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

                    {Cookies.get("user") == (info.user && info.user.username) && (
                        <div data-control="edit">更改头像
                            <input class="hidden" type="file" accept="image/*" name="file" ref={update}></input>
                        </div>
                    ) }


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

var seted = false;

const Users = () => {
    const [recently, setRecently] = useState([]);
    const [description, setDescription] = useState([]);
    const [shared, setShared] = useState([]);
    const [favourites, setFavourites] = useState([]);
    const makeHandleUpdate = (typ) => {
        return (data) => {
            requestAPI(`setInfo/${info.user.id}`,data);
        };
    };
    var timer = setInterval(function (){
        if (!fetched || seted){
            return;
        }
        clearInterval(timer);
        seted = true;
        if (!info.user){
            document.getElementById('pagebox').innerHTML = "";
            render(<NotAvailable />,document.getElementById('pagebox'));
            return;
        }
        requestAPI(`getDescription/${info.user.id}`, {}, function (data) {
            setDescription([
                Cookies.get("user") == (info && info.user && info.user.username) ?
                    <Formsy class="description">
                        <InplaceInput
                            name="description"
                            placeholder={"介绍一下你自己，可以使用Markdown语法"}
                            type="textarea"
                            validationErrors={{
                                maxLength: "内容太长"
                            }}
                            validations={{
                                maxLength: 200
                            }}
                            value={data.description}
                            handleUpdate={makeHandleUpdate("description")}
                        />
                    </Formsy>
                :
                    <div className="project-description textout">
                        <Markdown getContent={(content) => {
                            return content[0];
                        }}>
                            {decorateText(data.description, {
                                usernames: true,
                                hashtags: true,
                                scratchLinks: true
                            })}
                        </Markdown>
                    </div>
            ]);
            setRecently([
                Cookies.get("user") == (info && info.user && info.user.username) ?
                    <Formsy class="recently">
                        <InplaceInput
                            name="recently"
                            placeholder={"介绍一下你最近在干什么，可以使用Markdown"}
                            type="textarea"
                            validationErrors={{
                                maxLength: "内容太长"
                            }}
                            validations={{
                                maxLength: 200
                            }}
                            value={data.recently}
                            handleUpdate={makeHandleUpdate("recently")}
                        />
                    </Formsy>
                :
                    <div className="project-recently textout">
                        <Markdown getContent={(content) => {
                            return content[0];
                        }}>
                            {decorateText(data.recently, {
                                usernames: true,
                                hashtags: true,
                                scratchLinks: true
                            })}
                        </Markdown>
                    </div>
            ]);
        },"GET");
        fetch(`${process.env.API_HOST}/users/${info.user.username}/shared/projects`)
            .then(response => response.json())
            .then((data) => {
                setShared([
                    data.length == 0 ? 
                        <p>还没有</p>
                    :
                        <Carousel items={data} />
                ]);
            });
        fetch(`${process.env.API_HOST}/users/${info.user.username}/favourites/projects`)
            .then(response => response.json())
            .then((data) => {
                setFavourites([
                    data.length == 0 ? 
                        <p>还没有</p>
                    :
                        <Carousel items={data} />
                ]);
            });
    },1);
    return (
        <div className="inner users" id="pagebox">
            <Box
                headContent={
                    <UserInfo />
                }
            >
                <h3>个人简介</h3>
                {description.map((item) => item)}
                <h3>最近</h3>
                {recently.map((item) => item)}
            </Box>
            <Box title={`分享的作品`}>
                {shared.map((item) => item)}
            </Box>
            <Box title={`收藏的作品`}>
                {favourites.map((item) => item)}
            </Box>
            <Box title={`正在关注`}>
                <p>还没有</p>
            </Box>
        </div>
    );
};

render(<Page><Users /></Page>, document.getElementById('app'));
