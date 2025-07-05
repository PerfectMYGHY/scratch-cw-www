const bindAll = require('lodash.bindall');
const PropTypes = require('prop-types');
const React = require('react');
const SocialModalPresentation = require('./presentation.jsx');
const clipboardCopy = require('clipboard-copy');
const social = require('../../../lib/social');

class SocialModal extends React.Component {
    constructor (props) {
        super(props);
        this.embedTextarea = {};
        this.embedFullscreenCssTextarea = {};
        this.embedFullscreenBodyTextarea = {};
        this.embedFullscreenJSTextarea = {};
        this.embedCopyTimeoutId = null;
        this.embedFullscreenCssCopyTimeoutId = null;
        this.embedFullscreenBodyCopyTimeoutId = null;
        this.embedFullscreenJSCopyTimeoutId = null;
        this.linkCopyTimeoutId = null;
        this.linkTextarea = {};
        this.showCopyResultTimeout = 2000;
        this.state = {
            showEmbedResult: false,
            showEmbedFullscreenCssResult: false,
            showEmbedFullscreenBodyResult: false,
            showEmbedFullscreenJSResult: false,
            showLinkResult: false
        };
        bindAll(this, [
            'handleCopyEmbed',
            'handleCopyEmbedFullscreenCss',
            'handleCopyEmbedFullscreenBody',
            'handleCopyEmbedFullscreenJS',
            'handleCopyProjectLink',
            'hideEmbedResult',
            'hideEmbedFullscreenCssResult',
            'hideEmbedFullscreenBodyResult',
            'hideEmbedFullscreenJSResult',
            'hideLinkResult',
            'setEmbedTextarea',
            'setEmbedFullscreenCssTextarea',
            'setEmbedFullscreenBodyTextarea',
            'setEmbedFullscreenJSTextarea',
            'setLinkTextarea'
        ]);
    }
    componentWillUnmount () {
        this.clearEmbedCopyResultTimeout();
        this.hideEmbedFullscreenCssResult();
        this.hideEmbedFullscreenBodyResult();
        this.hideEmbedFullscreenJSResult();
        this.clearLinkCopyResultTimeout();
    }
    handleCopyEmbed () {
        if (this.embedTextarea) {
            this.embedTextarea.select();
            clipboardCopy(this.embedTextarea.value);
            if (this.state.showEmbedResult === false && this.embedCopyTimeoutId === null) {
                this.setState({showEmbedResult: true}, () => {
                    this.embedCopyTimeoutId = setTimeout(
                        this.hideEmbedResult,
                        this.showCopyResultTimeout
                    );
                });
            }
        }
    }
    handleCopyEmbedFullscreenCss () {
        if (this.embedFullscreenCssTextarea) {
            this.embedFullscreenCssTextarea.select();
            clipboardCopy(this.embedFullscreenCssTextarea.value);
            if (this.state.showEmbedFullscreenCssResult === false && this.embedFullscreenCssCopyTimeoutId === null) {
                this.setState({showEmbedFullscreenCssResult: true}, () => {
                    this.embedFullscreenCssCopyTimeoutId = setTimeout(
                        this.hideEmbedFullscreenCssResult,
                        this.showCopyResultTimeout
                    );
                });
            }
        }
    }
    handleCopyEmbedFullscreenBody () {
        if (this.embedFullscreenBodyTextarea) {
            this.embedFullscreenBodyTextarea.select();
            clipboardCopy(this.embedFullscreenBodyTextarea.value);
            if (this.state.showEmbedFullscreenBodyResult === false && this.embedFullscreenBodyCopyTimeoutId === null) {
                this.setState({showEmbedFullscreenBodyResult: true}, () => {
                    this.embedFullscreenBodyCopyTimeoutId = setTimeout(
                        this.hideEmbedFullscreenBodyResult,
                        this.showCopyResultTimeout
                    );
                });
            }
        }
    }
    handleCopyEmbedFullscreenJS () {
        if (this.embedFullscreenJSTextarea) {
            this.embedFullscreenJSTextarea.select();
            clipboardCopy(this.embedFullscreenJSTextarea.value);
            if (this.state.showEmbedFullscreenJSResult === false && this.embedFullscreenJSCopyTimeoutId === null) {
                this.setState({showEmbedFullscreenJSResult: true}, () => {
                    this.embedFullscreenJSCopyTimeoutId = setTimeout(
                        this.hideEmbedFullscreenJSResult,
                        this.showCopyResultTimeout
                    );
                });
            }
        }
    }
    handleCopyProjectLink () {
        if (this.linkTextarea) {
            this.linkTextarea.select();
            clipboardCopy(this.linkTextarea.value);
            if (this.state.showLinkResult === false && this.linkCopyTimeoutId === null) {
                this.setState({showLinkResult: true}, () => {
                    this.linkCopyTimeoutId = setTimeout(
                        this.hideLinkResult,
                        this.showCopyResultTimeout
                    );
                });
            }
        }
    }
    hideEmbedResult () {
        this.setState({showEmbedResult: false});
        this.embedCopyTimeoutId = null;
    }
    hideEmbedFullscreenCssResult () {
        this.setState({showEmbedFullscreenCssResult: false});
        this.embedFullscreenCssCopyTimeoutId = null;
    }
    hideEmbedFullscreenBodyResult () {
        this.setState({showEmbedFullscreenBodyResult: false});
        this.embedFullscreenBodyCopyTimeoutId = null;
    }
    hideEmbedFullscreenJSResult () {
        this.setState({showEmbedFullscreenJSResult: false});
        this.embedFullscreenJSCopyTimeoutId = null;
    }
    hideLinkResult () {
        this.setState({showLinkResult: false});
        this.linkCopyTimeoutId = null;
    }
    setEmbedTextarea (textarea) {
        this.embedTextarea = textarea;
        return textarea;
    }
    setEmbedFullscreenCssTextarea (textarea) {
        this.embedFullscreenCssTextarea = textarea;
        return textarea;
    }
    setEmbedFullscreenBodyTextarea (textarea) {
        this.embedFullscreenBodyTextarea = textarea;
        return textarea;
    }
    setEmbedFullscreenJSTextarea (textarea) {
        this.embedFullscreenJSTextarea = textarea;
        return textarea;
    }
    setLinkTextarea (textarea) {
        this.linkTextarea = textarea;
        return textarea;
    }
    clearEmbedCopyResultTimeout () {
        if (this.embedCopyTimeoutId !== null) {
            clearTimeout(this.embedCopyTimeoutId);
            this.embedCopyTimeoutId = null;
        }
    }
    clearEmbedFullscreenCssCopyResultTimeout () {
        if (this.embedCopyFullscreenCssTimeoutId !== null) {
            clearTimeout(this.embedCopyFullscreenCssTimeoutId);
            this.embedCopyFullscreenCssTimeoutId = null;
        }
    }
    clearEmbedFullscreenBodyCopyResultTimeout () {
        if (this.embedCopyFullscreenBodyTimeoutId !== null) {
            clearTimeout(this.embedCopyFullscreenBodyTimeoutId);
            this.embedCopyFullscreenBodyTimeoutId = null;
        }
    }
    clearEmbedFullscreenJSCopyResultTimeout () {
        if (this.embedCopyFullscreenJSTimeoutId !== null) {
            clearTimeout(this.embedCopyFullscreenJSTimeoutId);
            this.embedCopyFullscreenJSTimeoutId = null;
        }
    }
    clearLinkCopyResultTimeout () {
        if (this.linkCopyTimeoutId !== null) {
            clearTimeout(this.linkCopyTimeoutId);
            this.linkCopyTimeoutId = null;
        }
    }
    render () {
        const projectId = this.props.projectId;
        return (
            <SocialModalPresentation
                embedHtml={social.embedHtml(projectId)}
                embedFullscreenHtmlCss={social.embedFullscreenHtml(projectId).css}
                embedFullscreenHtmlBody={social.embedFullscreenHtml(projectId).body}
                embedFullscreenHtmlJavascript={social.embedFullscreenHtml(projectId).javascript}
                isOpen={this.props.isOpen}
                projectUrl={social.projectUrl(projectId)}
                setEmbedTextarea={this.setEmbedTextarea}
                setEmbedFullscreenCssTextarea={this.setEmbedFullscreenCssTextarea}
                setEmbedFullscreenBodyTextarea={this.setEmbedFullscreenBodyTextarea}
                setEmbedFullscreenJSTextarea={this.setEmbedFullscreenJSTextarea}
                setLinkTextarea={this.setLinkTextarea}
                showEmbedResult={this.state.showEmbedResult}
                showEmbedFullscreenCssResult={this.state.showEmbedFullscreenCssResult}
                showEmbedFullscreenBodyResult={this.state.showEmbedFullscreenBodyResult}
                showEmbedFullscreenJSResult={this.state.showEmbedFullscreenJSResult}
                showLinkResult={this.state.showLinkResult}
                onCopyEmbed={this.handleCopyEmbed}
                onCopyEmbedFullscreenCss={this.handleCopyEmbedFullscreenCss}
                onCopyEmbedFullscreenBody={this.handleCopyEmbedFullscreenBody}
                onCopyEmbedFullscreenJS={this.handleCopyEmbedFullscreenJS}
                onCopyProjectLink={this.handleCopyProjectLink}
                onRequestClose={this.props.onRequestClose}
            />
        );
    }
}

SocialModal.propTypes = {
    isOpen: PropTypes.bool,
    onRequestClose: PropTypes.func,
    projectId: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
};

module.exports = SocialModal;
