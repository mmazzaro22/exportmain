import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

function baseUrl() {
  const { hostname, port, protocol } = window.location;
  let url = `${protocol}//${hostname}`;
  if(port) {
    url = `${url}:${port}`;
  }

  return url;
}

function formatVariables(payload, url) {
  const urlData = {
    path: url,
    headers: payload.header_variables ? payload.header_variables : {},
    body: null
  }

  // Replace path variables
  if(payload.path_variables && Object.keys(payload.path_variables).length > 0) {
    for (const [field, value] of Object.entries(payload.path_variables)) {
      urlData.path = urlData.path.replaceAll(`{${field}}`, value);
    }
  }

  // Add query variables
  if(payload.query_variables && Object.keys(payload.query_variables).length > 0) {
    urlData.path += "?" + new URLSearchParams(payload.query_variables).toString();
  }

  // Add body variables
  if(payload.body_variables) {
    if(payload.body_variables instanceof FormData) {
      urlData.body = payload.body_variables;
    } else if(Object.keys(payload.body_variables).length > 0) {
      if(requestContentType === "multipart/form-data") {
          var formData = new FormData();
          Object.keys(payload.body_variables).forEach((k) => formData.append(k, payload.body_variables[k]));
          urlData.body = formData;
      } else {
        urlData.body = JSON.stringify(payload.body_variables);
      }
    }
  }

  return urlData;
}

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: baseUrl() }),
  endpoints: (builder) => ({
    GETAction19384Endpoint: builder.query({
      query: (payload) => {
        const { path, headers, body } = formatVariables(payload, '/v1/action_19384');
        return ({
          url: path,
          method: 'GET',
          Headers: {
            'Content-Type': 'application/json;charset=UTF-8',
            ...headers
          },
          body
        })
      },
    }),
  
    GETAction20071Endpoint: builder.query({
      query: (payload) => {
        const { path, headers, body } = formatVariables(payload, '/v1/action_20071');
        return ({
          url: path,
          method: 'GET',
          Headers: {
            'Content-Type': 'application/json;charset=UTF-8',
            ...headers
          },
          body
        })
      },
    }),
  
    GETAction21102Endpoint: builder.query({
      query: (payload) => {
        const { path, headers, body } = formatVariables(payload, '/v1/action_21102');
        return ({
          url: path,
          method: 'GET',
          Headers: {
            'Content-Type': 'application/json;charset=UTF-8',
            ...headers
          },
          body
        })
      },
    }),
  
    POSTAction21152Endpoint: builder.query({
      query: (payload) => {
        const { path, headers, body } = formatVariables(payload, '/v1/action_21152');
        return ({
          url: path,
          method: 'POST',
          Headers: {
            'Content-Type': 'multipart/form-data',
            ...headers
          },
          body
        })
      },
    }),
  
    GETAction21261Endpoint: builder.query({
      query: (payload) => {
        const { path, headers, body } = formatVariables(payload, '/v1/action_21261');
        return ({
          url: path,
          method: 'GET',
          Headers: {
            'Content-Type': 'application/json;charset=UTF-8',
            ...headers
          },
          body
        })
      },
    }),
  
    PUTAction21335Endpoint: builder.query({
      query: (payload) => {
        const { path, headers, body } = formatVariables(payload, '/v1/action_21335');
        return ({
          url: path,
          method: 'PUT',
          Headers: {
            'Content-Type': 'application/json;charset=UTF-8',
            ...headers
          },
          body
        })
      },
    }),
  
    DELETEAction21369Endpoint: builder.query({
      query: (payload) => {
        const { path, headers, body } = formatVariables(payload, '/v1/action_21369');
        return ({
          url: path,
          method: 'DELETE',
          Headers: {
            'Content-Type': 'application/json;charset=UTF-8',
            ...headers
          },
          body
        })
      },
    }),
  
    GETAction21581Endpoint: builder.query({
      query: (payload) => {
        const { path, headers, body } = formatVariables(payload, '/v1/action_21581');
        return ({
          url: path,
          method: 'GET',
          Headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            ...headers
          },
          body
        })
      },
    }),
  
    GETGetAmenitiesEndpoint: builder.query({
      query: (payload) => {
        const { path, headers, body } = formatVariables(payload, '/v1/amenities');
        return ({
          url: path,
          method: 'GET',
          Headers: {
            'Content-Type': 'application/json;charset=UTF-8',
            ...headers
          },
          body
        })
      },
    }),
  
    POSTCreateBookingsEndpoint: builder.query({
      query: (payload) => {
        const { path, headers, body } = formatVariables(payload, '/v1/bookings');
        return ({
          url: path,
          method: 'POST',
          Headers: {
            'Content-Type': 'application/json;charset=UTF-8',
            ...headers
          },
          body
        })
      },
    }),
  
    GETGetBookingsEndpoint: builder.query({
      query: (payload) => {
        const { path, headers, body } = formatVariables(payload, '/v1/bookings/listings/{creator_id}/');
        return ({
          url: path,
          method: 'GET',
          Headers: {
            'Content-Type': 'application/json;charset=UTF-8',
            ...headers
          },
          body
        })
      },
    }),
  
    GETGetOneBookingsEndpoint: builder.query({
      query: (payload) => {
        const { path, headers, body } = formatVariables(payload, '/v1/bookings/{id}/');
        return ({
          url: path,
          method: 'GET',
          Headers: {
            'Content-Type': 'application/json;charset=UTF-8',
            ...headers
          },
          body
        })
      },
    }),
  
    DELETEDeleteBookingsEndpoint: builder.query({
      query: (payload) => {
        const { path, headers, body } = formatVariables(payload, '/v1/bookings/{id}/');
        return ({
          url: path,
          method: 'DELETE',
          Headers: {
            'Content-Type': 'application/json;charset=UTF-8',
            ...headers
          },
          body
        })
      },
    }),
  
    GETAction20241Endpoint: builder.query({
      query: (payload) => {
        const { path, headers, body } = formatVariables(payload, '/v1/conversations/{receiver_id}/');
        return ({
          url: path,
          method: 'GET',
          Headers: {
            'Content-Type': 'application/json;charset=UTF-8',
            ...headers
          },
          body
        })
      },
    }),
  
    GETAction21415Endpoint: builder.query({
      query: (payload) => {
        const { path, headers, body } = formatVariables(payload, '/v1/conversations/{receiver_id}/{sender_id}/');
        return ({
          url: path,
          method: 'GET',
          Headers: {
            'Content-Type': 'application/json;charset=UTF-8',
            ...headers
          },
          body
        })
      },
    }),
  
    POSTAction20240Endpoint: builder.query({
      query: (payload) => {
        const { path, headers, body } = formatVariables(payload, '/v1/create_conversation/{receiver_id}/{sender_id}/{message}');
        return ({
          url: path,
          method: 'POST',
          Headers: {
            'Content-Type': 'application/json;charset=UTF-8',
            ...headers
          },
          body
        })
      },
    }),
  
    GETGetHelpPostsEndpoint: builder.query({
      query: (payload) => {
        const { path, headers, body } = formatVariables(payload, '/v1/help_posts');
        return ({
          url: path,
          method: 'GET',
          Headers: {
            'Content-Type': 'application/json;charset=UTF-8',
            ...headers
          },
          body
        })
      },
    }),
  
    GETGetOneHelpPostsEndpoint: builder.query({
      query: (payload) => {
        const { path, headers, body } = formatVariables(payload, '/v1/help_posts/{id}/');
        return ({
          url: path,
          method: 'GET',
          Headers: {
            'Content-Type': 'application/json;charset=UTF-8',
            ...headers
          },
          body
        })
      },
    }),
  
    GETAction19769Endpoint: builder.query({
      query: (payload) => {
        const { path, headers, body } = formatVariables(payload, '/v1/listings');
        return ({
          url: path,
          method: 'GET',
          Headers: {
            'Content-Type': 'application/json;charset=UTF-8',
            ...headers
          },
          body
        })
      },
    }),
  
    GETAction20255Endpoint: builder.query({
      query: (payload) => {
        const { path, headers, body } = formatVariables(payload, '/v1/listings/partner_site_id/{partner_site_id}/');
        return ({
          url: path,
          method: 'GET',
          Headers: {
            'Content-Type': 'application/json;charset=UTF-8',
            ...headers
          },
          body
        })
      },
    }),
  
    GETAction21608Endpoint: builder.query({
      query: (payload) => {
        const { path, headers, body } = formatVariables(payload, '/v1/listings/partner_site_id/{state}/');
        return ({
          url: path,
          method: 'GET',
          Headers: {
            'Content-Type': 'application/json;charset=UTF-8',
            ...headers
          },
          body
        })
      },
    }),
  
    GETAction20042Endpoint: builder.query({
      query: (payload) => {
        const { path, headers, body } = formatVariables(payload, '/v1/listings/properties/{property_id}');
        return ({
          url: path,
          method: 'GET',
          Headers: {
            'Content-Type': 'application/json;charset=UTF-8',
            ...headers
          },
          body
        })
      },
    }),
  
    DELETEDeleteListingsEndpoint: builder.query({
      query: (payload) => {
        const { path, headers, body } = formatVariables(payload, '/v1/listings/{id}/');
        return ({
          url: path,
          method: 'DELETE',
          Headers: {
            'Content-Type': 'application/json;charset=UTF-8',
            ...headers
          },
          body
        })
      },
    }),
  
    GETGetOneListingsEndpoint: builder.query({
      query: (payload) => {
        const { path, headers, body } = formatVariables(payload, '/v1/listings/{id}/');
        return ({
          url: path,
          method: 'GET',
          Headers: {
            'Content-Type': 'application/json;charset=UTF-8',
            ...headers
          },
          body
        })
      },
    }),
  
    POSTAction18697Endpoint: builder.query({
      query: (payload) => {
        const { path, headers, body } = formatVariables(payload, '/v1/listings/{property_id}/');
        return ({
          url: path,
          method: 'POST',
          Headers: {
            'Content-Type': 'application/json;charset=UTF-8',
            ...headers
          },
          body
        })
      },
    }),
  
    POSTLoginEndpoint: builder.query({
      query: (payload) => {
        const { path, headers, body } = formatVariables(payload, '/v1/login');
        return ({
          url: path,
          method: 'POST',
          Headers: {
            'Content-Type': 'application/json;charset=UTF-8',
            ...headers
          },
          body
        })
      },
    }),
  
    GETLogoutEndpoint: builder.query({
      query: (payload) => {
        const { path, headers, body } = formatVariables(payload, '/v1/logout');
        return ({
          url: path,
          method: 'GET',
          Headers: {
            'Content-Type': 'application/json;charset=UTF-8',
            ...headers
          },
          body
        })
      },
    }),
  
    GETGetMeEndpoint: builder.query({
      query: (payload) => {
        const { path, headers, body } = formatVariables(payload, '/v1/me');
        return ({
          url: path,
          method: 'GET',
          Headers: {
            'Content-Type': 'application/json;charset=UTF-8',
            ...headers
          },
          body
        })
      },
    }),
  
    GETGetMeEndpoint: builder.query({
      query: (payload) => {
        const { path, headers, body } = formatVariables(payload, '/v1/me_v1');
        return ({
          url: path,
          method: 'GET',
          Headers: {
            'Content-Type': 'application/json;charset=UTF-8',
            ...headers
          },
          body
        })
      },
    }),
  
    GETGetOrderTypesEndpoint: builder.query({
      query: (payload) => {
        const { path, headers, body } = formatVariables(payload, '/v1/order_types');
        return ({
          url: path,
          method: 'GET',
          Headers: {
            'Content-Type': 'application/json;charset=UTF-8',
            ...headers
          },
          body
        })
      },
    }),
  
    GETGetPartnerSitesEndpoint: builder.query({
      query: (payload) => {
        const { path, headers, body } = formatVariables(payload, '/v1/partner_sites');
        return ({
          url: path,
          method: 'GET',
          Headers: {
            'Content-Type': 'application/json;charset=UTF-8',
            ...headers
          },
          body
        })
      },
    }),
  
    GETAction21367Endpoint: builder.query({
      query: (payload) => {
        const { path, headers, body } = formatVariables(payload, '/v1/profile_picture');
        return ({
          url: path,
          method: 'GET',
          Headers: {
            'Content-Type': 'application/json;charset=UTF-8',
            ...headers
          },
          body
        })
      },
    }),
  
    POSTCreatePropertiesEndpoint: builder.query({
      query: (payload) => {
        const { path, headers, body } = formatVariables(payload, '/v1/properties');
        return ({
          url: path,
          method: 'POST',
          Headers: {
            'Content-Type': 'application/json;charset=UTF-8',
            ...headers
          },
          body
        })
      },
    }),
  
    GETGetPropertiesEndpoint: builder.query({
      query: (payload) => {
        const { path, headers, body } = formatVariables(payload, '/v1/properties');
        return ({
          url: path,
          method: 'GET',
          Headers: {
            'Content-Type': 'application/json;charset=UTF-8',
            ...headers
          },
          body
        })
      },
    }),
  
    GETAction19763Endpoint: builder.query({
      query: (payload) => {
        const { path, headers, body } = formatVariables(payload, '/v1/properties/all');
        return ({
          url: path,
          method: 'GET',
          Headers: {
            'Content-Type': 'application/json;charset=UTF-8',
            ...headers
          },
          body
        })
      },
    }),
  
    GETGetListingsEndpoint: builder.query({
      query: (payload) => {
        const { path, headers, body } = formatVariables(payload, '/v1/properties/listings/{property_id}/');
        return ({
          url: path,
          method: 'GET',
          Headers: {
            'Content-Type': 'application/json;charset=UTF-8',
            ...headers
          },
          body
        })
      },
    }),
  
    GETAction21475Endpoint: builder.query({
      query: (payload) => {
        const { path, headers, body } = formatVariables(payload, '/v1/properties/property_images/{creator_id}');
        return ({
          url: path,
          method: 'GET',
          Headers: {
            'Content-Type': 'application/json;charset=UTF-8',
            ...headers
          },
          body
        })
      },
    }),
  
    GETAction21246Endpoint: builder.query({
      query: (payload) => {
        const { path, headers, body } = formatVariables(payload, '/v1/properties/{creator_id}');
        return ({
          url: path,
          method: 'GET',
          Headers: {
            'Content-Type': 'application/json;charset=UTF-8',
            ...headers
          },
          body
        })
      },
    }),
  
    DELETEDeletePropertiesEndpoint: builder.query({
      query: (payload) => {
        const { path, headers, body } = formatVariables(payload, '/v1/properties/{id}/');
        return ({
          url: path,
          method: 'DELETE',
          Headers: {
            'Content-Type': 'application/json;charset=UTF-8',
            ...headers
          },
          body
        })
      },
    }),
  
    GETGetOnePropertiesEndpoint: builder.query({
      query: (payload) => {
        const { path, headers, body } = formatVariables(payload, '/v1/properties/{id}/');
        return ({
          url: path,
          method: 'GET',
          Headers: {
            'Content-Type': 'application/json;charset=UTF-8',
            ...headers
          },
          body
        })
      },
    }),
  
    PUTUpdatePropertiesEndpoint: builder.query({
      query: (payload) => {
        const { path, headers, body } = formatVariables(payload, '/v1/properties/{id}/');
        return ({
          url: path,
          method: 'PUT',
          Headers: {
            'Content-Type': 'application/json;charset=UTF-8',
            ...headers
          },
          body
        })
      },
    }),
  
    GETAction21272Endpoint: builder.query({
      query: (payload) => {
        const { path, headers, body } = formatVariables(payload, '/v1/property_images/');
        return ({
          url: path,
          method: 'GET',
          Headers: {
            'Content-Type': 'application/json;charset=UTF-8',
            ...headers
          },
          body
        })
      },
    }),
  
    GETGetOnePropertyImagesEndpoint: builder.query({
      query: (payload) => {
        const { path, headers, body } = formatVariables(payload, '/v1/property_images/{property_id}/');
        return ({
          url: path,
          method: 'GET',
          Headers: {
            'Content-Type': 'application/json;charset=UTF-8',
            ...headers
          },
          body
        })
      },
    }),
  
    GETAction21258Endpoint: builder.query({
      query: (payload) => {
        const { path, headers, body } = formatVariables(payload, '/v1/purchase/listing/{id}/');
        return ({
          url: path,
          method: 'GET',
          Headers: {
            'Content-Type': 'application/json;charset=UTF-8',
            ...headers
          },
          body
        })
      },
    }),
  
    GETRequestPasswordResetEndpoint: builder.query({
      query: (payload) => {
        const { path, headers, body } = formatVariables(payload, '/v1/request_password_reset');
        return ({
          url: path,
          method: 'GET',
          Headers: {
            'Content-Type': 'application/json;charset=UTF-8',
            ...headers
          },
          body
        })
      },
    }),
  
    GETResetPasswordEndpoint: builder.query({
      query: (payload) => {
        const { path, headers, body } = formatVariables(payload, '/v1/reset_password');
        return ({
          url: path,
          method: 'GET',
          Headers: {
            'Content-Type': 'application/json;charset=UTF-8',
            ...headers
          },
          body
        })
      },
    }),
  
    POSTSignUpEndpoint: builder.query({
      query: (payload) => {
        const { path, headers, body } = formatVariables(payload, '/v1/signup');
        return ({
          url: path,
          method: 'POST',
          Headers: {
            'Content-Type': 'application/json;charset=UTF-8',
            ...headers
          },
          body
        })
      },
    }),
  
    PUTAction20145Endpoint: builder.query({
      query: (payload) => {
        const { path, headers, body } = formatVariables(payload, '/v1/update_bookings/{id}/');
        return ({
          url: path,
          method: 'PUT',
          Headers: {
            'Content-Type': 'application/json;charset=UTF-8',
            ...headers
          },
          body
        })
      },
    }),
  
    PUTAction20159Endpoint: builder.query({
      query: (payload) => {
        const { path, headers, body } = formatVariables(payload, '/v1/update_bookings/{id}/{reject}/');
        return ({
          url: path,
          method: 'PUT',
          Headers: {
            'Content-Type': 'application/json;charset=UTF-8',
            ...headers
          },
          body
        })
      },
    }),
  
    PUTUpdateListingsEndpoint: builder.query({
      query: (payload) => {
        const { path, headers, body } = formatVariables(payload, '/v1/update_listings/{id}/');
        return ({
          url: path,
          method: 'PUT',
          Headers: {
            'Content-Type': 'application/json;charset=UTF-8',
            ...headers
          },
          body
        })
      },
    }),
  
    PUTUpdateUserEndpoint: builder.query({
      query: (payload) => {
        const { path, headers, body } = formatVariables(payload, '/v1/update_user');
        return ({
          url: path,
          method: 'PUT',
          Headers: {
            'Content-Type': 'application/json;charset=UTF-8',
            ...headers
          },
          body
        })
      },
    }),
  
    GETGetUsStatesEndpoint: builder.query({
      query: (payload) => {
        const { path, headers, body } = formatVariables(payload, '/v1/us_states');
        return ({
          url: path,
          method: 'GET',
          Headers: {
            'Content-Type': 'application/json;charset=UTF-8',
            ...headers
          },
          body
        })
      },
    }),
  
    GETGetUsersEndpoint: builder.query({
      query: (payload) => {
        const { path, headers, body } = formatVariables(payload, '/v1/users');
        return ({
          url: path,
          method: 'GET',
          Headers: {
            'Content-Type': 'application/json;charset=UTF-8',
            ...headers
          },
          body
        })
      },
    }),
  
    GETGetUserEndpoint: builder.query({
      query: (payload) => {
        const { path, headers, body } = formatVariables(payload, '/v1/users/{id}/');
        return ({
          url: path,
          method: 'GET',
          Headers: {
            'Content-Type': 'application/json;charset=UTF-8',
            ...headers
          },
          body
        })
      },
    }),
  
  }),
})

export const {
  useGETAction19384EndpointQuery,
  
  useGETAction20071EndpointQuery,
  
  useGETAction21102EndpointQuery,
  
  usePOSTAction21152EndpointQuery,
  
  useGETAction21261EndpointQuery,
  
  usePUTAction21335EndpointQuery,
  
  useDELETEAction21369EndpointQuery,
  
  useGETAction21581EndpointQuery,
  
  useGETGetAmenitiesEndpointQuery,
  
  usePOSTCreateBookingsEndpointQuery,
  
  useGETGetBookingsEndpointQuery,
  
  useGETGetOneBookingsEndpointQuery,
  
  useDELETEDeleteBookingsEndpointQuery,
  
  useGETAction20241EndpointQuery,
  
  useGETAction21415EndpointQuery,
  
  usePOSTAction20240EndpointQuery,
  
  useGETGetHelpPostsEndpointQuery,
  
  useGETGetOneHelpPostsEndpointQuery,
  
  useGETAction19769EndpointQuery,
  
  useGETAction20255EndpointQuery,
  
  useGETAction21608EndpointQuery,
  
  useGETAction20042EndpointQuery,
  
  useDELETEDeleteListingsEndpointQuery,
  
  useGETGetOneListingsEndpointQuery,
  
  usePOSTAction18697EndpointQuery,
  
  usePOSTLoginEndpointQuery,
  
  useGETLogoutEndpointQuery,
  
  useGETGetMeEndpointQuery,
  
  useGETGetMeEndpointQuery,
  
  useGETGetOrderTypesEndpointQuery,
  
  useGETGetPartnerSitesEndpointQuery,
  
  useGETAction21367EndpointQuery,
  
  usePOSTCreatePropertiesEndpointQuery,
  
  useGETGetPropertiesEndpointQuery,
  
  useGETAction19763EndpointQuery,
  
  useGETGetListingsEndpointQuery,
  
  useGETAction21475EndpointQuery,
  
  useGETAction21246EndpointQuery,
  
  useDELETEDeletePropertiesEndpointQuery,
  
  useGETGetOnePropertiesEndpointQuery,
  
  usePUTUpdatePropertiesEndpointQuery,
  
  useGETAction21272EndpointQuery,
  
  useGETGetOnePropertyImagesEndpointQuery,
  
  useGETAction21258EndpointQuery,
  
  useGETRequestPasswordResetEndpointQuery,
  
  useGETResetPasswordEndpointQuery,
  
  usePOSTSignUpEndpointQuery,
  
  usePUTAction20145EndpointQuery,
  
  usePUTAction20159EndpointQuery,
  
  usePUTUpdateListingsEndpointQuery,
  
  usePUTUpdateUserEndpointQuery,
  
  useGETGetUsStatesEndpointQuery,
  
  useGETGetUsersEndpointQuery,
  
  useGETGetUserEndpointQuery,
  
} = api;
