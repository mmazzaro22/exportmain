import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import '../../css/styles.css';

// InfoWindow component
const InfoWindow = (props) => {
    const { title, description } = props;
    const infoWindowStyle = {
        position: 'absolute',
        bottom: 30,
        left: '-45px',
        width: 220,
        backgroundColor: 'white',
        boxShadow: '0 2px 7px 1px rgba(0, 0, 0, 0.3)',
        padding: 10,
        fontSize: 14,
        zIndex: 100,
    };

    return (
        <div style={infoWindowStyle}>
            <div style={{ fontSize: 16 }}>
                {title}
            </div>
            <div style={{ fontSize: 14, color: 'grey' }}>
                {description}
            </div>
        </div>
    );
};

class MapMarker extends PureComponent { // eslint-disable-line react/prefer-stateless-function
    constructor(props) {
        super(props);
        this.state = {
            showInfoBox: false,
        };
    }
    toggleInfoBox = (event) => {
        this.setState({ showInfoBox: !this.state.showInfoBox });
    };

    render() {
        const { markerColor, title, description } = this.props;

        return (
            <div>
                <div
                    className="pin bounce"
                    style={{ backgroundColor: markerColor, cursor: 'pointer' }}
                    title={title}
                    onClick={() => this.toggleInfoBox()}
                />
                <div className="pulse" />
                {this.state.showInfoBox && <InfoWindow title={title} description={description} />}
            </div>
        );
    }
}

InfoWindow.propTypes = {
    title: PropTypes.string,
    description: PropTypes.string,
};

MapMarker.propTypes = {
    style: PropTypes.object,
    markerColor: PropTypes.string,
    id: PropTypes.string,
    lat: PropTypes.number,
    long: PropTypes.number,
    title: PropTypes.string,
    description: PropTypes.string,
};

MapMarker.defaultProps = {
    style: {},
    markerColor: 'blue',
    id: '',
    latitude: 37.0902,
    longitude: -95.7129,
    title: 'Title',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco',
};

export default MapMarker;
