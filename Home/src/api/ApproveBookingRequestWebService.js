import { makeRequest } from './restApi.js';

const url = 'http://dittofi.com/2187/iapi/'
export function ApproveBookingRequestWebServiceEndpoint(payload) {
    return makeRequest('/v1/update_bookings/{id}/', 'put', 'application/json;charset=UTF-8', payload, url);
}
