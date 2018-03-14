// This file and the CLIENT variable in all caps to indicate it is a global object/variable
// if this was a module we where to export the CLIENT object
var CLIENT = {};

(function() {
"use strict";

	var host = document.location.hostname;
	var port = 8081; // Hardcoded, same as server.js !!
	var reWebide = /(.*)\.webide\.se/
	
	if(host.match(reWebide)) {
		var sockjsAddr = "https://" + host + "/_jsql/sockjs";
	}
	else {
		var sockjsAddr = "http://" + host + ":" + port + "/sockjs";
	}
	
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
