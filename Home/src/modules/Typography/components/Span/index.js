import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { checkForOnClick, onClickTrigger, onLoadTrigger } from "../../../helpers";
import { connect } from "react-redux";

class Span extends PureComponent { // eslint-disable-line react/prefer-stateless-function
    componentWillMount() {
        const { actions, dispatch } = this.props;
        onLoadTrigger(actions, dispatch);
    }

    onClick = (e) => {
        const { actions, dispatch } = this.props;
        if(checkForOnClick(actions,dispatch)) {
            onClickTrigger(actions,dispatch);
        }
    }

    render() {
        const { className, style, id, isEdit } = this.props;
        return (
            <span className={className} style={style} onClick={this.onClick} onClick={!isEdit ? this.onClick : null} id={id}
                  {...this.props.inline}
                   ref={this.props.inline ? this.props.inline.innerRef : null}
            >
            {this.props.children}
        </span>);
    }
}

Span.propTypes = {
    style: PropTypes.object,
};
Span.defaultProps = {
    style: {},
};

export default connect () (Span);
