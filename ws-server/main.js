const cluster = require("cluster");
const util = require("util");
const exec = require("child_process").exec;
const async = require("async");
var constants = require("./constants");

var requestCounter = 0;
var asyncTasks = [];

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

function statisticsRequests() {
    // [FIXME]: Use Interval in long computation might be delayed long time, hence,
    // move to request count solution
    /*var startTimer = new Date().getTime(),
        endTimer;
    setInterval(() => {
        endTimer = new Date().getTime();
        let timeDiff = endTimer - startTimer;
        startTimer = new Date().getTime();
        console.log("====> Number Of Requests In %d(s): %d; AsyncTasks Numbers = %d",
            timeDiff / 1000, requestCounter, asyncTasks.length);

        // Reset requestCounter
        requestCounter = 0;
    }, constants.REQ_COUNTER_STAT_TIMEOUT);*/
    if (requestCounter > 10) {
        endTimer = new Date().getTime();

        let timeDiff = endTimer - startTimer;
        console.log("====> Number Of Requests In %d(s) Is %d; AsyncTasks Numbers Is %d",
            timeDiff / 1000, requestCounter, asyncTasks.length);

        // Reset requestCounter
        requestCounter = 0;

        // Reset startTimer
        startTimer = new Date().getTime();
    }
}

function startWsServer() {
    const WebSocket = require("ws");
    var port = process.env.PORT || constants.WS_PORT;
    const wss = new WebSocket.Server({ port: port });

    wss.on("connection", function connection(ws, req) {
        ws.on("message", function incoming(message) {
            if (constants.USE_CLUSTER_MODE) {
                // Notify to the Node Master about the request
                process.send({ cmd: constants.NCC_NOTIFY_REQUEST });
            } else {
                ++requestCounter;

                statisticsRequests();
            }

            // console.log("Server received: %s", message);

            // Set the size larger to make longer computation to test performance
            let result = 0;
            if (constants.USE_ASYNC) {
                // Array to hold async tasks
                asyncTasks.push(function() {
                    longComputation(function(result) {
                        ws.send("SERVER with process.pid = " + process.pid +
                            ", cluster.worker.id = " + cluster.worker.id + " returns " + result);
                    });
                });

                async.parallel(asyncTasks, function(result) {
                    // All tasks are done now
                    // ws.send("SERVER with process.pid = " + process.pid +
                    // ", cluster.worker.id = " + cluster.worker.id + " returns " + result);
                });
            } else {
                var msg;
                longComputation(function(result) {
                    if (constants.USE_CLUSTER_MODE)
                        msg = "SERVER with process.pid = " + process.pid +
                        ", cluster.worker.id = " + cluster.worker.id + " returns " + result;
                    else
                        msg = "SERVER with process.pid = " + process.pid + " returns " + result;
                });

                ws.send(msg);
            }
        });

        ws.on("close", function close(code, reason) {
            console.log("client disconnected code = %d, reason = %d", code, reason);
        });
    });

    // Run ps -p <process-id> to the the process information
    // ps -p $PID -o pid,vsz=MEMORY -o user,group=GROUP -o comm,args=ARGS
    console.log(">>>> Websocket in PROCESS ID = %d is listenning on port: %d", process.pid, port);

    let cmd = util.format("ps -p %d -o pid,vsz=MEMORY -o user,group=GROUP -o comm,args=ARGS", process.pid);
    // console.log("$ " + cmd);
    child = exec(cmd, function(error, stdout, stderr) {
        console.log("[\n" + stdout + "]");
    });
}

function createWorker() {
    // Count requests
    function messageHandler(msg) {
        if (msg.cmd && msg.cmd === constants.NCC_NOTIFY_REQUEST) {
            ++requestCounter;
            statisticsRequests();
        }
    }

    var worker = cluster.fork();
    worker.on("listening", (address) => {
        console.log("Worker Id = %d, Address = %s, Port = %d is listening",
            worker.process.pid, address.address, address.port);
    });

    worker.on("disconnect", () => {
        console.log("Worker Id = %d is disconnected", worker.process.pid);
    });

    worker.on("message", messageHandler);
}

function createNodeCluster() {
    if (cluster.isMaster) {
        console.log(">>>> Master %d is running", process.pid);

        // Start workers and listen for messages containing notifyRequest
        const numCPUs = require("os").cpus().length;
        console.log("Number of CPU is %d", numCPUs);

        for (let i = 0; i < numCPUs; i++)
            createWorker();

        cluster.on("exit", function(worker, code) {
            if (code != 0 && !worker.suicide) {
                console.log("Worker crashed. Starting a new worker");
                createWorker();
            }
        });
    } else {
        // Start a Websocket server
        startWsServer();
    }
}

function main() {
    console.log("USE_CLUSTER_MODE = %d; USE_ASYNC = %d", constants.USE_CLUSTER_MODE, constants.USE_ASYNC);

    if (constants.USE_CLUSTER_MODE)
        createNodeCluster();
    else {
        //requestStatistics();
        /*var ats = [];
        ats.push(function() {
            requestStatistics();
        });

        async.parallel(ats, function() {});*/

        // Start a Websocket server
        startWsServer();
    }
}

main();