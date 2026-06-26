/* eslint-disable react/jsx-max-props-per-line */
const bindAll = require('lodash.bindall');
const connect = require('react-redux').connect;
const PropTypes = require('prop-types');
const React = require('react');

const navigationActions = require('../../redux/navigation.js');

const Video = require('../../components/video/video.jsx');
const FlexRow = require('../../components/flex-row/flex-row.jsx');
const TitleBanner = require('../../components/title-banner/title-banner.jsx');

require('./intro.scss');

class Intro extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleShowVideo'
        ]);
        this.state = {
            videoOpen: false
        };
    }
    handleShowVideo () {
        this.setState({videoOpen: true});
    }
    render () {
        return (
            <TitleBanner className="intro-banner">
                <FlexRow className="intro-container">
                    <FlexRow className="welcome-logo">
                        <div>
                            <a href="/">
                                <img
                                    src="/images/logo_sm.png"
                                    title="Scratch创世界"
                                    width="330px"
                                />
                            </a>
                        </div>
                    </FlexRow>
                    <FlexRow className="intro-content column">
                        <h1 className="intro-header">
                            <span>欢迎来到 Scratch 创世界！</span>
                            <br />
                            <span>这是一个免费的社区！</span>
                        </h1>
                        <FlexRow className="intro-buttons">
                            <a
                                className="intro-button create-button button"
                                href="/create"
                            >
                                {this.props.messages['intro.startCreating']}
                            </a>
                            <a
                                className="intro-button mystuff-button button"
                                href="/mystuff"
                            >
                                我的东西
                            </a>
                            <a
                                className="intro-button explore-button button"
                                href="/explore/projects/all"
                            >
                                发现作品
                            </a>
                        </FlexRow>

                    </FlexRow>
                    <FlexRow className="intro-content column">
                        <h1 className="intro-header">
                            <span>站内链接</span>
                        </h1>
                        <p>
                            <a href="/about_webmaster" className="welcome-link">关于站长</a>
                            <a href="/credits" className="welcome-link">我们的团队</a>
                            <a href="/new_description" className="welcome-link">新手简介</a>
                        </p>

                    </FlexRow>
                    <FlexRow className="intro-video-container">
                        <div
                            className="screenshot"
                        >
                            <img src="/images/editor-screenshot.png" title="Scratch创世界编辑器中，正在使用高级插件快速调试代码。" />
                            <div>
                                <a className="tip">Scratch创世界编辑器</a>
                            </div>
                        </div>
                    </FlexRow>
                </FlexRow>
            </TitleBanner>
        );
    }
}

Intro.propTypes = {
    messages: PropTypes.shape({
        'intro.aboutScratch': PropTypes.string,
        'intro.forEducators': PropTypes.string,
        'intro.forParents': PropTypes.string,
        'intro.join': PropTypes.string,
        'intro.startCreating': PropTypes.string,
        'intro.tagLine1': PropTypes.string,
        'intro.tagLine2': PropTypes.string,
        'intro.watchVideo': PropTypes.string
    })
};

Intro.defaultProps = {
    messages: {
        'intro.aboutScratch': 'About Scratch',
        'intro.forEducators': 'For Educators',
        'intro.forParents': 'For Parents',
        'intro.join': 'Join',
        'intro.startCreating': 'Start Creating',
        'intro.tagLine1': 'Create stories, games, and animations',
        'intro.tagLine2': 'Share with others around the world',
        'intro.watchVideo': 'Watch Video'
    },
    session: {}
};

const mapStateToProps = state => ({
    session: state.session
});

const mapDispatchToProps = dispatch => ({
    handleClickRegistration: event => {
        event.preventDefault();
        dispatch(navigationActions.handleRegistrationRequested());
    }
});


const ConnectedIntro = connect(
    mapStateToProps,
    mapDispatchToProps
)(Intro);

module.exports = ConnectedIntro;
