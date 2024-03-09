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
			getProfilePictureEPR,
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
			
				
	<header className="navbar-light header-sticky"
	>
			
	<nav className="navbar navbar-expand-xl"
	>
			
	<div className="container" d-partial-id="1167"
	>
			
	<a className="navbar-brand" href="index.html"
	>
			
	<img className="light-mode-item navbar-brand-item" alt="logo" src="https://dittofipublicfiles.s3.us-west-2.amazonaws.com/2187/3378-logo_horizontal.png"
	>
	</img>

			
	<img className="dark-mode-item navbar-brand-item" alt="logo" src="assets/images/logo-light.svg"
	>
	</img>

	</a>

			
	<button className="navbar-toggler ms-auto ms-sm-0 p-0 p-sm-2" aria-controls="navbarCollapse" aria-expanded="false" aria-label="Toggle navigation" data-bs-target="#navbarCollapse" data-bs-toggle="collapse" type="button"
	>
	</button>

			
	<button className="navbar-toggler ms-sm-auto mx-3 me-md-0 p-0 p-sm-2" aria-controls="navbarCategoryCollapse" aria-expanded="false" aria-label="Toggle navigation" data-bs-target="#navbarCategoryCollapse" data-bs-toggle="collapse" type="button"
	>
			
	<i className="bi bi-grid-3x3-gap-fill fa-fw"
	>
	</i>

	</button>

			
	<div className="navbar-collapse collapse" id="navbarCollapse"
	>
			
	<ul className="navbar-nav navbar-nav-scroll me-auto"
	>
			
	<li className="nav-item dropdown"
	>
			
	<a className="nav-link dropdown-toggle" aria-expanded="false" aria-haspopup="true" data-bs-toggle="dropdown" href="#" id="listingMenu"
	>
			About
	</a>

			
	<ul className="dropdown-menu" aria-labelledby="listingMenu"
	>
			
	<li className="dropdown-submenu dropend"
	>
			
	<a className="dropdown-item dropdown-toggle" href="#"
	>
			Partners
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
			Mission
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
			Contact
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
			Sustainability
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
			Blog
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

			
	<li id="i9hxdb"
	>
			 
	</li>

			
	<li
	>
			 
	</li>

			
	<li
	>
			 
	</li>

			
	<a className="dropdown-item dropdown-toggle" href="#help_center"
	>
			Help Center
	</a>

	</ul>

	</li>

			
	<li className="nav-item dropdown"
	>
			
	<a className="nav-link dropdown-toggle" aria-expanded="false" aria-haspopup="true" data-bs-toggle="dropdown" href="#" id="pagesMenu"
	>
			How it works
	</a>

			
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
			 
			
	<a className="dropdown-item" href="#/addlisting"
	>
			Create a listing 
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
			
	<li id="i8imu9"
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
			
	<Link className="dropdown-item dropdown-toggle" to="/host-dashboard" type="spa"
	>
			My Profile
	</Link>

			
	<ul className="dropdown-menu" data-bs-popper="none"
	>
			
	<li
	>
			 
			
	<a className="dropdown-item" href="account-profile" target="_self"
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

			
	<div className="navbar-collapse collapse" id="navbarCategoryCollapse"
	>
			
	<ul className="navbar-nav navbar-nav-scroll nav-pills-primary-soft text-center ms-auto p-2 p-xl-0"
	>
			
	<li className="nav-item"
	>
			 
			
	<a className="nav-link" href="index.html" id="igrwyt"
	>
			Photography
	</a>

	</li>

			
	<li className="nav-item"
	>
			 
			
	<a className="nav-link" href="index-flight.html"
	>
			Group Events
	</a>

	</li>

			
	<li className="nav-item"
	>
			 
			
	<a className="nav-link" href="index-tour.html" id="it7fz5"
	>
			Birding 
	</a>

	</li>

			
	<li className="nav-item"
	>
			 
			
	<a className="nav-link" href="index-cab.html"
	>
			Hiking
	</a>

	</li>

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

			
	<img className="avatar-img rounded-2" alt="avatar" src={currentUser["profile_picture"]}
	>
	</img>

			
	<li className="nav-item ms-3 dropdown"
	>
			
	<a className="avatar avatar-sm p-0" aria-expanded="false" data-bs-auto-close="outside" data-bs-display="static" data-bs-toggle="dropdown" href="#" id="profileDropdown" role="button"
	>
			
	<img className="avatar-img rounded-2" alt="avatar" src={currentUser["profile_picture"]}
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

			
				
	<main
	>
			
	<section className="pt-4"
	>
			
	<Component0CustomComponent className="pt-4" emit={runAction} componentDidMount={(e) => {
			var value = e.target.value; runAction({name: "CHECKUSERPROPERTIES"});
		}}
	>
			
	<div className="container"
	>
			
	<div className="card rounded-3 border p-3 pb-2 shadow"
	>
			
	<Tabs className="d-tabs" activetab="0"
	>
			
	<div className="d-tab-content" role="d-tabcontent"
	>
			
	<div className="d-tab-pane"
	>
	</div>

			
	<div className="d-tab-pane"
	>
	</div>

	</div>

	</Tabs>

			
	<ToggleWrapper className="d-nav d--closed" data-collapse="small" type="dropdown"
	>
	</ToggleWrapper>

			
	<div className="offcanvas-xl offcanvas-end mt-xl-3" tabindex="-1"
	>
			
	<div className="offcanvas-header border-bottom p-3"
	>
			
	<h5 className="offcanvas-title"
	>
			Menu
	</h5>

			
	<button className="btn-close" aria-label="Close" data-bs-dismiss="offcanvas" data-bs-target="#dashboardMenu" type="button"
	>
	</button>

	</div>

			
	<Component0CustomComponent className="d-sm-flex align-items-center" emit={runAction} componentDidMount={(e) => {
			var value = e.target.value; runAction({name: "GETUSERS"});
		}}
	>
			
<Fragment>
{ Array.isArray(getProfilePictureEPR) && getProfilePictureEPR.map((row, index) => { return (
	<Component0CustomComponent className="avatar avatar-xl mb-2 mb-sm-0" emit={runAction} componentDidMount={(e) => {
			var value = e.target.value; runAction({name: "GETUSERS"});
		}}
	>
			
<Fragment>
{ Array.isArray(getProfilePictureEPR) && getProfilePictureEPR.map((row, index) => { return (
	<img className="avatar-img rounded-circle" alt="" src={"https://" + row["url"]}
	>
	</img> )})}</Fragment>

	</Component0CustomComponent> )})}</Fragment>

			
	<h1 className="Heading_10"
	>
			Hi, 
	</h1>

			
	<h2 className="Heading_11"
	>
			{currentUser["first_name"]}
	</h2>

	</Component0CustomComponent>

			
	<div className="offcanvas-body p-3 p-xl-0"
	>
			
	<div className="navbar navbar-expand-xl"
	>
			
	<ul className="navbar-nav navbar-offcanvas-menu"
	>
			
	<li className="nav-item"
	>
			 
			
	<Link className="nav-link active" to="/host-dashboard" type="spa"
	>
			Dashboard
			
	<i className="bi bi-house-door fa-fw me-1"
	>
	</i>

	</Link>

	</li>

			
	<li className="nav-item"
	>
			 
			
	<Link className="nav-link" to="/host-listing" type="spa"
	>
			Listings
			
	<i className="bi bi-journals fa-fw me-1" data-highlightable="1" draggable="true"
	>
	</i>

	</Link>

	</li>

			
	<li className="nav-item"
	>
			 
			
	<Link className="nav-link" target="_self" to="/host-bookings" type="spa"
	>
			Bookings
			
	<i className="bi bi-bookmark-heart fa-fw me-1"
	>
	</i>

	</Link>

	</li>

			
	<li className="nav-item"
	>
			 
			
	<Link className="nav-link" target="_self" to="/host-activities" type="spa"
	>
			Activities
			
	<i className="bi bi-bell fa-fw me-1"
	>
	</i>

	</Link>

	</li>

			
	<li className="nav-item"
	>
			 
			
	<Link className="nav-link" target="_self" to="/host-earnings" type="spa"
	>
			Earnings
			
	<i className="bi bi-graph-up-arrow fa-fw me-1"
	>
	</i>

	</Link>

	</li>

			
	<li className="nav-item"
	>
			 
	</li>

			
	<li
	>
			 
			
	<Link className="nav-link" target="_self" to="host-settings" type="spa"
	>
			Settings
			
	<i className="bi bi-gear fa-fw me-1" draggable="true"
	>
	</i>

	</Link>

			
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

	</li>

	</ul>

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

	</div>

	</div>

	</div>

	</Component0CustomComponent>

	</section>

			
	<section className="pt-0"
	>
			
	<div className="container vstack gap-4"
	>
			
	<div className="row"
	>
			
	<div className="col-12"
	>
			
	<h1 className="fs-4 mb-0"
	>
			Earnings
			
	<i className="bi bi-graph-up-arrow fa-fw me-1"
	>
	</i>

	</h1>

	</div>

	</div>

			
	<div className="row g-4"
	>
			
	<div className="col-md-6 col-lg-3"
	>
			
	<div className="card card-body border p-4 h-100"
	>
			
	<h6 className="mb-0"
	>
			Sales this month
	</h6>

			
	<h3 className="mb-2 mt-2"
	>
			$12,825
	</h3>

			
	<a className="mt-auto" href="#"
	>
			View transaction
	</a>

	</div>

	</div>

			
	<div className="col-md-6 col-lg-3"
	>
			
	<div className="card card-body border p-4 h-100"
	>
			
	<h6
	>
			To be paid
						
			
	<a className="h6 mb-0" data-bs-content="After US royalty withholding tax" data-bs-placement="top" data-bs-toggle="popover" data-bs-trigger="focus" role="button" tabindex="0"
	>
			
	<i className="bi bi-info-circle-fill small"
	>
	</i>

	</a>

	</h6>

			
	<h3
	>
			$15,356
	</h3>

			
	<p className="mb-0 mt-auto"
	>
			Expected payout on 05/10/2022
	</p>

	</div>

	</div>

			
	<div className="col-lg-6"
	>
			
	<div className="card bg-primary p-4"
	>
			
	<div className="d-flex justify-content-between align-items-start text-white"
	>
			
	<img className="w-40px" alt="" src="assets/images/element/visa.svg"
	>
	</img>

			
	<div className="dropdown"
	>
			
	<a className="text-white" aria-expanded="false" data-bs-auto-close="outside" data-bs-toggle="dropdown" href="#" id="creditcardDropdown" role="button"
	>
			
	<div fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"
	>
			Unsupported type svg
	</div>

	</a>

			
	<ul className="dropdown-menu dropdown-menu-end" aria-labelledby="creditcardDropdown"
	>
			
	<li
	>
			
	<a className="dropdown-item" href="#"
	>
			Edit card
			
	<i className="bi bi-credit-card-2-front-fill me-2 fw-icon"
	>
	</i>

	</a>

	</li>

			
	<li
	>
			
	<a className="dropdown-item" href="#"
	>
			Add new card
			
	<i className="bi bi-credit-card me-2 fw-icon"
	>
	</i>

	</a>

	</li>

			
	<li
	>
			
	<a className="dropdown-item" href="#"
	>
			Withdrawal money
			
	<i className="bi bi-arrow-bar-down me-2 fw-icon"
	>
	</i>

	</a>

	</li>

			
	<li
	>
			
	<a className="dropdown-item" href="#"
	>
			Currency converter
			
	<i className="bi bi-calculator me-2 fw-icon"
	>
	</i>

	</a>

	</li>

	</ul>

	</div>

	</div>

			
	<div className="mt-4 text-white"
	>
			
	<h3 className="text-white mb-0"
	>
			$32,000
	</h3>

	</div>

			
	<h5 className="text-white mt-4"
	>
			**** **** **** 1569
	</h5>

			
	<div className="d-flex justify-content-between text-white"
	>
	</div>

	</div>

	</div>

	</div>

			
	<div className="row"
	>
			
	<div className="col-12"
	>
			
	<div className="card card-body border overflow-hidden"
	>
			
	<div className="row g-4"
	>
			
	<div className="col-sm-6 col-md-4"
	>
			
	<h4 className="text-primary my-2"
	>
			$35000
	</h4>

			
	<p className="mb-0"
	>
			vs last month
	</p>

	</div>

			
	<div className="col-sm-6 col-md-4"
	>
			
	<h4 className="my-2"
	>
			$28000
	</h4>

			
	<p className="mb-0"
	>
			Then last month
	</p>

	</div>

	</div>

			
	<div id="apexChartTrafficStats"
	>
	</div>

	</div>

	</div>

	</div>

			
	<div className="row"
	>
			
	<div className="col-12"
	>
			
	<div className="card border rounded-3"
	>
			
	<div className="card-header border-bottom"
	>
			
	<h5 className="card-header-title"
	>
			Invoice history
	</h5>

	</div>

			
	<div className="card-body"
	>
			
	<div className="row g-3 align-items-center justify-content-between mb-3"
	>
			
	<div className="col-md-8"
	>
			
	<form className="rounded position-relative" method="get"
	>
			
	<input className="form-control pe-5" aria-label="Search" placeholder="Search" type="search"
	>
	</input>

			
	<button className="btn border-0 px-3 py-0 position-absolute top-50 end-0 translate-middle-y" type="submit"
	>
			
	<i className="fas fa-search fs-6"
	>
	</i>

	</button>

	</form>

	</div>

			
	<div className="col-md-3"
	>
			
	<form method="get"
	>
			
	<select className="form-select js-choice" aria-label=".form-select-sm"
	>
			
	<option value=""
	>
			Sort by
	</option>

			
	<option
	>
			Free
	</option>

			
	<option
	>
			Newest
	</option>

			
	<option
	>
			Oldest
	</option>

	</select>

	</form>

	</div>

	</div>

			
	<div className="table-responsive border-0"
	>
			
	<table className="table align-middle p-4 mb-0 table-hover table-shrink"
	>
			
	<thead className="table-light"
	>
			
	<tr
	>
			
	<th className="border-0 rounded-start" scope="col"
	>
			Invoice ID
	</th>

			
	<th className="border-0" scope="col"
	>
			Date
	</th>

			
	<th className="border-0" scope="col"
	>
			Amount
	</th>

			
	<th className="border-0" scope="col"
	>
			Status
	</th>

			
	<th className="border-0 rounded-end" scope="col"
	>
			Action
	</th>

	</tr>

	</thead>

			
	<tbody className="border-top-0"
	>
			
	<tr
	>
			
	<td
	>
			 #254684 
	</td>

			
	<td
	>
			 29 Aug 2022 
	</td>

			
	<td
	>
			$3,999
											
			
	<a className="h6 mb-0" aria-expanded="false" data-bs-toggle="dropdown" href="#" id="dropdownShare1" role="button"
	>
			
	<i className="bi bi-info-circle-fill"
	>
	</i>

	</a>

			
	<ul className="dropdown-menu dropdown-w-sm dropdown-menu-end min-w-auto shadow rounded" aria-labelledby="dropdownShare1"
	>
			
	<li
	>
			 
			
	<div className="d-flex justify-content-between"
	>
	</div>

			
	<hr className="my-1"
	>
	</hr>

	</li>

			
	<li
	>
			 
			
	<div className="d-flex justify-content-between"
	>
	</div>

			
	<hr className="my-1"
	>
	</hr>

	</li>

			
	<li
	>
			
	<div className="d-flex justify-content-between"
	>
	</div>

	</li>

	</ul>

	</td>

			
	<td
	>
			 
			
	<div className="badge bg-success bg-opacity-10 text-success"
	>
			Paid
	</div>

	</td>

			
	<td
	>
			 
			
	<a className="btn btn-light btn-round mb-0" data-bs-placement="top" data-bs-title="Download" data-bs-toggle="tooltip" href="#"
	>
			
	<i className="bi bi-cloud-download"
	>
	</i>

	</a>

	</td>

	</tr>

			
	<tr
	>
			
	<td
	>
			 #158468 
	</td>

			
	<td
	>
			 02 Sep 2022 
	</td>

			
	<td
	>
			$3,000
											
			
	<a className="h6 mb-0" aria-expanded="false" data-bs-toggle="dropdown" href="#" id="dropdownShare5" role="button"
	>
			
	<i className="bi bi-info-circle-fill"
	>
	</i>

	</a>

			
	<ul className="dropdown-menu dropdown-w-sm dropdown-menu-end min-w-auto shadow rounded" aria-labelledby="dropdownShare5"
	>
			
	<li
	>
			 
			
	<div className="d-flex justify-content-between"
	>
	</div>

			
	<hr className="my-1"
	>
	</hr>

	</li>

			
	<li
	>
			 
			
	<div className="d-flex justify-content-between"
	>
	</div>

			
	<hr className="my-1"
	>
	</hr>

	</li>

			
	<li
	>
			
	<div className="d-flex justify-content-between"
	>
	</div>

	</li>

	</ul>

	</td>

			
	<td
	>
			 
			
	<div className="badge bg-orange bg-opacity-10 text-orange"
	>
			Pending
	</div>

	</td>

			
	<td
	>
			 
			
	<a className="btn btn-light btn-round mb-0" data-bs-placement="top" data-bs-title="Download" data-bs-toggle="tooltip" href="#"
	>
			
	<i className="bi bi-cloud-download"
	>
	</i>

	</a>

	</td>

	</tr>

			
	<tr
	>
			
	<td
	>
			 #245778 
	</td>

			
	<td
	>
			 05 Sep 2022 
	</td>

			
	<td
	>
			$4,258
											
			
	<a className="h6 mb-0" aria-expanded="false" data-bs-toggle="dropdown" href="#" id="dropdownShare2" role="button"
	>
			
	<i className="bi bi-info-circle-fill"
	>
	</i>

	</a>

			
	<ul className="dropdown-menu dropdown-w-sm dropdown-menu-end min-w-auto shadow rounded" aria-labelledby="dropdownShare2"
	>
			
	<li
	>
			 
			
	<div className="d-flex justify-content-between"
	>
	</div>

			
	<hr className="my-1"
	>
	</hr>

	</li>

			
	<li
	>
			 
			
	<div className="d-flex justify-content-between"
	>
	</div>

			
	<hr className="my-1"
	>
	</hr>

	</li>

			
	<li
	>
			
	<div className="d-flex justify-content-between"
	>
	</div>

	</li>

	</ul>

	</td>

			
	<td
	>
			 
			
	<div className="badge bg-success bg-opacity-10 text-success"
	>
			Paid
	</div>

	</td>

			
	<td
	>
			 
			
	<a className="btn btn-light btn-round mb-0" data-bs-placement="top" data-bs-title="Download" data-bs-toggle="tooltip" href="#"
	>
			
	<i className="bi bi-cloud-download"
	>
	</i>

	</a>

	</td>

	</tr>

			
	<tr
	>
			
	<td
	>
			 #245778 
	</td>

			
	<td
	>
			 07 Sep 2022 
	</td>

			
	<td
	>
			$1,225
											
			
	<a className="h6 mb-0" aria-expanded="false" data-bs-toggle="dropdown" href="#" id="dropdownShare3" role="button"
	>
			
	<i className="bi bi-info-circle-fill"
	>
	</i>

	</a>

			
	<ul className="dropdown-menu dropdown-w-sm dropdown-menu-end min-w-auto shadow rounded" aria-labelledby="dropdownShare3"
	>
			
	<li
	>
			 
			
	<div className="d-flex justify-content-between"
	>
	</div>

			
	<hr className="my-1"
	>
	</hr>

	</li>

			
	<li
	>
			 
			
	<div className="d-flex justify-content-between"
	>
	</div>

			
	<hr className="my-1"
	>
	</hr>

	</li>

			
	<li
	>
			
	<div className="d-flex justify-content-between"
	>
	</div>

	</li>

	</ul>

	</td>

			
	<td
	>
			 
			
	<div className="badge bg-danger bg-opacity-10 text-danger"
	>
			Cancelled
	</div>

	</td>

			
	<td
	>
			 
			
	<a className="btn btn-light btn-round mb-0" data-bs-placement="top" data-bs-title="Download" data-bs-toggle="tooltip" href="#"
	>
			
	<i className="bi bi-cloud-download"
	>
	</i>

	</a>

	</td>

	</tr>

			
	<tr
	>
			
	<td
	>
			 #254896 
	</td>

			
	<td
	>
			 10 Sep 2022 
	</td>

			
	<td
	>
			$2,588
											
			
	<a className="h6 mb-0" aria-expanded="false" data-bs-toggle="dropdown" href="#" id="dropdownShare4" role="button"
	>
			
	<i className="bi bi-info-circle-fill"
	>
	</i>

	</a>

			
	<ul className="dropdown-menu dropdown-w-sm dropdown-menu-end min-w-auto shadow rounded" aria-labelledby="dropdownShare4"
	>
			
	<li
	>
			 
			
	<div className="d-flex justify-content-between"
	>
	</div>

			
	<hr className="my-1"
	>
	</hr>

	</li>

			
	<li
	>
			 
			
	<div className="d-flex justify-content-between"
	>
	</div>

			
	<hr className="my-1"
	>
	</hr>

	</li>

			
	<li
	>
			
	<div className="d-flex justify-content-between"
	>
	</div>

	</li>

	</ul>

	</td>

			
	<td
	>
			 
			
	<div className="badge bg-success bg-opacity-10 text-success"
	>
			Paid
	</div>

	</td>

			
	<td
	>
			 
			
	<a className="btn btn-light btn-round mb-0" data-bs-placement="top" data-bs-title="Download" data-bs-toggle="tooltip" href="#"
	>
			
	<i className="bi bi-cloud-download"
	>
	</i>

	</a>

	</td>

	</tr>

	</tbody>

	</table>

	</div>

	</div>

			
	<div className="card-footer pt-0"
	>
			
	<div className="d-sm-flex justify-content-sm-between align-items-sm-center"
	>
			
	<p className="mb-sm-0 text-center text-sm-start"
	>
			Showing 1 to 8 of 20 entries
	</p>

			
	<nav className="mb-sm-0 d-flex justify-content-center" aria-label="navigation"
	>
			
	<ul className="pagination pagination-sm pagination-primary-soft mb-0"
	>
			
	<li className="page-item disabled"
	>
			
	<a className="page-link" href="#" tabindex="-1"
	>
			Prev
	</a>

	</li>

			
	<li className="page-item"
	>
			
	<a className="page-link" href="#"
	>
			1
	</a>

	</li>

			
	<li className="page-item active"
	>
			
	<a className="page-link" href="#"
	>
			2
	</a>

	</li>

			
	<li className="page-item disabled"
	>
			
	<a className="page-link" href="#"
	>
			..
	</a>

	</li>

			
	<li className="page-item"
	>
			
	<a className="page-link" href="#"
	>
			15
	</a>

	</li>

			
	<li className="page-item"
	>
			
	<a className="page-link" href="#"
	>
			Next
	</a>

	</li>

	</ul>

	</nav>

	</div>

	</div>

	</div>

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