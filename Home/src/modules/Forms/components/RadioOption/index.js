import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from "react-redux";

class RadioOption extends PureComponent { // eslint-disable-line react/prefer-stateless-function
    constructor(props) {
        super(props);
        this.state = {
            value: '',
        };
    }

    handleChange = (event) => {
        const { dispatch } = this.props;
        dispatch({
            type: "change_input",
            payload: {name: event.target.name, value: event.target.value}
        })
        this.setState({ value: event.target.value });
    }

    render() {
        const { style, value, label } = this.props;
        return (
            <div style={{ display: 'flex', flexDirection: 'row', ...style }}
                 {...this.props.inline}
            >
                <input name={this.props.name} type="radio"
                       onChange={this.handleChange} value={value}/>
                <label>{label}</label>
            </div>
        );
    }
}

RadioOption.propTypes = {
    style: PropTypes.object,
    name: PropTypes.string,
};
RadioOption.defaultProps = {
    style: {},
    name: '',
    value: 1,
    label: ""
};


const mapStateToProps = function(state){
    return {
        store: state.reducer,
    }
}

export default connect (mapStateToProps, null) (RadioOption);

