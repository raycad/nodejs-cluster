const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:2706');

ws.on('open', function open() {
    console.log('connected');
    ws.send("Hi");
});

ws.on('close', function close(code, reason) {
    console.log('disconnected code = %d, reason = %d', code, reason);
});

ws.on('message', function incoming(data) {
    console.log(data);
});

setInterval(() => {
    console.log('>>>> Sending Interval...');
    let msgBatch = 10;
    for (let i = 0; i < msgBatch; ++i)
        ws.send("I'm CLIENT");
}, 5000);