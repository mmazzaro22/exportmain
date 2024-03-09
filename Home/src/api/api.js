import { makeRequest } from './restApi.js';
export function Action19384Endpoint(payload) {
    return makeRequest('/v1/action_19384', 'GET', 'application/json;charset=UTF-8', payload);
}

export function Action20071Endpoint(payload) {
    return makeRequest('/v1/action_20071', 'GET', 'application/json;charset=UTF-8', payload);
}

export function Action21102Endpoint(payload) {
    return makeRequest('/v1/action_21102', 'GET', 'application/json;charset=UTF-8', payload);
}

export function Action21152Endpoint(payload) {
    return makeRequest('/v1/action_21152', 'POST', 'multipart/form-data', payload);
}

export function Action21261Endpoint(payload) {
    return makeRequest('/v1/action_21261', 'GET', 'application/json;charset=UTF-8', payload);
}

export function Action21335Endpoint(payload) {
    return makeRequest('/v1/action_21335', 'PUT', 'application/json;charset=UTF-8', payload);
}

export function Action21369Endpoint(payload) {
    return makeRequest('/v1/action_21369', 'DELETE', 'application/json;charset=UTF-8', payload);
}

export function Action21581Endpoint(payload) {
    return makeRequest('/v1/action_21581', 'GET', 'application/x-www-form-urlencoded', payload);
}

export function GetAmenitiesEndpoint(payload) {
    return makeRequest('/v1/amenities', 'GET', 'application/json;charset=UTF-8', payload);
}

export function CreateBookingsEndpoint(payload) {
    return makeRequest('/v1/bookings', 'POST', 'application/json;charset=UTF-8', payload);
}

export function GetBookingsEndpoint(payload) {
    return makeRequest('/v1/bookings/listings/{creator_id}/', 'GET', 'application/json;charset=UTF-8', payload);
}

export function GetOneBookingsEndpoint(payload) {
    return makeRequest('/v1/bookings/{id}/', 'GET', 'application/json;charset=UTF-8', payload);
}

export function DeleteBookingsEndpoint(payload) {
    return makeRequest('/v1/bookings/{id}/', 'DELETE', 'application/json;charset=UTF-8', payload);
}

export function Action20241Endpoint(payload) {
    return makeRequest('/v1/conversations/{receiver_id}/', 'GET', 'application/json;charset=UTF-8', payload);
}

export function Action21415Endpoint(payload) {
    return makeRequest('/v1/conversations/{receiver_id}/{sender_id}/', 'GET', 'application/json;charset=UTF-8', payload);
}

export function Action20240Endpoint(payload) {
    return makeRequest('/v1/create_conversation/{receiver_id}/{sender_id}/{message}', 'POST', 'application/json;charset=UTF-8', payload);
}

export function GetHelpPostsEndpoint(payload) {
    return makeRequest('/v1/help_posts', 'GET', 'application/json;charset=UTF-8', payload);
}

export function GetOneHelpPostsEndpoint(payload) {
    return makeRequest('/v1/help_posts/{id}/', 'GET', 'application/json;charset=UTF-8', payload);
}

export function Action19769Endpoint(payload) {
    return makeRequest('/v1/listings', 'GET', 'application/json;charset=UTF-8', payload);
}

export function Action20255Endpoint(payload) {
    return makeRequest('/v1/listings/partner_site_id/{partner_site_id}/', 'GET', 'application/json;charset=UTF-8', payload);
}

export function Action21608Endpoint(payload) {
    return makeRequest('/v1/listings/partner_site_id/{state}/', 'GET', 'application/json;charset=UTF-8', payload);
}

export function Action20042Endpoint(payload) {
    return makeRequest('/v1/listings/properties/{property_id}', 'GET', 'application/json;charset=UTF-8', payload);
}

export function DeleteListingsEndpoint(payload) {
    return makeRequest('/v1/listings/{id}/', 'DELETE', 'application/json;charset=UTF-8', payload);
}

export function GetOneListingsEndpoint(payload) {
    return makeRequest('/v1/listings/{id}/', 'GET', 'application/json;charset=UTF-8', payload);
}

export function Action18697Endpoint(payload) {
    return makeRequest('/v1/listings/{property_id}/', 'POST', 'application/json;charset=UTF-8', payload);
}

export function LoginEndpoint(payload) {
    return makeRequest('/v1/login', 'POST', 'application/json;charset=UTF-8', payload);
}

export function LogoutEndpoint(payload) {
    return makeRequest('/v1/logout', 'GET', 'application/json;charset=UTF-8', payload);
}

export function GetMeEndpoint(payload) {
    return makeRequest('/v1/me', 'GET', 'application/json;charset=UTF-8', payload);
}

export function GetMeEndpoint(payload) {
    return makeRequest('/v1/me_v1', 'GET', 'application/json;charset=UTF-8', payload);
}

export function GetOrderTypesEndpoint(payload) {
    return makeRequest('/v1/order_types', 'GET', 'application/json;charset=UTF-8', payload);
}

export function GetPartnerSitesEndpoint(payload) {
    return makeRequest('/v1/partner_sites', 'GET', 'application/json;charset=UTF-8', payload);
}

export function Action21367Endpoint(payload) {
    return makeRequest('/v1/profile_picture', 'GET', 'application/json;charset=UTF-8', payload);
}

export function CreatePropertiesEndpoint(payload) {
    return makeRequest('/v1/properties', 'POST', 'application/json;charset=UTF-8', payload);
}

export function GetPropertiesEndpoint(payload) {
    return makeRequest('/v1/properties', 'GET', 'application/json;charset=UTF-8', payload);
}

export function Action19763Endpoint(payload) {
    return makeRequest('/v1/properties/all', 'GET', 'application/json;charset=UTF-8', payload);
}

export function GetListingsEndpoint(payload) {
    return makeRequest('/v1/properties/listings/{property_id}/', 'GET', 'application/json;charset=UTF-8', payload);
}

export function Action21475Endpoint(payload) {
    return makeRequest('/v1/properties/property_images/{creator_id}', 'GET', 'application/json;charset=UTF-8', payload);
}

export function Action21246Endpoint(payload) {
    return makeRequest('/v1/properties/{creator_id}', 'GET', 'application/json;charset=UTF-8', payload);
}

export function DeletePropertiesEndpoint(payload) {
    return makeRequest('/v1/properties/{id}/', 'DELETE', 'application/json;charset=UTF-8', payload);
}

export function GetOnePropertiesEndpoint(payload) {
    return makeRequest('/v1/properties/{id}/', 'GET', 'application/json;charset=UTF-8', payload);
}

export function UpdatePropertiesEndpoint(payload) {
    return makeRequest('/v1/properties/{id}/', 'PUT', 'application/json;charset=UTF-8', payload);
}

export function Action21272Endpoint(payload) {
    return makeRequest('/v1/property_images/', 'GET', 'application/json;charset=UTF-8', payload);
}

export function GetOnePropertyImagesEndpoint(payload) {
    return makeRequest('/v1/property_images/{property_id}/', 'GET', 'application/json;charset=UTF-8', payload);
}

export function Action21258Endpoint(payload) {
    return makeRequest('/v1/purchase/listing/{id}/', 'GET', 'application/json;charset=UTF-8', payload);
}

export function RequestPasswordResetEndpoint(payload) {
    return makeRequest('/v1/request_password_reset', 'GET', 'application/json;charset=UTF-8', payload);
}

export function ResetPasswordEndpoint(payload) {
    return makeRequest('/v1/reset_password', 'GET', 'application/json;charset=UTF-8', payload);
}

export function SignUpEndpoint(payload) {
    return makeRequest('/v1/signup', 'POST', 'application/json;charset=UTF-8', payload);
}

export function Action20145Endpoint(payload) {
    return makeRequest('/v1/update_bookings/{id}/', 'PUT', 'application/json;charset=UTF-8', payload);
}

export function Action20159Endpoint(payload) {
    return makeRequest('/v1/update_bookings/{id}/{reject}/', 'PUT', 'application/json;charset=UTF-8', payload);
}

export function UpdateListingsEndpoint(payload) {
    return makeRequest('/v1/update_listings/{id}/', 'PUT', 'application/json;charset=UTF-8', payload);
}

export function UpdateUserEndpoint(payload) {
    return makeRequest('/v1/update_user', 'PUT', 'application/json;charset=UTF-8', payload);
}

export function GetUsStatesEndpoint(payload) {
    return makeRequest('/v1/us_states', 'GET', 'application/json;charset=UTF-8', payload);
}

export function GetUsersEndpoint(payload) {
    return makeRequest('/v1/users', 'GET', 'application/json;charset=UTF-8', payload);
}

export function GetUserEndpoint(payload) {
    return makeRequest('/v1/users/{id}/', 'GET', 'application/json;charset=UTF-8', payload);
}
