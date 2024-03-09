import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from "react-redux";
import { onLoadTrigger, onChangeTrigger } from "../../../helpers";

class CheckBoxOption extends PureComponent { // eslint-disable-line react/prefer-stateless-function

    constructor(props) {
        super(props);
        this.state = {
            value: props.initialValue === true ||  props.initialValue === 'true'
        };
    }

    componentWillMount() {
        const { actions, dispatch } = this.props;
        onLoadTrigger(actions, dispatch)
    }

    handleChange = async (event) => {
        const { actions, dispatch, name, changeInput } = this.props;
        const checked = event.target.checked;
        if(name && name.length > 0) {
            changeInput({
                name: name, 
                value: checked 
            }).then(() => {
                onChangeTrigger(actions, dispatch);
            });
        } else {
             onChangeTrigger(actions, dispatch);
        }

        this.setState({ value: checked });
    }

    render() {
        const { style, options, initialValue } = this.props;
        const { value } = this.state;

        return (
            <input 
                name={this.props.name} 
                type="checkbox"
                onChange={this.handleChange}
                checked={value}
            />
        );
    }
}

CheckBoxOption.propTypes = {
    style: PropTypes.object,
    groupName: PropTypes.string,
    name: PropTypes.string,
};
CheckBoxOption.defaultProps = {
    style: {},
    value: false,
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

export default connect (null, mapDispatchToProps) (CheckBoxOption);