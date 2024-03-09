import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { checkForOnClick, onClickTrigger, onLoadTrigger } from "../../../helpers";
import { connect } from "react-redux";

class BlockQuote extends PureComponent { // eslint-disable-line react/prefer-stateless-function
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
        const { style, isEdit, className, id } = this.props;
        return (
            <blockquote className={className} id={id} style={style} onClick={isEdit ? this.onClick : null}
                {...this.props.inline}
                ref={this.props.inline ? this.props.inline.innerRef : null}
            >
                {this.props.children}
            </blockquote>
        );
    }
}

BlockQuote.propTypes = {
    style: PropTypes.object,
};
BlockQuote.defaultProps = {
    style: {},
};

export default connect () (BlockQuote);
