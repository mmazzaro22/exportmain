import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from "react-redux";
import { onLoadTrigger, onChangeTrigger, getTriggerEvents } from "../../../helpers";

class TextArea extends PureComponent { // eslint-disable-line react/prefer-stateless-function

    constructor(props) {
        super(props);
        const { actions, dispatch, initialValue } = props;
        this.state = {
            value: initialValue ? initialValue : '',
            events: getTriggerEvents(actions, dispatch)
        };
    }

    componentWillMount() {
        // Update store with initial values.
        const { value } = this.state;
        this.setValue(value);

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

    setValue = async (value) => {
       const { dispatch, name, actions } = this.props;
        if(name && name.length > 0) {
            await dispatch({
                type: "change_input",
                payload: {name: name, value: value}
            });
        }

        onChangeTrigger(actions, dispatch);
        
        this.setState({ value: value });
    }

    handleChange = (event) => {
        this.setValue(event.target.value);
    }

    render() {
        const { style, className } = this.props;
        const { events } = this.state;
        
        return (
            <textarea
                className={className}
                style={{ resize: 'none', ...style }}
                required={this.props.isRequired}
                name={this.props.name}
                value={this.state.value}
                placeholder={this.props.placeholder}
                rows={this.props.rows}
                {...events}
                onChange={this.handleChange}
                {...this.props.inline}
                ref={this.props.inline ? this.props.inline.innerRef : null}
            />
        );
    }
}

TextArea.propTypes = {
    style: PropTypes.object,
    isRequired: PropTypes.bool,
    name: PropTypes.string,
    placeholder: PropTypes.string,
    rows: PropTypes.number,
};
TextArea.defaultProps = {
    style: {},
    isRequired: false,
    name: '',
    placeholder: 'Lorem Ipsum',
    rows: 3,
};

export default connect () (TextArea);