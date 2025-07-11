const React = require('react');
const { createRef } = require('react');
const {connect} = require('react-redux');
const bindAll = require('lodash.bindall');
const isEqual = require('lodash.isequal');
const PropTypes = require('prop-types');

require('./cover-uploader.scss');

let globalResult = {};

class CoverUploader extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            coverPreview: null,
            isDefault: true
        };
        this.coverRef = createRef();
        this.coverPreviewRef = createRef();
        window.test = () => this.coverPreviewRef;
        bindAll(this, [
            'handleCoverChange'
        ]);
    }

    // 新增图片处理方法
    handleCoverChange (e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                this.setState({
                    coverPreview: event.target.result,
                    isDefault: false
                }, () => {
                    this.coverPreviewRef.current.src = event.target.result;
                    globalResult = this.coverPreviewRef.current.src;
                });
            };
            reader.readAsDataURL(file);
        }
    }

    componentDidMount() {
        const defaultUrl = this.props.projectInfo && this.props.projectInfo.image;
        if (defaultUrl && this.coverPreviewRef.current) {
            this.setState({
                coverPreview: defaultUrl
            }, () => {
                this.coverPreviewRef.current.src = defaultUrl;
                globalResult = defaultUrl;
            });
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
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
                    globalResult = defaultUrl;
                });
            }
        }
    }

    render() {
        const {children, className, required, ...options} = this.props;

        return (
            <div className={className} {...options}>
                <div className="cover-upload-label">
                    <label>
                        <input
                            type="file"
                            accept="image/*"
                            ref={this.coverRef}
                            onChange={this.handleCoverChange} // 添加事件绑定
                            style={{ display: 'none' }}
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
                        onClick={() => {
                            this.setState({ isDefault: true });
                        }}
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
    isOpen: bool
};

CoverUploader.defaultProps = {
    projectInfo: {},
    isOpen: false
};

module.exports = CoverUploader;
module.exports.getResult = () => globalResult;
