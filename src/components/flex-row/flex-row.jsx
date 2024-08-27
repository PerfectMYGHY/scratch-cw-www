const classNames = require('classnames');
const PropTypes = require('prop-types');
const React = require('react');

const frameless = require("../../_frameless.scss");
require('./flex-row.scss');

const FlexRow = props => (
    <props.as className={classNames('flex-row', props.className)} style={props.style}>
        {props.children}
    </props.as>
);

FlexRow.propTypes = {
    children: PropTypes.node,
    className: PropTypes.string
};

FlexRow.defaultProps = {
    as: 'div'
};

module.exports = FlexRow;
