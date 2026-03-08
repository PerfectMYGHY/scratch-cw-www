const bindAll = require('lodash.bindall');
const classNames = require('classnames');
const React = require('react');
const PropTypes = require('prop-types');
import {Formik} from 'formik';
const {injectIntl} = require('react-intl');

const {provinceInfo} = require('../../lib/province-data');
const intlShape = require('../../lib/intl-shape');
const FormikSelect = require('../../components/formik-forms/formik-select.jsx');
const JoinFlowStep = require('./join-flow-step.jsx');
const FormikCheckbox = require('../../components/formik-forms/formik-checkbox.jsx');

require('./join-flow-steps.scss');

class ProvinceStep extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleValidSubmit',
            'validateForm',
            'validateSelect'
        ]);
        this.provinceOptions = [];
    }
    componentDidMount () {
        if (this.props.sendAnalytics) {
            this.props.sendAnalytics('join-province');
        }
        this.setCountryOptions();
    }
    setCountryOptions () {
        if (this.provinceOptions.length === 0) {
            this.provinceOptions = provinceInfo;
            this.provinceOptions.unshift({ // add placeholder as first option
                disabled: true,
                label: this.props.intl.formatMessage({id: 'registration.selectProvince'}),
                value: 'null'
            });
        }
    }
    validateSelect (selection) {
        if (selection === 'null') {
            return this.props.intl.formatMessage({id: 'general.required'});
        }
        return null;
    }
    validateForm () {
        return {};
    }
    handleValidSubmit (formData, formikBag) {
        formikBag.setSubmitting(false);
        this.props.onNextStep(formData);
    }
    render () {
        this.setCountryOptions();
        return (
            <Formik
                initialValues={{
                    province: 'null'
                }}
                validate={this.validateForm}
                validateOnBlur={false}
                validateOnChange={false}
                onSubmit={this.handleValidSubmit}
            >
                {props => {
                    const {
                        errors,
                        handleSubmit,
                        isSubmitting,
                        setFieldError
                    } = props;
                    return (
                        <JoinFlowStep
                            headerImgClass="province-step-image"
                            headerImgSrc="/images/join-flow/country-header.png"
                            innerClassName="join-flow-inner-province-step"
                            title={this.props.intl.formatMessage({id: 'registration.provinceStepTitle'})}
                            titleClassName="join-flow-province-title"
                            waiting={isSubmitting}
                            onSubmit={handleSubmit}
                        >
                            <div
                                className={classNames(
                                    'col-sm-9',
                                    'row'
                                )}
                            >
                                <FormikSelect
                                    className={classNames(
                                        'join-flow-select',
                                        'join-flow-select-province',
                                        {fail: errors.province}
                                    )}
                                    error={errors.province}
                                    id="province"
                                    name="province"
                                    options={this.provinceOptions}
                                    validate={this.validateSelect}
                                    validationClassName={classNames(
                                        'validation-full-width-input',
                                        'validation-province'
                                    )}
                                    /* eslint-disable react/jsx-no-bind */
                                    onFocus={() => setFieldError('province', null)}
                                    /* eslint-enable react/jsx-no-bind */
                                />
                                {/* note that this is a hidden checkbox the user will never see */}
                                <FormikCheckbox
                                    id="yesno"
                                    label={this.props.intl.formatMessage({id: 'registration.receiveEmails'})}
                                    name="yesno"
                                    outerClassName="yesNoCheckbox"
                                />
                            </div>
                        </JoinFlowStep>
                    );
                }}
            </Formik>
        );
    }
}

ProvinceStep.propTypes = {
    intl: intlShape,
    onNextStep: PropTypes.func,
    sendAnalytics: PropTypes.func.isRequired
};

const IntlProvinceStep = injectIntl(ProvinceStep);

module.exports = IntlProvinceStep;
