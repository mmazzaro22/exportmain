/**
 *
 * Placeholder
 *
 */

import React, { PureComponent } from 'react';
import PropTypes from "prop-types";

const innerContainerStyle = {
	display: 'flex',
	justifyContent: 'center',
	alignItems: 'center',
	backgroundColor: '#fcecd7',
	borderRadius: '4px',
	width: '100%',
	padding: '2px',
};

class Placeholder extends PureComponent { // eslint-disable-line react/prefer-stateless-function

  render() {

      const { text } = this.props;
      return (
      <div style={{padding: '4px'}}>
        <div style={innerContainerStyle}>
          <div>
            <p style={{textAlign: 'center'}}>Placeholder</p>
            <p style={{textAlign: 'center'}}>
              <small>{text}</small>
            </p>
          </div>
        </div>
      </div>
      ); // eslint-disable-line
  }
}

Placeholder.propTypes = {
    text: PropTypes.string,
    onSelect: PropTypes.func,
};
Placeholder.defaultProps = {
    text: 'Replace with component',
};

export default Placeholder;
