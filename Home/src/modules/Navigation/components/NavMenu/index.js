import React, { PureComponent } from 'react';
import { connect } from "react-redux";
import PropTypes from 'prop-types';
import { checkForOnClick, onClickTrigger, onLoadTrigger } from "../../../helpers";
import classnames from "classnames";

import { NavContext } from '../NavBar/index.js';

const classMap = {
    left: 'left',
    right: 'right',
    down: 'down'
};

class NavMenu extends React.Component {
	componentWillMount() {
        const { actions, dispatch } = this.props;
        onLoadTrigger(actions, dispatch)
    }

    onClick = (e) => {
        const { actions, dispatch, name, value, toggleNavbar } = this.props;
        if(checkForOnClick(actions,dispatch)) {
            onClickTrigger(actions,dispatch);
        }
    }

     render() {
        const { style, id, className, children } = this.props;
        
        return (
            <NavContext.Consumer>
                {({open, type})  => {
                    return (
                    	<div style={style} className={classnames(className, 'df-nav-menu', {'open':open}, classMap[type])}>
            				{children}
                        </div>
                    );
                }}
             </NavContext.Consumer>
        );
    }
}

NavMenu.propTypes = {
    style: PropTypes.object,
};

NavMenu.defaultProps = {
    style: {},
};

export default connect () (NavMenu);