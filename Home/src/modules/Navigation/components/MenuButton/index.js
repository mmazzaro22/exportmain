import React, { PureComponent } from 'react';
import { connect } from "react-redux";
import PropTypes from 'prop-types';
import { checkForOnClick, onClickTrigger, onLoadTrigger } from "../../../helpers";
import classnames from "classnames";

import { NavContext } from '../NavBar/index.js';

class MenuButton extends React.Component {
	componentWillMount() {
        const { actions, dispatch } = this.props;
        onLoadTrigger(actions, dispatch)
    }

     render() {
        const { actions, dispatch, name, value, style, id, className, children } = this.props;
        
        return (
            <NavContext.Consumer>
                {({toggleNavbar})  => {
                    return (
                        <div
                            className={classnames(className, "df-nav-toggler")}
                            id={id}
                            onClick={(e) => {
                                if(checkForOnClick(actions,dispatch)) {
                                    onClickTrigger(actions,dispatch);
                                }

                                if(toggleNavbar) {
                                    toggleNavbar();
                                }
                            }}
                            style={style}
                        >
                            {children}
                    </div>
                )}}
             </NavContext.Consumer>
        );
    }
}

MenuButton.propTypes = {
    style: PropTypes.object,
};

MenuButton.defaultProps = {
    style: {},
};

MenuButton.displayName = "MenuButton"

export default connect () (MenuButton);