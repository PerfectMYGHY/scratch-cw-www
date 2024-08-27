// JavaScript source code
/*
import Cookies from 'js-cookie';
import setting from './setting.js';
import iziToast from 'izitoast';
import classNames from 'classnames';
import React, { createRef } from 'react';
import ReactDom from 'react-dom';
import './wbst/index.css';
import signinS from './wbst/signin.css';

async function sleep(time) {
    await new Promise(resolve => {
        setTimeout(() => {
            resolve();
        }, time); // time�ǵȴ�ʱ�䣬��λ����
    });
}


// ���iziToast��ʹ�õ�css
var link = document.createElement("link");
link.href = "/css/iziToast.css";
link.rel = "stylesheet";
link.type = "text/css";
document.querySelector("head").appendChild(link);


function requestAPI(api, data, func, typ = "POST") {
    data = new URLSearchParams(data);
    if (func) {
        return fetch(setting.base + "api/" + api, {
            method: typ,
            body: data,
        })
            .then(response => response.json())
            .then(func);
    } else {
        return fetch(setting.base + "api/" + api, {
            method: typ,
            body: data,
        })
            .then(response => response.json());
    }
}


const UserState = {
    NOT_LOGINED: typeof Cookies.get("user") != "string",
    LOGINED: typeof Cookies.get("user") == "string"
};



class SigninScene extends React.Component {
    constructor(props) {
        super(props);

        this.userInputRef = createRef();
        this.pwdInputRef = createRef();
        this.pwdOKInputRef = createRef();
        this.codeInputRef = createRef();
        this.codeButtonRef = createRef();
        this.yid = null;
        this.iter = null;
    }

    hide = () => {
        SigninBase.querySelector("." + signinS.platform).style.opacity = "0";
        SigninBase.querySelector("." + signinS.platform).style.overflow = "hidden";
        SigninBase.querySelector("." + signinS.platform).className = signinS.platform;
        setTimeout(function () {
            SigninBase.style.display = "none";
        }, .5e3);
    }

    signin = () => {
        var base = this;
        var user = this.userInputRef.current.value;
        var pwd = this.pwdInputRef.current.value;
        var pwdOK = this.pwdOKInputRef.current.value;
        if (this.yid == null) {
            // ��ʾ��ʾ
            iziToast.warning({
                title: '����',
                message: '�뷢����֤�룡',
                timeout: 4000,
            });
            return;
        }
        if (pwd != pwdOK) {
            // ��ʾ��ʾ
            iziToast.warning({
                title: '����',
                message: '�����ȷ������Ӧ��һ����',
                timeout: 4000,
            });
            return;
        }
        if (pwd.length < 8) {
            // ��ʾ��ʾ
            iziToast.warning({
                title: '����',
                message: '���볤��Ҫ����8λ��',
                timeout: 4000,
            });
            return;
        }
        requestAPI("checkCode", {
            id: this.yid,
            code: this.codeInputRef.current.value,
        }, function (response) {
            base.codeButtonRef.current.innerHTML = `���·���`;
            base.codeButtonRef.current.disabled = false;
            clearInterval(base.iter);
            if (!response.state) {
                // ��ʾ��ʾ
                iziToast.warning({
                    title: '����',
                    message: response.msg || '��֤�벻��ȷ��',
                    timeout: 3000,
                });
            } else {
                requestAPI("regUser", {
                    user: user,
                    pwd: pwd,
                }, function (response) {
                    if (response.state) {
                        // ��ʾ��ʾ
                        iziToast.success({
                            title: '�ɹ�',
                            message: 'ע��ɹ���',
                            timeout: 1500,
                        });
                        setTimeout(function () {
                            Cookies.set("user", base.userInputRef.current.value, { expires: 7 });
                            base.hide();
                            window.location.reload();
                        }, 1800);
                    } else {
                        iziToast.error({
                            title: '����',
                            message: response.msg,
                            timeout: 3000,
                        });
                    }
                })
            }
        });
    }

    sendCode = () => {
        var base = this;
        iziToast.show({
            title: '���ڷ���...',
            //position: 'topRight', // ���Ը�����Ҫ����λ��  
            color: '#add8e6', // ���Ը�����Ҫ������ɫ���Զ�����ʽ  
            progressBar: true, // ��ʾ������  
            //progressBarColor: 'rgb(0, 255, 0)', // ��������ɫ  
            //close: false, // ��ֹ�رհ�ť  
            timeout: 4000, // �����ó�ʱ��������ʾ�����Զ���ʧ  
            //layout: 1, // ʹ�ò���1���򵥲��֣�ֻ�б����ͼ�꣩  
            //buttons: [
            //    ['<button>ȡ��</button>', function (instance, toast) {
            //        // ȡ�����صĻص�����������������ʾ��ִ�������߼�  
            //        instance.hide({ transitionOut: 'fadeOut' }, toast, 'button');
            //    }]
            //],
            onClosing: function (instance, toast, closedBy) {
                // ����ʾ�򼴽��ر�ʱ�Ļص�����������ִ���������������߼�  
            }
        });
        requestAPI("sendCode", {
            email: this.userInputRef.current.value
        }, function (response) {
            if (response.state) {
                // ��ʾ��ʾ
                iziToast.success({
                    title: '�ɹ�',
                    message: '���ͳɹ���',
                    timeout: 3000,
                });
                var count = 60;
                base.codeButtonRef.current.innerHTML = `���·���(${count}��)`;
                base.codeButtonRef.current.disabled = true;
                base.yid = response.id;
                base.iter = setInterval(function () {
                    if (count > 0) {
                        count--;
                        base.codeButtonRef.current.innerHTML = `���·���(${count}��)`;
                        base.codeButtonRef.current.disabled = true;
                    } else {
                        base.codeButtonRef.current.innerHTML = `���·���`;
                        base.codeButtonRef.current.disabled = false;
                        clearInterval(base.iter);
                    }
                }, 1e3);
            } else {
                // ��ʾ��ʾ
                iziToast.error({
                    title: '����',
                    message: '����ʧ�ܣ�',
                    timeout: 3000,
                });
            }
        });
    }

    render() {
        return (
            <div className={signinS.parent}>
                <div className={signinS.platform} role="document">
                    <div className={classNames([signinS.border_zs, signinS.border_t_l])}></div>
                    <div className={classNames([signinS.border_zs, signinS.border_t_r])}></div>
                    <div className={classNames([signinS.border_zs, signinS.border_b_l])}></div>
                    <div className={classNames([signinS.border_zs, signinS.border_b_r])}></div>
                    <div className={classNames([signinS.dialog_main])}>
                        <p className={classNames([signinS.dialog_title, signinS.dialog_text])}>ע��</p>
                        <p className={classNames([signinS.dialog_text])}>�˻���������ţ���</p>
                        <input type="email" name="user" ref={this.userInputRef} className={classNames([signinS.dialog_user_input, signinS.inputS])}></input>
                        <p className={classNames([signinS.dialog_text])}>���룺</p>
                        <input type="password" name="pwd" ref={this.pwdInputRef} className={classNames([signinS.dialog_pwd_input, signinS.inputS])}></input>
                        <p className={classNames([signinS.dialog_text])}>ȷ�����룺</p>
                        <input type="password" name="pwd" ref={this.pwdOKInputRef} className={classNames([signinS.dialog_pwd_OK_input, signinS.inputS])}></input>
                        <p className={classNames([signinS.dialog_text])}>��֤�룺</p>
                        <input type="text" name="pwd" ref={this.codeInputRef} maxLength="6" className={classNames([signinS.dialog_code_input, signinS.inputS])}></input><button ref={this.codeButtonRef} className={classNames([signinS.send_code_button])} onClick={this.sendCode}>������֤��</button>
                        <button className={classNames([signinS.submit_button])} onClick={this.signin}>ע��</button>
                    </div>
                    <button className={classNames([signinS.close_button])} onClick={this.hide}>��</button>
                </div>
            </div>
        );
    }
}
var SigninBase = document.createElement("div");
ReactDom.render(<SigninScene />, SigninBase);
document.body.appendChild(SigninBase);
SigninBase.style.display = "none";

var lw, lh, sw, sh;


const userInfo = {
    error: null,
    userData: {
        session: {
            user: {
                username: UserState.LOGINED && Cookies.get("user"),
                thumbnailUrl: "",
            }
        }
    },
    assetHost: "/static/assets/",
    loginState: UserState.LOGINED,
    onLogOut: function () {
        Cookies.remove("user");
        // ��ʾ��ʾ
        iziToast.success({
            title: '�ɹ�',
            message: "�����˳���¼��",
            timeout: 1500,
        });
        setTimeout(function () {
            window.location.reload();
        }, 1500);
    },
    onOpenRegistration: function () {
        SigninBase.style.display = "block";
        if (!sw) {
            sw = SigninBase.querySelector("." + signinS.platform).clientWidth;
            sh = SigninBase.querySelector("." + signinS.platform).clientHeight;
            var s = document.createElement("style");
            s.innerHTML = `.${signinS.Pshow} {
                height: ${sh}px !important;
            }
            .${signinS.platform} {
                height: 0;
                width: 0;
            }`;
            document.querySelector("head").appendChild(s);
        }
        setTimeout(function () {
            SigninBase.querySelector("." + signinS.platform).style.opacity = "1";
            SigninBase.querySelector("." + signinS.platform).className += " " + signinS.Pshow;
            setTimeout(function () {
                SigninBase.querySelector("." + signinS.platform).style.overflow = "visible";
            }, .4e3);
        }, .1e3);
    }
};


if (userInfo.loginState) {
    requestAPI("getUserHeadPhotoURL", {
        user: userInfo.userData.session.user.username
    }).then(function (data) {
        if (data.state) {
            userInfo.userData.session.user.thumbnailUrl = (data.type == "base" ? setting.base.slice(0, -1) : "") + data.url;
        } else {
            iziToast.error({
                title: '����',
                message: data.msg,
                timeout: 3000,
            });
            Cookies.remove("user");
        }
    });
}*/

var userInfo = {}

export {
	userInfo
} ;
