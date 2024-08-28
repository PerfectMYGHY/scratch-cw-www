const PropTypes = require('prop-types');
const React = require('react');

const Box = require('../box/box.jsx');

require('./news.scss');
//moreHref = "/discuss/5/"
//moreTitle = { props.messages['general.viewAll'] }

const News = props => (
    <Box
        className="news"
        title={props.messages['news.scratchNews']}
    >
        <ul>
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
                            <p>{item.copy}</p>
                        </div>
                    </a>
                </li>
            ))}
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
        'news.scratchNews': 'Scratch News'
    }
};

module.exports = News;
