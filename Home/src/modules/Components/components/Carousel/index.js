import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
//import '../css/styles.css';
import {checkForOnClick, onClickTrigger, onLoadTrigger} from "../../../helpers";
import {connect} from "react-redux";

class Carousel extends PureComponent { // eslint-disable-line react/prefer-stateless-function

    componentWillMount() {
        const { actions, dispatch } = this.props;
        onLoadTrigger(actions, dispatch)
    }

    render() {
        const { actions, style, dispatch } = this.props;
        const settings = {
            dots: true,
        };
        return (
            <div style={{ width: '100%', maxHeight: '100vh', ...style }} onClick={checkForOnClick(actions,dispatch) ?
                () => onClickTrigger(actions,dispatch) : null}>
                <Slider {...settings}>
                    {this.props.children}
                </Slider>
            </div>
        ); // eslint-disable-line
    }
}

Carousel.propTypes = {
    style: PropTypes.object,
};
Carousel.defaultProps = {
    style: {},
};

export default connect () (Carousel);
