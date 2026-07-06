/* eslint-disable react/jsx-no-bind */
import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import classNames from 'classnames';
import {FormattedMessage} from 'react-intl';

import {addProject, removeProject} from '../lib/studio-project-actions';
import {userProjects} from '../lib/redux-modules';
import {Filters, loadUserProjects, clearUserProjects} from '../lib/user-projects-actions';

import Modal from '../../../components/modal/base/modal.jsx';
import ModalTitle from '../../../components/modal/base/modal-title.jsx';
import ModalInnerContent from '../../../components/modal/base/modal-inner-content.jsx';
import SubNavigation from '../../../components/subnavigation/subnavigation.jsx';
import UserProjectsTile from './user-projects-tile.jsx';

import './user-projects-modal.scss';
import AlertProvider from '../../../components/alert/alert-provider.jsx';
import Alert from '../../../components/alert/alert.jsx';
import Spinner from '../../../components/spinner/spinner.jsx';

const UserProjectsModal = ({
    items, error, loading, moreToLoad,
    onLoadMore, onClear, onAdd, onRemove, onRequestClose
}) => {
    const [filter, setFilter] = useState(Filters.ALL);

    useEffect(() => {
        onClear();
        onLoadMore(filter);
    }, [filter]);
    
    return (
        <Modal
            isOpen
            className="user-projects-modal"
            onRequestClose={onRequestClose}
        >
            <ModalTitle
                className="user-projects-modal-title modal-header"
                title="添加自己的作品至工作室"
            />
            <SubNavigation
                align="left"
                className="user-projects-modal-nav"
            >
                <button
                    className={classNames({active: filter === Filters.ALL})}
                    onClick={() => setFilter(Filters.ALL)}
                >
                    <FormattedMessage id="studio.allFilter" />
                </button>
                <button
                    className={classNames({active: filter === Filters.UNSHARED})}
                    onClick={() => setFilter(Filters.UNSHARED)}
                >
                    <FormattedMessage id="studio.unsharedFilter" />
                </button>
                <button
                    className={classNames({active: filter === Filters.SHARED})}
                    onClick={() => setFilter(Filters.SHARED)}
                >
                    <FormattedMessage id="studio.sharedFilter" />
                </button>
            </SubNavigation>
            <ModalInnerContent className="user-projects-modal-content">
                <AlertProvider>
                    {error && <div>Error loading {filter}: {error}</div>}
                    <Alert className="studio-alert" />
                    {items.length > 0 &&
                        <React.Fragment>
                            <div className="user-projects-modal-grid">
                                {items.map(project => (
                                    <UserProjectsTile
                                        key={project.id}
                                        id={project.id}
                                        title={project.title}
                                        image={project.image}
                                        inStudio={project.inStudio}
                                        onAdd={onAdd}
                                        onRemove={onRemove}
                                    />
                                ))}
                                {moreToLoad &&
                                    <div className="studio-grid-load-more">
                                        <button
                                            className={classNames('button', {
                                                'mod-mutating': loading
                                            })}
                                            onClick={() => onLoadMore(filter)}
                                        >
                                            <FormattedMessage id="general.loadMore" />
                                        </button>
                                    </div>
                                }
                            </div>

                        </React.Fragment>
                    }
                    {!loading && items.length === 0 &&
                        <div className="studio-projects-empty">
                            <img
                                src="/svgs/studio/add-to-studio-empty.svg"
                            />
                            <div className="studio-projects-empty-text">
                                {filter === Filters.ALL &&
                                    <FormattedMessage id="studio.addProjects.noAllYet" />}
                                {filter === Filters.UNSHARED &&
                                    <FormattedMessage id="studio.addProjects.noUnsharedYet" />}
                                {filter === Filters.SHARED &&
                                    <FormattedMessage id="studio.addProjects.noSharedYet" />}
                            </div>
                        </div>
                    }
                    {loading &&
                        <Spinner
                            className="studio-projects-spinner"
                            color="blue"
                        />
                    }
                </AlertProvider>
            </ModalInnerContent>
            <div className="studio-projects-done-row">
                <button
                    className="button"
                    onClick={onRequestClose}
                >
                    <FormattedMessage id="general.done" />
                </button>
            </div>
        </Modal>
    );
};

UserProjectsModal.propTypes = {
    items: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.id,
        image: PropTypes.string,
        title: PropTypes.string,
        inStudio: PropTypes.bool
    })),
    loading: PropTypes.bool,
    error: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    moreToLoad: PropTypes.bool,
    onLoadMore: PropTypes.func,
    onClear: PropTypes.func,
    onAdd: PropTypes.func,
    onRemove: PropTypes.func,
    onRequestClose: PropTypes.func
};

const mapStateToProps = state => ({
    ...userProjects.selector(state)
});

const mapDispatchToProps = ({
    onLoadMore: loadUserProjects,
    onClear: clearUserProjects,
    onAdd: addProject,
    onRemove: removeProject
});

export default connect(mapStateToProps, mapDispatchToProps)(UserProjectsModal);
