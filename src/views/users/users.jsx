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

require('./users.scss');

const isSubset = (obj1, obj2, debug = false) => {
    for (const key in obj1) {
        if (!(key in obj2) || obj1[key] !== obj2[key]) {
            return false;
        }
    }
    return true;
};

class Users extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            description: '',
            recently: '',
            shared: [],
            favourites: [],
            fans: [],
            followings: [],
            info: {}
        };
        this.uname = window.location.pathname.split('/')[2];
        this.loaded = false;
        // this.description = "";
        // this.recently = "";
        bindAll(this, [
            'setInfo',
            'makeHandleUpdate',
            'customLoadData'
        ]);
    }

    setInfo (state) {
        if (!isSubset(state, this.state, true)) {
            // console.log("update");
            this.setState(state);
        }
    }

    makeHandleUpdate (typ) {
        return data => {
            requestAPI(`setInfo/${this.state.info.user.id}`, data);
        };
    }

    customLoadData (state) {
        if (!this.loaded) {
            this.loaded = true;
            requestAPI(`getDescription/${state.info.user.id}`, {}, data => {
                this.setState({
                    description: data.description,
                    recently: data.recently
                });
            }, 'GET');
        }
        fetch(`${process.env.API_HOST}/users/${state.info.user.username}/shared/projects`)
            .then(response => response.json())
            .then(data => {
                if (!isEqual(this.state.shared, data)) {
                    this.setState({
                        shared: data
                    });
                }
            });
        fetch(`${process.env.API_HOST}/users/${state.info.user.username}/favourites/projects`)
            .then(response => response.json())
            .then(data => {
                if (!isEqual(this.state.favourites, data)) {
                    this.setState({
                        favourites: data
                    });
                }
            });
        fetch(`${process.env.PROJECT_HOST}/users/${state.info.user.username}/get_fans/`)
            .then(response => response.json())
            .then(data => {
                const fans = [];
                for (const user of data) {
                    if (!user.user) {
                        continue;
                    }
                    fans.push(<Thumbnail
                        href={`/users/${user.user.username}/`}
                        key={['users', user.user.id].join('.')}
                        src={user.user.thumbnailUrl}
                        title={user.user.username}
                        type="user"
                    />);
                }
                if (!isEqual(this.state.fans, fans)) {
                    this.setState({
                        fans
                    });
                }
            });
        fetch(`${process.env.PROJECT_HOST}/users/${state.info.user.username}/get_following/`)
            .then(response => response.json())
            .then(data => {
                const followings = [];
                for (const user of data) {
                    if (!user.user) {
                        continue;
                    }
                    followings.push(<Thumbnail
                        href={`/users/${user.user.username}/`}
                        key={['users', user.user.id].join('.')}
                        src={user.user.thumbnailUrl}
                        title={user.user.username}
                        type="user"
                    />);
                }
                if (!isEqual(this.state.followings, followings)) {
                    this.setState({
                        followings
                    });
                }
            });
    }

    render () {
        return (
            <UserBox
                setInfo={this.setInfo}
                customLoadData={this.customLoadData}
                uname={this.uname}
            >
                <div>
                    <h3>个人简介</h3>
                    {this.props.username === (
                        this.state.info && this.state.info.user && this.state.info.user.username
                    ) ?
                        <Formsy
                            class="description"
                            key={`DESC.${this.state.description}`}
                        >
                            <InplaceInput
                                name="description"
                                placeholder={'介绍一下你自己，可以使用Markdown语法'}
                                type="textarea"
                                validationErrors={{
                                    maxLength: '内容太长'
                                }}
                                validations={{
                                    maxLength: 1000
                                }}
                                value={this.state.description}
                                handleUpdate={this.makeHandleUpdate('description')}
                            />
                        </Formsy> :
                        <div className="project-description textout">
                            {this.state.description ? <Markdown
                                getContent={content => content[0]}
                            >
                                {decorateText(this.state.description, {
                                    usernames: true,
                                    hashtags: true,
                                    scratchLinks: true
                                })}
                            </Markdown> : '这个人神神秘秘的，都不写个人简介。'}
                        </div>
                    }
                    <h3>最近</h3>
                    {this.props.username === (
                        this.state.info && this.state.info.user && this.state.info.user.username
                    ) ?
                        <Formsy
                            class="recently"
                            key={`RECET.${this.state.recently}`}
                        >
                            <InplaceInput
                                name="recently"
                                placeholder={'你自己最近在干什么，可以使用Markdown语法'}
                                type="textarea"
                                validationErrors={{
                                    maxLength: '内容太长'
                                }}
                                validations={{
                                    maxLength: 1000
                                }}
                                value={this.state.recently}
                                handleUpdate={this.makeHandleUpdate('recently')}
                            />
                        </Formsy> :
                        <div className="project-recently textout">
                            {this.state.recently ? <Markdown
                                getContent={content => content[0]}
                            >
                                {decorateText(this.state.recently, {
                                    usernames: true,
                                    hashtags: true,
                                    scratchLinks: true
                                })}
                            </Markdown> : '这个人神神秘秘的，都不写最近在干什么。'}
                        </div>
                    }
                </div>
                <div>
                    <Box title={`分享的作品`}>
                        {this.state.shared.length === 0 ?
                            <p>还没有</p> :
                            <Carousel items={this.state.shared} />
                        }
                    </Box>
                    <Box title={`收藏的作品`}>
                        {this.state.favourites.length === 0 ?
                            <p>还没有</p> :
                            <Carousel items={this.state.favourites} />
                        }
                    </Box>
                    <Box title={`粉丝`}>
                        {this.state.fans.length === 0 ?
                            <p>还没有</p> :
                            <UsersCarousel
                                items={this.state.fans}
                                type="user"
                            />
                        }
                    </Box>
                    <Box title={`正在关注`}>
                        {this.state.followings.length === 0 ?
                            <p>还没有</p> :
                            <UsersCarousel
                                items={this.state.followings}
                                type="user"
                            />
                        }
                    </Box>
                </div>
            </UserBox>
        );
    }
}

Users.propTypes = {
    username: PropTypes.string
};

const mapStateToProps = state => {
    const user = state.session && state.session.session && state.session.session.user;
    return {
        username: user && user.username
    };
};

const ConnectedUsers = connect(mapStateToProps)(Users);

render(<Page><ConnectedUsers /></Page>, document.getElementById('app'));
