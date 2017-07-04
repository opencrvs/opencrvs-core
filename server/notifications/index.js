var seneca = require ("seneca")();

seneca.add("list:notifications,cmd:check", function (msg, respond) {

	seneca.act({"store":"notifications","cmd":"get", "id":msg.id}, function (err, response) {

		if (err) return console.log (err)

			// Do check
			// ........
			response.notification.checked=true;
			respond(null,response)
		})

}).use('mesh',{pin:"list:notifications,cmd:check"}).listen({port : 5000,pin:"list:notifications,cmd:check"});
