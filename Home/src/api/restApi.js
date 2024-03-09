export function makeRequest(url, method, requestContentType, payload, baseUrl){
    const { hostname, port, protocol } = window.location;

    let fetchOptions = {
        method: method,
        headers: {},
        credentials: 'include'
    };

    if(requestContentType && requestContentType !== "multipart/form-data") {
        fetchOptions['Content-Type'] = requestContentType;
    }

    baseUrl = baseUrl ? baseUrl : `${protocol}//${hostname}:${port}/2187/iapi`;
    let finalUrl = `${baseUrl}${url}`;
   
    if(payload) {
        // Add headers.
        if(payload.header_variables) {
            fetchOptions.headers = payload.header_variables;
        }

        // Add missing headers.
        if(!fetchOptions.headers['Accept']) {
            fetchOptions.headers['Accept'] = 'application/json';
        } else if (!fetchOptions.headers['Accept'].indexOf('application/json') < 0) {
            fetchOptions.headers['Accept'] += ', ' + 'application/json';
        }

         // Add the body variables.
        if(payload.body_variables) {
            if(payload.body_variables instanceof FormData) {
                fetchOptions.body = payload.body_variables;
            } else if(Object.keys(payload.body_variables).length > 0) {
                if(requestContentType === "multipart/form-data") {
                    var formData = new FormData();
                    Object.keys(payload.body_variables).forEach((k) => formData.append(k, payload.body_variables[k]));
                    fetchOptions.body = formData;
                } else {
                    fetchOptions.body = JSON.stringify(payload.body_variables);
                }
            }
        }

        // Add the path variables.
        if(payload.path_variables && Object.keys(payload.path_variables).length > 0) {
            for (const [field, value] of Object.entries(payload.path_variables)) {
                finalUrl = finalUrl.replaceAll(`{${field}}`, value);
            }
        }

        // Add the query variables.
        if(payload.query_variables && Object.keys(payload.query_variables).length > 0) {
            finalUrl += "?" + new URLSearchParams(payload.query_variables).toString();
        }
    }

    return fetch(finalUrl, fetchOptions)
        .then(response => {
            if(response.headers.get('Content-Disposition') === "attachment") {
                return downloadFile(response);
            }

            return response.text()
                .then(responseText => {
                    let jsonData = {};
                    try{
                        jsonData = JSON.parse(responseText);
                    } catch(e){
                        //throw Error(e);
                    }
                    
                    return {
                        data: jsonData.data ? jsonData.data : jsonData,
                        status: response.status
                    };
                });
        });
}

// Custom download file function.
async function downloadFile(fetchResult) {        
    var filename = fetchResult.headers.get('content-disposition').split('filename=')[1];
    var data = await fetchResult.blob();
    // It is necessary to create a new blob object with mime-type explicitly set
    // otherwise only Chrome works like it should
    const blob = new Blob([data], { type: data.type || 'application/octet-stream' });
    if (typeof window.navigator.msSaveBlob !== 'undefined') {
        // IE doesn't allow using a blob object directly as link href.
        // Workaround for "HTML7007: One or more blob URLs were
        // revoked by closing the blob for which they were created.
        // These URLs will no longer resolve as the data backing
        // the URL has been freed."
        window.navigator.msSaveBlob(blob, filename);
        return;
    }
    // Other browsers
    // Create a link pointing to the ObjectURL containing the blob
    const blobURL = window.URL.createObjectURL(blob);
    const tempLink = document.createElement('a');
    tempLink.style.display = 'none';
    tempLink.href = blobURL;
    tempLink.setAttribute('download', filename);
    // Safari thinks _blank anchor are pop ups. We only want to set _blank
    // target if the browser does not support the HTML5 download attribute.
    // This allows you to download files in desktop safari if pop up blocking
    // is enabled.
    if (typeof tempLink.download === 'undefined') {
        tempLink.setAttribute('target', '_blank');
    }
    document.body.appendChild(tempLink);
    tempLink.click();
    document.body.removeChild(tempLink);
    setTimeout(() => {
        // For Firefox it is necessary to delay revoking the ObjectURL
        window.URL.revokeObjectURL(blobURL);
    }, 100);
}