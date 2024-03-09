import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from "react-redux";

import { getTypeName, onLoadTrigger, render, getTriggerEvents } from '../../../helpers.js';

export function Then(props) {
	return render(props);
}

Then.displayName = "Then";

export function Else(props) {
	return render(props);
}

Else.displayName = "Else";

export class If extends PureComponent { 
	constructor(props) {
        super(props);
        const { actions, dispatch } = props;
        this.state = {
            events: getTriggerEvents(actions, dispatch)
        };
    }
	
	componentWillMount() {
        const { actions, dispatch } = this.props;
        onLoadTrigger(actions, dispatch)
    }

    componentDidUpdate(prevProps, prevState) {
        const { actions, dispatch } = this.props;
        if(actions !== prevProps.actions) {
        	this.setState({events: getTriggerEvents(actions, dispatch)})
        }
    }
	
	render() {
		let { condition, children, style, className, id, show, isEdit } = this.props;
		condition = condition === true || (isEdit && show);
		const { events } = this.state;

		return (
			<div 
				style={style} 
				className={className} 
				id={id}
				{...events}
				{...this.props.inline}
			>
				{[].concat(children).find(c => (getTypeName(c) !== Else.displayName) ^ !condition) || null}
			</div>
		);
	}
}

If.displayName = "If";

If.propTypes = {
	style: PropTypes.object,
	condition: PropTypes.string,
};
If.defaultProps = {
	style: {},
	condition: "",
};

export default connect () (If);