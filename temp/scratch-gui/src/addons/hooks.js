const AddonHooks = {
    appStateReducer: () => {},
    appStateStore: null,
    blockly: null,
    blocklyWorkspace: null,
    blocklyCallbacks: [],
    recolorCallbacks: []
};
//const AddonHooks = {
//    appStateReducer: () => { },
//    _appStateStore: null,
//    set appStateStore(value) {
//        console.error('属性 prop 被设置为：', value);
//        console.log(new Error("abc").stack);
//        this._appStateStore = value;
//    },
//    get appStateStore() {
//        return this._appStateStore;
//    },
//    blockly: null,
//    blocklyWorkspace: null,
//    blocklyCallbacks: [],
//    recolorCallbacks: []
//};

export default AddonHooks;
