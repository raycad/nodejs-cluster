const cluster = require("cluster");
const util = require("util");
var Constants = require("./constants");
require("./shared_data");

function createWorker() {
    // Count requests
    function messageHandler(msg) {
        if (msg.cmd && msg.cmd === Constants.NCC_NOTIFY_REQUEST) {
            ++sharedData.requestCounter;
            sharedData.statisticsRequests();
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
        // Start node
        require("./node");
    }
}

function main() {
    createNodeCluster();
}

main();