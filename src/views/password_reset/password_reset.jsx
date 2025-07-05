const FormattedMessage = require('react-intl').FormattedMessage;
const React = require('react');
const useRef = require('react').useRef;
const useState = require('react').useState;

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

require('./password_reset.scss');

const setting = require('/src/setting');

function requestAPI (api, data, func, typ = 'POST') {
    data = new URLSearchParams(data);
    const inf = {
        method: typ
    };
    if (typ == 'POST' || typ == 'PUT' || typ == 'DELETE' || typ == 'OPTTION') {
        inf.body = data;
    }
    if (func) {
        return fetch(`${setting.base}api/${api}`, inf)
            .then(response => response.json())
            .then(func);
    }
    return fetch(`${setting.base}api/${api}`, inf)
        .then(response => response.json());
    
}

const PasswordReset = () => {
    const uname = useRef();
    const email = useRef();
    const reset = () => {
        const u = uname.current.value;
        const e = email.current.value;
        if ((e && email.current.checkValidity()) || u){
            requestAPI('resetByEmail', {uname: u, email: e}, data => {
                if (data.state){
                    alert('发送成功！');
                } else {
                    alert(`发送失败！信息：${data.msg}`);
                }
            });
        } else if (!email.current.checkValidity()) {
            // alert(`不是一个正确的邮箱号！`);
            email.current.reportValidity();
        } else {
            alert('请至少选择一种方式！');
        }
    };
    return (
        <div
            className="inner password_reset"
            id="pagebox"
        >
            <Box
                title="忘记密码"
            >
                <div>
                    <div>
                        <p>
                            <strong>明明记得就是这个密码，怎么就是不对？干脆算了，重置密码！从下面两个输入框任选一个填写，然后我们会发送一个重置邮件到你的邮箱，你就可以重置密码。</strong>
                        </p>
                        <i>{'输入用户名或邮箱号'}</i>
                        <p>
                            <label htmlFor="uname">用户名：</label>
                            <input
                                type="text"
                                name="uname"
                                ref={uname}
                            />
                        </p>
                        <p>
                            <label htmlFor="email">邮箱号：</label>
                            <input
                                type="email"
                                name="email"
                                ref={email}
                            />
                        </p>
                        <Button onClick={reset}>
                            发送重置密码请求
                        </Button>
                    </div>
                </div>
            </Box>
        </div>
    );
};

render(<Page><PasswordReset /></Page>, document.getElementById('app'));
