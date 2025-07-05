const keyMirror = require('keymirror');
const defaults = require('lodash.defaults');

const Types = keyMirror({
    SET_NEWS: null,
    OPEN_MODAL: null,
    CLOSE_MODAL: null,
    OPEN_MODAL_WITH: null
});

module.exports.Status = keyMirror({
    MODAL_OPENED: null,
    MODAL_CLOSED: null
});

module.exports.getInitialState = () => ({
    news: [],
    news_modal: module.exports.Status.MODAL_CLOSED
});

module.exports.newsReducer = (state, action) => {
    // Reducer for handling changes to session state
    if (typeof state === 'undefined') {
        state = module.exports.getInitialState();
    }
    switch (action.type) {
    case Types.SET_NEWS:
        return defaults({news: action.news}, state);
    case Types.OPEN_MODAL:
        return defaults({news_modal: module.exports.Status.MODAL_OPENED}, state);
    case Types.CLOSE_MODAL:
        return defaults({news_modal: module.exports.Status.MODAL_CLOSED}, state);
    case Types.OPEN_MODAL_WITH:
        return defaults({news_modal: module.exports.Status.MODAL_OPENED, news: action.news}, state);
    default:
        return state;
    }
};

module.exports.setNews = news => ({
    type: Types.SET_NEWS,
    news: news
});

module.exports.openModal = () => ({
    type: Types.OPEN_MODAL
});

module.exports.closeModal = () => ({
    type: Types.CLOSE_MODAL
});

module.exports.openModalWith = news => ({
    type: Types.OPEN_MODAL_WITH,
    news: news
});

module.exports.getIsOpen = state => (state.news.news_modal === module.exports.Status.MODAL_OPENED);
