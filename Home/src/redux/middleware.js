let timers = {};

export default store => next => action => {
	// No debounce set. Run action immediately.
	if(!action.timeout || isNaN(action.timeout) || action.timeout <= 0) {
		//console.log(`Execute ${action.type} immediately`);
		return next(action);
	}

	// Clear previous debouncers.
	if(timers[action.type]) {
		clearTimeout(timers[action.type]);
		timers[action.type] = null;
	}

	// Create debounce function.
	const later = resolve => () => {
		//console.log(`Execute ${action.type} after ${action.timeout}ms`);
		resolve(next(action));
		timers[action.type] = null;
	};

	return new Promise(resolve => {
		timers[action.type] = setTimeout(later(resolve), action.timeout);
	});
}
