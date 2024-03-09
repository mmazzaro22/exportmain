import React from 'react';

function makeTypeChecker(tabsRole) {
	return (component) => {
		// DOM element.
		if(React.isValidElement(component) && typeof component.type === 'string') {
        	return component.type;
    	} else if (!component.type) {
    		return "";
    	}

		let typeName = component.type.displayName === "ComponentWrapper" ? component.props.type : component.type.displayName;
		if(typeName && typeName.startsWith("Connect(")) {
	        if(component.type.WrappedComponent.displayName && component.type.WrappedComponent.displayName !== "ComponentWrapper") {
	            typeName = component.type.WrappedComponent.displayName;
	        } else if(component.props.wrappedComponent) {
	            typeName = component.props.wrappedComponent.displayName;
	        }
	    }

		return typeName === tabsRole;
	}
}

export const isTab = makeTypeChecker('Tab');
export const isTabList = makeTypeChecker('TabList');
export const isTabPanel = makeTypeChecker('TabPanel');
