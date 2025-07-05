const ImportantNewsModalComponent = require('./modal.jsx');
const React = require('react');

const {closeModal, getIsOpen} = require('../../../redux/news');
const PropTypes = require('prop-types');
const {connect} = require('react-redux');

class ImportantNewsModal extends React.Component {
    reader () {
        return (
            <ImportantNewsModalComponent
                isOpen={this.props.isOpen}
                onRequestClose={this.props.handleClose}
                news={this.props.news}
            />
        );
    }
}

ImportantNewsModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    handleClose: PropTypes.func,
    news: PropTypes.arrayOf(PropTypes.objectOf({
        headline: PropTypes.string,
        small: PropTypes.string,
        copy: PropTypes.string,
        type: PropTypes.string,
        important: PropTypes.bool
    }))
};

ImportantNewsModal.defaultProps = {
    isOpen: false,
    news: []
};

const mapStateToProps = state => ({
    isOpen: getIsOpen(state),
    news: state.news
});

const mapDispatchToProps = dispatch => ({
    handleClose: () => {
        dispatch(closeModal());
    }
});

module.exports = connect(
    mapStateToProps,
    mapDispatchToProps
)(ImportantNewsModal);
