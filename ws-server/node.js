const Constants = require("./constants");
const util = require("util");
const exec = require("child_process").exec;
const WebSocket = require("ws");

require("./shared_data");

var port = process.env.PORT || Constants.WS_PORT;
const wss = new WebSocket.Server({ port: port });

var startTimer = new Date().getTime();
var endTimer;

function randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function longComputation(callback) {
    // Set the size larger to make longer computation to test performance
    const factor = 10000;
    let size = randomNumber(factor, 2 * factor),
        result = 0;

    for (i = 0; i < size; ++i) {
        for (k = 0; k < size; ++k)
            ++result;
    }

    //console.log("Computing with size = %d; Result = %d", size, result);

    return callback(result);
}

function createWsServer() {
    wss.on("connection", function connection(ws, req) {
        ws.on("message", function incoming(message) {
            try {
                // Try with Cluster mode
                // Notify to the Node Master about the request
                process.send({ cmd: Constants.NCC_NOTIFY_REQUEST });
            } catch (error) {
                // Exception means the app was launching with standalone node
                // Try with standalone mode
                ++sharedData.requestCounter;
                sharedData.statisticsRequests();
            }

            // Set the size larger to make longer computation to test performance
            let result = 0;
            var msg;
            longComputation(function(result) {
                msg = "SERVER with process.pid = " + process.pid + " returns " + result;
            });

            ws.send(msg);
        });

        ws.on("close", function close(code, reason) {
            console.log("client disconnected code = %d, reason = %d", code, reason);
        });
    });
}

function main() {
    createWsServer();

    // Run ps -p <process-id> to the the process information
    // ps -p $PID -o pid,vsz=MEMORY -o user,group=GROUP -o comm,args=ARGS
    console.log(">>>> Websocket in PROCESS ID = %d is listenning on port: %d", process.pid, port);

    let cmd = util.format("ps -p %d -o pid,vsz=MEMORY -o user,group=GROUP -o comm,args=ARGS", process.pid);
    // console.log("$ " + cmd);
    child = exec(cmd, function(error, stdout, stderr) {
        console.log("[\n" + stdout + "]");
    });

    console.log(">>>> Websocket is listenning on port: %d", port);
}

main();