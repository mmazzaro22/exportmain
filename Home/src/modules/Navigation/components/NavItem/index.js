import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';

class NavItem extends PureComponent { // eslint-disable-line react/prefer-stateless-function

    render() {
        const { style, id, className } = this.props;
        return (
            // eslint-disable-next-line react/prop-types,jsx-a11y/no-static-element-interactions
            <li style={style} id={id} className={className} 
                {...this.props.inline}
            >
                <Link to={this.props.href} href={this.props.href}>{this.props.children}</Link>
            </li>
        );
    }
}

NavItem.propTypes = {
    style: PropTypes.object,
    href: PropTypes.string,
};
NavItem.defaultProps = {
    style: {},
    href: '#',
};

export default NavItem;
