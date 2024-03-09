import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from "react-redux";
import { checkForOnClick, onClickTrigger, onLoadTrigger, baseUrl, options } from "../../../helpers";
import placeholder from './placeholder.svg';

import urljoin from 'url-join';

class Video extends PureComponent { // eslint-disable-line react/prefer-stateless-function
    componentWillMount() {
        const { actions, dispatch } = this.props;
        onLoadTrigger(actions, dispatch)
    }

    onClick = (e) => {
        const { actions, dispatch } = this.props;
        if(checkForOnClick(actions,dispatch)) {
            onClickTrigger(actions,dispatch);
        }
    }

    getSrc = () => {
        let { src } = this.props;

        if(typeof src !== "string") {
            return "";
        }

        if(src.includes("http")) {
            return src;
        }

        // Add base url.
        let publicPath = process.env.REACT_APP_PUBLIC_PATH ? process.env.REACT_APP_PUBLIC_PATH : "";
        src = urljoin(`${baseUrl()}`, publicPath, src);

        // Add option parameters.
        if(options && options.appId && options.workspaceId) {
            src = src + "/";
            src = src + "?" + new URLSearchParams({"X-App-Id":options.appId, "X-Workspace-Id":options.workspaceId}).toString();
        }

        return src;
    }

    render() {
        let { id, style, type, className, height, width, controls } = this.props;
        let src = this.getSrc();

        if(!src) {
            return (
                <img
                    className={className}
                    height={height}
                    id={id}
                    onClick={this.onClick}
                    style={{...style, width: style.width === 'auto' ? '' : style.width }}
                    src={placeholder}
                    width={width}
                    {...this.props.inline}
                />
            );
        }

        return (
            <video
                controls={controls === true}
                className={className}
                height={height}
                id={id}
                onClick={this.onClick}
                style={{...style, width: style.width === 'auto' ? '' : style.width }}
                src={src}
                width={width}
                {...this.props.inline}
            >
                <source src={src} type={type}/>
                Your browser does not support the video tag.
            </video>
        );
    }
}

Video.propTypes = {
    style: PropTypes.object,

};
Video.defaultProps = {
    style: {},

};

export default connect () (Video);
