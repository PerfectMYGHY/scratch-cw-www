const React = require('react');
const {createRef} = require('react');
const bindAll = require('lodash.bindall');
const isEqual = require('lodash.isequal');
const PropTypes = require('prop-types');
const {connect} = require('react-redux');
const {setCoverURL} = require('../../redux/custom-modal.js');

require('./cover-uploader.scss');

class CoverUploader extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            coverPreview: null,
            isDefault: true
        };
        this.coverRef = createRef();
        this.coverPreviewRef = createRef();
        bindAll(this, [
            'handleCoverChange',
            'handleReset',
            'resultChange'
        ]);
    }

    componentDidMount () {
        const defaultUrl = this.props.projectInfo && this.props.projectInfo.image;
        if (defaultUrl && this.coverPreviewRef.current) {
            this.setState({
                coverPreview: defaultUrl
            }, () => {
                this.coverPreviewRef.current.src = defaultUrl;
                this.resultChange(defaultUrl);
            });
        }
    }

    componentDidUpdate (prevProps, prevState) {
        if (
            (!isEqual(prevProps.projectInfo, this.props.projectInfo) && this.state.isDefault) || // 当一直是默认封面且项目信息改变时
            (!prevState.isDefault && this.state.isDefault) || // 或切换回默认封面
            (!prevProps.isOpen && this.props.isOpen) // 或刚打开时
        ) {
            const defaultUrl = this.props.projectInfo && this.props.projectInfo.image;
            if (defaultUrl && this.coverPreviewRef.current) {
                this.setState({
                    coverPreview: defaultUrl
                }, () => {
                    this.coverPreviewRef.current.src = defaultUrl;
                    this.resultChange(defaultUrl);
                });
            }
        }
    }

    resultChange (url) {
        if (this.props.onSetCoverURL) {
            this.props.onSetCoverURL(url);
        }
    }

    // 新增图片处理方法
    handleCoverChange (e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = event => {
                this.setState({
                    coverPreview: event.target.result,
                    isDefault: false
                }, () => {
                    this.coverPreviewRef.current.src = event.target.result;
                    this.resultChange(this.coverPreviewRef.current.src);
                });
            };
            reader.readAsDataURL(file);
        }
    }

    handleReset () {
        this.setState({isDefault: true});
    }

    render () {
        const {children, className, required, isOpen, projectInfo, onSetCoverURL, ...options} = this.props;

        // eslint-disable-next-line no-unused-expressions
        isOpen; projectInfo; onSetCoverURL; // 让类型提示闭嘴

        return (
            <div
                className={className}
                {...options}
            >
                <div className="cover-upload-label">
                    <label>
                        <input
                            type="file"
                            accept="image/*"
                            ref={this.coverRef}
                            onChange={this.handleCoverChange} // 添加事件绑定
                            style={{display: 'none'}}
                            required={required}
                        />
                        <div
                            className="cover-preview"
                        >
                            <div className="hovering-cover">
                                点击替换作品封面
                            </div>
                            <img
                                ref={this.coverPreviewRef}
                            />
                        </div>
                    </label>
                    <button
                        type="button"
                        className="reset-cover-button"
                        onClick={this.handleReset}
                    >
                        🔄 恢复默认
                    </button>
                </div>
                {children}
            </div>
        );
    }
}

const {
    number,
    string,
    shape,
    bool
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

CoverUploader.propTypes = {
    projectInfo: projectShape,
    isOpen: bool,
    children: PropTypes.node,
    className: PropTypes.string,
    required: PropTypes.bool,
    onSetCoverURL: PropTypes.func
};

CoverUploader.defaultProps = {
    projectInfo: {},
    isOpen: false,
    onSetCoverURL: () => {}
};

const mapStateToProps = () => ({
    
});

const mapDispatchToProps = dispatch => ({
    onSetCoverURL: url => dispatch(setCoverURL(url))
});

module.exports = connect(
    mapStateToProps,
    mapDispatchToProps
)(CoverUploader);
