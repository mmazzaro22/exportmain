import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import PropTypes from "prop-types";
import { checkForOnClick, onClickTrigger, onLoadTrigger, isInteger } from "../../../helpers";

const classMap = {
	xs: 'df-col',
	sm: 'df-col-sm',
	md: 'df-col-md',
	lg: 'df-col-lg',
	xl: 'df-col-xl'
};

class Column extends React.Component {
	componentWillMount() {
        const { actions, dispatch } = this.props;
        onLoadTrigger(actions, dispatch)
    }

    onClick = (e) => {
        const { actions, dispatch } = this.props;
        if(checkForOnClick(actions,dispatch)) {
            onClickTrigger(actions,dispatch);
        }
    }

	getColClassNames = () => {
		const extraClasses = [];

		if(this.props.className) {
			extraClasses.push(this.props.className);
		}

		return Object.keys(this.props)
			.filter(key => classMap[key])
			.map(key => isInteger(this.props[key]) ? (classMap[key] + '-' + this.props[key]) : classMap[key])
			.concat(extraClasses);
	}

	render() {
		const { children, id, style } = this.props;

		return (
			<div
				className={this.getColClassNames().join(' ')}
				id={id} 
				onClick={this.onClick} 
				style={style} 
				{...this.props.inline}
			>
				{children}
			</div>
		);
	}
	
}

Column.propTypes = {
    style: PropTypes.object,
};
Column.defaultProps = {
   
};

export default connect () (Column);
