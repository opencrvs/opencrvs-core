/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:13:01 
 * @Last Modified by:   Euan Millar 
 * @Last Modified time: 2017-07-05 01:13:01 
 */
var Seneca = require ('seneca')();
var data = require ('./data.json');

Seneca()

	.add('store:notifications,cmd:get', function(msg, respond) {

		var notifications = data.filter(function(notification) { return notification.id == msg.id});
		var error =null;
		if (notifications.length === 0 ) {
			error = Error ('notifications not found');

		}
		else{
			notifications = notifications[0]
		}
		
		respond(error, {'notifications' : notifications})
	})
	.use('mesh', {
    isbase: true,
    pin: 'store:notifications,cmd:get'
  });