const React = require('react');
const ReactDOM = require('react-dom');
const Modal = require('../base/modal.jsx');
const ModalTitle = require('../base/modal-title.jsx');
const ModalInnerContent = require('../base/modal-inner-content.jsx');
const classNames = require('classnames');
const Button = require('../../forms/button.jsx');
const { createRef } = require('react');
const {connect} = require('react-redux');
const bindAll = require('lodash.bindall');
const isEqual = require('lodash.isequal');
const PropTypes = require('prop-types');
const {openShareModal, closeShareModal, getShareModalIsOpen, getShareModalOptions} = require('../../../redux/custom-modal.js');
const {getCurrentStore} = require('../../../lib/configure-store.js');
const CoverUploader = require('../../cover-uploader/cover-uploader.jsx');

require('./modal.scss');

class ShareModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            coverPreview: null,
            isDefault: true
        };
        this.titleRef = createRef();
        this.instructionsRef = createRef();
        this.descriptionRef = createRef();
        this.classesRef = createRef();
        this.coverUploaderRef = createRef();
        bindAll(this, [
            
        ]);
    }

    componentDidMount() {
        
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        
    }

    componentWillUnmount() {
        this.props.closeShareModal();
    }

    handleClose = () => {
        this.props.closeShareModal();
    };

    handleSubmit = () => {
        // 获取参数
        const title = this.titleRef.current.value;
        const instructions = this.instructionsRef.current.value;
        const description = this.descriptionRef.current.value;
        const classes = this.classesRef.current.value;
        const coverImage = CoverUploader.getResult();
        // 提交逻辑实现
        if (this.props.options.onSubmit) {
            this.props.options.onSubmit({
                title,
                instructions,
                description,
                classes,
                coverImage,
                projectInfo: this.props.projectInfo
            });
        }
        this.handleClose();
    };

    render() {
        const {isOpen, projectInfo} = this.props;

        return (
            <Modal
                isOpen={isOpen}
                onRequestClose={this.handleClose}
                className="share-modal"
                showCloseButton
                shouldCloseOnOverlayClick={false} // 添加此属性禁用空白区域关闭
            >
                <div className="share-modal-header modal-header">
                    <div className="top-close-bar">
                        完善信息
                    </div>
                </div>
                <ModalInnerContent className="share-modal-content">
                    <div className="modal-main-content">
                        <div className="modal-text-content">
                            您现在要分享您的作品，为了保证高质量搜随、推送，方便审核、用户使用，请您填写以下信息：
                        </div>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            this.handleSubmit();
                        }}>
                            <div className="share-modal-form-group">
                                <label htmlFor="title" className="main-label" required>作品标题</label>
                                <div className="share-modal-form-input">
                                    <input
                                        type="text"
                                        id="title"
                                        name="title"
                                        ref={this.titleRef}
                                        defaultValue={projectInfo.title}
                                        required
                                    />
                                    <small className="share-modal-hint">请输入作品标题，能概括出作品主要内容</small>
                                </div>
                            </div>
                            <div className="share-modal-form-group">
                                <label htmlFor="instructions" className="main-label" required>操作说明</label>
                                <div className="share-modal-form-input">
                                    <textarea
                                        id="instructions"
                                        name="instructions"
                                        ref={this.instructionsRef}
                                        defaultValue={projectInfo.instructions}
                                        required
                                    />
                                    <small className="share-modal-hint">请描述作品的操作方法和步骤，可使用Markdown语言</small>
                                </div>
                            </div>
                            <div className="share-modal-form-group">
                                <label htmlFor="description" className="main-label">备注与鸣谢</label>
                                <div className="share-modal-form-input">
                                    <textarea
                                        id="description"
                                        name="description"
                                        ref={this.descriptionRef}
                                        defaultValue={projectInfo.description}
                                    />
                                    <small className="share-modal-hint">可填写作品备注或感谢信息，没有则不显示，可使用Markdown语言</small>
                                </div>
                            </div>
                            <div className="share-modal-form-group">
                                <label htmlFor="labels" className="main-label">作品标签</label>
                                <div className="share-modal-form-input">
                                    <input
                                        type="text"
                                        id="labels"
                                        name="labels"
                                        ref={this.classesRef}
                                        defaultValue={projectInfo.classes}
                                    />
                                    <small className="share-modal-hint">请输入作品标签，用空格分隔</small>
                                </div>
                            </div>
                            <div className="share-modal-form-group">
                                <label className="main-label" required>作品封面：</label>
                                <div className="share-modal-form-input">
                                    <CoverUploader
                                        isOpen={isOpen}
                                        ref={this.coverUploaderRef}
                                        projectInfo={projectInfo}
                                    >
                                        <small className="share-modal-hint">点击可更换封面图片</small>
                                    </CoverUploader>
                                </div>
                            </div>
                            <div className='modal-button-content'>
                                <Button
                                    className="cancel-button"
                                    onClick={this.handleClose}
                                >
                                    取消分享
                                </Button>
                                <Button
                                    type="submit" // 添加 type="submit" 使表单按下回车时触发此按钮
                                >
                                    确认分享
                                </Button>
                            </div>
                        </form>
                    </div>
                </ModalInnerContent>
            </Modal>
        );
    }
}

const {
    number,
    string,
    shape,
    bool,
    func
} = PropTypes;

const projectShape = shape({
    id: number,
    instructions: string,
    title: string,
    description: string,
    author: shape({
        id: number,
        username: string
    }),
    image: string,
    history: shape({
        created: string,
        modified: string,
        shared: string
    }),
    stats: shape({
        views: number,
        loves: number,
        favorites: number,
        comments: number,
        remixes: number
    }),
    remix: shape({
        parent: number,
        root: number
    }),
    project_token: string
});

ShareModal.propTypes = {
    projectInfo: projectShape,
    isOpen: bool,
    closeShareModal: func,
    options: shape({
        onSubmit: func
    })
};

ShareModal.defaultProps = {
    projectInfo: {},
    isOpen: false,
    options: {}
};

const mapStateToProps = state => {
    return {
        projectInfo: state.preview && state.preview.projectInfo,
        isOpen: getShareModalIsOpen(state),
        options: getShareModalOptions(state)
    };
};

const mapDispatchToProps = dispatch => ({
    closeShareModal: () => dispatch(closeShareModal())
});

const WrappedShareModal = connect(
    mapStateToProps,
    mapDispatchToProps
)(ShareModal);

module.exports = WrappedShareModal;

// 获取全局Store并启动分享模态框
module.exports.showModal = (options) => {
    console.log("显示！", options);
    const store = getCurrentStore();
    if (store) {
        store.dispatch(openShareModal(options));
        return true;
    }
    return false;
};