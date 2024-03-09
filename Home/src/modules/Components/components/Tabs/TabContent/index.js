import React, { PureComponent } from 'react';
import PropTypes from "prop-types";

class TabContent extends PureComponent { // eslint-disable-line react/prefer-stateless-function

	render() {
		const { style, className, children } = this.props;
		return (
			<div style={style} className={className}>
				{children}
			</div>
		); // eslint-disable-line
	}
}

TabContent.propTypes = {
	
};
TabContent.defaultProps = {
	
};

export default TabContent;
