import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {connect} from "react-redux";
import {onLoadTrigger} from "../../../helpers";
import AreaGraphCanvas from './AreaGraphCanvas.js';
import '../style.css';
import _ from "lodash";

class AreaGraph extends Component { // eslint-disable-line react/prefer-stateless-function

    constructor(props) {
        super(props);
        this.state = {
            value: '',
            redraw: false,
            graph: null
        };
    }

    componentWillMount() {
        const { actions, dispatch } = this.props;
        onLoadTrigger(actions, dispatch)
        this.setState({graph: this.returnGraph()})
        window.addEventListener('resize', this.handleResize)
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize)
    }

    shouldComponentUpdate(nextProps, nextState, nextContext) {
        const {redraw: nextRedraw} = nextState
        const {redraw } = this.state
        if (!redraw){
            this.setState({redraw: true, graph: null})
        }

        return (
          nextProps !== this.props ||
          nextState !== this.state
        );
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const {redraw: prevRedraw} = prevState
        const {redraw} = this.state
        if (!prevRedraw && redraw){
            this.setState({redraw: false, graph:this.returnGraph()})
        }
    }


    handleResize = ()=>{
        this.setState({redraw: true, graph: null})
        this.debounceRedraw()
    }

    handleRedraw = () =>{
        setTimeout(()=>{
            this.setState({redraw: false, graph: this.returnGraph()})
        })
    }
    debounceRedraw = _.debounce(this.handleRedraw, 100)


    returnGraph = () =>{
        const { style, store, dataSet,dataSetRadius, height, fill, dataSetX, dataSetY, defaultData } = this.props;
        let data = defaultData
        if (dataSet) {
            if (typeof dataSet === "string") {
                data = store[dataSet] ? store[dataSet] : defaultData
            } else {
                data = dataSet
            }
        }
        return <AreaGraphCanvas
          data={data}
          {...this.props}
        />
    }

    render() {
        const { style } = this.props;

        return (
            <div className="dittofi-graph-container dittofi-graph-container-canvas" {...this.props.inline} style={style}>
                {this.state.graph}
            </div>
        );
    }
}


AreaGraph.propTypes = {
    data: PropTypes.array,
    type: PropTypes.oneOf(["svg", "hybrid"]),
    fill: PropTypes.string
};

AreaGraph.defaultProps = {
    type: "svg",
    style: {},
    defaultData: [
        { "x": "2020-01-01T00:00:00+0000"	, "y": 20, "z": 100.11, "a": "a" },
        { "x": "2020-01-02T00:00:00+0000", "y": 31,"z": 200.22, "a": "b" },
        { "x": "2020-01-03T00:00:00+0000", "y": 22,"z": 300.44, "a": "c" },
        { "x": "2020-01-04T00:00:00+0000", "y": 14,"z": 400.66, "a": "d" },
        { "x": "2020-01-05T00:00:00+0000", "y": 21,"z": 500.77, "a": "e" },
        { "x": "2020-01-06T00:00:00+0000", "y": 31,"z": 600.66, "a": "f" },
        { "x": "2020-01-07T00:00:00+0000", "y": 13,"z": 700.55, "a": "g" },
        { "x": "2020-01-08T00:00:00+0000", "y": 17,"z": 800, "a": "h" },
        { "x": "2020-01-09T00:00:00+0000", "y": 33,"z": 900, "a": "i" },
        { "x": "2020-01-10T00:00:00+0000", "y": 25,"z": 1000, "a": "j" },
        { "x": "2020-01-11T00:00:00+0000", "y": 20,"z": 1100, "a": "k" },
        { "x": "2020-01-12T00:00:00+0000", "y": 31,"z": 1200, "a": "l" },
        { "x": "2020-01-13T00:00:00+0000", "y": 22,"z": 1300, "a": "m" },
        { "x": "2020-01-14T00:00:00+0000", "y": 14,"z": 1400, "a": "n" },
        { "x": "2020-01-15T00:00:00+0000", "y": 21,"z": 1500, "a": "o" },
        { "x": "2020-01-16T00:00:00+0000", "y": 31,"z": 1600, "a": "p" },
        { "x": "2020-01-17T00:00:00+0000", "y": 13, "z": 1700, "a": "q" },
        { "x": "2020-01-18T00:00:00+0000", "y": 17, "z": 1800, "a": "r" },
        { "x": "2020-01-19T00:00:00+0000", "y": 33, "z": 1900, "a": "s" },
        { "x": "2020-01-20T00:00:00+0000", "y": 25,"z": 2000, "a": "t" },
        { "x": "2020-01-21T00:00:00+0000", "y": 20,"z": 2100, "a": "u" },
        { "x": "2020-01-22T00:00:00+0000", "y": 31,"z": 2200, "a": "v" },
        { "x": "2020-01-23T00:00:00+0000", "y": 22,"z": 2300, "a": "w" },
        { "x": "2020-01-24T00:00:00+0000", "y": 14,"z": 2400, "a": "x" },
        { "x": "2020-01-25T00:00:00+0000", "y": 21,"z": 2500, "a": "y" },
        { "x": "2020-01-26T00:00:00+0000", "y": 31,"z": 2600, "a": "z" },
        { "x": "2020-01-27T00:00:00+0000", "y": 13,"z": 2700, "a": "aa" },
        { "x": "2020-01-28T00:00:00+0000", "y": 17,"z": 2800, "a": "ab" },
        { "x": "2020-01-29T00:00:00+0000", "y": 33,"z": 2900, "a": "ac" },
        { "x": "2020-01-30T00:00:00+0000", "y": 25,"z": 3000, "a": "ad"  }
    ],
    dataSet: "",
    dataSetX: "x",
    dataSetY: "y",
    fill: "#000",
    seriesName: "",
};

const mapStateToProps = function(state){
    return {
        store: state.reducer,
    }
}
export default connect (mapStateToProps, null) (AreaGraph);

