
var API = {};

API.hello = function hello(options, callback) {

	callback(null, "Hello " + options.to)
	
};


module.exports = API;
