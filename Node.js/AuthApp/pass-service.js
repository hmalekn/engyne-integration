/* 
 * pass-service.js
 */

"use strict";

const fetch = require('node-fetch');

const crypto = require("crypto");

exports.promiseAuthInfo = function(server) {
    const requestId = crypto.randomBytes(16).toString("hex");
    const request = { requestId, appId: server.APP_ID, secret: server.APP_SECRET };

    return fetch(server.API + 'getAuthInfo', { 
            method: 'POST',
            body: JSON.stringify(request),
	        headers: { 'Content-Type': 'application/json' } })
        .then(res => res.json())
        .then(json => { 
            const authToken = json.authToken;
            if (!authToken)
                console.log(json);

            const sessionId = json.sessionId;
            if (!sessionId)
                console.log(json);

            return  json;
        })
        .catch(err => { console.log(err); return err });
}

exports.promiseAuthenticate = function(server, authToken, sessionId) {
    const requestId = crypto.randomBytes(16).toString("hex");
    const request = { sessionId, authToken, requestId, appId: server.APP_ID, secret: server.APP_SECRET };

    return fetch(server.API + 'authenticate', { 
            method: 'POST',
            body: JSON.stringify(request),
	        headers: { 'Content-Type': 'application/json' } })
        .then(res => res.json())
        .then(json => { 
          //  if (!json.userId)
                console.log(json);
            
            return json;
        });
}

exports.barcodeURL = function(server, json) {
    return server.API + "getAuthBarcode?token=" + json.authToken + "&sid=" + json.sessionId;    
}

if (require.main === module) {
     // this module was run directly from the command line
     exports.promiseAuthInfo().then(json => console.log(json));
}