const keyMirror = require('keymirror');
const defaults = require('lodash.defaults');

const Types = keyMirror({
    // ShareModal
    OPEN_SHARE_MODAL: null,
    CLOSE_SHARE_MODAL: null,
    SET_SHARE_MODAL_OPTIONS: null
});

module.exports.Status = keyMirror({
    MODAL_OPENED: null,
    MODAL_CLOSED: null
});

module.exports.getInitialState = () => ({
    // ShareModal
    share_modal: module.exports.Status.MODAL_CLOSED,
    current_options: {}
});

module.exports.customModalReducer = (state, action) => {
    // Reducer for handling changes to session state
    if (typeof state === 'undefined') {
        state = module.exports.getInitialState();
    }
    switch (action.type) {
    case Types.OPEN_SHARE_MODAL:
        return defaults({share_modal: module.exports.Status.MODAL_OPENED, current_options: action.options}, state);
    case Types.CLOSE_SHARE_MODAL:
        return defaults({share_modal: module.exports.Status.MODAL_CLOSED}, state);
    case Types.SET_SHARE_MODAL_OPTIONS:
        return defaults({current_options: action.options}, state);
    default:
        return state;
    }
};

module.exports.openShareModal = (options) => ({
    type: Types.OPEN_SHARE_MODAL,
    options
});

module.exports.closeShareModal = () => ({
    type: Types.CLOSE_SHARE_MODAL
});

module.exports.setShareModalOptions = (options) => ({
    type: Types.SET_SHARE_MODAL_OPTIONS,
    options
});

module.exports.getShareModalOptions = state => state.customModal.current_options;
module.exports.getShareModalIsOpen = state => (state.customModal.share_modal === module.exports.Status.MODAL_OPENED);
