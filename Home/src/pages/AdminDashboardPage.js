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
			
				
	<main
	>
			
	<nav className="navbar sidebar navbar-expand-xl navbar-light"
	>
			
	<div className="d-flex align-items-center"
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

	</div>

			
	<div className="offcanvas offcanvas-start flex-row custom-scrollbar h-100" data-bs-backdrop="true" id="offcanvasSidebar" tabindex="-1"
	>
			
	<div className="offcanvas-body sidebar-content d-flex flex-column pt-4"
	>
			
	<ul className="navbar-nav flex-column" id="navbar-sidebar"
	>
			
	<li className="nav-item"
	>
			
	<a className="nav-link active" href="admin-dashboard.html"
	>
			Dashboard
	</a>

	</li>

			
	<li className="nav-item ms-2 my-2"
	>
			Pages
	</li>

			
	<li className="nav-item"
	>
			
	<a className="nav-link" aria-controls="collapsebooking" aria-expanded="false" data-bs-toggle="collapse" href="#collapsebooking" role="button"
	>
			
						Bookings
						
	</a>

			
	<ul className="nav collapse flex-column" data-bs-parent="#navbar-sidebar" id="collapsebooking"
	>
			
	<li className="nav-item"
	>
			 
			
	<a className="nav-link" href="admin-booking-list.html"
	>
			Booking List
	</a>

	</li>

			
	<li className="nav-item"
	>
			 
			
	<a className="nav-link" href="admin-booking-detail.html"
	>
			Booking Detail
	</a>

	</li>

	</ul>

	</li>

			
	<li className="nav-item"
	>
			
	<a className="nav-link" aria-controls="collapseguest" aria-expanded="false" data-bs-toggle="collapse" href="#collapseguest" role="button"
	>
			
						Guests
						
	</a>

			
	<ul className="nav collapse flex-column" data-bs-parent="#navbar-sidebar" id="collapseguest"
	>
			
	<li className="nav-item"
	>
			 
			
	<a className="nav-link" href="admin-guest-list.html"
	>
			Guest List
	</a>

	</li>

			
	<li className="nav-item"
	>
			 
			
	<a className="nav-link" href="admin-guest-detail.html"
	>
			Guest Detail
	</a>

	</li>

	</ul>

	</li>

			
	<li className="nav-item"
	>
			
	<a className="nav-link" aria-controls="collapseagent" aria-expanded="false" data-bs-toggle="collapse" href="#collapseagent" role="button"
	>
			
						Agents
						
	</a>

			
	<ul className="nav collapse flex-column" data-bs-parent="#navbar-sidebar" id="collapseagent"
	>
			
	<li className="nav-item"
	>
			 
			
	<a className="nav-link" href="admin-agent-list.html"
	>
			Agent List
	</a>

	</li>

			
	<li className="nav-item"
	>
			 
			
	<a className="nav-link" href="admin-agent-detail.html"
	>
			Agent Detail
	</a>

	</li>

	</ul>

	</li>

			
	<li className="nav-item"
	>
			 
			
	<a className="nav-link" href="admin-reviews.html"
	>
			Reviews
	</a>

	</li>

			
	<li className="nav-item"
	>
			 
			
	<a className="nav-link" href="admin-earnings.html"
	>
			Earnings
	</a>

	</li>

			
	<li className="nav-item"
	>
			 
			
	<a className="nav-link" href="admin-settings.html"
	>
			Admin Settings
	</a>

	</li>

			
	<li className="nav-item"
	>
			
	<a className="nav-link" aria-controls="collapseauthentication" aria-expanded="false" data-bs-toggle="collapse" href="#collapseauthentication" role="button"
	>
			
							Authentication
						
	</a>

			
	<ul className="nav collapse flex-column" data-bs-parent="#navbar-sidebar" id="collapseauthentication"
	>
			
	<li className="nav-item"
	>
			 
			
	<a className="nav-link" href="sign-up.html"
	>
			Sign Up
	</a>

	</li>

			
	<li className="nav-item"
	>
			 
			
	<a className="nav-link" href="sign-in.html"
	>
			Sign In
	</a>

	</li>

			
	<li className="nav-item"
	>
			 
			
	<a className="nav-link" href="forgot-password.html"
	>
			Forgot Password
	</a>

	</li>

			
	<li className="nav-item"
	>
			 
			
	<a className="nav-link" href="error.html"
	>
			Error 404
	</a>

	</li>

	</ul>

	</li>

			
	<li className="nav-item ms-2 my-2"
	>
			Documentation
	</li>

			
	<li className="nav-item"
	>
			 
			
	<a className="nav-link" href="docs/index.html"
	>
			Documentation
	</a>

	</li>

			
	<li className="nav-item"
	>
			 
			
	<a className="nav-link" href="docs/changelog.html"
	>
			Changelog
	</a>

	</li>

	</ul>

			
	<div className="d-flex align-items-center justify-content-between text-primary-hover mt-auto p-3"
	>
			
	<a className="h6 fw-light mb-0 text-body" aria-label="Sign out" data-bs-placement="top" data-bs-toggle="tooltip" href="sign-in.html"
	>
			 Log out
					
			
	<i className="fa-solid fa-arrow-right-from-bracket"
	>
	</i>

	</a>

			
	<a className="h6 mb-0 text-body" aria-label="Settings" data-bs-placement="top" data-bs-toggle="tooltip" href="admin-settings.html"
	>
			
	<i className="bi bi-gear-fill"
	>
	</i>

	</a>

	</div>

	</div>

	</div>

	</nav>

			
	<div className="page-content"
	>
			
	<nav className="navbar top-bar navbar-light py-0 py-xl-3"
	>
			
	<div className="container-fluid p-0"
	>
			
	<div className="d-flex align-items-center w-100"
	>
			
	<div className="d-flex align-items-center d-xl-none"
	>
			
	<a className="navbar-brand" href="index.html"
	>
			
	<img className="navbar-brand-item h-40px" alt="" src="assets/images/logo-icon.svg"
	>
	</img>

	</a>

	</div>

			
	<div className="navbar-expand-xl sidebar-offcanvas-menu"
	>
			
	<button className="navbar-toggler me-auto p-2" aria-controls="offcanvasSidebar" aria-expanded="false" aria-label="Toggle navigation" data-bs-auto-close="outside" data-bs-target="#offcanvasSidebar" data-bs-toggle="offcanvas" type="button"
	>
			
	<i className="bi bi-list text-primary fa-fw" data-bs-target="#offcanvasMenu"
	>
	</i>

	</button>

	</div>

			
	<div className="navbar-expand-lg ms-auto ms-xl-0"
	>
			
	<button className="navbar-toggler ms-auto p-0" aria-controls="navbarTopContent" aria-expanded="false" aria-label="Toggle navigation" data-bs-target="#navbarTopContent" data-bs-toggle="collapse" type="button"
	>
			
	<i className="bi bi-search"
	>
	</i>

	</button>

			
	<div className="collapse navbar-collapse w-100 z-index-1" id="navbarTopContent"
	>
			
	<div className="nav my-3 my-xl-0 flex-nowrap align-items-center"
	>
			
	<div className="nav-item w-100"
	>
			
	<form className="position-relative" method="get"
	>
			
	<input className="form-control bg-light pe-5" aria-label="Search" placeholder="Search" type="search"
	>
	</input>

			
	<button className="bg-transparent px-2 py-0 border-0 position-absolute top-50 end-0 translate-middle-y" type="submit"
	>
			
	<i className="fas fa-search fs-6 text-primary"
	>
	</i>

	</button>

	</form>

	</div>

	</div>

	</div>

	</div>

			
	<ul className="nav flex-row align-items-center list-unstyled ms-xl-auto"
	>
			
	<li className="nav-item modeswitch-mini ms-3" id="darkModeSwitch"
	>
			
	<div className="modeswitch-mini-item"
	>
			
	<div className="modeswitch-mini-icon"
	>
	</div>

	</div>

	</li>

			
	<li className="nav-item dropdown ms-3"
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

	</ul>

	</li>

	</ul>

	</div>

	</div>

	</nav>

			
	<div className="page-content-wrapper p-xxl-4"
	>
			
	<div className="row"
	>
			
	<div className="col-12 mb-4 mb-sm-5"
	>
			
	<div className="d-sm-flex justify-content-between align-items-center"
	>
			
	<h1 className="h3 mb-2 mb-sm-0"
	>
			Dashboard
	</h1>

			
	<div className="d-grid"
	>
			
	<a className="btn btn-primary-soft mb-0" href="#"
	>
			 New Booking
			
	<i className="bi bi-plus-lg fa-fw"
	>
	</i>

	</a>

	</div>

	</div>

	</div>

	</div>

			
	<div className="row g-4 mb-5"
	>
			
	<div className="col-md-6 col-xxl-3"
	>
			
	<div className="card card-body bg-warning bg-opacity-10 border border-warning border-opacity-25 p-4 h-100"
	>
			
	<div className="d-flex justify-content-between align-items-center"
	>
			
	<div
	>
			
	<h4 className="mb-0"
	>
			56
	</h4>

	</div>

			
	<div className="icon-lg rounded-circle bg-warning text-white mb-0"
	>
			
	<i className="fa-solid fa-hotel fa-fw"
	>
	</i>

	</div>

	</div>

	</div>

	</div>

			
	<div className="col-md-6 col-xxl-3"
	>
			
	<div className="card card-body bg-success bg-opacity-10 border border-success border-opacity-25 p-4 h-100"
	>
			
	<div className="d-flex justify-content-between align-items-center"
	>
			
	<div
	>
			
	<h4 className="mb-0"
	>
			$836,789
	</h4>

	</div>

			
	<div className="icon-lg rounded-circle bg-success text-white mb-0"
	>
			
	<i className="fa-solid fa-hand-holding-dollar fa-fw"
	>
	</i>

	</div>

	</div>

	</div>

	</div>

			
	<div className="col-md-6 col-xxl-3"
	>
			
	<div className="card card-body bg-primary bg-opacity-10 border border-primary border-opacity-25 p-4 h-100"
	>
			
	<div className="d-flex justify-content-between align-items-center"
	>
			
	<div
	>
			
	<h4 className="mb-0"
	>
			245
	</h4>

	</div>

			
	<div className="icon-lg rounded-circle bg-primary text-white mb-0"
	>
			
	<i className="fa-solid fa-bed fa-fw"
	>
	</i>

	</div>

	</div>

	</div>

	</div>

			
	<div className="col-md-6 col-xxl-3"
	>
			
	<div className="card card-body bg-info bg-opacity-10 border border-info border-opacity-25 p-4 h-100"
	>
			
	<div className="d-flex justify-content-between align-items-center"
	>
			
	<div
	>
			
	<h4 className="mb-0"
	>
			147
	</h4>

	</div>

			
	<div className="icon-lg rounded-circle bg-info text-white mb-0"
	>
			
	<i className="fa-solid fa-building-circle-check fa-fw"
	>
	</i>

	</div>

	</div>

	</div>

	</div>

	</div>

			
	<div className="row g-4 mb-5"
	>
			
	<div className="col-12"
	>
			
	<div className="d-flex justify-content-between"
	>
			
	<h4 className="mb-0"
	>
			Popular Hotels
	</h4>

			
	<a className="btn btn-primary-soft mb-0" href="#"
	>
			View All
	</a>

	</div>

	</div>

			
	<div className="col-lg-6"
	>
			
	<div className="card shadow p-3"
	>
			
	<div className="row g-4"
	>
			
	<div className="col-md-3"
	>
			
	<img className="rounded-2" alt="Card image" src="assets/images/category/hotel/4by3/10.jpg"
	>
	</img>

	</div>

			
	<div className="col-md-9"
	>
			
	<div className="card-body position-relative d-flex flex-column p-0 h-100"
	>
			
	<div className="list-inline-item dropdown position-absolute top-0 end-0"
	>
			
	<a className="btn btn-sm btn-round btn-light" aria-expanded="false" data-bs-toggle="dropdown" href="#" id="dropdownAction1" role="button"
	>
			
	<i className="bi bi-three-dots-vertical"
	>
	</i>

	</a>

			
	<ul className="dropdown-menu dropdown-menu-end min-w-auto shadow" aria-labelledby="dropdownAction1"
	>
			
	<li
	>
			
	<a className="dropdown-item small" href="#"
	>
			Report
			
	<i className="bi bi-info-circle me-2"
	>
	</i>

	</a>

	</li>

			
	<li
	>
			
	<a className="dropdown-item small" href="#"
	>
			Disable
			
	<i className="bi bi-slash-circle me-2"
	>
	</i>

	</a>

	</li>

	</ul>

	</div>

			
	<h5 className="card-title mb-0 me-5"
	>
			
	<a href="hotel-detail.html"
	>
			Pride moon Village Resort & Spa
	</a>

	</h5>

			
	<small
	>
			31J W Spark Street, California - 24578
			
	<i className="bi bi-geo-alt me-2"
	>
	</i>

	</small>

			
	<div className="d-sm-flex justify-content-sm-between align-items-center mt-3 mt-md-auto"
	>
			
	<div className="d-flex align-items-center"
	>
			
	<h5 className="fw-bold mb-0 me-1"
	>
			$1586
	</h5>

	</div>

			
	<div className="hstack gap-2 mt-3 mt-sm-0"
	>
			
	<a className="btn btn-sm btn-primary-soft px-2 mb-0" href="#"
	>
			
	<i className="bi bi-pencil-square fa-fw"
	>
	</i>

	</a>

			
	<a className="btn btn-sm btn-danger-soft px-2 mb-0" href="#"
	>
			
	<i className="bi bi-slash-circle fa-fw"
	>
	</i>

	</a>

	</div>

	</div>

	</div>

	</div>

	</div>

	</div>

	</div>

			
	<div className="col-lg-6"
	>
			
	<div className="card shadow p-3"
	>
			
	<div className="row g-4"
	>
			
	<div className="col-md-3"
	>
			
	<img className="rounded-2" alt="Card image" src="assets/images/category/hotel/4by3/08.jpg"
	>
	</img>

	</div>

			
	<div className="col-md-9"
	>
			
	<div className="card-body position-relative d-flex flex-column p-0 h-100"
	>
			
	<div className="list-inline-item dropdown position-absolute top-0 end-0"
	>
			
	<a className="btn btn-sm btn-round btn-light" aria-expanded="false" data-bs-toggle="dropdown" href="#" id="dropdownAction2" role="button"
	>
			
	<i className="bi bi-three-dots-vertical"
	>
	</i>

	</a>

			
	<ul className="dropdown-menu dropdown-menu-end min-w-auto shadow" aria-labelledby="dropdownAction2"
	>
			
	<li
	>
			
	<a className="dropdown-item small" href="#"
	>
			Report
			
	<i className="bi bi-info-circle me-2"
	>
	</i>

	</a>

	</li>

			
	<li
	>
			
	<a className="dropdown-item small" href="#"
	>
			Disable
			
	<i className="bi bi-slash-circle me-2"
	>
	</i>

	</a>

	</li>

	</ul>

	</div>

			
	<h5 className="card-title mb-0 me-5"
	>
			
	<a href="hotel-detail.html"
	>
			Courtyard by Marriott New York
	</a>

	</h5>

			
	<small
	>
			258 W jimmy Street, New york - 24578
			
	<i className="bi bi-geo-alt me-2"
	>
	</i>

	</small>

			
	<div className="d-sm-flex justify-content-sm-between align-items-center mt-3 mt-md-auto"
	>
			
	<div className="d-flex align-items-center"
	>
			
	<h5 className="fw-bold mb-0 me-1"
	>
			$1025
	</h5>

	</div>

			
	<div className="hstack gap-2 mt-3 mt-sm-0"
	>
			
	<a className="btn btn-sm btn-primary-soft px-2 mb-0" href="#"
	>
			
	<i className="bi bi-pencil-square fa-fw"
	>
	</i>

	</a>

			
	<a className="btn btn-sm btn-danger-soft px-2 mb-0" href="#"
	>
			
	<i className="bi bi-slash-circle fa-fw"
	>
	</i>

	</a>

	</div>

	</div>

	</div>

	</div>

	</div>

	</div>

	</div>

			
	<div className="col-lg-6"
	>
			
	<div className="card shadow p-3"
	>
			
	<div className="row g-4"
	>
			
	<div className="col-md-3"
	>
			
	<img className="rounded-2" alt="Card image" src="assets/images/category/hotel/4by3/09.jpg"
	>
	</img>

	</div>

			
	<div className="col-md-9"
	>
			
	<div className="card-body position-relative d-flex flex-column p-0 h-100"
	>
			
	<div className="list-inline-item dropdown position-absolute top-0 end-0"
	>
			
	<a className="btn btn-sm btn-round btn-light" aria-expanded="false" data-bs-toggle="dropdown" href="#" id="dropdownAction3" role="button"
	>
			
	<i className="bi bi-three-dots-vertical"
	>
	</i>

	</a>

			
	<ul className="dropdown-menu dropdown-menu-end min-w-auto shadow" aria-labelledby="dropdownAction3"
	>
			
	<li
	>
			
	<a className="dropdown-item small" href="#"
	>
			Report
			
	<i className="bi bi-info-circle me-2"
	>
	</i>

	</a>

	</li>

			
	<li
	>
			
	<a className="dropdown-item small" href="#"
	>
			Disable
			
	<i className="bi bi-slash-circle me-2"
	>
	</i>

	</a>

	</li>

	</ul>

	</div>

			
	<h5 className="card-title mb-0 me-5"
	>
			
	<a href="hotel-detail.html"
	>
			Park Plaza Lodge Hotel
	</a>

	</h5>

			
	<small
	>
			31J W Spark Street, California - 24578
			
	<i className="bi bi-geo-alt me-2"
	>
	</i>

	</small>

			
	<div className="d-sm-flex justify-content-sm-between align-items-center mt-3 mt-md-auto"
	>
			
	<div className="d-flex align-items-center"
	>
			
	<h5 className="fw-bold mb-0 me-1"
	>
			$958
	</h5>

	</div>

			
	<div className="hstack gap-2 mt-3 mt-sm-0"
	>
			
	<a className="btn btn-sm btn-primary-soft px-2 mb-0" href="#"
	>
			
	<i className="bi bi-pencil-square fa-fw"
	>
	</i>

	</a>

			
	<a className="btn btn-sm btn-danger-soft px-2 mb-0" href="#"
	>
			
	<i className="bi bi-slash-circle fa-fw"
	>
	</i>

	</a>

	</div>

	</div>

	</div>

	</div>

	</div>

	</div>

	</div>

			
	<div className="col-lg-6"
	>
			
	<div className="card shadow p-3"
	>
			
	<div className="row g-4"
	>
			
	<div className="col-md-3"
	>
			
	<img className="rounded-2" alt="Card image" src="assets/images/category/hotel/4by3/07.jpg"
	>
	</img>

	</div>

			
	<div className="col-md-9"
	>
			
	<div className="card-body position-relative d-flex flex-column p-0 h-100"
	>
			
	<div className="list-inline-item dropdown position-absolute top-0 end-0"
	>
			
	<a className="btn btn-sm btn-round btn-light" aria-expanded="false" data-bs-toggle="dropdown" href="#" id="dropdownAction4" role="button"
	>
			
	<i className="bi bi-three-dots-vertical"
	>
	</i>

	</a>

			
	<ul className="dropdown-menu dropdown-menu-end min-w-auto shadow" aria-labelledby="dropdownAction4"
	>
			
	<li
	>
			
	<a className="dropdown-item small" href="#"
	>
			Report
			
	<i className="bi bi-info-circle me-2"
	>
	</i>

	</a>

	</li>

			
	<li
	>
			
	<a className="dropdown-item small" href="#"
	>
			Disable
			
	<i className="bi bi-slash-circle me-2"
	>
	</i>

	</a>

	</li>

	</ul>

	</div>

			
	<h5 className="card-title mb-0 me-5"
	>
			
	<a href="hotel-detail.html"
	>
			Royal Beach Resort
	</a>

	</h5>

			
	<small
	>
			589 J Wall Street, London - 24578
			
	<i className="bi bi-geo-alt me-2"
	>
	</i>

	</small>

			
	<div className="d-sm-flex justify-content-sm-between align-items-center mt-3 mt-md-auto"
	>
			
	<div className="d-flex align-items-center"
	>
			
	<h5 className="fw-bold mb-0 me-1"
	>
			$1005
	</h5>

	</div>

			
	<div className="hstack gap-2 mt-3 mt-sm-0"
	>
			
	<a className="btn btn-sm btn-primary-soft px-2 mb-0" href="#"
	>
			
	<i className="bi bi-pencil-square fa-fw"
	>
	</i>

	</a>

			
	<a className="btn btn-sm btn-danger-soft px-2 mb-0" href="#"
	>
			
	<i className="bi bi-slash-circle fa-fw"
	>
	</i>

	</a>

	</div>

	</div>

	</div>

	</div>

	</div>

	</div>

	</div>

	</div>

			
	<div className="row g-4"
	>
			
	<div className="col-xxl-8"
	>
			
	<div className="card shadow h-100"
	>
			
	<div className="card-header border-bottom"
	>
			
	<h5 className="card-header-title"
	>
			Guest Activity
	</h5>

	</div>

			
	<div className="card-body"
	>
			
	<div className="d-flex gap-4 mb-3"
	>
			
	<h6
	>
			 475 Guests
	</h6>

			
	<h6
	>
			 157 Guests
	</h6>

	</div>

			
	<div className="mt-2" id="ChartGuesttraffic"
	>
	</div>

	</div>

	</div>

	</div>

			
	<div className="col-lg-6 col-xxl-4"
	>
			
	<div className="card shadow h-100"
	>
			
	<div className="card-header border-bottom"
	>
			
	<h5 className="card-header-title"
	>
			Room Availability
	</h5>

	</div>

			
	<div className="card-body p-3"
	>
			
	<div className="col-sm-6 mx-auto"
	>
			
	<div className="d-flex justify-content-center" id="ChartTrafficRooms"
	>
	</div>

	</div>

			
	<ul className="list-group list-group-borderless mb-0"
	>
			
	<li className="list-group-item d-flex justify-content-between"
	>
	</li>

			
	<li className="list-group-item d-flex justify-content-between"
	>
	</li>

	</ul>

	</div>

	</div>

	</div>

			
	<div className="col-lg-6 col-xxl-4"
	>
			
	<div className="card shadow h-100"
	>
			
	<div className="card-header border-bottom d-flex justify-content-between align-items-center"
	>
			
	<h5 className="card-header-title"
	>
			Room Notifications
	</h5>

			
	<a className="btn btn-link p-0 mb-0" href="#"
	>
			View all
	</a>

	</div>

			
	<div className="card-body"
	>
			
	<div className="d-flex justify-content-between align-items-center"
	>
			
	<div className="d-sm-flex align-items-center mb-1 mb-sm-0"
	>
			
	<div className="flex-shrink-0"
	>
			
	<img className="rounded h-60px" alt="" src="assets/images/category/hotel/4by3/04.jpg"
	>
	</img>

	</div>

			
	<div className="ms-sm-3 mt-2 mt-sm-0"
	>
			
	<h6 className="mb-1"
	>
			Deluxe Pool View with Breakfast
	</h6>

			
	<ul className="nav nav-divider small"
	>
			
	<li className="nav-item"
	>
			18 Nov to 22 Nov
	</li>

			
	<li className="nav-item"
	>
	</li>

	</ul>

	</div>

	</div>

			
	<a className="btn btn-sm btn-light flex-shrink-0 mb-0 ms-3" href="#"
	>
			View
	</a>

	</div>

			
	<hr
	>
	</hr>

			
	<div className="d-flex justify-content-between align-items-center"
	>
			
	<div className="d-sm-flex align-items-center mb-1 mb-sm-0"
	>
			
	<div className="flex-shrink-0"
	>
			
	<img className="rounded h-60px" alt="" src="assets/images/category/hotel/4by3/05.jpg"
	>
	</img>

	</div>

			
	<div className="ms-sm-3 mt-2 mt-sm-0"
	>
			
	<h6 className="mb-1"
	>
			Deluxe Pool View
	</h6>

			
	<ul className="nav nav-divider small"
	>
			
	<li className="nav-item"
	>
			16 Nov
	</li>

			
	<li className="nav-item"
	>
	</li>

	</ul>

	</div>

	</div>

			
	<a className="btn btn-sm btn-light flex-shrink-0 mb-0 ms-3" href="#"
	>
			View
	</a>

	</div>

			
	<hr
	>
	</hr>

			
	<div className="d-flex justify-content-between align-items-center"
	>
			
	<div className="d-sm-flex align-items-center mb-1 mb-sm-0"
	>
			
	<div className="flex-shrink-0"
	>
			
	<img className="rounded h-60px" alt="" src="assets/images/category/hotel/4by3/06.jpg"
	>
	</img>

	</div>

			
	<div className="ms-sm-3 mt-2 mt-sm-0"
	>
			
	<h6 className="mb-1"
	>
			Luxury Room with Balcony
	</h6>

			
	<ul className="nav nav-divider small"
	>
			
	<li className="nav-item"
	>
			15 Nov to 20 Nov
	</li>

			
	<li className="nav-item"
	>
	</li>

	</ul>

	</div>

	</div>

			
	<a className="btn btn-sm btn-light flex-shrink-0 mb-0 ms-3" href="#"
	>
			View
	</a>

	</div>

			
	<hr
	>
	</hr>

			
	<div className="d-flex justify-content-between align-items-center"
	>
			
	<div className="d-sm-flex align-items-center mb-1 mb-sm-0"
	>
			
	<div className="flex-shrink-0"
	>
			
	<img className="rounded h-60px" alt="" src="assets/images/category/hotel/4by3/08.jpg"
	>
	</img>

	</div>

			
	<div className="ms-sm-3 mt-2 mt-sm-0"
	>
			
	<h6 className="mb-1"
	>
			Premium Room With Balcony
	</h6>

			
	<ul className="nav nav-divider small"
	>
			
	<li className="nav-item"
	>
			14 Nov to 16 Nov
	</li>

			
	<li className="nav-item"
	>
	</li>

	</ul>

	</div>

	</div>

			
	<a className="btn btn-sm btn-light flex-shrink-0 mb-0 ms-3" href="#"
	>
			View
	</a>

	</div>

			
	<hr
	>
	</hr>

			
	<div className="d-flex justify-content-between align-items-center"
	>
			
	<div className="d-sm-flex align-items-center mb-1 mb-sm-0"
	>
			
	<div className="flex-shrink-0"
	>
			
	<img className="rounded h-60px" alt="" src="assets/images/category/hotel/4by3/02.jpg"
	>
	</img>

	</div>

			
	<div className="ms-sm-3 mt-2 mt-sm-0"
	>
			
	<h6 className="mb-1"
	>
			Rock Family Suite
	</h6>

			
	<ul className="nav nav-divider small"
	>
			
	<li className="nav-item"
	>
			13 Nov
	</li>

			
	<li className="nav-item"
	>
	</li>

	</ul>

	</div>

	</div>

			
	<a className="btn btn-sm btn-light flex-shrink-0 mb-0 ms-3" href="#"
	>
			View
	</a>

	</div>

	</div>

	</div>

	</div>

			
	<div className="col-lg-6 col-xxl-4"
	>
			
	<div className="card shadow h-100"
	>
			
	<div className="card-header border-bottom d-flex justify-content-between align-items-center p-3"
	>
			
	<h5 className="card-header-title"
	>
			Upcoming Arrivals
	</h5>

			
	<a className="btn btn-link p-0 mb-0" href="#"
	>
			View all
	</a>

	</div>

			
	<div className="card-body p-3"
	>
			
	<div className="d-flex justify-content-between align-items-center"
	>
			
	<div className="d-sm-flex align-items-center mb-1 mb-sm-0"
	>
			
	<div className="avatar avatar-md flex-shrink-0"
	>
			
	<img className="avatar-img rounded-circle" alt="avatar" src="assets/images/avatar/09.jpg"
	>
	</img>

	</div>

			
	<div className="ms-sm-2 mt-2 mt-sm-0"
	>
			
	<h6 className="mb-1"
	>
			Lori Stevens
	</h6>

			
	<ul className="nav nav-divider small"
	>
			
	<li className="nav-item"
	>
			Room 25A
	</li>

			
	<li className="nav-item"
	>
			24Nov - 28Nov
	</li>

	</ul>

	</div>

	</div>

			
	<a className="btn btn-sm btn-light mb-0 ms-3 px-2" href="#"
	>
			
	<i className="fa-solid fa-chevron-right fa-fw"
	>
	</i>

	</a>

	</div>

			
	<hr
	>
	</hr>

			
	<div className="d-flex justify-content-between align-items-center"
	>
			
	<div className="d-sm-flex align-items-center mb-1 mb-sm-0"
	>
			
	<div className="avatar avatar-md flex-shrink-0"
	>
			
	<img className="avatar-img rounded-circle" alt="avatar" src="assets/images/avatar/03.jpg"
	>
	</img>

	</div>

			
	<div className="ms-sm-2 mt-2 mt-sm-0"
	>
			
	<h6 className="mb-1"
	>
			Dennis Barrett
	</h6>

			
	<ul className="nav nav-divider small"
	>
			
	<li className="nav-item"
	>
			Room 12B
	</li>

			
	<li className="nav-item"
	>
			21Nov - 23Nov
	</li>

	</ul>

	</div>

	</div>

			
	<a className="btn btn-sm btn-light mb-0 ms-3 px-2" href="#"
	>
			
	<i className="fa-solid fa-chevron-right fa-fw"
	>
	</i>

	</a>

	</div>

			
	<hr
	>
	</hr>

			
	<div className="d-flex justify-content-between align-items-center"
	>
			
	<div className="d-sm-flex align-items-center mb-1 mb-sm-0"
	>
			
	<div className="avatar avatar-md flex-shrink-0"
	>
			
	<img className="avatar-img rounded-circle" alt="avatar" src="assets/images/avatar/01.jpg"
	>
	</img>

	</div>

			
	<div className="ms-sm-2 mt-2 mt-sm-0"
	>
			
	<h6 className="mb-1"
	>
			Jacqueline Miller
	</h6>

			
	<ul className="nav nav-divider small"
	>
			
	<li className="nav-item"
	>
			Room 11A
	</li>

			
	<li className="nav-item"
	>
			19Nov - 21Nov
	</li>

	</ul>

	</div>

	</div>

			
	<a className="btn btn-sm btn-light mb-0 ms-3 px-2" href="#"
	>
			
	<i className="fa-solid fa-chevron-right fa-fw"
	>
	</i>

	</a>

	</div>

			
	<hr
	>
	</hr>

			
	<div className="d-flex justify-content-between align-items-center"
	>
			
	<div className="d-sm-flex align-items-center mb-1 mb-sm-0"
	>
			
	<div className="avatar avatar-md flex-shrink-0"
	>
			
	<img className="avatar-img rounded-circle" alt="avatar" src="assets/images/avatar/04.jpg"
	>
	</img>

	</div>

			
	<div className="ms-sm-2 mt-2 mt-sm-0"
	>
			
	<h6 className="mb-1"
	>
			Billy Vasquez
	</h6>

			
	<ul className="nav nav-divider small"
	>
			
	<li className="nav-item"
	>
			Room 05A
	</li>

			
	<li className="nav-item"
	>
			14Nov - 18Nov
	</li>

	</ul>

	</div>

	</div>

			
	<a className="btn btn-sm btn-light mb-0 ms-3 px-2" href="#"
	>
			
	<i className="fa-solid fa-chevron-right fa-fw"
	>
	</i>

	</a>

	</div>

			
	<hr
	>
	</hr>

			
	<div className="d-flex justify-content-between align-items-center"
	>
			
	<div className="d-sm-flex align-items-center mb-1 mb-sm-0"
	>
			
	<div className="avatar avatar-md flex-shrink-0"
	>
			
	<img className="avatar-img rounded-circle" alt="avatar" src="assets/images/avatar/05.jpg"
	>
	</img>

	</div>

			
	<div className="ms-sm-2 mt-2 mt-sm-0"
	>
			
	<h6 className="mb-1"
	>
			Amanda Reed
	</h6>

			
	<ul className="nav nav-divider small"
	>
			
	<li className="nav-item"
	>
			Room 9
	</li>

			
	<li className="nav-item"
	>
			11Nov - 12Nov
	</li>

	</ul>

	</div>

	</div>

			
	<a className="btn btn-sm btn-light mb-0 ms-3 px-2" href="#"
	>
			
	<i className="fa-solid fa-chevron-right fa-fw"
	>
	</i>

	</a>

	</div>

			
	<hr
	>
	</hr>

			
	<div className="d-flex justify-content-between align-items-center"
	>
			
	<div className="d-sm-flex align-items-center mb-1 mb-sm-0"
	>
			
	<div className="avatar avatar-md flex-shrink-0"
	>
			
	<img className="avatar-img rounded-circle" alt="avatar" src="assets/images/avatar/08.jpg"
	>
	</img>

	</div>

			
	<div className="ms-sm-2 mt-2 mt-sm-0"
	>
			
	<h6 className="mb-1"
	>
			Dennis Barrett
	</h6>

			
	<ul className="nav nav-divider small"
	>
			
	<li className="nav-item"
	>
			Room 10
	</li>

			
	<li className="nav-item"
	>
			11Nov - 12Nov
	</li>

	</ul>

	</div>

	</div>

			
	<a className="btn btn-sm btn-light mb-0 ms-3 px-2" href="#"
	>
			
	<i className="fa-solid fa-chevron-right fa-fw"
	>
	</i>

	</a>

	</div>

	</div>

	</div>

	</div>

			
	<div className="col-lg-6 col-xxl-4"
	>
			
	<div className="card shadow h-100"
	>
			
	<div className="card-header border-bottom d-flex justify-content-between align-items-center p-3"
	>
			
	<h5 className="card-header-title"
	>
			Reviews
	</h5>

			
	<a className="btn btn-link p-0 mb-0" href="#"
	>
			View all
	</a>

	</div>

			
	<div className="card-body p-3"
	>
			
	<div className="d-flex justify-content-between align-items-center"
	>
			
	<div className="d-sm-flex align-items-center mb-1 mb-sm-0"
	>
			
	<div className="flex-shrink-0"
	>
			
	<img className="rounded h-60px" alt="" src="assets/images/category/hotel/4by3/08.jpg"
	>
	</img>

	</div>

			
	<div className="ms-sm-3 mt-2 mt-sm-0"
	>
			
	<h6 className="mb-1"
	>
			Deluxe Pool View with Breakfast
	</h6>

			
	<ul className="list-inline smaller mb-0"
	>
			
	<li className="list-inline-item me-0"
	>
			
	<i className="fas fa-star text-warning"
	>
	</i>

	</li>

			
	<li className="list-inline-item me-0"
	>
			
	<i className="fas fa-star text-warning"
	>
	</i>

	</li>

			
	<li className="list-inline-item me-0"
	>
			
	<i className="fas fa-star text-warning"
	>
	</i>

	</li>

			
	<li className="list-inline-item me-0"
	>
			
	<i className="fas fa-star text-warning"
	>
	</i>

	</li>

			
	<li className="list-inline-item me-0"
	>
			
	<i className="far fa-star text-warning"
	>
	</i>

	</li>

			
	<li className="list-inline-item me-0"
	>
			(35 reviews)
	</li>

	</ul>

	</div>

	</div>

			
	<a className="btn btn-sm btn-light flex-shrink-0 mb-0 ms-3" href="#"
	>
			View
	</a>

	</div>

			
	<hr
	>
	</hr>

			
	<div className="d-flex justify-content-between align-items-center"
	>
			
	<div className="d-sm-flex align-items-center mb-1 mb-sm-0"
	>
			
	<div className="flex-shrink-0"
	>
			
	<img className="rounded h-60px" alt="" src="assets/images/category/hotel/4by3/09.jpg"
	>
	</img>

	</div>

			
	<div className="ms-sm-3 mt-2 mt-sm-0"
	>
			
	<h6 className="mb-1"
	>
			Deluxe Pool View
	</h6>

			
	<ul className="list-inline smaller mb-0"
	>
			
	<li className="list-inline-item me-0"
	>
			
	<i className="fas fa-star text-warning"
	>
	</i>

	</li>

			
	<li className="list-inline-item me-0"
	>
			
	<i className="fas fa-star text-warning"
	>
	</i>

	</li>

			
	<li className="list-inline-item me-0"
	>
			
	<i className="fas fa-star text-warning"
	>
	</i>

	</li>

			
	<li className="list-inline-item me-0"
	>
			
	<i className="fas fa-star text-warning"
	>
	</i>

	</li>

			
	<li className="list-inline-item me-0"
	>
			
	<i className="far fa-star text-warning"
	>
	</i>

	</li>

			
	<li className="list-inline-item me-0"
	>
			(25 reviews)
	</li>

	</ul>

	</div>

	</div>

			
	<a className="btn btn-sm btn-light flex-shrink-0 mb-0 ms-3" href="#"
	>
			View
	</a>

	</div>

			
	<hr
	>
	</hr>

			
	<div className="d-flex justify-content-between align-items-center"
	>
			
	<div className="d-sm-flex align-items-center mb-1 mb-sm-0"
	>
			
	<div className="flex-shrink-0"
	>
			
	<img className="rounded h-60px" alt="" src="assets/images/category/hotel/4by3/01.jpg"
	>
	</img>

	</div>

			
	<div className="ms-sm-3 mt-2 mt-sm-0"
	>
			
	<h6 className="mb-1"
	>
			Luxury Room with Balcony
	</h6>

			
	<ul className="list-inline smaller mb-0"
	>
			
	<li className="list-inline-item me-0"
	>
			
	<i className="fas fa-star text-warning"
	>
	</i>

	</li>

			
	<li className="list-inline-item me-0"
	>
			
	<i className="fas fa-star text-warning"
	>
	</i>

	</li>

			
	<li className="list-inline-item me-0"
	>
			
	<i className="fas fa-star text-warning"
	>
	</i>

	</li>

			
	<li className="list-inline-item me-0"
	>
			
	<i className="fas fa-star text-warning"
	>
	</i>

	</li>

			
	<li className="list-inline-item me-0"
	>
			
	<i className="far fa-star text-warning"
	>
	</i>

	</li>

			
	<li className="list-inline-item me-0"
	>
			(18 reviews)
	</li>

	</ul>

	</div>

	</div>

			
	<a className="btn btn-sm btn-light flex-shrink-0 mb-0 ms-3" href="#"
	>
			View
	</a>

	</div>

			
	<hr
	>
	</hr>

			
	<div className="d-flex justify-content-between align-items-center"
	>
			
	<div className="d-sm-flex align-items-center mb-1 mb-sm-0"
	>
			
	<div className="flex-shrink-0"
	>
			
	<img className="rounded h-60px" alt="" src="assets/images/category/hotel/4by3/05.jpg"
	>
	</img>

	</div>

			
	<div className="ms-sm-3 mt-2 mt-sm-0"
	>
			
	<h6 className="mb-1"
	>
			Premium Room With Balcony
	</h6>

			
	<ul className="list-inline smaller mb-0"
	>
			
	<li className="list-inline-item me-0"
	>
			
	<i className="fas fa-star text-warning"
	>
	</i>

	</li>

			
	<li className="list-inline-item me-0"
	>
			
	<i className="fas fa-star text-warning"
	>
	</i>

	</li>

			
	<li className="list-inline-item me-0"
	>
			
	<i className="fas fa-star text-warning"
	>
	</i>

	</li>

			
	<li className="list-inline-item me-0"
	>
			
	<i className="fas fa-star text-warning"
	>
	</i>

	</li>

			
	<li className="list-inline-item me-0"
	>
			
	<i className="far fa-star-half-stroke text-warning"
	>
	</i>

	</li>

			
	<li className="list-inline-item me-0"
	>
			(08 reviews)
	</li>

	</ul>

	</div>

	</div>

			
	<a className="btn btn-sm btn-light flex-shrink-0 mb-0 ms-3" href="#"
	>
			View
	</a>

	</div>

			
	<hr
	>
	</hr>

			
	<div className="d-flex justify-content-between align-items-center"
	>
			
	<div className="d-sm-flex align-items-center mb-1 mb-sm-0"
	>
			
	<div className="flex-shrink-0"
	>
			
	<img className="rounded h-60px" alt="" src="assets/images/category/hotel/4by3/02.jpg"
	>
	</img>

	</div>

			
	<div className="ms-sm-3 mt-2 mt-sm-0"
	>
			
	<h6 className="mb-1"
	>
			Rock Family Suite
	</h6>

			
	<ul className="list-inline smaller mb-0"
	>
			
	<li className="list-inline-item me-0"
	>
			
	<i className="fas fa-star text-warning"
	>
	</i>

	</li>

			
	<li className="list-inline-item me-0"
	>
			
	<i className="fas fa-star text-warning"
	>
	</i>

	</li>

			
	<li className="list-inline-item me-0"
	>
			
	<i className="fas fa-star text-warning"
	>
	</i>

	</li>

			
	<li className="list-inline-item me-0"
	>
			
	<i className="fas fa-star text-warning"
	>
	</i>

	</li>

			
	<li className="list-inline-item me-0"
	>
			
	<i className="far fa-star-half-stroke text-warning"
	>
	</i>

	</li>

			
	<li className="list-inline-item me-0"
	>
			(11 reviews)
	</li>

	</ul>

	</div>

	</div>

			
	<a className="btn btn-sm btn-light flex-shrink-0 mb-0 ms-3" href="#"
	>
			View
	</a>

	</div>

	</div>

	</div>

	</div>

	</div>

	</div>

	</div>

	</main>

			
		</ErrorBoundary>
	);
}

const mapStateToProps = function(state){
    return state.reducer
}

export default connect(mapStateToProps, null) ( Container );