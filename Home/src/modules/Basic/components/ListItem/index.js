import React, { PureComponent } from 'react';
import PropTypes from "prop-types";
import { getTriggerEvents, onLoadTrigger } from "../../../helpers";
import { connect } from "react-redux";

class ListItem extends PureComponent { // eslint-disable-line react/prefer-stateless-function
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
        const { style, id, className } = this.props;
        const { events } = this.state;

        return (
            <li 
                className={className} 
                id={id} 
                style={style} 
                {...events}
                {...this.props.inline}
                ref={this.props.inline ? this.props.inline.innerRef : null}
            >
                {this.props.children ? this.props.children : ''}
            </li>
        );
    }
}

ListItem.propTypes = {
    style: PropTypes.object,
};
ListItem.defaultProps = {
    style: {},
};

export default connect () (ListItem);