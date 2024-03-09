import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { isArray } from "lodash";

class SidebarComponent extends Component {
	render() {
		//let { row, index, errors } = this.props;
		let {
		} = this.props;
		const {
		} = window;

		return (
			<Fragment>
				
<partial_1140 >
</partial_1140>
			</Fragment>
		);
	}
}

const mapStateToProps = function(state){
    return state.reducer
}

export default connect (mapStateToProps, null) ( SidebarComponent );