import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import PropTypes from "prop-types";
import { Col } from 'react-flexbox-grid';
import { checkForOnClick, onClickTrigger, onLoadTrigger } from "../../../helpers";


class ColContainer extends PureComponent { // eslint-disable-line react/prefer-stateless-function
    constructor(props) {
        super(props);
    }

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
        return (
            <Col style={{
                border: this.props.children && this.props.children.length !== 0 ? 'unset' : '1px dashed black',
                 height: (this.props.children && this.props.children.length !== 0) ? 'unset' : 100 ,
                ...this.props.style
            }}  onClick={this.onClick} {...this.props} {...this.props.inline}>
                {this.props.children}
            </Col>
        );

    }
}

ColContainer.propTypes = {
    style: PropTypes.object,
    fluid: PropTypes.bool,
};
ColContainer.defaultProps = {
    fluid: true,
};

export default connect () (ColContainer);
