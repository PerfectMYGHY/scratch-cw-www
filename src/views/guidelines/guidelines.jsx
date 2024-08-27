const FormattedMessage = require('react-intl').FormattedMessage;
const React = require('react');

const Box = require('../../components/box/box.jsx');

const Page = require('../../components/page/www/page.jsx');
const render = require('../../lib/render.jsx');

require('./guidelines.scss');

const Guidelines = () => (
    <div className="inner guidelines">
        <Box
            title={
                <FormattedMessage id="guidelines.title" />
            }
        >
            <p>
                <FormattedMessage id="guidelines.header1" />&nbsp;
                {/*<strong><FormattedMessage id="guidelines.header2" /></strong>&nbsp;*/}
                <FormattedMessage id="guidelines.header3" />
            </p>
            <dl>
                <dt><FormattedMessage id="guidelines.respectheader" /></dt>
                <dd><FormattedMessage id="guidelines.respectbody" /></dd>
                <dt><FormattedMessage id="guidelines.privacyheader" /></dt>
                <dd><FormattedMessage id="guidelines.privacybody" /></dd>
                <dt><FormattedMessage id="guidelines.helpfulheader" /></dt>
                <dd><FormattedMessage id="guidelines.helpfulbody" /></dd>
                <dt><FormattedMessage id="guidelines.remixheader" /></dt>
                <dd>
                    <em><FormattedMessage id="guidelines.remixbody1" /></em><br />
                    <FormattedMessage id="guidelines.remixbody2" />
                </dd>
                <dt><FormattedMessage id="guidelines.honestyheader" /></dt>
                <dd><FormattedMessage id="guidelines.honestybody" /></dd>
                <dt><FormattedMessage id="guidelines.friendlyheader" /></dt>
                <dd><FormattedMessage id="guidelines.friendlybody" /></dd>
            </dl>
            <p>有关Scratch创世界 处理审核等机制的做法，请见<a href="/community_mechanism">社区机制</a>。</p>
            <div className="guidelines-footer">
                <img
                    alt="sprites"
                    src="/images/spritesforcommunityguid.png"
                />
            </div>
        </Box>
    </div>
);

render(<Page><Guidelines /></Page>, document.getElementById('app'));
