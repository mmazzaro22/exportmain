import React from "react";
import PropTypes from "prop-types";
import { functor, hexToRGBA } from "react-stockcharts/lib/utils";

function Diamond(props) {
  const {
    className, stroke, strokeWidth,
    opacity, fill, point, width
  } = props;
  const w = functor(width)(point.datum);
  const x = point.x - (w / 2);
  const y = point.y - (w / 2);
  const rotate = `rotate(45 ${x + (w/2)} ${y + (w/2)})`
  return (
    <rect
      className={className}
      x={x}
      y={y}
      stroke={stroke}
      strokeWidth={strokeWidth}
      fillOpacity={opacity}
      fill={fill}
      width={w}
      height={w}
      transform= {rotate}
    />
  );
}
Diamond.propTypes = {
  stroke: PropTypes.string,
  fill: PropTypes.string.isRequired,
  opacity: PropTypes.number.isRequired,
  point: PropTypes.shape({
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    datum: PropTypes.object.isRequired,
  }).isRequired,
  className: PropTypes.string,
  strokeWidth: PropTypes.number,
  width: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.func
  ]).isRequired
};
Diamond.defaultProps = {
  stroke: "#4682B4",
  strokeWidth: 1,
  opacity: 0.5,
  fill: "#4682B4",
  className: "react-stockcharts-marker-diamond",
};

Diamond.drawOnCanvas = (props, point, ctx) => {
  const { stroke, fill, opacity, strokeWidth } = props;
  ctx.strokeStyle = stroke;
  ctx.lineWidth = strokeWidth;
  if (fill !== "none") {
    ctx.fillStyle = hexToRGBA(fill, opacity);
  }
  Diamond.drawOnCanvasWithNoStateChange(props, point, ctx);
};

Diamond.drawOnCanvasWithNoStateChange = (props, point, ctx) => {
  const { width } = props;
  const w = functor(width)(point.datum);
  const x = point.x - (w / 2);
  const y = point.y - (w / 2);
  ctx.beginPath();
  ctx.rect(x, y, w, w);
  ctx.stroke();
  ctx.fill();
};
export default Diamond;
