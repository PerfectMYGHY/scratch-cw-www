module.exports = {};

module.exports.projectUrl = projectId => {
    if (projectId) {
        return `${process.env.BASE_HOST}/projects/${projectId}`;
    }
    return '';
};

module.exports.embedHtml = projectId => {
    if (projectId) {
        return `<iframe src="${process.env.BASE_HOST}/projects/${projectId}/embed" ` +
            'allowtransparency="true" width="485" height="402" ' +
            'frameborder="0" scrolling="no" allowfullscreen></iframe>';
    }
    return '';
};
