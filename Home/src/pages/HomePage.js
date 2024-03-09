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
		<div {...props}>
			{props.children}
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
			currentUser,
			isLoggedIn,
			isNotLoggedIn,
			row,
	} = props;

	const [tasks, setTasks] = useState({});

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
				params: { 
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
			
				
	<header className="header-transparent"
	>
			
	<nav className="navbar navbar-dark navbar-expand-xl"
	>
			
	<div className="container"
	>
			
	<a className="navbar-brand" href="index.html"
	>
			
	<img className="navbar-brand-item" alt="logo" src="assets/images/logo-light.svg"
	>
	</img>

	</a>

			
	<button className="navbar-toggler ms-auto me-3 p-0" aria-controls="navbarCollapse" aria-expanded="false" aria-label="Toggle navigation" data-bs-target="#navbarCollapse" data-bs-toggle="collapse" type="button"
	>
	</button>

			
	<div className="navbar-collapse collapse" id="navbarCollapse"
	>
			
	<ul className="navbar-nav navbar-nav-scroll mx-auto"
	>
			
	<li className="nav-item dropdown"
	>
			
	<a className="nav-link dropdown-toggle" aria-expanded="false" aria-haspopup="true" data-bs-toggle="dropdown" href="#" id="listingMenu-3"
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
			
	<a className="nav-link dropdown-toggle" aria-expanded="false" aria-haspopup="true" data-bs-toggle="dropdown" href="#" id="pagesMenu-3"
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

			
	<li className="nav-item"
	>
			 
			
	<a className="nav-link" href="#"
	>
			Contact us
	</a>

	</li>

			
	<li className="nav-item"
	>
			 
			
	<a className="nav-link" href="#"
	>
			About us
	</a>

	</li>

			
	<li className="nav-item dropdown"
	>
			
	<a className="nav-link" aria-expanded="false" aria-haspopup="true" data-bs-toggle="dropdown" href="#" id="advanceMenu-3"
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
			
	<li className="nav-item dropdown ms-0 ms-md-3"
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

			
	<li className="nav-item ms-3 dropdown"
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

			
				
	<main id="imnm64"
	>
			
	<header className="navbar-light header-sticky"
	>
			
	<nav className="navbar navbar-expand-xl"
	>
			
	<Component0CustomComponent className="container" emit={runAction} componentDidMount={(e) => {
			var value = e.target.value; runAction({name: "GETVISITOR"});
		}}
	>
			
	<Link className="navbar-brand" to="/" type="spa"
	>
			
	<img className="light-mode-item navbar-brand-item" alt="logo" src="https://dittofipublicfiles.s3.us-west-2.amazonaws.com/2187/3378-logo_horizontal.png"
	>
	</img>

			
	<img className="dark-mode-item navbar-brand-item" alt="logo" src="assets/images/logo-light.svg"
	>
	</img>

	</Link>

			
	<button className="navbar-toggler ms-auto ms-sm-0 p-0 p-sm-2" aria-controls="navbarCollapse" aria-expanded="false" aria-label="Toggle navigation" data-bs-target="#navbarCollapse" data-bs-toggle="collapse" type="button"
	>
	</button>

			
	<button className="navbar-toggler ms-sm-auto mx-3 me-md-0 p-0 p-sm-2" aria-controls="navbarCategoryCollapse" aria-expanded="false" aria-label="Toggle navigation" data-bs-target="#navbarCategoryCollapse" data-bs-toggle="collapse" type="button"
	>
			
	<i className="bi bi-grid-3x3-gap-fill fa-fw"
	>
	</i>

	</button>

			
	<div className="d-nav d--closed" data-collapse="small" id="inb4l9j-2" type="dropdown"
	>
			
	<li className="nav-item dropdown"
	>
			
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

	</div>

			
	<div className="navbar-collapse collapse" id="navbarCollapse-2-2"
	>
			
	<ul className="navbar-nav navbar-nav-scroll me-auto"
	>
			
	<li className="nav-item dropdown"
	>
			
	<a className="nav-link" aria-expanded="false" aria-haspopup="true" data-bs-toggle="dropdown" href="" id="listingMenu-2-2"
	>
			About
	</a>

			
	<ul className="dropdown-menu" aria-labelledby="listingMenu"
	>
			
	<li className="dropdown-submenu dropend"
	>
			
	<a className="dropdown-item" href="#"
	>
			Partners
	</a>

			
	<ul className="dropdown-menu" data-bs-popper="none"
	>
			
	<li
	>
			 
			
	<a className="dropdown-item" href="index.html"
	>
			Picture Perfect Properties
	</a>

	</li>

			
	<li
	>
			 
			
	<a className="dropdown-item" href="index-hotel-chain.html"
	>
			Gathering Grounds
	</a>

	</li>

			
	<li
	>
			 
			
	<a className="dropdown-item" href="index-resort.html"
	>
			Backyard Birding
	</a>

	</li>

			
	<li
	>
			 
			
	<a className="dropdown-item" href="hotel-grid.html"
	>
			Park at my Place
	</a>

	</li>

			
	<li
	>
			 
	</li>

			
	<li
	>
			 
	</li>

			
	<li
	>
			 
	</li>

			
	<li
	>
			 
	</li>

	</ul>

	</li>

			
	<li className="dropdown-submenu dropend"
	>
			
	<a className="dropdown-item" href="#"
	>
			Mission
	</a>

	</li>

			
	<li className="dropdown-submenu dropend"
	>
			
	<a className="dropdown-item" href="#"
	>
			Contact
	</a>

	</li>

			
	<li className="dropdown-submenu dropend"
	>
			
	<a className="dropdown-item" href="#"
	>
			About us
	</a>

	</li>

			
	<li className="dropdown-submenu dropend"
	>
			
	<a className="dropdown-item" href="#"
	>
			Blog
	</a>

	</li>

			
	<li className="dropdown-submenu dropend"
	>
			
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
			 
	</li>

			
	<li
	>
			 
	</li>

			
	<li
	>
			 
	</li>

			
	<a className="dropdown-item" href="#help_center"
	>
			Help Center
	</a>

	</ul>

	</li>

			
	<li className="nav-item"
	>
			
	<Link className="nav-link" aria-expanded="false" aria-haspopup="true" data-bs-toggle="dropdown" id="pagesMenu-2-2" target="_self" to="/howitworks" type="spa"
	>
			How it works
	</Link>

			
	<ul className="dropdown-menu" aria-labelledby="pagesMenu"
	>
			
	<li
	>
			 
			
	<a className="dropdown-item" href="#/howitworks" target="_self"
	>
			How it works
	</a>

	</li>

			
	<li
	>
			 
			
	<a className="dropdown-item" href="contact.html"
	>
			Get started
	</a>

	</li>

			
	<li
	>
			 
			
	<Link className="dropdown-item" target="_self" to="/addlisting" type="spa"
	>
			Create a listing 
	</Link>

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
			
	<a className="nav-link" aria-expanded="false" aria-haspopup="true" data-bs-toggle="dropdown" id="accounntMenu-3" type="pagesection" onClick={(e) => {
			var value = e.target.value; 
						var element = document.getElementById("");
						if(element) {
							element.scrollIntoView({ block: 'end',  behavior: 'smooth' });
						}
					
		}}
	>
			Accounts
	</a>

			
	<ul className="dropdown-menu" aria-labelledby="accounntMenu"
	>
			
	<li className="dropdown-submenu dropend"
	>
			
	<Link className="dropdown-item" to="/host-dashboard" type="spa"
	>
			My dashboard
	</Link>

	</li>

			
	<li className="dropdown-submenu dropend"
	>
			
	<a className="dropdown-item" href="#"
	>
			Sign in
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
			Sign Up
	</a>

	</li>

	</ul>

	</li>

			
	<li className="nav-item dropdown"
	>
			
	<a className="nav-link" aria-expanded="false" aria-haspopup="true" data-bs-toggle="dropdown" href="" id="advanceMenu-2-2"
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

			
	<div className="navbar-collapse collapse" id="navbarCategoryCollapse-3"
	>
			
	<ul className="navbar-nav navbar-nav-scroll nav-pills-primary-soft text-center ms-auto p-2 p-xl-0"
	>
			
	<li className="nav-item"
	>
			 
	</li>

			
	<li className="nav-item"
	>
			 
	</li>

			
	<li className="nav-item"
	>
			 
	</li>

			
	<li className="nav-item"
	>
			 
			
<Fragment>
{ isNotLoggedIn &&
	<Link className="nav-link" to="/register" type="spa"
	>
			Sign Up
	</Link>}</Fragment>

	</li>

			
<Fragment>
{ isNotLoggedIn &&
	<Link className="nav-link" target="_self" to="/login" type="spa"
	>
			Sign In
	</Link>}</Fragment>

			
<Fragment>
{ isLoggedIn &&
	<a className="nav-link" href="" onClick={(e) => {
			var value = e.target.value; runAction({name: "LOGOUT"});
		}}
	>
			Log out
	</a>}</Fragment>

	</ul>

	</div>

			
	<ul className="nav flex-row align-items-center list-unstyled ms-xl-auto"
	>
			
	<li className="nav-item dropdown ms-0 ms-md-3"
	>
			
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

			
	<li className="nav-item ms-3 dropdown"
	>
			
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
			
	<div className="modeswitch-wrap" id="darkModeSwitch-2-2"
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

			
<Fragment>
{ isLoggedIn &&
<Fragment>
{ Array.isArray(currentUser) && currentUser.map((row, index) => { return (
	<Component0CustomComponent className="avatar avatar-xl mb-2 mb-sm-0" emit={runAction} componentDidMount={(e) => {
			var value = e.target.value; runAction({name: "GETUSERS"});
		}}
	>
			
<Fragment>
{ Array.isArray(currentUser["profile_picture"]) && currentUser["profile_picture"].map((row, index) => { return (
	<img className="avatar-img rounded-circle" alt="" src={"https://" + row["url"]}
	>
	</img> )})}</Fragment>

	</Component0CustomComponent> )})}</Fragment>}</Fragment>

	</Component0CustomComponent>

	</nav>

	</header>

			
	<main id="ijddvv"
	>
			
	<section className="pt-3 pt-lg-5"
	>
			
	<div className="container"
	>
			
	<div className="row g-4 g-lg-5"
	>
			
	<div className="col-lg-6 position-relative mb-4 mb-md-0"
	>
			
	<h2 className="mb-4 mt-md-5 display-5"
	>
			Monetize your land 
			
	<div id="icm8fs"
	>
	</div>

	</h2>

			
	<p className="mb-4"
	>
			Take control of your land and start making passive income!
	</p>

			
	<div className="hstack gap-4 flex-wrap align-items-center"
	>
			
	<Link className="btn mb-0 btn-success" to="/howitworks" type="spa"
	>
			Discover Now
	</Link>

			
	<a className="d-block" data-gallery="office-tour" data-glightbox="" href="https://www.youtube.com/embed/tXHviS-4ygo" id="i262gj"
	>
			
	<div className="avatar avatar-md z-index-1 position-relative me-2"
	>
			
	<img className="avatar-img rounded-circle" alt="avatar" src="https://dittofipublicfiles.s3.us-west-2.amazonaws.com/2187/3369-IMG_7574.jpg"
	>
	</img>

			
	<div className="btn btn-xs btn-round btn-white shadow-sm position-absolute top-50 start-50 translate-middle z-index-9 mb-0"
	>
			
	<i className="fas fa-play"
	>
	</i>

	</div>

	</div>

			
	<div className="align-middle d-inline-block"
	>
			
	<h6 className="fw-normal small mb-0"
	>
			Watch our story
	</h6>

	</div>

	</a>

	</div>

	</div>

			
	<div className="col-lg-6 position-relative"
	>
			
	<img className="rounded shadow" alt="" id="itjx4t" src="https://dittofipublicfiles.s3.us-west-2.amazonaws.com/2187/3570-farmer_hero_shot.png"
	>
	</img>

			
	<div className="position-absolute top-0 end-0 z-index-1 mt-n4"
	>
			
	<div className="bg-blur border border-light rounded-3 text-center shadow-lg p-3"
	>
			
	<i className="bi bi-headset text-danger fs-3"
	>
	</i>

			
	<h5 className="text-dark mb-1"
	>
			
	<a className="link" href=""
	>
			24 / 7
	</a>

	</h5>

			
	<h6 className="text-dark fw-light small mb-0"
	>
			
	<a className="link" href=""
	>
			Personal Support
	</a>

	</h6>

	</div>

	</div>

			
	<div className="vstack gap-5 align-items-center position-absolute top-0 start-0 d-none d-md-flex mt-4 ms-n3"
	>
			
	<img className="icon-lg shadow-lg border border-3 border-white rounded-circle" alt="avatar" src="https://dittofipublicfiles.s3.us-west-2.amazonaws.com/2187/3369-IMG_7574.jpg"
	>
	</img>

			
	<img className="icon-xl shadow-lg border border-3 border-white rounded-circle" alt="avatar" src="https://dittofipublicfiles.s3.us-west-2.amazonaws.com/2187/3568-1.png"
	>
	</img>

	</div>

	</div>

	</div>

	</div>

	</section>

			
	<section className="pb-2 pb-lg-5"
	>
			
	<div className="d-row" id="ixmeh9o" layout="3/3/3/3"
	>
			
	<div className="d-col d-col-medium-12 d-col-small-12 d-col-tiny-12 d-col-3"
	>
			
	<div className="card border rounded-3 overflow-hidden"
	>
			
	<div className="row g-0"
	>
			
	<div className="col-sm-6"
	>
			
	<img className="card-img rounded-0" alt="" src="https://dittofipublicfiles.s3.us-west-2.amazonaws.com/2187/4663-12.png"
	>
	</img>

	</div>

			
	<div className="col-sm-6"
	>
			
	<div className="px-3" id="irmj6cx"
	>
			
	<h6 className="card-title"
	>
			
	<a href="offer-detail.html"
	>
			No contracts, leases, or fees
	</a>

	</h6>

			
	<p className="mb-0"
	>
			You will never be bound to a long contract or lease, you can opt out at anytime, free of charge!
	</p>

	</div>

	</div>

	</div>

	</div>

	</div>

			
	<div className="d-col d-col-medium-12 d-col-small-12 d-col-tiny-12 d-col-3" id="iedjep"
	>
			
	<div className="card border rounded-3 overflow-hidden"
	>
			
	<div className="row g-0"
	>
			
	<div className="col-sm-6" id="i8awkb5"
	>
			
	<img alt="" id="iuc1id8" src="https://dittofipublicfiles.s3.us-west-2.amazonaws.com/2187/4664-no contracts mock up.png"
	>
	</img>

	</div>

			
	<div className="col-sm-6"
	>
			
	<div className="px-3" id="ixokn4"
	>
			
	<p className="Paragraph_8" id="ivzs14"
	>
	</p>

	</div>

			
	<div className="px-3" id="id1zwgt"
	>
			
	<h6 className="card-title"
	>
			
	<a href="offer-detail.html" id="icnmt7u"
	>
			Full control 
	</a>

	</h6>

			
	<p className="mb-0"
	>
			You set the price, rules, time frames, activities allowed, guest limit, etc. If you don't want anyone to access your property during a certain period of time, you don't have to!
	</p>

	</div>

	</div>

	</div>

	</div>

	</div>

			
	<div className="d-col d-col-medium-12 d-col-small-12 d-col-tiny-12 d-col-3" id="ib74l81"
	>
			
	<div className="rounded-3 border"
	>
			
	<div className="card border rounded-3 overflow-hidden"
	>
			
	<div className="row g-0"
	>
			
	<div className="col-sm-6" id="iu6yd46"
	>
			
	<img alt="" id="iq8ohc6" src="https://dittofipublicfiles.s3.us-west-2.amazonaws.com/2187/4665-acct manager mock up.png"
	>
	</img>

	</div>

			
	<div className="col-sm-6"
	>
			
	<div className="px-3"
	>
			
	<h6 className="card-title"
	>
			Dedicated Account Manager
	</h6>

			
	<p className="mb-0"
	>
			Have a stress free experience with your own dedicated account manager.  
	</p>

	</div>

	</div>

	</div>

	</div>

	</div>

	</div>

			
	<div className="d-col d-col-medium-12 d-col-small-12 d-col-tiny-12 d-col-3"
	>
			
	<div className="card border rounded-3 overflow-hidden"
	>
			
	<div className="row g-0"
	>
			
	<div className="col-sm-6" id="ix70ky"
	>
			
	<img alt="" id="ikph3r" src="https://dittofipublicfiles.s3.us-west-2.amazonaws.com/2187/4666-earning mock up potenital.png"
	>
	</img>

	</div>

			
	<div className="col-sm-6"
	>
			
	<div className="px-3"
	>
			
	<h6 className="card-title"
	>
			
	<a href="offer-detail.html" id="ibxltg"
	>
			Unlimited Earning Potential
	</a>

	</h6>

			
	<p className="mb-0"
	>
			The sky is the limit!
	</p>

	</div>

	</div>

	</div>

	</div>

	</div>

	</div>

	</section>

			
	<section className="pb-0 pb-xl-5"
	>
			
	<div className="container"
	>
			
	<div className="row g-4 justify-content-between align-items-center"
	>
			
	<div className="col-lg-5 position-relative"
	>
			
	<img className="rounded-3 position-relative" alt="" src="https://dittofipublicfiles.s3.us-west-2.amazonaws.com/2187/3567-2.png"
	>
	</img>

	</div>

			
	<div className="col-lg-6"
	>
			
	<h2 className="mb-3 mb-lg-5"
	>
			The value you deserve. 
	</h2>

			
	<p className="mb-3 mb-lg-5"
	>
			Book your hotel with us and don't forget to grab an awesome hotel deal to save massive on your stay.
	</p>

			
	<div className="row g-4"
	>
			
	<div className="col-sm-6"
	>
			
	<img id="iec2p2g" src="https://dittofipublicfiles.s3.us-west-2.amazonaws.com/2187/4677-14.png"
	>
	</img>

			
	<h5 className="mt-2"
	>
			Personal Dashboard
	</h5>

			
	<p className="mb-0"
	>
			Departure defective arranging rapturous did. Conduct denied adding worthy little.
	</p>

	</div>

			
	<div className="col-sm-6"
	>
			
	<img id="ifpoxmr" src="https://dittofipublicfiles.s3.us-west-2.amazonaws.com/2187/4676-15.png"
	>
	</img>

			
	<h5 className="mt-2"
	>
			Free Account and Listings 
	</h5>

			
	<p className="mb-0"
	>
			Supposing so be resolving breakfast am or perfectly. 
	</p>

	</div>

			
	<div className="col-sm-6"
	>
			
	<img id="i5n7ych" src="https://dittofipublicfiles.s3.us-west-2.amazonaws.com/2187/4678-16.png"
	>
	</img>

			
	<h5 className="mt-2"
	>
			1 property...endless listings
	</h5>

			
	<p className="mb-0"
	>
			Arranging rapturous did believe him all had supported. 
	</p>

	</div>

			
	<div className="col-sm-6"
	>
			
	<img id="io25p68" src="https://dittofipublicfiles.s3.us-west-2.amazonaws.com/2187/4679-13.png"
	>
	</img>

			
	<h5 className="mt-2"
	>
			24/7 support
	</h5>

			
	<p className="mb-0"
	>
			Rapturous did believe him all had supported.
	</p>

	</div>

	</div>

	</div>

	</div>

	</div>

	</section>

			
	<section className="DivBlock" id="izyidtr"
	>
			
	<div className="container"
	>
			 
			
	<div className="row mb-4"
	>
			
	<div className="col-12 text-center"
	>
			
	<h2 className="mb-0" id="io8hwu"
	>
			Our Partners
	</h2>

	</div>

	</div>

			
	<div className="row g-4"
	>
			
	<div className="col-sm-6 col-xl-3"
	>
			
	<div className="card card-img-scale overflow-hidden bg-transparent"
	>
			
	<div className="card-img-scale-wrapper rounded-3"
	>
			
	<img className="card-img" alt="hotel image" src="https://dittofipublicfiles.s3.us-west-2.amazonaws.com/2187/3505-5.png"
	>
	</img>

	</div>

			
	<div className="card-body px-2"
	>
			
	<h5 className="card-title"
	>
			
	<a className="stretched-link" href="hotel-detail.html"
	>
			Park At My Place
	</a>

	</h5>

	</div>

	</div>

	</div>

			
	<div className="col-sm-6 col-xl-3"
	>
			
	<div className="card card-img-scale overflow-hidden bg-transparent"
	>
			
	<div className="card-img-scale-wrapper rounded-3"
	>
			
	<img className="card-img" alt="hotel image" src="https://dittofipublicfiles.s3.us-west-2.amazonaws.com/2187/3503-3.png"
	>
	</img>

	</div>

			
	<div className="card-body px-2"
	>
			
	<h5 className="card-title"
	>
			Picture Perfect Properties
	</h5>

	</div>

	</div>

	</div>

			
	<div className="col-sm-6 col-xl-3"
	>
			
	<div className="card card-img-scale overflow-hidden bg-transparent"
	>
			
	<div className="card-img-scale-wrapper rounded-3"
	>
			
	<img className="card-img" alt="hotel image" src="https://dittofipublicfiles.s3.us-west-2.amazonaws.com/2187/3504-2.png"
	>
	</img>

	</div>

			
	<div className="card-body px-2"
	>
			
	<h5 className="card-title"
	>
			Gathering Grounds
	</h5>

	</div>

	</div>

	</div>

			
	<div className="col-sm-6 col-xl-3"
	>
			
	<div className="card card-img-scale overflow-hidden bg-transparent"
	>
			
	<div className="card-img-scale-wrapper rounded-3"
	>
			
	<img className="card-img" alt="hotel image" src="https://dittofipublicfiles.s3.us-west-2.amazonaws.com/2187/3506-4.png"
	>
	</img>

	</div>

			
	<div className="card-body px-2"
	>
			
	<h5 className="card-title"
	>
			Backyard Birding
	</h5>

	</div>

	</div>

	</div>

	</div>

	</div>

	</section>

			
	<section className="container" id="i6zui0u"
	>
			
	<div id="i1xbwp7"
	>
			 
			
	<div className="row mb-4"
	>
			
	<div className="col-12 text-center"
	>
			
	<h2 className="mb-0" id="i0q5k4r"
	>
			States our landowners serve 
	</h2>

	</div>

	</div>

			
	<div className="row g-4 g-md-5"
	>
			
	<div className="col-6 col-sm-4 col-lg-3 col-xl-2"
	>
			
	<div className="card bg-transparent text-center p-1 h-100"
	>
			
	<img className="rounded-circle" alt="" src="https://dittofipublicfiles.s3.us-west-2.amazonaws.com/2187/3379-2.png"
	>
	</img>

			
	<div className="card-body p-0 pt-3"
	>
			
	<h5 className="card-title"
	>
			
	<a className="stretched-link" href="#"
	>
			Texas
	</a>

	</h5>

	</div>

	</div>

	</div>

			
	<div className="col-6 col-sm-4 col-lg-3 col-xl-2"
	>
			
	<div className="card bg-transparent text-center p-1 h-100"
	>
			
	<img className="rounded-circle" alt="" src="https://dittofipublicfiles.s3.us-west-2.amazonaws.com/2187/3431-1.png"
	>
	</img>

			
	<div className="card-body p-0 pt-3"
	>
			
	<h5 className="card-title"
	>
			
	<a className="stretched-link" href="#"
	>
			Ohio
	</a>

	</h5>

	</div>

	</div>

	</div>

			
	<div className="col-6 col-sm-4 col-lg-3 col-xl-2"
	>
			
	<div className="card bg-transparent text-center p-1 h-100"
	>
			
	<img alt="" id="i4ka8gh" src="https://dittofipublicfiles.s3.us-west-2.amazonaws.com/2187/3559-5.png"
	>
	</img>

			
	<div className="card-body p-0 pt-3"
	>
			
	<h5 className="card-title"
	>
			
	<a className="stretched-link" href="#"
	>
			Pennsylvania
	</a>

	</h5>

	</div>

	</div>

	</div>

			
	<div className="col-6 col-sm-4 col-lg-3 col-xl-2"
	>
			
	<div className="card bg-transparent text-center p-1 h-100"
	>
			
	<img className="rounded-circle" alt="" src="https://dittofipublicfiles.s3.us-west-2.amazonaws.com/2187/3432-4.png"
	>
	</img>

			
	<div className="card-body p-0 pt-3"
	>
			
	<h5 className="card-title"
	>
			
	<a className="stretched-link" href="#"
	>
			Georgia
	</a>

	</h5>

	</div>

	</div>

	</div>

			
	<div className="col-6 col-sm-4 col-lg-3 col-xl-2"
	>
			
	<div className="card bg-transparent text-center p-1 h-100"
	>
			
	<img alt="" id="i00iqaf" src="https://dittofipublicfiles.s3.us-west-2.amazonaws.com/2187/3560-6.png"
	>
	</img>

			
	<div className="card-body p-0 pt-3"
	>
			
	<h5 className="card-title"
	>
			
	<a className="stretched-link" href="#"
	>
			Colorado
	</a>

	</h5>

	</div>

	</div>

	</div>

			
	<div className="col-6 col-sm-4 col-lg-3 col-xl-2"
	>
			
	<div className="card bg-transparent text-center p-1 h-100"
	>
			
	<img className="rounded-circle" alt="" src="https://dittofipublicfiles.s3.us-west-2.amazonaws.com/2187/3561-7.png"
	>
	</img>

			
	<div className="card-body p-0 pt-3"
	>
			
	<h5 className="card-title"
	>
			
	<a className="stretched-link" href="#"
	>
			New York
	</a>

	</h5>

	</div>

	</div>

	</div>

			
	<div className="col-6 col-sm-4 col-lg-3 col-xl-2"
	>
			
	<div className="card bg-transparent text-center p-1 h-100"
	>
			
	<img className="rounded-circle" alt="" src="https://dittofipublicfiles.s3.us-west-2.amazonaws.com/2187/3562-8.png"
	>
	</img>

			
	<div className="card-body p-0 pt-3"
	>
			
	<h5 className="card-title"
	>
			
	<a className="stretched-link" href="#"
	>
			New Jersey
	</a>

	</h5>

	</div>

	</div>

	</div>

			
	<div className="col-6 col-sm-4 col-lg-3 col-xl-2"
	>
			
	<div className="card bg-transparent text-center p-1 h-100"
	>
			
	<img className="rounded-circle" alt="" src="https://dittofipublicfiles.s3.us-west-2.amazonaws.com/2187/3563-9.png"
	>
	</img>

			
	<div className="card-body p-0 pt-3"
	>
			
	<h5 className="card-title"
	>
			
	<a className="stretched-link" href="#"
	>
			Utah
	</a>

	</h5>

	</div>

	</div>

	</div>

			
	<div className="col-6 col-sm-4 col-lg-3 col-xl-2"
	>
			
	<div className="card bg-transparent text-center p-1 h-100"
	>
			
	<img className="rounded-circle" alt="" src="https://dittofipublicfiles.s3.us-west-2.amazonaws.com/2187/3564-10.png"
	>
	</img>

			
	<div className="card-body p-0 pt-3"
	>
			
	<h5 className="card-title"
	>
			
	<a className="stretched-link" href="#"
	>
			Arizona
	</a>

	</h5>

	</div>

	</div>

	</div>

			
	<div className="col-6 col-sm-4 col-lg-3 col-xl-2"
	>
			
	<div className="card bg-transparent text-center p-1 h-100"
	>
			
	<img className="rounded-circle" alt="" src="https://dittofipublicfiles.s3.us-west-2.amazonaws.com/2187/3433-3.png"
	>
	</img>

			
	<div className="card-body p-0 pt-3"
	>
			
	<h5 className="card-title"
	>
			
	<a className="stretched-link" href="#" id="izdcdvv"
	>
			Tennessee
	</a>

	</h5>

	</div>

	</div>

	</div>

			
	<div className="col-6 col-sm-4 col-lg-3 col-xl-2"
	>
			
	<div className="card bg-transparent text-center p-1 h-100"
	>
			
	<img alt="" id="im403y3" src="https://dittofipublicfiles.s3.us-west-2.amazonaws.com/2187/3565-11.png"
	>
	</img>

			
	<div className="card-body p-0 pt-3"
	>
			
	<h5 className="card-title"
	>
			
	<a className="stretched-link" href="#"
	>
			Washington
	</a>

	</h5>

	</div>

	</div>

	</div>

			
	<div className="col-6 col-sm-4 col-lg-3 col-xl-2"
	>
			
	<div className="card bg-transparent text-center p-1 h-100"
	>
			
	<img alt="" id="i63ew4i" src="https://dittofipublicfiles.s3.us-west-2.amazonaws.com/2187/3566-12.png"
	>
	</img>

			
	<div className="card-body p-0 pt-3"
	>
			
	<h5 className="card-title"
	>
			
	<a className="stretched-link" href="#"
	>
			Indiana
	</a>

	</h5>

	</div>

	</div>

	</div>

	</div>

	</div>

	</section>

			
	<section className="pt-3 pt-lg-5"
	>
			
	<div className="container"
	>
			
	<div className="row g-4 g-lg-5"
	>
			
	<div className="col-lg-6 position-relative mb-4 mb-md-0"
	>
			
	<h1 id="i6ggvyl"
	>
			Refer & Earn $100 For Every Friend Who List's!
	</h1>

			
	<h2 className="mb-4 mt-md-5 display-5"
	>
			
	<div data-highlightable="1" draggable="true" id="ijgmhpl"
	>
	</div>

			
	<div data-highlightable="1" draggable="true" id="ijgmhpl-2"
	>
	</div>

	</h2>

			
	<p className="mb-4"
	>
			Share this opportunity with a friend and get paid!
	</p>

			
	<Link className="btn mb-0 btn-success" to="/howitworks" type="spa"
	>
			Learn More
	</Link>

	</div>

			
	<div className="col-lg-6 rounded" id="i8g22w1"
	>
	</div>

	</div>

	</div>

	</section>

			
	<section className="bg-light" id="i58dit8"
	>
			
	<div className="container"
	>
			
	<div className="row g-4" id="isxf4l6"
	>
			
	<div className="col-md-6 col-xxl-4"
	>
			
	<div className="bg-body d-flex rounded-3 h-100 p-4"
	>
			
	<h3 id="irh2bub"
	>
			
	<i className="fa-solid fa-hand-holding-heart fas fa-check-square" aria-hidden="true" data-highlightable="1" draggable="true" id="ioqr81q"
	>
	</i>

	</h3>

			
	<div className="ms-3" id="i2mhp2x"
	>
			
	<h5 id="ih0ue1x"
	>
			Customer Support
	</h5>

			
	<p className="mb-0" id="i4gavn1"
	>
			If we fall short of your 
                
	</p>

			
	<div draggable="true" id="i2lbnek"
	>
			expectation in any way, let us know
	</div>

	</div>

	</div>

	</div>

			
	<div className="col-md-6 col-xxl-4"
	>
			
	<div className="bg-body d-flex rounded-3 h-100 p-4" id="ivwriy5"
	>
			
	<h3 id="ij6xl8h"
	>
			
	<i className="fa-solid fa-hand-holding-usd fas fa-check-square"
	>
	</i>

	</h3>

			
	<div className="ms-3" id="isxt21r"
	>
			
	<h5 id="iu4pnza"
	>
			Payment Trust
	</h5>

			
	<p className="mb-0" id="iv4ciws"
	>
			
                
	</p>

			
	<div draggable="true" id="ivvt8ao"
	>
	</div>

			
	<div draggable="true" id="ija6gpm"
	>
	</div>

	</div>

	</div>

	</div>

			
	<div className="col-lg-6 col-xl-5 col-xxl-3 ms-xxl-auto" id="ivvl9ar"
	>
			
	<h5 className="mb-4"
	>
			Proud partner of Pledge 1%
	</h5>

			
	<div className="row g-3"
	>
			
	<div className="col-6 col-sm-4 col-md-3 col-lg-6"
	>
			
	<a href="#"
	>
			 
			
	<img alt="" id="ivkaw8v" src="https://dittofipublicfiles.s3.us-west-2.amazonaws.com/2187/3393-PledgeOneLogo1.jpeg"
	>
	</img>

	</a>

	</div>

	</div>

	</div>

	</div>

	</div>

	</section>

	</main>

			
	<footer className="bg-dark pt-5"
	>
			
	<div className="container"
	>
			
	<div className="row mb-4" id="iz9yg2u"
	>
			
	<div className="col-lg-3"
	>
			
	<a href="index.html"
	>
	</a>

			
	<p className="my-3 text-muted"
	>
			Acre Access is a platform for landowners to easily manage and monetize their land without losing control of their property.
	</p>

			
	<p className="mb-2"
	>
			 
			
	<a className="text-muted text-primary-hover" href="#" type="phone"
	>
			+1 614 398 3748
	</a>

	</p>

			
	<p className="mb-0"
	>
			
	<a className="link" href="info@acre-access.com" type="email"
	>
			info@acre-access.com
	</a>

	</p>

	</div>

			
	<div className="col-lg-8 ms-auto"
	>
			
	<div className="row g-4"
	>
			
	<div className="col-6 col-md-3"
	>
			
	<h5 className="text-white mb-2 mb-md-4"
	>
			About
	</h5>

			
	<ul className="nav flex-column text-primary-hover"
	>
			
	<li className="nav-item"
	>
			
	<a className="nav-link text-muted" href="#"
	>
			About us
	</a>

	</li>

			
	<li className="nav-item"
	>
			
	<a className="nav-link text-muted" href="#"
	>
			Contact us
	</a>

	</li>

			
	<li className="nav-item"
	>
			
	<a className="nav-link text-muted" href="#"
	>
			News and Blog
	</a>

	</li>

			
	<li className="nav-item"
	>
			
	<a className="nav-link text-muted" href="#"
	>
			Meet Our Partners
	</a>

	</li>

	</ul>

	</div>

			
	<div className="col-6 col-md-3"
	>
			
	<h5 className="text-white mb-2 mb-md-4"
	>
			Link
	</h5>

			
	<ul className="nav flex-column text-primary-hover"
	>
			
	<li className="nav-item"
	>
			
	<a className="nav-link text-muted" href="#"
	>
			Sign up
	</a>

	</li>

			
	<li className="nav-item"
	>
			
	<a className="nav-link text-muted" href="#"
	>
			Sign in
	</a>

	</li>

			
	<li className="nav-item"
	>
			
	<a className="nav-link text-muted" href="#"
	>
			Create A Listing
	</a>

	</li>

			
	<li className="nav-item"
	>
			
	<a className="nav-link text-muted" href="#"
	>
			Get Started
	</a>

	</li>

			
	<li className="nav-item"
	>
			
	<a className="nav-link text-muted" href="#"
	>
			Investors
	</a>

	</li>

			
	<li className="nav-item"
	>
	</li>

	</ul>

	</div>

			
	<div className="col-6 col-md-3"
	>
			
	<h5 className="text-white mb-2 mb-md-4"
	>
			Help
	</h5>

			
	<ul className="nav flex-column text-primary-hover"
	>
			
	<li className="nav-item"
	>
			
	<a className="nav-link text-muted" href="#"
	>
			Help Center
	</a>

	</li>

			
	<li className="nav-item"
	>
			
	<a className="nav-link text-muted" href="#"
	>
			Create Ticket
	</a>

	</li>

			
	<li className="nav-item"
	>
			
	<a className="nav-link text-muted" href="#"
	>
			Faq
	</a>

	</li>

			
	<li className="nav-item"
	>
	</li>

			
	<li className="nav-item"
	>
	</li>

	</ul>

	</div>

			
	<div className="col-6 col-md-3"
	>
			
	<h5 className="text-white mb-2 mb-md-4"
	>
			Partners
	</h5>

			
	<ul className="nav flex-column text-primary-hover"
	>
			
	<li className="nav-item"
	>
	</li>

			
	<li className="nav-item"
	>
			
	<a className="nav-link text-muted" href="#"
	>
			Picture Perfect Properties
	</a>

	</li>

			
	<li className="nav-item"
	>
			
	<a className="nav-link text-muted" href="#"
	>
			Backyard Birding
	</a>

	</li>

			
	<li className="nav-item"
	>
			
	<a className="nav-link text-muted" href="#"
	>
			Park At My Place
	</a>

	</li>

			
	<a className="nav-link text-muted" href="#"
	>
			Gathering Grounds
	</a>

	</ul>

	</div>

	</div>

	</div>

	</div>

			
	<div className="row g-4 justify-content-between mt-0 mt-md-2"
	>
			
	<div className="col-sm-7 col-md-6 col-lg-4"
	>
			
	<h5 className="text-white mb-2"
	>
			Payment & Security
	</h5>

			
	<ul className="list-inline mb-0 mt-3"
	>
			
	<li className="list-inline-item"
	>
			 
			
	<a href="#"
	>
			
	<img className="h-30px" alt="" src="https://dittofipublicfiles.s3.us-west-2.amazonaws.com/2187/3770-expresscard.svg"
	>
	</img>

	</a>

	</li>

			
	<li className="list-inline-item"
	>
			 
			
	<a href="#"
	>
			
	<img className="h-30px" alt="" src="https://dittofipublicfiles.s3.us-west-2.amazonaws.com/2187/3771-visa.svg"
	>
	</img>

	</a>

	</li>

			
	<li className="list-inline-item"
	>
			 
			
	<a href="#"
	>
			
	<img className="h-30px" alt="" src="https://dittofipublicfiles.s3.us-west-2.amazonaws.com/2187/3772-mastercard.svg"
	>
	</img>

	</a>

	</li>

			
	<li className="list-inline-item"
	>
			 
			
	<a href="#"
	>
			
	<img className="h-30px" alt="" src="https://dittofipublicfiles.s3.us-west-2.amazonaws.com/2187/3773-paypal.svg"
	>
	</img>

	</a>

	</li>

	</ul>

	</div>

			
	<div className="col-sm-5 col-md-6 col-lg-3 text-sm-end"
	>
			
	<h5 className="text-white mb-2"
	>
			Follow us on
	</h5>

			
	<ul className="list-inline mb-0 mt-3"
	>
			
	<li className="list-inline-item"
	>
			 
			
	<a className="btn btn-sm px-2 bg-facebook mb-0" href="#" id="icamein"
	>
			
	<i className="fab fa-fw fa-facebook-f"
	>
	</i>

	</a>

	</li>

			
	<li className="list-inline-item"
	>
			 
			
	<a className="btn btn-sm px-2 bg-instagram mb-0" href="#"
	>
			
	<i className="fab fa-fw fa-instagram"
	>
	</i>

	</a>

	</li>

			
	<li className="list-inline-item"
	>
			 
			
	<a className="btn btn-sm px-2 bg-twitter mb-0" href="#"
	>
			
	<i className="fab fa-fw fa-twitter"
	>
	</i>

	</a>

	</li>

			
	<li className="list-inline-item"
	>
			 
			
	<a className="btn btn-sm px-2 bg-linkedin mb-0" href="#"
	>
			
	<i className="fab fa-fw fa-linkedin-in"
	>
	</i>

	</a>

	</li>

	</ul>

	</div>

	</div>

			
	<hr className="mt-4 mb-0"
	>
	</hr>

			
	<div className="row"
	>
			
	<div className="container"
	>
			
	<div className="d-lg-flex justify-content-between align-items-center py-3 text-center text-lg-start"
	>
			
	<div className="text-muted text-primary-hover"
	>
			. All rights reserved. 
			
	<a className="text-muted" href="#"
	>
			©2023 Acre Access
	</a>

	</div>

			
	<div className="nav mt-2 mt-lg-0"
	>
			
	<ul className="list-inline text-primary-hover mx-auto mb-0"
	>
			
	<li className="list-inline-item me-0"
	>
			
	<Link className="nav-link py-1 text-muted" to="/privacy-policy" type="spa"
	>
			Privacy policy
	</Link>

	</li>

			
	<li className="list-inline-item me-0"
	>
			
	<a className="nav-link py-1 text-muted" href="/terms_of_service"
	>
			Terms and conditions
	</a>

	</li>

			
	<li className="list-inline-item me-0"
	>
	</li>

	</ul>

	</div>

	</div>

	</div>

	</div>

	</div>

	</footer>

			
	<div className="back-top"
	>
	</div>

			
	<div className="navbar navbar-mobile"
	>
			
	<ul className="navbar-nav"
	>
			
	<li className="nav-item"
	>
			
	<a className="nav-link active" href="index.html"
	>
			
	<i className="bi bi-house-door fa-fw"
	>
	</i>

	</a>

			
	<Link className="link" target="_self" to="/home" type="spa"
	>
			Home
	</Link>

	</li>

			
	<li className="nav-item"
	>
			
	<a className="nav-link" href="account-bookings.html"
	>
			
	<i className="bi bi-briefcase fa-fw"
	>
	</i>

	</a>

			
	<Link className="link" target="_self" to="/how_it_works" type="spa"
	>
			How it works
	</Link>

	</li>

			
	<li className="nav-item"
	>
			
	<a className="nav-link" href="offer-detail.html"
	>
			
	<i className="bi bi-percent fa-fw"
	>
	</i>

	</a>

			
	<Link className="link" target="_self" to="/addProperty" type="spa"
	>
			Get started
	</Link>

	</li>

			
	<li className="nav-item"
	>
			
	<a className="nav-link" href="/host-dashboard"
	>
			
	<i className="bi bi-person-circle fa-fw"
	>
	</i>

	</a>

			
	<Link className="link" target="_self" to="/host-dashboard" type="spa"
	>
			Account
	</Link>

	</li>

	</ul>

	</div>

			
	<div className="back-top"
	>
	</div>

	</main>

			
		</ErrorBoundary>
	);
}

const mapStateToProps = function(state){
    return state.reducer
}

export default connect(mapStateToProps, null) ( Container );