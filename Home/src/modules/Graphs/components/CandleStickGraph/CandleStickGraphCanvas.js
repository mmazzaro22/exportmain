
import React from "react";
import PropTypes from "prop-types";
import { utcDay } from "d3-time";
import {scaleLinear, scaleLog, scalePoint, scalePow, scaleTime} from "d3-scale";
import { ChartCanvas, Chart } from "react-stockcharts";
import { CandlestickSeries } from "react-stockcharts/lib/series";
import { XAxis, YAxis } from "react-stockcharts/lib/axes";
import { fitDimensions, fitWidth } from "react-stockcharts/lib/helper";
import { last, timeIntervalBarWidth } from "react-stockcharts/lib/utils";

import {format} from "d3-format";
import CustomLabel from "../CustomLabel/CustomLabel";
import Label from "react-stockcharts/lib/annotation/Label";


class CandleStickGraphCanvas extends React.Component {
    render() {
        const { type, width, height, ratio,seriesName, data,
            dataSetX, dataSetHigh, dataSetLow, dataSetOpen, dataSetClose,
            wickStroke, fillPositive, fillNegative,xNumberScale} = this.props;

        if(!data || !data[0][dataSetX]
            || !data[0][dataSetOpen]
            || !data[0][dataSetClose]
            || !data[0][dataSetHigh]
            || !data[0][dataSetLow]) {
            return (<p>Invalid Graph Data Parameters</p>)
        }



        let actualWidth = parseInt(this.props.style.width) || width
        let actualHeight = parseInt(this.props.style.height) || height

 /*       if (data) {
            data.map((d) => {
                d.open = d[dataSetOpen];
                d.close = d[dataSetClose];
                d.high = d[dataSetHigh];
                d.low = d[dataSetLow];
                d.date = d[dataSetX];
            })
        }*/

        const fill = (d) => d[dataSetHigh] > d[dataSetLow] ? `${fillPositive}` : `${fillNegative}`;

        let updatedData = null
        //default Chart settings
        let xAccessor = d => d[dataSetX];
        let xExtents = list => list.map(d => d[dataSetX]);

        let xScale = null;
        // axis data type
        const typeX = typeof data[0][dataSetX];
        switch (typeX) {
            case 'object':
                xScale = scaleTime();
                updatedData = data.slice().sort((a, b) => a[dataSetX] - b[dataSetX]);
                xExtents = [
                    xAccessor(last(updatedData)),
                    xAccessor(updatedData[0])
                ];
                break;
            case 'number':
                xScale = scaleLinear();
                if (xNumberScale === 'log') {
                    xScale = scaleLog();
                } else if (xNumberScale === 'exponential') {
                    xScale = scalePow();
                }

                updatedData = data.slice().sort((a, b) => a[dataSetX] - b[dataSetX]);
                xExtents = [
                    xAccessor(last(updatedData)),
                    xAccessor(updatedData[0])
                ];
                break;
            case 'string':
                let isDate = true;
                for (let i = 0; i < data.length; i++) {
                    let dateString = new Date(data[i][dataSetX]).toString();
                    if (dateString === 'Invalid Date') {
                        isDate = false;
                        break;
                    }
                }
                if (isDate) {
                    xScale = scaleTime();
                    updatedData = [];
                    data.map((s) => {
                        s[dataSetX] = new Date(s[dataSetX]);
                    })
                    updatedData = data.slice().sort((a, b) => a[dataSetX] - b[dataSetX]);
                    xExtents = [
                        xAccessor(last(updatedData)),
                        xAccessor(updatedData[0])
                    ];
                } else {
                    xScale = scalePoint();
                }
                break;
            default:
                break;
        }

        function getTextSize(text, font) {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');

            context.font = font || getComputedStyle(document.body).font;

            return { width: context.measureText(text).width, height: parseInt(context.font) };
        }
        let yFont = this.props.yFontSize + 'px ' + this.props.yFontFamily

        let longestYText = data.reduce((a, b) => {
            return ('' + a[dataSetHigh]).length > ('' + b[dataSetHigh]).length ? a : b;
        })
        // TODO Determine if it's an integer since Y axis take whole number and decimal numbers will create excess margin
        let { width: yTextWidth, height: yTextHeight } = getTextSize(longestYText[dataSetHigh].toFixed(1), yFont)

        let xFont = this.props.xFontSize + 'px ' + this.props.xFontFamily
        let { width: xTextWidth, height: xTextHeight } = getTextSize(this.props.xAxisLabel ?? "A", xFont)

        const isXAxisBottom = this.props.xAxisAt === 'bottom'
        const isXOrientBottom = this.props.xOrient === 'bottom'

        const isYAxisRight = this.props.yAxisAt === 'right'
        const isYOrientRight = this.props.yOrient === 'right'

        let titleFont = this.props.chartTitleFontSize + 'px ' + this.props.chartTitleFontFamily
        let { width: chartTitleWidth, height: chartTitleHeight } = getTextSize(this.props.chartTitle ?? "A", titleFont)

        const chartTitleMargin = this.props.showChartTitle ? (isXOrientBottom ? 30 : chartTitleHeight) : 0

        const yAxisLabelHeight = this.props.yShowTickLabel ? yTextHeight : 0
        const yAxisLabelPadding = 8

        const xAxisLabelHeight = this.props.xShowTickLabel ? xTextHeight : 0
        const xAxisLabelPadding = 4
        const leftMargin = isYAxisRight ? 0 : (isYOrientRight ? yAxisLabelHeight + yAxisLabelPadding : yTextWidth + yAxisLabelHeight + yAxisLabelPadding * 2)
        const rightMargin = isYAxisRight ? (isYOrientRight ? yTextWidth + 5 + this.props.yTickPadding + yAxisLabelHeight : yAxisLabelHeight + yAxisLabelPadding) : 0
        const topMargin = isXAxisBottom ? 0 : isXOrientBottom ? (xAxisLabelHeight + xAxisLabelPadding + (this.props.showChartTitle ? xAxisLabelPadding : 0)) : xTextHeight + xAxisLabelHeight + this.props.xTickPadding + this.props.xInnerTickSize
        const bottomMargin = isXAxisBottom ? (isXOrientBottom ? xTextHeight + this.props.xTickPadding + this.props.xInnerTickSize + xAxisLabelHeight  : xAxisLabelHeight + xAxisLabelPadding) : yTextHeight

        const margin = { left: leftMargin, right: rightMargin, top: topMargin + chartTitleMargin, bottom: bottomMargin };

        const [yAxisLabelX, yAxisLabelY] = [
            isYAxisRight ? (actualWidth - 1) : (-margin.left + yAxisLabelHeight),
            (actualHeight - margin.top - margin.bottom) / 2
        ];

        const [xAxisLabelX, xAxisLabelY] = [
            (actualWidth - margin.left - margin.right) / 2,
            isXAxisBottom ? actualHeight - 1 - chartTitleMargin: -margin.top + xAxisLabelHeight + chartTitleMargin + (isXOrientBottom && this.props.showChartTitle ? xAxisLabelPadding : 0)
        ];

        const gridHeight = actualHeight - margin.top - margin.bottom;
        const gridWidth = actualWidth - margin.left - rightMargin;

        const showXGrid = this.props.xShowGrid;
        const showYGrid = this.props.yShowGrid;
        const yGrid = showYGrid ? { innerTickSize: -1 * gridWidth, tickStrokeOpacity: 0.2 } : {};
        const xGrid = showXGrid ? { innerTickSize: -1 * gridHeight, tickStrokeOpacity: 0.2 } : {};

        let titleX
        let titleTextAlign

        switch (this.props.alignChartTitle) {
            case 'start':
            case 'left':
                titleTextAlign = 'start'
                titleX = 20
                break
            case 'middle':
            case 'center':
                titleTextAlign = 'middle'
                titleX = (actualWidth - margin.left - margin.right) / 2
                break
            case 'end':
            case 'right':
                titleTextAlign = 'end'
                titleX = actualWidth - margin.right - margin.left
                break
            default:
                titleTextAlign = 'start'
                titleX = 20
        }

        const [chartTitleX, chartTitleY] = [
            titleX, isXAxisBottom ? 10 : (isXOrientBottom ? -chartTitleMargin + 5 : -chartTitleMargin - 15)
        ]

        return (
            <ChartCanvas ratio={ratio}
                         width={actualWidth}
                         height={actualHeight}
                         margin={margin}
                         type={type}
                         seriesName={seriesName}
                         data={updatedData === null ? data : updatedData}
                         xScale={xScale}
                         xAccessor={xAccessor}
                         xExtents={xExtents}
            >
                <Chart id={1} yExtents={d => [d[dataSetHigh], d[dataSetLow]]}>
                    {this.props.showChartTitle ?
                      <CustomLabel
                        x={chartTitleX}
                        y={chartTitleY}
                        fontSize={this.props.chartTitleFontSize}
                        fontFamily={this.props.chartTitleFontFamily}
                        text={this.props.chartTitle}
                        textAnchor={titleTextAlign}
                      />
                      : null}

                    <XAxis axisAt={this.props.xAxisAt} orient={this.props.xOrient}
                           showTicks={this.props.xShowTicks}
                           showTickLabel={this.props.xShowTickLabel}
                           showDomain={this.props.xShowDomain}
                           className={this.props.xClassName}
                           ticks={this.props.xTicks}
                           outerTickSize={this.props.xOuterTickSize}
                           fill={this.props.xFill}
                           stroke={this.props.xStroke}
                           strokeWidth={this.props.xStrokeWidth}
                           opacity={this.props.xOpacity}
                           innerTickSize={this.props.xInnerTickSize}
                           tickPadding={this.props.xTickPadding}
                           tickStroke={this.props.xTickStroke}
                           tickStrokeOpacity={this.props.xTickStrokeOpacity}
                           fontFamily={this.props.xFontFamily}
                           fontSize={this.props.xFontSize}
                           fontWeight={this.props.xFontWeight}
                           xZoomHeight={this.props.xZoomHeight}
                           tickLabelFill={this.props.xTickLabelColor}
                    />

                    {showXGrid ?
                      <XAxis
                        axisAt={this.props.xAxisAt} orient={this.props.xAxisAt}
                        showTicks={true}
                        showDomain={false}
                        className={this.props.xClassName}
                        ticks={this.props.xTicks}
                        stroke={this.props.xStroke}
                        strokeWidth={this.props.xStrokeWidth}
                        opacity={this.props.xOpacity}
                        innerTickSize={this.props.xInnerTickSize}
                        tickPadding={this.props.xTickPadding}
                        tickStroke={this.props.xTickStroke}
                        tickFormat={() => {
                            return ''
                        }}
                        xZoomHeight={this.props.xZoomHeight}
                        {...xGrid}
                      /> : null}

                    {this.props.xShowTickLabel ?
                      <CustomLabel
                        x={xAxisLabelX}
                        y={xAxisLabelY}
                        fontWeight={this.props.xFontWeight}
                        fontSize={this.props.xFontSize}
                        fontFamily={this.props.xFontFamily}
                        text={this.props.xAxisLabel}/>
                      : null}

                    <YAxis axisAt={this.props.yAxisAt} orient={this.props.yOrient}
                           showTicks={this.props.yShowTicks}
                           showTickLabel={this.props.yShowTickLabel}
                           showDomain={this.props.yShowDomain}
                           className={this.props.yClassName}
                           ticks={this.props.yTicks}
                           outerTickSize={this.props.yOuterTickSize}
                           fill={this.props.yFill}
                           stroke={this.props.yStroke}
                           strokeWidth={this.props.yStrokeWidth}
                           opacity={this.props.yOpacity}
                           innerTickSize={this.props.yInnerTickSize}
                           tickPadding={this.props.yTickPadding}
                           tickStroke={this.props.yTickStroke}
                           tickStrokeOpacity={this.props.yTickStrokeOpacity}
                           fontFamily={this.props.yFontFamily}
                           fontSize={this.props.yFontSize}
                           fontWeight={this.props.yFontWeight}
                           yZoomWidth={this.props.yZoomWidth}
                           tickLabelFill={this.props.yTickLabelColor}
                    />

                    {showYGrid ?
                      <YAxis axisAt={this.props.yAxisAt}
                             orient={this.props.yAxisAt}
                             showTicks={true}
                             className={this.props.yClassName}
                             showDomain={false}
                             ticks={this.props.yTicks}
                             fill={this.props.yFill}
                             stroke={this.props.yStroke}
                             strokeWidth={this.props.yStrokeWidth}
                             opacity={this.props.yOpacity}
                             innerTickSize={this.props.yInnerTickSize}
                             tickPadding={this.props.yTickPadding}
                             tickStroke={this.props.yTickStroke}
                             tickFormat={() => {
                                 return ''
                             }}
                             yZoomWidth={this.props.yZoomWidth}
                             tickLabelFill={this.props.yTickLabelColor}
                             {...yGrid}
                      /> : null}


                    {this.props.yShowTickLabel ?
                      <Label x={yAxisLabelX} y={yAxisLabelY}
                             rotate={-90}
                             fontFamily={this.props.yFontFamily}
                             fontSize={this.props.yFontSize}
                             text={this.props.yAxisLabel}/>
                      : null}
                    <CandlestickSeries width={timeIntervalBarWidth(utcDay)}
                                       fill={fill} wickStroke={wickStroke} />
                </Chart>
            </ChartCanvas>

        );
    }
}

CandleStickGraphCanvas.propTypes = {
    data: PropTypes.array.isRequired,
    width: PropTypes.number.isRequired,
    ratio: PropTypes.number.isRequired,
    type: PropTypes.oneOf(["svg", "hybrid"]).isRequired,
    fillPositive: PropTypes.string,
    fillNegative: PropTypes.string,
    dataSetX: PropTypes.string,
    dataSetOpen: PropTypes.string,
    dataSetClose: PropTypes.string,
    dataSetHigh: PropTypes.string,
    dataSetLow: PropTypes.string,
};

CandleStickGraphCanvas.defaultProps = {
    type: "svg",
    dataSetX: "date1",
    dataSetOpen: "open1",
    dataSetClose: "close1",
    dataSetHigh: "high1",
    dataSetLow: "low1",
    wickStroke: "#000",
    fillPositive: '#6BA583',
    fillNegative: '#FF0000',
    seriesName: "",

    showChartTitle: false,
    alignChartTitle: 'center',
    chartTitle: "Chart title here",
    chartTitleFontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
    chartTitleFontSize: 30,
    xAxisLabel: "XAxis Label here",
    xAxisAt: "bottom",
    xOrient: "bottom",
    xShowGrid: true,
    xShowTicks: true,
    xShowTickLabel: true,
    xShowDomain: true,
    xClassName: "react-stockcharts-x-axis",
    xTicks: 6,
    xOuterTickSize: 0,
    xFill: "none",
    xStroke: "#000000", // x axis stroke color
    xStrokeWidth: 1,
    xOpacity: 1, // x axis opacity
    xInnerTickSize: 5,
    xTickPadding: 6,
    xTickStroke: "#000000", // tick/grid stroke
    xTickStrokeOpacity: 1,
    xTickColor: 'black',
    xTickLabelColor: 'black',
    xFontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
    xFontSize: 12,
    xFontWeight: 400,
    xZoomHeight: 25,

    yAxisAt: "left",
    yOrient: "left",
    yShowGrid: true,
    yShowTicks: true,
    yShowTickLabel: true,
    yShowDomain: true,
    yAxisLabel: "YAxis Label here",
    yClassName: "react-stockcharts-y-axis",
    yTicks: 5,
    yOuterTickSize: 0,
    yFill: "none",
    yStroke: "#000000", // y axis stroke color
    yStrokeWidth: 1,
    yOpacity: 1, // y axis opacity
    yInnerTickSize: 5,
    yTickPadding: 6,
    yTickStroke: "#000000", // tick/grid stroke
    yTickStrokeOpacity: 1,
    yTickColor: 'black',
    yTickLabelColor: 'black',
    yFontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
    yFontSize: 12,
    yFontWeight: 400,
    yZoomWidth: 25,
};

CandleStickGraphCanvas = fitDimensions(CandleStickGraphCanvas);

export default CandleStickGraphCanvas;
