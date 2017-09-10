class SharedData {
    constructor() {
        this.startTimer = new Date().getTime();
        this.endTimer = null;
        this.requestCounter = 0;
    }

    statisticsRequests() {
        if (this.requestCounter > 10) {
            this.endTimer = new Date().getTime();

            let timeDiff = this.endTimer - this.startTimer;
            console.log("====> Number Of Requests In %d(s) Is %d",
                timeDiff / 1000, this.requestCounter);

            // Reset requestCounter
            this.requestCounter = 0;

            // Reset startTimer
            this.startTimer = new Date().getTime();
        }
    }
}

global.sharedData = new SharedData();