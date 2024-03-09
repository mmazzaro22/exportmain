import { makeRequest } from './restApi.js';

const url = 'https://api.stripe.com'
export function CreateAccountWebServiceEndpoint(payload) {
    return makeRequest('/v1/accounts', 'post', 'application/x-www-form-urlencoded', payload, url);
}

export function CreateCheckoutSessionWebServiceEndpoint(payload) {
    return makeRequest('/v1/checkout/sessions', 'post', 'application/x-www-form-urlencoded', payload, url);
}
