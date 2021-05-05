const io = require("socket.io-client");

function sleep(delay){
	return new Promise((resolve, reject) => {
		setTimeout(resolve, delay);
	});
}

async function connectAndDisconnect(){
	const socket = io.connect(process.env.SRVURL, {
		upgrade: true, // default setting
		transport: ['polling', 'websocket'], // default setting
	});
	await sleep(2 * 60 * 1000); // Original sleep time was (10 * 60 * 1000) = 10min , 2min asked in document
	socket.disconnect();
}

(async () => {
	console.log("Starting stress testing against " + process.env.SRVURL);
	for(let i = 0; i < 200; i++){
		connectAndDisconnect();
		await sleep(500);
	}
	console.log("Finished spawing 200 clients");
})();
