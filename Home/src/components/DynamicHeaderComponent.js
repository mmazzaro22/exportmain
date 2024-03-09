import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { isArray } from "lodash";

class DynamicHeaderComponent extends Component {
	render() {
		//let { row, index, errors } = this.props;
		let {
		} = this.props;
		const {
		} = window;

		return (
			<Fragment>
				
<partial_1263 >
</partial_1263>
			</Fragment>
		);
	}
}

const mapStateToProps = function(state){
    return state.reducer
}

export default connect (mapStateToProps, null) ( DynamicHeaderComponent );