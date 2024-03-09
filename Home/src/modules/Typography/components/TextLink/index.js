import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {checkForOnClick, onClickTrigger, onLoadTrigger, prefixUrl} from "../../../helpers";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
//import { Link as ScrollLink } from 'react-scroll';

class TextLink extends PureComponent { // eslint-disable-line react/prefer-stateless-function
    componentWillMount() {
        const { actions, dispatch } = this.props;
        onLoadTrigger(actions, dispatch);
    }

    onClick = (e) => {
        const { actions, dispatch } = this.props;
        if(checkForOnClick(actions,dispatch)) {
            onClickTrigger(actions,dispatch);
        }
    }

    render() {
        let { href, style, type, className, isEdit, target, containerId, duration } = this.props;

        // Link for a single page app.
        if(type === 'spa') {
            return (
                <Link
                    className={className}
                    to={href ? href : "/"}
                    style={style}
                    {...this.props.inline}
                    ref={this.props.inline ? this.props.inline.innerRef : null}
                    onClick={this.onClick}
                >
                    {this.props.children}
                </Link>
            );
        } /*else if(type === 'pagesection') {
            return (
                <ScrollLink
                    containerId={containerId ? containerId : "body"}
                    className={className}
                    duration={duration}
                    to={href ? href : "/"}
                    style={style}
                    {...this.props.inline}
                    spy={true} 
                    smooth={true}
                    ref={this.props.inline ? this.props.inline.innerRef : null}
                    onClick={this.onClick}
                >

                    {this.props.children}
                </ScrollLink>
            );
        }*/

        // Format href.
        if(type === "email") {
            href = `mailto:${href}`;
        } else if(type === "phone") {
            href = `tel:${href}`
        }

       return (
            <a
                target={target}
                className={className}
                href={(type === 'pagesection') ? href : prefixUrl(href)}
                style={style}
                {...this.props.inline}
                ref={this.props.inline ? this.props.inline.innerRef : null}
                onClick={(e) => {
                    if(isEdit) {
                        e.preventDefault();
                    }
                    this.onClick(e);
                }}
            >
                {this.props.children}
            </a>
        );
    }
}

TextLink.propTypes = {
    style: PropTypes.object,
    href: PropTypes.string,
    type: PropTypes.string,
};
TextLink.defaultProps = {
    style: {},
    href: '#',
    type: 'external',
};
export default connect () (TextLink);
