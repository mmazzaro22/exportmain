import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import PropTypes from "prop-types";
import { Grid } from 'react-flexbox-grid';
import { checkForOnClick, onClickTrigger, onLoadTrigger } from "../../../helpers";


class GridContainer extends PureComponent { // eslint-disable-line react/prefer-stateless-function
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
        const { style, fluid, actions, dispatch, id, className } = this.props;
        return (
            <Grid fluid={fluid} style={{
                border: this.props.children && this.props.children.length !== 0 ? 'unset' : '1px dashed black',
                height: (this.props.children && this.props.children.length !== 0) ? 'unset' : 100 ,
                ...style
            }} onClick={this.onClick} id={id} className={className}
                  {...this.props.inline}
            >
                {this.props.children}
            </Grid>
        );

    }
}

GridContainer.propTypes = {
    style: PropTypes.object,
    fluid: PropTypes.bool,
};
GridContainer.defaultProps = {
    fluid: true,
};

export default connect () (GridContainer);
