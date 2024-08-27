const redux = require('redux');
const { combineReducers } = require('redux');
const thunk = require('redux-thunk').default;

//const reducer = require('../redux/reducer.js');

const configureStore = (reducers, initialState, enhancer, AddonHooks) => {
    //const allReducers = reducer(reducers);
    var allReducers = null;
    if (AddonHooks) {
        var reducer = require('../redux/reducer.js');
        reducer = reducer(reducers);
        allReducers = (previousState, action) => {
            const nextState = reducer(previousState, action);
            AddonHooks.appStateReducer(action, previousState, nextState);
            return nextState;
        };
    } else {
        const reducer = require('../redux/reducer.js');
        allReducers = reducer(reducers);
    }

    const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || redux.compose;
    const enhancers = enhancer ?
        composeEnhancers(
            redux.applyMiddleware(thunk),
            enhancer
        ) :
        composeEnhancers(
            redux.applyMiddleware(thunk)
        );
    const store = redux.createStore(
        allReducers,
        initialState || {},
        enhancers
    );
    return store;
};

module.exports = configureStore;
