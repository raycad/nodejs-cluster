Example for testing NodeJS performance.<br />

**1. ws-server**<br />
A websocket server example.<br />
Switch **USE_CLUSTER_MODE** and **USE_ASYNC** in the **constants.js** file to enable cluster and async mode.<br />

USE_CLUSTER_MODE: 0<br />
USE_ASYNC: 0<br />

```
$ cd ws-server
$ npm install
$ node main.js
```

**2. ws-client**<br />
A websocket client example.<br />

```
$ cd ws-client
$ npm install
$ node main.js
````