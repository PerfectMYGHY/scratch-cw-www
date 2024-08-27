import React, {useEffect} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import StudioDescription from './studio-description.jsx';
import StudioFollow from './studio-follow.jsx';
import StudioImage from './studio-image.jsx';
import StudioReport from './studio-report.jsx';
import StudioStats from './studio-stats.jsx';
import StudioTitle from './studio-title.jsx';

import {selectIsLoggedIn} from '../../redux/session';
import {getRoles} from '../../redux/studio';

const StudioInfo = ({
    isLoggedIn, onLoadRoles
}) => {
    useEffect(() => { // Load roles info once the user is logged in is available
        if (isLoggedIn) onLoadRoles();
    }, [isLoggedIn]);

    return (
        <React.Fragment>
            <StudioTitle />
            <StudioFollow />
            <StudioImage />
            <StudioDescription />
            <div className="studio-info-footer">
                <div className="studio-info-footer-stats">
                    <StudioStats />
                </div>
                <div className="studio-info-footer-report">
                    <StudioReport />
                </div>
            </div>
        </React.Fragment>
    );
};

StudioInfo.propTypes = {
    isLoggedIn: PropTypes.bool,
    onLoadRoles: PropTypes.func
};

export default connect(
    state => ({
        isLoggedIn: selectIsLoggedIn(state)
    }),
    {
        onLoadRoles: getRoles
    }
)(StudioInfo);
