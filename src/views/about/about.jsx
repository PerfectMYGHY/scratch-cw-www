const React = require('react');
const FormattedMessage = require('react-intl').FormattedMessage;
const render = require('../../lib/render.jsx');

const Button = require('../../components/forms/button.jsx');
const Page = require('../../components/page/www/page.jsx');
const injectIntl = require('react-intl').injectIntl;

require('./about.scss');

const About = injectIntl(() => (
    <div className="inner about">
        <h1><FormattedMessage id="general.aboutScratch" /></h1>

        <div className="masthead">
            <div>
                <p><FormattedMessage
                    id="about.introOne"
                    values={{foundationLink: (
                        <a
                            href="https://www.scratchfoundation.org/"
                            rel="noreferrer noopener"
                            target="_blank"
                        >
                            <FormattedMessage id="about.foundationText" />
                        </a>
                    )}}
                /></p>
                <p><FormattedMessage id="about.introTwo" /></p>
            </div>
        </div>

        <div className="body">
            <ul>
                <li>
                    <h2><FormattedMessage id="about.learnMore" /></h2>
                    <ul className="list">
                        <li>
                            <a href="/faq"><FormattedMessage id="about.learnMoreFaq" /></a>
                        </li>
                        <li>
                            <a href="/community_guidelines"><FormattedMessage id="general.guidelines" /></a>
                        </li>
                        <li>
                            <a href="/community_rules"><FormattedMessage id="general.rules" /></a>
                        </li>
                    </ul>
                </li>

                <li>
                    <h2><FormattedMessage id="about.support" /></h2>
                    <p><FormattedMessage
                        id="about.supportDescription"
                        values={{
                            donorsLink: (
                                <a
                                    rel="noreferrer noopener"
                                    target="_blank"
                                >
                                    <FormattedMessage id="about.donorsLinkText" />
                                </a>
                            ),
                            donateLink: (
                                <a
                                    href="/sponsor"
                                    rel="noreferrer noopener"
                                    target="_blank"
                                >
                                    <FormattedMessage id="about.donateLinkText" />
                                </a>
                            )
                        }}
                    /></p>
                    <a
                        href="/sponsor"
                        rel="noreferrer noopener"
                        target="_blank"
                    >
                        <Button className="about-button">
                            <FormattedMessage id="about.donateButton" />
                        </Button>
                    </a>
                </li>

                <li>
                    <h2><FormattedMessage id="about.sourceCode" /></h2>
                    <p><FormattedMessage
                        id="about.sourceCodeDescription"
                    /></p>
                    <h3><FormattedMessage id="about.sourceCodeThanks" /></h3>
                    <p>
                        <FormattedMessage
                            id="about.sourceCodeThankScratchFoundation"
                            values={{
                                link: (
                                    <a href="https://github.com/scratchfoundation/scratch-www">scratch-www</a>
                                )
                            }}
                        />
                    </p>
                    <p>
                        <FormattedMessage
                            id="about.sourceCodeThankTurboWarp"
                            values={{
                                link: (
                                    <a href="https://github.com/TurboWarp/scratch-gui">scratch-gui</a>
                                )
                            }}
                        />
                    </p>
                    <p>
                        <FormattedMessage
                            id="about.sourceCodeThankTurboWarp"
                            values={{
                                link: (
                                    <a href="https://github.com/TurboWarp/scratch-vm">scratch-vm</a>
                                )
                            }}
                        />
                    </p>
                    <p>
                        <FormattedMessage
                            id="about.sourceCodeThankTurboWarp"
                            values={{
                                link: (
                                    <a href="https://github.com/TurboWarp/scratch-vm">scratch-vm</a>
                                )
                            }}
                        />
                    </p>
                    <p>
                        <FormattedMessage
                            id="about.sourceCodeThankScratchFoundation"
                            values={{
                                link: (
                                    <a href="https://github.com/scratchfoundation/scratch-storage">scratch-storage</a>
                                )
                            }}
                        />
                    </p>
                    <p>
                        <FormattedMessage
                            id="about.sourceCodeThankScratchFoundation"
                            values={{
                                link: (
                                    <a href="https://github.com/scratchfoundation/scratch-l10n">scratch-l10n</a>
                                )
                            }}
                        />
                    </p>
                    <p>
                        <FormattedMessage
                            id="about.sourceCodeThankTurboWarp"
                            values={{
                                link: (
                                    <a href="https://github.com/TurboWarp/extensions">extensions</a>
                                )
                            }}
                        />
                    </p>
                    <hr />
                    <h3><FormattedMessage id="about.sourceCodeOpens" /></h3>
                    <p>
                        <FormattedMessage
                            id="about.sourceCodeOpenText"
                            values={{
                                link: (
                                    <a href="https://github.com/PerfectMYGHY/scratch-cw-www">scratch-cw-www</a>
                                )
                            }}
                        />
                    </p>
                    <p>
                        <FormattedMessage
                            id="about.sourceCodeOpenText"
                            values={{
                                link: (
                                    <a href="https://github.com/PerfectMYGHY/scratch-cw-gui">scratch-cw-gui</a>
                                )
                            }}
                        />
                    </p>
                    <p>
                        <FormattedMessage
                            id="about.sourceCodeOpenText"
                            values={{
                                link: (
                                    <a href="https://github.com/PerfectMYGHY/scratch-cw-vm">scratch-cw-vm</a>
                                )
                            }}
                        />
                    </p>
                    <p>
                        <FormattedMessage
                            id="about.sourceCodeOpenText"
                            values={{
                                link: (
                                    <a href="https://github.com/PerfectMYGHY/scratch-cw-storage">scratch-cw-storage</a>
                                )
                            }}
                        />
                    </p>
                    <p>
                        <FormattedMessage
                            id="about.sourceCodeOpenText"
                            values={{
                                link: (
                                    <a href="https://github.com/PerfectMYGHY/scratch-cw-l10n">scratch-cw-l10n</a>
                                )
                            }}
                        />
                    </p>
                    <p>
                        <FormattedMessage
                            id="about.sourceCodeOpenText"
                            values={{
                                link: (
                                    <a href="https://github.com/PerfectMYGHY/scratch-cw-extensions">scratch-cw-extensions</a>
                                )
                            }}
                        />
                    </p>
                </li>
            </ul>
        </div>
    </div>
));

render(<Page><About /></Page>, document.getElementById('app'));
