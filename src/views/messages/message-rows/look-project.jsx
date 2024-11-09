const classNames = require('classnames');
const FormattedMessage = require('react-intl').FormattedMessage;
const PropTypes = require('prop-types');
const React = require('react');

const SocialMessage = require('../../../components/social-message/social-message.jsx');

const LookProjectMessage = props => (
    <SocialMessage
        className={classNames(
            'mod-new-project',
            props.className
        )}
        datetime={props.createDateTime}
        iconAlt="新作品消息图片"
        iconSrc="/svgs/messages/new-project.svg"
    >
        <FormattedMessage
            id="messages.newProjectText"
            values={{
                link: (
                    <a href={`/projects/${props.project_id}/`}>
                        {props.title}
                    </a>
                )
            }}
        />
    </SocialMessage>
);

LookProjectMessage.propTypes = {
    className: PropTypes.string,
    createDateTime: PropTypes.string.isRequired
};

module.exports = LookProjectMessage;
