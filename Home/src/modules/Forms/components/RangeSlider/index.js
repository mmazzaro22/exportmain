import React, { PureComponent } from 'react';
import PropTypes from "prop-types";
import {connect} from "react-redux";
import { isArray, isFunction, throttle, isObject, debounce } from 'lodash';
import { configureRange } from './slider-utils.js';

import { sortAsc, getValue, onChangeTrigger } from "../../../helpers";

import './index.css';

class RangeSlider extends PureComponent { // eslint-disable-line react/prefer-stateless-function
    componentWillMount() {
        this.handleChange = throttle(this.handleChange, 200)
        this.setInitialState(this.props)
    }

    componentDidMount() {
        window.addEventListener('touchmove', this.handleTouchMove)
        window.addEventListener('touchend', this.handleMouseUp)
        window.addEventListener('mousemove', this.handleMouseMove)
        window.addEventListener('mouseup', this.handleMouseUp)

        this.delayedSetInitialState = debounce((props) => this.setInitialState(props), 500);
    }

    componentWillUnmount() {
        this.handleChange.cancel()
        window.removeEventListener('touchmove', this.handleTouchMove)
        window.removeEventListener('touchend', this.handleMouseUp)
        window.removeEventListener('mousemove', this.handleMouseMove)
        window.removeEventListener('mouseup', this.handleMouseUp)
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.range && nextProps.range !== this.props.range || this.props.store !== nextProps.store) {
            this.delayedSetInitialState(nextProps);
        }
        if (
            nextProps.value !== this.props.value &&
            nextProps.value !== this.state.value
        ) {
            const value = this.state.range.ensureValue(nextProps.value)
            this.setState({ value })
        }


    }

    setInitialState = props => {
        let { dataSet, dataSetValue, min, max, step, store } = props;
        let range = [];

        // Populate ranges from dataset.
        if(dataSet && isArray(dataSet)) {
            dataSet = sortAsc(dataSet, dataSetValue);
            dataSet.forEach((d, index) => {
                // Try to get number value for slider.
                let val = getValue(d, dataSetValue);

                if(index < (dataSet.length - 1)) {
                    let nextVal = getValue(dataSet[index + 1], dataSetValue)
                    range.push({value:val, step:nextVal - val});
                } else {
                    range.push({value:val});
                }
            });
        }

        // Fall back to populating ranges from min, max, step.
        if(range.length === 0) {
            range = [{
                value:min,
                step:step
            }, {
                value:max
            }];
        }

        range = configureRange(range)
        const value = range.ensureValue(props.value || props.defaultValue)
        const currentStep = range.getStepForValue(value)
        this.setState({ /*value,*/ range/*, currentStep*/ })
    }

    stepUp = amount => {
        const { range, currentStep } = this.state
        const nextStep = currentStep + amount
        if (nextStep <= range.maxStep) {
            const nextValue = range.getValueForStep(nextStep)
            this.setState({ currentStep: nextStep, value: nextValue })
        }
    }

    stepDown = amount => {
        const { range, currentStep } = this.state
        const nextStep = currentStep - amount
        if (nextStep >= range.minStep) {
            const nextValue = range.getValueForStep(nextStep)
            this.setState({ currentStep: nextStep, value: nextValue })
        }
    }

    handleChange = async () => {
        const { value } = this.state;
        const { dispatch, name, actions } = this.props;
        if(name && name.length > 0) {
            await dispatch({
                type: "change_input",
                payload: {name: name, value: value}
            });
        }

        onChangeTrigger(actions, dispatch);
    }

    handleChangeComplete = async () => {
        const { value } = this.state
        const { dispatch, name, actions } = this.props;
        if(name && name.length > 0) {
            await dispatch({
                type: "change_input",
                payload: {name: name, value: value}
            });
        }

        onChangeTrigger(actions, dispatch);
    }

    handleMouseUp = e => {
        if (this.state.pressed) {
            this.setState({ pressed: false })
            this.handleChangeComplete()
        }
    }

    handleMouseMove = e => {
        if (this.state.pressed) {
            this.handleMove(e)
        }
    }

    handleMouseDown = e => {
        e.preventDefault()
        this.handlePress()
        this.handleMove(e)
    }

    handleTouchMove = e => {
        if (this.state.pressed) {
            e.preventDefault()
            this.handleMouseMove(e.touches[0])
        }
    }

    handleTouchStart = e => {
        this.handlePress()
        this.handleMove(e.touches[0])
    }

    handlePress = () => {
        this.sliderRect = this.slider.getBoundingClientRect()
        this.setState({ pressed: true })
    }

    handleMove = e => {
        const { clientX } = e
        const { disabled } = this.props
        const { range } = this.state
        const { width, left, right } = this.sliderRect

        if (!clientX || disabled) return

        let position
        if (clientX < left) {
            position = 0
        } else if (clientX > right) {
            position = right - left
        } else {
            position = clientX - left
        }
        const currentStep = Math.round(position / width * range.maxStep)
        const value = range.getValueForStep(currentStep)

        if (value !== this.state.value || currentStep !== this.state.currentStep) {
            this.setState({ value, currentStep }, this.handleChange)
        }
    }

    getChildren = () => {
        const { children } = this.props;
    }

    render() {
        const { id, name, disabled, tooltip, children, className, style } = this.props
        const { value, range, currentStep } = this.state

        const offset = currentStep / range.maxStep * 100
        const offsetStyle = { left: `${offset}%` }

        return (
            <div
                className={'StepRangeSlider'}
                onMouseDown={this.handleMouseDown}
                ref={node => (this.slider = node)}
                {...this.props.inline}
            >
                <div style={style} className="StepRangeSlider__track" />
                <div
                    className="StepRangeSlider__handle"
                    onTouchStart={this.handleTouchStart}
                    onMouseDown={this.handleMouseDown}
                    style={offsetStyle}
                >
                    {children}
                </div>
                <input type="hidden" id={id} name={name} disabled={disabled} />
            </div>
        )
    }
}

RangeSlider.displayName = 'RangeSlider';

RangeSlider.propTypes = {
    children: PropTypes.any,
    value: PropTypes.number,
    defaultValue: PropTypes.number,
    disabled: PropTypes.bool,
    min: PropTypes.number,
    max: PropTypes.number,
    step: PropTypes.number,
    dataSet: PropTypes.string
}

RangeSlider.defaultProps = {
    defaultValue: 0,
    disabled: false,
    min: 0,
    max: 500,
    step: 1
}

const mapStateToProps = function(state){
    return {
        store: state.reducer,
    }
}

export default connect (mapStateToProps, null) (RangeSlider);
