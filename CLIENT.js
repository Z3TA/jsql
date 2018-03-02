// This file and the CLIENT variable in all caps to indicate it is a global object/variable
// if this was a module we where to export the CLIENT object
var CLIENT = {};

(function() {
"use strict";

	var sock = new SockJS('http://johan.webide.se/_jsql/sockjs');
	
	sock.onopen = function() {
		console.log('open');
		sock.send('test');
	};
	
	sock.onmessage = function(e) {
		console.log('message', e.data);
		sock.close();
	};
	
	sock.onclose = function() {
		console.log('close');
	};
	
CLIENT.api = function api(command, options, callback) {

		var action = {
			command: command,
			options: options
		}
		
		sockjs.send(JSON.stringify(action));
	
	
});


})();
