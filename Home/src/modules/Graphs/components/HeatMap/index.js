import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {connect} from "react-redux";
import {onLoadTrigger} from "../../../helpers";
import '../style.css';
import _ from "lodash";
import HeatMapCanvas from "./HeatMapCanvas";

class HeatMap extends Component { // eslint-disable-line react/prefer-stateless-function

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
    return <HeatMapCanvas
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


HeatMap.propTypes = {
  data: PropTypes.array,
};

HeatMap.defaultProps = {
  style: {},
  //TODO CHANGE FIXED DATA TO DYNAMIC DATA
  keys: [
    'hot dog',
    'burger',
    'sandwich',
    'kebab',
    'fries',
    'donut',
    'junk',
    'sushi',
    'ramen',
    'curry',
    'udon'
  ],
  defaultData: [
    {
      "country": "AD",
      "hot dog": 49,
      "hot dogColor": "hsl(203, 70%, 50%)",
      "burger": 41,
      "burgerColor": "hsl(170, 70%, 50%)",
      "sandwich": 37,
      "sandwichColor": "hsl(44, 70%, 50%)",
      "kebab": 30,
      "kebabColor": "hsl(331, 70%, 50%)",
      "fries": 41,
      "friesColor": "hsl(317, 70%, 50%)",
      "donut": 77,
      "donutColor": "hsl(119, 70%, 50%)",
      "junk": 13,
      "junkColor": "hsl(119, 70%, 50%)",
      "sushi": 10,
      "sushiColor": "hsl(102, 70%, 50%)",
      "ramen": 87,
      "ramenColor": "hsl(126, 70%, 50%)",
      "curry": 57,
      "curryColor": "hsl(106, 70%, 50%)",
      "udon": 19,
      "udonColor": "hsl(122, 70%, 50%)"
    },
    {
      "country": "AE",
      "hot dog": 69,
      "hot dogColor": "hsl(224, 70%, 50%)",
      "burger": 59,
      "burgerColor": "hsl(74, 70%, 50%)",
      "sandwich": 68,
      "sandwichColor": "hsl(170, 70%, 50%)",
      "kebab": 88,
      "kebabColor": "hsl(226, 70%, 50%)",
      "fries": 67,
      "friesColor": "hsl(313, 70%, 50%)",
      "donut": 30,
      "donutColor": "hsl(290, 70%, 50%)",
      "junk": 53,
      "junkColor": "hsl(75, 70%, 50%)",
      "sushi": 92,
      "sushiColor": "hsl(356, 70%, 50%)",
      "ramen": 57,
      "ramenColor": "hsl(266, 70%, 50%)",
      "curry": 3,
      "curryColor": "hsl(147, 70%, 50%)",
      "udon": 38,
      "udonColor": "hsl(277, 70%, 50%)"
    },
    {
      "country": "AF",
      "hot dog": 55,
      "hot dogColor": "hsl(325, 70%, 50%)",
      "burger": 94,
      "burgerColor": "hsl(297, 70%, 50%)",
      "sandwich": 73,
      "sandwichColor": "hsl(147, 70%, 50%)",
      "kebab": 16,
      "kebabColor": "hsl(337, 70%, 50%)",
      "fries": 97,
      "friesColor": "hsl(137, 70%, 50%)",
      "donut": 50,
      "donutColor": "hsl(96, 70%, 50%)",
      "junk": 37,
      "junkColor": "hsl(132, 70%, 50%)",
      "sushi": 4,
      "sushiColor": "hsl(37, 70%, 50%)",
      "ramen": 45,
      "ramenColor": "hsl(66, 70%, 50%)",
      "curry": 58,
      "curryColor": "hsl(200, 70%, 50%)",
      "udon": 93,
      "udonColor": "hsl(210, 70%, 50%)"
    },
    {
      "country": "AG",
      "hot dog": 63,
      "hot dogColor": "hsl(231, 70%, 50%)",
      "burger": 35,
      "burgerColor": "hsl(30, 70%, 50%)",
      "sandwich": 24,
      "sandwichColor": "hsl(229, 70%, 50%)",
      "kebab": 26,
      "kebabColor": "hsl(132, 70%, 50%)",
      "fries": 23,
      "friesColor": "hsl(100, 70%, 50%)",
      "donut": 41,
      "donutColor": "hsl(132, 70%, 50%)",
      "junk": 7,
      "junkColor": "hsl(37, 70%, 50%)",
      "sushi": 92,
      "sushiColor": "hsl(289, 70%, 50%)",
      "ramen": 19,
      "ramenColor": "hsl(6, 70%, 50%)",
      "curry": 42,
      "curryColor": "hsl(317, 70%, 50%)",
      "udon": 74,
      "udonColor": "hsl(344, 70%, 50%)"
    },
    {
      "country": "AI",
      "hot dog": 28,
      "hot dogColor": "hsl(98, 70%, 50%)",
      "burger": 2,
      "burgerColor": "hsl(183, 70%, 50%)",
      "sandwich": 34,
      "sandwichColor": "hsl(41, 70%, 50%)",
      "kebab": 8,
      "kebabColor": "hsl(279, 70%, 50%)",
      "fries": 19,
      "friesColor": "hsl(318, 70%, 50%)",
      "donut": 16,
      "donutColor": "hsl(81, 70%, 50%)",
      "junk": 39,
      "junkColor": "hsl(287, 70%, 50%)",
      "sushi": 65,
      "sushiColor": "hsl(144, 70%, 50%)",
      "ramen": 50,
      "ramenColor": "hsl(30, 70%, 50%)",
      "curry": 80,
      "curryColor": "hsl(318, 70%, 50%)",
      "udon": 4,
      "udonColor": "hsl(269, 70%, 50%)"
    },
    {
      "country": "AL",
      "hot dog": 62,
      "hot dogColor": "hsl(151, 70%, 50%)",
      "burger": 99,
      "burgerColor": "hsl(208, 70%, 50%)",
      "sandwich": 11,
      "sandwichColor": "hsl(3, 70%, 50%)",
      "kebab": 69,
      "kebabColor": "hsl(354, 70%, 50%)",
      "fries": 28,
      "friesColor": "hsl(201, 70%, 50%)",
      "donut": 21,
      "donutColor": "hsl(323, 70%, 50%)",
      "junk": 25,
      "junkColor": "hsl(346, 70%, 50%)",
      "sushi": 92,
      "sushiColor": "hsl(154, 70%, 50%)",
      "ramen": 52,
      "ramenColor": "hsl(181, 70%, 50%)",
      "curry": 43,
      "curryColor": "hsl(8, 70%, 50%)",
      "udon": 94,
      "udonColor": "hsl(261, 70%, 50%)"
    },
    {
      "country": "AM",
      "hot dog": 11,
      "hot dogColor": "hsl(357, 70%, 50%)",
      "burger": 86,
      "burgerColor": "hsl(108, 70%, 50%)",
      "sandwich": 52,
      "sandwichColor": "hsl(224, 70%, 50%)",
      "kebab": 68,
      "kebabColor": "hsl(275, 70%, 50%)",
      "fries": 30,
      "friesColor": "hsl(145, 70%, 50%)",
      "donut": 86,
      "donutColor": "hsl(236, 70%, 50%)",
      "junk": 53,
      "junkColor": "hsl(129, 70%, 50%)",
      "sushi": 41,
      "sushiColor": "hsl(186, 70%, 50%)",
      "ramen": 61,
      "ramenColor": "hsl(109, 70%, 50%)",
      "curry": 43,
      "curryColor": "hsl(34, 70%, 50%)",
      "udon": 83,
      "udonColor": "hsl(213, 70%, 50%)"
    },
    {
      "country": "AO",
      "hot dog": 60,
      "hot dogColor": "hsl(355, 70%, 50%)",
      "burger": 58,
      "burgerColor": "hsl(55, 70%, 50%)",
      "sandwich": 16,
      "sandwichColor": "hsl(63, 70%, 50%)",
      "kebab": 97,
      "kebabColor": "hsl(221, 70%, 50%)",
      "fries": 2,
      "friesColor": "hsl(332, 70%, 50%)",
      "donut": 70,
      "donutColor": "hsl(305, 70%, 50%)",
      "junk": 3,
      "junkColor": "hsl(244, 70%, 50%)",
      "sushi": 53,
      "sushiColor": "hsl(219, 70%, 50%)",
      "ramen": 10,
      "ramenColor": "hsl(25, 70%, 50%)",
      "curry": 6,
      "curryColor": "hsl(157, 70%, 50%)",
      "udon": 26,
      "udonColor": "hsl(175, 70%, 50%)"
    },
    {
      "country": "AQ",
      "hot dog": 0,
      "hot dogColor": "hsl(351, 70%, 50%)",
      "burger": 89,
      "burgerColor": "hsl(247, 70%, 50%)",
      "sandwich": 26,
      "sandwichColor": "hsl(253, 70%, 50%)",
      "kebab": 48,
      "kebabColor": "hsl(333, 70%, 50%)",
      "fries": 60,
      "friesColor": "hsl(129, 70%, 50%)",
      "donut": 71,
      "donutColor": "hsl(175, 70%, 50%)",
      "junk": 73,
      "junkColor": "hsl(134, 70%, 50%)",
      "sushi": 7,
      "sushiColor": "hsl(135, 70%, 50%)",
      "ramen": 8,
      "ramenColor": "hsl(229, 70%, 50%)",
      "curry": 20,
      "curryColor": "hsl(331, 70%, 50%)",
      "udon": 12,
      "udonColor": "hsl(143, 70%, 50%)"
    }
  ]
};

const mapStateToProps = function(state){
  return {
    store: state.reducer,
  }
}
export default connect (mapStateToProps, null) (HeatMap);

