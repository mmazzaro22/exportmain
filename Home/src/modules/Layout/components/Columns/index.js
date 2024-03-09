import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import PropTypes from "prop-types";
import { checkForOnClick, onClickTrigger, onLoadTrigger } from "../../../helpers";
import classnames from "classnames";

class Columns extends PureComponent { // eslint-disable-line react/prefer-stateless-function
    componentWillMount() {
        const { actions, dispatch } = this.props;
        onLoadTrigger(actions, dispatch)
    }

    onClick = (e) => {
        const { actions, dispatch, name, value } = this.props;
        if(checkForOnClick(actions,dispatch)) {
            onClickTrigger(actions,dispatch);
        }
    }

    render() {
        const { style, id, className } = this.props;

        return (
            <div
                className={classnames(className, 'df-row')}
                id={id}
                onClick={this.onClick} 
                style={style}
                {...this.props.inline}
            >
                {this.props.children}
            </div>
        );

    }
}

Columns.propTypes = {
    style: PropTypes.object,
};
Columns.defaultProps = {

};

export default connect () (Columns);
