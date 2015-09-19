function TapeFence(ceiling, cb) {
    this.fenceCount = 0;

    if (ceiling) {
        this.ceiling = ceiling;
    }

    if (cb) {
        this.done = cb;
    }
}

TapeFence.prototype.set = function(ceiling, cb) {
    this.fenceCount = 0;

    if (ceiling) {
        this.ceiling = ceiling;
    }

    if (cb) {
        this.done = cb;
    }
};

TapeFence.prototype.hit = function() {
    this.fenceCount++;

    if (this.fenceCount === this.ceiling && this.done) {
        this.done.apply(this, arguments);
    }
};


module.exports = TapeFence;
