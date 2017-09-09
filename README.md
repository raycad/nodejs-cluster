Example for testing NodeJS performance.<br />

**1. ws-server**<br />
A websocket server example.<br />

```
$ cd ws-server
$ npm install
$ node main.js
```
---

**2. ws-client**<br />
A websocket client example.<br />

Switch USE_CLUSTER_MODE and USE_ASYNC in the main.js file to enable cluster and async mode.<br />

const USE_CLUSTER_MODE = 0;<br />

const USE_ASYNC = 0;<br />

```
$ cd ws-client
$ npm install
$ node main.js
````