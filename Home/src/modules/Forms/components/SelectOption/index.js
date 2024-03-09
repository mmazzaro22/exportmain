import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

class SelectOption extends PureComponent { // eslint-disable-line react/prefer-stateless-function
    render() {
        const { style, options, value, label } = this.props;
        return (
            (<option style={{ ...style }} value={value}
                     {...this.props.inline}
            >{label}</option>)
        );
    }
}

SelectOption.propTypes = {
    style: PropTypes.object,
};
SelectOption.defaultProps = {
    style: {},
    value: 1,
    label: ""
};

export default SelectOption;
