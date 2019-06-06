/* 
 * pass-client.js
 */

const interval = 1000;  // 1 second

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

export function submitForm(authToken, sessionId, state) {
    console.log('state: ' + state);
    if (state == "authorized") {
       document.getElementById("authtoken").value = authToken;
       document.getElementById("sessionid").value = sessionId;
       document.getElementById("authenticate").submit();
    }
}