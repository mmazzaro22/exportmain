import * as actions from '../redux/actions.js';
import * as serverApi from '../api/api.js';
import _ from "lodash";
import { eventChannel, END } from 'redux-saga';
import * as Yup from 'yup';
import * as ApproveBookingRequestWebService from '../api/ApproveBookingRequestWebService.js';
import * as StripeWebService from '../api/StripeWebService.js';

let call, put, take, fork, select;
export const initEffects = function(effects) {
	({call, put, take, fork, select} = effects);
	if(window.__configureStore) {
		window.__configureStore(saga);
	}
}
window.__initEffects = initEffects;

const _sounds = {};
const _paginatedEndpoints = {};

async function _runPaginatedEndpoint({ id, idx, srcEndpoint, paginatedEndpoint, srcPayload, pathKey, pathIdx } ) {
	let response;
	if(_paginatedEndpoints[id]) {
		console.log("Found paginated id. Running paginated endpoint.");
		response = await paginatedEndpoint({path_variables: { [pathKey]: _paginatedEndpoints[id], [pathIdx]: idx }});
		if(response.status === 200) {
			console.log(response);
			return response;
		} else {
			console.log("Error running paginated id");
			delete _paginatedEndpoints[id];
		}
	}
	
	// No valid pagination id try running source endpoint & then running the paginated endpoint.
	console.log("No paginated id. Running src endpoint");
	response = await srcEndpoint(srcPayload);
	if(!response || response.status !== 200) {
		return response;
	}

	const paginatedId = response.data;

	response = await paginatedEndpoint({path_variables: { [pathKey]: response.data, [pathIdx]: idx }})
	if(response.status === 200 && response.data) {
		_paginatedEndpoints[id] = paginatedId;
	}
	
	return response;
}

async function _getValidationErrors(schema, obj) {
	let validationErrors = {};
	try {
		await schema.validate(obj);
	} catch(err) {
		validationErrors = err;
	}

	return validationErrors;
}

function* log_event() {
	while(true) {
		let payload = yield take(actions.log_event);
		try {
			console.log(payload)
		} catch(error) {
			console.warn(error);
		}
	}
}

let ws;
function* createEventChannel(path) {
	return eventChannel(emit => {
		function createWs() {
			let { hostname, port, protocol } = window.location;
			protocol = protocol === "https:" ? "wss:" : "ws:";
			ws = new WebSocket( `${protocol}//${hostname}:${port}/2187/wapi${path}`);
			
			ws.onmessage = function(message) {
				let data;
				try {
					data = JSON.parse(message.data)
				} catch (e) {
					console.warn("Could not parse websocket data - expected json data.")
				}
				
				emit(data);
			};

			ws.onopen = function(evt) {
				console.log("websocket connected...");
			};

			ws.onerror = function() { 
				console.log("websocket errored...");
			};

			ws.onclose = function(e) {
				if(e.code === 1005) {
					console.log("websocket closed...");
					emit(END);
				} else {
					console.log("websocket closed unexpectedly. Attempting to reconnect in 4 seconds...");
					setTimeout(() =>  {
	                    createWs();
	                }, 4000);
				}
			}
		}

		createWs();

		return () => {
			console.log("websocket closed...");
			ws.close();
		};
	});
}

function* _initializeWebSocketsChannel() {
	while(true) {
		const { path } = yield take(actions.init_websocket);
		const channel = yield call(createEventChannel, path);
		while (true) {
			const { message, type } = yield take(channel);
			console.log(message);
			console.log(type);
		}
	}
}

const delay = ms => new Promise(resolve => setTimeout(() => resolve('timed out'), ms));

function* ACTION_1() {
	while(true) {
		let { inputVariables, params, history } = yield take(actions.ACTION_1);
		
		// Write page parameters to temporary state for standard access.
		let state = yield select();
		state.page = state.routing && state.routing.locationBeforeTransitions ? state.routing.locationBeforeTransitions.query : {};
		params && Object.keys(params).forEach((k) => state[k] = params[k]);
		
		let payload;
		
		try {
			
			
			let InputAmenityVariable = inputVariables["inputAmenity"]
			
			
			
			


payload = {};
payload['path_variables'] = {};
payload.path_variables['amenityName'] = InputAmenityVariable;
const response46415 = yield call(serverApi.Action21102Endpoint, payload);
const AppendAmenityVariable = response46415.data;
const AppendAmenityCodeVariable = response46415.status;
yield put(actions.logEvent({
	id: 46415,
	options: {
		path_variables: { "88668a31-a840-43a7-a60f-a63b7ac807b8":InputAmenityVariable, 
		},
		response_as: AppendAmenityVariable,
		response_code_as: AppendAmenityCodeVariable,
	},
	type: "event",
	time: Date.now()
}));
if (AppendAmenityCodeVariable == 
state.reducer['httpSuccessCode']
) {
yield put(actions.logEvent({
	id: 46417,
	options: {
		field_key: 'selectedAmenities',
		field_value: AppendAmenityVariable
	},
	type: "event",
	time: Date.now()
}));
yield put(actions.changeInput('selectedAmenities', AppendAmenityVariable));
}
		} catch(error) {
            console.warn(error)
		}
	}
}
function* APPENDAMENITIES() {
	while(true) {
		let { inputVariables, params, history } = yield take(actions.APPENDAMENITIES);
		
		// Write page parameters to temporary state for standard access.
		let state = yield select();
		state.page = state.routing && state.routing.locationBeforeTransitions ? state.routing.locationBeforeTransitions.query : {};
		params && Object.keys(params).forEach((k) => state[k] = params[k]);
		
		let payload;
		
		try {
			
			
			let SelectedAmenityNameVariable = inputVariables["selectedAmenityName"]
			
			
			
			

    state.reducer['selectedAmenities'].push(SelectedAmenityNameVariable);

		} catch(error) {
            console.warn(error)
		}
	}
}
function* APPROVEBOOKING() {
	while(true) {
		let { inputVariables, params, history } = yield take(actions.APPROVEBOOKING);
		
		// Write page parameters to temporary state for standard access.
		let state = yield select();
		state.page = state.routing && state.routing.locationBeforeTransitions ? state.routing.locationBeforeTransitions.query : {};
		params && Object.keys(params).forEach((k) => state[k] = params[k]);
		
		let payload;
		
		try {
			
			
			let BookingIdVariable = inputVariables["booking_id"]
			
			
			
			


payload = {};
payload['path_variables'] = {};
payload.path_variables['id'] = BookingIdVariable;
const response43723 = yield call(serverApi.Action20145Endpoint, payload);

const ApproveBookingRequestCodeVariable = response43723.status;
yield put(actions.logEvent({
	id: 43723,
	options: {
		path_variables: { "997a6e53-7b39-4556-bc61-c927af4469dc":BookingIdVariable, 
		},
		response_code_as: ApproveBookingRequestCodeVariable,
	},
	type: "event",
	time: Date.now()
}));
if (ApproveBookingRequestCodeVariable == 
state.reducer['httpSuccessCode']
) {
payload = {};
payload['path_variables'] = {};
payload.path_variables['creator_id'] = state.reducer?.['currentUser']?.['Id'];
const response44609 = yield call(serverApi.GetBookingsEndpoint, payload);
const GetBookingsEPRVariable = response44609.data;
const GetBookingsEPRCodeVariable = response44609.status;
yield put(actions.logEvent({
	id: 44609,
	options: {
		path_variables: { "15f75b55-f341-475b-84b1-2c042148f79c":state.reducer?.['currentUser']?.['Id'], 
		},
		response_as: GetBookingsEPRVariable,
		response_code_as: GetBookingsEPRCodeVariable,
	},
	type: "event",
	time: Date.now()
}));
}

yield put(actions.logEvent({
	id: 47116,
	options: {
	},
	type: "event",
	time: Date.now()
}));
yield put(actions.runAction("GETBOOKINGS", { inputVariables:{} }));
		} catch(error) {
            console.warn(error)
		}
	}
}
function* CHECKUSERPROPERTIES() {
	while(true) {
		let { inputVariables, params, history } = yield take(actions.CHECKUSERPROPERTIES);
		
		// Write page parameters to temporary state for standard access.
		let state = yield select();
		state.page = state.routing && state.routing.locationBeforeTransitions ? state.routing.locationBeforeTransitions.query : {};
		params && Object.keys(params).forEach((k) => state[k] = params[k]);
		
		let payload;
		
		try {
			
			
			
			
var NullCodeVariable = 500

			
			
			

const response46498 = yield call(serverApi.GetPropertiesEndpoint, null);
const GetUserPropertiesEPRVariable = response46498.data;
const GetUserPropertiesEPRCodeVariable = response46498.status;
yield put(actions.logEvent({
	id: 46498,
	options: {
		response_as: GetUserPropertiesEPRVariable,
		response_code_as: GetUserPropertiesEPRCodeVariable,
	},
	type: "event",
	time: Date.now()
}));
if (GetUserPropertiesEPRCodeVariable == NullCodeVariable) {
yield put(actions.logEvent({
	id: 46500,
	options: {
		field_key: 'userHasNoProperty',
		field_value: state.reducer['true']
	},
	type: "event",
	time: Date.now()
}));
yield put(actions.changeInput('userHasNoProperty', state.reducer['true']));
}
		} catch(error) {
            console.warn(error)
		}
	}
}
function* CLOSELOADING() {
	while(true) {
		let { inputVariables, params, history } = yield take(actions.CLOSELOADING);
		
		// Write page parameters to temporary state for standard access.
		let state = yield select();
		state.page = state.routing && state.routing.locationBeforeTransitions ? state.routing.locationBeforeTransitions.query : {};
		params && Object.keys(params).forEach((k) => state[k] = params[k]);
		
		let payload;
		
		try {
			
			
			
yield put(actions.logEvent({
	id: 45510,
	options: {
		field_key: 'Loading',
		field_value: state.reducer['false']
	},
	type: "event",
	time: Date.now()
}));
yield put(actions.changeInput('Loading', state.reducer['false']));



		} catch(error) {
            console.warn(error)
		}
	}
}
function* CREATEARRAY() {
	while(true) {
		let { inputVariables, params, history } = yield take(actions.CREATEARRAY);
		
		// Write page parameters to temporary state for standard access.
		let state = yield select();
		state.page = state.routing && state.routing.locationBeforeTransitions ? state.routing.locationBeforeTransitions.query : {};
		params && Object.keys(params).forEach((k) => state[k] = params[k]);
		
		let payload;
		
		try {
			
			
			let ReturnedArrayVariable;
try {
	ReturnedArrayVariable = window.createArray({  "myArray":state.reducer['selectedAmenities'], })
} catch(e) { }
yield put(actions.logEvent({
	id: 46583,
	options: {
		parameter_mapping: {
			 "4dbd4fde-1a20-4de8-9c64-8dcdf63fa2ca":state.reducer['selectedAmenities'], 
		},
		return_as: ReturnedArrayVariable
	},
	type: "event",
	time: Date.now()
})); 

yield put(actions.logEvent({
	id: 46584,
	options: {
		field_key: 'selectedAmenities',
		field_value: ReturnedArrayVariable
	},
	type: "event",
	time: Date.now()
}));
yield put(actions.changeInput('selectedAmenities', ReturnedArrayVariable));



		} catch(error) {
            console.warn(error)
		}
	}
}
function* CREATELISTING() {
	while(true) {
		let { inputVariables, params, history } = yield take(actions.CREATELISTING);
		
		// Write page parameters to temporary state for standard access.
		let state = yield select();
		state.page = state.routing && state.routing.locationBeforeTransitions ? state.routing.locationBeforeTransitions.query : {};
		params && Object.keys(params).forEach((k) => state[k] = params[k]);
		
		let payload;
		
		try {
			
			
			let CreateListingPartnerSiteIdVariable = inputVariables["createListingPartnerSiteId"]
			
			let CreateListingPropertyIDVariable = inputVariables["createListingPropertyID"]
			
			
			
			


payload = {};
payload['path_variables'] = {};
payload.path_variables['property_id'] = CreateListingPropertyIDVariable;
payload['body_variables'] = {};
payload.body_variables['guest_limit'] = state.reducer?.['createListingEPI']?.['guest_limit'];
payload.body_variables['price'] = state.reducer?.['createListingEPI']?.['price'];
payload.body_variables['order_type_id'] = state.reducer?.['createListingEPI']?.['order_type_id'];
payload.body_variables['partnerSiteId'] = CreateListingPartnerSiteIdVariable;
payload.body_variables['check_in_time_id'] = state.reducer?.['createListingEPI']?.['check_in_time_id'];
payload.body_variables['check_out_time_id'] = state.reducer?.['createListingEPI']?.['check_out_time_id'];
const response37775 = yield call(serverApi.Action18697Endpoint, payload);

const CreateListingResponseCodeVariable = response37775.status;
yield put(actions.logEvent({
	id: 37775,
	options: {
		body_variables: { "b83fff01-8b9e-41dd-9daf-df0155bb1c90.102843":state.reducer?.['createListingEPI']?.['guest_limit'],  "b83fff01-8b9e-41dd-9daf-df0155bb1c90.102845":state.reducer?.['createListingEPI']?.['price'],  "b83fff01-8b9e-41dd-9daf-df0155bb1c90.102847":state.reducer?.['createListingEPI']?.['order_type_id'],  "b83fff01-8b9e-41dd-9daf-df0155bb1c90.106083":CreateListingPartnerSiteIdVariable,  "b83fff01-8b9e-41dd-9daf-df0155bb1c90.108523":state.reducer?.['createListingEPI']?.['check_in_time_id'],  "b83fff01-8b9e-41dd-9daf-df0155bb1c90.108524":state.reducer?.['createListingEPI']?.['check_out_time_id'], 
		},
		path_variables: { "494e9aef-53df-42fe-bff1-466f7f0f5c2b":CreateListingPropertyIDVariable, 
		},
		response_code_as: CreateListingResponseCodeVariable,
	},
	type: "event",
	time: Date.now()
}));
if (CreateListingResponseCodeVariable == 
state.reducer['httpSuccessCode']
) {
yield put(actions.logEvent({
	id: 37778,
	options: {
		field_key: 'modalShowListing',
		field_value: state.reducer['false']
	},
	type: "event",
	time: Date.now()
}));
yield put(actions.changeInput('modalShowListing', state.reducer['false']));




yield put(actions.logEvent({
	id: 43756,
	options: {
		field_key: 'currentPartnerSite'
	},
	type: "event",
	time: Date.now()
}));
yield put(actions.removeField('currentPartnerSite'));

yield put(actions.logEvent({
	id: 45703,
	options: {
		parameter_mapping: {
			 "970d90ef-b31b-49df-8b5a-08d86cbea827":CreateListingPropertyIDVariable, 
		}
	},
	type: "event",
	time: Date.now()
}));
yield put(actions.runAction("GETPROPERTYLISTINGS", { inputVariables: {  "getListingsPropertyID":CreateListingPropertyIDVariable, }  }));
}
		} catch(error) {
            console.warn(error)
		}
	}
}
function* CREATEPROPERTY() {
	while(true) {
		let { inputVariables, params, history } = yield take(actions.CREATEPROPERTY);
		
		// Write page parameters to temporary state for standard access.
		let state = yield select();
		state.page = state.routing && state.routing.locationBeforeTransitions ? state.routing.locationBeforeTransitions.query : {};
		params && Object.keys(params).forEach((k) => state[k] = params[k]);
		
		let payload;
		
		try {
			
			
			


payload = {};
payload['body_variables'] = {};
payload.body_variables['address'] = state.reducer?.['createPropertyEPI']?.['address'];
payload.body_variables['city'] = state.reducer?.['createPropertyEPI']?.['city'];
payload.body_variables['land_type'] = state.reducer?.['createPropertyEPI']?.['land_type'];
payload.body_variables['amenity'] = state.reducer?.['createPropertyEPI']?.['amenity'];
payload.body_variables['status'] = state.reducer?.['createPropertyEPI']?.['status'];
payload.body_variables['name'] = state.reducer?.['createPropertyEPI']?.['name'];
payload.body_variables['description'] = state.reducer?.['createPropertyEPI']?.['description'];
payload.body_variables['state'] = state.reducer?.['createPropertyEPI']?.['state'];
payload.body_variables['zip'] = state.reducer?.['createPropertyEPI']?.['zip'];
payload.body_variables['acres'] = state.reducer?.['createPropertyEPI']?.['acres'];
payload.body_variables['images'] = state.reducer?.['getPropertyImageEPR']?.['file'];
const response37759 = yield call(serverApi.CreatePropertiesEndpoint, payload);
const CreatePropertyResponseVariable = response37759.data;
const CreatePropertyResponseCodeVariable = response37759.status;
yield put(actions.logEvent({
	id: 37759,
	options: {
		body_variables: { "b49d547c-89d4-48a9-9807-0773b37a269e.102973":state.reducer?.['createPropertyEPI']?.['address'],  "b49d547c-89d4-48a9-9807-0773b37a269e.102974":state.reducer?.['createPropertyEPI']?.['city'],  "b49d547c-89d4-48a9-9807-0773b37a269e.102975":state.reducer?.['createPropertyEPI']?.['land_type'],  "b49d547c-89d4-48a9-9807-0773b37a269e.102976":state.reducer?.['createPropertyEPI']?.['amenity'],  "b49d547c-89d4-48a9-9807-0773b37a269e.102977":state.reducer?.['createPropertyEPI']?.['status'],  "b49d547c-89d4-48a9-9807-0773b37a269e.102978":state.reducer?.['createPropertyEPI']?.['name'],  "b49d547c-89d4-48a9-9807-0773b37a269e.102980":state.reducer?.['createPropertyEPI']?.['description'],  "b49d547c-89d4-48a9-9807-0773b37a269e.102981":state.reducer?.['createPropertyEPI']?.['state'],  "b49d547c-89d4-48a9-9807-0773b37a269e.102982":state.reducer?.['createPropertyEPI']?.['zip'],  "b49d547c-89d4-48a9-9807-0773b37a269e.104356":state.reducer?.['createPropertyEPI']?.['acres'],  "b49d547c-89d4-48a9-9807-0773b37a269e.108264":state.reducer?.['getPropertyImageEPR']?.['file'], 
		},
		response_as: CreatePropertyResponseVariable,
		response_code_as: CreatePropertyResponseCodeVariable,
	},
	type: "event",
	time: Date.now()
}));
if (CreatePropertyResponseCodeVariable == 
state.reducer['httpSuccessCode']
) {
payload = {};
payload['query_variables'] = {};
payload.query_variables['property_id'] = CreatePropertyResponseVariable["Id"];
payload.query_variables['filePath'] = CreatePropertyResponseVariable["name"];
payload['body_variables'] = {};
payload.body_variables['input'] = state.reducer?.['uploadFile'];
const response46580 = yield call(serverApi.Action21152Endpoint, payload);

const FileSaveActionResponseCodeVariable = response46580.status;
yield put(actions.logEvent({
	id: 46580,
	options: {
		body_variables: { "54644113-1e5c-42e0-bf93-f6e5bd1a225d":state.reducer?.['uploadFile'], 
		},
		query_variables: { "10c2e97e-f3f3-4abf-aef9-82c0f14f5c28":CreatePropertyResponseVariable["Id"],  "5c47a715-c383-4949-b451-2af9b1881488":CreatePropertyResponseVariable["name"], 
		},
		response_code_as: FileSaveActionResponseCodeVariable,
	},
	type: "event",
	time: Date.now()
}));

yield put(actions.logEvent({
	id: 37764,
	options: {
		parameter_mapping: {
			 "1d26830c-9bf0-451d-8e75-13316b092d36":state.reducer['currentUser']['Id'], 
		}
	},
	type: "event",
	time: Date.now()
}));
yield put(actions.runAction("GETPROPERTIES", { inputVariables: {  "createtorId":state.reducer['currentUser']['Id'], }  }));

history.push(`/addPropertyImages?addImagesPropertyID=${CreatePropertyResponseVariable["Id"]}&`);
}
		} catch(error) {
            console.warn(error)
		}
	}
}
function* CURRENTPARTNERLISTINGS() {
	while(true) {
		let { inputVariables, params, history } = yield take(actions.CURRENTPARTNERLISTINGS);
		
		// Write page parameters to temporary state for standard access.
		let state = yield select();
		state.page = state.routing && state.routing.locationBeforeTransitions ? state.routing.locationBeforeTransitions.query : {};
		params && Object.keys(params).forEach((k) => state[k] = params[k]);
		
		let payload;
		
		try {
			
			
			
		} catch(error) {
            console.warn(error)
		}
	}
}
function* DELETEBOOKINGS() {
	while(true) {
		let { inputVariables, params, history } = yield take(actions.DELETEBOOKINGS);
		
		// Write page parameters to temporary state for standard access.
		let state = yield select();
		state.page = state.routing && state.routing.locationBeforeTransitions ? state.routing.locationBeforeTransitions.query : {};
		params && Object.keys(params).forEach((k) => state[k] = params[k]);
		
		let payload;
		
		try {
			
			
			
			
var HttpSuccessCode6Variable = 200

			
			
			


payload = {};
payload['path_variables'] = {};
payload.path_variables['id'] = state.reducer?.['FormDeleteBookingsEndpoint']?.['id'];
const response42677 = yield call(serverApi.DeleteBookingsEndpoint, payload);

const DeleteBookingsEndpointResponseCodeAsVariable = response42677.status;
yield put(actions.logEvent({
	id: 42677,
	options: {
		path_variables: { "8d6e8c37-1455-4881-9924-fb1a004ca574":state.reducer?.['FormDeleteBookingsEndpoint']?.['id'], 
		},
		response_code_as: DeleteBookingsEndpointResponseCodeAsVariable,
	},
	type: "event",
	time: Date.now()
}));
if (HttpSuccessCode6Variable == DeleteBookingsEndpointResponseCodeAsVariable) {

}
		} catch(error) {
            console.warn(error)
		}
	}
}
function* DELETELISTING() {
	while(true) {
		let { inputVariables, params, history } = yield take(actions.DELETELISTING);
		
		// Write page parameters to temporary state for standard access.
		let state = yield select();
		state.page = state.routing && state.routing.locationBeforeTransitions ? state.routing.locationBeforeTransitions.query : {};
		params && Object.keys(params).forEach((k) => state[k] = params[k]);
		
		let payload;
		
		try {
			
			
			let DeleteListingIDVariable = inputVariables["deleteListingID"]
			
			let DeleteListingPropertyIDVariable = inputVariables["deleteListingPropertyID"]
			
			
			
			
			
var ListingDeletedVariable = "Success! You have deleted your listing!"

			
			
			


payload = {};
payload['path_variables'] = {};
payload.path_variables['id'] = DeleteListingIDVariable;
const response37769 = yield call(serverApi.DeleteListingsEndpoint, payload);

const DeleteListingResponseCodeVariable = response37769.status;
yield put(actions.logEvent({
	id: 37769,
	options: {
		path_variables: { "cf52c5ed-7c15-4c08-8a0b-d072561ca88a":DeleteListingIDVariable, 
		},
		response_code_as: DeleteListingResponseCodeVariable,
	},
	type: "event",
	time: Date.now()
}));
if (DeleteListingResponseCodeVariable == 
state.reducer['httpSuccessCode']
) {
yield put(actions.logEvent({
	id: 45471,
	options: {
		message: ListingDeletedVariable
	},
	type: "event",
	time: Date.now()
}));
window.alert(ListingDeletedVariable)

yield put(actions.logEvent({
	id: 45472,
	options: {
		parameter_mapping: {
			 "970d90ef-b31b-49df-8b5a-08d86cbea827":state.reducer['currentProperty'], 
		}
	},
	type: "event",
	time: Date.now()
}));
yield put(actions.runAction("GETPROPERTYLISTINGS", { inputVariables: {  "getListingsPropertyID":state.reducer['currentProperty'], }  }));
}
		} catch(error) {
            console.warn(error)
		}
	}
}
function* DELETEPHOTO() {
	while(true) {
		let { inputVariables, params, history } = yield take(actions.DELETEPHOTO);
		
		// Write page parameters to temporary state for standard access.
		let state = yield select();
		state.page = state.routing && state.routing.locationBeforeTransitions ? state.routing.locationBeforeTransitions.query : {};
		params && Object.keys(params).forEach((k) => state[k] = params[k]);
		
		let payload;
		
		try {
			
			
			let DeletePhotoPropertyIdVariable = inputVariables["deletePhotoPropertyId"]
			
			
			
			


payload = {};
payload['query_variables'] = {};
payload.query_variables['user_id'] = state.reducer?.['currentUser']?.['Id'];
payload.query_variables['property_id'] = DeletePhotoPropertyIdVariable;
const response46996 = yield call(serverApi.Action21369Endpoint, payload);

const DeletePhotoCodeVariable = response46996.status;
yield put(actions.logEvent({
	id: 46996,
	options: {
		query_variables: { "d0809b1d-13fd-4a74-a9cf-4c4314f0a6d3":state.reducer?.['currentUser']?.['Id'],  "f80fcacc-e85a-44ce-bb9a-9d01bca58e38":DeletePhotoPropertyIdVariable, 
		},
		response_code_as: DeletePhotoCodeVariable,
	},
	type: "event",
	time: Date.now()
}));
if (DeletePhotoCodeVariable == 
state.reducer['httpSuccessCode']
) {
yield put(actions.logEvent({
	id: 46998,
	options: {
		parameter_mapping: {
			 "35cd3775-67fd-4976-86ab-c56d2a4d0bd7":DeletePhotoPropertyIdVariable, 
		}
	},
	type: "event",
	time: Date.now()
}));
yield put(actions.runAction("GETALLPROPERTYIMAGES", { inputVariables: {  "getPropertyImagePropertyId":DeletePhotoPropertyIdVariable, }  }));
}
		} catch(error) {
            console.warn(error)
		}
	}
}
function* DELETEPROPERTY() {
	while(true) {
		let { inputVariables, params, history } = yield take(actions.DELETEPROPERTY);
		
		// Write page parameters to temporary state for standard access.
		let state = yield select();
		state.page = state.routing && state.routing.locationBeforeTransitions ? state.routing.locationBeforeTransitions.query : {};
		params && Object.keys(params).forEach((k) => state[k] = params[k]);
		
		let payload;
		
		try {
			
			
			let DeletePropertyIDVariable = inputVariables["deletePropertyID"]
			
			
			
			


payload = {};
payload['path_variables'] = {};
payload.path_variables['id'] = DeletePropertyIDVariable;
const response37766 = yield call(serverApi.DeletePropertiesEndpoint, payload);

const DeletePropertyResponseCodeVariable = response37766.status;
yield put(actions.logEvent({
	id: 37766,
	options: {
		path_variables: { "ee72eb53-af5c-4505-972d-122e74623470":DeletePropertyIDVariable, 
		},
		response_code_as: DeletePropertyResponseCodeVariable,
	},
	type: "event",
	time: Date.now()
}));
if (DeletePropertyResponseCodeVariable == 
state.reducer['httpSuccessCode']
) {
yield put(actions.logEvent({
	id: 37768,
	options: {
		parameter_mapping: {
			 "1d26830c-9bf0-451d-8e75-13316b092d36":state.reducer['currentUser']['Id'], 
		}
	},
	type: "event",
	time: Date.now()
}));
yield put(actions.runAction("GETPROPERTIES", { inputVariables: {  "createtorId":state.reducer['currentUser']['Id'], }  }));
}
		} catch(error) {
            console.warn(error)
		}
	}
}
function* ESTAMENITYARRAY() {
	while(true) {
		let { inputVariables, params, history } = yield take(actions.ESTAMENITYARRAY);
		
		// Write page parameters to temporary state for standard access.
		let state = yield select();
		state.page = state.routing && state.routing.locationBeforeTransitions ? state.routing.locationBeforeTransitions.query : {};
		params && Object.keys(params).forEach((k) => state[k] = params[k]);
		
		let payload;
		
		try {
			
			
			let EstAmenityArrayVariable = inputVariables["estAmenityArray"]
			
			
			
			
			
var AmenitiesArrayVariable = "[]"

			
			
			
yield put(actions.logEvent({
	id: 47205,
	options: {
		field_key: 'selectedAmenities',
		field_value: AmenitiesArrayVariable
	},
	type: "event",
	time: Date.now()
}));
yield put(actions.changeInput('selectedAmenities', AmenitiesArrayVariable));



		} catch(error) {
            console.warn(error)
		}
	}
}
function* FILEUPLOAD() {
	while(true) {
		let { inputVariables, params, history } = yield take(actions.FILEUPLOAD);
		
		// Write page parameters to temporary state for standard access.
		let state = yield select();
		state.page = state.routing && state.routing.locationBeforeTransitions ? state.routing.locationBeforeTransitions.query : {};
		params && Object.keys(params).forEach((k) => state[k] = params[k]);
		
		let payload;
		
		try {
			
			
			let FilePathVariable = inputVariables["filePath"]
			
			let FileVariable = inputVariables["file"]
			
			let PhotosPropertyIdVariable = inputVariables["photosProperty_id"]
			
			let PhotosUserIdVariable = inputVariables["photosUserId"]
			
			
			
			
yield put(actions.logEvent({
	id: 47000,
	options: {
		field_key: 'Loading',
		field_value: state.reducer['true']
	},
	type: "event",
	time: Date.now()
}));
yield put(actions.changeInput('Loading', state.reducer['true']));






payload = {};
payload['query_variables'] = {};
payload.query_variables['property_id'] = PhotosPropertyIdVariable;
payload.query_variables['filePath'] = FilePathVariable;
payload.query_variables['user_id'] = PhotosUserIdVariable;
payload['body_variables'] = {};
payload.body_variables['input'] = state.reducer?.['uploadFile'];
const response46358 = yield call(serverApi.Action21152Endpoint, payload);
const FileSaveEPIVariable = response46358.data;
const FileSaveEPICodeVariable = response46358.status;
yield put(actions.logEvent({
	id: 46358,
	options: {
		body_variables: { "54644113-1e5c-42e0-bf93-f6e5bd1a225d":state.reducer?.['uploadFile'], 
		},
		query_variables: { "10c2e97e-f3f3-4abf-aef9-82c0f14f5c28":PhotosPropertyIdVariable,  "5c47a715-c383-4949-b451-2af9b1881488":FilePathVariable,  "6cd78432-1665-4cf6-94e2-9bb62253d6e3":PhotosUserIdVariable, 
		},
		response_as: FileSaveEPIVariable,
		response_code_as: FileSaveEPICodeVariable,
	},
	type: "event",
	time: Date.now()
}));
if (FileSaveEPICodeVariable == 
state.reducer['httpSuccessCode']
) {
yield put(actions.logEvent({
	id: 46969,
	options: {
	},
	type: "event",
	time: Date.now()
}));
yield put(actions.runAction("GETPROFILEPICTURE", { inputVariables:{} }));

yield put(actions.logEvent({
	id: 46993,
	options: {
		parameter_mapping: {
			 "35cd3775-67fd-4976-86ab-c56d2a4d0bd7":PhotosPropertyIdVariable, 
		}
	},
	type: "event",
	time: Date.now()
}));
yield put(actions.runAction("GETALLPROPERTYIMAGES", { inputVariables: {  "getPropertyImagePropertyId":PhotosPropertyIdVariable, }  }));

yield put(actions.logEvent({
	id: 47001,
	options: {
		field_key: 'Loading',
		field_value: state.reducer['false']
	},
	type: "event",
	time: Date.now()
}));
yield put(actions.changeInput('Loading', state.reducer['false']));
}
		} catch(error) {
            console.warn(error)
		}
	}
}
function* GETALLPROPERTYIMAGES() {
	while(true) {
		let { inputVariables, params, history } = yield take(actions.GETALLPROPERTYIMAGES);
		
		// Write page parameters to temporary state for standard access.
		let state = yield select();
		state.page = state.routing && state.routing.locationBeforeTransitions ? state.routing.locationBeforeTransitions.query : {};
		params && Object.keys(params).forEach((k) => state[k] = params[k]);
		
		let payload;
		
		try {
			
			
			let GetPropertyImagePropertyIdVariable = inputVariables["getPropertyImagePropertyId"]
			
			
			
			


payload = {};
payload['query_variables'] = {};
payload.query_variables['property_id'] = GetPropertyImagePropertyIdVariable;
const response46634 = yield call(serverApi.Action21272Endpoint, payload);
const GetPropertyImagesEPRVariable = response46634.data;
const GetPropertyImagesEPRCodeVariable = response46634.status;
yield put(actions.logEvent({
	id: 46634,
	options: {
		query_variables: { "2b81651c-9151-45d0-87a8-daca5d20dd33":GetPropertyImagePropertyIdVariable, 
		},
		response_as: GetPropertyImagesEPRVariable,
		response_code_as: GetPropertyImagesEPRCodeVariable,
	},
	type: "event",
	time: Date.now()
}));
if (GetPropertyImagesEPRCodeVariable == 
state.reducer['httpSuccessCode']
) {
yield put(actions.logEvent({
	id: 46643,
	options: {
		field_key: 'getAllPropertyImagesEPR',
		field_value: GetPropertyImagesEPRVariable
	},
	type: "event",
	time: Date.now()
}));
yield put(actions.changeInput('getAllPropertyImagesEPR', GetPropertyImagesEPRVariable));
}
		} catch(error) {
            console.warn(error)
		}
	}
}
function* GETAMENITIES() {
	while(true) {
		let { inputVariables, params, history } = yield take(actions.GETAMENITIES);
		
		// Write page parameters to temporary state for standard access.
		let state = yield select();
		state.page = state.routing && state.routing.locationBeforeTransitions ? state.routing.locationBeforeTransitions.query : {};
		params && Object.keys(params).forEach((k) => state[k] = params[k]);
		
		let payload;
		
		try {
			
			
			
			
var HttpSuccessCode5Variable = 200

			
			
			

const response43957 = yield call(serverApi.GetAmenitiesEndpoint, null);
const GetAmenitiesEndpointResponseAsVariable = response43957.data;
const GetAmenitiesEndpointResponseCodeAsVariable = response43957.status;
yield put(actions.logEvent({
	id: 43957,
	options: {
		response_as: GetAmenitiesEndpointResponseAsVariable,
		response_code_as: GetAmenitiesEndpointResponseCodeAsVariable,
	},
	type: "event",
	time: Date.now()
}));
if (HttpSuccessCode5Variable == GetAmenitiesEndpointResponseCodeAsVariable) {
yield put(actions.logEvent({
	id: 43959,
	options: {
		field_key: 'amenities0',
		field_value: GetAmenitiesEndpointResponseAsVariable
	},
	type: "event",
	time: Date.now()
}));
yield put(actions.changeInput('amenities0', GetAmenitiesEndpointResponseAsVariable));
}
		} catch(error) {
            console.warn(error)
		}
	}
}
function* GETBOOKINGS() {
	while(true) {
		let { inputVariables, params, history } = yield take(actions.GETBOOKINGS);
		
		// Write page parameters to temporary state for standard access.
		let state = yield select();
		state.page = state.routing && state.routing.locationBeforeTransitions ? state.routing.locationBeforeTransitions.query : {};
		params && Object.keys(params).forEach((k) => state[k] = params[k]);
		
		let payload;
		
		try {
			
			
			
			
var HttpSuccessCode3Variable = 200

			
			
			


payload = {};
payload['path_variables'] = {};
payload.path_variables['creator_id'] = state.reducer?.['currentUser']?.['Id'];
const response42670 = yield call(serverApi.GetBookingsEndpoint, payload);
const GetBookingsEndpointResponseVariable = response42670.data;
const GetBookingsEndpointResponseCodeVariable = response42670.status;
yield put(actions.logEvent({
	id: 42670,
	options: {
		path_variables: { "15f75b55-f341-475b-84b1-2c042148f79c":state.reducer?.['currentUser']?.['Id'], 
		},
		response_as: GetBookingsEndpointResponseVariable,
		response_code_as: GetBookingsEndpointResponseCodeVariable,
	},
	type: "event",
	time: Date.now()
}));
if (HttpSuccessCode3Variable == GetBookingsEndpointResponseCodeVariable) {
yield put(actions.logEvent({
	id: 42672,
	options: {
		field_key: 'getBookingsEPR',
		field_value: GetBookingsEndpointResponseVariable
	},
	type: "event",
	time: Date.now()
}));
yield put(actions.changeInput('getBookingsEPR', GetBookingsEndpointResponseVariable));
}
		} catch(error) {
            console.warn(error)
		}
	}
}
function* GETCONVERSATION() {
	while(true) {
		let { inputVariables, params, history } = yield take(actions.GETCONVERSATION);
		
		// Write page parameters to temporary state for standard access.
		let state = yield select();
		state.page = state.routing && state.routing.locationBeforeTransitions ? state.routing.locationBeforeTransitions.query : {};
		params && Object.keys(params).forEach((k) => state[k] = params[k]);
		
		let payload;
		
		try {
			
			
			let ConversationReceiverIdVariable = inputVariables["conversationReceiverId"]
			
			let ConversationSenderIdVariable = inputVariables["conversationSenderId"]
			
			
			
			


payload = {};
payload['path_variables'] = {};
payload.path_variables['sender_id'] = ConversationSenderIdVariable;
payload.path_variables['receiver_id'] = ConversationReceiverIdVariable;
const response47072 = yield call(serverApi.Action21415Endpoint, payload);
const GetConversationEPRVariable = response47072.data;
const GetConversationEPRCodeVariable = response47072.status;
yield put(actions.logEvent({
	id: 47072,
	options: {
		path_variables: { "01fe9016-90f7-41ad-ba7b-23d6fb648bd4":ConversationSenderIdVariable,  "03934756-36a1-40dd-8426-13b61512e24d":ConversationReceiverIdVariable, 
		},
		response_as: GetConversationEPRVariable,
		response_code_as: GetConversationEPRCodeVariable,
	},
	type: "event",
	time: Date.now()
}));
if (GetConversationEPRCodeVariable == 
state.reducer['httpSuccessCode']
) {
yield put(actions.logEvent({
	id: 47074,
	options: {
		field_key: 'getConversation',
		field_value: GetConversationEPRVariable
	},
	type: "event",
	time: Date.now()
}));
yield put(actions.changeInput('getConversation', GetConversationEPRVariable));
}
		} catch(error) {
            console.warn(error)
		}
	}
}
function* GETHELPPOST() {
	while(true) {
		let { inputVariables, params, history } = yield take(actions.GETHELPPOST);
		
		// Write page parameters to temporary state for standard access.
		let state = yield select();
		state.page = state.routing && state.routing.locationBeforeTransitions ? state.routing.locationBeforeTransitions.query : {};
		params && Object.keys(params).forEach((k) => state[k] = params[k]);
		
		let payload;
		
		try {
			
			
			let PostIdVariable = inputVariables["postId"]
			
			
			
			
			
var HttpSuccessCode7Variable = 200

			
			
			


payload = {};
payload['path_variables'] = {};
payload.path_variables['id'] = PostIdVariable;
const response43121 = yield call(serverApi.GetOneHelpPostsEndpoint, payload);
const GetOneHelpPostsEndpointResponseVariable = response43121.data;
const GetOneHelpPostsEndpointResponseCodeVariable = response43121.status;
yield put(actions.logEvent({
	id: 43121,
	options: {
		path_variables: { "99778356-f72f-47b3-a5d5-8a6e2085f9dc":PostIdVariable, 
		},
		response_as: GetOneHelpPostsEndpointResponseVariable,
		response_code_as: GetOneHelpPostsEndpointResponseCodeVariable,
	},
	type: "event",
	time: Date.now()
}));
if (HttpSuccessCode7Variable == GetOneHelpPostsEndpointResponseCodeVariable) {
yield put(actions.logEvent({
	id: 43123,
	options: {
		field_key: 'getHelpPostEPR',
		field_value: GetOneHelpPostsEndpointResponseVariable
	},
	type: "event",
	time: Date.now()
}));
yield put(actions.changeInput('getHelpPostEPR', GetOneHelpPostsEndpointResponseVariable));
}
		} catch(error) {
            console.warn(error)
		}
	}
}
function* GETHELPPOSTS() {
	while(true) {
		let { inputVariables, params, history } = yield take(actions.GETHELPPOSTS);
		
		// Write page parameters to temporary state for standard access.
		let state = yield select();
		state.page = state.routing && state.routing.locationBeforeTransitions ? state.routing.locationBeforeTransitions.query : {};
		params && Object.keys(params).forEach((k) => state[k] = params[k]);
		
		let payload;
		
		try {
			
			
			
			
var HttpSuccessCode8Variable = 200

			
			
			

const response43124 = yield call(serverApi.GetHelpPostsEndpoint, null);
const GetHelpPostsEndpointResponseAsVariable = response43124.data;
const GetHelpPostsEndpointResponseCodeAsVariable = response43124.status;
yield put(actions.logEvent({
	id: 43124,
	options: {
		response_as: GetHelpPostsEndpointResponseAsVariable,
		response_code_as: GetHelpPostsEndpointResponseCodeAsVariable,
	},
	type: "event",
	time: Date.now()
}));
if (HttpSuccessCode8Variable == GetHelpPostsEndpointResponseCodeAsVariable) {
yield put(actions.logEvent({
	id: 43126,
	options: {
		field_key: 'help_posts',
		field_value: GetHelpPostsEndpointResponseAsVariable
	},
	type: "event",
	time: Date.now()
}));
yield put(actions.changeInput('help_posts', GetHelpPostsEndpointResponseAsVariable));
}
		} catch(error) {
            console.warn(error)
		}
	}
}
function* GETME() {
	while(true) {
		let { inputVariables, params, history } = yield take(actions.GETME);
		
		// Write page parameters to temporary state for standard access.
		let state = yield select();
		state.page = state.routing && state.routing.locationBeforeTransitions ? state.routing.locationBeforeTransitions.query : {};
		params && Object.keys(params).forEach((k) => state[k] = params[k]);
		
		let payload;
		
		try {
			
			
			

const response37536 = yield call(serverApi.GetMeEndpoint, null);
const GetMeEndpointResponseAsVariable = response37536.data;
const GetMeEndpointResponseCodeAsVariable = response37536.status;
yield put(actions.logEvent({
	id: 37536,
	options: {
		response_as: GetMeEndpointResponseAsVariable,
		response_code_as: GetMeEndpointResponseCodeAsVariable,
	},
	type: "event",
	time: Date.now()
}));
if (GetMeEndpointResponseCodeAsVariable == 
state.reducer['httpSuccessCode']
) {
yield put(actions.logEvent({
	id: 37538,
	options: {
		field_key: 'currentUser',
		field_value: GetMeEndpointResponseAsVariable
	},
	type: "event",
	time: Date.now()
}));
yield put(actions.changeInput('currentUser', GetMeEndpointResponseAsVariable));




yield put(actions.logEvent({
	id: 37539,
	options: {
		field_key: 'isLoggedIn',
		field_value: state.reducer['true']
	},
	type: "event",
	time: Date.now()
}));
yield put(actions.changeInput('isLoggedIn', state.reducer['true']));
}
		} catch(error) {
            console.warn(error)
		}
	}
}
function* GETMESSAGES() {
	while(true) {
		let { inputVariables, params, history } = yield take(actions.GETMESSAGES);
		
		// Write page parameters to temporary state for standard access.
		let state = yield select();
		state.page = state.routing && state.routing.locationBeforeTransitions ? state.routing.locationBeforeTransitions.query : {};
		params && Object.keys(params).forEach((k) => state[k] = params[k]);
		
		let payload;
		
		try {
			
			
			


payload = {};
payload['path_variables'] = {};
payload.path_variables['receiver_id'] = state.reducer?.['currentUser']?.['Id'];
const response43929 = yield call(serverApi.Action20241Endpoint, payload);
const GetMessagesEPRVariable = response43929.data;
const GetMessagesEPRCodeVariable = response43929.status;
yield put(actions.logEvent({
	id: 43929,
	options: {
		path_variables: { "ab257488-7424-45e8-8f0b-e3f5c455d6f1":state.reducer?.['currentUser']?.['Id'], 
		},
		response_as: GetMessagesEPRVariable,
		response_code_as: GetMessagesEPRCodeVariable,
	},
	type: "event",
	time: Date.now()
}));
if (GetMessagesEPRCodeVariable == 
state.reducer['httpSuccessCode']
) {
yield put(actions.logEvent({
	id: 43931,
	options: {
		field_key: 'getMessageEPR',
		field_value: GetMessagesEPRVariable
	},
	type: "event",
	time: Date.now()
}));
yield put(actions.changeInput('getMessageEPR', GetMessagesEPRVariable));
}
		} catch(error) {
            console.warn(error)
		}
	}
}
function* GETONEBOOKING() {
	while(true) {
		let { inputVariables, params, history } = yield take(actions.GETONEBOOKING);
		
		// Write page parameters to temporary state for standard access.
		let state = yield select();
		state.page = state.routing && state.routing.locationBeforeTransitions ? state.routing.locationBeforeTransitions.query : {};
		params && Object.keys(params).forEach((k) => state[k] = params[k]);
		
		let payload;
		
		try {
			
			
			let BookingIdVariable = inputVariables["bookingId"]
			
			
			
			


payload = {};
payload['path_variables'] = {};
payload.path_variables['id'] = BookingIdVariable;
const response42667 = yield call(serverApi.GetOneBookingsEndpoint, payload);
const GetOneBookingsEndpointResponseAsVariable = response42667.data;
const GetOneBookingsEndpointResponseCodeVariable = response42667.status;
yield put(actions.logEvent({
	id: 42667,
	options: {
		path_variables: { "3344cb6b-647b-4bd6-8e05-aff85a491a15":BookingIdVariable, 
		},
		response_as: GetOneBookingsEndpointResponseAsVariable,
		response_code_as: GetOneBookingsEndpointResponseCodeVariable,
	},
	type: "event",
	time: Date.now()
}));
if (
state.reducer['httpSuccessCode']
 == GetOneBookingsEndpointResponseCodeVariable) {
yield put(actions.logEvent({
	id: 42669,
	options: {
		field_key: 'Data0',
		field_value: GetOneBookingsEndpointResponseAsVariable
	},
	type: "event",
	time: Date.now()
}));
yield put(actions.changeInput('Data0', GetOneBookingsEndpointResponseAsVariable));
}
		} catch(error) {
            console.warn(error)
		}
	}
}
function* GETONEPROPERTYIMAGE() {
	while(true) {
		let { inputVariables, params, history } = yield take(actions.GETONEPROPERTYIMAGE);
		
		// Write page parameters to temporary state for standard access.
		let state = yield select();
		state.page = state.routing && state.routing.locationBeforeTransitions ? state.routing.locationBeforeTransitions.query : {};
		params && Object.keys(params).forEach((k) => state[k] = params[k]);
		
		let payload;
		
		try {
			
			
			let GetOnePropertyImagePropertyIdVariable = inputVariables["getOnePropertyImagePropertyId"]
			
			
			
			
			
var HttpSuccessCode4Variable = 200

			
			
			


payload = {};
payload['path_variables'] = {};
payload.path_variables['property_id'] = GetOnePropertyImagePropertyIdVariable;
const response46614 = yield call(serverApi.GetOnePropertyImagesEndpoint, payload);
const GetOnePropertyImagesEndpointResponseAsVariable = response46614.data;
const GetOnePropertyImagesEndpointResponseCodeAsVariable = response46614.status;
yield put(actions.logEvent({
	id: 46614,
	options: {
		path_variables: { "8da5cff9-b762-4f85-ae65-7bd77fc763ef":GetOnePropertyImagePropertyIdVariable, 
		},
		response_as: GetOnePropertyImagesEndpointResponseAsVariable,
		response_code_as: GetOnePropertyImagesEndpointResponseCodeAsVariable,
	},
	type: "event",
	time: Date.now()
}));
if (HttpSuccessCode4Variable == GetOnePropertyImagesEndpointResponseCodeAsVariable) {
yield put(actions.logEvent({
	id: 46616,
	options: {
		field_key: 'getPropertyImageEPR',
		field_value: GetOnePropertyImagesEndpointResponseAsVariable
	},
	type: "event",
	time: Date.now()
}));
yield put(actions.changeInput('getPropertyImageEPR', GetOnePropertyImagesEndpointResponseAsVariable));
}
		} catch(error) {
            console.warn(error)
		}
	}
}
function* GETORDERTYPES() {
	while(true) {
		let { inputVariables, params, history } = yield take(actions.GETORDERTYPES);
		
		// Write page parameters to temporary state for standard access.
		let state = yield select();
		state.page = state.routing && state.routing.locationBeforeTransitions ? state.routing.locationBeforeTransitions.query : {};
		params && Object.keys(params).forEach((k) => state[k] = params[k]);
		
		let payload;
		
		try {
			
			
			

const response40170 = yield call(serverApi.GetOrderTypesEndpoint, null);
const GetOrderTypesEndpointResponseAsVariable = response40170.data;
const GetOrderTypesEndpointResponseCodeAsVariable = response40170.status;
yield put(actions.logEvent({
	id: 40170,
	options: {
		response_as: GetOrderTypesEndpointResponseAsVariable,
		response_code_as: GetOrderTypesEndpointResponseCodeAsVariable,
	},
	type: "event",
	time: Date.now()
}));
if (GetOrderTypesEndpointResponseCodeAsVariable == 
state.reducer['httpSuccessCode']
) {
yield put(actions.logEvent({
	id: 40172,
	options: {
		field_key: 'getOrderTypeEPR',
		field_value: GetOrderTypesEndpointResponseAsVariable
	},
	type: "event",
	time: Date.now()
}));
yield put(actions.changeInput('getOrderTypeEPR', GetOrderTypesEndpointResponseAsVariable));
}
		} catch(error) {
            console.warn(error)
		}
	}
}
function* GETPARTNERSITES() {
	while(true) {
		let { inputVariables, params, history } = yield take(actions.GETPARTNERSITES);
		
		// Write page parameters to temporary state for standard access.
		let state = yield select();
		state.page = state.routing && state.routing.locationBeforeTransitions ? state.routing.locationBeforeTransitions.query : {};
		params && Object.keys(params).forEach((k) => state[k] = params[k]);
		
		let payload;
		
		try {
			
			
			

const response41061 = yield call(serverApi.GetPartnerSitesEndpoint, null);
const GetPartnerSitesEndpointResponseAsVariable = response41061.data;
const GetPartnerSitesEndpointResponseCodeAsVariable = response41061.status;
yield put(actions.logEvent({
	id: 41061,
	options: {
		response_as: GetPartnerSitesEndpointResponseAsVariable,
		response_code_as: GetPartnerSitesEndpointResponseCodeAsVariable,
	},
	type: "event",
	time: Date.now()
}));
if (GetPartnerSitesEndpointResponseCodeAsVariable == 
state.reducer['httpSuccessCode']
) {
yield put(actions.logEvent({
	id: 41063,
	options: {
		field_key: 'getPartnerSitesEPR',
		field_value: GetPartnerSitesEndpointResponseAsVariable
	},
	type: "event",
	time: Date.now()
}));
yield put(actions.changeInput('getPartnerSitesEPR', GetPartnerSitesEndpointResponseAsVariable));
}
		} catch(error) {
            console.warn(error)
		}
	}
}
function* GETPROFILEPICTURE() {
	while(true) {
		let { inputVariables, params, history } = yield take(actions.GETPROFILEPICTURE);
		
		// Write page parameters to temporary state for standard access.
		let state = yield select();
		state.page = state.routing && state.routing.locationBeforeTransitions ? state.routing.locationBeforeTransitions.query : {};
		params && Object.keys(params).forEach((k) => state[k] = params[k]);
		
		let payload;
		
		try {
			
			
			


payload = {};
payload['query_variables'] = {};
payload.query_variables['user_id'] = state.reducer?.['currentUser']?.['Id'];
const response46966 = yield call(serverApi.Action21367Endpoint, payload);
const GetProfilePictureVariable = response46966.data;
const GetProfilePictureCodeVariable = response46966.status;
yield put(actions.logEvent({
	id: 46966,
	options: {
		query_variables: { "ccf93d8d-ff64-48c3-b9ab-4b087854e1a6":state.reducer?.['currentUser']?.['Id'], 
		},
		response_as: GetProfilePictureVariable,
		response_code_as: GetProfilePictureCodeVariable,
	},
	type: "event",
	time: Date.now()
}));
if (GetProfilePictureCodeVariable == 
state.reducer['httpSuccessCode']
) {
yield put(actions.logEvent({
	id: 46968,
	options: {
		field_key: 'getProfilePictureEPR',
		field_value: GetProfilePictureVariable["file"]
	},
	type: "event",
	time: Date.now()
}));
yield put(actions.changeInput('getProfilePictureEPR', GetProfilePictureVariable["file"]));
}
		} catch(error) {
            console.warn(error)
		}
	}
}
function* GETPROPERTIES() {
	while(true) {
		let { inputVariables, params, history } = yield take(actions.GETPROPERTIES);
		
		// Write page parameters to temporary state for standard access.
		let state = yield select();
		state.page = state.routing && state.routing.locationBeforeTransitions ? state.routing.locationBeforeTransitions.query : {};
		params && Object.keys(params).forEach((k) => state[k] = params[k]);
		
		let payload;
		
		try {
			
			
			let CreatetorIdVariable = inputVariables["createtorId"]
			
			
			
			
yield put(actions.logEvent({
	id: 46999,
	options: {
		field_key: 'Loading',
		field_value: state.reducer['true']
	},
	type: "event",
	time: Date.now()
}));
yield put(actions.changeInput('Loading', state.reducer['true']));





const response37757 = yield call(serverApi.GetPropertiesEndpoint, null);
const GetPropertiesResponseVariable = response37757.data;
const GetPropertiesResponseCodeVariable = response37757.status;
yield put(actions.logEvent({
	id: 37757,
	options: {
		response_as: GetPropertiesResponseVariable,
		response_code_as: GetPropertiesResponseCodeVariable,
	},
	type: "event",
	time: Date.now()
}));
if (GetPropertiesResponseCodeVariable == 
state.reducer['httpSuccessCode']
) {
yield put(actions.logEvent({
	id: 37762,
	options: {
		field_key: 'getPropertiesEPR',
		field_value: GetPropertiesResponseVariable
	},
	type: "event",
	time: Date.now()
}));
yield put(actions.changeInput('getPropertiesEPR', GetPropertiesResponseVariable));




yield put(actions.logEvent({
	id: 45509,
	options: {
		field_key: 'Loading',
		field_value: state.reducer['false']
	},
	type: "event",
	time: Date.now()
}));
yield put(actions.changeInput('Loading', state.reducer['false']));
}
		} catch(error) {
            console.warn(error)
		}
	}
}
function* GETPROPERTIESCUSTOM() {
	while(true) {
		let { inputVariables, params, history } = yield take(actions.GETPROPERTIESCUSTOM);
		
		// Write page parameters to temporary state for standard access.
		let state = yield select();
		state.page = state.routing && state.routing.locationBeforeTransitions ? state.routing.locationBeforeTransitions.query : {};
		params && Object.keys(params).forEach((k) => state[k] = params[k]);
		
		let payload;
		
		try {
			
			
			


payload = {};
payload['path_variables'] = {};
payload.path_variables['creator_id'] = state.reducer?.['currentUser']?.['Id'];
const response47373 = yield call(serverApi.Action21475Endpoint, payload);
const GetPropertiesCustomEPARVariable = response47373.data;
const GetPropertiesCustomCodeVariable = response47373.status;
yield put(actions.logEvent({
	id: 47373,
	options: {
		path_variables: { "f59d7f10-38f1-4783-929f-e7cf459f4ab5":state.reducer?.['currentUser']?.['Id'], 
		},
		response_as: GetPropertiesCustomEPARVariable,
		response_code_as: GetPropertiesCustomCodeVariable,
	},
	type: "event",
	time: Date.now()
}));
if (GetPropertiesCustomCodeVariable == 
state.reducer['httpSuccessCode']
) {
yield put(actions.logEvent({
	id: 47375,
	options: {
		field_key: 'getPropertiesCustom',
		field_value: GetPropertiesCustomEPARVariable
	},
	type: "event",
	time: Date.now()
}));
yield put(actions.changeInput('getPropertiesCustom', GetPropertiesCustomEPARVariable));
}
		} catch(error) {
            console.warn(error)
		}
	}
}
function* GETPROPERTY() {
	while(true) {
		let { inputVariables, params, history } = yield take(actions.GETPROPERTY);
		
		// Write page parameters to temporary state for standard access.
		let state = yield select();
		state.page = state.routing && state.routing.locationBeforeTransitions ? state.routing.locationBeforeTransitions.query : {};
		params && Object.keys(params).forEach((k) => state[k] = params[k]);
		
		let payload;
		
		try {
			
			
			let GetPropertyIDVariable = inputVariables["getPropertyID"]
			
			
			
			


payload = {};
payload['path_variables'] = {};
payload.path_variables['id'] = GetPropertyIDVariable;
const response37779 = yield call(serverApi.GetOnePropertiesEndpoint, payload);
const GetPropertyResponseVariable = response37779.data;
const GetPropertyResponseCodeVariable = response37779.status;
yield put(actions.logEvent({
	id: 37779,
	options: {
		path_variables: { "f3809d46-78a5-4369-ac49-958c97937d44":GetPropertyIDVariable, 
		},
		response_as: GetPropertyResponseVariable,
		response_code_as: GetPropertyResponseCodeVariable,
	},
	type: "event",
	time: Date.now()
}));
if (GetPropertyResponseCodeVariable == 
state.reducer['httpSuccessCode']
) {
yield put(actions.logEvent({
	id: 37781,
	options: {
		field_key: 'getPropertyEPR',
		field_value: GetPropertyResponseVariable
	},
	type: "event",
	time: Date.now()
}));
yield put(actions.changeInput('getPropertyEPR', GetPropertyResponseVariable));
}
		} catch(error) {
            console.warn(error)
		}
	}
}
function* GETPROPERTYLISTINGDATA() {
	while(true) {
		let { inputVariables, params, history } = yield take(actions.GETPROPERTYLISTINGDATA);
		
		// Write page parameters to temporary state for standard access.
		let state = yield select();
		state.page = state.routing && state.routing.locationBeforeTransitions ? state.routing.locationBeforeTransitions.query : {};
		params && Object.keys(params).forEach((k) => state[k] = params[k]);
		
		let payload;
		
		try {
			
			
			let PropertyIdVariable = inputVariables["propertyId"]
			
			
			
			


payload = {};
payload['path_variables'] = {};
payload.path_variables['property_id'] = PropertyIdVariable;
const response43472 = yield call(serverApi.GetListingsEndpoint, payload);
const GetPropertyListlingDataResponseVariable = response43472.data;
const GetPropertyListlingDataResponseCodeVariable = response43472.status;
yield put(actions.logEvent({
	id: 43472,
	options: {
		path_variables: { "c0013baf-2654-4737-9b8a-cb507c8e2b01":PropertyIdVariable, 
		},
		response_as: GetPropertyListlingDataResponseVariable,
		response_code_as: GetPropertyListlingDataResponseCodeVariable,
	},
	type: "event",
	time: Date.now()
}));
if (GetPropertyListlingDataResponseCodeVariable == 
state.reducer['httpSuccessCode']
) {
yield put(actions.logEvent({
	id: 43474,
	options: {
		field_key: 'getListingDataEPR',
		field_value: GetPropertyListlingDataResponseVariable
	},
	type: "event",
	time: Date.now()
}));
yield put(actions.changeInput('getListingDataEPR', GetPropertyListlingDataResponseVariable));
}
		} catch(error) {
            console.warn(error)
		}
	}
}
function* GETPROPERTYLISTINGS() {
	while(true) {
		let { inputVariables, params, history } = yield take(actions.GETPROPERTYLISTINGS);
		
		// Write page parameters to temporary state for standard access.
		let state = yield select();
		state.page = state.routing && state.routing.locationBeforeTransitions ? state.routing.locationBeforeTransitions.query : {};
		params && Object.keys(params).forEach((k) => state[k] = params[k]);
		
		let payload;
		
		try {
			
			
			let GetListingsPropertyIDVariable = inputVariables["getListingsPropertyID"]
			
			
			
			
yield put(actions.logEvent({
	id: 47382,
	options: {
		field_key: 'Loading',
		field_value: state.reducer['true']
	},
	type: "event",
	time: Date.now()
}));
yield put(actions.changeInput('Loading', state.reducer['true']));






payload = {};
payload['path_variables'] = {};
payload.path_variables['property_id'] = GetListingsPropertyIDVariable;
const response37772 = yield call(serverApi.GetListingsEndpoint, payload);
const GetListingsReponseVariable = response37772.data;
const GetListingsReponseCodeVariable = response37772.status;
yield put(actions.logEvent({
	id: 37772,
	options: {
		path_variables: { "c0013baf-2654-4737-9b8a-cb507c8e2b01":GetListingsPropertyIDVariable, 
		},
		response_as: GetListingsReponseVariable,
		response_code_as: GetListingsReponseCodeVariable,
	},
	type: "event",
	time: Date.now()
}));
if (GetListingsReponseCodeVariable == 
state.reducer['httpSuccessCode']
) {
yield put(actions.logEvent({
	id: 37774,
	options: {
		field_key: 'getListingsEPR',
		field_value: GetListingsReponseVariable
	},
	type: "event",
	time: Date.now()
}));
yield put(actions.changeInput('getListingsEPR', GetListingsReponseVariable));
}

yield put(actions.logEvent({
	id: 46101,
	options: {
		parameter_mapping: {
			 "c533d1d5-2dfa-483f-8e36-566b8919509d":GetListingsPropertyIDVariable, 
		}
	},
	type: "event",
	time: Date.now()
}));
yield put(actions.runAction("SETPROPERTY", { inputVariables: {  "setPropertyPropertyId":GetListingsPropertyIDVariable, }  }));

yield put(actions.logEvent({
	id: 47383,
	options: {
		field_key: 'Loading',
		field_value: state.reducer['false']
	},
	type: "event",
	time: Date.now()
}));
yield put(actions.changeInput('Loading', state.reducer['false']));



		} catch(error) {
            console.warn(error)
		}
	}
}
function* GETUSSTATES() {
	while(true) {
		let { inputVariables, params, history } = yield take(actions.GETUSSTATES);
		
		// Write page parameters to temporary state for standard access.
		let state = yield select();
		state.page = state.routing && state.routing.locationBeforeTransitions ? state.routing.locationBeforeTransitions.query : {};
		params && Object.keys(params).forEach((k) => state[k] = params[k]);
		
		let payload;
		
		try {
			
			
			
			
var HttpSuccessCode0Variable = 200

			
			
			

const response41106 = yield call(serverApi.GetUsStatesEndpoint, null);
const GetUsStatesEndpointResponseAsVariable = response41106.data;
const GetUsStatesEndpointResponseCodeAsVariable = response41106.status;
yield put(actions.logEvent({
	id: 41106,
	options: {
		response_as: GetUsStatesEndpointResponseAsVariable,
		response_code_as: GetUsStatesEndpointResponseCodeAsVariable,
	},
	type: "event",
	time: Date.now()
}));
if (HttpSuccessCode0Variable == GetUsStatesEndpointResponseCodeAsVariable) {
yield put(actions.logEvent({
	id: 41108,
	options: {
		field_key: 'us_states',
		field_value: GetUsStatesEndpointResponseAsVariable
	},
	type: "event",
	time: Date.now()
}));
yield put(actions.changeInput('us_states', GetUsStatesEndpointResponseAsVariable));
}
		} catch(error) {
            console.warn(error)
		}
	}
}
function* GETUSERS() {
	while(true) {
		let { inputVariables, params, history } = yield take(actions.GETUSERS);
		
		// Write page parameters to temporary state for standard access.
		let state = yield select();
		state.page = state.routing && state.routing.locationBeforeTransitions ? state.routing.locationBeforeTransitions.query : {};
		params && Object.keys(params).forEach((k) => state[k] = params[k]);
		
		let payload;
		
		try {
			
			
			
			
var HttpSuccessCode1Variable = 200

			
			
			

const response37543 = yield call(serverApi.GetUsersEndpoint, null);
const GetUsersEndpointResponseAsVariable = response37543.data;
const GetUsersEndpointResponseCodeAsVariable = response37543.status;
yield put(actions.logEvent({
	id: 37543,
	options: {
		response_as: GetUsersEndpointResponseAsVariable,
		response_code_as: GetUsersEndpointResponseCodeAsVariable,
	},
	type: "event",
	time: Date.now()
}));
if (HttpSuccessCode1Variable == GetUsersEndpointResponseCodeAsVariable) {
yield put(actions.logEvent({
	id: 37545,
	options: {
		field_key: 'users',
		field_value: GetUsersEndpointResponseAsVariable
	},
	type: "event",
	time: Date.now()
}));
yield put(actions.changeInput('users', GetUsersEndpointResponseAsVariable));
}
		} catch(error) {
            console.warn(error)
		}
	}
}
function* GETVISITOR() {
	while(true) {
		let { inputVariables, params, history } = yield take(actions.GETVISITOR);
		
		// Write page parameters to temporary state for standard access.
		let state = yield select();
		state.page = state.routing && state.routing.locationBeforeTransitions ? state.routing.locationBeforeTransitions.query : {};
		params && Object.keys(params).forEach((k) => state[k] = params[k]);
		
		let payload;
		
		try {
			
			
			

const response46601 = yield call(serverApi.GetMeEndpoint, null);
const GetMeResponseVariable = response46601.data;
const GetMeResponseCodeVariable = response46601.status;
yield put(actions.logEvent({
	id: 46601,
	options: {
		response_as: GetMeResponseVariable,
		response_code_as: GetMeResponseCodeVariable,
	},
	type: "event",
	time: Date.now()
}));
if (GetMeResponseCodeVariable != 
state.reducer['httpSuccessCode']
) {
yield put(actions.logEvent({
	id: 46603,
	options: {
		field_key: 'isNotLoggedIn',
		field_value: state.reducer['true']
	},
	type: "event",
	time: Date.now()
}));
yield put(actions.changeInput('isNotLoggedIn', state.reducer['true']));
}
		} catch(error) {
            console.warn(error)
		}
	}
}
function* GOADDLISTINGS() {
	while(true) {
		let { inputVariables, params, history } = yield take(actions.GOADDLISTINGS);
		
		// Write page parameters to temporary state for standard access.
		let state = yield select();
		state.page = state.routing && state.routing.locationBeforeTransitions ? state.routing.locationBeforeTransitions.query : {};
		params && Object.keys(params).forEach((k) => state[k] = params[k]);
		
		let payload;
		
		try {
			
			
			let AddListingsPropertyIdVariable = inputVariables["addListingsPropertyId"]
			
			
			
			
history.push(`/addListing?page_property_id=${AddListingsPropertyIdVariable}&`);
		} catch(error) {
            console.warn(error)
		}
	}
}
function* GOADDPROPERTY() {
	while(true) {
		let { inputVariables, params, history } = yield take(actions.GOADDPROPERTY);
		
		// Write page parameters to temporary state for standard access.
		let state = yield select();
		state.page = state.routing && state.routing.locationBeforeTransitions ? state.routing.locationBeforeTransitions.query : {};
		params && Object.keys(params).forEach((k) => state[k] = params[k]);
		
		let payload;
		
		try {
			
			
			
history.push(`/addProperty`);
		} catch(error) {
            console.warn(error)
		}
	}
}
function* GOHOME() {
	while(true) {
		let { inputVariables, params, history } = yield take(actions.GOHOME);
		
		// Write page parameters to temporary state for standard access.
		let state = yield select();
		state.page = state.routing && state.routing.locationBeforeTransitions ? state.routing.locationBeforeTransitions.query : {};
		params && Object.keys(params).forEach((k) => state[k] = params[k]);
		
		let payload;
		
		try {
			
			
			
history.push(`/`);
		} catch(error) {
            console.warn(error)
		}
	}
}
function* GOHOSTDASHBOARD() {
	while(true) {
		let { inputVariables, params, history } = yield take(actions.GOHOSTDASHBOARD);
		
		// Write page parameters to temporary state for standard access.
		let state = yield select();
		state.page = state.routing && state.routing.locationBeforeTransitions ? state.routing.locationBeforeTransitions.query : {};
		params && Object.keys(params).forEach((k) => state[k] = params[k]);
		
		let payload;
		
		try {
			
			
			
history.push(`/host-dashboard`);
		} catch(error) {
            console.warn(error)
		}
	}
}
function* GOSUPPORT() {
	while(true) {
		let { inputVariables, params, history } = yield take(actions.GOSUPPORT);
		
		// Write page parameters to temporary state for standard access.
		let state = yield select();
		state.page = state.routing && state.routing.locationBeforeTransitions ? state.routing.locationBeforeTransitions.query : {};
		params && Object.keys(params).forEach((k) => state[k] = params[k]);
		
		let payload;
		
		try {
			
			
			
history.push(`/help_center`);
		} catch(error) {
            console.warn(error)
		}
	}
}
function* HIGHLIGHTELEMENT() {
	while(true) {
		let { inputVariables, params, history } = yield take(actions.HIGHLIGHTELEMENT);
		
		// Write page parameters to temporary state for standard access.
		let state = yield select();
		state.page = state.routing && state.routing.locationBeforeTransitions ? state.routing.locationBeforeTransitions.query : {};
		params && Object.keys(params).forEach((k) => state[k] = params[k]);
		
		let payload;
		
		try {
			
			
			
		} catch(error) {
            console.warn(error)
		}
	}
}
function* LOGIN() {
	while(true) {
		let { inputVariables, params, history } = yield take(actions.LOGIN);
		
		// Write page parameters to temporary state for standard access.
		let state = yield select();
		state.page = state.routing && state.routing.locationBeforeTransitions ? state.routing.locationBeforeTransitions.query : {};
		params && Object.keys(params).forEach((k) => state[k] = params[k]);
		
		let payload;
		
		try {
			
			
			let EmailVariable = inputVariables["email"]
			
			let PasswordVariable = inputVariables["password"]
			
			
			
			


payload = {};
payload['query_variables'] = {};
payload.query_variables['password'] = PasswordVariable;
payload.query_variables['email'] = EmailVariable;
const response47523 = yield call(serverApi.Action21581Endpoint, payload);
const LogInEPRVariable = response47523.data;
const LogInEPRCodeVariable = response47523.status;
yield put(actions.logEvent({
	id: 47523,
	options: {
		query_variables: { "d1eac6d4-00e9-407c-b346-70c2945fe42e":PasswordVariable,  "db92d7ae-2b21-4171-88df-0a5d250ad4de":EmailVariable, 
		},
		response_as: LogInEPRVariable,
		response_code_as: LogInEPRCodeVariable,
	},
	type: "event",
	time: Date.now()
}));
if (LogInEPRCodeVariable == 
state.reducer['httpSuccessCode']
) {
yield put(actions.logEvent({
	id: 47650,
	options: {
		field_key: 'currentUser',
		field_value: LogInEPRVariable
	},
	type: "event",
	time: Date.now()
}));
yield put(actions.changeInput('currentUser', LogInEPRVariable));




yield put(actions.logEvent({
	id: 47525,
	options: {
	},
	type: "event",
	time: Date.now()
}));
yield put(actions.runAction("GETME", { inputVariables:{} }));

history.push(`/`);

yield put(actions.logEvent({
	id: 47540,
	options: {
		field_key: 'isLoggedIn',
		field_value: state.reducer['true']
	},
	type: "event",
	time: Date.now()
}));
yield put(actions.changeInput('isLoggedIn', state.reducer['true']));
}
		} catch(error) {
            console.warn(error)
		}
	}
}
function* LOGOUT() {
	while(true) {
		let { inputVariables, params, history } = yield take(actions.LOGOUT);
		
		// Write page parameters to temporary state for standard access.
		let state = yield select();
		state.page = state.routing && state.routing.locationBeforeTransitions ? state.routing.locationBeforeTransitions.query : {};
		params && Object.keys(params).forEach((k) => state[k] = params[k]);
		
		let payload;
		
		try {
			
			
			

const response37522 = yield call(serverApi.LogoutEndpoint, null);

const LogoutEndpointResponseCodeAsVariable = response37522.status;
yield put(actions.logEvent({
	id: 37522,
	options: {
		response_code_as: LogoutEndpointResponseCodeAsVariable,
	},
	type: "event",
	time: Date.now()
}));
if (LogoutEndpointResponseCodeAsVariable == 
state.reducer['httpSuccessCode']
) {
yield put(actions.logEvent({
	id: 37524,
	options: {
		field_key: 'isLoggedIn',
		field_value: state.reducer['false']
	},
	type: "event",
	time: Date.now()
}));
yield put(actions.changeInput('isLoggedIn', state.reducer['false']));




yield put(actions.logEvent({
	id: 37525,
	options: {
		field_key: 'currentUser'
	},
	type: "event",
	time: Date.now()
}));
yield put(actions.removeField('currentUser'));
}
		} catch(error) {
            console.warn(error)
		}
	}
}
function* MAKEDATEUNAVAILABLE() {
	while(true) {
		let { inputVariables, params, history } = yield take(actions.MAKEDATEUNAVAILABLE);
		
		// Write page parameters to temporary state for standard access.
		let state = yield select();
		state.page = state.routing && state.routing.locationBeforeTransitions ? state.routing.locationBeforeTransitions.query : {};
		params && Object.keys(params).forEach((k) => state[k] = params[k]);
		
		let payload;
		
		try {
			
			
			
yield put(actions.logEvent({
	id: 40457,
	options: {
		field_key: 'FormUpdateCalendarsEndpoint.date',
		field_value: state.reducer['dataUnavailable']
	},
	type: "event",
	time: Date.now()
}));
yield put(actions.changeInput('FormUpdateCalendarsEndpoint.date', state.reducer['dataUnavailable']));



		} catch(error) {
            console.warn(error)
		}
	}
}
function* MARKASREAD() {
	while(true) {
		let { inputVariables, params, history } = yield take(actions.MARKASREAD);
		
		// Write page parameters to temporary state for standard access.
		let state = yield select();
		state.page = state.routing && state.routing.locationBeforeTransitions ? state.routing.locationBeforeTransitions.query : {};
		params && Object.keys(params).forEach((k) => state[k] = params[k]);
		
		let payload;
		
		try {
			
			
			
yield put(actions.logEvent({
	id: 47115,
	options: {
		field_key: 'read',
		field_value: state.reducer['true']
	},
	type: "event",
	time: Date.now()
}));
yield put(actions.changeInput('read', state.reducer['true']));



		} catch(error) {
            console.warn(error)
		}
	}
}
function* MODALCLOSEBOOKING() {
	while(true) {
		let { inputVariables, params, history } = yield take(actions.MODALCLOSEBOOKING);
		
		// Write page parameters to temporary state for standard access.
		let state = yield select();
		state.page = state.routing && state.routing.locationBeforeTransitions ? state.routing.locationBeforeTransitions.query : {};
		params && Object.keys(params).forEach((k) => state[k] = params[k]);
		
		let payload;
		
		try {
			
			
			
yield put(actions.logEvent({
	id: 43665,
	options: {
		field_key: 'modalCloseBooking',
		field_value: state.reducer['false']
	},
	type: "event",
	time: Date.now()
}));
yield put(actions.changeInput('modalCloseBooking', state.reducer['false']));



		} catch(error) {
            console.warn(error)
		}
	}
}
function* MODALCLOSELISTING() {
	while(true) {
		let { inputVariables, params, history } = yield take(actions.MODALCLOSELISTING);
		
		// Write page parameters to temporary state for standard access.
		let state = yield select();
		state.page = state.routing && state.routing.locationBeforeTransitions ? state.routing.locationBeforeTransitions.query : {};
		params && Object.keys(params).forEach((k) => state[k] = params[k]);
		
		let payload;
		
		try {
			
			
			
yield put(actions.logEvent({
	id: 43759,
	options: {
		field_key: 'modalShowListing',
		field_value: state.reducer['false']
	},
	type: "event",
	time: Date.now()
}));
yield put(actions.changeInput('modalShowListing', state.reducer['false']));



		} catch(error) {
            console.warn(error)
		}
	}
}
function* MODALSHOWBOOKING() {
	while(true) {
		let { inputVariables, params, history } = yield take(actions.MODALSHOWBOOKING);
		
		// Write page parameters to temporary state for standard access.
		let state = yield select();
		state.page = state.routing && state.routing.locationBeforeTransitions ? state.routing.locationBeforeTransitions.query : {};
		params && Object.keys(params).forEach((k) => state[k] = params[k]);
		
		let payload;
		
		try {
			
			
			
yield put(actions.logEvent({
	id: 43475,
	options: {
		field_key: 'modalShowBooking',
		field_value: state.reducer['true']
	},
	type: "event",
	time: Date.now()
}));
yield put(actions.changeInput('modalShowBooking', state.reducer['true']));



		} catch(error) {
            console.warn(error)
		}
	}
}
function* MODALSHOWLISTING() {
	while(true) {
		let { inputVariables, params, history } = yield take(actions.MODALSHOWLISTING);
		
		// Write page parameters to temporary state for standard access.
		let state = yield select();
		state.page = state.routing && state.routing.locationBeforeTransitions ? state.routing.locationBeforeTransitions.query : {};
		params && Object.keys(params).forEach((k) => state[k] = params[k]);
		
		let payload;
		
		try {
			
			
			let ListingIdVariable = inputVariables["listing_id"]
			
			
			
			
yield put(actions.logEvent({
	id: 43760,
	options: {
		field_key: 'modalShowListing',
		field_value: state.reducer['true']
	},
	type: "event",
	time: Date.now()
}));
yield put(actions.changeInput('modalShowListing', state.reducer['true']));



		} catch(error) {
            console.warn(error)
		}
	}
}
function* OPENEDITPROPERTY() {
	while(true) {
		let { inputVariables, params, history } = yield take(actions.OPENEDITPROPERTY);
		
		// Write page parameters to temporary state for standard access.
		let state = yield select();
		state.page = state.routing && state.routing.locationBeforeTransitions ? state.routing.locationBeforeTransitions.query : {};
		params && Object.keys(params).forEach((k) => state[k] = params[k]);
		
		let payload;
		
		try {
			
			
			let OpenEditPropertyPropertyIDVariable = inputVariables["openEditPropertyPropertyID"]
			
			
			
			
history.push(`/edit_property?edit_property_property_id=${OpenEditPropertyPropertyIDVariable}&`);
		} catch(error) {
            console.warn(error)
		}
	}
}
function* OPENHELPPOST() {
	while(true) {
		let { inputVariables, params, history } = yield take(actions.OPENHELPPOST);
		
		// Write page parameters to temporary state for standard access.
		let state = yield select();
		state.page = state.routing && state.routing.locationBeforeTransitions ? state.routing.locationBeforeTransitions.query : {};
		params && Object.keys(params).forEach((k) => state[k] = params[k]);
		
		let payload;
		
		try {
			
			
			let OpenHelpPostPostIdVariable = inputVariables["openHelpPostPostId"]
			
			
			
			
history.push(`/help_post/${OpenHelpPostPostIdVariable}`);
		} catch(error) {
            console.warn(error)
		}
	}
}
function* OPENPROPERTY() {
	while(true) {
		let { inputVariables, params, history } = yield take(actions.OPENPROPERTY);
		
		// Write page parameters to temporary state for standard access.
		let state = yield select();
		state.page = state.routing && state.routing.locationBeforeTransitions ? state.routing.locationBeforeTransitions.query : {};
		params && Object.keys(params).forEach((k) => state[k] = params[k]);
		
		let payload;
		
		try {
			
			
			let OpenPropertyIDVariable = inputVariables["openPropertyID"]
			
			
			
			
history.push(`/property?property_id=${OpenPropertyIDVariable}&`);
		} catch(error) {
            console.warn(error)
		}
	}
}
function* REJECTBOOKINGREQUEST() {
	while(true) {
		let { inputVariables, params, history } = yield take(actions.REJECTBOOKINGREQUEST);
		
		// Write page parameters to temporary state for standard access.
		let state = yield select();
		state.page = state.routing && state.routing.locationBeforeTransitions ? state.routing.locationBeforeTransitions.query : {};
		params && Object.keys(params).forEach((k) => state[k] = params[k]);
		
		let payload;
		
		try {
			
			
			let RejectBookingIdVariable = inputVariables["rejectBookingId"]
			
			
			
			


payload = {};
payload['path_variables'] = {};
payload.path_variables['id'] = RejectBookingIdVariable;
const response43728 = yield call(serverApi.Action20159Endpoint, payload);

const RejectBookingRequestCodeVariable = response43728.status;
yield put(actions.logEvent({
	id: 43728,
	options: {
		path_variables: { "2e8a66fc-ca4b-4779-a4e6-004dd2bc81f2":RejectBookingIdVariable, 
		},
		response_code_as: RejectBookingRequestCodeVariable,
	},
	type: "event",
	time: Date.now()
}));
		} catch(error) {
            console.warn(error)
		}
	}
}
function* REQUESTPASSWORDRESET() {
	while(true) {
		let { inputVariables, params, history } = yield take(actions.REQUESTPASSWORDRESET);
		
		// Write page parameters to temporary state for standard access.
		let state = yield select();
		state.page = state.routing && state.routing.locationBeforeTransitions ? state.routing.locationBeforeTransitions.query : {};
		params && Object.keys(params).forEach((k) => state[k] = params[k]);
		
		let payload;
		
		try {
			
			
			
			
var RequestPasswordResetErrorMessageVariable = "Error resetting password! Ensure you use a valid email!"

			
			
var RequestPasswordResetSuccessMessageVariable = "Check your email for a reset link"

			
			
			


payload = {};
payload['query_variables'] = {};
payload.query_variables['email'] = state.reducer?.['requestPasswordResetEPI']?.['email'];
const response37531 = yield call(serverApi.RequestPasswordResetEndpoint, payload);

const RequestPasswordResetEndpointResponseCodeAsVariable = response37531.status;
yield put(actions.logEvent({
	id: 37531,
	options: {
		query_variables: { "8bc015b1-641f-49b9-acdc-02a9cb6bff14":state.reducer?.['requestPasswordResetEPI']?.['email'], 
		},
		response_code_as: RequestPasswordResetEndpointResponseCodeAsVariable,
	},
	type: "event",
	time: Date.now()
}));
if (RequestPasswordResetEndpointResponseCodeAsVariable == 
state.reducer['httpSuccessCode']
) {
yield put(actions.logEvent({
	id: 37533,
	options: {
		message: RequestPasswordResetSuccessMessageVariable
	},
	type: "event",
	time: Date.now()
}));
window.alert(RequestPasswordResetSuccessMessageVariable)
}
if (RequestPasswordResetEndpointResponseCodeAsVariable != 
state.reducer['httpSuccessCode']
) {
yield put(actions.logEvent({
	id: 37535,
	options: {
		message: RequestPasswordResetErrorMessageVariable
	},
	type: "event",
	time: Date.now()
}));
window.alert(RequestPasswordResetErrorMessageVariable)
}
		} catch(error) {
            console.warn(error)
		}
	}
}
function* SENDMESSAGE() {
	while(true) {
		let { inputVariables, params, history } = yield take(actions.SENDMESSAGE);
		
		// Write page parameters to temporary state for standard access.
		let state = yield select();
		state.page = state.routing && state.routing.locationBeforeTransitions ? state.routing.locationBeforeTransitions.query : {};
		params && Object.keys(params).forEach((k) => state[k] = params[k]);
		
		let payload;
		
		try {
			
			
			let MessageVariable = inputVariables["message"]
			
			let ReceiverIdVariable = inputVariables["receiver_id"]
			
			let SenderIdVariable = inputVariables["sender_id"]
			
			let SentDateVariable = inputVariables["sent_date"]
			
			
			
			


payload = {};
payload['path_variables'] = {};
payload.path_variables['sender_id'] = SenderIdVariable;
payload.path_variables['receiver_id'] = ReceiverIdVariable;
payload.path_variables['message'] = MessageVariable;
const response43926 = yield call(serverApi.Action20240Endpoint, payload);
const SendMessageEPIVariable = response43926.data;
const SendMessageEPICodeVariable = response43926.status;
yield put(actions.logEvent({
	id: 43926,
	options: {
		path_variables: { "41343f8e-0933-4819-94e8-6d3ae1649ad7":SenderIdVariable,  "49183fb8-59b3-4676-ad7d-1c550de1c093":ReceiverIdVariable,  "a6cfb3ee-c546-45fb-834a-9e9950f64ba9":MessageVariable, 
		},
		response_as: SendMessageEPIVariable,
		response_code_as: SendMessageEPICodeVariable,
	},
	type: "event",
	time: Date.now()
}));
if (SendMessageEPICodeVariable == 
state.reducer['httpSuccessCode']
) {

}
		} catch(error) {
            console.warn(error)
		}
	}
}
function* SETPARTNERSITE() {
	while(true) {
		let { inputVariables, params, history } = yield take(actions.SETPARTNERSITE);
		
		// Write page parameters to temporary state for standard access.
		let state = yield select();
		state.page = state.routing && state.routing.locationBeforeTransitions ? state.routing.locationBeforeTransitions.query : {};
		params && Object.keys(params).forEach((k) => state[k] = params[k]);
		
		let payload;
		
		try {
			
			
			let SetPartnerSitePartnerSiteVariable = inputVariables["setPartnerSitePartnerSite"]
			
			
			
			
yield put(actions.logEvent({
	id: 41064,
	options: {
		field_key: 'currentPartnerSite',
		field_value: SetPartnerSitePartnerSiteVariable
	},
	type: "event",
	time: Date.now()
}));
yield put(actions.changeInput('currentPartnerSite', SetPartnerSitePartnerSiteVariable));



		} catch(error) {
            console.warn(error)
		}
	}
}
function* SETPROPERTY() {
	while(true) {
		let { inputVariables, params, history } = yield take(actions.SETPROPERTY);
		
		// Write page parameters to temporary state for standard access.
		let state = yield select();
		state.page = state.routing && state.routing.locationBeforeTransitions ? state.routing.locationBeforeTransitions.query : {};
		params && Object.keys(params).forEach((k) => state[k] = params[k]);
		
		let payload;
		
		try {
			
			
			let SetPropertyPropertyIdVariable = inputVariables["setPropertyPropertyId"]
			
			
			
			
			
var SelectedElementVariable = "selected"

			
			
			
yield put(actions.logEvent({
	id: 44459,
	options: {
		field_key: 'currentProperty',
		field_value: SetPropertyPropertyIdVariable
	},
	type: "event",
	time: Date.now()
}));
yield put(actions.changeInput('currentProperty', SetPropertyPropertyIdVariable));



		} catch(error) {
            console.warn(error)
		}
	}
}
function* SIGNUP() {
	while(true) {
		let { inputVariables, params, history } = yield take(actions.SIGNUP);
		
		// Write page parameters to temporary state for standard access.
		let state = yield select();
		state.page = state.routing && state.routing.locationBeforeTransitions ? state.routing.locationBeforeTransitions.query : {};
		params && Object.keys(params).forEach((k) => state[k] = params[k]);
		
		let payload;
		
		try {
			
			
			
			
var SignUpErrorMessageVariable = "Email already in use!"

			
			
			


payload = {};
payload['body_variables'] = {};
payload.body_variables['email'] = state.reducer?.['signUpEPI']?.['email'];
payload.body_variables['password'] = state.reducer?.['signUpEPI']?.['password'];
payload.body_variables['firstName'] = state.reducer?.['signUpEPI']?.['firstName'];
payload.body_variables['lastName'] = state.reducer?.['signUpEPI']?.['lastName'];
const response37517 = yield call(serverApi.SignUpEndpoint, payload);

const SignUpEndpointResponseCodeAsVariable = response37517.status;
yield put(actions.logEvent({
	id: 37517,
	options: {
		body_variables: { "7eedb2f1-5547-41dc-a033-a65b3f6cfcda.102821":state.reducer?.['signUpEPI']?.['email'],  "7eedb2f1-5547-41dc-a033-a65b3f6cfcda.102822":state.reducer?.['signUpEPI']?.['password'],  "7eedb2f1-5547-41dc-a033-a65b3f6cfcda.106584":state.reducer?.['signUpEPI']?.['firstName'],  "7eedb2f1-5547-41dc-a033-a65b3f6cfcda.106585":state.reducer?.['signUpEPI']?.['lastName'], 
		},
		response_code_as: SignUpEndpointResponseCodeAsVariable,
	},
	type: "event",
	time: Date.now()
}));
if (SignUpEndpointResponseCodeAsVariable == 
state.reducer['httpSuccessCode']
) {
yield put(actions.logEvent({
	id: 37519,
	options: {
		parameter_mapping: {
			 "14adb65e-ca38-438f-ad2b-6eaef766374c":state.reducer['signUpEPI']['password'],  "be4d0ca3-99e7-4963-bf76-3bdd2434bce1":state.reducer['signUpEPI']['email'], 
		}
	},
	type: "event",
	time: Date.now()
}));
yield put(actions.runAction("LOGIN", { inputVariables: {  "password":state.reducer['signUpEPI']['password'],  "email":state.reducer['signUpEPI']['email'], }  }));

history.push(`/`);
}
if (SignUpEndpointResponseCodeAsVariable != 
state.reducer['httpSuccessCode']
) {
yield put(actions.logEvent({
	id: 37521,
	options: {
		message: SignUpErrorMessageVariable
	},
	type: "event",
	time: Date.now()
}));
window.alert(SignUpErrorMessageVariable)
}
		} catch(error) {
            console.warn(error)
		}
	}
}
function* UPDATEIMAGEFILE() {
	while(true) {
		let { inputVariables, params, history } = yield take(actions.UPDATEIMAGEFILE);
		
		// Write page parameters to temporary state for standard access.
		let state = yield select();
		state.page = state.routing && state.routing.locationBeforeTransitions ? state.routing.locationBeforeTransitions.query : {};
		params && Object.keys(params).forEach((k) => state[k] = params[k]);
		
		let payload;
		
		try {
			
			
			let FileUpdateFileVariable = inputVariables["fileUpdateFile"]
			
			let UpdateFilePathVariable = inputVariables["updateFilePath"]
			
			let UpdateFilePropertyIdVariable = inputVariables["updateFilePropertyId"]
			
			let UpdateFileUserIdVariable = inputVariables["updateFileUserId"]
			
			
			
			
yield put(actions.logEvent({
	id: 47002,
	options: {
		field_key: 'Loading',
		field_value: state.reducer['true']
	},
	type: "event",
	time: Date.now()
}));
yield put(actions.changeInput('Loading', state.reducer['true']));






payload = {};
payload['query_variables'] = {};
payload.query_variables['user_id'] = UpdateFileUserIdVariable;
payload.query_variables['property_id'] = UpdateFilePropertyIdVariable;
const response46974 = yield call(serverApi.Action21369Endpoint, payload);

const DeleteProfilePhotoCodeVariable = response46974.status;
yield put(actions.logEvent({
	id: 46974,
	options: {
		query_variables: { "d0809b1d-13fd-4a74-a9cf-4c4314f0a6d3":UpdateFileUserIdVariable,  "f80fcacc-e85a-44ce-bb9a-9d01bca58e38":UpdateFilePropertyIdVariable, 
		},
		response_code_as: DeleteProfilePhotoCodeVariable,
	},
	type: "event",
	time: Date.now()
}));
if (DeleteProfilePhotoCodeVariable == 
state.reducer['httpSuccessCode']
 || DeleteProfilePhotoCodeVariable != 
state.reducer['httpSuccessCode']
) {

}

yield put(actions.logEvent({
	id: 46982,
	options: {
		parameter_mapping: {
			 "0ecd9c30-1846-49a9-93cd-2a9623445c6d":UpdateFilePropertyIdVariable,  "13819ac8-ec00-45b7-94a1-a695cd1958f7":FileUpdateFileVariable,  "412fef72-996a-42e7-af2d-e27035066c02":UpdateFileUserIdVariable,  "9969772e-5f21-493d-9b68-d5db28b97c29":UpdateFilePathVariable, 
		}
	},
	type: "event",
	time: Date.now()
}));
yield put(actions.runAction("FILEUPLOAD", { inputVariables: {  "photosProperty_id":UpdateFilePropertyIdVariable,  "file":FileUpdateFileVariable,  "photosUserId":UpdateFileUserIdVariable,  "filePath":UpdateFilePathVariable, }  }));

yield put(actions.logEvent({
	id: 47003,
	options: {
		field_key: 'Loading',
		field_value: state.reducer['false']
	},
	type: "event",
	time: Date.now()
}));
yield put(actions.changeInput('Loading', state.reducer['false']));



		} catch(error) {
            console.warn(error)
		}
	}
}
function* UPDATELISTING() {
	while(true) {
		let { inputVariables, params, history } = yield take(actions.UPDATELISTING);
		
		// Write page parameters to temporary state for standard access.
		let state = yield select();
		state.page = state.routing && state.routing.locationBeforeTransitions ? state.routing.locationBeforeTransitions.query : {};
		params && Object.keys(params).forEach((k) => state[k] = params[k]);
		
		let payload;
		
		try {
			
			
			let IdVariable = inputVariables["id"]
			
			let SetPropertyUpdatedIdVariable = inputVariables["setPropertyUpdatedId"]
			
			
			
			
			
var HttpSuccessCode2Variable = 200

			
			
			


payload = {};
payload['path_variables'] = {};
payload.path_variables['id'] = IdVariable;
payload['body_variables'] = {};
payload.body_variables['guest_limit'] = state.reducer?.['updateListingsEPI']?.['guest_limit'];
payload.body_variables['order_type_id'] = state.reducer?.['updateListingsEPI']?.['order_type_id'];
payload.body_variables['price'] = state.reducer?.['updateListingsEPI']?.['price'];
payload.body_variables['check_in_id'] = state.reducer?.['updateListingsEPI']?.['check_in_id'];
payload.body_variables['check_out_id'] = state.reducer?.['updateListingsEPI']?.['check_out_id'];
const response43765 = yield call(serverApi.UpdateListingsEndpoint, payload);
const UpdateListingEPIVariable = response43765.data;
const UpdateListingEPICodeVariable = response43765.status;
yield put(actions.logEvent({
	id: 43765,
	options: {
		body_variables: { "1bba5803-7d99-4b17-9b42-e33b23d8cceb.106702":state.reducer?.['updateListingsEPI']?.['guest_limit'],  "1bba5803-7d99-4b17-9b42-e33b23d8cceb.106704":state.reducer?.['updateListingsEPI']?.['order_type_id'],  "1bba5803-7d99-4b17-9b42-e33b23d8cceb.106706":state.reducer?.['updateListingsEPI']?.['price'],  "1bba5803-7d99-4b17-9b42-e33b23d8cceb.106718":state.reducer?.['updateListingsEPI']?.['check_in_id'],  "1bba5803-7d99-4b17-9b42-e33b23d8cceb.106719":state.reducer?.['updateListingsEPI']?.['check_out_id'], 
		},
		path_variables: { "0f9db675-8f2e-4828-b5c0-3a3596699d43":IdVariable, 
		},
		response_as: UpdateListingEPIVariable,
		response_code_as: UpdateListingEPICodeVariable,
	},
	type: "event",
	time: Date.now()
}));
if (HttpSuccessCode2Variable == UpdateListingEPICodeVariable) {
yield put(actions.logEvent({
	id: 43809,
	options: {
		message: state.reducer?.['listingUpdated']
	},
	type: "event",
	time: Date.now()
}));
window.alert(state.reducer?.['listingUpdated'])
}

yield put(actions.logEvent({
	id: 46098,
	options: {
		parameter_mapping: {
			 "970d90ef-b31b-49df-8b5a-08d86cbea827":SetPropertyUpdatedIdVariable, 
		}
	},
	type: "event",
	time: Date.now()
}));
yield put(actions.runAction("GETPROPERTYLISTINGS", { inputVariables: {  "getListingsPropertyID":SetPropertyUpdatedIdVariable, }  }));
		} catch(error) {
            console.warn(error)
		}
	}
}
function* UPDATEPROPERTY() {
	while(true) {
		let { inputVariables, params, history } = yield take(actions.UPDATEPROPERTY);
		
		// Write page parameters to temporary state for standard access.
		let state = yield select();
		state.page = state.routing && state.routing.locationBeforeTransitions ? state.routing.locationBeforeTransitions.query : {};
		params && Object.keys(params).forEach((k) => state[k] = params[k]);
		
		let payload;
		
		try {
			
			
			let UpdatePropertyPropertyIDVariable = inputVariables["updatePropertyPropertyID"]
			
			
			
			
			
var PendingVariable = "pending"

			
			
			


payload = {};
payload['path_variables'] = {};
payload.path_variables['id'] = UpdatePropertyPropertyIDVariable;
payload['body_variables'] = {};
payload.body_variables['land_type'] = state.reducer?.['updatePropertyEPI']?.['land_type'];
payload.body_variables['status'] = PendingVariable;
payload.body_variables['creator_id'] = state.reducer?.['currentUser']?.['Id'];
payload.body_variables['city'] = state.reducer?.['updatePropertyEPI']?.['city'];
payload.body_variables['state'] = state.reducer?.['updatePropertyEPI']?.['state'];
payload.body_variables['zip'] = state.reducer?.['updatePropertyEPI']?.['zip'];
payload.body_variables['amenity'] = state.reducer?.['updatePropertyEPI']?.['amenity'];
payload.body_variables['name'] = state.reducer?.['updatePropertyEPI']?.['name'];
payload.body_variables['description'] = state.reducer?.['updatePropertyEPI']?.['description'];
payload.body_variables['address'] = state.reducer?.['updatePropertyEPI']?.['address'];
const response46622 = yield call(serverApi.UpdatePropertiesEndpoint, payload);

const UpdatePropertyEPICodeVariable = response46622.status;
yield put(actions.logEvent({
	id: 46622,
	options: {
		body_variables: { "eb9ff7fd-115c-4dc3-97bc-7aa024cf24f2.102983":state.reducer?.['updatePropertyEPI']?.['land_type'],  "eb9ff7fd-115c-4dc3-97bc-7aa024cf24f2.102984":PendingVariable,  "eb9ff7fd-115c-4dc3-97bc-7aa024cf24f2.102986":state.reducer?.['currentUser']?.['Id'],  "eb9ff7fd-115c-4dc3-97bc-7aa024cf24f2.102987":state.reducer?.['updatePropertyEPI']?.['city'],  "eb9ff7fd-115c-4dc3-97bc-7aa024cf24f2.102988":state.reducer?.['updatePropertyEPI']?.['state'],  "eb9ff7fd-115c-4dc3-97bc-7aa024cf24f2.102989":state.reducer?.['updatePropertyEPI']?.['zip'],  "eb9ff7fd-115c-4dc3-97bc-7aa024cf24f2.102990":state.reducer?.['updatePropertyEPI']?.['amenity'],  "eb9ff7fd-115c-4dc3-97bc-7aa024cf24f2.102991":state.reducer?.['updatePropertyEPI']?.['name'],  "eb9ff7fd-115c-4dc3-97bc-7aa024cf24f2.102992":state.reducer?.['updatePropertyEPI']?.['description'],  "eb9ff7fd-115c-4dc3-97bc-7aa024cf24f2.102993":state.reducer?.['updatePropertyEPI']?.['address'], 
		},
		path_variables: { "2dd20609-ce2c-4c78-a362-b67faa871b2a":UpdatePropertyPropertyIDVariable, 
		},
		response_code_as: UpdatePropertyEPICodeVariable,
	},
	type: "event",
	time: Date.now()
}));
		} catch(error) {
            console.warn(error)
		}
	}
}
function* UPDATEUSER() {
	while(true) {
		let { inputVariables, params, history } = yield take(actions.UPDATEUSER);
		
		// Write page parameters to temporary state for standard access.
		let state = yield select();
		state.page = state.routing && state.routing.locationBeforeTransitions ? state.routing.locationBeforeTransitions.query : {};
		params && Object.keys(params).forEach((k) => state[k] = params[k]);
		
		let payload;
		
		try {
			
			
			


payload = {};
payload['path_variables'] = {};
payload.path_variables['user_id'] = state.reducer?.['currentUser']?.['Id'];
payload['body_variables'] = {};
payload.body_variables['Id'] = state.reducer?.['currentUser']?.['Id'];
payload.body_variables['email'] = state.reducer?.['currentUser']?.['email'];
payload.body_variables['password'] = state.reducer?.['currentUser']?.['password'];
payload.body_variables['profile_picture'] = state.reducer?.['currentUser']?.['profile_picture'];
payload.body_variables['bio'] = state.reducer?.['FormUpdateUsersEndpoint']?.['bio'];
payload.body_variables['first_name'] = state.reducer?.['currentUser']?.['first_name'];
payload.body_variables['last_name'] = state.reducer?.['currentUser']?.['last_name'];
payload.body_variables['phone number'] = state.reducer?.['FormUpdateUsersEndpoint']?.['phone number'];
payload.body_variables['last_log_in_date_time'] = state.reducer?.['currentUser']?.['last_log_in_date_time'];
payload.body_variables['type_of_user'] = state.reducer?.['currentUser']?.['type_of_user'];
payload.body_variables['stripe_customer_id'] = state.reducer?.['currentUser']?.['stripe_customer_id'];
payload.body_variables['partner_site_id'] = state.reducer?.['currentPartnerSite']?.['Id'];
const response43590 = yield call(serverApi.UpdateUserEndpoint, payload);
const UpdateUserResponseVariable = response43590.data;
const UpdateUserResponseCodeVariable = response43590.status;
yield put(actions.logEvent({
	id: 43590,
	options: {
		body_variables: { "8898e472-c854-4afa-83d3-797c17101e7b.42710":state.reducer?.['currentUser']?.['Id'],  "8898e472-c854-4afa-83d3-797c17101e7b.42711":state.reducer?.['currentUser']?.['email'],  "8898e472-c854-4afa-83d3-797c17101e7b.42712":state.reducer?.['currentUser']?.['password'],  "8898e472-c854-4afa-83d3-797c17101e7b.42732":state.reducer?.['currentUser']?.['profile_picture'],  "8898e472-c854-4afa-83d3-797c17101e7b.42733":state.reducer?.['FormUpdateUsersEndpoint']?.['bio'],  "8898e472-c854-4afa-83d3-797c17101e7b.42734":state.reducer?.['currentUser']?.['first_name'],  "8898e472-c854-4afa-83d3-797c17101e7b.42735":state.reducer?.['currentUser']?.['last_name'],  "8898e472-c854-4afa-83d3-797c17101e7b.42736":state.reducer?.['FormUpdateUsersEndpoint']?.['phone number'],  "8898e472-c854-4afa-83d3-797c17101e7b.42737":state.reducer?.['currentUser']?.['last_log_in_date_time'],  "8898e472-c854-4afa-83d3-797c17101e7b.42738":state.reducer?.['currentUser']?.['type_of_user'],  "8898e472-c854-4afa-83d3-797c17101e7b.42806":state.reducer?.['currentUser']?.['stripe_customer_id'],  "8898e472-c854-4afa-83d3-797c17101e7b.44369":state.reducer?.['currentPartnerSite']?.['Id'], 
		},
		path_variables: { "b6a92a73-cf84-43c6-92ee-e975e204b7c0":state.reducer?.['currentUser']?.['Id'], 
		},
		response_as: UpdateUserResponseVariable,
		response_code_as: UpdateUserResponseCodeVariable,
	},
	type: "event",
	time: Date.now()
}));
if (UpdateUserResponseCodeVariable == 
state.reducer['httpSuccessCode']
) {
yield put(actions.logEvent({
	id: 43595,
	options: {
		field_key: 'currentUser',
		field_value: UpdateUserResponseVariable
	},
	type: "event",
	time: Date.now()
}));
yield put(actions.changeInput('currentUser', UpdateUserResponseVariable));
}
		} catch(error) {
            console.warn(error)
		}
	}
}
function* UPDATEUSEREMAIL() {
	while(true) {
		let { inputVariables, params, history } = yield take(actions.UPDATEUSEREMAIL);
		
		// Write page parameters to temporary state for standard access.
		let state = yield select();
		state.page = state.routing && state.routing.locationBeforeTransitions ? state.routing.locationBeforeTransitions.query : {};
		params && Object.keys(params).forEach((k) => state[k] = params[k]);
		
		let payload;
		
		try {
			
			
			let UpdateEmailVariable = inputVariables["updateEmail"]
			
			
			
			


payload = {};
payload['query_variables'] = {};
payload.query_variables['user_id'] = state.reducer?.['currentUser']?.['Id'];
payload['body_variables'] = {};
payload.body_variables['email'] = UpdateEmailVariable;
const response46842 = yield call(serverApi.Action21335Endpoint, payload);
const UpdateUserEmailEPIVariable = response46842.data;
const UpdateUserEmailEPICodeVariable = response46842.status;
yield put(actions.logEvent({
	id: 46842,
	options: {
		body_variables: { "103be3b1-3800-40ca-82a3-f121874008fc.110153":UpdateEmailVariable, 
		},
		query_variables: { "d4a05293-eeab-4661-9205-9f856bfee893":state.reducer?.['currentUser']?.['Id'], 
		},
		response_as: UpdateUserEmailEPIVariable,
		response_code_as: UpdateUserEmailEPICodeVariable,
	},
	type: "event",
	time: Date.now()
}));
if (UpdateUserEmailEPICodeVariable == 
state.reducer['httpSuccessCode']
) {
yield put(actions.logEvent({
	id: 46845,
	options: {
	},
	type: "event",
	time: Date.now()
}));
yield put(actions.runAction("GETME", { inputVariables:{} }));

yield put(actions.logEvent({
	id: 46846,
	options: {
		field_key: 'updateUserEmail'
	},
	type: "event",
	time: Date.now()
}));
yield put(actions.removeField('updateUserEmail'));
}
		} catch(error) {
            console.warn(error)
		}
	}
}
function* on_app_started() {
	while(true) {
		let { inputVariables, params, history } = yield take(actions.on_app_started);
		
		// Write page parameters to temporary state for standard access.
		let state = yield select();
		state.page = state.routing && state.routing.locationBeforeTransitions ? state.routing.locationBeforeTransitions.query : {};
		params && Object.keys(params).forEach((k) => state[k] = params[k]);
		
		let payload;
		
		try {
			
			
			

const response37536 = yield call(serverApi.GetMeEndpoint, null);
const GetMeEndpointResponseAsVariable = response37536.data;
const GetMeEndpointResponseCodeAsVariable = response37536.status;
yield put(actions.logEvent({
	id: 37536,
	options: {
		response_as: GetMeEndpointResponseAsVariable,
		response_code_as: GetMeEndpointResponseCodeAsVariable,
	},
	type: "event",
	time: Date.now()
}));
if (GetMeEndpointResponseCodeAsVariable == 
state.reducer['httpSuccessCode']
) {
yield put(actions.logEvent({
	id: 37538,
	options: {
		field_key: 'currentUser',
		field_value: GetMeEndpointResponseAsVariable
	},
	type: "event",
	time: Date.now()
}));
yield put(actions.changeInput('currentUser', GetMeEndpointResponseAsVariable));




yield put(actions.logEvent({
	id: 37539,
	options: {
		field_key: 'isLoggedIn',
		field_value: state.reducer['true']
	},
	type: "event",
	time: Date.now()
}));
yield put(actions.changeInput('isLoggedIn', state.reducer['true']));
}
yield put(actions.changeInput("_app_initialized", true));
		} catch(error) {
            console.warn(error)
		}
	}
}

export default function* saga() {
	yield fork(log_event);
	yield fork(_initializeWebSocketsChannel);
	yield fork(ACTION_1);
	yield fork(APPENDAMENITIES);
	yield fork(APPROVEBOOKING);
	yield fork(CHECKUSERPROPERTIES);
	yield fork(CLOSELOADING);
	yield fork(CREATEARRAY);
	yield fork(CREATELISTING);
	yield fork(CREATEPROPERTY);
	yield fork(CURRENTPARTNERLISTINGS);
	yield fork(DELETEBOOKINGS);
	yield fork(DELETELISTING);
	yield fork(DELETEPHOTO);
	yield fork(DELETEPROPERTY);
	yield fork(ESTAMENITYARRAY);
	yield fork(FILEUPLOAD);
	yield fork(GETALLPROPERTYIMAGES);
	yield fork(GETAMENITIES);
	yield fork(GETBOOKINGS);
	yield fork(GETCONVERSATION);
	yield fork(GETHELPPOST);
	yield fork(GETHELPPOSTS);
	yield fork(GETME);
	yield fork(GETMESSAGES);
	yield fork(GETONEBOOKING);
	yield fork(GETONEPROPERTYIMAGE);
	yield fork(GETORDERTYPES);
	yield fork(GETPARTNERSITES);
	yield fork(GETPROFILEPICTURE);
	yield fork(GETPROPERTIES);
	yield fork(GETPROPERTIESCUSTOM);
	yield fork(GETPROPERTY);
	yield fork(GETPROPERTYLISTINGDATA);
	yield fork(GETPROPERTYLISTINGS);
	yield fork(GETUSSTATES);
	yield fork(GETUSERS);
	yield fork(GETVISITOR);
	yield fork(GOADDLISTINGS);
	yield fork(GOADDPROPERTY);
	yield fork(GOHOME);
	yield fork(GOHOSTDASHBOARD);
	yield fork(GOSUPPORT);
	yield fork(HIGHLIGHTELEMENT);
	yield fork(LOGIN);
	yield fork(LOGOUT);
	yield fork(MAKEDATEUNAVAILABLE);
	yield fork(MARKASREAD);
	yield fork(MODALCLOSEBOOKING);
	yield fork(MODALCLOSELISTING);
	yield fork(MODALSHOWBOOKING);
	yield fork(MODALSHOWLISTING);
	yield fork(OPENEDITPROPERTY);
	yield fork(OPENHELPPOST);
	yield fork(OPENPROPERTY);
	yield fork(REJECTBOOKINGREQUEST);
	yield fork(REQUESTPASSWORDRESET);
	yield fork(SENDMESSAGE);
	yield fork(SETPARTNERSITE);
	yield fork(SETPROPERTY);
	yield fork(SIGNUP);
	yield fork(UPDATEIMAGEFILE);
	yield fork(UPDATELISTING);
	yield fork(UPDATEPROPERTY);
	yield fork(UPDATEUSER);
	yield fork(UPDATEUSEREMAIL);
	yield fork(on_app_started);
}