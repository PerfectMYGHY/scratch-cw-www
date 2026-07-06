import keyMirror from 'keymirror';
import api from '../../../lib/api';
import {selectUserId} from '../../../redux/session';
import {userProjects, projects} from './redux-modules';

const Errors = keyMirror({
    NETWORK: null,
    SERVER: null,
    PERMISSION: null
});

const Filters = keyMirror({
    ALL: null,
    UNSHARED: null,
    SHARED: null
});

const Endpoints = {
    [Filters.ALL]: state => ({
        uri: `/users/${selectUserId(state)}/projects/all`
    }),
    [Filters.UNSHARED]: state => ({
        uri: `/users/${selectUserId(state)}/projects/unshared`
    }),
    [Filters.SHARED]: state => ({
        uri: `/users/${selectUserId(state)}/projects/shared`
    })
};

const normalizeError = (err, body, res) => {
    if (err) return Errors.NETWORK;
    if (res.statusCode === 401 || res.statusCode === 403) return Errors.PERMISSION;
    if (res.statusCode !== 200) return Errors.SERVER;
    return null;
};

const loadUserProjects = type => ((dispatch, getState) => {
    const state = getState();
    const projectCount = userProjects.selector(state).items.length;
    const projectsPerPage = 24;
    const opts = {
        ...Endpoints[type](state),
        params: {
            limit: projectsPerPage,
            offset: projectCount
        },
        method: 'POST'
    };
    dispatch(userProjects.actions.loading());
    api(opts, (err, body, res) => {
        const error = normalizeError(err, body, res);
        if (error) return dispatch(userProjects.actions.error(error));
        const moreToLoad = body.length === projectsPerPage;
        const studioProjectIds = projects.selector(getState()).items.map(item => item.id);
        const loadedProjects = body.map(item => Object.assign(item, {
            inStudio: studioProjectIds.indexOf(item.id) !== -1
        }));
        dispatch(userProjects.actions.append(loadedProjects, moreToLoad));
    });
});

// Re-export clear so that the consumer can manage filter changes
const clearUserProjects = userProjects.actions.clear;

export {
    Filters,
    loadUserProjects,
    clearUserProjects
};
