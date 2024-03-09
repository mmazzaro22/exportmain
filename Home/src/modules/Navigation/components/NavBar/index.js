import React, { PureComponent, Children, cloneElement } from 'react';
import { connect } from "react-redux";
import PropTypes from 'prop-types';
import { checkForOnClick, onClickTrigger, onLoadTrigger, getTypeName } from "../../../helpers";
import classnames from "classnames";

import '../../css/styles.css';

export const NavContext = React.createContext('nav');

const classMap = {
    xs: 'df-nav-bar',
    sm: 'df-nav-bar-sm',
    md: 'df-nav-bar-md',
    lg: 'df-nav-bar-lg',
    xl: 'df-nav-bar-xl'
};

class NavBar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false,
        }
    }

    componentWillMount() {
        const { actions, dispatch } = this.props;
        onLoadTrigger(actions, dispatch)
    }

    onClick = (e) => {
        const { actions, dispatch, name, value } = this.props;
        if(checkForOnClick(actions,dispatch)) {
            onClickTrigger(actions,dispatch);
        }
    }

    toggleNavbar = () => {
        const { open } = this.state;
        this.setState({open: !open})
    }

    isOpen = () => {
        const { forceOpen, isEdit } = this.props;
        const { open } = this.state;
        return (open && !isEdit) || (forceOpen && isEdit);
    }

    render() {
        const { style, id, className, breakPoint, type, isEdit } = this.props;
        const open = this.isOpen();
        
        return (
            <NavContext.Provider 
                value={{
                    open:open, 
                    type:type,
                    toggleNavbar: this.toggleNavbar
                }}
            >   
                {(open && !isEdit) && <div onClick={this.toggleNavbar} className="df-nav-overlay"></div>}
                <nav
                    className={classnames(className, classMap[breakPoint], 'df-nav-bar', )}
                    id={id}
                    onClick={this.onClick}
                    style={style}
                >
                    {this.props.children}
                </nav>
            </NavContext.Provider>
        );
    }
}

NavBar.propTypes = {
    style: PropTypes.object,
};

NavBar.defaultProps = {
    style: {},
};

export default connect () (NavBar);
