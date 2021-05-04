const io = require("socket.io-client");

function sleep(delay){
	return new Promise((resolve, reject) => {
		setTimeout(resolve, delay);
	});
}

async function connectAndDisconnect(){
	const socket = io.connect("http://localhost:8000");
	await sleep(10 * 60 * 1000);
	socket.disconnect();
}

(async () => {
	console.log('Starting stress testing');
	for(let i = 0; i < 200; i++){
		connectAndDisconnect();
		await sleep(500);
	}
	console.log('Finished spawing 200 clients');
})();
