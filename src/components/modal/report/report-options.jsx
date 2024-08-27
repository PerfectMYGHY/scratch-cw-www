const React = require('react');
const FormattedMessage = require('react-intl').FormattedMessage;

const PropTypes = require('prop-types');

const {
    arrayOf,
    node,
    string,
    shape,
    bool
} = PropTypes;

/**
 * Define both the PropType shape and default value for report options
 * to ensure structure is validated by PropType checking going forward.
 */

const messageShape = shape({
    id: string.isRequired
});

const subcategoryShape = shape({
    value: string.isRequired,
    label: messageShape.isRequired,
    prompt: node.isRequired,
    preventSubmission: bool
});

const categoryShape = shape({
    value: string.isRequired,
    label: messageShape.isRequired,
    prompt: node.isRequired,
    subcategories: arrayOf(subcategoryShape)
});

const reportOptionsShape = arrayOf(categoryShape);

const REPORT_OPTIONS = [
    {
        value: '',
        label: {id: 'report.reasonPlaceHolder'},
        prompt: <FormattedMessage id="report.promptPlaceholder" />
    },
    {
        value: '19',
        label: {id: 'report.reasonDisrespectful'},
        prompt: (
            <div>
                <p><FormattedMessage id="report.promptDisrespectful1" /></p>
                <p><FormattedMessage id="report.promptDisrespectful2" /></p>
            </div>
        )
    },
    {
        value: '2',
        label: {id: 'report.reasonScary'},
        prompt: (
            <FormattedMessage
                id="report.promptScary"
                values={{
                    CommunityGuidelinesLink: (
                        <a
                            href="/community_guidelines"
                            target="_blank"
                        >
                            <FormattedMessage id="general.guidelines" />
                        </a>
                    )
                }}
            />
        ),
        subcategories: [
            {
                value: '',
                label: {id: 'report.reasonPlaceHolder'},
                prompt: <FormattedMessage id="report.promptPlaceholder" />
            },
            {
                value: '15',
                label: {id: 'report.reasonJumpscare'},
                prompt: (
                    <div>
                        <p><FormattedMessage id="report.promptJumpscare1" /></p>
                        <p><FormattedMessage id="report.promptJumpscare2" /></p>
                    </div>
                )
            },
            {
                value: '17',
                label: {id: 'report.reasonWeapons'},
                prompt: (
                    <div>
                        <p><FormattedMessage id="report.promptWeapons1" /></p>
                        <p><FormattedMessage id="report.promptWeapons2" /></p>
                    </div>
                )
            },
            {
                value: '16',
                label: {id: 'report.reasonEvent'},
                prompt: (
                    <div>
                        <p><FormattedMessage id="report.promptEvent1" /></p>
                        <p><FormattedMessage id="report.promptEvent2" /></p>
                    </div>
                )
            },
            {
                value: '14',
                label: {id: 'report.reasonScaryImages'},
                prompt: (
                    <div>
                        <p><FormattedMessage id="report.promptScaryImages1" /></p>
                        <p><FormattedMessage id="report.promptScaryImages2" /></p>
                    </div>
                )
            },
            {
                value: '18',
                label: {id: 'report.reasonThreatening'},
                prompt: <FormattedMessage id="report.promptThreatening" />
            }
        ]
    },
    {
        value: '3',
        label: {id: 'report.reasonLanguage'},
        prompt: <FormattedMessage id="report.promptLanguage" />
    },
    {
        value: '4',
        label: {id: 'report.reasonMusic'},
        prompt: <FormattedMessage id="report.promptMusic" />
    },
    {
        value: '8',
        label: {id: 'report.reasonImage'},
        prompt: <FormattedMessage id="report.promptImage" />
    },
    {
        value: '5',
        label: {id: 'report.reasonPersonal'},
        prompt: <FormattedMessage id="report.promptPersonal" />
    },
    {
        value: '0',
        label: {id: 'report.reasonCopy'},
        prompt: <FormattedMessage id="report.promptCopy" />
    },
    {
        value: '1',
        label: {id: 'report.reasonUncredited'},
        prompt: <FormattedMessage id="report.promptUncredited" />
    },
    {
        value: '6',
        label: {id: 'general.other'},
        prompt: (
            <FormattedMessage
                id="report.promptGuidelines"
                values={{
                    CommunityGuidelinesLink: (
                        <a
                            href="/community_guidelines"
                            target="_blank"
                        >
                            <FormattedMessage id="general.guidelines" />
                        </a>
                    )
                }}
            />
        ),
        subcategories: [
            {
                value: '',
                label: {id: 'report.reasonPlaceHolder'},
                prompt: <FormattedMessage id="report.promptPlaceholder" />
            },
            {
                value: 'report.reasonDontLikeIt',
                label: {id: 'report.reasonDontLikeIt'},
                prompt: (
                    <div>
                        <p><FormattedMessage id="report.promptDontLikeIt" /></p>
                        <p><FormattedMessage id="report.promptTips" /></p>
                        <ul>
                            <li><FormattedMessage id="report.tipsSupportive" /></li>
                            <li><FormattedMessage id="report.tipsConstructive" /></li>
                            <li><FormattedMessage id="report.tipsSpecific" /></li>
                        </ul>
                    </div>
                ),
                preventSubmission: true
            },
            {
                value: 'report.reasonDoesntWork',
                label: {id: 'report.reasonDoesntWork'},
                prompt: (
                    <div>
                        <p><FormattedMessage id="report.promptDoesntWork" /></p>
                        <p><FormattedMessage id="report.promptDoesntWorkTips" /></p>
                        <p><FormattedMessage id="report.promptTips" /></p>
                        <ul>
                            <li><FormattedMessage id="report.tipsSupportive" /></li>
                            <li><FormattedMessage id="report.tipsConstructive" /></li>
                            <li><FormattedMessage id="report.tipsSpecific" /></li>
                        </ul>
                    </div>
                ),
                preventSubmission: true
            },
            {
                value: 'report.reasonCouldImprove',
                label: {id: 'report.reasonCouldImprove'},
                prompt: (
                    <div>
                        <p><FormattedMessage id="report.promptDontLikeIt" /></p>
                        <p><FormattedMessage id="report.promptTips" /></p>
                        <ul>
                            <li><FormattedMessage id="report.tipsSupportive" /></li>
                            <li><FormattedMessage id="report.tipsConstructive" /></li>
                            <li><FormattedMessage id="report.tipsSpecific" /></li>
                        </ul>
                    </div>
                ),
                preventSubmission: true
            },
            {
                value: 'report.reasonTooHard',
                label: {id: 'report.reasonTooHard'},
                prompt: (
                    <div>
                        <p><FormattedMessage id="report.promptTooHard" /></p>
                        <p><FormattedMessage id="report.promptTips" /></p>
                        <ul>
                            <li><FormattedMessage id="report.tipsSupportive" /></li>
                            <li><FormattedMessage id="report.tipsConstructive" /></li>
                            <li><FormattedMessage id="report.tipsSpecific" /></li>
                        </ul>
                    </div>
                ),
                preventSubmission: true
            },
            {
                value: '9',
                label: {id: 'report.reasonMisleading'},
                prompt: <FormattedMessage id="report.promptMisleading" />
            },
            {
                value: '10',
                label: {id: 'report.reasonFaceReveal'},
                prompt: (
                    <FormattedMessage
                        id={`report.promptFaceReveal`}
                        values={{
                            send: <FormattedMessage id="report.send" />
                        }}
                    />
                )
            },
            {
                value: '11',
                label: {id: 'report.reasonNoRemixingAllowed'},
                prompt: <FormattedMessage id="report.promptNoRemixingAllowed" />
            },
            {
                value: '12',
                label: {id: 'report.reasonCreatorsSafety'},
                prompt: <FormattedMessage id="report.promptCreatorsSafety" />
            },
            {
                value: '13',
                label: {id: 'report.reasonSomethingElse'},
                prompt: (
                    <FormattedMessage
                        id={`report.promptSomethingElse`}
                        values={{
                            CommunityGuidelinesLink: (
                                <a
                                    href="/community_guidelines"
                                    target="_blank"
                                >
                                    <FormattedMessage id="report.CommunityGuidelinesLinkText" />
                                </a>
                            )
                        }}
                    />
                )
            }
        ]
    }
];

module.exports = {
    reportOptionsShape,
    REPORT_OPTIONS
};
