var request = require('request');
var jwt = require('jsonwebtoken');

module.exports.getToken = function (clientId, privateKey, userName, cb) {
	var options = {
		issuer: clientId,
		audience: 'https://login.salesforce.com',
		expiresInMinutes: 3,
		algorithm:'RS256'
	}

	var token = jwt.sign({ prn: userName }, privateKey, options);

	var post = {
		uri: 'https://login.salesforce.com/services/oauth2/token',
		form: {
			'grant_type': 'urn:ietf:params:oauth:grant-type:jwt-bearer',
			'assertion':  token
		},
		method: 'post'
	}

	request(post, function(err, res, body) {
		if (err) {
			cb(err);
			return;
		};

		var reply = JsonTryParse(body);

		if (!reply) {
			cb(new Error('No response from oauth endpoint.'));
			return;
		};

		if (res.statusCode != 200) {
			var message = 'Unable to authenticate: ' + reply.error + ' (' + reply.error_description + ')';
			cb(new Error(message))
			return;
		};

		cb(null, reply.access_token);
	});
}

function JsonTryParse(string) {
	try {
		return JSON.parse(string);
	} catch (e) {
		return null;
	}
}