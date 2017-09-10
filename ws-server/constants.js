// https://github.com/justinklemm/nodejs-async-tutorial/blob/master/async-parallel.js
// https://nodejs.org/api/cluster.html#cluster_class_worker

module.exports = Object.freeze({
    USE_CLUSTER_MODE: 0,
    USE_ASYNC: 0,

    // Websocket constants
    WS_PORT: 2706,

    // Define Node Cluster Commands (NCC)
    NCC_NOTIFY_REQUEST: "NCC.NotifyRequest",

    // Request Counter Statistics Timeout (In MilliSeconds)
    REQ_COUNTER_STAT_TIMEOUT: 5000
});