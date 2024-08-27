import GUI from './containers/gui.jsx';
import AppStateHOC from './lib/app-state-hoc.jsx';
import ErrorBoundaryHOC from './lib/error-boundary-hoc.jsx';
import TWProjectMetaFetcherHOC from './lib/tw-project-meta-fetcher-hoc.jsx';
import TWStateManagerHOC from './lib/tw-state-manager-hoc.jsx';
import TWPackagerIntegrationHOC from './lib/tw-packager-integration-hoc.jsx';
import HashParserHOC from './lib/hash-parser-hoc.jsx';
import GuiReducer, {guiInitialState, guiMiddleware, initEmbedded, initFullScreen, initPlayer} from './reducers/gui';
import LocalesReducer, {localesInitialState, initLocale} from './reducers/locales';
import {ScratchPaintReducer} from 'scratch-paint';
import {setFullScreen, setPlayer} from './reducers/mode';
import {remixProject} from './reducers/project-state';
import { setAppElement } from 'react-modal';
import AddonChannels from './addons/channels';
import SettingsStore from './addons/settings-store-singleton';
import AddonHooks from './addons/hooks';
import runAddons from './addons/entry';

const guiReducers = {
    locales: LocalesReducer,
    scratchGui: GuiReducer,
    scratchPaint: ScratchPaintReducer
};

export {
    GUI as default,
    AppStateHOC,
    setAppElement,
    guiReducers,
    guiInitialState,
    guiMiddleware,
    initEmbedded,
    initPlayer,
    initFullScreen,
    initLocale,
    localesInitialState,
    remixProject,
    setFullScreen,
    setPlayer,
    AddonChannels,
    SettingsStore,
    AddonHooks,
    runAddons
};
