/* Magic Mirror
 * Module: MMM-SORT = Static Or Rotating Tides
 *
 * By Mykle1
 * MIT License
 */
const NodeHelper = require('node_helper');
const request = require('request');



module.exports = NodeHelper.create({

    start: function() {
        console.log("Starting node_helper for: " + this.name);
    },

    getTides: function(url) {
        request({
            url: url,
            method: 'GET'
        }, (error, response, body) => {
            if (!error && response.statusCode == 200) {
                var result = JSON.parse(body);
			//	console.log(response.statusCode + result); // for checking
                this.sendSocketNotification('TIDES_RESULT', result);
            }
        });
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === 'GET_TIDES') {
            this.getTides(payload);
        }
    }
});
