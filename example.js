
(function() {
"use strict";

window.onload = function windowLoaded() {
		var button = document.getElementById("button");
		button.onclick = function buttonClicked() {
			
			CLIENT.api("hello", {to: "world"}, function hello(err, resp) {
				console.log(resp);
				var message = document.getElementById("message");
				if(err) return alert(err.message);
				else message.innerText = resp.text;
			});
			
		};
};


})();
