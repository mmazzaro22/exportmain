import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from "react-redux";
import { onLoadTrigger, getTriggerEvents } from "../../../helpers";

class FormBlock extends PureComponent { // eslint-disable-line react/prefer-stateless-function

    constructor(props) {
        super(props);
        const { actions, dispatch } = props;
        this.state = {
            events: getTriggerEvents(actions, dispatch)
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
        const { style, store, className } = this.props;
        const { events } = this.state;
        return (
            <form
                className={className}
                style={style}
                onSubmit={(e) => e.preventDefault()}
                {...events}
                {...this.props.inline}
            >
                {this.props.children}
            </form>
        );
    }
}

FormBlock.propTypes = {
    style: PropTypes.object,
};
FormBlock.defaultProps = {
    style: {},
};

const mapStateToProps = function(state){
    return {
        store: state.reducer,
    }
}

export default connect (mapStateToProps, null) (FormBlock);
