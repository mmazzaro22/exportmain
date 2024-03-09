import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import PropTypes from "prop-types";
import ReactTabs from '../react-tabs/Tabs';
import { onLoadTrigger } from "../../../../helpers";

class Tabs extends PureComponent { // eslint-disable-line react/prefer-stateless-function
    constructor(props) {
        super(props);
        this.state = {
            name: props.name
        }
    }

    componentWillMount() {
        const { actions, dispatch } = this.props;
        onLoadTrigger(actions, dispatch);
    }

    handleSelect = (index) => {
        const { dispatch, name } = this.props;
        if(name) {
            dispatch({
                type: "change_input",
                payload: {name: name, value: index}
            });
        } else {
            this.setState({ index:index })
        }
    }

    render() {
        const { style, children, className, store, name } = this.props;
        const { index } = this.state;

        let tabIndex;
        if(name) {
            tabIndex = (store && store[name] && Number.isInteger(store[name])) ? store[name] : 0;
        } else {
            tabIndex = index ? index : 0;
        }

        return (
            <ReactTabs 
                selectedIndex={tabIndex} 
                onSelect={this.handleSelect} 
                style={style} 
                className={className}
                {...this.props.inline}
            >
                {children}
            </ReactTabs>
        );
    }
}

Tabs.propTypes = {
    style: PropTypes.object,
};
Tabs.defaultProps = {
    style: {},
};
const mapStateToProps = function(state){
    return {
        store: state.reducer,
    }
}

export default connect (mapStateToProps, null) (Tabs);

