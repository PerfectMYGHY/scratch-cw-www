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

const Cookies = require('js-cookie');

require('./email_change.scss');

const setting = require('/src/setting');

const uname = Cookies.get("user");

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
                a.current.href = `/email_change/${info.user.username}/`;
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
                            }}>Scratch币个数：{info.flags.money}</span>
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

var seted = false;

const EmailChange = () => {
    const [content, setContent] = useState([]);
    const resendPwd = useRef();
    const resetEmail = useRef();
    const resetPwd = useRef();
    const resend = () => {
        const pwd = resendPwd.current.value;
        requestAPI("resend",{user:info.user.username,pwd:pwd},(data) => {
            if (data.state){
                alert("发送成功！请等待一会儿并查看手机邮箱。");
            } else {
                alert(`发送失败！信息：${data.msg}`);
            }
        });
    };
    const reset = () => {
        const pwd = resetPwd.current.value;
        const email = resetEmail.current.value;
        if (resetEmail.current.checkValidity()){
            requestAPI("resetEmail",{user:info.user.username,pwd:pwd,email:email},(data) => {
                if (data.state){
                    alert("设置成功！");
                    window.location.reload();
                } else {
                    alert(`设置失败！信息：${data.msg}`);
                }
            });
        } else {
            //alert(`不是一个正确的邮箱号！`);
            resetEmail.current.reportValidity();
        }
    }
    const makeHandleUpdate = (typ) => {
        return (data) => {
            requestAPI(`setInfo/${info.user.id}`,data);
        };
    };
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
        setContent([
            <div>
                <p>
                    <strong>当前邮箱：</strong>
                </p>
                <p>{info.user.email}</p>
                <p>{info.permissions.social ? 
                    <span style={{
                        color: "green"
                    }}>{"邮箱已验证"}</span>
                    : 
                    <span style={{
                        color: "red"
                    }}>{"邮箱未验证"}</span>
                }</p>
                {(!info.permissions.social) && <div>
                    <hr />
                    <p>
                        <strong>重新发送：</strong>
                    </p>
                    <i>{"如果您未收到我们发来的验证邮箱，并在垃圾邮箱里也未找到,或者说几年后才知道要验证，可以输入密码以重新发送。"}</i>
                    <p>
                        <label for="pwd">密码：</label>
                        <input type="password" name="pwd" ref={resendPwd} />
                    </p>
                    <Button onClick={resend}>
                        重新发送
                    </Button>
                </div>}
                <hr />
                <div>
                    <p>
                        <strong>重置邮箱：</strong>
                    </p>
                    <i>{"邮箱不再使用？邮箱输入错误？可以再次更换邮箱并确认。"}</i>
                    <p>
                        <label for="email">新邮箱：</label>
                        <input type="email" name="email" ref={resetEmail} />
                    </p>
                    <p>
                        <label for="cpwd">密码：</label>
                        <input type="password" name="cpwd" ref={resetPwd} />
                    </p>
                    <Button onClick={reset}>
                        更换邮箱
                    </Button>
                </div>
            </div>
        ]);
    },1);
    return (
        <div className="inner email_change" id="pagebox">
            <Box
                headContent={
                    <UserInfo />
                }
            >
                <h3>相关页面(让站长懒一下)</h3>
                <p class="about-page">
                    <a href="/accounts/settings/">账号设置</a>
                    <a href="/accounts/password_change/">密码设置</a>
                    <a href="/accounts/email_change/">邮箱设置</a>
                    <a href="/accounts/my_money/">我的财富</a>
                </p>
                <h3>邮箱设置</h3>
                <div>
                    {content.map((item) => item)}
                </div>
            </Box>
        </div>
    );
};

render(<Page><EmailChange /></Page>, document.getElementById('app'));
