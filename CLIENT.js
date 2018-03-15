// This file and the CLIENT variable in all caps to indicate it is a global object/variable
// if this was a module we where to export the CLIENT object
var CLIENT = {};

(function() {
"use strict";

	var host = document.location.hostname;
	
	// Port and unix socket (named pipe) is hard coded in server.js !!
	var port = 8081;
	var unixSocket = "_jsql";
	
	// When using the unix socket:
	var sockjsAddr = "https://johan.webide.se/" + unixSocket + "/sockjs";
	// Or uncomment the line below if you use port instead
	//var sockjsAddr = "http://" + host + ":" + port + "/sockjs";
	
	// I's important to use the same host or you'll be figting CORS errors
	// You have to start the browser's dev tool to see CORS errors in console
	
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
