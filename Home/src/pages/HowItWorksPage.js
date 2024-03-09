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
			isLoggedIn,
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
			
	<div className="container" d-partial-id="1263"
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
			
	<a className="nav-link" aria-expanded="false" aria-haspopup="true" data-bs-toggle="dropdown" href="" id="accounntMenu-3"
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
			 
			
	<Link className="nav-link" id="it7fz5-3" target="_self" to="/login" type="spa"
	>
			Sign in
	</Link>

	</li>

			
	<li className="nav-item"
	>
			 
			
<Fragment>
{ isLoggedIn &&
	<a className="nav-link" href="" onClick={(e) => {
			var value = e.target.value; runAction({name: "LOGOUT"});
		}}
	>
			Log out
	</a>}</Fragment>

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

			
	<ToggleWrapper className="d-dropdown DropDown d--open" id="im5n3g"
	>
			
	<div className="d-dropdown-toggle" id="ih2wbt" role="d-toggle-button"
	>
			
	<i className="fas fa-angle-down d-icon-dropdown-toggle"
	>
	</i>

			
	<span id="ivzvuf"
	>
			Menu
	</span>

	</div>

			
	<div className="d-dropdown-list" id="i4chjf" role="d-toggle-wrapper"
	>
			
	<a className="d-dropdown-link" id="iqy4hi" onClick={(e) => {
			var value = e.target.value; runAction({name: "GOHOSTDASHBOARD"});
		}}
	>
			Dashboard
	</a>

			
	<a className="d-dropdown-link" id="ijbe7j" onClick={(e) => {
			var value = e.target.value; runAction({name: "GOSUPPORT"});
		}}
	>
			Support
	</a>

			
	<a className="d-dropdown-link" id="i5h2ch" onClick={(e) => {
			var value = e.target.value; runAction({name: "GOADDPROPERTY"});
		}}
	>
			Add Listing
	</a>

			
	<a className="d-dropdown-link" id="i07qh4i" onClick={(e) => {
			var value = e.target.value; runAction({name: "LOGOUT"});
		}}
	>
			Log out
	</a>

	</div>

	</ToggleWrapper>

	</div>

	</nav>

	</header>

			
				
	<main id="igv4n6"
	>
			
	<section className="pt-4 pt-md-5"
	>
			
	<div className="container"
	>
			
	<div className="row g-4 align-items-center"
	>
			
	<div className="col-lg-7"
	>
			
	<h1 className="mb-4 display-5"
	>
			FIND THE
			
	<div className="gjs-selected" draggable="true" id="ifunji"
	>
			YOU DESERVE.
			
	<h1 className="Heading_6" data-highlightable="1" draggable="true" id="ikbsop"
	>
			VALUE
	</h1>

	</div>

	</h1>

			
	<p className="mb-4"
	>
			Speedily say has suitable disposal add boy. On forth doubt miles of child. Exercise joy man children rejoiced.
	</p>

			
	<Link className="btn btn-primary-soft mb-4" to="" type="spa" onClick={(e) => {
			var value = e.target.value; runAction({name: "GOADDPROPERTY"});
		}}
	>
			Add Listing 
			
	<i className="fa-solid fa-arrow-right-long fa-fw"
	>
	</i>

	</Link>

			
	<h6 className="fw-normal mb-1"
	>
			Create New Listing
	</h6>

			
	<ul className="list-group list-group-borderless mb-0 small"
	>
			
	<li className="list-group-item d-flex mb-0"
	>
			More than 5.1 million holiday rentals already listed 
					
			
	<i className="fa-solid text-success me-2 mt-1 fas fa-check"
	>
	</i>

	</li>

			
	<li className="list-group-item d-flex mb-0"
	>
			Bed one supposing breakfast day fulfilled off depending questions.
					
			
	<i className="fa-solid text-success me-2 mt-1 fas fa-check"
	>
	</i>

	</li>

			
	<li className="list-group-item d-flex mb-0"
	>
			The difference in the cost shall be borne by the client in case.
					
			
	<i className="fa-solid text-success me-2 mt-1 fas fa-check"
	>
	</i>

	</li>

	</ul>

	</div>

			
	<div className="col-lg-5 text-center"
	>
			
	<img className="Image_11 shadow" alt="" id="ift5u5" src="https://dittofipublicfiles.s3.us-west-2.amazonaws.com/2187/4657-2.png"
	>
	</img>

	</div>

	</div>

	</div>

	</section>

			
	<section className="pt-0"
	>
			
	<div className="container"
	>
			
	<div className="row g-4 align-items-center"
	>
			
	<div className="col-sm-6 col-md-3"
	>
			
	<h4 className="mb-0"
	>
			Numbers In Nationwide
	</h4>

	</div>

			
	<div className="col-sm-6 col-md-3"
	>
			
	<div className="card card-body text-center bg-light"
	>
			
	<div className="d-flex justify-content-center"
	>
			
	<h3 className="purecounter text-orange mb-0" data-purecounter-delay="300" data-purecounter-end="28" data-purecounter-start="0"
	>
			1.5k
	</h3>

	</div>

			
	<h6 className="fw-normal mb-0"
	>
			Total Users
	</h6>

	</div>

	</div>

			
	<div className="col-sm-6 col-md-3"
	>
			
	<div className="card card-body text-center bg-light"
	>
			
	<div className="d-flex justify-content-center"
	>
			
	<h3 className="purecounter text-info mb-0" data-purecounter-delay="300" data-purecounter-end="51" data-purecounter-start="0"
	>
			20
	</h3>

	</div>

			
	<h6 className="fw-normal mb-0"
	>
			States Listed
	</h6>

	</div>

	</div>

			
	<div className="col-sm-6 col-md-3"
	>
			
	<div className="card card-body text-center bg-light"
	>
			
	<div className="d-flex justify-content-center"
	>
			
	<h3 className="purecounter text-primary mb-0" data-purecounter-delay="300" data-purecounter-end="41" data-purecounter-start="0"
	>
			$5k
	</h3>

	</div>

			
	<h6 className="fw-normal mb-0"
	>
			Average Host Earnings
	</h6>

	</div>

	</div>

	</div>

	</div>

	</section>

			
	<section className="pt-0 pt-md-5"
	>
			
	<div className="container"
	>
			
	<div className="row"
	>
			
	<div className="col-12"
	>
			
	<div className="bg-light p-4 p-sm-5 rounded-3"
	>
			
	<h2 className="fs-3 text-center mb-4 mb-sm-5"
	>
			How It Works!
	</h2>

			
	<div className="row g-4"
	>
			
	<div className="col-md-6"
	>
			
	<div className="card card-body p-4"
	>
			
	<div id="idjs1b"
	>
			
	<img alt="" id="ijfhy7" src="https://dittofipublicfiles.s3.us-west-2.amazonaws.com/2187/4659-add property.png"
	>
	</img>

	</div>

			
	<h5 id="if4qp8"
	>
			Add your property 1x 
	</h5>

			
	<p className="mb-0"
	>
			Speedily say has suitable disposal add boy. On forth doubt miles of child. Exercise joy man children rejoiced.
	</p>

	</div>

	</div>

			
	<div className="col-md-6"
	>
			
	<div className="card card-body p-4"
	>
			
	<div id="itvcfv"
	>
			
	<img alt="" id="iy1spg" src="https://dittofipublicfiles.s3.us-west-2.amazonaws.com/2187/4660-add listing.png"
	>
	</img>

	</div>

			
	<h5 id="iy1qp6"
	>
			List your property with any partner site...anytime
	</h5>

			
	<p className="mb-0"
	>
			Two before narrow not relied on how except moment myself Dejection assurance Mrs led certainly open Betrayed.
	</p>

	</div>

	</div>

			
	<div className="col-md-6"
	>
			
	<div className="card card-body p-4"
	>
			
	<div id="ichyki"
	>
			
	<img alt="" id="iceysc" src="https://dittofipublicfiles.s3.us-west-2.amazonaws.com/2187/4661-booking request.png"
	>
	</img>

	</div>

			
	<h5 id="id8yw9"
	>
			Approve booking requests
	</h5>

			
	<p className="mb-0"
	>
			Rooms oh fully taken by worse do. Points afraid but may end law.Points afraid but may end law.
	</p>

	</div>

	</div>

			
	<div className="col-md-6"
	>
			
	<div className="card card-body p-4"
	>
			
	<div id="iudp43f"
	>
			
	<img alt="" id="iqqc2g" src="https://dittofipublicfiles.s3.us-west-2.amazonaws.com/2187/4662-earnings.png"
	>
	</img>

	</div>

			
	<h5 id="icygal"
	>
			Get paid!
	</h5>

			
	<p className="mb-0"
	>
			Prospective should start broadly and then narrow their list down to colleges that best fit experts
	</p>

	</div>

	</div>

	</div>

	</div>

	</div>

	</div>

	</div>

	</section>

			
	<section className="DivBlock_8" id="i65big"
	>
			
	<div className="row justify-content-between mb-5"
	>
			
	<div className="col-md-6"
	>
			
	<h2 className="Heading_3" id="i9180l"
	>
			 VALUE 
			
	<a className="link" href="" id="i7ofy73"
	>
			See the
	</a>

			
	<a className="link" href="" id="iluy4vp"
	>
			you could generate:
	</a>

	</h2>

	</div>

	</div>

			
	<div className="container bg-light- p-4- p-sm-5- rounded-3"
	>
			
	<div className="col-md-8 card card-body shadow p-4"
	>
			
	<ToggleWrapper className="d-modal" activetab="0" id="i116cfk"
	>
			
	<button className="d-button" id="iajknge" role="d-toggle-button"
	>
			Modal Button
	</button>

			
	<div className="d-modal-wrapper ModalWrapper" id="iywr0x3" role="d-toggle-wrapper d-with-portal"
	>
			
	<div className="d-modal-box ModalBox" id="ius4fsf"
	>
			
	<div className="d-modal-header ModalHeader" id="ivyix6q"
	>
			
	<h4 id="ih9jurn"
	>
			Your Profit Potential!
	</h4>

			
	<i className="fas fa-times" role="d-toggle-button"
	>
	</i>

	</div>

			
	<div id="i3c2li6"
	>
			
	<img id="ia2ygmg" src="https://dittofipublicfiles.s3.us-west-2.amazonaws.com/2187/3434-profit calculator.png"
	>
	</img>

	</div>

			
	<div className="d-modal-footer ModalFooter" id="iind799"
	>
			
	<button className="d-button btn btn-success" id="iy4klej"
	>
			Get Started!
	</button>

	</div>

	</div>

	</div>

	</ToggleWrapper>

			
	<div className="d-container Container_4" id="iejcxw"
	>
			
	<h4 className="Heading_14" id="i7ufui"
	>
			ACRE ACCESS PROFIT CALCULATOR
	</h4>

	</div>

			
	<div className="d-row" id="iq296hn" layout="3/3/3/3"
	>
			
	<div className="d-col d-col-medium-12 d-col-small-12 d-col-tiny-12 d-col-6 d-col-3" id="isj0rb9"
	>
			
	<p className="Paragraph_4" id="iusqat"
	>
			
	<b
	>
			Acres:
	</b>

	</p>

			
	<input className="d-input form-control" id="iw3t6l" placeholder="Ex: 123" type="number"
	>
	</input>

	</div>

			
	<div className="d-col d-col-medium-12 d-col-small-12 d-col-tiny-12 d-col-6 d-col-3 Column_17" id="igxx62d"
	>
			
	<p className="Paragraph_3" id="i93ohb"
	>
			
	<b
	>
			Activity: (What are you willing to rent your property for?)
	</b>

	</p>

			
	<div className="DivBlock_6" id="i4bvcq"
	>
			
	<label className="d-checkbox" id="il3hdd" type="checkbox"
	>
			
	<input className="d-checkbox-input" id="i0nkzo" type="checkbox"
	>
	</input>

			
	<label className="d-form-label" id="is3erb" type="checkbox"
	>
			Group Events
	</label>

	</label>

			
	<label className="d-checkbox" id="imd9tg" type="checkbox"
	>
			
	<input className="d-checkbox-input" id="ijofej" type="checkbox"
	>
	</input>

			
	<label className="d-form-label" id="icztpq" type="checkbox"
	>
			Photography
	</label>

	</label>

			
	<label className="d-checkbox" id="ilcv94" type="checkbox"
	>
			
	<input className="d-checkbox-input" id="iwun0t" type="checkbox"
	>
	</input>

			
	<label className="d-form-label" id="in29lb" type="checkbox"
	>
			Birding
	</label>

	</label>

			
	<label className="d-checkbox" id="iqakop" type="checkbox"
	>
			
	<input className="d-checkbox-input" id="i5e3ob" type="checkbox"
	>
	</input>

			
	<label className="d-form-label" id="ihvb4m" type="checkbox"
	>
			Parking 
	</label>

	</label>

	</div>

	</div>

			
	<div className="d-col d-col-medium-12 d-col-small-12 d-col-tiny-12 d-col-6 Column_18" id="i3j0vdu"
	>
			
	<p className="Paragraph_5" id="iebp3o"
	>
			
	<b
	>
			State:
	</b>

	</p>

			
	<select className="form-select js-choice" data-search-enabled="true" name="<nil>" onChange={(e) => {
			var value = e.target.value; dispatch({type: "change_input", payload:{name: e.target.name, value }});
		}}
	>
			
	<option value=""
	>
			Select state
	</option>

			
	<option value="Alabama"
	>
			Alabama
	</option>

			
	<option value="Alaska"
	>
			Alaska
	</option>

			
	<option value="Arizona"
	>
			Arizona
	</option>

			
	<option value="Arkansas"
	>
			Arkansas
	</option>

			
	<option value="California"
	>
			California
	</option>

			
	<option value="Colorado"
	>
			Colorado
	</option>

			
	<option value="Connecticut"
	>
			Connecticut
	</option>

			
	<option value="Delaware"
	>
			Delaware
	</option>

			
	<option value="District of Columbia"
	>
			District of Columbia
	</option>

			
	<option value="Florida"
	>
			Florida
	</option>

			
	<option value="Georgia"
	>
			Georgia
	</option>

			
	<option value="Hawaii"
	>
			Hawaii
	</option>

			
	<option value="Idaho"
	>
			Idaho
	</option>

			
	<option value="Illinois"
	>
			Illinois
	</option>

			
	<option value="Indiana"
	>
			Indiana
	</option>

			
	<option value="Iowa"
	>
			Iowa
	</option>

			
	<option value="Kansas"
	>
			Kansas
	</option>

			
	<option value="Kentucky"
	>
			Kentucky
	</option>

			
	<option value="Louisiana"
	>
			Louisiana
	</option>

			
	<option value="Maine"
	>
			Maine
	</option>

			
	<option value="Maryland"
	>
			Maryland
	</option>

			
	<option value="Massachusetts"
	>
			Massachusetts
	</option>

			
	<option value="Michigan"
	>
			Michigan
	</option>

			
	<option value="Minnesota"
	>
			Minnesota
	</option>

			
	<option value="Mississippi"
	>
			Mississippi
	</option>

			
	<option value="Missouri"
	>
			Missouri
	</option>

			
	<option value="Montana"
	>
			Montana
	</option>

			
	<option value="Nebraska"
	>
			Nebraska
	</option>

			
	<option value="Nevada"
	>
			Nevada
	</option>

			
	<option value="New Hampshire"
	>
			New Hampshire
	</option>

			
	<option value="New Jersey"
	>
			New Jersey
	</option>

			
	<option value="New Mexico"
	>
			New Mexico
	</option>

			
	<option value="New York"
	>
			New York
	</option>

			
	<option value="North Carolina"
	>
			North Carolina
	</option>

			
	<option value="North Dakota"
	>
			North Dakota
	</option>

			
	<option value="Ohio"
	>
			Ohio
	</option>

			
	<option value="Oklahoma"
	>
			Oklahoma
	</option>

			
	<option value="Oregon"
	>
			Oregon
	</option>

			
	<option value="Pennsylvania"
	>
			Pennsylvania
	</option>

			
	<option value="Rhode Island"
	>
			Rhode Island
	</option>

			
	<option value="South Carolina"
	>
			South Carolina
	</option>

			
	<option value="South Dakota"
	>
			South Dakota
	</option>

			
	<option value="Tennessee"
	>
			Tennessee
	</option>

			
	<option value="Texas"
	>
			Texas
	</option>

			
	<option value="Utah"
	>
			Utah
	</option>

			
	<option value="Vermont"
	>
			Vermont
	</option>

			
	<option value="Virginia"
	>
			Virginia
	</option>

			
	<option value="Washington"
	>
			Washington
	</option>

			
	<option value="West Virginia"
	>
			West Virginia
	</option>

			
	<option value="Wisconsin"
	>
			Wisconsin
	</option>

			
	<option value="Wyoming"
	>
			Wyoming
	</option>

	</select>

	</div>

			
	<div className="d-col d-col-medium-12 d-col-small-12 d-col-tiny-12 d-col-6 Column_19" id="izct2f4"
	>
			
	<p className="Paragraph_2" id="il1uo4"
	>
			
	<b
	>
			Email:
	</b>

	</p>

			
	<input className="d-input form-control" id="i7rtba" name="0d895abf-492b-45ba-b9be-5896457f95ec.104490" placeholder="john.smith@gmail.com" type="email" onChange={(e) => {
			var value = e.target.value; dispatch({type: "change_input", payload:{name: e.target.name, value }});
		}}
	>
	</input>

	</div>

	</div>

			
	<div className="d-flex DivBlock" id="i5uqvx"
	>
	</div>

			
	<ToggleWrapper className="d-modal d--closed" activetab="0" id="iyooav8"
	>
			
	<button className="d-button btn btn-success bg-success" id="i8y8ui" role="d-toggle-button"
	>
			See my potential
	</button>

			
	<div className="d-modal-wrapper" id="im36lt9" role="d-toggle-wrapper d-with-portal"
	>
			
	<div className="d-modal-box"
	>
			
	<div className="d-modal-header" id="ih1b5jh"
	>
			
	<h4 id="idz1rd5"
	>
			Profit Potential
	</h4>

			
	<i className="fas fa-times" role="d-toggle-button"
	>
	</i>

	</div>

			
	<div className="d-modal-body" id="i4oenui"
	>
			
	<div id="id3xpka"
	>
			
	<h3 className="Heading_12" id="icjwcti"
	>
			According to our calculations, your properties profit potential is....
	</h3>

	</div>

			
	<h1 className="Heading_13" id="ir00cmh"
	>
			$3,000 - $10k per year!
	</h1>

	</div>

			
	<div className="d-modal-footer" id="i1flirk"
	>
			
	<button className="d-button Button_6" id="idtn3oy" onClick={(e) => {
			var value = e.target.value; runAction({name: "GOADDPROPERTY"});
		}}
	>
			Get started now!
	</button>

	</div>

	</div>

	</div>

	</ToggleWrapper>

	</div>

	</div>

	</section>

			
	<section className="DivBlock_10" id="i28hh3"
	>
			
	<div className="container"
	>
			
	<div className="row g-4"
	>
			
	<div className="col-12"
	>
			
	<div className="card card-body shadow p-4"
	>
			
	<div className="row g-4 justify-content-between align-items-center"
	>
			
	<div className="col-sm-3 col-lg-2"
	>
			
	<img alt="" id="iem7lp" src="https://dittofipublicfiles.s3.us-west-2.amazonaws.com/2187/3377-3d logo w: shadow.png"
	>
	</img>

	</div>

			
	<div className="col-sm-9 col-lg-6 col-xl-7"
	>
			
	<h4 id="iizvio"
	>
			Get The Value You Deserve!
	</h4>

			
	<p className="mb-0"
	>
			Regain the control of your property. become a host today...what are you waiting for!
	</p>

	</div>

			
	<div className="col-lg-3 d-grid"
	>
			
	<button className="d-button btn btn-success" id="i4f4w4n" onClick={(e) => {
			var value = e.target.value; runAction({name: "CREATEPROPERTY"});
		}}
	>
			Become a host!
	</button>

	</div>

	</div>

	</div>

	</div>

	</div>

	</div>

	</section>

			
	<footer className="bg-dark pt-5" d-partial-id="1262"
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