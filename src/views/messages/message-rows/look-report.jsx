const classNames = require('classnames');
const FormattedMessage = require('react-intl').FormattedMessage;
const PropTypes = require('prop-types');
const React = require('react');

const SocialMessage = require('../../../components/social-message/social-message.jsx');

const LookReportMessage = props => (
    <SocialMessage
        className={classNames(
            'mod-new-report',
            props.className
        )}
        datetime={props.createDateTime}
        iconAlt="新举报消息图片"
        iconSrc="/svgs/messages/new-report.svg"
    >
        <FormattedMessage
            id="messages.newReportText"
            values={{
                reportCenterLink: (
                    <a href="/scratch-admin/wait/reports/">
                        <FormattedMessage id="messages.reportCenter" />
                    </a>
                ),
                message: props.body.isProject ? (
                    <FormattedMessage
                        id="messages.projectReport"
                        values={{
                            projectLink: (
                                <a href={`/projects/${props.body.id}/`}>
                                    {props.body.title}
                                </a>
                            )
                        }}
                    />
                ) : (
                    <FormattedMessage 
                        id="messages.commentProject" 
                        values={{
                            projectLink: (
                                <a href={`/projects/${props.body.id}/`}>
                                    {props.body.title}
                                </a>
                            ),
                            comment: props.body.comment
                        }}
                    />
                )
            }}
        />
    </SocialMessage>
);

LookReportMessage.propTypes = {
    className: PropTypes.string,
    createDateTime: PropTypes.string.isRequired
};

module.exports = LookReportMessage;
