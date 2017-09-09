Example for testing NodeJS performance.

**1. ws-server**
A websocket server example.

'''
$ cd ws-server
$ node main.js
'''

**2. ws-client**
A websocket client example.

Switch USE_CLUSTER_MODE and USE_ASYNC in the main.js file to enable cluster and async mode.

const USE_CLUSTER_MODE = 0;
const USE_ASYNC = 0;

'''
$ cd ws-client
$ node main.js
'''