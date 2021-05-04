const io = require("socket.io-client");

function sleep(delay){
	return new Promise((resolve, reject) => {
		setTimeout(resolve, delay);
	});
}

async function connectAndDisconnect(){
	const socket = io.connect(process.env.SRVHTTPADDRESS);
	await sleep(10 * 60 * 1000);
	socket.disconnect();
}

(async () => {
	console.log("Starting stress testing against " + process.env.SRVHTTPADDRESS);
	for(let i = 0; i < 200; i++){
		connectAndDisconnect();
		await sleep(500);
	}
	console.log("Finished spawing 200 clients");
})();
