const config = require('../config.json');
const rpiDhtSensor = require('rpi-dht-sensor');
const request = require('request');


const dht = new rpiDhtSensor.DHT11(4);

// Config validation

if (!/https:\/\/hook\.integromat\.com\/.+/.test(config.hookUrl))
	throw new Error('Invalid or empty hook url, please check it in config.json');

if (!config.interval)
	throw Error('Please define webhook interval!');


function getData() {
	let readout = dht.read();
	return {
		temperature: readout.temperature.toFixed(2),
		humidity: readout.humidity.toFixed(2)
	};
}


function sendData(done) {
	console.log('Sending');

	let opts = {
		url: config.hookUrl,
		method: 'POST',
		json: true,
		body: getData()
	};

	request(opts, (err, res, body) => {
		if (err)
			return done(err);

		if (res.statusCode >= 400)
			return done(new Error(`${res.statusCode}: ${body}`));

		done(null, body);
	});
}


function callback(err) {
	if (err) throw err;
	setTimeout(sendData, config.interval * 1000, callback);
}

sendData(callback);

