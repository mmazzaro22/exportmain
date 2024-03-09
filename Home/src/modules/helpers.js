import React, { Children, cloneElement, isValidElement } from 'react';
import _ from "lodash";

export const TriggerTypes = {
    // click events
    onclick: 'onClick',
    ondblclick: 'onDoubleClick',

    // mouse events
    onmousedown: 'onMouseDown',
    onmouseenter: 'onMouseEnter',
    onmouseleave: 'onMouseLeave',
    onmousemove: 'onMouseMove',
    onmouseout: 'onMouseOut',
    onmouseover: 'onMouseOver',
    onmouseup: 'onMouseUp',
    onmouseleave: 'onMouseLeave',

    // input events
    onblur: 'onBlur',
    onchange: 'onChange',
    onfocus: 'onFocus',
    onselect: 'onSelect',
    onsubmit: 'onSubmit',
    onreset: 'onReset',
    onkeydown: 'onKeyDown',
    onkeypress: 'onKeyPress',
    onkeyup: 'onKeyUp',

    // component events
    onload: 'onload',
    onlocationchange: 'onlocationchange',

    // drag events
    ondrag: 'onDrag',
    ondragend: 'onDragEnd',
    ondragenter: 'onDragEnter',
    ondragexit: 'onDragExit',
    ondragleave: 'onDragLeave',
    ondragstart: 'onDragStart',
    ondrop: 'onDrop',
}

export function getTriggerEvents(actions, dispatch) {
    let droppable = false;
    let events = {};
    if(actions) {
        actions.forEach((a) => {
            let trigger = TriggerTypes[a.trigger];
            if(trigger) {
                events[trigger] = (e) =>  {
                    e.preventDefault();
                    runAction(a, dispatch);
                }

                if(trigger === TriggerTypes.ondrop) {
                    droppable = true;
                }
            }
        });
    }

    if(droppable) {
        events['onDragOver'] = (e) => {
            e.preventDefault();
        }
    }
    
    return events;
}

export function checkForTrigger(actions, triggerType) {
    return actions && actions.some((a) => a.trigger === triggerType);
}

export function onTrigger(actions, triggerType, dispatch) {
    if(actions) {
        actions.forEach((a) => {
            if(a.trigger === triggerType) {
                runAction(a, dispatch);
            }
        })
    }
}

export function checkForOnClick(actions) {
    let hasOnClick = false;
    if(actions) {
        actions.forEach((a) => {
            if (a.trigger === "onclick") {
                hasOnClick = true;
            }
        })
    }
    return hasOnClick;
}

export function onClickTrigger(actions, dispatch) {
    if (actions) {
        actions.forEach((a) => {
            if(a.trigger === "onclick") {
                runAction(a, dispatch);
            }
        })
    }
}

export function checkForOnChange(actions) {
    let hasOnClick = false;
    if(actions) {
        actions.forEach((a) => {
            if (a.trigger === "onchange") {
                hasOnClick = true;
            }
        })
    }
    return hasOnClick;
}

export function onChangeTrigger(actions, dispatch) {
    if (actions) {
        actions.forEach((a) => {
            if(a.trigger === "onchange") {
                runAction(a, dispatch);
            }
        })
    }
}

export function onLoadTrigger(actions, dispatch) {
    if (actions) {
        actions.forEach((a) => {
            if(a.trigger === "onload") {
                runAction(a, dispatch);
            }
        })
    }
}

function runAction(action, dispatch) {
    const action_name = action.action.replace(/\s/g, "_").toUpperCase();

    console.log(action);
    
    if(action.stop === true) {
        stopPoll(action_name);
    } else {    
        // Handle running action once or polling.
        (action.pollingPeriod && !isNaN(action.pollingPeriod) && action.pollingPeriod > 0)
            ? startPoll(action_name, dispatch, action.pollingPeriod)
            : dispatch({ 
                type: action_name, 
                inputVariables: action.inputVariables ? action.inputVariables : {}, 
                timeout: (action.timeout && !isNaN(action.timeout) && action.timeout > 0) ? action.timeout : null 
            });
    }
}

export var options;
export function setOptions(opts) {
    options = opts;
}

// Ensures the URL is prefixed with http or https
export function prefixUrl(url) {
    if (!/^https?:\/\//i.test(url)) {
        url = 'http://' + url;
    }

    return url;
}

export function baseUrl() {
    const { hostname, port, protocol } = window.location;
    if(hostname === "localhost") {
        return "http://localhost:8080";
    }

    return `${protocol}//${hostname}:${port}`;
}

export function getValue(d, dataSetValue) {
    let val;
    if(_.isObject(d)) {
        if(dataSetValue && d[dataSetValue]) {
            val = d[dataSetValue];
        }
    } else {
        val = d;
    }

    return isNaN(val) ? val : Number(val);
}

export function sortAsc(arr, field) {
    return arr.sort(function (a, b) {
       let x = getValue(a, field);
       let y = getValue(b, field);

       if(x > y) {
            return 1;
        }

        if(y > x) {
            return -1;
        }
        
        return 0;
    })
}

export function sortDesc(arr, field) {
    return arr.sort(function (a, b) {
    if (a[field] > b[field]) {
        return -1;
    }
    if (b[field]> a[field]) {
        return 1;
    }
        return 0;
    })
}

export function render(props) {
    const { style, className } = props;

    if (typeof props.children === "function") {
        return <div style={style} className={className}>{props.children()}</div>;
    }

    return <div style={style} className={className}>{props.children || null}</div>;
}

export function getTypeName(component) {
    // DOM element.
    if(React.isValidElement(component) && typeof component.type === 'string') {
        return component.type;
    }

    // React component (possibly wrapped in test mode).
    let typeName = component.type.displayName === "ComponentWrapper" ? component.props.type : component.type.displayName;
    if(typeName.startsWith("Connect(")) {
        if(component.type.WrappedComponent.displayName && component.type.WrappedComponent.displayName !== "ComponentWrapper") {
            typeName = component.type.WrappedComponent.displayName;
        } else if(component.props.wrappedComponent) {
            typeName = component.props.wrappedComponent.displayName;
        }
    }

    // Remove redux wrapper.
    return typeName;
}

export function getTypeProps(component) {
    return component.type.displayName === "ComponentWrapper" ? component.props.wrappedProps : component.props;
}

export function hasChildren(element) {
    return isValidElement(element) && element.props.children;
}

export function hasComplexChildren(element) {
    return isValidElement(element) && hasChildren(element)
        && Children.toArray(element.props.children).reduce((res, child) => res || isValidElement(child), false);
}

export function deepMap(children, deepMapFn) {
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

// check to see if there are duplicates for array values
// d = dataset
// v = dataset value name
export function checkArrayXAxisData(d, v) {
    let duplicate = false;
    d.map((x, i) => {
        d.map((j,k) => {
            if (i !== k && x[v] === j[v]) {
                duplicate = true;
            }
        })
    })
    return duplicate;
}

var tasks = {};
export function startPoll(action_name, dispatch, pollingPeriod) {
    // Prevent polling the same action more than once.
    if(tasks[action_name]) {
        console.warn(`You're attempting to poll ${action_name} but it is already being polled.`);
        return;
    }
    
    // Handle stopping poll.
    let canceled = false;
    const cancel = () => canceled = true;
    tasks[action_name] = cancel;

    // Poll action.
    const poll = () => {
        if(canceled) {
            return;
        }

        dispatch({ type: action_name });
        setTimeout(() => poll(), pollingPeriod);
    }

    poll();
}

export function stopPoll(action_name) {
    // Prevent polling the same action more than once.
    if(!tasks[action_name]) {
        console.warn(`You're attempting to stop polling ${action_name} but it this action is not running.`);
        return;
    }

    tasks[action_name]();
}

export function isInteger(value) {
    return typeof value === 'number' && isFinite(value) && Math.floor(value) === value;
}