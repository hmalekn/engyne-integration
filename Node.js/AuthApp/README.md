# AuthApp - Sample Node.js integration app

AuthApp is a simple Node.js application that represents how a simple web application should integrate with Sesamy Authentication platform.

# Credentials to integrate with Sesamy platform:

In order to integrate with Sesamy platform, an application should register on a Sesamy authentication platform and receive an application ID and a secret. The application owner should always keep these two secret on its server side. It would be a good idea to keep an encrypted version of them and decrypt them anytime you'd like to make a call. We have stored these two in [server.json](server.json) file for this sample application. Notice that the same file contains the link to the Sesamy application server. We will use that to make our web service calls.

# Get the authentication payload and the QR code
We have included all of the logic to interface with the Sesamy server API at [pass-service.js](pass-service.js). These two functions there are the only things you need to get the authentication payload and the authentication QR code from the Sesamy server:

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

# Render the QR code on your login page
This sample app contains multiple views. One of them, [login](views/login.ejs), is the one that renders the login form. As you can see that view has been modeified to render the Sesamy QR code:

```html
  <div>
    <label>Scan with Vlobe Pass to authenticate:</label>
  </div>
  <img src="<%= barcode %>" alt="QR code not found">
```

# Listen to the login authorization events
Your application should poll the Sesamy server to see if any user has scanned the QR code. Each authentication session is associated to two different keys, an authentication token and a session ID that has not initially been assigned to any specific user. In this sample we store these two as two hidden inputs in the [login](views/login.ejs) view:

```html
  <input type="hidden" name="authtoken" id="authtoken">
  <input type="hidden" name="sessionid" id="sessionid">
```

and use this code to populate their value and check the session status:
 
```javascript
<!--
    Only the browsers WITH ECMAScript modules (aka ES6 modules)
    support will execute the following script
-->
<script type="module">
  import * as passClient from '/public/pass-client.js';
  (function() {
    const token = "<%= json.authToken %>";
    const sessionId = "<%= json.sessionId %>";
    const serverAPI = "<%= server.API %>";
    passClient.getSessionState(serverAPI, token, sessionId, passClient.submitForm);
  })();
</script>
<!--
    Only the browsers WITHOUT ES modules support
    will execute the following script.
    Browsers WITH ES modules support will ignore it.
-->
<script nomodule src="/public/bundle.js"></script>
<script nomodule>
  var passClient = require('pass-client');
  (function() {
    var token = "<%= json.authToken %>";
    var sessionId = "<%= json.sessionId %>";
    var serverAPI = "<%= server.API %>";
    passClient.getSessionState(serverAPI, token, sessionId, passClient.submitForm);
  })();
</script>
```

Implemetation of getSessionState is in [pass-client.js](public/pass-client.js):

```javascript
export function getSessionState(serverAPI, authToken, sessionId, callback) {
    setTimeout(fetchState, interval);

    function fetchState() {
        fetch(serverAPI + 'getSessionState?token=' + authToken + "&sid=" + sessionId)
            .then(res => res.json())
            .then(json => {
                const result = json.result;
                console.log('description: ' + json.description);
                console.log('result: ' + result);
                if (result == 'waiting')
                    setTimeout(fetchState, interval);
                else
                    callback(authToken, sessionId, result); 
            })
            .catch(err => { 
                console.log(err); 
                callback(authToken, sessionId, err);
            });
    }
}
```

# Submit your login form to your server

Submit your login form after user authorizes the authentication. You will find the logic in [pass-client.js](public/pass-client.js):

```javascript
export function submitForm(authToken, sessionId, state) {
    console.log('state: ' + state);
    if (state == "authorized") {
       document.getElementById("authtoken").value = authToken;
       document.getElementById("sessionid").value = sessionId;
       document.getElementById("authenticate").submit();
    }
}
```

- Pass the authentication payload to the authenticare API and get the user information
- Implement the user mapping logic on your server side and authenticate on behalf of the mapped user. 

# Sample code

We try to add sample applications for the supported platforms. We currently have a simple Node.js application that shows how a Node.js application should integrate with Sesamy platform. 
