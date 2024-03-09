import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

const submitStyle = {
    paddingTop: 9,
    paddingBottom: 9,
    paddingRight: 15,
    paddingLeft: 15,
    width: 'fit-content',
};

class SubmitButton extends PureComponent { // eslint-disable-line react/prefer-stateless-function

    render() {
        const { style } = this.props;
        return (
            <input style={{ ...submitStyle, ...style }} type="submit" value={this.props.children} {...this.props.inline}/>
        );
    }
}

SubmitButton.propTypes = {
    style: PropTypes.object,

};
SubmitButton.defaultProps = {
    style: {},
};

export default SubmitButton;
