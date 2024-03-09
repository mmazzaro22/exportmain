import React, { PureComponent } from 'react';
import { connect } from "react-redux";
import * as d3 from "d3";
import * as topojson from "topojson-client";
import { queue } from "d3-queue";
import '../../css/styles.css';

import { checkForOnClick, onClickTrigger } from "../../../helpers";

class UkConstituencyMap extends PureComponent {
	componentDidMount() {
		const { name, dispatch, actions } = this.props;

		// map viewport dimensions
		var width = 460,
			height = 650;

		// set up map projection, and position it.
		var projection = d3.geo.albers()
			.center([1.5, 55.2])
			.rotate([4.4, 0])
			.parallels([50, 50])
			.scale(3300)
			.translate([width / 2, height / 2]);
		var path = d3.geo.path().projection(projection);

		// add d3 zoom behaviour to map container.
		var zoom = d3.behavior.zoom()
			.scaleExtent([1, 10])
			.on("zoom", zoomed);

		// set up SVG, viewport and clipping mask for map
		var svg = d3.select('#electionMap')
			.append('svg:svg')
			.attr('width', width)
			.attr('height', height)
			.attr('viewBox', '0 0 ' + width + ' ' + height)
			.attr('perserveAspectRatio', 'xMinYMid')
			.attr('id', "sizer-map")
			.attr('class', "sizer")
			.call(zoom);
		var main = svg.append("g")
			.attr('transform', 'translate(0,0)')
			.attr('width', width)
			.attr('height', height)
			.attr('class', 'main');
		var rect = svg.append("rect")
			.attr("width", width)
			.attr("height", height)
			.attr("class", "overlay")
			.style("fill", "none")
			.style("pointer-events", "all");
		var mapContainer = svg.append("g");

		// use queue function to load map and results data asynchronously, then call ready function when done.
		queue()
			.defer(d3.json, "https://s3-us-west-2.amazonaws.com/s.cdpn.io/535422/map.json")
			.defer(d3.json, "https://s3-us-west-2.amazonaws.com/s.cdpn.io/535422/election-data.json")
			.await(ready);

			var uk, mapFeatures, boundaries, constituency;

		function ready(error, uk, boundaries) {
			mapFeatures = topojson.feature(uk, uk.objects.subunits).features;
			var map = mapContainer.append("g").attr("class", "subunits").selectAll("path").data(mapFeatures);
			var constituency = boundaries.data;

			map.enter()
				.append("path")
				.attr("class", function(d, i) {
					var badge = "f0";
					if (typeof constituency[d.properties.id - 1] === "undefined") {
						badge = "f0";
					} else {
						if (constituency[d.properties.id - 1].id === "108") {
							badge = "f8";
						} else {
							badge = "f" + constituency[d.properties.id - 1].colour;
						}
					}
					return "ward ward-" + d.properties.id + " " + badge;
				})
				.attr("d", path);

			map.on("click", function(d, i) {
				if(name && name.length > 0) {
					dispatch({
						type: "change_input",
            			payload: {name: name, value: d.properties.name}
					});

					if(checkForOnClick(actions,dispatch)) {
						onClickTrigger(actions,dispatch);
					}
				}
			});
		}

		function zoomed() {
			var t = d3.event.translate,
			s = d3.event.scale;
			t[0] = Math.min(width / 2 * (s - 1), Math.max(width / 2 * (1 - s) - 150 * s, t[0]));
			t[1] = Math.min(height / 2 * (s - 1) + 230 * s, Math.max(height / 2 * (1 - s) - 230 * s, t[1]));
			zoom.translate(t);
			mapContainer.style("stroke-width", 1 / s).attr("transform", "translate(" + t + ")scale(" + s + ")");
		}
	}

	render() {
		return (
			<div id="electionMap"></div>
		);
	}
}

Map.propTypes = {

};

Map.defaultProps = {

};

const mapStateToProps = function(state){
    return {
        store: state.reducer,
    }
}

export default connect(mapStateToProps, null) (UkConstituencyMap);
