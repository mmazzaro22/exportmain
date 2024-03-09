
import React from "react";
import PropTypes from "prop-types";
import { fitDimensions } from "react-stockcharts/lib/helper";
import { Pie } from "@nivo/pie";


class PieGraphCanvas extends React.Component {
  render() {
    const { type, width, height, data, } = this.props;

    if(!data) {
      return (<p>Invalid Graph Data Parameters</p>)
    }

    console.log('piegraph canvas Width', width)
    console.log('piegraph canvas height', height)

    let actualWidth = parseInt(this.props.style.width) || width
    let actualHeight = parseInt(this.props.style.height) || height

    return (<Pie
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
          }

        }}

        innerRadius={this.props.innerRadius}
        padAngle={this.props.padAngle}
        cornerRadius={this.props.cornerRadius}
        colors={{ scheme: this.props.colors }}
        // borderWidth={1}
        // borderColor={{ from: 'color', modifiers: [ [ 'darker', 0.2 ] ] }}
        enableRadialLabels={false}
        // radialLabelsSkipAngle={10}
        // radialLabelsTextColor="#333333"
        // radialLabelsLinkColor={{ from: 'color' }}
        enableSliceLabels={true}
        sliceLabelsRadiusOffset={this.props.sliceLabelsRadiusOffset}
        sliceLabelsSkipAngle={this.props.sliceLabelSkipLabel}
        sliceLabel={function(e){return e.label+" ("+e.value+")"}}
      />
    );
  }
}

PieGraphCanvas.propTypes = {
  data: PropTypes.array.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
};

PieGraphCanvas.defaultProps = {
  innerRadius: 0.5,
  padAngle: 0.7,
  cornerRadius: 3,
  colors: 'nivo',
  sliceLabelsRadiusOffset: 0.5,
  sliceLabelSkipLabel: 10,
  labelFontSize: 12,
  labelFontWeight: 700,
  labelFontColor: '#333333',
  labelFontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
};

PieGraphCanvas = fitDimensions(PieGraphCanvas);

export default PieGraphCanvas;
