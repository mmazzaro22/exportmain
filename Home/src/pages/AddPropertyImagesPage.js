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
		<section {...props}>
			{props.children}
		</section>
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
			Loading,
			currentUser,
			getAllPropertyImagesEPR,
			row,
			uploadFile,
	} = props;

	const [tasks, setTasks] = useState({});
	let  { search, pathname } = useLocation(); let { propertyImagespropertyId, } = useParams(); let { addImagesPropertyID, } = Object.fromEntries(new URLSearchParams(search));

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
				params: { propertyImagespropertyId, addImagesPropertyID, 
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
	useEffect(() => {
		window.scrollTo(0, 0);
		/* TODO - run sagas on page parameter change */
	}, [ propertyImagespropertyId,]);

	return (
		<ErrorBoundary>
			
				
	<header className="navbar-light header-sticky"
	>
			
	<nav className="navbar navbar-expand-xl"
	>
			
	<div className="container"
	>
			
	<a className="navbar-brand" href="index.html"
	>
			
	<img className="light-mode-item navbar-brand-item" alt="logo" src="assets/images/logo.svg"
	>
	</img>

			
	<img className="dark-mode-item navbar-brand-item" alt="logo" src="assets/images/logo-light.svg"
	>
	</img>

	</a>

			
	<button className="navbar-toggler ms-auto mx-3 p-0 p-sm-2" aria-controls="navbarCollapse" aria-expanded="false" aria-label="Toggle navigation" data-bs-target="#navbarCollapse" data-bs-toggle="collapse" type="button"
	>
	</button>

			
	<div className="navbar-collapse collapse" id="navbarCollapse"
	>
			
	<ul className="navbar-nav navbar-nav-scroll mx-auto"
	>
			
	<li className="nav-item dropdown"
	>
			
	<a className="nav-link dropdown-toggle" aria-expanded="false" aria-haspopup="true" data-bs-toggle="dropdown" href="#" id="listingMenu"
	>
			Listings
	</a>

			
	<ul className="dropdown-menu" aria-labelledby="listingMenu"
	>
			
	<li className="dropdown-submenu dropend"
	>
			
	<a className="dropdown-item dropdown-toggle" href="#"
	>
			Hotel
	</a>

			
	<ul className="dropdown-menu" data-bs-popper="none"
	>
			
	<li
	>
			 
			
	<a className="dropdown-item" href="index.html"
	>
			Hotel Home
	</a>

	</li>

			
	<li
	>
			 
			
	<a className="dropdown-item" href="index-hotel-chain.html"
	>
			Hotel Chain
	</a>

	</li>

			
	<li
	>
			 
			
	<a className="dropdown-item" href="index-resort.html"
	>
			Hotel Resort
	</a>

	</li>

			
	<li
	>
			 
			
	<a className="dropdown-item" href="hotel-grid.html"
	>
			Hotel Grid
	</a>

	</li>

			
	<li
	>
			 
			
	<a className="dropdown-item" href="hotel-list.html"
	>
			Hotel List
	</a>

	</li>

			
	<li
	>
			 
			
	<a className="dropdown-item" href="hotel-detail.html"
	>
			Hotel Detail
	</a>

	</li>

			
	<li
	>
			 
			
	<a className="dropdown-item" href="room-detail.html"
	>
			Room Detail
	</a>

	</li>

			
	<li
	>
			 
			
	<a className="dropdown-item" href="hotel-booking.html"
	>
			Hotel Booking
	</a>

	</li>

	</ul>

	</li>

			
	<li className="dropdown-submenu dropend"
	>
			
	<a className="dropdown-item dropdown-toggle" href="#"
	>
			Flight
	</a>

			
	<ul className="dropdown-menu" data-bs-popper="none"
	>
			
	<li
	>
			 
			
	<a className="dropdown-item" href="index-flight.html"
	>
			Flight Home
	</a>

	</li>

			
	<li
	>
			 
			
	<a className="dropdown-item" href="flight-list.html"
	>
			Flight List
	</a>

	</li>

			
	<li
	>
			 
			
	<a className="dropdown-item" href="flight-detail.html"
	>
			Flight Detail
	</a>

	</li>

			
	<li
	>
			 
			
	<a className="dropdown-item" href="flight-booking.html"
	>
			Flight Booking
	</a>

	</li>

	</ul>

	</li>

			
	<li className="dropdown-submenu dropend"
	>
			
	<a className="dropdown-item dropdown-toggle" href="#"
	>
			Tour
	</a>

			
	<ul className="dropdown-menu" data-bs-popper="none"
	>
			
	<li
	>
			 
			
	<a className="dropdown-item" href="index-tour.html"
	>
			Tour Home
	</a>

	</li>

			
	<li
	>
			 
			
	<a className="dropdown-item" href="tour-grid.html"
	>
			Tour Grid
	</a>

	</li>

			
	<li
	>
			 
			
	<a className="dropdown-item" href="tour-detail.html"
	>
			Tour Detail
	</a>

	</li>

			
	<li
	>
			 
			
	<a className="dropdown-item" href="tour-booking.html"
	>
			Tour Booking
	</a>

	</li>

	</ul>

	</li>

			
	<li className="dropdown-submenu dropend"
	>
			
	<a className="dropdown-item dropdown-toggle" href="#"
	>
			Cab
	</a>

			
	<ul className="dropdown-menu" data-bs-popper="none"
	>
			
	<li
	>
			 
			
	<a className="dropdown-item" href="index-cab.html"
	>
			Cab Home
	</a>

	</li>

			
	<li
	>
			 
			
	<a className="dropdown-item" href="cab-list.html"
	>
			Cab List
	</a>

	</li>

			
	<li
	>
			 
			
	<a className="dropdown-item" href="cab-detail.html"
	>
			Cab Detail
	</a>

	</li>

			
	<li
	>
			 
			
	<a className="dropdown-item" href="cab-booking.html"
	>
			Cab Booking
	</a>

	</li>

	</ul>

	</li>

			
	<li className="dropdown-submenu dropend"
	>
			
	<a className="dropdown-item dropdown-toggle" href="#"
	>
	</a>

			
	<ul className="dropdown-menu" data-bs-popper="none"
	>
			
	<li
	>
			 
			
	<a className="dropdown-item" href="index-directory.html"
	>
			Directory Home
	</a>

	</li>

			
	<li
	>
			 
			
	<a className="dropdown-item" href="directory-detail.html"
	>
			Directory Detail
	</a>

	</li>

	</ul>

	</li>

			
	<li className="dropdown-submenu dropend"
	>
			
	<a className="dropdown-item dropdown-toggle" href="#"
	>
			Add Listing
	</a>

			
	<ul className="dropdown-menu" data-bs-popper="none"
	>
			
	<li
	>
			 
			
	<a className="dropdown-item" href="join-us.html"
	>
			Join us
	</a>

	</li>

			
	<li
	>
			 
			
	<a className="dropdown-item" href="add-listing.html"
	>
			Add Listing
	</a>

	</li>

			
	<li
	>
			 
			
	<a className="dropdown-item" href="add-listing-minimal.html"
	>
			Add Listing Minimal
	</a>

	</li>

			
	<li
	>
			 
			
	<a className="dropdown-item" href="listing-added.html"
	>
			Listing Added
	</a>

	</li>

	</ul>

	</li>

			
	<li className="dropdown-submenu dropend"
	>
			
	<a className="dropdown-item dropdown-toggle" href="#"
	>
			Hero
	</a>

			
	<ul className="dropdown-menu" data-bs-popper="none"
	>
			
	<li
	>
			 
			
	<a className="dropdown-item" href="hero-inline-form.html"
	>
			Hero Inline Form
	</a>

	</li>

			
	<li
	>
			 
			
	<a className="dropdown-item" href="hero-multiple-search.html"
	>
			Hero Multiple Search
	</a>

	</li>

			
	<li
	>
			 
			
	<a className="dropdown-item" href="hero-image-gallery.html"
	>
			Hero Image Gallery
	</a>

	</li>

			
	<li
	>
			 
			
	<a className="dropdown-item" href="hero-split.html"
	>
			Hero Split
	</a>

	</li>

	</ul>

	</li>

			
	<li
	>
			 
			
	<a className="dropdown-item" href="booking-confirm.html"
	>
			Booking Confirmed
	</a>

	</li>

			
	<li
	>
			 
			
	<a className="dropdown-item" href="compare-listing.html"
	>
			Compare Listing
	</a>

	</li>

			
	<li
	>
			 
			
	<a className="dropdown-item" href="offer-detail.html"
	>
			Offer Detail
	</a>

	</li>

	</ul>

	</li>

			
	<li className="nav-item dropdown"
	>
			
	<a className="nav-link dropdown-toggle" aria-expanded="false" aria-haspopup="true" data-bs-toggle="dropdown" href="#" id="pagesMenu"
	>
			Pages
	</a>

			
	<ul className="dropdown-menu" aria-labelledby="pagesMenu"
	>
			
	<li
	>
			 
			
	<a className="dropdown-item" href="about.html"
	>
			About
	</a>

	</li>

			
	<li
	>
			 
			
	<a className="dropdown-item" href="contact.html"
	>
			Contact
	</a>

	</li>

			
	<li
	>
			 
			
	<a className="dropdown-item" href="contact-2.html"
	>
			Contact 2
	</a>

	</li>

			
	<li
	>
			 
			
	<a className="dropdown-item" href="team.html"
	>
			Our Team
	</a>

	</li>

			
	<li className="dropdown-submenu dropend"
	>
			
	<a className="dropdown-item dropdown-toggle" href="#"
	>
			Authentication
	</a>

			
	<ul className="dropdown-menu" data-bs-popper="none"
	>
			
	<li
	>
			 
			
	<a className="dropdown-item" href="sign-in.html"
	>
			Sign In
	</a>

	</li>

			
	<li
	>
			 
			
	<a className="dropdown-item" href="sign-up.html"
	>
			Sign Up
	</a>

	</li>

			
	<li
	>
			 
			
	<a className="dropdown-item" href="forgot-password.html"
	>
			Forgot Password
	</a>

	</li>

			
	<li
	>
			 
			
	<a className="dropdown-item" href="two-factor-auth.html"
	>
			Two factor authentication
	</a>

	</li>

	</ul>

	</li>

			
	<li className="dropdown-submenu dropend"
	>
			
	<a className="dropdown-item dropdown-toggle" href="#"
	>
			Blog
	</a>

			
	<ul className="dropdown-menu" data-bs-popper="none"
	>
			
	<li
	>
			 
			
	<a className="dropdown-item" href="blog.html"
	>
			Blog
	</a>

	</li>

			
	<li
	>
			 
			
	<a className="dropdown-item" href="blog-detail.html"
	>
			Blog Detail
	</a>

	</li>

	</ul>

	</li>

			
	<li className="dropdown-submenu dropend"
	>
			
	<a className="dropdown-item dropdown-toggle" href="#"
	>
			Help
	</a>

			
	<ul className="dropdown-menu" data-bs-popper="none"
	>
			
	<li
	>
			 
			
	<a className="dropdown-item" href="help-center.html"
	>
			Help Center
	</a>

	</li>

			
	<li
	>
			 
			
	<a className="dropdown-item" href="help-detail.html"
	>
			Help Detail
	</a>

	</li>

			
	<li
	>
			 
			
	<a className="dropdown-item" href="privacy-policy.html"
	>
			Privacy Policy
	</a>

	</li>

			
	<li
	>
			 
			
	<a className="dropdown-item" href="terms-of-service.html"
	>
			Terms of Service
	</a>

	</li>

	</ul>

	</li>

			
	<li
	>
			 
			
	<a className="dropdown-item" href="pricing.html"
	>
			Pricing
	</a>

	</li>

			
	<li
	>
			 
			
	<a className="dropdown-item" href="faq.html"
	>
			FAQs
	</a>

	</li>

			
	<li
	>
			 
			
	<a className="dropdown-item" href="error.html"
	>
			Error 404
	</a>

	</li>

			
	<li
	>
			 
			
	<a className="dropdown-item" href="coming-soon.html"
	>
			Coming Soon
	</a>

	</li>

	</ul>

	</li>

			
	<li className="nav-item dropdown"
	>
			
	<a className="nav-link dropdown-toggle" aria-expanded="false" aria-haspopup="true" data-bs-toggle="dropdown" href="#" id="accounntMenu"
	>
			Accounts
	</a>

			
	<ul className="dropdown-menu" aria-labelledby="accounntMenu"
	>
			
	<li className="dropdown-submenu dropend"
	>
			
	<a className="dropdown-item dropdown-toggle" href="#"
	>
			User Profile
	</a>

			
	<ul className="dropdown-menu" data-bs-popper="none"
	>
			
	<li
	>
			 
			
	<a className="dropdown-item" href="account-profile.html"
	>
			My Profile
	</a>

	</li>

			
	<li
	>
			 
			
	<a className="dropdown-item" href="account-bookings.html"
	>
			My Bookings
	</a>

	</li>

			
	<li
	>
			 
			
	<a className="dropdown-item" href="account-travelers.html"
	>
			Travelers
	</a>

	</li>

			
	<li
	>
			 
			
	<a className="dropdown-item" href="account-payment-details.html"
	>
			Payment Details
	</a>

	</li>

			
	<li
	>
			 
			
	<a className="dropdown-item" href="account-wishlist.html"
	>
			Wishlist
	</a>

	</li>

			
	<li
	>
			 
			
	<a className="dropdown-item" href="account-settings.html"
	>
			Settings
	</a>

	</li>

			
	<li
	>
			 
			
	<a className="dropdown-item" href="account-delete.html"
	>
			Delete Profile
	</a>

	</li>

	</ul>

	</li>

			
	<li className="dropdown-submenu dropend"
	>
			
	<a className="dropdown-item dropdown-toggle" href="#"
	>
			Agent Dashboard
	</a>

			
	<ul className="dropdown-menu" data-bs-popper="none"
	>
			
	<li
	>
			 
			
	<a className="dropdown-item" href="agent-dashboard.html"
	>
			Dashboard
	</a>

	</li>

			
	<li
	>
			 
			
	<a className="dropdown-item" href="agent-listings.html"
	>
			Listings
	</a>

	</li>

			
	<li
	>
			 
			
	<a className="dropdown-item" href="agent-bookings.html"
	>
			Bookings
	</a>

	</li>

			
	<li
	>
			 
			
	<a className="dropdown-item" href="agent-activities.html"
	>
			Activities
	</a>

	</li>

			
	<li
	>
			 
			
	<a className="dropdown-item" href="agent-earnings.html"
	>
			Earnings
	</a>

	</li>

			
	<li
	>
			 
			
	<a className="dropdown-item" href="agent-reviews.html"
	>
			Reviews
	</a>

	</li>

			
	<li
	>
			 
			
	<a className="dropdown-item" href="agent-settings.html"
	>
			Settings
	</a>

	</li>

	</ul>

	</li>

			
	<li
	>
			 
			
	<a className="dropdown-item" href="admin-dashboard.html"
	>
	</a>

	</li>

	</ul>

	</li>

			
	<li className="nav-item dropdown"
	>
			
	<a className="nav-link" aria-expanded="false" aria-haspopup="true" data-bs-toggle="dropdown" href="#" id="advanceMenu"
	>
			
	<i className="fas fa-ellipsis-h"
	>
	</i>

	</a>

			
	<ul className="dropdown-menu min-w-auto" data-bs-popper="none"
	>
			
	<li
	>
			
	<a className="dropdown-item" href="https://support.webestica.com/" target="_blank"
	>
			Support
                
			
	<i className="text-warning fa-fw bi bi-life-preserver me-2"
	>
	</i>

	</a>

	</li>

			
	<li
	>
			
	<a className="dropdown-item" href="docs/index.html" target="_blank"
	>
			Documentation
                
			
	<i className="text-danger fa-fw bi bi-card-text me-2"
	>
	</i>

	</a>

	</li>

			
	<li
	>
			
	<hr className="dropdown-divider"
	>
	</hr>

	</li>

			
	<li
	>
			
	<a className="dropdown-item" href="https://booking.webestica.com/rtl/" target="_blank"
	>
			RTL demo
                
			
	<i className="text-info fa-fw bi bi-toggle-off me-2"
	>
	</i>

	</a>

	</li>

			
	<li
	>
			
	<a className="dropdown-item" href="https://themes.getbootstrap.com/store/webestica/" target="_blank"
	>
			Buy Booking!
                
			
	<i className="text-success fa-fw bi bi-cloud-download-fill me-2"
	>
	</i>

	</a>

	</li>

			
	<li
	>
			
	<hr className="dropdown-divider"
	>
	</hr>

	</li>

			
	<li
	>
			
	<a className="dropdown-item" href="docs/alerts.html" target="_blank"
	>
			Components
                
			
	<i className="text-orange fa-fw bi bi-puzzle-fill me-2"
	>
	</i>

	</a>

	</li>

	</ul>

	</li>

	</ul>

	</div>

			
	<ul className="nav flex-row align-items-center list-unstyled ms-xl-auto"
	>
			
	<li className="nav-item dropdown nav-search me-3 d-none d-sm-block"
	>
			
	<a className="nav-notification btn btn-light mb-0 p-0" aria-expanded="false" data-bs-auto-close="outside" data-bs-display="static" data-bs-toggle="dropdown" href="#" id="searchDropdown" role="button"
	>
			
	<i className="bi bi-search"
	>
			 
	</i>

	</a>

			
	<div className="dropdown-menu dropdown-animation dropdown-menu-end p-2" aria-labelledby="searchDropdown"
	>
			
	<div className="nav flex-nowrap align-items-center"
	>
			
	<div className="nav-item w-100"
	>
			
	<form className="input-group" method="get"
	>
			
	<input className="form-control border-primary" aria-label="Search" placeholder="Search..." type="search"
	>
	</input>

			
	<button className="btn btn-primary m-0" type="submit"
	>
			Search
	</button>

	</form>

	</div>

	</div>

	</div>

	</li>

			
	<li className="nav-item dropdown me-3"
	>
			
	<a className="nav-notification btn btn-light p-0 mb-0" aria-expanded="false" data-bs-auto-close="outside" data-bs-toggle="dropdown" href="#" role="button"
	>
			
	<i className="bi bi-bell fa-fw"
	>
	</i>

	</a>

			
	<div className="dropdown-menu dropdown-animation dropdown-menu-end dropdown-menu-size-md shadow-lg p-0"
	>
			
	<div className="card bg-transparent"
	>
			
	<div className="card-header bg-transparent d-flex justify-content-between align-items-center border-bottom"
	>
			
	<h6 className="m-0"
	>
	</h6>

			
	<a className="small" href="#"
	>
			Clear all
	</a>

	</div>

			
	<div className="card-body p-0"
	>
			
	<ul className="list-group list-group-flush list-unstyled p-2"
	>
			
	<li
	>
			
	<a className="list-group-item list-group-item-action rounded notif-unread border-0 mb-1 p-3" href="#"
	>
			
	<h6 className="mb-2"
	>
			New! Booking flights from New York ✈️
	</h6>

			
	<p className="mb-0 small"
	>
			Find the flexible ticket on flights around the world. Start searching today
	</p>

	</a>

	</li>

			
	<li
	>
			
	<a className="list-group-item list-group-item-action rounded border-0 mb-1 p-3" href="#"
	>
			
	<h6 className="mb-2"
	>
			Sunshine saving are here 🌞 save 30% or more on a stay
	</h6>

	</a>

	</li>

	</ul>

	</div>

			
	<div className="card-footer bg-transparent text-center border-top"
	>
			
	<a className="btn btn-sm btn-link mb-0 p-0" href="#"
	>
			See all incoming activity
	</a>

	</div>

	</div>

	</div>

	</li>

			
	<li className="nav-item dropdown"
	>
			
	<a className="avatar avatar-sm p-0" aria-expanded="false" data-bs-auto-close="outside" data-bs-display="static" data-bs-toggle="dropdown" href="#" id="profileDropdown" role="button"
	>
			
	<img className="avatar-img rounded-2" alt="avatar" src="assets/images/avatar/01.jpg"
	>
	</img>

	</a>

			
	<ul className="dropdown-menu dropdown-animation dropdown-menu-end shadow pt-3" aria-labelledby="profileDropdown"
	>
			
	<li className="px-3 mb-3"
	>
			
	<div className="d-flex align-items-center"
	>
			
	<div className="avatar me-3"
	>
			
	<img className="avatar-img rounded-circle shadow" alt="avatar" src="assets/images/avatar/01.jpg"
	>
	</img>

	</div>

			
	<div
	>
			
	<a className="h6 mt-2 mt-sm-0" href="#"
	>
			Lori Ferguson
	</a>

			
	<p className="small m-0"
	>
			example@gmail.com
	</p>

	</div>

	</div>

	</li>

			
	<li
	>
			
	<hr className="dropdown-divider"
	>
	</hr>

	</li>

			
	<li
	>
			
	<a className="dropdown-item" href="#"
	>
			My Bookings
			
	<i className="bi bi-bookmark-check fa-fw me-2"
	>
	</i>

	</a>

	</li>

			
	<li
	>
			
	<a className="dropdown-item" href="#"
	>
			My Wishlist
			
	<i className="bi bi-heart fa-fw me-2"
	>
	</i>

	</a>

	</li>

			
	<li
	>
			
	<a className="dropdown-item" href="#"
	>
			Settings
			
	<i className="bi bi-gear fa-fw me-2"
	>
	</i>

	</a>

	</li>

			
	<li
	>
			
	<a className="dropdown-item" href="#"
	>
			Help Center
			
	<i className="bi bi-info-circle fa-fw me-2"
	>
	</i>

	</a>

	</li>

			
	<li
	>
			
	<a className="dropdown-item bg-danger-soft-hover" href="#"
	>
			Sign Out
			
	<i className="bi bi-power fa-fw me-2"
	>
	</i>

	</a>

	</li>

			
	<li
	>
			
	<hr className="dropdown-divider"
	>
	</hr>

	</li>

			
	<li
	>
			
	<div className="modeswitch-wrap" id="darkModeSwitch"
	>
			
	<div className="modeswitch-item"
	>
			
	<div className="modeswitch-icon"
	>
	</div>

	</div>

	</div>

	</li>

	</ul>

	</li>

	</ul>

	</div>

	</nav>

	</header>

			
				
	<main id="igybe4"
	>
			
	<Component0CustomComponent className="pt-4 pt-md-5 pb-0" emit={runAction} componentDidMount={(e) => {
			var value = e.target.value; runAction({name: "GETALLPROPERTYIMAGES", payload: {getPropertyImagePropertyId:addImagesPropertyID}});
		}}
	>
			
	<div className="container"
	>
			
	<div className="row"
	>
			
	<div className="col-12 mx-auto text-center"
	>
			
	<img className="Image_15" id="iqw8vi" src="https://dittofipublicfiles.s3.us-west-2.amazonaws.com/2187/3377-3d logo w: shadow.png"
	>
	</img>

			
	<h1 className="fs-2 mb-2"
	>
			Add Property Images
	</h1>

			
	<p className="mb-0"
	>
			Let's get you listed! Start with some property details below
	</p>

	</div>

	</div>

	</div>

	</Component0CustomComponent>

			
	<section className="DivBlock_6" id="it8mok"
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
			
	<div className="toast" aria-atomic="true" aria-live="assertive" role="alert"
	>
			
	<div className="toast-body"
	>
			
                  Hello, world! This is a toast message.
                  
			
	<div className="mt-2 pt-2 border-top"
	>
			
	<button className="btn btn-primary btn-sm" type="button"
	>
			Take action
	</button>

			
	<button className="btn btn-secondary btn-sm" data-bs-dismiss="toast" type="button"
	>
			Close
	</button>

	</div>

	</div>

	</div>

	</div>

			
	<div className="card shadow"
	>
			
	<div className="card-header border-bottom"
	>
			
	<h5 className="mb-0"
	>
			Property Images
	</h5>

			
	<p className="mb-0" id="io5ibk"
	>
			Add images of your property!
	</p>

	</div>

			
	<div className="card-body shadow"
	>
			
	<div className="row g-3"
	>
			
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

			
	<label className="d-file-upload d-button" id="ikvyv3" onChange={(e) => {
			var value = e.target.value; runAction({name: "FILEUPLOAD", payload: {file:uploadFile,filePath:currentUser["first_name"],photosProperty_id:addImagesPropertyID,photosUserId:(0)}});
		}}
	>
			
	<input className="d-file-upload-input" id="iqd7b4" name="uploadFile" type="file" onChange={(e) => {
			var value = e.target.files.length > 0 ? e.target.files[0] : null; dispatch({type: "change_input", payload:{name: e.target.name, value }});
		}}
	>
	</input>

			
	<h6 className="Heading_9"
	>
			Click to upload images
	</h6>

	</label>

	</div>

			
	<div className="dz-preview row g-4"
	>
			
	<div className="d-row" id="imrvj3" layout="6/6"
	>
			
<Fragment>
{ Array.isArray(getAllPropertyImagesEPR) && getAllPropertyImagesEPR.map((row, index) => { return (
	<div className="d-col d-col-3 d-col-tiny-3 d-col-small-3 d-col-medium-3" id="iqa1yn"
	>
			
	<div className="DivBlock_20" id="ie8ers" onClick={(e) => {
			var value = e.target.value; runAction({name: "DELETEPHOTO", payload: {deletePhotoPropertyId:row["property_id"]}});
		}}
	>
			
	<i className="position-absolute fas fa-times"
	>
	</i>

	</div>

			
	<div className="DivBlock_19" id="i012zk"
	>
			
<Fragment>
{ getAllPropertyImagesEPR &&
<Fragment>
{ Array.isArray(row["file"]) && row["file"].map((row, index) => { return (
	<img className="Image_16" id="ijxk14" src={"https://" + row["url"]}
	>
	</img> )})}</Fragment>}</Fragment>

	</div>

	</div> )})}</Fragment>

	</div>

			
<Fragment>
{ Loading &&
	<div id="iqoca4"
	>
			
	<div d-partial-id="1270" id="ihvfih"
	>
			
	<div className="spinner-border" id="idt6zs" role="status"
	>
			
	<span className="visually-hidden"
	>
			Loading...
	</span>

	</div>

			
	<div className="spinner-grow" id="ibshfm" role="status"
	>
			
	<span className="visually-hidden"
	>
			Loading...
	</span>

	</div>

	</div>

	</div>}</Fragment>

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

			
	<div className="text-end"
	>
			
	<div className="btn btn-success" id="iixa2a" onClick={(e) => {
			var value = e.target.value; runAction({name: "GOADDLISTINGS", payload: {addListingsPropertyId:addImagesPropertyID}});
		}}
	>
	</div>

	</div>

	</div>

	</div>

	</div>

			
	<div className="toast" aria-atomic="true" aria-live="assertive" role="alert"
	>
			
	<div className="toast-body"
	>
			
                Hello, world! This is a toast message.
                
			
	<div className="mt-2 pt-2 border-top"
	>
			
	<button className="btn btn-primary btn-sm" type="button"
	>
			Take action
	</button>

			
	<button className="btn btn-secondary btn-sm" data-bs-dismiss="toast" type="button"
	>
			Close
	</button>

	</div>

	</div>

	</div>

	</form>

	</div>

	</div>

	</div>

	</section>

	</main>

			
				
	<footer className="bg-dark p-3"
	>
			
	<div className="container"
	>
			
	<div className="row align-items-center"
	>
			
	<div className="col-md-4"
	>
			
	<div className="text-center text-md-start mb-3 mb-md-0"
	>
			
	<a href="index.html"
	>
			 
			
	<img className="h-30px" alt="logo" src="assets/images/logo-light.svg"
	>
	</img>

	</a>

	</div>

	</div>

			
	<div className="col-md-4"
	>
			
	<div className="text-white text-primary-hover"
	>
			. All rights reserved. 
			
	<a className="text-white" href="#"
	>
			©2022 Booking
	</a>

	</div>

	</div>

			
	<div className="col-md-4"
	>
			
	<ul className="list-inline mb-0 text-center text-md-end"
	>
			
	<li className="list-inline-item ms-2"
	>
			
	<a href="#"
	>
			
	<i className="text-white fab fa-facebook"
	>
	</i>

	</a>

	</li>

			
	<li className="list-inline-item ms-2"
	>
			
	<a href="#"
	>
			
	<i className="text-white fab fa-instagram"
	>
	</i>

	</a>

	</li>

			
	<li className="list-inline-item ms-2"
	>
			
	<a href="#"
	>
			
	<i className="text-white fab fa-linkedin-in"
	>
	</i>

	</a>

	</li>

			
	<li className="list-inline-item ms-2"
	>
			
	<a href="#"
	>
			
	<i className="text-white fab fa-twitter"
	>
	</i>

	</a>

	</li>

	</ul>

	</div>

	</div>

	</div>

	</footer>

			
				
	<div className="back-top"
	>
	</div>

			
		</ErrorBoundary>
	);
}

const mapStateToProps = function(state){
    return state.reducer
}

export default connect(mapStateToProps, null) ( Container );