require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"pass-client":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getSessionState = getSessionState;
exports.submitForm = submitForm;
/* 
 * pass-client.js
 */

var interval = 1000; // 1 second

function getSessionState(serverAPI, authToken, sessionId, callback) {
    setTimeout(fetchState, interval);

    function fetchState() {
        fetch(serverAPI + 'getSessionState?token=' + authToken + "&sid=" + sessionId).then(function (res) {
            return res.json();
        }).then(function (json) {
            var result = json.result;
            console.log('description: ' + json.description);
            console.log('result: ' + result);
            if (result == 'waiting') setTimeout(fetchState, interval);else callback(authToken, sessionId, result);
        }).catch(function (err) {
            console.log(err);
            callback(authToken, sessionId, err);
        });
    }
}

function submitForm(authToken, sessionId, state) {
    console.log('state: ' + state);
    if (state == "authorized") {
        document.getElementById("authtoken").value = authToken;
        document.getElementById("sessionid").value = sessionId;
        document.getElementById("authenticate").submit();
    }
}

},{}]},{},[]);
