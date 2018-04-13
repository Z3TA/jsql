"use strict";

/*
	
	The name of this file and the CLIENT variable are in all caps 
	to indicate it's a global object/variable
	
*/
var CLIENT = {}; // Global object so you can call CLIENT.api() from anywhere

(function() { // Self calling function to avoid leaking variables to global scope

	console.log(new Date().getTime());
	console.log("time from script!");
	
	/*
		Note: It's a good idea to have the client on the same host as the server.
		Or you'll be figting CORS errors. (Start the browser's dev tool's console to see CORS errors)
	*/
	
	var host = document.location.hostname;
	
	if(host == "localhost") {
		var port = 8081; // Port is hardcoded in server.js
		var sockjsAddr = "http://" + host + ":" + port + "/sockjs";
	}
	else {
		// Unix sockets/pipes are more convenient then ports if you are on a shared server
		var unixSocket = "_jsql"; // Unix socket is hard coded in server.js
	var domain = "johan.webide.se"; // <-- change to your own domain!
	var sockjsAddr = "https://" + domain + "/" + unixSocket + "/sockjs";
	}
	
	
	var callbackWaitList = []; // API request callbacks waiting to be called
	var idCounter = 0; // Request id's
	
		console.log("sockjsAddr=" + sockjsAddr);
	/*
		We use SockJS here for some backwards compability, 
		It should be safe to use Websockets, but some proxies *couch* Google *cought* don't support it.
		SockJS provides fallback to all kinds of "hacks" and if all fails it will use polling.
	*/
	
		var sockjs = new SockJS(sockjsAddr);
		
	CLIENT.connected = false; // Public property to check if connected or not
	
	// Method for sending "api" commands/requests
	CLIENT.api = function api(command, options, callback) {
		// Check the function arguments. "options" object is optional.
		if(typeof options == "function" && callback == undefined) {
			callback = options;
			options = null;
		}
		else if(typeof options != "object") {
			throw new Error("Second argument 'options' (if specified) must be an object!");
		}
		
		// Make the request object
		var request = {
			command: command,
			options: options,
			id: ++idCounter // Increment ++before assigning the id
		}
		
		// Make sure the connection is open
		var connectionOpen = 1; // constant magic number (give it a name)
		if(sockjs.readyState != connectionOpen) {
			console.log("sockjs.readyState=" + sockjs.readyState);
			var error = new Error("SockJS connection not open!");
			if(callback) return callback(error);
			else return alert(error.message);
		}
		
		// Add the callback to the wait list
		if(callback) callbackWaitList[request.id] = callback;
		else console.warn("No callback defined in command=" + command);
		
		// Send the request object
		sockjs.send(JSON.stringify(request));
		
		//callback(null, {text: "tjohej"});
		
	};
	
	// Handle messages recived
	sockjs.onmessage = function message(e) {
			var msg = e.data;
			console.log('message', msg);
			
		// Parse the message as JSON
			try {
				var json = JSON.parse(msg)
			}
			catch(err) {
				throw new Error("Unable to parse server message: " + msg);
				return;
			}
			
		// Call the callback that is waiting for the answer
		
		if(json.id == undefined) alert("Message (without an id): " + msg);
		
			if(json.id) {
				if(callbackWaitList.hasOwnProperty(json.id)) {
					var err = null;
					
				if(json.error) {
					err = new Error("API: " + json.error);
					if(json.errorCode) err.code = json.errorCode;
					}
					
				callbackWaitList[json.id](err, json.resp);
					delete callbackWaitList[json.id];
				}
				else throw new Error("Can not find id=" + json.id + " in callbackWaitList=" + JSON.stringify(callbackWaitList) + "\n" + JSON.stringify(json, null, 2));
				// If the above happends, check to make sure the callback in the server command is only called once!
				
			}
			};
		
	sockjs.onclose = function close() {
		CLIENT.connected = false;
		console.log('sockjs connection closed');
		};
		
	sockjs.onopen = function open() {
		CLIENT.connected = true;
		console.log('open connection established');
		};
		
	})();
