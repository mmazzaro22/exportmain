import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from "react-redux";
import { onLoadTrigger, onChangeTrigger, getTriggerEvents } from "../../../helpers";

class Iframe extends PureComponent { // eslint-disable-line react/prefer-stateless-function

    constructor(props) {
        super(props);
        const { actions, dispatch } = props;
        this.state = {
            events: getTriggerEvents(actions, dispatch)
        };
    }

    componentWillMount() {
        // Run onload triggers.
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
        const { style, className, src } = this.props;
        const { events } = this.state;
        
        return (
            <iframe
                className={className}
                src={src}
                style={style}
                {...events}
                {...this.props.inline}
            />
        );
    }
}

Iframe.propTypes = {
    style: PropTypes.object,
};
Iframe.defaultProps = {
    style: {},
};

export default connect () (Iframe);