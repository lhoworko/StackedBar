var Timer = function() {
    this.timer = 0;
    this.total_time = 0;
    this.count = 0;

    this.startTimer = function() {
        this.timer = Date.now();
    }

    this.stopTimer = function() {
        var now = Date.now();
        var dif = now - this.timer;

        this.total_time += dif;
        this.count += 1;
        this.timer = 0;

        return dif;
    }

    this.getAvgTime = function() {
        return this.total_time / this.count;
    }
}
