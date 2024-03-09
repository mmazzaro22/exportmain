import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import PropTypes from "prop-types";
import { checkForOnClick, onClickTrigger, onLoadTrigger } from "../../../helpers";
import classnames from "classnames";

class Container extends PureComponent { // eslint-disable-line react/prefer-stateless-function
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
        const { style, id, className, fluid } = this.props;

        return (
            <div
                className={classnames(className, { 'df-container':fluid !== true, 'df-container-fluid': fluid === true })}
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

Container.propTypes = {
    style: PropTypes.object,
};
Container.defaultProps = {

};

export default connect () (Container);
