
var Spinner = function(id, options) {
    this.initialize(id, options);
};

Spinner.prototype = {

    initialize: function(id, options) {
        this.setCanvas(document.getElementById(id));

        this._mouseHandler = new SpinnerMouseHandler(this);
        this._keyHandler = new SpinnerKeyHandler(this);
        this._focusHandler = new SpinnerFocusHandler(this);
        this._drawer = new SpinnerDrawer(this, options);

        this.setOptions(options);

        this.setFactor(0.5);
    },

    setCanvas: function(value) {
        if (value && value.getContext) {
            this.canvas = value;
        } else {
            throw("Given id doesn't belong to a canvas object!");
        }
    },

    getCanvas: function() {
        return this.canvas;
    },

    setOptions: function(value) {
        value = value || { };
        this.setSize(value.size || this.getSize());
    },

    setSize: function(value) {
        this.size = value;
        this.canvas.height = this.canvas.width = this.size;
        this._drawer.calculateFontSize();
        this._drawer.calculateLineWidth();
        this._drawer.draw();
    },

    getSize: function() {
        return this.size || 200;
    },

    focus: function() {
        this.focused = true;
        this._drawer.draw();
    },

    blur: function() {
        this.focused = false;
        this._drawer.draw();
    },

    hasFocus: function() {
        return this.focused || false;
    },

    setFactor: function(value) {
        this.factor = Math.max(0.0, Math.min(1.0, value));
        this.value = this.getMinimalValue() + Math.round(this.factor * (this.getMaximalValue() - this.getMinimalValue()));
        this._drawer.draw();
    },

    getFactor: function(value) {
        return this.factor || 0.0;
    },

    setMinimalValue: function(value) {
        this.minimalValue = value;
    },

    getMinimalValue: function() {
        return this.minimalValue || -100;
    },

    setMaximalValue: function(value) {
        this.maximalValue = value;
    },

    getMaximalValue: function() {
        return this.maximalValue || 100;
    },

    setValue: function(value) {
        this.value = Math.max(this.getMinimalValue(), Math.min(this.getMaximalValue(), value));
        this.factor = (this.value - this.getMinimalValue()) / (this.getMaximalValue() - this.getMinimalValue());
        this._drawer.draw();
    },

    getValue: function() {
        return this.value || 0;
    }

};

var SpinnerMouseHandler = function(spinner) {
    this.initialize(spinner);
};

SpinnerMouseHandler.prototype = {

    initialize: function(spinner) {
        this.spinner = spinner;

        var scope = this;
        this.spinner.getCanvas().onmousedown = function(event) { scope._onMouseDownHandler.call(scope, event); }
    },

    _onMouseDownHandler: function(event) {
        this.startY = event.screenY;
        this.startFactor = this.spinner.getFactor();

        var scope = this;
        document.onmousemove = function(event) { scope._onMouseMoveHandler.call(scope, event); }
        document.onmouseup = function(event) { scope._onMouseUpHandler.call(scope, event); }
    },

    _onMouseMoveHandler: function(event) {
        var difference = event.screenY - this.startY;
        var sign = difference < 0 ? -1 : 1;
        var normalizedDifference = Math.min(Math.abs(difference), 500) * sign;
        var factorDifference = difference / 500.0;

        this.spinner.setFactor(this.startFactor + factorDifference);
    },

    _onMouseUpHandler: function(spinner, event) {
        document.onmousemove = null;
        document.onmouseup = null;
    }

};

var SpinnerKeyHandler = function(spinner) {
    this.initialize(spinner);
};

SpinnerKeyHandler.prototype = {

    initialize: function(spinner) {
        this.spinner = spinner;

        var scope = this;
        this.spinner.onkeydown = function(event) { scope._onKeyDownHandler.call(scope, event); }
    },

    _onKeyDownHandler: function(event) {
        switch (event.keyCode) {
        case 38: // up arrow
            this.spinner.setValue(this.spinner.getValue() + 1);
            break;
        case 40: // down arrow
            this.spinner.setValue(this.spinner.getValue() - 1);
            break;
        }
    }

};

var SpinnerFocusHandler = function(spinner) {
    this.initialize(spinner);
}

SpinnerFocusHandler.prototype = {

    initialize: function(spinner) {
        this.spinner = spinner;

        var scope = this;
        this.spinner.getCanvas().onfocus = function(event) { scope._onFocusHandler.call(scope, event); }
        this.spinner.getCanvas().onblur = function(event) { scope._onBlurHandler.call(scope, event); }
    },

    _onFocusHandler: function(event) {
        this.spinner.focus();
    },

    _onBlurHandler: function(event) {
        this.spinner.blur();
    }

};

var SpinnerDrawer = function(spinner, options) {
    this.initialize(spinner, options);
};

SpinnerDrawer.prototype = {

    initialize: function(spinner, options) {
        this.spinner = spinner;
        this.context = this.spinner.getCanvas().getContext("2d");

        this.setOptions(options);
    },

    setOptions: function(value) {
        value = value || { };
        this.padding = value.padding || Math.round(this.spinner.getSize() / 20);
    },

    calculateFontSize: function() {
        if (!this.context) return;

        var fontSize = 0;
        var textWidth = 0;
        while (textWidth < (this.spinner.getSize() / 2 - this.padding * 2)) {
            fontSize++;
            this.context.font = fontSize + "px sans-serif";
            textWidth = this.context.measureText("-100").width;
        }
        this.context.font = (fontSize - 1) + "px sans-serif";
        this.context.textBaseline = "middle";
    },

    calculateLineWidth: function() {
        this.context.lineWidth = Math.round(this.spinner.getSize() / 50);
        this.context.lineCap = "round";
    },

    draw: function() {
        if (!this.context) return;

        var size = this.spinner.getSize();

        this.context.fillStyle = "white";
        this.context.fillRect(0, 0, size, size);

        var angle = (Math.PI / 2) + (3 * (Math.PI / 2) * this.spinner.getFactor());

        this.context.beginPath();
        this.context.arc(
                size / 2,
                size / 2,
                size / 2 - this.padding,
                (Math.PI / 2),
                angle,
                false
        );
        this.context.lineTo(size / 2, size / 2);
        this.context.arc(
                size / 2,
                size / 2,
                size / 2 - this.padding,
                angle,
                2 * Math.PI,
                false
        );
        this.context.stroke();

        this.context.fillStyle = "black";
        this.context.fillText(this.spinner.getValue(), size / 2 + this.padding, 3 * size / 4);

        if(this.spinner.hasFocus()) {
            var length = size / 8;
            this.context.beginPath();
            this.context.moveTo(0, 0);
            this.context.lineTo(length, 0);
            this.context.moveTo(size - length, 0);
            this.context.lineTo(size, 0);
            this.context.lineTo(size, length);
            this.context.moveTo(size, size - length);
            this.context.lineTo(size, size);
            this.context.lineTo(size - length, size);
            this.context.moveTo(length, size);
            this.context.lineTo(0, size);
            this.context.lineTo(0, size - length);
            this.context.moveTo(0, length);
            this.context.lineTo(0, 0);
            this.context.stroke();
        }
    }

};
