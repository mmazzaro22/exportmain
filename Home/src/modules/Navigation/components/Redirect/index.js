import React, { PureComponent } from 'react';
import { Redirect as ReactRedirect } from "react-router-dom";

class Redirect extends PureComponent { // eslint-disable-line react/prefer-stateless-function

	render() {
		let { from, to, style, className, children } = this.props;
		if(!from) {
			from = "*";
		}
		if(!to) {
			to = "/";
		}

		return (
			<ReactRedirect from={from} to={to} style={style} className={className}>
				{children}
			</ReactRedirect>
		); // eslint-disable-line
	}
}

export default Redirect;
