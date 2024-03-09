import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { checkForOnClick, onClickTrigger, onLoadTrigger } from "../../../helpers";
import { connect } from "react-redux";

class Label extends PureComponent { // eslint-disable-line react/prefer-stateless-function
    constructor(props) {
        super(props);
    }

    onClick = (e) => {
        const { actions, dispatch } = this.props;
        if(checkForOnClick(actions,dispatch)) {
            onClickTrigger(actions,dispatch);
        }
    }

    render() {
        const { style, className, id, isEdit } = this.props;
        return (
            <label
                className={className}
                id={id}
                onClick={!isEdit ? this.onClick : null}
                {...this.props.inline}
                ref={this.props.inline ? this.props.inline.innerRef : null}
                style={style}
                
            >
                {this.props.children}
            </label>
        );
    }
}

Label.propTypes = {
    style: PropTypes.object,
};
Label.defaultProps = {
    style: {},
};

const mapStateToProps = function(state){
    return {
        store: state.reducer,
    }
}

export default connect (mapStateToProps, null) (Label);
