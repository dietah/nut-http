const restify = require('restify');
const moment = require('moment');
const logger = require('./logger');
const { parseList, time, parseUpsVars } = require('./helpers');
const NUT = require('./node-nut');
const config = require('./env');

const consoleConfig = { ...config, NUT_USERNAME: '[REDACTED]', NUT_PASSWORD: '[REDACTED]' };
logger.info('environment variables:\n', consoleConfig);

// nut settings
const nut = new NUT(config.NUT_PORT, config.NUT_ADDRESS);

// https://networkupstools.org/docs/man/genericups.html
const statusses = Object.freeze({
	OL: 1, // online
	'OL CHRG': 2, // online & charging
	'OB DISCHRG': 3, // on battery
	LB: 4, // low battery,
	SD: 5 // shutdown load
});

// api settings
const server = restify.createServer();
server.server.setTimeout(config.SERVER_TIMEOUT);
server.use(restify.plugins.queryParser({ mapParams: false }));

let LOCK = 0;

// some handling
nut.on('connect', () => {
	logger.info(`nut connection established to ${config.NUT_ADDRESS}:${config.NUT_PORT}`);
});

nut.on('error', err => {
	logger.error('nut encountered an error:', err);
});

nut.on('close', () => {
	logger.info('nut connection closed');
});

server.on('error', (err) => {
	logger.error('server encountered an error', err);
	nut.disconnect();
	process.exit(1); // if in docker it should be restarted automatically
});

// router
server.get('/devices', (req, res) => {
	const startDateTime = moment();
	logger.logRequest('nut-http.devices.list');

	connectNut();

	nut
	.getUpsList()
	.then((list) => {
		if (req.query.parsed && req.query.parsed === 'true') list = parseList(list);

		const endDateTime = moment();
		logger.debug(`processing took ${time(startDateTime, endDateTime)}`);

		res.send(list);
		return list;
	})
	.catch((err) => {
		logger.error(err);
		res.send(500, { code: 500, message: `an internal error occurred ${err}` });
		return err;
	});
});

server.get('/devices/:name', (req, res) => {
	const startDateTime = moment();
	const ups = req.params.name;
	logger.logRequest('nut-http.devices.getUps', ups);

	setTimeout((rq, rs) => {
		connectNut();

		nut
			.getUpsVars(ups)
			.then((vars) => {
				if (rq.query.parsed && rq.query.parsed === 'true') {
					vars = parseUpsVars(vars);
					vars.ups.statusnum = statusses[vars.ups.status];
				}

				const endDateTime = moment();
				logger.debug(`processing took ${time(startDateTime, endDateTime)}`);

				rs.send(vars);
				if (LOCK > 0) LOCK--;
				return vars;
			})
			.catch((err) => {
				if (err === 'UNKNOWN-UPS') {
					logger.error('unknown ups requested');
					rs.send(404, { code: 404, message: `UPS '${ups}' is not unknown at ${config.NUT_ADDRESS}` });
					return err;
				}

				logger.error(err);
				rs.send(500, { code: 500, message: `an internal error occurred ${err}` });
				return err;
			});
	}, LOCK * config.LOCK_TIMEOUT, req, res);

	LOCK++;
});

server.listen(config.SERVER_PORT, () => {
	logger.info(`nut-http listening on port ${config.SERVER_PORT}`);
});

async function connectNut() {
	if (!nut.connected) {
		try {
			if (config.NUT_USERNAME) await nut.setUsername(config.NUT_USERNAME);
			if (config.NUT_PASSWORD) await nut.setPassword(config.NUT_PASSWORD);
			nut.connect();
		} catch (error) {
			logger.error(`connection error`);
		}
	}
}
