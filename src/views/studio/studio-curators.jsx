import React, {useEffect} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {FormattedMessage} from 'react-intl';
import classNames from 'classnames';

import {curators} from './lib/redux-modules';
import {CuratorTile} from './studio-member-tile.jsx';
import CuratorInviter from './studio-curator-inviter.jsx';
import {loadCurators} from './lib/studio-member-actions';
import {selectCanInviteCurators} from '../../redux/studio-permissions';
import AlertProvider from '../../components/alert/alert-provider.jsx';
import Alert from '../../components/alert/alert.jsx';

const StudioCurators = ({
    canInviteCurators, items, error, loading, moreToLoad, onLoadMore
}) => {
    useEffect(() => {
        if (items.length === 0) onLoadMore();
    }, []);

    return (
        <AlertProvider>
            <div className="studio-members">
                <Alert className="studio-alert" />
                <div className="studio-header-container">
                    <h2><FormattedMessage id="studio.curatorsHeader" /></h2>
                </div>
                {canInviteCurators && <CuratorInviter />}
                {error && <div className="studio-section-load-error studio-info-box studio-info-box-error">
                    <h3><FormattedMessage id="studio.sectionLoadError.curatorsHeadline" /></h3>
                    <button
                        className="button"
                        onClick={onLoadMore}
                    >
                        <FormattedMessage id="studio.sectionLoadError.tryAgain" />
                    </button>
                </div>}
                <div className="studio-members-grid">
                    {items.length === 0 && !loading ? (
                        <div className="studio-empty">
                            <img
                                width="179"
                                height="111"
                                className="studio-empty-img"
                                src="/images/studios/curators-empty-image.svg"
                            />
                            {canInviteCurators ? (
                                <div className="studio-empty-msg">
                                    <div><FormattedMessage id="studio.curatorsEmptyCanAdd1" /></div>
                                    <div><FormattedMessage id="studio.curatorsEmptyCanAdd2" /></div>
                                </div>
                            ) : (
                                <div className="studio-empty-msg">
                                    <div><FormattedMessage id="studio.curatorsEmpty1" /></div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <React.Fragment>
                            {items.map(item =>
                                (<CuratorTile
                                    key={item.username}
                                    username={item.username}
                                    image={item.profile.images['90x90']}
                                />)
                            )}
                            {moreToLoad &&
                            <div className="studio-grid-load-more">
                                <button
                                    className={classNames('button', {
                                        'mod-mutating': loading
                                    })}
                                    onClick={onLoadMore}
                                >
                                    <FormattedMessage id="general.loadMore" />
                                </button>
                            </div>
                            }
                        </React.Fragment>
                    )}
                </div>
            </div>
        </AlertProvider>);
};

StudioCurators.propTypes = {
    items: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.id,
        username: PropTypes.string,
        profile: PropTypes.shape({
            images: PropTypes.shape({
                '90x90': PropTypes.string
            })
        })
    })),
    canInviteCurators: PropTypes.bool,
    loading: PropTypes.bool,
    error: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    moreToLoad: PropTypes.bool,
    onLoadMore: PropTypes.func
};

export default connect(
    state => ({
        ...curators.selector(state),
        canInviteCurators: selectCanInviteCurators(state)
    }),
    {
        onLoadMore: loadCurators
    }
)(StudioCurators);
