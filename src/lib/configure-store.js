const redux = require('redux');
const {combineReducers} = require('redux');
const thunk = require('redux-thunk').default;

// const reducer = require('../redux/reducer.js');

const configureStore = (reducers, initialState, enhancer, GUI) => {
    // const allReducers = reducer(reducers);
    let allReducers = null;
    if (GUI) {
        let reducer = require('../redux/reducer.js');
        reducer = reducer(reducers);
        allReducers = (previousState, action) => {
            const nextState = reducer(previousState, action);
            GUI.AddonHooks.appStateReducer(action, previousState, nextState);
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
    if (GUI) {
        GUI.AddonHooks.appStateStore = store;
        setTimeout(() => {
            GUI.runAddons();
        }, 2000);
    }
    return store;
};

module.exports = configureStore;
