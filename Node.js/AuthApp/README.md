# AuthApp - Sample Node.js integration app

AuthApp is a simple Node.js application that represents how a simple web application should integrate with Sesamy Authentication platform.

# Credentials to integrate with Sesamy platform:

In order to integrate with Sesamy platform, an application should register on a Sesamy authentication platform and receive an application ID and a secret. The application owner should always keep these two secret on its server side. It would be a good idea to keep an encrypted version of them and decrypt them anytime you'd like to make a call. We have stored these two in [server.json](server.json) file for this sample application. Notice that the same file contains the link to the Sesamy application server. We will use that to make our web service calls.

- Call an API to get the authentication payload and the QR code for it
- Render the QR code on your login page
- Listen for the login authorization event on your client side
- Submit your login form to your server
- Pass the authentication payload to the authenticare API and get the user information
- Implement the user mapping logic on your server side and authenticate on behalf of the mapped user. 

# Sample code

We try to add sample applications for the supported platforms. We currently have a simple Node.js application that shows how a Node.js application should integrate with Sesamy platform. 
