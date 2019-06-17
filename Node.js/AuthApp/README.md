# AuthApp - Sample Node.js integration app

AuthApp is a simple Node.js application that represents how a simple web application should integrate with Sesamy Authentication platform.

# Credentials to integrate with Sesamy platform:

In order to integrate with Sesamy platform, an application should register on a Sesamy authentication platform and receive an application ID and a secret. The application owner should always keep these two secret on its server side. It would be a good idea to keep an encrypted version of them and decrypt them anytime you'd like to make a call. We have stored these two in [server.json](server.json) file for this sample application. Notice that the same file contains the link to the Sesamy application server. We will use that to make our web service calls.

# Get the authentication payload and the QR code
This sample app contains multiple views. One of them, [login](views/login.ejs), is the one that renders the login form. As you can see that view has been modeified to render the Sesamy QR code. We have included all of the logic to interface with the Sesamy server API at [pass-service.js](pass-service.js). These two functions there are the only things you need to get the authentication payload and the authentication QR code from the Sesamy server:

```javascript
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

exports.barcodeURL = function(server, json) {
    return server.API + "getAuthBarcode?token=" + json.authToken + "&sid=" + json.sessionId;    
}
```

- Render the QR code on your login page
- Listen for the login authorization event on your client side
- Submit your login form to your server
- Pass the authentication payload to the authenticare API and get the user information
- Implement the user mapping logic on your server side and authenticate on behalf of the mapped user. 

# Sample code

We try to add sample applications for the supported platforms. We currently have a simple Node.js application that shows how a Node.js application should integrate with Sesamy platform. 
