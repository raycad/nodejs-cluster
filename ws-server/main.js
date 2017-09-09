const cluster = require('cluster');
const util = require('util');
const exec = require('child_process').exec;

const USE_CLUSTER_MODE = 1;
// Request Counter Statistics Timeout (In MilliSeconds)
const REQ_COUNTER_STAT_TIMEOUT = 5000;

var requestCounter = 0;

function startServer() {
    const WebSocket = require('ws');
    var port = process.env.PORT || 2706;
    const wss = new WebSocket.Server({ port: port });

    wss.on('connection', function connection(ws, req) {
        ws.on('message', function incoming(message) {

            if (USE_CLUSTER_MODE) {
                // Notify to the Node Master about the request
                process.send({ cmd: 'NotifyRequest' });
            } else {
                ++requestCounter;
            }

            // console.log('Server received: %s', message);
            let size = 10,
                result = 0;
            for (i = 0; i < size; ++i) {
                for (k = 0; k < size; ++k)
                    ++result;
            }

            ws.send("SERVER with PROCESS ID = " + process.pid + ", returns " + result);
        });

        ws.on('close', function close(code, reason) {
            console.log('client disconnected code = %d, reason = %d', code, reason);
        });
    });

    // Run ps -p <process-id> to the the process information
    // ps -p $PID -o pid,vsz=MEMORY -o user,group=GROUP -o comm,args=ARGS
    console.log('>>>> Websocket in PROCESS ID = %d is listenning on port: %d', process.pid, port);

    let cmd = util.format("ps -p %d -o pid,vsz=MEMORY -o user,group=GROUP -o comm,args=ARGS", process.pid);
    // console.log("$ " + cmd);
    child = exec(cmd, function(error, stdout, stderr) {
        console.log("[\n" + stdout + "]");
    });
}

function addWorker() {
    // Count requests
    function messageHandler(msg) {
        if (msg.cmd && msg.cmd === 'NotifyRequest') {
            ++requestCounter;
        }
    }

    let worker = cluster.fork();

    worker.on('listening', (address) => {
        console.log("Worker Id = %d, Address = %s, Port = %d is listening",
            worker.process.pid, address.address, address.port);
    });

    worker.on('disconnect', () => {
        console.log("Worker Id = %d is disconnected", worker.process.pid);
    });

    worker.on('message', messageHandler);
}

function startClusterMode() {
    if (cluster.isMaster) {
        console.log(">>>> Master %d is running", process.pid);

        // Start workers and listen for messages containing notifyRequest
        const numCPUs = require('os').cpus().length;
        console.log("Number of CPU is %d", numCPUs);

        var startTimer = new Date().getTime(),
            endTimer;
        setInterval(() => {
            endTimer = new Date().getTime();
            let timeElap = endTimer - startTimer;
            startTimer = new Date().getTime();
            console.log("====> Number Of Requests In %d(s): %d",
                timeElap / 1000, requestCounter);
            // Reset requestCounter
            requestCounter = 0;
        }, REQ_COUNTER_STAT_TIMEOUT);

        for (let i = 0; i < numCPUs; i++)
            addWorker();

        cluster.on('exit', function(worker, code) {
            if (code != 0 && !worker.suicide) {
                console.log('Worker crashed. Starting a new worker');
                addWorker();
            }
        });
    } else if (cluster.isWorker) {
        startServer();
    }
}

function main() {
    if (USE_CLUSTER_MODE)
        startClusterMode();
    else {
        var startTimer = new Date().getTime(),
            endTimer;
        setInterval(() => {
            endTimer = new Date().getTime();
            let timeElap = endTimer - startTimer;
            startTimer = new Date().getTime();
            console.log("====> Number Of Requests In %d(s): %d",
                timeElap / 1000, requestCounter);
            // Reset requestCounter
            requestCounter = 0;
        }, REQ_COUNTER_STAT_TIMEOUT);

        startServer();
    }
}

main();