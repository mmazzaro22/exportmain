import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { Provider, connect } from 'react-redux';
import thunk from 'redux-thunk';
import * as effects from 'redux-saga/effects';
import { hashHistory } from 'react-router';
import { HashRouter as Router, Switch, Route, Redirect } from "react-router-dom";
import { api } from './api/rtkQuery.js';
import PostPagePage from './pages/PostPagePage';
import EditPropertyPage from './pages/EditPropertyPage';
import EditListingPage from './pages/EditListingPage';
import ListingAddedPage from './pages/ListingAddedPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import LoginPage from './pages/LoginPage';
import PropertyPage from './pages/PropertyPage';
import AddListingPage from './pages/AddListingPage';
import HelpCenterPage from './pages/HelpCenterPage';
import RegisterPage from './pages/RegisterPage';
import AddPropertyImagesPage from './pages/AddPropertyImagesPage';
import AddPropertyPage from './pages/AddPropertyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import AddNewListingPage from './pages/AddNewListingPage';
import HomePage from './pages/HomePage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import HostActivityPage from './pages/HostActivityPage';
import HostBookingsPage from './pages/HostBookingsPage';
import HostEarningsPage from './pages/HostEarningsPage';
import HostSettingsPage from './pages/HostSettingsPage';
import HostReviewPage from './pages/HostReviewPage';
import HowItWorksPage from './pages/HowItWorksPage';
import HostDashboardPage from './pages/HostDashboardPage';
import HostListingsPage from './pages/HostListingsPage';

import reducer from './redux/reducer.js';
import mainSaga from './sagas/saga.js';
import { initEffects } from './sagas/saga.js';
import myMiddleware from './redux/middleware.js';

//import './index.css';

initEffects(effects);

const sagaMiddleware = createSagaMiddleware();
const store = createStore(reducer, applyMiddleware(myMiddleware, sagaMiddleware, thunk, api.middleware));
sagaMiddleware.run(mainSaga);

class ErrorBoundary extends React.Component {
	constructor(props) {
		super(props);
		this.state = {error: ""};
	}

	componentDidCatch(error, errorInfo) {
		this.setState({error: `${error.name}: ${error.message}`});
	}

	render() {
		const {error} = this.state;
		if (error) {
			return (
				<div style={{color:"red"}}>{error}</div>
			);
		} else {
			return this.props.children;
		}
	}
}

class _App extends React.Component {
	componentDidMount() {
		const { dispatch } = this.props;
		dispatch({ type: "on_app_started" });
	}
	
	render() {
		let {
			state
		} = this.props;

		if(!state.reducer._app_initialized) {
			return (
				<div></div>
			);
		}

		return (
			<div style={{height:"100%", width:"100%"}}>
				<Router>
					<Switch>
							
							<Route  exact  path="/help_post/:helpPostId">
								<PostPagePage/>
							</Route>
							
							<Route
								 exact 
								path="/edit_property"
								render={() =>
										
state.reducer['isLoggedIn']
 == 
state.reducer['false']
 ? <Redirect to="/login" /> :
								 <EditPropertyPage/>
								}
							/>
							
							<Route  exact  path="/editListing">
								<EditListingPage/>
							</Route>
							
							<Route  exact  path="/listing_added">
								<ListingAddedPage/>
							</Route>
							
							<Route  exact  path="/reset-password">
								<ResetPasswordPage/>
							</Route>
							
							<Route  exact  path="/forgot-password">
								<ForgotPasswordPage/>
							</Route>
							
							<Route  exact  path="/login">
								<LoginPage/>
							</Route>
							
							<Route  exact  path="/property">
								<PropertyPage/>
							</Route>
							
							<Route
								 exact 
								path="/addListing"
								render={() =>
										
state.reducer['isLoggedIn']
 == 
state.reducer['false']
 ? <Redirect to="/login" /> :
								 <AddListingPage/>
								}
							/>
							
							<Route  exact  path="/help_center">
								<HelpCenterPage/>
							</Route>
							
							<Route  exact  path="/register">
								<RegisterPage/>
							</Route>
							
							<Route  exact  path="/addPropertyImages">
								<AddPropertyImagesPage/>
							</Route>
							
							<Route
								 exact 
								path="/addProperty"
								render={() =>
										
state.reducer['isLoggedIn']
 == 
state.reducer['false']
 ? <Redirect to="/login" /> :
								 <AddPropertyPage/>
								}
							/>
							
							<Route  exact  path="/terms_of_service">
								<TermsOfServicePage/>
							</Route>
							
							<Route  exact  path="/privacy-policy">
								<PrivacyPolicyPage/>
							</Route>
							
							<Route  exact  path="/addNewListing">
								<AddNewListingPage/>
							</Route>
							
							<Route  exact  path="/">
								<HomePage/>
							</Route>
							
							<Route  exact  path="/Page">
								<AdminDashboardPage/>
							</Route>
							
							<Route  exact  path="/host-activities">
								<HostActivityPage/>
							</Route>
							
							<Route
								 exact 
								path="/host-bookings"
								render={() =>
										
state.reducer['isLoggedIn']
 == 
state.reducer['false']
 ? <Redirect to="/login" /> :
								 <HostBookingsPage/>
								}
							/>
							
							<Route  exact  path="/host-earnings">
								<HostEarningsPage/>
							</Route>
							
							<Route
								 exact 
								path="/host-settings"
								render={() =>
										
state.reducer['isLoggedIn']
 == 
state.reducer['false']
 ? <Redirect to="/login" /> :
								 <HostSettingsPage/>
								}
							/>
							
							<Route  exact  path="/host-reviews">
								<HostReviewPage/>
							</Route>
							
							<Route  exact  path="/howitworks">
								<HowItWorksPage/>
							</Route>
							
							<Route
								 exact 
								path="/host-dashboard"
								render={() =>
										
state.reducer['isLoggedIn']
 == 
state.reducer['false']
 ? <Redirect to="/login" /> :
								 <HostDashboardPage/>
								}
							/>
							
							<Route
								 exact 
								path="/host-listing"
								render={() =>
										
state.reducer['isLoggedIn']
 == 
state.reducer['false']
 ? <Redirect to="/login" /> :
								 <HostListingsPage/>
								}
							/>
					</Switch>
				</Router>
			</div>
		);
	}
}

const mapStateToProps = function(state){
		return {
			state: state
		}
}

const App = connect(mapStateToProps, null)( _App );

ReactDOM.render(
	<Provider store={store}>
		<ErrorBoundary>
			<App />
		</ErrorBoundary>
	</Provider>, document.getElementById('root')
);
