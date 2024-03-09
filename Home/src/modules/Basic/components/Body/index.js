import React, { PureComponent } from 'react';
import { connect } from "react-redux";
import { HashRouter as Router } from "react-router-dom";
import { getTriggerEvents, onLoadTrigger } from '../../../helpers';
import './index.css';

class Body extends PureComponent { // eslint-disable-line react/prefer-stateless-function
	constructor(props) {
        super(props);
        const { actions, dispatch } = props;
        this.state = {
            events: getTriggerEvents(actions, dispatch),
        }
    }

	componentWillMount() {
        const { actions, dispatch } = this.props;
        onLoadTrigger(actions, dispatch);
    }

    componentDidUpdate(prevProps, prevState) {
        const { actions, dispatch } = this.props;
        if(actions !== prevProps.actions) {
            this.setState({events: getTriggerEvents(actions, dispatch)})
        }
    }

	render() {
		let { style, className, children, id  } = this.props;
		const { events } = this.state;

		return (
			<div
				style={style}
				className={(className ? className : '') + ' df-body'}
				id={id}
				//{...events}
			>
				<Router>
					{children}
				</Router>
			</div>
		); // eslint-disable-line
	}
}

export default connect () (Body);