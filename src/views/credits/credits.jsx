const React = require('react');
const render = require('../../lib/render.jsx');
const FormattedMessage = require('react-intl').FormattedMessage;
const injectIntl = require('react-intl').injectIntl;
const Page = require('../../components/page/www/page.jsx');
const People = require('./people.json');
const PeopleGrid = require('../../components/people-grid/people-grid.jsx');

require('./credits.scss');

// Sort people by name alphabetically
People.sort((a, b) => (a.name.localeCompare(b.name)));

const Credits = () => (
    <div className="credits">
        <div className="content">
            <div className="people">
                <div className="mid-header">
                    <h2><FormattedMessage id="credits.ourteam" /></h2>
                    <p>
                        <FormattedMessage id="credits.developers" />
                    </p>
                </div>
                <PeopleGrid people={People} />
            </div>
        </div>
        <div
            className="content"
            id="acknowledgements"
        >
            <div className="acknowledge-content">
                <h2>
                    <FormattedMessage id="credits.codeWriterTitle" />
                </h2>
                <p>
                    <FormattedMessage
                        id="credits.introduceCodeWriter"
                        values={{
                            writerLink: (
                                <a
                                    href="/users/webmaster/"
                                    target="_blank"
                                >
                                    <FormattedMessage id="credits.webmaster" />
                                </a>
                            ),
                            emailLink: (
                                <a>
                                    <FormattedMessage id="credits.email" />
                                </a>
                            )
                        }}
                    />
                </p>
                <h2>
                    <FormattedMessage id="credits.donorsTitle" />
                </h2>
                <p>
                    <FormattedMessage
                        id="credits.acknowledgementsDonors"
                        values={{
                            donorsLink: (
                                <a
                                    href="/sponsor"
                                    rel="noreferrer noopener"
                                    target="_blank"
                                >
                                    <FormattedMessage id="credits.acknowledgementsDonorsLinkText" />
                                </a>
                            )
                        }}
                    />
                </p>
            </div>
        </div>
    </div>);

const WrappedCredits = injectIntl(Credits);
render(<Page><WrappedCredits /></Page>, document.getElementById('app'));
