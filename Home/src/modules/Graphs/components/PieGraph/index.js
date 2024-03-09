import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {connect} from "react-redux";
import {onLoadTrigger} from "../../../helpers";
import '../style.css';
import _ from "lodash";
import { ResponsivePie } from "@nivo/pie";
import PieGraphCanvas from "./PieGraphCanvas";
import AreaGraphCanvas from "../AreaGraph/AreaGraphCanvas";

class PieGraph extends Component { // eslint-disable-line react/prefer-stateless-function

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
    const { store, dataSet, defaultData} = this.props;
    let data = defaultData
    if (dataSet) {
      if (typeof dataSet === "string") {
        data = store[dataSet] ? store[dataSet] : defaultData
      } else {
        data = dataSet
      }
    }

    return <PieGraphCanvas
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


PieGraph.propTypes = {
  data: PropTypes.array,
};

PieGraph.defaultProps = {
  style:{},
  defaultData: [
    {
      "id": "item1",
      "label": "Item 1",
      "value": 435,
      "color": "hsl(190, 70%, 50%)"
    },
    {
      "id": "item2",
      "label": "item 2",
      "value": 476,
      "color": "hsl(42, 70%, 50%)"
    },
    {
      "id": "item3",
      "label": "Item 3",
      "value": 507,
      "color": "hsl(245, 70%, 50%)"
    },
    {
      "id": "item4",
      "label": "Item 4",
      "value": 170,
      "color": "hsl(153, 70%, 50%)"
    },
    {
      "id": "item5",
      "label": "Item 5",
      "value": 423,
      "color": "hsl(196, 70%, 50%)"
    }
  ],
};

const mapStateToProps = function(state){
  return {
    store: state.reducer,
  }
}
export default connect (mapStateToProps, null) (PieGraph);

