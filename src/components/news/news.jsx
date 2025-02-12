const PropTypes = require('prop-types');
const React = require('react');
const defaults = require('lodash.defaults');

const Box = require('../box/box.jsx');

require('./news.scss');
//moreHref = "/discuss/5/"
//moreTitle = { props.messages['general.viewAll'] }

// 创建一个等待指定秒数的函数
const wait = (seconds) => {
    return new Promise(resolve => setTimeout(resolve, seconds));
};


//class MarqueeNewsContent extends React.Component {
//    constructor (props) {
//        super(props);
//        this.marqueeRef = React.createRef();
//        this.checkPositions();
//    }

//    checkPositions = async () => {
//        while (true) {
//            const marquee = this.marqueeRef.current;
//            if (marquee) {
//                const liElements = marquee.getElementsByTagName('li');
//                const topPosition = marquee.getBoundingClientRect().top;

//                // 获取每个li元素的top位置
//                const positions = Array.from(liElements).map((li) => {
//                    const liTop = li.getBoundingClientRect().top;
//                    return liTop - topPosition; // 计算相对于marquee顶端的距离
//                });

//                for (const dis of positions) {
//                    if (Math.abs(dis) < 1) {
//                        console.log("stop");
//                        marquee.stop();
//                        await wait(1.5);
//                        console.log("start");
//                        marquee.start();
//                        await wait(1);
//                    }
//                }
//            }
//            await wait(0.01);
//        }
//    };

//    render() {
//        return (
//            <marquee
//                ref={this.marqueeRef}
//                behavior="scroll"
//                direction="up"
//                className="news-content"
//            >
//                {this.props.children}
//            </marquee>
//        );
//    }
//}

class MarqueeNewsContent extends React.Component {
    constructor(props) {
        super(props);
        this.marqueeRef = React.createRef();
        this.state = {
            isScrolling: true,
            mouseOvering: false
        };
        this.speed = this.props.speed || 1;
    }

    componentDidMount() {
        this.startScrolling();
        this.checkPositions();
    }

    startScrolling = () => {
        const marquee = this.marqueeRef.current;
        this.scrollInterval = setInterval(() => {
            if (this.state.isScrolling && !this.state.mouseOvering) {
                marquee.scrollTop += this.speed; // 以每次增加1个像素的速度滚动
                if (marquee.scrollTop >= marquee.scrollHeight - marquee.clientHeight) {
                    marquee.scrollTop = 0; // 当到达底部时，从头开始
                }
            }
        }, 20); // 每10毫秒执行一次
    };

    stopScrolling = () => {
        this.setState({ isScrolling: false });
        clearInterval(this.scrollInterval);
    };

    checkPositions = async () => {
        while (true) {
            const marquee = this.marqueeRef.current;
            if (marquee) {
                const liElements = marquee.getElementsByTagName('li');
                const topPosition = marquee.getBoundingClientRect().top;

                // 获取每个li元素的top位置
                const positions = Array.from(liElements).map((li) => {
                    const liTop = li.getBoundingClientRect().top;
                    return liTop - topPosition; // 计算相对于marquee顶端的距离
                });

                for (const dis of positions) {
                    if (Math.abs(dis) < 1) {
                        this.stopScrolling();
                        await wait(1500); // 等待1.5秒
                        this.setState({ isScrolling: true });
                        this.startScrolling();
                        await wait(100); // 等待1秒
                    }
                }
            }
            await wait(1); // 每10毫秒检查一次
        }
    };

    handleMouseOver = () => {
        this.setState({
            mouseOvering: true
        });
    }

    handleMouseOut = () => {
        this.setState({
            mouseOvering: false
        });
    }

    render() {
        return (
            <div
                ref={this.marqueeRef}
                className="news-content"
                onMouseOver={this.handleMouseOver}
                onMouseOut={this.handleMouseOut}
            >
                <div></div>
                <div>
                    {this.props.children}
                </div>
            </div>
        );
    }
}


const News = props => (
    <Box
        className="news"
        title={props.messages['news.scratchNews']}
    >
        <ul>
            {props.items.length == 0 ? (
                <li key="news_noneyet">
                    <center>
                        {props.messages['news.noneyet']}
                    </center>
                </li>
            ) : (
                <MarqueeNewsContent>
                    {props.items.map(item => (
                        <li key={item.id}>
                            <a href={item.url}>
                                {
                                    item.image && (
                                        <img
                                            alt=""
                                            className="news-image"
                                            height="53"
                                            src={item.image}
                                            width="53"
                                        />
                                    )
                                }
                                <div className="news-description">
                                    <h4>{item.headline}</h4>
                                    <p dangerouslySetInnerHTML={{ // eslint-disable-line react/no-danger
                                        __html: item.copy
                                    }}></p>
                                </div>
                            </a>
                        </li>
                    ))}
                </MarqueeNewsContent>
            ) }
        </ul>
    </Box>
);

News.propTypes = {
    items: PropTypes.arrayOf(PropTypes.object),
    messages: PropTypes.shape({
        'general.viewAll': PropTypes.string,
        'news.scratchNews': PropTypes.string
    })
};

News.defaultProps = {
    items: require('./news.json'),
    messages: {
        'general.viewAll': 'View All',
        'news.scratchNews': 'Scratch News',
        'news.noneyet': 'None Yet'
    }
};

module.exports = News;
