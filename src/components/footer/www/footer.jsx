const FormattedMessage = require('react-intl').FormattedMessage;
const injectIntl = require('react-intl').injectIntl;
const MediaQuery = require('react-responsive').default;
const connect = require('react-redux').connect;
const PropTypes = require('prop-types');
const React = require('react');

const FooterBox = require('../container/footer.jsx');
const LanguageChooser = require('../../languagechooser/languagechooser.jsx');

const frameless = require('../../../lib/frameless');
const intlShape = require('../../../lib/intl-shape');
const {getLocale} = require('../../../lib/locales.js');
const getScratchWikiLink = require('../../../lib/scratch-wiki');

require('./footer.scss');

const Footer = () => (
    <FooterBox>
        <MediaQuery maxWidth={frameless.mobileIntermediate - 1}>
            <div className="lists">
                <dl>
                    <dt>
                        <FormattedMessage id="general.about" />
                    </dt>
                    <dd>
                        <a href="/about">
                            <FormattedMessage id="general.aboutScratch" />
                        </a>
                    </dd>
                    <dd>
                        <a href="/credits">
                            <FormattedMessage id="general.credits" />
                        </a>
                    </dd>
                    <dd>
                        <a href="/about_webmaster">
                            <FormattedMessage id="general.webmaster" />
                        </a>
                    </dd>
                </dl>
                <dl>
                    <dt>
                        <FormattedMessage id="general.community" />
                    </dt>
                    <dd>
                        <a href="/community_guidelines">
                            <FormattedMessage id="general.guidelines" />
                        </a>
                    </dd>
                    <dd>
                        <a href="/community_rules">
                            <FormattedMessage id="general.rules" />
                        </a>
                    </dd>
                    <dd>
                        <a href="/statistics/">
                            <FormattedMessage id="general.statistics" />
                        </a>
                    </dd>
                </dl>
            </div>
        </MediaQuery>
        <MediaQuery minWidth={frameless.mobileIntermediate}>
            <div className="lists">
                <dl>
                    <dt>
                        <FormattedMessage id="general.about" />
                    </dt>
                    <dd>
                        <a href="/about">
                            <FormattedMessage id="general.aboutScratch" />
                        </a>
                    </dd>
                    <dd>
                        <a href="/credits">
                            <FormattedMessage id="general.credits" />
                        </a>
                    </dd>
                    <dd>
                        <a href="/about_webmaster">
                            <FormattedMessage id="general.webmaster" />
                        </a>
                    </dd>
                    <dd>
                        <a href="/sponsor">
                            <FormattedMessage id="general.donate" />
                        </a>
                    </dd>

                </dl>
                <dl>
                    <dt>
                        <FormattedMessage id="general.community" />
                    </dt>
                    <dd>
                        <a href="/community_guidelines">
                            <FormattedMessage id="general.guidelines" />
                        </a>
                    </dd>
                    <dd>
                        <a href="/community_rules">
                            <FormattedMessage id="general.rules" />
                        </a>
                    </dd>
                    <dd>
                        <a href="/new_description">
                            <FormattedMessage id="general.new_description" />
                        </a>
                    </dd>
                </dl>

                <dl>
                    <dt>
                        <FormattedMessage id="general.support" />
                    </dt>
                    <dd>
                        <a href="/faq">
                            <FormattedMessage id="general.faq" />
                        </a>
                    </dd>
                    <dd>
                        <a href="/download">
                            <FormattedMessage id="general.download" />
                        </a>
                    </dd>
                    <dd>
                        <a href="/contact-us/">
                            <FormattedMessage id="general.contactUs" />
                        </a>
                    </dd>
                </dl>
            </div>
        </MediaQuery>
        <LanguageChooser locale={getLocale()} />
    </FooterBox>
);

Footer.propTypes = {
    intl: intlShape.isRequired // eslint-disable-line react/no-unused-prop-types
};

const mapStateToProps = (state, ownProps) => ({
    scratchWikiLink: getScratchWikiLink(ownProps.intl.locale)
});

const ConnectedFooter = connect(mapStateToProps)(Footer);
module.exports = injectIntl(ConnectedFooter);
