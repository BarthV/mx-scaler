// simple web server used for exposing prometheus metrics, readiness check & wrapping socket.io
const express = require('express');
const http = express();
const httpPort = process.env.LISTENPORT || 8000;

var os = require('os-utils');
// const {Server} = require("socket.io"); // commented because socket.io is now wrapped in express webserver
// const server = new Server(8000);       // same here

// start listening http server
const httpSrv = http.listen(httpPort);
const server = require('socket.io')(httpSrv); // "bind" socket.io engine to the http server
http.on('listening', function() {
	console.log(`Web server listening to port :${httpPort}`);
});

// prometheus metrics
const promClient = require('prom-client');
const register = new promClient.Registry();
const metricsPrefix = "mx_server_";
register.setDefaultLabels({app: "mx-server"})

promClient.collectDefaultMetrics({ register }); // community dashboard are not using prefixes, skip it here

const fpsCounter = new promClient.Counter({
  name: metricsPrefix + 'processed_fps_total',
  help: 'total number of FPS processed since the beginning',
});
register.registerMetric(fpsCounter);

const fpsGauge = new promClient.Gauge({
  name: metricsPrefix + 'fps_gauge',
  help: 'Current number of FPS rendered by the server',
});
register.registerMetric(fpsGauge);

const connCounter = new promClient.Counter({
  name: metricsPrefix + 'handled_conn_total',
  help: 'total number of client connections processed since the beginning',
});
register.registerMetric(connCounter);

const connGauge = new promClient.Gauge({
  name: metricsPrefix + 'active_conn_gauge',
  help: 'Number of active client connections at a given time',
});
register.registerMetric(connGauge);


let clients = [];

// event fired every time a new client connects:
server.on("connection", (socket) => {
    // console.info(`Client connected [id=${socket.id}]`);
    // Add client to the list
    clients.push(socket);
		connCounter.inc();
		connGauge.inc();

    // when socket disconnects, remove it from the list:
    socket.on("disconnect", () => {
		// console.info(`Client gone [id=${socket.id}]`);

        let index = -1;
		do{
			index = clients.indexOf(socket);
			if(index >= 0) clients.splice(index, 1);
		}while(index >= 0);
		connGauge.set(clients.length);
    });
});

let counter = 0;
let lastDate = Date.now();

let value = 1;
let values = [];

setInterval(() => {
	counter++;
	fpsCounter.inc();
    for (const client of clients) {
		for(let i = 0; i < 5000; i++){
			value = Math.random() * Math.sqrt(value);
			values.push(value);
		}

        client.emit("clock", Date.now());
		client.emit("value", value);
    }
}, 1000/100);

setInterval(() => {
	os.cpuUsage(function(cpuUsed){
		const newDate = Date.now();
		const memoryUsed = Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100;
		const fps = Math.round(counter * 1000 / (newDate - lastDate) * 100) / 100;
		fpsGauge.set(fps)
		cpuUsed = Math.round(cpuUsed * 10000) / 100;
		console.log(`${clients.length} Clients. ${fps} avg fps. ${memoryUsed} MB. ${cpuUsed}% cpu.`);
		counter = 0;
		lastDate = newDate;
	});
}, 1000);

setInterval(() => {
	values = [];
}, 5000);


// metrics route & webserver management
http.get('/metrics', async (req, res) => {
	try {
		res.set('Content-Type', register.contentType);
		res.status(200);
		res.end(await register.metrics());
	} catch (ex) {
		res.status(500).end(ex);
	}
});

// this is a readiness check going through the exact same webserver as socket.io :
// if we're able to respond to this, we'll be able to respond to real user requests
http.get('/ready', async (req, res) => {
	try {
		res.status(200).end("OK");
	} catch (ex) {
		res.status(500).end(ex);
	}
});
