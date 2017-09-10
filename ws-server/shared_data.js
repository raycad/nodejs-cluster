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

    randomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    longComputation(callback) {
        // Set the size larger to make longer computation to test performance
        const factor = 10000;
        let size = this.randomNumber(factor, 2 * factor),
            result = 0;

        for (let i = 0; i < size; ++i) {
            for (let k = 0; k < size; ++k)
                ++result;
        }

        //console.log("Computing with size = %d; Result = %d", size, result);

        return callback(result);
    }
}

global.sharedData = new SharedData();