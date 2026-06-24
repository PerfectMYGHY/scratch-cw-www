const classNames = require('classnames');
const React = require('react');
const PropTypes = require('prop-types');

const NextStepButton = require('./next-step-button.jsx');
const ModalTitle = require('../modal/base/modal-title.jsx');
const ModalInnerContent = require('../modal/base/modal-inner-content.jsx');

require('./join-flow-step.scss');

const JoinFlowStep = ({
    children,
    innerClassName,
    description,
    descriptionClassName,
    footerContent,
    headerImgClass,
    headerImgSrc,
    nextButton,
    onSubmit,
    title,
    titleClassName,
    waiting,
    loginedInUser
}) => (
    <form
        autoComplete="off"
        onSubmit={onSubmit}
    >
        <div className="join-flow-outer-content">
            {headerImgSrc && (
                <div
                    className={classNames(
                        'join-flow-header-image-wrapper',
                        headerImgClass
                    )}
                >
                    <img
                        className="join-flow-header-image"
                        src={headerImgSrc}
                    />
                </div>
            )}
            <div>
                <ModalInnerContent
                    className={classNames(
                        'join-flow-inner-content',
                        innerClassName
                    )}
                >
                    {title && (
                        <ModalTitle
                            className={classNames(
                                'join-flow-title',
                                titleClassName
                            )}
                            title={title}
                        />
                    )}
                    {loginedInUser && (
                        <div
                            style={{
                                color: 'red'
                            }}
                        >
                            注意：您现在已经登录，请确保您不是失误进入本页面，重复注册您想要的账号。如果您退出登录再进入本页面，此提示就会消失。
                        </div>
                    )}
                    {description && (
                        <div
                            className={classNames(
                                'join-flow-description',
                                descriptionClassName
                            )}
                        >
                            {description}
                        </div>
                    )}
                    {children}
                </ModalInnerContent>
            </div>
            <div>
                {footerContent && (
                    <div className="join-flow-footer-message">
                        {footerContent}
                    </div>
                )}
                <NextStepButton
                    content={nextButton}
                    waiting={waiting}
                />
            </div>
        </div>
    </form>
);

JoinFlowStep.propTypes = {
    children: PropTypes.node,
    description: PropTypes.string,
    descriptionClassName: PropTypes.string,
    footerContent: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
    headerImgClass: PropTypes.string,
    headerImgSrc: PropTypes.string,
    innerClassName: PropTypes.string,
    nextButton: PropTypes.node,
    onSubmit: PropTypes.func,
    title: PropTypes.string,
    titleClassName: PropTypes.string,
    waiting: PropTypes.bool,
    loginedInUser: PropTypes.bool
};

module.exports = JoinFlowStep;
