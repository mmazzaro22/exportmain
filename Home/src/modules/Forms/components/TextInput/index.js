import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from "react-redux";
import { onLoadTrigger, onChangeTrigger, getTriggerEvents } from "../../../helpers";

class TextInput extends PureComponent { // eslint-disable-line react/prefer-stateless-function

    constructor(props) {
        super(props);
        const { actions, dispatch, initialValue } = props;
        this.state = {
            value: (initialValue || initialValue === 0) ? initialValue : "",
            events: getTriggerEvents(actions, dispatch)
        }
    }

    componentWillMount() {
        // Update store with initial values.
        const { value } = this.state;
        this.setValue(value, true);

        // Run onload triggers.
        const { actions, dispatch } = this.props;
        onLoadTrigger(actions, dispatch)
    }

    componentDidUpdate(prevProps, prevState) {
        if((this.props.initialValue !== prevProps.initialValue) && this.props.enableReinitialize) {
            this.setValue(this.props.initialValue, true);
        }

        const { actions, dispatch } = this.props;
        if(actions !== prevProps.actions) {
            this.setState({events: getTriggerEvents(actions, dispatch)})
        }
    }

    isEmpty = (value) => {
        return (value + '').trim() === "";
    }

    isNumberType = (type) => {
        return type === 'number' || type === 'decimal' || type === 'number_positive'  || type === 'number_negative'
            || type === 'decimal_positive' || type === 'decimal_negative';
    }

    getValue = (value) => {
        const { type } = this.props;
        if(value || value === 0) {
            if(!this.isEmpty(value) && this.isNumberType(type) && !isNaN(Number(value))) {
                if(type === 'decimal') {
                    value = Number(value);
                    if(type === 'decimal_positive' && value < 0) {
                        value = 0;
                    } else if(type === 'decimal_negative' && value > 0) {
                        value = 0;
                    }
                } else if(type === 'number' || type === 'number_positive') {
                    value = parseInt(value);
                    if(type === 'number_positive' && value < 0) {
                        value = 0;
                    } else if(type === 'number_negative' && value > 0) {
                        value = 0;
                    }
                }
            }
        } else {
            value = "";
        }
        return value;
    }

    setValue = async (value, onLoad) => {
        value = this.getValue(value);

        this.setState({ value: value }, () => {
            const { actions, dispatch, name, changeInput } = this.props;
            if(name && name.length > 0) {
                changeInput({ name, value }).then(() => {
                    if(!onLoad) {
                        onChangeTrigger(actions, dispatch);
                    }
                });
            } else if(!onLoad) {
                onChangeTrigger(actions, dispatch);
            }
        });
    }

    handleChange = (event) => {
        this.setValue(event.target.value);
    }

    render() {
        const { style, type, autocomplete } = this.props;
        const { events } = this.state;

        return (
            <input
                autocomplete={autocomplete}
                className={this.props.className}
                style={{ ...style }}
                required={this.props.isRequired}
                name={this.props.name}
                type={this.isNumberType(type) ? "number" : type}
                value={this.state.value}
                placeholder={this.props.placeholder}
                ref={this.props.inline ? this.props.inline.innerRef : null}
                {...events}
                onChange={this.handleChange}
                {...this.props.inline}
            />
        );
    }
}

TextInput.propTypes = {
    style: PropTypes.object,
    isRequired: PropTypes.bool,
    name: PropTypes.string,
    placeholder: PropTypes.string,
    type: PropTypes.string,
};
TextInput.defaultProps = {
    style: {},
    isRequired: false,
    type: 'text',
    placeholder: 'Lorem Ipsum',
    name: '',
};

const mapDispatchToProps = (dispatch) => {
    return {
        changeInput: (payload) => {
            dispatch({ type: 'change_input', payload });
            return Promise.resolve();
        },
        dispatch: dispatch
    }
}

export default connect (null, mapDispatchToProps) (TextInput);