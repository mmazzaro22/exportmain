
import React from "react";
import PropTypes from "prop-types";
import { curveMonotoneX } from "d3-shape";
import {AreaSeries, BarSeries,LineSeries, ScatterSeries,
    TriangleMarker, SquareMarker, CircleMarker} from "react-stockcharts/lib/series";
import {createVerticalLinearGradient, hexToRGBA} from "react-stockcharts/lib/utils";

class DataSeries extends React.Component {
    render() {
        const {dataSetY, fill, type, marker} = this.props;
        switch (type) {
            case 'area':
                const canvasGradient = createVerticalLinearGradient([
                    { stop: 0, color: hexToRGBA('#000000', 0.2) },
                    { stop: 0.7, color: hexToRGBA('#000000', 0.4) },
                    { stop: 1, color: hexToRGBA('#000000', 0.8) },
                ]);
                const gradient = (
                <defs>
                    <linearGradient id="MyGradient" x1="0" y1="100%" x2="0" y2="0%">
                        <stop offset="0%" stopColor={fill} stopOpacity={0.2} />
                        <stop offset="70%" stopColor={fill} stopOpacity={0.4} />
                        <stop offset="100%"  stopColor={fill} stopOpacity={0.8} />
                    </linearGradient>
                </defs>);
                return (
                    <AreaSeries
                        yAccessor={d => d[dataSetY]}
                        fill={fill}
                        stroke={fill}
                        strokeOpacity={1}
                        strokeWidth={1}
                        interpolation={curveMonotoneX}
                        canvasGradient={canvasGradient}
                    />
                )
            case 'line':
                return (
                    <LineSeries
                        yAccessor={d => d[dataSetY]}
                        interpolation={curveMonotoneX}
                        stroke={fill} />
                )
            case 'scatter':
                let m = '';
                let m_prop = '';
                switch (marker) {
                    case 'square':
                        m = SquareMarker;
                        m_prop = { width: 8, stroke: fill, fill: fill };
                        break;
                    case 'triangle':
                        m = TriangleMarker;
                        m_prop = { width: 8, stroke: fill, fill: fill };
                        break;
                    default:
                        m = CircleMarker;
                        m_prop = { r: 3 };
                        break;
                }
                return (
                    <ScatterSeries
                        yAccessor={d => d[dataSetY]}
                        marker={m}
                        markerProps={m_prop} />
                )
            default:
                return (
                    <BarSeries yAccessor={d => d[dataSetY]} fill={fill} />
                );

        }

    }
}

DataSeries.propTypes = {
    type: PropTypes.string,
    dataSetY: PropTypes.string,
};

DataSeries.defaultProps = {
    dataSetY: "y",
    fill: "#000",
    type: "bar",
    marker: "circle"
};

export default DataSeries;
