import React, { PureComponent } from 'react';

class Group extends PureComponent { // eslint-disable-line react/prefer-stateless-function

	render() {
		const { style, className, children } = this.props;
		return (
			<div style={style} className={className}>
				{children}
			</div>
		); // eslint-disable-line
	}
}

export default Group;
