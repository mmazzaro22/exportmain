import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from "react-redux";
import GoogleMapReact from 'google-map-react';
import '../../css/styles.css';

//import Geocode from "react-geocode";

import MapMarker from '../MapMarker';

// eslint-disable-next-line no-redeclare
class Map extends PureComponent { // eslint-disable-line react/prefer-stateless-function
    constructor(props) {
        super(props);
        this.state = {
            onDrag: false
        }
    }
    componentWillMount() {
        const { googleApiKey } = this.props;
        if(googleApiKey) {
            //Geocode.setApiKey(googleApiKey);
        }
    }

    handleApiLoaded = (map, maps) => {
        // use map and maps objects
    };

    handleChange = (name, val) => {
        const { dispatch, store } = this.props;

        dispatch({
            type: "change_input",
            payload: {name: name, value: val}
        });
    }

    render() {
        const {
            dispatch,
            style,
            centerLatitude,
            centerLongitude,
            zoom,
            googleApiKey,
            name,
            children,
            dataSet,
            dataSetLng,
            dataSetLat,
            dataSetTitle,
            dataSetDesc,
            store
        } = this.props;

        let markers = [];
        if (dataSet) {
            if(store[dataSet]) {
                store[dataSet].forEach((d,index) => {

                    if( (d[dataSetLat] && !isNaN(d[dataSetLat])) && (d[dataSetLng] && !isNaN(d[dataSetLng])) ) {
                        markers.push(
                            <MapMarker
                                key={index}
                                lat={d[dataSetLat]}
                                lng={d[dataSetLng]}
                                title={d[dataSetTitle]}
                                description={d[dataSetDesc]}
                            />
                        );
                    } else {
                        console.log("invalid..." + d[dataSetLat] + " " + d[dataSetLng])
                    }
                })
            }
        }

        return (
            <div style={{ height: '400px', width: '100%', ...style }}>
                <GoogleMapReact
                    onClick={(e) => {
                        if(name && name.length > 0) {
                            let currData = store[name] ? store[name] : {};
                            dispatch({
                                type: "change_input",
                                payload: {
                                    name: name,
                                    value: {
                                        ...currData,
                                        currentSelection: e,
                                    }
                                }
                            });
                        }
                    }}
                    bootstrapURLKeys={{ key: googleApiKey }}
                    center={{ lat: centerLatitude, lng: centerLongitude }}
                    defaultZoom={zoom}
                    yesIWantToUseGoogleMapApiInternals
                    onGoogleApiLoaded={({ map, maps }) => this.handleApiLoaded(map, maps)}
                    onChange={(e) => {
                        if(name && name.length > 0) {
                            let currData = store[name] ? store[name] : {};
                            dispatch({
                                type: "change_input",
                                payload: {
                                    name: name,
                                    value: {
                                        ...currData,
                                        currentBounds: e,
                                    }
                                }
                            });
                        }
                    }}
                >
                    {markers}
                    {children}
                </GoogleMapReact>
                {this.props.isEdit ?
                    <div
                        onDragStart={(e) => {
                            this.setState({onDrag: true})
                            this.props.inline.onDragStart(e);
                        }}
                        onDragEnd={(e) => {
                            this.setState({onDrag: false})
                            this.props.inline.onDragEnd(e);
                        }}
                        draggable={true}
                        style={{
                            position: 'absolute',
                            zIndex: 100,
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'transparent',
                            borderStyle: 'solid',
                            borderColor: this.state.onDrag ? 'blue' : 'transparent',
                            borderWidth: 1,
                        }}
                    />
                    : null}
            </div>
        );
    }
};

Map.propTypes = {
    style: PropTypes.object,
    centerLatitude: PropTypes.number,
    centerLongitude: PropTypes.number,
    zoom: PropTypes.number,
    googleApiKey: PropTypes.string,
};
Map.defaultProps = {
    style: {},
    centerLatitude: 37.0902,
    centerLongitude: -95.7129,
    zoom: 11,
    googleApiKey: '',
};

const mapStateToProps = function(state){
    return {
        store: state.reducer,
    }
}

export default connect(mapStateToProps, null) (Map);
