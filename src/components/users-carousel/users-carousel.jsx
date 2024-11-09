const React = require('react');
const Slider = require('react-slick').default;
const defaults = require('lodash.defaults');
const PropTypes = require('prop-types');
const classNames = require('classnames');

const frameless = require('../../lib/frameless.js');

const UsersCarousel = (props) => {
    defaults(props.settings, {
        centerMode: false,
        dots: false,
        infinite: false,
        lazyLoad: true,
        slidesToShow: 7,
        slidesToScroll: 7,
        variableWidth: true,
        responsive: [
            {
                breakpoint: frameless.mobile,
                settings: {
                    arrows: true,
                    slidesToScroll: 1,
                    slidesToShow: 1,
                    centerMode: true
                }
            },
            {
                breakpoint: frameless.mobileIntermediate,
                settings: {
                    slidesToScroll: 2,
                    slidesToShow: 2
                }
            },
            {
                breakpoint: frameless.desktop,
                settings: {
                    slidesToScroll: 4,
                    slidesToShow: 4
                }
            }
        ]
    });
    const arrows = props.items.length > props.settings.slidesToShow;
    return (
        <Slider
            arrows={arrows}
            className={classNames('carousel', props.className)}
            {...props.settings}
        >
            {props.items}
        </Slider>
    );
}

UsersCarousel.propTypes = {
    className: PropTypes.string,
    items: PropTypes.arrayOf(PropTypes.any),
    settings: PropTypes.shape({
        centerMode: PropTypes.bool,
        dots: PropTypes.bool,
        infinite: PropTypes.bool,
        lazyLoad: PropTypes.bool,
        slidesToShow: PropTypes.number,
        slidesToScroll: PropTypes.number,
        variableWidth: PropTypes.bool,
        responsive: PropTypes.array
    }),
    showLoves: PropTypes.bool,
    showRemixes: PropTypes.bool,
    type: PropTypes.string
};

UsersCarousel.defaultProps = {
    items: [],
    settings: {},
    showRemixes: false,
    showLoves: false,
    type: 'user'
};

module.exports = UsersCarousel;
