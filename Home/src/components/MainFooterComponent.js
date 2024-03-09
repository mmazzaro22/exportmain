import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { isArray } from "lodash";

class MainFooterComponent extends Component {
	render() {
		//let { row, index, errors } = this.props;
		let {
		} = this.props;
		const {
		} = window;

		return (
			<Fragment>
				
<divblock >
</divblock>
			</Fragment>
		);
	}
}

const mapStateToProps = function(state){
    return state.reducer
}

export default connect (mapStateToProps, null) ( MainFooterComponent );