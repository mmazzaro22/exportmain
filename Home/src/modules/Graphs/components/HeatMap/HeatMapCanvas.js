import React from "react";
import PropTypes from "prop-types";
import { fitDimensions } from "react-stockcharts/lib/helper";
import { HeatMap } from "@nivo/heatmap";

class HeatMapCanvas extends React.Component {
  render() {
    const { type, width, height, data, } = this.props;

    if (!data) {
      return (<p>Invalid Graph Data Parameters</p>)
    }

    let actualWidth = parseInt(this.props.style.width) || width
    let actualHeight = parseInt(this.props.style.height) || height

    function getTextSize(text, font) {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      context.font = font || getComputedStyle(document.body).font;

      return { width: context.measureText(text).width, height: parseInt(context.font) };
    }

    const axisFont = `${this.props.labelFontSize}px ${this.props.labelFontFamily}`;
    // eslint-disable-next-line no-confusing-arrow
    const longestYText = data.reduce((a, b) =>
      // TODO REPLACE WITH DATA TAG
      (`${a.country}`).length > (`${b.country}`).length ? a : b
    );

    const { width: yTextWidth, height: yTextHeight } = getTextSize(longestYText.country, axisFont);

    const longestXText = this.props.keys.reduce((a, b) =>
      // TODO REPLACE WITH DATA TAG
      (`${a}`).length > (`${b}`).length ? a : b
    );
    const { width: xTextWidth, height: xTextHeight } = getTextSize(longestXText, axisFont);
    const showXLabel = this.props.xShowTickLabel ? xTextHeight : 0;
    const showYLabel = this.props.yShowTickLabel ? yTextHeight : 0;
    const leftMargin = this.props.showAxisLeft ? yTextWidth + this.props.yTickPadding + this.props.yInnerTickSize + showYLabel : 0;
    const rightMargin = this.props.showAxisRight ? yTextWidth + this.props.yTickPadding + this.props.yInnerTickSize + showYLabel : 0;
    const topMargin = this.props.showAxisTop ? xTextWidth + this.props.xTickPadding + this.props.xInnerTickSize + showXLabel : 0;
    const bottomMargin = this.props.showAxisBottom ? xTextWidth + this.props.xTickPadding + this.props.xInnerTickSize + showXLabel : 0;;

    const margin = { left: leftMargin, right: rightMargin, top: topMargin, bottom: bottomMargin };

    const xAxisObject = {
      tickSize: this.props.xInnerTickSize,
      tickPadding: this.props.xTickPadding,
      tickRotation: 90,
      legend: this.props.xShowTickLabel ? 'food' : null,
      legendPosition: 'middle',
    };

    const yAxisObject = {
      tickSize: this.props.yInnerTickSize,
      tickPadding: this.props.yTickPadding,
      tickRotation: 0,
      legend: this.props.yShowTickLabel ? 'country' : null,
      legendPosition: 'middle',
    };

    return (
      <HeatMap
        data={data}
        width={actualWidth}
        height={actualHeight}
        theme={{
          labels: {
            text: {
              fill: this.props.labelFontColor,
              fontSize: this.props.labelFontSize,
              fontFamily: this.props.labelFontFamily,
              fontWeight: this.props.labelFontWeight,
              color: this.props.labelFontColor,
            }
          },
          axis: {
            ticks: {
              text: {
                fill: this.props.labelFontColor,
                fontSize: this.props.labelFontSize,
                fontFamily: this.props.labelFontFamily,
                fontWeight: this.props.labelFontWeight,
                color: this.props.labelFontColor,
              },
            },
            legend: {
              text: {
                fill: this.props.labelFontColor,
                fontSize: this.props.labelFontSize,
                fontFamily: this.props.labelFontFamily,
                fontWeight: this.props.labelFontWeight,
                color: this.props.labelFontColor,
              },
            },
          },
        }}
        keys={this.props.keys}
        margin={margin}
        indexBy={this.props.indexBy}
        forceSquare={this.props.forceSquare}
        sizeVariation={this.props.sizeVariation}
        axisTop={this.props.showAxisTop ? { ...xAxisObject, orient: 'top', legendOffset: (-topMargin + this.props.xTickPadding) } : null}
        axisRight={this.props.showAxisRight ? { ...yAxisObject, orient: 'right', legendOffset: (rightMargin - this.props.yTickPadding-2) } : null}
        axisBottom={this.props.showAxisBottom ? { ...xAxisObject, orient: 'bottom', legendOffset: (bottomMargin - this.props.xTickPadding-2) } : null}
        axisLeft={this.props.showAxisLeft ? { ...yAxisObject, orient: 'left', legendOffset: (-leftMargin + this.props.yTickPadding) } : null}
        animate={false}
        motionConfig="wobbly"
        motionStiffness={80}
        motionDamping={9}
        hoverTarget="cell" // cell,row,column,rowcolumn
        cellHoverOthersOpacity={0.25}
        enableGridX={this.props.enableGridX}
        enableGridY={this.props.enableGridY}
      />
    )
  }
}

HeatMapCanvas.propTypes = {
  data: PropTypes.array.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
};

HeatMapCanvas.defaultProps = {
  showAxisLeft: true,
  showAxisRight: false,
  showAxisTop: false,
  showAxisBottom: true,

  xTickPadding: 5,
  xInnerTickSize: 5,
  xShowTickLabel: true,

  yInnerTickSize: 5,
  yTickPadding: 5,
  yShowTickLabel: true,

  indexBy: "country",
  forceSquare: false,
  sizeVariation: 0,
  labelFontSize: 12,
  labelFontWeight: 700,
  labelFontColor: '#333333',
  labelFontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
  enableGridX: false,
  enableGridY: false,
  hoverTarget:"cell", // cell,row,column, rowcolumn
};

HeatMapCanvas = fitDimensions(HeatMapCanvas);

export default HeatMapCanvas;
