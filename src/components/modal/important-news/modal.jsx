import React from 'react';
import PropTypes from 'prop-types';
import Button from '../../forms/button.jsx';
import bindAll from 'lodash.bindall';
import isEqual from 'lodash.isequal';

const {closeModal, getIsOpen} = require('../../../redux/news');
const {connect} = require('react-redux');
const classNames = require('classnames');

import FlexRow from '../../flex-row/flex-row.jsx';

import Modal from '../base/modal.jsx';
require('./modal.scss');

class ImportantNewsModal extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            counter: -1,
            currentNews: {},
            timerTime: 10,
            newsReadState: []
        };
        bindAll(this, [
            'handleLastNews',
            'handleNextNews'
        ]);
        this.timer = null;
    }

    componentDidUpdate (prevProps, prevState, snapshot) {
        if (!isEqual(this.props.news, {}) && !isEqual(this.state.currentNews, this.props.news[this.state.counter])) {
            this.setState({
                currentNews: this.props.news[this.state.counter],
                newsReadState: Array(this.props.news.length).fill(false),
                counter: 0
            });
        }
        if (prevState.counter !== this.state.counter) {
            if (this.state.newsReadState[this.state.counter]) {
                this.setState({
                    timerTime: 0
                });
                if (this.timer) {
                    clearInterval(this.timer);
                }
            } else {
                this.setState({
                    timerTime: 10
                });
                if (this.timer) {
                    clearInterval(this.timer);
                }
                this.timer = setInterval(() => {
                    if (this.state.timerTime > 0) {
                        this.setState({
                            timerTime: this.state.timerTime - 1
                        });
                    }
                    if (this.state.timerTime === 0) {
                        clearInterval(this.timer);
                        this.setState(state => ({
                            newsReadState: state.newsReadState.map((item, index) =>
                                (index === state.counter ? true : item)
                            )
                        }));
                    }
                }, 1000);
            }
        }
    }

    componentWillUnmount () {
        if (this.timer) clearInterval(this.timer);
    }

    handleLastNews () {
        this.setState({
            counter: this.state.counter - 1,
            currentNews: this.props.news[this.state.counter - 1]
        });
    }

    handleNextNews () {
        this.setState({
            counter: this.state.counter + 1,
            currentNews: this.props.news[this.state.counter + 1]
        });
    }

    render () {
        const {news, onRequestClose, isOpen} = this.props;
        const LeftDisabled = this.state.counter === 0;
        const RightDisabled = this.state.counter === news.length - 1 || this.state.timerTime > 0;
        const OKDisabled = this.state.counter !== news.length - 1 || this.state.timerTime > 0;
        const typeToText = {
            info: '提示',
            warn: '警告',
            error: '错误'
        };
        const title = this.state.currentNews && this.state.currentNews.headline;
        const newsType = this.state.currentNews && typeToText[this.state.currentNews.type];
        return (
            <Modal
                className="important-news-modal"
                isOpen={isOpen}
                showCloseButton={false}
                useStandardSizes
                onRequestClose={onRequestClose}
            >
                <div className="top-close-bar">
                    重要消息：{title}（{newsType}）
                </div>
                <div className="modal-main-content">
                    <img
                        className="modal-image"
                        alt="email-confirmation-illustration"
                        src="/svgs/modal/confirm-email-illustration.svg"
                    />

                    <div
                        className="modal-text-content"
                        dangerouslySetInnerHTML={{
                            __html: this.state.currentNews && this.state.currentNews.copy
                        }}
                    >

                    </div>
                </div>
                <FlexRow className="guide-footer">
                    <Button
                        alt="上一个"
                        title="上一个"
                        disabled={LeftDisabled}
                        onClick={this.handleLastNews}
                        className={classNames([
                            'last-button',
                            {
                                disabled: LeftDisabled
                            }
                        ])}
                    >
                        上一个
                    </Button>
                    <div>
                        <Button
                            alt="下一个"
                            title="下一个"
                            disabled={RightDisabled}
                            onClick={this.handleNextNews}
                            className={classNames([
                                'next-button',
                                {
                                    disabled: RightDisabled
                                }
                            ])}
                        >
                            {
                                RightDisabled && this.state.timerTime > 0 && this.state.counter !== news.length - 1 ?
                                    `下一个（${this.state.timerTime}秒）` : '下一步'
                            }
                        </Button>
                        <Button
                            alt="确定"
                            title="确定"
                            disabled={OKDisabled}
                            onClick={this.props.onRequestClose}
                            className={classNames([
                                'ok-button',
                                {
                                    disabled: OKDisabled
                                }
                            ])}
                        >
                            {
                                OKDisabled && this.state.timerTime > 0 && this.state.counter === news.length - 1 ?
                                    `确定（${this.state.timerTime}秒）` :
                                    '确定'
                            }
                        </Button>
                    </div>
                </FlexRow>
            </Modal>
        );
    }
}

ImportantNewsModal.propTypes = {
    news: PropTypes.arrayOf(PropTypes.shape({
        headline: PropTypes.string,
        small: PropTypes.string,
        copy: PropTypes.string,
        type: PropTypes.string,
        important: PropTypes.bool
    })),
    isOpen: PropTypes.bool,
    onRequestClose: PropTypes.func
};

ImportantNewsModal.defaultProps = {
    isOpen: false,
    news: []
};

const mapStateToProps = state => ({
    isOpen: getIsOpen(state),
    news: state.news.news
});

const mapDispatchToProps = dispatch => ({
    onRequestClose: () => {
        dispatch(closeModal());
    }
});

module.exports = connect(
    mapStateToProps,
    mapDispatchToProps
)(ImportantNewsModal);
