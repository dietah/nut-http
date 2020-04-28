const moment = require('moment');
require('moment-duration-format');
const stereotype = require('stereotype');

module.exports = {
	parseList,
	parseUpsVars,
	getCurrentTimestamp,
	getProjectRoot,
	time
};

function parseList(list) {
	return Object.keys(list).map(val => ({ name: val, description: list[val] }), []);
}

function getCurrentTimestamp() {
	return moment().format('YYYY-MM-DD-HH-mm-ss');
}

function getProjectRoot() {
	const directory = __dirname.split('/');

	return directory.join('/');
}

function time(startDateTime, endDateTime) {
	const duration = moment.duration(endDateTime.diff(startDateTime));
	if (duration < 1000) {
		return duration.format('S [ms]');
	}

	return duration.format('h [hours] m [minutes] s [seconds]');
}

// http://jsfiddle.net/brandonscript/tfjH3/
function parseUpsVars(obj) {
	Object.keys(obj).forEach(key => {
		if (key.indexOf('.') !== -1) parseDotNotation(key, obj[key], obj);
	});
	return obj;
}

function parseDotNotation(str, val, obj) {
	const keys = str.split('.');
	let currentObj = obj;
	let key;
	let i = 0;

	for (i; i < Math.max(1, keys.length - 1); ++i) {
		key = keys[i];
		currentObj[key] = currentObj[key] || {};
		currentObj = currentObj[key];
	}

	currentObj[keys[i]] = stereotype(val.trim());
	delete obj[str];
}
