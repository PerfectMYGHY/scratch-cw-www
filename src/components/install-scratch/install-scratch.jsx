const PropTypes = require('prop-types');
const FormattedMessage = require('react-intl').FormattedMessage;
const React = require('react');

const OS_ENUM = require('../../lib/os-enum.js');

const {isDownloaded, isFromGooglePlay} = require('./install-util.js');

const FlexRow = require('../../components/flex-row/flex-row.jsx');
const Steps = require('../../components/steps/steps.jsx');
const Step = require('../../components/steps/step.jsx');

require('./install-scratch.scss');

const downloadUrls = {
    mac: '/desktop/Scratch.dmg',
    win: '/desktop/Scratch%20Setup.exe',
    googlePlayStore: 'https://play.google.com/store/apps/details?id=org.scratch',
    microsoftStore: 'https://www.microsoft.com/store/apps/9pfgj25jl6x3?cid=storebadge&ocid=badge',
    macAppStore: 'https://apps.apple.com/us/app/scratch-desktop/id1446785996?mt=12'
};

const InstallScratch = ({
    currentOS
}) => (
    <div className="blue install-scratch">
        <FlexRow className="inner column">
            <h2 className="title">
                <FormattedMessage
                    id="installScratch.appHeaderTitle"
                    values={{operatingsystem: currentOS}}
                />
            </h2>
            <Steps>
                <div className="step">
                    <Step
                        compact
                        number={1}
                    >
                        <span className="step-description">
                            <React.Fragment>
                                {currentOS === OS_ENUM.WINDOWS && (
                                    <FormattedMessage
                                        id="installScratch.getScratchAppWindows"
                                    />
                                )}
                                {currentOS === OS_ENUM.MACOS && (
                                    <FormattedMessage
                                        id="installScratch.getScratchAppMacOs"
                                    />
                                )}
                                {isFromGooglePlay(currentOS) && (
                                    <FormattedMessage id="installScratch.getScratchAppPlay" />
                                )}{isFromGooglePlay(currentOS) && "(有条件的人)"}
                            </React.Fragment>
                        </span>
                        <div className="downloads-container">
                            {currentOS === OS_ENUM.WINDOWS && (
                                <a
                                    className="ms-badge"
                                    href={downloadUrls.microsoftStore}
                                    rel="noopener noreferrer"
                                    target="_blank"
                                >
                                    <img
                                        src="/images/badges/windows-store-badge.svg"
                                    />
                                </a>
                            )}
                            {currentOS === OS_ENUM.MACOS && (
                                <a
                                    className="macos-badge"
                                    href={downloadUrls.macAppStore}
                                    rel="noopener noreferrer"
                                    target="_blank"
                                >
                                    <img
                                        src="/images/badges/mac-store-badge.svg"
                                    />
                                </a>
                            )}
                            {isFromGooglePlay(currentOS) && (
                                <a
                                    className="play-badge"
                                    href={downloadUrls.googlePlayStore}
                                    rel="noopener noreferrer"
                                    target="_blank"
                                >
                                    <img
                                        src="/images/badges/google-play-badge.png"
                                    />
                                </a>

                            )}
                            {isDownloaded(currentOS) && (
                                <React.Fragment>
                                    <span className="horizontal-divider">
                                        <FormattedMessage id="installScratch.or" />
                                    </span>
                                    <a href={currentOS === OS_ENUM.WINDOWS ? downloadUrls.win : downloadUrls.mac}>
                                        <FormattedMessage id="installScratch.directDownload" />
                                    </a>
                                </React.Fragment>
                            )}
                        </div>
                    </Step>

                </div>
                {isDownloaded(currentOS) && (
                    <Step
                        compact
                        number={2}
                    >
                        <span className="step-description">
                            {currentOS === OS_ENUM.WINDOWS ?
                                <FormattedMessage id="download.winMoveToApplications" /> :
                                <FormattedMessage id="download.macMoveAppToApplications" />
                            }
                        </span>

                        <div className="step-image">
                            <img
                                alt=""
                                className="screenshot"
                                src={`/images/download/${
                                    currentOS === OS_ENUM.WINDOWS ? 'windows' : 'mac'
                                }-install.png`}
                            />
                        </div>
                    </Step>
                )}
            </Steps>
        </FlexRow>
    </div>
);

InstallScratch.propTypes = {
    currentOS: PropTypes.string
};

module.exports = InstallScratch;
