import React, { PureComponent } from 'react';
import { Route as ReactRouterRoute } from "react-router-dom";
import { withRouter } from "react-router";
import { connect } from "react-redux";

import { TriggerTypes, onTrigger } from "../../../helpers.js";

class Route extends PureComponent { // eslint-disable-line react/prefer-stateless-function
	componentDidMount() {
		const { actions, dispatch } = this.props;
		onTrigger(actions, TriggerTypes.ON_LOAD, dispatch);
	}

	componentDidUpdate(prevProps, prevState) {
		const { location, actions, dispatch } = this.props;
		if(location !== prevProps.location) {
			onTrigger(actions, TriggerTypes.ON_LOCATION_CHANGE, dispatch);
			window.scrollTo(0, 0);
		}
	}

	render() {
		const { style, className, children, path } = this.props;
		return (
			<ReactRouterRoute path={path} style={style} className={className}>
				{children}
			</ReactRouterRoute>
		); // eslint-disable-line
	}
}

export default withRouter(connect () (Route));
