import React, { PureComponent } from 'react';
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { checkForOnClick, onClickTrigger, onLoadTrigger, prefixUrl, getTriggerEvents } from "../../../helpers";
import { Link } from "react-router-dom";
//import { Link as ScrollLink } from 'react-scroll';
//import ScrollableAnchor from 'react-scrollable-anchor'

const innerContainerStyle = {
	display: 'block',
	width: '100%',
	height: '100%',
};

class LinkBlock extends PureComponent { // eslint-disable-line react/prefer-stateless-function
	constructor(props) {
        super(props);
        const { actions, dispatch } = props;
        this.state = {
            events: getTriggerEvents(actions, dispatch),
        }
    }

	componentWillMount() {
		const { actions, dispatch } = this.props;
		onLoadTrigger(actions, dispatch)
	}

	componentDidUpdate(prevProps, prevState) {
        const { actions, dispatch } = this.props;
        if(actions !== prevProps.actions) {
            this.setState({events: getTriggerEvents(actions, dispatch)})
        }
    }

	getHref = () => {
		let { href, type } = this.props;
		if(href) {
			if(type === "email") {
				href = `mailto:${href}`;
			} else if(type === "phone") {
				href = `tel:${href}`
			}
		} else {
			href = "/";
		}

		return href;
	}

	onClick = (e) => {
        const { actions, dispatch } = this.props;
        if(checkForOnClick(actions,dispatch)) {
            onClickTrigger(actions,dispatch);
        }
    }

	render() {
		let { style, type, className, download, id, target, isEdit, containerId, duration } = this.props;
		const href = this.getHref();

		const { events } = this.state;

		// Link for a single page app.
		if(type === 'spa') {
			return (
				<Link
					{...events}
					className={className}
					to={href ? href : "/"}
					style={{display: 'block', ...style}}
					{...this.props.inline}
				>
					<div style={innerContainerStyle}>
						{this.props.children}
					</div>
				</Link>
			);
		} /*else if(type === 'pagesection') {
            return (
                <ScrollableAnchor
                    //containerId={containerId ? containerId : "body"}
                    className={className}
                    duration={duration}
                    id={href ? href : "/"}
                    style={style}
                    {...this.props.inline}
                    //spy={true}
                    //smooth={true}
                    ref={this.props.inline ? this.props.inline.innerRef : null}
                    onClick={this.onClick}
                >

                    {this.props.children}
                </ScrollableAnchor>
            );
        }*/

		// External web page link.
		return (
			<a
				download={download}
				target={target}
				id={id}
				className={className}
				href={(type === 'pagesection') ? href : prefixUrl(href)}
				{...events}
				onClick={(e) => {
					if(isEdit) {
						e.preventDefault();
					}
					this.onClick();
				}}
				style={{display: 'block', ...style}}
				{...this.props.inline}
			>
				<div style={innerContainerStyle}>
					{this.props.children}
				</div>
			</a>
		);
	}
}

LinkBlock.propTypes = {
	href: PropTypes.string,
	style: PropTypes.object,
	type: PropTypes.string,
};

LinkBlock.defaultProps = {
	href: '#',
	type: 'external',
	style: {},
};

export default connect () (LinkBlock);
