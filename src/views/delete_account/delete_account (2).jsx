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
const MarkdownIt = require('markdown-it');
const Carousel = require('../../components/carousel/carousel.jsx');
const Button = require('../../components/forms/button.jsx');

const Cookies = require('js-cookie');

require('./delete_account.scss');

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
                a.current.href = `/delete_account/${info.user.username}/`;
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

const DeleteAccount = () => {
    const pwdRef = useRef();
    const delete_account = () => {
        var pwd = pwdRef.current.value;
        requestAPI("delete_account",{user:info.user.id,pwd:pwd},(data)=>{
            if (data.state){
                alert("账号已删除！");
                Cookies.remove("user");
                window.location.href="/";
            } else {
                alert(`删除时出现了错误(除了密码不正确，其他任何错误都很可怕)：${data.msg}`);
            }
        });
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
    },1);
    return (
        <div className="inner delete_account" id="pagebox">
            <Box
                headContent={
                    <UserInfo />
                }
            >
                <h3>删除账号</h3>
                <i class="important-tip">请注意！你确定要执行此操作吗？该操作会删除你在数据库里的账号、任何与之关联的项目、消息等，可能会导致改编自你的作品的人的链接失效！请慎重考虑。</i>
                <p>若您真想删除您的账号，请输入你的密码并点击『确定』按钮。</p>
                <p>
                    <label for="pwd">您的密码：</label>
                    <input type="password" name="pwd" id="pwd" ref={pwdRef} />
                </p>
                <Button onClick={delete_account}>
                    确定
                </Button>
            </Box>
        </div>
    );
};

render(<Page><DeleteAccount /></Page>, document.getElementById('app'));
