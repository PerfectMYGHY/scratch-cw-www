import React from 'react';
//import GUI from '../containers/gui.jsx';
import GUI, { runAddons } from '../index.js';

const onClickLogo = () => {
    window.location = '/';
};

const searchParams = new URLSearchParams(location.search);
const cloudHost = searchParams.get('cloud_host') || process.env.CLOUDDATA_HOST || 'wss://clouddata.turbowarp.org';

const RenderGUI = props => (
    <GUI
        cloudHost={cloudHost}
        canUseCloud
        hasCloudPermission
        canSave={false}
        basePath={process.env.ROOT}
        canEditTitle
        enableCommunity
        onClickLogo={onClickLogo}
        {...props}
    />
);

export {
    RenderGUI as default,
    runAddons
};
