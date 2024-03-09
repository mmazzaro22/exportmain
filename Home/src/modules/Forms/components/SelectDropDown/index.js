import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from "react-redux";
import { onLoadTrigger, onChangeTrigger } from "../../../helpers";
import { isArray } from 'lodash';

class SelectDropDown extends PureComponent { // eslint-disable-line react/prefer-stateless-function

    constructor(props) {
        super(props);
        this.state = {
            value: props.initialValue ? props.initialValue : '',
        };
    }

    componentWillMount() {
        // Update store with initial values.
        const { value } = this.state;
        this.setValue(value, true);

        // Run onload triggers.
        const { actions, dispatch } = this.props;
        onLoadTrigger(actions, dispatch)
    }

    componentDidUpdate(prevProps, prevState) {
        if((this.props.initialValue !== prevProps.initialValue) && this.props.enableReinitialize) {
            this.setValue(this.props.initialValue, true);
        }
    }

    getValue = (value) => {
	console.log(isArray(value))
        const { type, multiple } = this.props;
        if(multiple && isArray(value)) {
            value = value.map((v) => {
                if(type === 'number' && !isNaN(Number(v))) {
                    return Number(v);
                } else if(type === 'boolean') {
                    return v && `${v.toLowerCase()}` === 'true';
                } else {
                    return v;
                }
            });
        } else {
            if(type === 'number' && !isNaN(Number(value))) {
                value = Number(value);
            } else if(type === 'boolean') {
                value = value && `${value.toLowerCase()}` === 'true';
            }
        }
        
	console.log(value)
        return value;
    }

    setValue = async (value, onLoad) => {
        value = this.getValue(value);

        const { dispatch, name, actions } = this.props;
        console.log(name)
	console.log(value)
	if(name && name.length > 0) {
            await dispatch({
                type: "change_input",
                payload: {name: name, value: value}
            });
        }

        if(!onLoad) {
            onChangeTrigger(actions, dispatch);
        }
        

        this.setState({ value: value });
    }

    handleChange = (event) => {
        if(this.props.multiple) {
            let value = [];
            for(var i = 0; i < event.target.selectedOptions.length; ++i) {
                value.push(event.target.selectedOptions[i].value);
            }
	    console.log(value)
            this.setValue(value);
        } else {
            this.setValue(event.target.value);
        }
    }

    render() {
        const { style, options, store, dataSet, dataSetValue, dataSetLabel, className, multiple } = this.props;
        let selectOptions = options ? [...options] : [];
        
	if (dataSet) {
            if(isArray(dataSet)) {
                dataSet.forEach((d) => {
                    let input = {
                        value: d[dataSetValue],
                        label: d[dataSetLabel]
                    }
                    selectOptions.push(input)
                });
            } else if(store[dataSet] && isArray(store[dataSet])) {
                store[dataSet].forEach((d) => {
                    let input = {
                        value: d[dataSetValue],
                        label: d[dataSetLabel]
                    }
                    selectOptions.push(input)
                });
            }
        }
        return (
            <select
                className={className}
                style={{ ...style }}
                name={this.props.name}
                multiple={multiple}
                required={this.props.isRequired}
                value={this.state.value}
                onChange={this.handleChange}
                {...this.props.inline}
            >
                {/* Map through data from options properties*/}
                {selectOptions.map((item, index) =>
                    (<option key={index} value={item.value}>{item.label}</option>)
                )}

                {/* Display Child components*/}
                {this.props.children}
            </select>
        );
    }
}

SelectDropDown.propTypes = {
    style: PropTypes.object,
    isRequired: PropTypes.bool,
    name: PropTypes.string,
    options: PropTypes.array,
};
SelectDropDown.defaultProps = {
    style: {},
    isRequired: false,
    name: '',
    options: [],
    dataSet: "",
    dataSetValue: "id",
    dataSetLabel: "name"
};

const mapStateToProps = function(state){
    return {
        store: state.reducer,
    }
}

export default connect (mapStateToProps, null) ( SelectDropDown );
