import React, { PureComponent } from 'react';
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { onLoadTrigger, getTriggerEvents } from '../../../helpers';

class Button extends PureComponent { // eslint-disable-line react/prefer-stateless-function
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
        const { style, className, id, draggable, isEdit } = this.props;
        const { events } = this.state;

        return (
            <button 
                draggable={draggable && !isEdit}
                id={id} 
                className={className} 
                style={style}
                {...events}
                {...this.props.inline}
                ref={this.props.inline ? this.props.inline.innerRef : null}
            >
                {this.props.children}
            </button>
        );
    }
}

Button.propTypes = {
    style: PropTypes.object,
    actions: PropTypes.array
};
Button.defaultProps = {
    style: {},
    action: {}
};

export default connect ()(Button);
