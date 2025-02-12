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
const Thumbnail = require('../../components/thumbnail/thumbnail.jsx');
const PropTypes = require('prop-types');
const UserBox = require('../../components/user-box/user-box.jsx');
const UsersCarousel = require('../../components/users-carousel/users-carousel.jsx');

const { connect } = require('react-redux');

const setting = require('/src/setting'); // 获取设置

require('./users.scss');

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

function areObjectsEqual(obj1, obj2) {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
}

function isSubset(obj1, obj2, debug = false) {
    if (debug) {
        //console.log(JSON.stringify(obj1), "\n====\n", JSON.stringify(obj2), JSON.stringify(obj1) === JSON.stringify(obj2));
    }
    for (let key in obj1) {
        if (!(key in obj2) || obj1[key] !== obj2[key]) {
            return false;
        }
    }
    return true;
}

class Users extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            description: "",
            recently: "",
            shared: [],
            favourites: [],
            fans: [],
            followings: [],
            info: {}
        };
        this.uname = window.location.pathname.split("/")[2];
        this.loaded = false;
        //this.description = "";
        //this.recently = "";
    }

    setInfo = (state) => {
        if (!isSubset(state, this.state, true)) {
            //console.log("update");
            this.setState(state);
        }
    }

    makeHandleUpdate = (typ) => {
        return (data) => {
            requestAPI(`setInfo/${this.state.info.user.id}`, data);
        };
    }

    customLoadData = (state) => {
        const base = this;
        if (!this.loaded) {
            this.loaded = true;
            //console.log("load");
            requestAPI(`getDescription/${state.info.user.id}`, {}, function (data) {
                //console.log("update");
                base.setState({
                    description: data.description,
                    recently: data.recently
                });
                //base.description = data.description;
                //base.recently = data.recently;
            }, "GET");
        }
        fetch(`${process.env.API_HOST}/users/${state.info.user.username}/shared/projects`)
            .then(response => response.json())
            .then((data) => {
                if (!areObjectsEqual(base.state.shared, data)) {
                    //console.log("update");
                    base.setState({
                        shared: data
                    });
                }
            });
        fetch(`${process.env.API_HOST}/users/${state.info.user.username}/favourites/projects`)
            .then(response => response.json())
            .then((data) => {
                if (!areObjectsEqual(base.state.favourites, data)) {
                    //console.log("update");
                    base.setState({
                        favourites: data
                    });
                }
            });
        fetch(`${process.env.PROJECT_HOST}/users/${state.info.user.username}/get_fans/`)
            .then(response => response.json())
            .then((data) => {
                let fans = [];
                for (const user of data) {
                    if (!user.user) {
                        continue;
                    }
                    fans.push(<Thumbnail
                        href={`/users/${user.user.username}/`}
                        key={["users", user.user.id].join('.')}
                        src={user.user.thumbnailUrl}
                        title={user.user.username}
                        type="user"
                    />);
                }
                if (!areObjectsEqual(base.state.fans, fans)) {
                    //console.log("update");
                    base.setState({
                        fans
                    });
                }
            });
        fetch(`${process.env.PROJECT_HOST}/users/${state.info.user.username}/get_following/`)
            .then(response => response.json())
            .then((data) => {
                let followings = [];
                for (const user of data) {
                    if (!user.user) {
                        continue;
                    }
                    followings.push(<Thumbnail
                        href={`/users/${user.user.username}/`}
                        key={["users", user.user.id].join('.')}
                        src={user.user.thumbnailUrl}
                        title={user.user.username}
                        type="user"
                    />);
                }
                if (!areObjectsEqual(base.state.followings, followings)) {
                    //console.log("update");
                    base.setState({
                        followings
                    });
                }
            });
    }

    render() {
        //console.log("update");
        //console.log(this.props.username, (this.state.info && this.state.info.user && this.state.info.user.username));
        return (
            <UserBox setInfo={this.setInfo} customLoadData={this.customLoadData} uname={this.uname}>
                <div>
                    <h3>个人简介</h3>
                    {this.props.username == (this.state.info && this.state.info.user && this.state.info.user.username) ?
                        <Formsy class="description" key={`DESC.${this.state.description}`}>
                            <InplaceInput
                                name="description"
                                placeholder={"介绍一下你自己，可以使用Markdown语法"}
                                type="textarea"
                                validationErrors={{
                                    maxLength: "内容太长"
                                }}
                                validations={{
                                    maxLength: 1000
                                }}
                                value={this.state.description}
                                handleUpdate={this.makeHandleUpdate("description")}
                            />
                        </Formsy>
                        :
                        <div className="project-description textout">
                            {this.state.description ? <Markdown getContent={(content) => {
                                return content[0];
                            }}>
                                {decorateText(this.state.description, {
                                    usernames: true,
                                    hashtags: true,
                                    scratchLinks: true
                                })}
                            </Markdown> : "这个人神神秘秘的，都不写个人简介。"}
                        </div>
                    }
                    <h3>最近</h3>
                    {this.props.username == (this.state.info && this.state.info.user && this.state.info.user.username) ?
                        <Formsy class="recently" key={`RECET.${this.state.recently}`}>
                            <InplaceInput
                                name="recently"
                                placeholder={"你自己最近在干什么，可以使用Markdown语法"}
                                type="textarea"
                                validationErrors={{
                                    maxLength: "内容太长"
                                }}
                                validations={{
                                    maxLength: 1000
                                }}
                                value={this.state.recently}
                                handleUpdate={this.makeHandleUpdate("recently")}
                            />
                        </Formsy>
                        :
                        <div className="project-recently textout">
                            {this.state.recently ? <Markdown getContent={(content) => {
                                return content[0];
                            }}>
                                {decorateText(this.state.recently, {
                                    usernames: true,
                                    hashtags: true,
                                    scratchLinks: true
                                })}
                            </Markdown> : "这个人神神秘秘的，都不写最近在干什么。"}
                        </div>
                    }
                </div>
                <div>
                    <Box title={`分享的作品`}>
                        {this.state.shared.length == 0 ?
                            <p>还没有</p>
                            :
                            <Carousel items={this.state.shared} />
                        }
                    </Box>
                    <Box title={`收藏的作品`}>
                        {this.state.favourites.length == 0 ?
                            <p>还没有</p>
                            :
                            <Carousel items={this.state.favourites} />
                        }
                    </Box>
                    <Box title={`粉丝`}>
                        {this.state.fans.length == 0 ?
                            <p>还没有</p>
                            :
                            <UsersCarousel items={this.state.fans} type="user" />
                        }
                    </Box>
                    <Box title={`正在关注`}>
                        {this.state.followings.length == 0 ?
                            <p>还没有</p>
                            :
                            <UsersCarousel items={this.state.followings} type="user" />
                        }
                    </Box>
                </div>
            </UserBox>
        );
    }
}

const mapStateToProps = (state) => ({
    username: state.session && state.session.session && state.session.session.user && state.session.session.user.username
});

const ConnectedUsers = connect(mapStateToProps)(Users);

render(<Page><ConnectedUsers /></Page>, document.getElementById('app'));
