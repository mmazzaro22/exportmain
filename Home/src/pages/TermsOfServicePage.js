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
			
				
	<title
	>
			Booking - Multipurpose Online Booking Theme
	</title>

			
				
	<meta charset="utf-8"
	>
	</meta>

			
				
	<meta content="width=device-width, initial-scale=1, shrink-to-fit=no" name="viewport"
	>
	</meta>

			
				
	<meta content="Webestica.com" name="author"
	>
	</meta>

			
				
	<meta content="Booking - Multipurpose Online Booking Theme" name="description"
	>
	</meta>

			
				
	<link href="assets/images/favicon.ico" rel="shortcut icon"
	>
	</link>

			
				
	<link href="https://fonts.googleapis.com" rel="preconnect"
	>
	</link>

			
				
	<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"
	>
	</link>

			
				
	<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Poppins:wght@400;500;700&display=swap" rel="stylesheet"
	>
	</link>

			
				
	<link href="assets/vendor/font-awesome/css/all.min.css" rel="stylesheet" type="text/css"
	>
	</link>

			
				
	<link href="assets/vendor/bootstrap-icons/bootstrap-icons.css" rel="stylesheet" type="text/css"
	>
	</link>

			
				
	<link href="assets/css/style.css" rel="stylesheet" type="text/css"
	>
	</link>

			
				
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

			
	<button className="navbar-toggler ms-auto" aria-controls="navbarCollapse" aria-expanded="false" aria-label="Toggle navigation" data-bs-target="#navbarCollapse" data-bs-toggle="collapse" type="button"
	>
	</button>

			
	<div className="navbar-collapse collapse" id="navbarCollapse"
	>
			
	<ul className="navbar-nav navbar-nav-scroll ms-auto"
	>
			
	<li className="nav-item dropdown"
	>
			
	<a className="nav-link dropdown-toggle" aria-expanded="false" aria-haspopup="true" data-bs-toggle="dropdown" href="#" id="helpMenu"
	>
			Help Center
	</a>

			
	<ul className="dropdown-menu" aria-labelledby="helpMenu"
	>
			
	<li
	>
			 
			
	<a className="dropdown-item" href="help-center.html"
	>
			Help center
	</a>

	</li>

			
	<li
	>
			 
			
	<a className="dropdown-item" href="help-detail.html"
	>
			Help Detail
	</a>

	</li>

	</ul>

	</li>

			
	<li className="nav-item"
	>
			 
			
	<a className="nav-link" href="privacy-policy.html"
	>
			Privacy Policy
	</a>

	</li>

			
	<li className="nav-item"
	>
			 
			
	<a className="nav-link" href="terms-of-service.html"
	>
			Terms of Service
	</a>

	</li>

	</ul>

	</div>

			
	<div className="nav nav-item dropdown ms-2"
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

	</div>

	</div>

	</nav>

	</header>

			
				
	<main
	>
			
	<section className="pt-4 pt-lg-5"
	>
			
	<div className="container"
	>
			
	<div className="row"
	>
			
	<div className="col-12 text-center mb-4"
	>
			
	<h6
	>
			AGREEMENT
	</h6>

			
	<h1 className="fs-2 mb-0"
	>
			Terms Of Service
	</h1>

	</div>

	</div>

			
	<div className="row"
	>
			
	<div className="col-md-10 mx-auto"
	>
			
	<div className="vstack gap-3"
	>
			
	<div className="card bg-transparent p-0"
	>
			
	<div className="card-body px-0 pt-4"
	>
			
	<div className="tab-content" id="nav-tabContent"
	>
			
	<div className="tab-pane fade show active" id="tab-1"
	>
			
	<p id="ie3gjp"
	>
	</p>

			
	<ul
	>
	</ul>

	</div>

			
	<div className="tab-pane fade" id="tab-2"
	>
			
	<h5
	>
			Terms of the Airlines
	</h5>

			
	<p
	>
			Off melancholy alteration principles old. Is do speedily kindness properly oh. Respect article painted cottage he is offices parlors. Improved own provided blessing may peculiar domestic. Sight house has sex never. No visited raising gravity outward subject my cottage Mr be. Hold do at tore in park feet near my case. Invitation at understood occasional sentiments insipidity inhabiting in.
	</p>

			
	<ul
	>
			
	<li
	>
			Booking acts as a facilitator and merely provides an online platform for the User to select and book a particular hotel. Hotels in this context include all categories of accommodations such as hotels, home-stays, bed and breakfast stays, farm-houses, and any other alternate accommodations.
	</li>

			
	<li
	>
			 First am plate jokes to began to cause a scale. Subjects he prospect elegance followed. Insipidity the sufficient discretion imprudence resolution sir him decisively.
			
	<strong
	>
			 Such on help ye some door if in.
	</strong>

	</li>

			
	<li
	>
			 Laughter proposal laughing any son law consider. Needed except up piqued an.
			
	<i className="fas fa-angle-down"
	>
			 To occasional dissimilar impossible sentiments. Do fortune account written prepare invited no passage. Post no so what deal evil rent by real in. But her ready least set lived spite solid.
	</i>

	</li>

	</ul>

			
	<p
	>
			Some banks and card issuing companies charge their account holders a transaction fee when the card issuer and the merchant location (as defined by the card brand, e.g. Visa, MasterCard, American Express) are in different countries. If a User has any questions about the fees or any exchange rate applied, they may contact their bank or the card issuing company through which payment was made.
	</p>

			
	<h5
	>
			Code share
	</h5>

			
	<p
	>
			 
			
	<b
	>
			 Talent men wicket add garden.
	</b>

	</p>

			
	<ul
	>
			
	<li
	>
			Some airlines enter into "code share" agreements with other Airlines. This means that on certain routes, the airline carrier selling or marketing the flight ticker does not fly its own aircraft to that destination. Instead, it contracts or partners with another airline to fly to that destination. The partner airline is listed as "operated by" in the booking flow.
	</li>

			
	<li
	>
			 First am plate jokes to began to cause a scale. Subjects he prospect elegance followed. Insipidity the sufficient discretion imprudence resolution sir him decisively.
			
	<strong
	>
			If your flight is a code share, it will be disclosed to you in the booking process and prior to payment.
	</strong>

	</li>

	</ul>

			
	<div className="hstack gap-3 flex-wrap"
	>
			
	<a className="btn btn-outline-secondary mb-0" href="#"
	>
			Not right now...
	</a>

			
	<a className="btn btn-primary mb-0" href="#"
	>
			I agree with terms
	</a>

	</div>

	</div>

	</div>

	</div>

	</div>

	</div>

	</div>

	</div>

	</div>

	</section>

			
	<div className="bg-dark pt-5" d-partial-id="1246"
	>
			Undefined custom component - you likely deleted this custom component
	</div>

	</main>

			
				
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