import React, { Children, cloneElement, Fragment, isValidElement, PureComponent, useEffect, useRef, useState } from "react";
import ReactDOM from 'react-dom';
import { connect } from "react-redux";
import { Link, useLocation, useParams, useHistory } from "react-router-dom";
import { get } from 'lodash';
import { Area, Bar, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

function deepMap(children, deepMapFn) {
	return Children.toArray(children).map((child, index, mapChildren) => {
		if (isValidElement(child) && hasComplexChildren(child)) {
			return deepMapFn(
				cloneElement(child, {
					...child.props,
					children: deepMap(child.props.children, deepMapFn),
				})
			);
		}
		return deepMapFn(child, index, mapChildren);
	});
}

function hasChildren(element) {
    return isValidElement(element) && element.props.children;
}

function hasComplexChildren(element) {
	return isValidElement(element) && hasChildren(element)
		&& Children.toArray(element.props.children).reduce((res, child) => res || isValidElement(child), false);
}

const Chart = (props) => {
    const { children, className, data, minHeight } = props;
    return (
        <div className={className}>
            <ResponsiveContainer minHeight={minHeight} width="100%" height="100%">
                <ComposedChart data={data}>
                    {children}
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
}

const d3 = "https://d3js.org/d3.v7.min.js";

const PieChart = ({
	data = [],
	marginTop = 20, // the top margin, in pixels
	marginRight = 0, // the right margin, in pixels
	marginBottom = 30, // the bottom margin, in pixels
	marginLeft = 40, // the left margin, in pixels
	xAccessor = "x",
	yAccessor = "y",
	xPadding = 0.1, // amount of x-range to reserve to separate bars
	innerRadius = 0,  // inner radius of pie, in pixels (non-zero for donut)
	stroke = "none",
	strokeWidth = 1, // width of stroke separating wedges
	strokeLinejoin = "round", // line join of stroke separating wedges
	colors, // optional array of colors
	color,
	colorAccessor
}) => {
	const d3Ref = useRef();
	const svgRef = React.useRef(null);

	const [width, setWidth] = useState(10);
	const [height, setHeight] = useState(10);

	var chartIsMounted = () => {
  		return svgRef && svgRef.current && d3Ref && d3Ref.current;
  	}

  	var plotChart = () => {
  		if(!chartIsMounted()) return;
  		const d3 = d3Ref.current;
  		const svg = d3.select(svgRef.current);

  		svg.attr("viewBox", [-width / 2, -height / 2, width, height]);

  		// Compute values.
  		const N = d3.map(data, (d) => d[xAccessor]);
  		const V = d3.map(data, (d) => d[yAccessor]);
  		const I = d3.range(N.length).filter(i => !isNaN(V[i]));

  		// Unique the names.
  		const names = new d3.InternSet(N);

  		// Chose a default color scheme based on cardinality.
  		if(!colors || !Array.isArray(colors)) {
  			colors = d3.schemeSpectral[names.size];
  		} else if(colorAccessor) {
  			colors = colors.map((c) =>  c[colorAccessor]);
  		}

  		// Construct scales.
  		if(!color) color = d3.scaleOrdinal(names, colors);

  		// Compute radius.
  		const outerRadius = Math.min(width, height) / 2; // outer radius of pie, in pixels
  		const labelRadius = (innerRadius * 0.2 + outerRadius * 0.8); // center radius of labels
  		const padAngle = stroke === "none" ? 1 / outerRadius : 0; // angular separation between wedges

  		// Construct arcs.
  		const arcs = d3.pie().padAngle(padAngle).sort(null).value(i => V[i])(I);
  		const arc = d3.arc().innerRadius(innerRadius).outerRadius(outerRadius);
  		const arcLabel = d3.arc().innerRadius(labelRadius).outerRadius(labelRadius);

  		svg.select(".pie-arcs")
  		    .attr("stroke", stroke)
  		    .attr("stroke-width", strokeWidth)
  		    .attr("stroke-linejoin", strokeLinejoin)
  		  .selectAll("path")
  		  .data(arcs)
  		  .join("path")
  		    .attr("fill", d => color(N[d.data]))
  		    .attr("d", arc);
  	}

	var setDimensions = () => {
  		if(!chartIsMounted()) return;
		var clientRect = svgRef.current.getBoundingClientRect();
		setWidth(clientRect.width);
		setHeight(clientRect.height);
  	}

	useEffect(() => {
		var initD3 = function () {
			d3Ref.current = window.d3;
			d3Ref.current.select(window).on("resize", () => setDimensions());
			setDimensions();
		};

		window.loadSources([d3], initD3, "text/javascript");
	}, []);

	useEffect(() => {
		plotChart();
	}, [height, width, data]);

	return (
		<svg 
			ref={svgRef} 
			height="100%"
			width="100%"
		>
			<g className="pie-arcs" />
		</svg>
	);
}

const EditorJSCore = "https://cdn.jsdelivr.net/npm/@editorjs/editorjs@latest";

const EditorJSTools = {
	"Header": "https://cdn.jsdelivr.net/npm/@editorjs/header@latest",
	"SimpleImage": "https://cdn.jsdelivr.net/npm/@editorjs/simple-image@latest",
	"List": "https://cdn.jsdelivr.net/npm/@editorjs/list@latest",
	"RawTool": "https://cdn.jsdelivr.net/npm/@editorjs/raw",
	"Underline": "https://cdn.jsdelivr.net/npm/@editorjs/underline@latest"
}

const RichTextEditor = (props) => {
	const { className, data, name, onChange, readOnly, value } = props;
	
	const elementRef = useRef();
	const editorRef = useRef();
	const prevTimeRef = useRef();
	
	useEffect(() => {
		var initEditor = function () {
			var EditorJS = window.EditorJS;
			console.log(EditorJS)
			if(EditorJS) {
				// Build list of tools.
				const tools = {};
				Object.keys(EditorJSTools).forEach((tool) => tools[tool] = window[tool]);

				// Init editor.
				editorRef.current = new EditorJS({
					holder: elementRef.current,
					data: value,
					onChange: async (api, event) => {
						const savedData = await editorRef.current.save();
						prevTimeRef.current = savedData.time;
						onChange && onChange({target: { value: savedData, name } })
	   				},
	   				tools
				});
			}
		};

		window.loadSources([EditorJSCore, ...Object.keys(EditorJSTools).map((k) => EditorJSTools[k])], initEditor, "text/javascript");
	}, []);

	useEffect(() => {
		if(editorRef && editorRef.current && editorRef.current.render && value) {
			if(prevTimeRef.current !== value.time) {
				prevTimeRef.current = value.time;
				editorRef.current.render(value);
			}
		}
	}, [value]);

	
	return (
		<div
			className={className}
			ref={elementRef}
		/>
	);
}

const RichText = (props) => {
	const { className, data, onChange, readOnly } = props;
	if(readOnly !== "true") {
		return (
			<RichTextEditor {...props} />
		);
	}

	return (
		<div>
			{(data && Array.isArray(data.blocks)) && data.blocks.map((b, i) => {
				if(b.type) {
					switch(b.type.toLowerCase()) {
						case "header": {
							let content;
							switch(b?.data?.level) {
								case 1: 
									content = ( <h1 key={i} dangerouslySetInnerHTML={{ __html: b?.data?.text }} /> );
									break;
								case 2: 
									content = ( <h2 key={i} dangerouslySetInnerHTML={{ __html: b?.data?.text }} /> );
									break;
								case 3: 
									content = ( <h3 key={i} dangerouslySetInnerHTML={{ __html: b?.data?.text }} /> );
									break;
								case 4: 
									content = ( <h4 key={i} dangerouslySetInnerHTML={{ __html: b?.data?.text }} /> );
									break;
								case 5: 
									content = ( <h5 key={i} dangerouslySetInnerHTML={{ __html: b?.data?.text }} /> );
									break;
								case 6: 
									content = ( <h5 key={i} dangerouslySetInnerHTML={{ __html: b?.data?.text }} /> );
									break;
								default: 
									content = ( <p key={i} dangerouslySetInnerHTML={{ __html: b?.data?.text }} /> );
							}

							return content;
						}
						case "list": {
							let content;
							if(!Array.isArray(b?.data?.items)) {
								content = ( <p>Failed to parse list without items</p> );
							} else {
								switch (b?.data?.style) {
									case 'ordered': {
										content = (
											<ol key={i}>
												{b?.data?.items.map((li, idx) => {
													return (
														<li key={idx} dangerouslySetInnerHTML={{ __html: li }} />
													);
												})}
											</ol>
										);
										break;
									}
									default: {
										content = (
											<li key={i}>
												{b?.data?.items.map((li, idx) => {
													return (
														<li key={idx} dangerouslySetInnerHTML={{ __html: li }} />
													);
												})}
											</li>
										);
									}
								}
							}

							return content;
						}
						case "paragraph": {
							return ( <p key={i} dangerouslySetInnerHTML={{ __html: b?.data?.text }} /> );
						}
						case "rawtool": {
							return (<div key={i} dangerouslySetInnerHTML={{ __html: b?.data?.html }} />)
						}
						case "simpleimage": {
							return ( <img style={{ maxWidth:"100%", height:"auto" }} key={i} alt={b?.data?.caption} src={b?.data?.url} title={b?.data?.caption} /> );
						}
	                	default: {
	                		return ( <p>Unsupported block type {b.type}</p> );
	                	}
					}
				} else {
					console.warn(`Block missing type: ${b}`, b)
				}
			})}
		</div>
	);
}

class ToggleWrapper extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			open: false,
		}

		//this.el = document.createElement('div');
	}

	componentDidMount() {
		//document.body.appendChild(this.el);
	}

	componentDidUnmount() {
		//document.body.removeChild(this.el);
	}

	isOpen = () => {
		return (this.state.open && this.props.value !== false) || (this.props.value === true);
	}

	className = () => {
		let classes = this.props.className ? 
			this.props.className.split(" ").filter((c) => c !== "d--open" && c !== "d--closed") 
			: [];
		this.isOpen() ? classes.push("d--open") : classes.push("d--closed");
		return classes.join(" ");
	}

	onToggle = () => {
		const { name, onChange } = this.props;
		onChange ? onChange({ target: { value: !this.props.value, name } }) : this.setState({ open: !this.state.open })
	}

	getChildren = () => {
		return deepMap(this.props.children, (child) => {
			let result = child;
			if(child?.props?.role === "d-toggle-button") {
				result = cloneElement(child, {
					...child.props,
					onClick: (e) => this.onToggle()
				});
			} /*else if(child?.props?.role?.includes("d-with-portal")) {
				result = ReactDOM.createPortal(
					cloneElement(child, {
						...child.props
					}),
					this.el
				);
			}*/

			return result;
		});
	}

	render() {
		let className = this.className();
		//this.el.className = className;

		return (
			<div {...this.props} onChange={false} className={className}>
				{this.getChildren()}
			</div>
		);
	}
}

class Tabs extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			selectedIndex: 0,
		}
	}

	onSelectTab = (index) => {
		const { name, onChange } = this.props;
		onChange ? onChange({target: { value: index, name } }) : this.setState({ selectedIndex: index })
	}

	getChildren = () => {
		let { selectedIndex } = this.state;
		const { value } = this.props;
		if(value || value === 0) {
			selectedIndex = value;
		}

		return deepMap(this.props.children, (child) => {
			let result = child;
			if(child?.props?.role === "d-tabsmenu") {
				let index = -1;
				result = cloneElement(child, {
					children: deepMap(child.props.children, (c) => {
						if(c.props.role === "d-tablink") {
							++index;
							
							let classes = c.props.className ? 
								c.props.className.split(" ").filter((c) => c !== "d--tab-link-active") 
								: [];
							if(selectedIndex === index) {
								classes.push("d--tab-link-active");
							}

							let clickIndex = index;
							return cloneElement(c, {
								...c.props,
								className: classes.join(" "),
								onClick: () => this.onSelectTab(clickIndex)
							});
						}
						
						return c;
					}),
				});
			} else if(child?.props?.role === "d-tabcontent") {
				result = cloneElement(child, {
					children: Children.toArray(child.props.children).map((tabpane, i) => {
						let classes = tabpane.props.className ? 
							tabpane.props.className.split(" ").filter((c) => c !== "d--tab-active") 
							: [];
						if(selectedIndex === i) {
							classes.push("d--tab-active");
							return cloneElement(tabpane, {
								...tabpane.props,
								className: classes.join(" ")
							});
						}

						return null;
					}),
				});
			}
			return result;
		});
	}

	render() {
		return (
			<div {...this.props} onChange={false}>
				{this.getChildren()}
			</div>
		);
	}
}

const Slider = (props) => {
	const [selectedIndex, setSelectedIndex] = useState(0);
	
	var getChildren = () => {
		return deepMap(props.children, (child) => {
			let result = child;
			if(child?.props?.role === "d-mask") {
				result = cloneElement(child, {
					children: deepMap(child.props.children, (c, i) => {
						if(c?.props?.role === "d-slide") {
							return cloneElement(c, {
								...c.props,
								style: {
									...c.props.style,
									transform:`translateX(${-100 * selectedIndex}%)`,
									transition: "transform 500ms ease 0s",
									width: `${props.numSlides ? 100 / props.numSlides : 100}%`
								}
							});
						}
						
						return c;
					}),
				});
			} else if(child?.props?.role === "d-slide-left") {
				result = cloneElement(child, {
					...child.props,
					onClick: () => setSelectedIndex(Math.max(selectedIndex - 1, 0))
				});
			} else if(child?.props?.role === "d-slide-right") {
				result = cloneElement(child, {
					...child.props,
					onClick: () => setSelectedIndex(selectedIndex + 1)
				});
			}
			return result;
		});
	}

	return (
		<div {...props}>
			{getChildren()}
		</div>
	);
}
	const Component0CustomComponent = (props) => {
	const [initialized, setInitialized] = useState(false);

	var {
		emit
	} = props;

	var mode = "live";

	
	useEffect(() => {

		if(props.componentDidMount) {
			props.componentDidMount({target: { value: "" }});
		}
	}, []);
	
	return (
		<main {...props}>
			{props.children}
		</main>
	);
}

class ErrorBoundary extends React.Component {
	constructor(props) {
		super(props);
		this.state = {error: ""};
	}

	componentDidCatch(error) {
		this.setState({error: `${error.name}: ${error.message}`});
	}

	render() {
		const {error} = this.state;
		if (error) {
			return (
				<div>{error}</div>
			);
		} else {
			return <>{this.props.children}</>;
		}
	}
}

function Container(props) {
	let {
		dispatch,
			createPropertyEPI,
			getPropertyEPR,
	} = props;

	const [tasks, setTasks] = useState({});
	let  { search, pathname } = useLocation(); let { edit_property_property_id, } = Object.fromEntries(new URLSearchParams(search));

	let history = useHistory();

	var startPoll = (actionName, pollingPeriod) => {
	    // Prevent polling the same action more than once.
	    if(tasks[actionName]) {
	        console.warn(`You're attempting to poll ${actionName} but it is already being polled.`);
	        return;
	    }
	    
	    // Handle stopping poll.
	    let canceled = false;
	    const cancel = () => canceled = true;

	    // Poll action.
	    const poll = () => {
	        if(canceled) {
	            return;
	        }

	        dispatch({ type: actionName });
	        setTimeout(() => poll(), pollingPeriod);
	    }

	    setTasks({...tasks, [actionName]: cancel}, () => poll());
	}

	var stopPoll = (actionName) => {	    
	    // Check task exists.
	    if(!tasks[actionName]) {
	        console.warn(`You're attempting to stop polling ${actionName} but this action is not running.`);
	        return;
	    }

	    tasks[actionName]();
	}

	var runAction = (action) => {
		if(action.pollingPeriod && action.pollingPeriod > 0) {
			this.startPoll(action.name);
		} else {
			dispatch({
				inputVariables: action.payload ? action.payload : {},
				params: { edit_property_property_id, 
				},
				history: history,
				type: action.name,
				timeout: action.timeout && action.timeout > 0 ? action.timeout : null,
			});
		}
	}

	var toLocalString = (date, withTime) => {
		let localString;
		try {
			const timeZoneOffset = new Date(date).getTimezoneOffset() * 60000;
			localString = (new Date(new Date(date) - timeZoneOffset)).toISOString().slice(0, -1);
		} catch(e) { 
			const timeZoneOffset = new Date().getTimezoneOffset() * 60000;
			localString = new Date(new Date() - timeZoneOffset).toISOString().slice(0, -1);
		}
		
		return withTime ? localString : localString.slice(0, 10);
	}

	var toISOString = (date, fromDate) => {
		let isoString;
		try {
			const timeZoneOffset = new Date(date).getTimezoneOffset() * 60000;
			date = fromDate ?  new Date(new Date(new Date(date).getTime() + timeZoneOffset)) : new Date(date);
			isoString = date.toISOString();
		} catch(e) { 
			isoString = new Date().toISOString();
		}

		return isoString;
	}

	useEffect(() => {
		window.scrollTo(0, 0);
		/* TODO - run sagas on page mount (be sure not to rerun in page parameter change hook) */
		return () => {
			Object.keys(tasks).forEach((t) => stopPoll(t));
		}
	}, []);

	return (
		<ErrorBoundary>
			
				
	<Component0CustomComponent id="i61k" emit={runAction} componentDidMount={(e) => {
			var value = e.target.value; runAction({name: "GETPROPERTY", payload: {getPropertyID:edit_property_property_id}});
		}}
	>
			
	<section className="pt-4 pt-md-5 pb-0"
	>
			
	<div className="container"
	>
			
	<div className="row"
	>
			
	<div className="col-12 mx-auto text-center"
	>
			
	<h1 className="fs-2 mb-2"
	>
			Edit Property
	</h1>

			
	<p className="mb-0"
	>
			Let's get you listed! Start with some property details below
	</p>

	</div>

	</div>

	</div>

	</section>

			
	<section className="DivBlock_6"
	>
			
	<div className="container"
	>
			
	<div className="row"
	>
			
	<div className="col-lg-10 mx-auto"
	>
			
	<form className="vstack gap-4" method="get"
	>
			
	<div className="card shadow"
	>
			
	<div className="card-header border-bottom shadow"
	>
			
	<h5 className="mb-0"
	>
			Property Detail
	</h5>

	</div>

			
	<div className="card-body shadow"
	>
			
	<div className="row g-3"
	>
			
	<div className="col-12"
	>
			
	<label className="form-label"
	>
			Property Title
	</label>

			
	<div className="input-group"
	>
			
	<input className="form-control" name="getPropertyEPR.name" placeholder="Property Title" type="text" onChange={(e) => {
			var value = e.target.value; dispatch({type: "change_input", payload:{name: e.target.name, value }});
		}} value={getPropertyEPR?.["name"] || ""}
	>
	</input>

	</div>

	</div>

			
	<div className="col-md-6"
	>
			
	<label className="form-label"
	>
			Property Type
	</label>

			
	<select className="d-select form-select js-control" name="getPropertyEPR.land_type" type="text" onChange={(e) => {
			var value = e.target.value === "null" ? null : e.target.value; dispatch({type: "change_input", payload:{name: e.target.name, value }});
		}} value={getPropertyEPR?.["land_type"] || ""}
	>
			
	<option value=""
	>
			Select an option
	</option>

			
	<option value="Ranch"
	>
			Ranch
	</option>

			
	<option value="Farm"
	>
			Farm
	</option>

			
	<option value="Homestead"
	>
			Homestead
	</option>

	</select>

	</div>

			
	<div className="col-12"
	>
			
	<label className="form-label"
	>
			Address
	</label>

			
	<textarea className="form-control" name="getPropertyEPR.address" placeholder="Enter address" rows="2" type="text" onChange={(e) => {
			var value = e.target.value; dispatch({type: "change_input", payload:{name: e.target.name, value }});
		}} value={getPropertyEPR?.["address"] || ""}
	>
	</textarea>

	</div>

			
	<div className="col-md-6"
	>
			
	<label className="form-label"
	>
			State
	</label>

			
	<select className="form-select js-choice" data-search-enabled="true" name="getPropertyEPR.state" type="text" onChange={(e) => {
			var value = e.target.value === "null" ? null : e.target.value; dispatch({type: "change_input", payload:{name: e.target.name, value }});
		}} value={getPropertyEPR?.["state"] || ""}
	>
			
	<option value=""
	>
			Select state
	</option>

			
	<option value="Texas"
	>
			Texas
	</option>

	</select>

	</div>

			
	<div className="col-md-6"
	>
			
	<label className="form-label"
	>
			City
	</label>

			
	<input className="form-control" name="getPropertyEPR.city" placeholder="Enter city" type="text" onChange={(e) => {
			var value = e.target.value; dispatch({type: "change_input", payload:{name: e.target.name, value }});
		}} value={getPropertyEPR?.["city"] || ""}
	>
	</input>

	</div>

			
	<label className="form-label"
	>
			Zip Code
	</label>

			
	<input className="form-control" name="getPropertyEPR.zip" placeholder="Enter zip" type="number" onChange={(e) => {
			var value = Number(e.target.value); dispatch({type: "change_input", payload:{name: e.target.name, value }});
		}} value={getPropertyEPR?.["zip"] || ""}
	>
	</input>

			
	<div className="text-end"
	>
			
	<div className="btn btn-success" onClick={(e) => {
			var value = e.target.value; runAction({name: "UPDATEPROPERTY", payload: {updatePropertyPropertyID:edit_property_property_id}});
		}}
	>
			
	<span id="idqgp"
	>
			Update Property
	</span>

	</div>

	</div>

	</div>

	</div>

	</div>

			
	<div className="card shadow"
	>
			
	<div className="card-header border-bottom shadow"
	>
			
	<h5 className="mb-0"
	>
			Listing Detail
	</h5>

			
	<p className="mb-0"
	>
			Now determine your listing details:
	</p>

	</div>

			
	<div className="card-body shadow"
	>
			
	<div className="row g-3"
	>
			
	<div className="col-md-6"
	>
			
	<label className="form-label"
	>
			Acres:
	</label>

			
	<input className="d-input form-control" name="getPropertyEPR.acres" placeholder="acres " type="number" onChange={(e) => {
			var value = Number(e.target.value); dispatch({type: "change_input", payload:{name: e.target.name, value }});
		}} value={getPropertyEPR?.["acres"] || ""}
	>
	</input>

			
	<label className="form-label"
	>
			Description:
	</label>

			
	<input className="d-input form-control" name="getPropertyEPR.description" placeholder="Write a detailed description of your property. " type="text" onChange={(e) => {
			var value = e.target.value; dispatch({type: "change_input", payload:{name: e.target.name, value }});
		}} value={getPropertyEPR?.["description"] || ""}
	>
	</input>

	</div>

			
	<div className="col-md-6"
	>
			
	<label className="form-label"
	>
			Amenities
	</label>

			
	<div className="d-container Container"
	>
			
	<label className="d-checkbox" id="ieikly" type="checkbox"
	>
			
	<input className="d-checkbox-input" id="iykek6" name="createPropertyEPI.amenity" type="checkbox" onChange={(e) => {
			var value = e.target.checked; dispatch({type: "change_input", payload:{name: e.target.name, value }});
		}} checked={createPropertyEPI?.["amenity"] || ""}
	>
	</input>

			
	<label className="d-form-label" id="is0dv1" type="checkbox"
	>
			Parking
	</label>

	</label>

			
	<label className="d-checkbox" id="iswayj" type="checkbox"
	>
			
	<input className="d-checkbox-input" type="checkbox"
	>
	</input>

			
	<label className="d-form-label" type="checkbox"
	>
			Vehicles allowed
	</label>

	</label>

			
	<label className="d-checkbox" type="checkbox"
	>
			
	<input className="d-checkbox-input" type="checkbox"
	>
	</input>

			
	<label className="d-form-label" type="checkbox"
	>
			Pets
	</label>

	</label>

			
	<label className="d-checkbox" id="ii0ern" type="checkbox"
	>
			
	<input className="d-checkbox-input" type="checkbox"
	>
	</input>

			
	<label className="d-form-label" type="checkbox"
	>
			Trails
	</label>

	</label>

			
	<label className="d-checkbox" type="checkbox"
	>
			
	<input className="d-checkbox-input" type="checkbox"
	>
	</input>

			
	<label className="d-form-label" type="checkbox"
	>
			Wifi
	</label>

	</label>

			
	<label className="d-checkbox" type="checkbox"
	>
			
	<input className="d-checkbox-input" type="checkbox"
	>
	</input>

			
	<label className="d-form-label" type="checkbox"
	>
			Camp fires
	</label>

	</label>

			
	<label className="d-checkbox" type="checkbox"
	>
			
	<input className="d-checkbox-input" type="checkbox"
	>
	</input>

			
	<label className="d-form-label" type="checkbox"
	>
			Electric
	</label>

	</label>

			
	<label className="d-checkbox" type="checkbox"
	>
			
	<input className="d-checkbox-input" type="checkbox"
	>
	</input>

			
	<label className="d-form-label" type="checkbox"
	>
			on-site host
	</label>

	</label>

	</div>

	</div>

			
	<div className="col-12"
	>
			
	<label className="form-label"
	>
			Upload image *
	</label>

			
	<div className="dropzone dropzone-custom" data-dropzone="{&quotmaxFiles&quot: 5, &quotaddRemoveLinks&quot: false}"
	>
			
	<div className="dz-message needsclick"
	>
			
	<i className="bi bi-upload display-3"
	>
	</i>

			
	<label className="d-file-upload d-button"
	>
			
	<span
	>
			Upload File
	</span>

			
	<input className="d-file-upload-input" type="file"
	>
	</input>

	</label>

	</div>

			
	<div className="dz-preview row g-4"
	>
			
	<div className="col-xl-2 col-md-4 col-sm-6"
	>
			
	<div className="card p-2 mb-0 shadow-none border position-relative h-100"
	>
			
	<img className="rounded bg-light" alt="" data-dz-thumbnail="" src={createPropertyEPI["images"]}
	>
	</img>

			
	<div className="mt-2"
	>
			
	<a className="text-muted fw-bold" data-dz-name="" href="javascript:void(0);"
	>
	</a>

			
	<p className="mb-0 small" data-dz-size=""
	>
	</p>

	</div>

	</div>

	</div>

	</div>

	</div>

			
	<p className="small mb-0 mt-2"
	>
			 Only JPG, JPEG, and PNG. Our suggested dimensions are 600px * 450px. The larger image will be cropped to 4:3 to fit our thumbnails/previews.
			
	<b
	>
			Note:
	</b>

	</p>

	</div>

	</div>

	</div>

	</div>

	</form>

	</div>

	</div>

	</div>

	</section>

	</Component0CustomComponent>

			
		</ErrorBoundary>
	);
}

const mapStateToProps = function(state){
    return state.reducer
}

export default connect(mapStateToProps, null) ( Container );