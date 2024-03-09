import React, { PureComponent } from 'react';
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { getTriggerEvents, onLoadTrigger } from "../../../helpers";

import './index.css';

class List extends PureComponent { // eslint-disable-line react/prefer-stateless-function
	constructor(props) {
        super(props);
        const { actions, dispatch } = props;
        this.state = {
            events: getTriggerEvents(actions, dispatch),
        }
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
		let { id, style, type, className } = this.props;
		if(type === "none") {
			className = (className ? className : "") + " df-list-unstyled";
		}

		const { events } = this.state;

		switch (type) {
			case 'ol':
				return (
					<ol 
						className={className} 
						id={id} 
						style={style} 
						{...events}
						{...this.props.inline}
					>
						{this.props.children}
					</ol>
				);
			default:
				return (
					<ul 
						className={className} 
						id={id} 
						style={style}
						{...events}
						{...this.props.inline}
					>
						{this.props.children}
					</ul>
				);
		}

	}
}

List.propTypes = {
	style: PropTypes.object,
	type: PropTypes.string
};
List.defaultProps = {
	style: {},
	type: {}
};

export default connect () (List);
