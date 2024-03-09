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
			Best_Email_Contact,
			CurrentUserpermitnotification,
			Email_Description,
			Name_Email_Help,
			createListingEPI,
	} = props;

	const [tasks, setTasks] = useState({});
	let  { search, pathname } = useLocation(); let { property_id, } = Object.fromEntries(new URLSearchParams(search));

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
				params: { property_id, 
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
			
				
	<div className="vh-100 d-flex div-main BaseFontSetting"
	>
			
	<div className="sidebar border-end d-flex flex-column nav_width" d-partial-id="1140"
	>
			
	<div className="p-2 bg-white" id="ia61-3"
	>
			
	<img className="w-100" id="ikeznu-3" src="https://placeholder.com/wp-content/uploads/2018/10/placeholder.com-logo1.png"
	>
	</img>

	</div>

			
	<div className="flex-grow-1 overflow-auto"
	>
			
	<Link className="d-inline-block w-100 d-flex align-items-center text-decoration-none text-dark p-3" id="ijc00z-3" target="_self" to="/" type="spa"
	>
			
	<i className="fas fa-clock"
	>
	</i>

			
	<span className="ms-2" id="ilnflz-3"
	>
			Properties
	</span>

	</Link>

			
	<Link className="d-inline-block w-100 d-flex align-items-center text-decoration-none text-dark p-3" id="it5lzi-3" target="_self" to="/listings" type="spa"
	>
			
	<i className="fas fa-clock"
	>
	</i>

			
	<span className="ms-2" id="ixscfe-3"
	>
			Profile
	</span>

	</Link>

	</div>

	</div>

			
	<div className="flex-grow-1 p-4 position-relative overflow-auto bg-light"
	>
			
	<div className="d-flex align-items-center mb-4"
	>
			
	<h3 className="m-0 heading_text_style"
	>
			Listings
	</h3>

	</div>

			
	<div className="card"
	>
			
	<div className="card-body p-0"
	>
			
	<div className="d-flex p-3 align-items-center border-bottom mb-2"
	>
			
	<h3 className="me-auto" id="i2xiim"
	>
			Property Listings 
	</h3>

			
	<div className="d-modal d--closed" activetab="0" id="iymz4" name="5033e110-a677-4795-bfe4-23ec79c4ec7f"
	>
			
	<a className="d-button btn btn-primary" role="d-toggle-button"
	>
			Add Listing
	</a>

			
	<div className="d-modal-wrapper d--closed" id="imyru"
	>
			
	<div className="d-modal-box"
	>
			
	<div className="d-modal-header" id="ipwoq"
	>
			
	<h4 id="iu1jz"
	>
			Add Listing
	</h4>

			
	<i className="fas fa-times" role="d-toggle-button"
	>
	</i>

	</div>

			
	<div className="d-modal-body"
	>
			
	<div id="i2t5u"
	>
			
	<label id="irujk"
	>
			Guest Limit
	</label>

			
	<input className="d-input form-control" name="createListingEPI.guest_limit" type="number" onChange={(e) => {
			var value = Number(e.target.value); dispatch({type: "change_input", payload:{name: e.target.name, value }});
		}} value={createListingEPI?.["guest_limit"] || ""}
	>
	</input>

	</div>

			
	<div
	>
			
	<label id="ihugr"
	>
			Price
	</label>

			
	<input className="d-input form-control" name="createListingEPI.price" type="number" onChange={(e) => {
			var value = Number(e.target.value); dispatch({type: "change_input", payload:{name: e.target.name, value }});
		}} value={createListingEPI?.["price"] || ""}
	>
	</input>

	</div>

			
	<div
	>
			
	<label id="it2bi"
	>
			Order Type
	</label>

			
	<select className="d-select form-select" id="ig45vw"
	>
			
	<option value="null"
	>
			-- Select Order Type --
	</option>

			
	<option id="i5y09i" value="opt2"
	>
			Option 2
	</option>

	</select>

	</div>

	</div>

			
	<div className="d-modal-footer"
	>
			
	<a className="d-button btn btn-primary"
	>
			Submit
	</a>

	</div>

	</div>

	</div>

	</div>

	</div>

			
	<table className="d-table table table-hover"
	>
			
	<thead
	>
			
	<tr
	>
			
	<th className="bg-light"
	>
	</th>

			
	<th className="bg-light"
	>
	</th>

			
	<th className="bg-light"
	>
	</th>

	</tr>

	</thead>

			
	<tbody
	>
			
	<tr id="ik4wd"
	>
			
	<td id="igr24"
	>
	</td>

			
	<td
	>
	</td>

			
	<td id="iez0f"
	>
			
	<i className="fas fa-trash"
	>
	</i>

	</td>

	</tr>

	</tbody>

	</table>

			
	<div className="d-flex align-items-center justify-content-end px-2"
	>
			
	<div className="d-flexc d-flex align-items-center"
	>
			
	<div className="me-2"
	>
	</div>

			
	<ul className="pagination mt-2"
	>
			
	<li className="page-item"
	>
			
	<div className="page-link"
	>
			
	<i className="fas fa-angle-left"
	>
	</i>

	</div>

	</li>

			
	<li className="page-item"
	>
			
	<div
	>
			
	<div className="page-link"
	>
			
	<i className="fas fa-angle-right"
	>
	</i>

	</div>

	</div>

	</li>

	</ul>

	</div>

	</div>

	</div>

			
	<div className="d-modal d--closed" activetab="0" name="94ae2c84-3cdc-400d-9f8c-c3a45f7ed44a"
	>
			
	<div className="d-modal-wrapper d--open"
	>
			
	<div className="d-modal-box modal-radius min-width-653 min-height-497"
	>
			
	<div className="d-modal-header"
	>
			
	<h6 className="fw-bold"
	>
			Build Approve
	</h6>

			
	<i className="fas fa-times" role="d-toggle-button"
	>
	</i>

	</div>

			
	<div className="d-modal-body"
	>
			
	<div
	>
	</div>

			
	<div className="d-flex justify-content-center position-absolute top-50 start-50 translate-middle"
	>
			
	<div d-custom-id="524" fill="none" height="120" viewBox="0 0 120 120" width="120" xmlns="http://www.w3.org/2000/svg"
	>
			Unsupported type svg
	</div>

	</div>

	</div>

			
	<div className="d-modal-footer"
	>
			
	<div className="ms-auto"
	>
			
	<a className="d-button rounded text-white border border-dark"
	>
			LOG OUT
	</a>

	</div>

	</div>

	</div>

	</div>

	</div>

			
	<div className="d-modal d--closed" activetab="0" name="a2f10a0e-6365-42f5-aa64-40fe782b84b8"
	>
			
	<div className="d-modal-wrapper"
	>
			
	<div className="d-modal-box modal-radius min-width-653 min-height-497"
	>
			
	<div className="d-modal-header"
	>
			
	<h6 className="fw-bold"
	>
			Build Approve Help
	</h6>

			
	<i className="fas fa-times" role="d-toggle-button"
	>
	</i>

	</div>

			
	<div className="d-modal-body"
	>
			
	<div
	>
			
	<p className="fs-6"
	>
			Build Approve is a brand new product, we are excited to have you as an early adopter! 
	</p>

			
	<p className="fs-6"
	>
			We are currently building out our online manual. At this stage our user help is provided by email ticketing.
	</p>

			
	<p className="fs-6"
	>
			Please fill out the fields below and one of Build Approve s team will respond to your query within 24 hours.
	</p>

	</div>

			
	<div
	>
			
	<div className="d-row" layout="6/6"
	>
			
	<div className="d-col d-col-6 d-col-medium-12 d-col-small-12 d-col-tiny-12"
	>
			
	<div
	>
			
	<input className="d-input form-control input-control-radius-10" name="Name_Email_Help" placeholder="Your name" type="text" onChange={(e) => {
			var value = e.target.value; dispatch({type: "change_input", payload:{name: e.target.name, value }});
		}} value={Name_Email_Help || ""}
	>
	</input>

	</div>

			
	<div
	>
	</div>

	</div>

			
	<div className="d-col d-col-6 d-col-medium-12 d-col-small-12 d-col-tiny-12"
	>
			
	<div
	>
			
	<input className="d-input form-control input-control-radius-10" name="Best_Email_Contact" placeholder="Best email contact" type="text" onChange={(e) => {
			var value = e.target.value; dispatch({type: "change_input", payload:{name: e.target.name, value }});
		}} value={Best_Email_Contact || ""}
	>
	</input>

	</div>

			
	<div
	>
	</div>

	</div>

	</div>

	</div>

			
	<div className="p-2"
	>
			
	<textarea className="d-input form-control input-control-radius-10" name="Email_Description" placeholder="Please describe your issue" rows="5" type="text" onChange={(e) => {
			var value = e.target.value; dispatch({type: "change_input", payload:{name: e.target.name, value }});
		}} value={Email_Description || ""}
	>
	</textarea>

			
	<div
	>
	</div>

	</div>

	</div>

			
	<div className="d-modal-footer"
	>
			
	<div className="d-flex"
	>
			
	<a className="d-button rounded text-white border border-dark ms-auto"
	>
			Submit
	</a>

	</div>

	</div>

	</div>

	</div>

	</div>

			
	<div
	>
			
	<div className="d-modal d--closed" activetab="0" name="acbe7afe-09ca-40c8-8620-749bd41a9702"
	>
			
	<div className="d-modal-wrapper"
	>
			
	<div className="d-modal-box modal-radius min-width-653 min-height-497"
	>
			
	<div className="d-modal-header"
	>
			
	<div
	>
			
	<h5
	>
			Notifications
	</h5>

	</div>

	</div>

			
	<div className="d-modal-body"
	>
			
	<div
	>
			
	<div className="p-3"
	>
			
	<p
	>
			Please select notifications for changes in permit status below. 
	</p>

			
	<p
	>
			Notifications will be sent to the email associated with your account. 
	</p>

	</div>

			
	<div className="row mb-3"
	>
			
	<div className="col-3"
	>
			
	<div
	>
			
	<div className="me-2 mt-1 notification_btn_size border border-success alert-success d-flex align-items-center justify-content-center"
	>
			
	<a className="d-inline-block text-decoration-none text-muted fw-bold" href="#" target="_self" type="external"
	>
	</a>

	</div>

	</div>

	</div>

			
	<div className="col-9"
	>
			
	<div className="d-flex align-items-center"
	>
			
	<label className="d-checkbox ms-3 mt-2" type="checkbox"
	>
			
	<input className="d-checkbox-input mt-2" name="CurrentUserpermitnotification.notify_active" type="checkbox" onChange={(e) => {
			var value = e.target.checked; dispatch({type: "change_input", payload:{name: e.target.name, value }});
		}} checked={CurrentUserpermitnotification?.["notify_active"] || ""}
	>
	</input>

			
	<label className="d-form-label ms-2" type="checkbox"
	>
			Notify me when a new permit is applied
	</label>

	</label>

	</div>

	</div>

	</div>

			
	<div className="row mb-3"
	>
			
	<div className="col-3"
	>
			
	<div
	>
			
	<div className="me-2 mt-1 notification_btn_size border d-flex align-items-center justify-content-center alert-warning border-warning"
	>
			
	<a className="d-inline-block text-decoration-none text-muted fw-bold" href="#" target="_self" type="external"
	>
	</a>

	</div>

	</div>

	</div>

			
	<div className="col-9"
	>
			
	<div
	>
			
	<label className="d-checkbox ms-3 mt-2" type="checkbox"
	>
			
	<input className="d-checkbox-input mt-2" name="CurrentUserpermitnotification.notify_expiring" type="checkbox" onChange={(e) => {
			var value = e.target.checked; dispatch({type: "change_input", payload:{name: e.target.name, value }});
		}} checked={CurrentUserpermitnotification?.["notify_expiring"] || ""}
	>
	</input>

			
	<label className="d-form-label ms-2" type="checkbox"
	>
			Notify me 21 days ahead of expiration
	</label>

	</label>

	</div>

	</div>

	</div>

			
	<div className="row mb-3"
	>
			
	<div className="col-3"
	>
			
	<div
	>
			
	<div className="me-2 mt-1 notification_btn_size border d-flex align-items-center justify-content-center alert-danger border-danger"
	>
			
	<a className="d-inline-block text-decoration-none text-muted fw-bold" href="#" target="_self" type="external"
	>
	</a>

	</div>

	</div>

	</div>

			
	<div className="col-9"
	>
			
	<div
	>
			
	<label className="d-checkbox ms-3 mt-2" type="checkbox"
	>
			
	<input className="d-checkbox-input mt-2" name="CurrentUserpermitnotification.notify_expired" type="checkbox" onChange={(e) => {
			var value = e.target.checked; dispatch({type: "change_input", payload:{name: e.target.name, value }});
		}} checked={CurrentUserpermitnotification?.["notify_expired"] || ""}
	>
	</input>

			
	<label className="d-form-label ms-2" type="checkbox"
	>
			Notify me the day the permit expires
	</label>

	</label>

	</div>

	</div>

	</div>

			
	<div className="row mb-3"
	>
			
	<div className="col-3"
	>
			
	<div
	>
			
	<div className="me-2 mt-1 notification_btn_size border d-flex align-items-center justify-content-center border-primary alert-primary"
	>
			
	<a className="d-inline-block text-decoration-none text-muted fw-bold" href="#" target="_self" type="external"
	>
	</a>

	</div>

	</div>

	</div>

			
	<div className="col-9"
	>
			
	<div
	>
			
	<label className="d-checkbox ms-3 mt-2" type="checkbox"
	>
			
	<input className="d-checkbox-input mt-2" name="CurrentUserpermitnotification.notify_final" type="checkbox" onChange={(e) => {
			var value = e.target.checked; dispatch({type: "change_input", payload:{name: e.target.name, value }});
		}} checked={CurrentUserpermitnotification?.["notify_final"] || ""}
	>
	</input>

			
	<label className="d-form-label ms-2 no-wrap" type="checkbox"
	>
			Notify me when a new permit switches to final 
	</label>

	</label>

	</div>

	</div>

	</div>

			
	<div className="row"
	>
			
	<div className="col-3"
	>
			
	<div
	>
			
	<div className="me-2 mt-1 notification_btn_size border d-flex align-items-center justify-content-center alert-dark border-dark"
	>
			
	<a className="d-inline-block text-decoration-none text-muted fw-bold" href="#" target="_self" type="external"
	>
	</a>

	</div>

	</div>

	</div>

			
	<div className="col-9"
	>
			
	<div
	>
			
	<label className="d-checkbox ms-3 mt-2" type="checkbox"
	>
			
	<input className="d-checkbox-input mt-2" name="CurrentUserpermitnotification.notify_other" type="checkbox" onChange={(e) => {
			var value = e.target.checked; dispatch({type: "change_input", payload:{name: e.target.name, value }});
		}} checked={CurrentUserpermitnotification?.["notify_other"] || ""}
	>
	</input>

			
	<label className="d-form-label ms-2" type="checkbox"
	>
			Notify me of other permit status changes
	</label>

	</label>

	</div>

	</div>

	</div>

	</div>

	</div>

			
	<div className="d-modal-footer"
	>
			
	<div className="d-flex"
	>
			
	<a className="d-button rounded bg-primary ms-auto"
	>
			Apply and Close
	</a>

	</div>

	</div>

	</div>

	</div>

	</div>

	</div>

	</div>

			
	<div className="d-modal d--closed" activetab="0" name="466a070b-3e11-495a-b01c-7ff984e82f02"
	>
			
	<div className="d-modal-wrapper"
	>
			
	<div className="d-modal-box modal-radius min-width-653"
	>
			
	<div className="d-modal-header"
	>
			
	<h4
	>
			Description
	</h4>

			
	<i className="fas fa-times" role="d-toggle-button"
	>
	</i>

	</div>

			
	<div className="d-modal-body"
	>
			
	<div
	>
	</div>

	</div>

			
	<div className="d-modal-footer"
	>
			
	<div className="d-flex"
	>
			
	<a className="d-button rounded bg-primary text-center ms-auto"
	>
			Close
	</a>

	</div>

	</div>

	</div>

	</div>

	</div>

	</div>

	</div>

			
				
	<title
	>
			Profit Calculator
	</title>

			
				
	<form className="Form" id="iid0kl" method="get"
	>
			
	<label id="iehs4p"
	>
			Cost Price:
	</label>

			
	<input className="d-input" id="costPrice" placeholder="Enter cost price" type="number"
	>
	</input>

			
	<label
	>
			Selling Price:
	</label>

			
	<input className="d-input" id="sellingPrice" placeholder="Enter selling price" type="number"
	>
	</input>

			
	<button className="Text" id="idky1q" onclick="calculateProfit()"
	>
			Calculate Profit
	</button>

	</form>

			
				
	<div id="result"
	>
	</div>

			
		</ErrorBoundary>
	);
}

const mapStateToProps = function(state){
    return state.reducer
}

export default connect(mapStateToProps, null) ( Container );