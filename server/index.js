var os = require('os-utils');
const {Server} = require("socket.io");
const server = new Server(8000);

let clients = [];

// event fired every time a new client connects:
server.on("connection", (socket) => {
    // console.info(`Client connected [id=${socket.id}]`);
    // Add client to the list
    clients.push(socket);

    // when socket disconnects, remove it from the list:
    socket.on("disconnect", () => {
		// console.info(`Client gone [id=${socket.id}]`);

        let index = -1;
		do{
			index = clients.indexOf(socket);
			if(index >= 0) clients.splice(index, 1);
		}while(index >= 0);
    });
});

let counter = 0;
let lastDate = Date.now();

let value = 1;
let values = [];

setInterval(() => {
	counter++;
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
		cpuUsed = Math.round(cpuUsed * 10000) / 100;
		console.log(`${clients.length} Clients. ${fps} avg fps. ${memoryUsed} MB. ${cpuUsed}% cpu.`);
		counter = 0;
		lastDate = newDate;
	});
}, 1000);

setInterval(() => {
	values = [];
}, 5000);