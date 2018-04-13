
if(process.env.myName) {

	/*
		Socket to listen to ... 
		HTTP requests to https://yourname.webide.se/_somename will 
		be redirected to the unix socket (named pipe) at /sock/_somename
	*/
	var unixSocket = "/sock/_jsql";

// We need the group (www-data) to have write access to the unix socket
var newMask = parseInt("0007", 8); // four digits, last three mask, ex: 0o027 => 750 file permissions
var oldMask = process.umask(newMask);
console.log("Changed umask from " + oldMask.toString(8) + " to " + newMask.toString(8));
	var hostname = process.env.myName + ".webide.se";
	var sockJsPrefix = "/_jsql/sockjs";
}
else {
	var port = 8081;
	var hostname = "127.0.0.1";
	var sockJsPrefix = "/sockjs";
	
	console.log("Use something like http-server .to serve client.htm");
}

var http = require('http');
var httpServer = http.createServer();
httpServer.on("request", httpRequest);
httpServer.on("error", httpServerError);
httpServer.on("listening", notifyListening);
httpServer.listen(unixSocket || port);

var sockjs = require('sockjs');
var sockjsServer = sockjs.createServer({
sockjs_url: 'http://cdn.jsdelivr.net/sockjs/1.0.1/sockjs.min.js'
});

var API = require("./api.js");

// API.someNamespace = require("./plugin/nother.js");

sockjsServer.on('connection', function(conn) {
	var IP = conn.headers["x-real-ip"] || conn.remoteAddress;
	console.log("New sockjs connection from " + IP);
	conn.on('data', function(message) {
		
		// Parse the request
		try {
			var req = JSON.parse(message);
		}
		catch(err) {
			return send({error: "Failed to parse JSON (" + err.message + "): " + message});
		}
		
		if(!req.command) return send({error: "No command property in: " + message});
		
		if(!API.hasOwnProperty(req.command)) return send({error: "command=" + req.command + " is not a vaild api call!"});
		
		// Call the api command
		API[req.command](req.options, function apiCallback(err, resp) {
			if(err) {
				console.error(err);
				return send({error: err.message});
			}
			else {
				return send({resp: resp});
			}
		});
		
		function send(resp) {
			
			console.log("Sending resp=" + resp + " (" + JSON.stringify(resp) + ")");
			
			if(req && req.id) resp.id = req.id;
			
			var str = JSON.stringify(resp);
			conn.write(str);
		}
		
	});
	conn.on('close', function() {});
	
	
});

//sockjsServer.installHandlers(httpServer, {prefix:'/sockjs', disable_cors: true});
sockjsServer.installHandlers(httpServer, {prefix: sockJsPrefix, disable_cors: false});
// HTTP requests to sockJsPrefix will be handled by the sockjs module !


function httpRequest(request, response) {
	// All HTTP requests that is not to sockJsPrefix will be handled here
	
	var IP = request.headers["x-real-ip"] || request.connection.remoteAddress;
	console.log("Request to " + request.url + " from " + IP);
	//console.log("Request Headers: " + JSON.stringify(request.headers, null, 2));
	
	// Handle CORS ...
	// PS. You might also need to have SSL/HTTPS
	var origin = request.headers["origin"];
	if(typeof response.getHeaders == "function") {
		console.log("Response Headers: " + JSON.stringify(response.getHeaders(), null, 2));
	}
	/*
		Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote
		resource at ‘https://johan.webide.se/foo’.
		(Reason: Credential is not supported if the CORS header ‘Access-Control-Allow-Origin’ is ‘*’).
	*/
	if(!origin) origin = "*";
	response.setHeader("Access-Control-Allow-Origin", origin)
	/*
		Failed to load https://johan.webide.se/foo: 
		The value of the 'Access-Control-Allow-Credentials' header in the response is '' 
		which must be 'true' when the request's credentials mode is 'include'. 
		Origin 'https://webide.se' is therefore not allowed access. 
		The credentials mode of requests initiated by the XMLHttpRequest is 
		controlled by the withCredentials attribute.
	*/
	response.setHeader("Access-Control-Allow-Origin", origin);
	response.setHeader("Access-Control-Allow-Credentials", "true")
	
	
	response.end('Hello from jsql! This request was NOT handled by sockjs!');
}

function httpServerError(err) {
	console.log("HTTP server error: " + err.message);
	if (err.code == 'EADDRINUSE') {
		// We'll delete the existing socket and retry listening ...
		var fs = require("fs");
		fs.unlinkSync(unixSocket);
		httpServer.listen(unixSocket);
	}
	else throw err; // Something else is wrong
}

function notifyListening() {
	if(unixSocket) console.log("Listening on https://" + hostname + "/" + unixSocket.split("/")[2]);
	else console.log("Listening on http://" + hostname + ":" + port + "");
}
