"use strict";

/*
	
	The name of this file and the CLIENT variable are in all caps 
	to indicate it's a global object/variable
	
*/
var CLIENT = {};

// Self calling function to allow leaking variables to global scope
(function() {

	var host = document.location.hostname;
	
	// Port and unix socket (named pipe) is hard coded in server.js !!
	var port = 8081;
	var unixSocket = "_jsql";
	
	
	// When using the unix socket:
	var domain = "johan.webide.se"; // <-- change to your own domain!
	var sockjsAddr = "https://" + domain "/" + unixSocket + "/sockjs";
	// Or uncomment the line below if you use port instead
	//var sockjsAddr = "http://" + host + ":" + port + "/sockjs";
	
	// I's important to use the same host or you'll be figting CORS errors
	// Start the browser's dev tool's console to see CORS errors.
	
	console.log("sockjsAddr=" + sockjsAddr);
	var sockjs = new SockJS(sockjsAddr);
	
	sockjs.onopen = function() {
		console.log('open');
		sockjs.send('test');
	};
	
	sockjs.onmessage = function(e) {
		console.log('message', e.data);
		sockjs.close();
	};
	
	sockjs.onclose = function() {
		console.log('close');
	};
	
CLIENT.api = function api(command, options, callback) {

		var action = {
			command: command,
			options: options
		}
		
		sockjs.send(JSON.stringify(action));
	
		callback(null, {text: "tjohej"});
		
};


})();
