import React, { PureComponent } from 'react';
import PropTypes from "prop-types";
import { Switch } from "react-router-dom";

class RouteBlock extends PureComponent { // eslint-disable-line react/prefer-stateless-function

	render() {
		const { style, className, children, id } = this.props;
		return (
			<Switch style={style} className={className} id={id}>
				{children}
			</Switch>
		); // eslint-disable-line
	}
}

RouteBlock.propTypes = {
	style: PropTypes.object,
};
RouteBlock.defaultProps = {
	
};

export default RouteBlock;
