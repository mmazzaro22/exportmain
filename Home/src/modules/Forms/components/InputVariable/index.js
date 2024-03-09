import React, { PureComponent, Children } from 'react';
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { checkForOnClick, onClickTrigger, onLoadTrigger, deepMap } from "../../../helpers";

class InputVariable extends PureComponent { // eslint-disable-line react/prefer-stateless-function
    componentWillMount() {
        const { actions, dispatch } = this.props;
        onLoadTrigger(actions, dispatch)
    }

    onClick = (e) => {
        const { actions, dispatch, name, value } = this.props;
        if(checkForOnClick(actions, dispatch)) {
            onClickTrigger(actions, dispatch);
        }

        if(name && name.length > 0) {
            dispatch({
                type: "change_input",
                payload: {name: name, value: value}
            });
        }
    }

    render() {
        const { children, className, id, style } = this.props;

        return (
            <span className={className} id={id} style={style} onClick={this.onClick}>
                {children}
            </span>
        ); 
    }
}

InputVariable.propTypes = {
    style: PropTypes.object,
    identifier: PropTypes.string
};

InputVariable.defaultProps = {
    style: {},
    identifier: 'Input Variable',
};

export default connect () (InputVariable);