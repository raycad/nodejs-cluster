const cluster = require('cluster');
const util = require('util');
const exec = require('child_process').exec;

const USE_CLUSTER_MODE = 1;

function startServer() {
    const WebSocket = require('ws');
    var port = process.env.PORT || 2706;
    const wss = new WebSocket.Server({ port: port });

    wss.on('connection', function connection(ws, req) {
        ws.on('message', function incoming(message) {
            console.log('Server received: %s', message);
            let size = 1000,
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

function startClusterMode() {
    if (cluster.isMaster) {
        // Start workers and listen for messages containing notifyRequest
        const numCPUs = require('os').cpus().length;
        console.log("Number of CPU is %d", numCPUs);
        for (let i = 0; i < numCPUs; i++) {
            let worker = cluster.fork();

            worker.on('listening', (address) => {
                console.log("Worker Id = %d is listening", worker.process.pid);
            });

            worker.on('disconnect', () => {
                console.log("Worker Id = %d is disconnected", worker.process.pid);
            });
        }

        cluster.on('exit', function(worker, code) {
            if (code != 0 && !worker.suicide) {
                console.log('Worker crashed. Starting a new worker');
                cluster.fork();
            }
        });
    } else if (cluster.isWorker) {
        startServer();
    }
}

function main() {
    if (USE_CLUSTER_MODE)
        startClusterMode();
    else
        startServer();
}

main();