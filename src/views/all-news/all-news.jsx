const FormattedMessage = require('react-intl').FormattedMessage;
const React = require('react');

const Box = require('../../components/box/box.jsx');
const Button = require('../../components/forms/button.jsx');

const Page = require('../../components/page/www/page.jsx');
const render = require('../../lib/render.jsx');

const api = require('../../lib/api');

const binAll = require("lodash.bindall");

require('./all-news.scss');

class AllNews extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            news: [],
            start: 0,
            canLoadMore: true
        };
        this.limit = 10;
        binAll(this, [
            'getNews'
        ]);
    }

    componentDidMount () {
        this.getNews();
    }

    getNews () {
        api({
            uri: `/news/?limit=${this.limit}&start=${this.state.start}`
        }, (err, body, resp) => {
            if (err) {
                console.error(err);
                return;
            }
            this.setState({
                news: [...this.state.news, ...body],
                start: this.state.start + this.limit,
                canLoadMore: body.length >= this.limit
            });
        });
    }

    render() {
        return (
            <div className="inner all-news">
                <Box
                    title={
                        <FormattedMessage id="news.all.title" />
                    }
                >
                    <ul>
                        {
                            this.state.news.map((item) => {
                                return (
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
                                                <p
                                                    dangerouslySetInnerHTML={{ // eslint-disable-line react/no-danger
                                                        __html: item.copy
                                                    }}
                                                />
                                            </div>
                                        </a>
                                    </li>
                                );
                            })
                        }
                    </ul>
                    {this.state.canLoadMore && <Button
                        onClick={this.getNews}
                        className="load-more-button"
                    >
                        <FormattedMessage id="news.all.loadMore" />
                    </Button>}
                </Box>
            </div>
        );
    }
}

render(<Page><AllNews /></Page>, document.getElementById('app'));
