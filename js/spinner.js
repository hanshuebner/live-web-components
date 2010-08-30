
var Spinner = class({

    extends: Control,

    defaults: {
        size: 100,
        minimalValue: -100,
        maximalValue: 100,
        initialValue: 0,
        initialFactor: 0.5,

        // mouse handler
        mouseStep: 0.5,             // a value of 0.5 means, that 0.5 will be added if the mouse moves by one screen pixel

        // key handler
        keyStep: 1,                 // a value of 1 means, that 1 will be added by every key stroke

        // drawer
        lineWidth: 1,
        radiusDifference: 0,
        lowArcColor: "red",
        highArcColor: "black",
        valueColor: "black",
        font: "sans-serif",
        fontSize: null,             // null means, that the font size gonna be calculated
        cursorColor: "black",
        focusColor: "blue",
        backgroundColor: "white"
    },

    initialize: function(element_or_id, options) {
        this._super_initialize(element_or_id, options);

        this._mouseHandler = new this.MouseHandler(this, options);
        this._keyHandler = new this.KeyHandler(this, options);
        this._drawer = new this.Drawer(this, options);
    },

    setOptions: function(options) {
        options = options || { };
        this._super_setOptions(options);

        if (options.size) this.setSize(options.size);
        if (options.minimalValue) this.setMinimalValue(options.minimalValue);
        if (options.maximalValue) this.setMaximalValue(options.maximalValue);
        if (options.initialValue) this.setValue(options.initialValue);
        if (options.initialFactor) this.setFactor(options.initialFactor);

        if (options.onchange) this.onchange = options.onchange;
    },

    setSize: function(value) {
        this._size = value;
        this.setHeight(this._size);
        this.setWidth(this._size);
    },

    getSize: function() {
        return this._size;
    },

    setMinimalValue: function(value) {
        this._minimalValue = value;
        this.draw();
    },

    getMinimalValue: function() {
        return this._minimalValue;
    },

    setMaximalValue: function(value) {
        this._maximalValue = value;
        this.draw();
    },

    getMaximalValue: function() {
        return this._maximalValue;
    },

    setFactor: function(value) {
        if (value < 0.0 || value > 1.0) return;

        var changed = this._factor != value;

        this._factor = value;
        this._value = this.getMinimalValue() + Math.round(this.getFactor() * (this.getMaximalValue() - this.getMinimalValue()));
        this.draw();

        if (changed && !this.isEntering()) this._triggerOnChange();
    },

    getFactor: function(value) {
        return this._factor || 0.0;
    },

    setValue: function(value) {
        if (value < this.getMinimalValue() || value > this.getMaximalValue()) return;

        var changed = this._value != value;

        this._value = value;
        this._factor = (this._value - this.getMinimalValue()) / (this.getMaximalValue() - this.getMinimalValue());
        this.draw();

        if (changed && !this.isEntering()) this._triggerOnChange();
    },

    getValue: function() {
        return this._value || 0;
    },

    blur: function() {
        this.stopEntering();
        this._super_blur();
    },

    startEntering: function() {
        this._entering = true;
    },

    stopEntering: function() {
        if (this.isEntering()) {
            this._entering = false;
            this.draw();
            this._triggerOnChange();
        }
    },

    isEntering: function() {
        return this._entering;
    },

    draw: function() {
        this._super_draw();
        if (this._drawer) this._drawer.draw();
    },

    _triggerOnChange: function() {
        if (this.onchange) this.onchange(this.getValue(), this.getFactor());
    },

    MouseHandler: class({

        extends: Optionable,

        OPTION_KEYS: [
            "mouseStep"
        ],

        initialize: function(spinner, options) {
            this._spinner = spinner;
            this._spinner.getButtonElement().onmousedown = this._onMouseDownHandler.bind(this);

            this._super_initialize(this._spinner.defaults, options);
        },

        _getScreenHeight: function() {
            return screen.availHeight;
        },

        _onMouseDownHandler: function(event) {
            this._spinner.getButtonElement().focus();

            this._startY = event.screenY;
            this._startFactor = this._spinner.getFactor();

            document.onmousemove = this._onMouseMoveHandler.bind(this);
            document.onmouseup = this._onMouseUpHandler.bind(this);

            return false;
        },

        _onMouseMoveHandler: function(event) {
            var range = Math.abs(this._spinner.getMaximalValue() - this._spinner.getMinimalValue()) / this._mouseStep;
            var difference = event.screenY - this._startY;
            var sign = difference < 0 ? -1 : 1;
            var normalizedDifference = Math.min(Math.abs(difference), range) * sign;
            var factorDifference = difference / range;
            var factor = Math.max(0.0, Math.min(1.0, this._startFactor + factorDifference))

            this._spinner.setFactor(factor);

            return false;
        },

        _onMouseUpHandler: function() {
            document.onmousemove = null;
            document.onmouseup = null;

            return false;
        }

    }),

    KeyHandler: class({

        extends: Optionable,

        OPTION_KEYS: [
            "keyStep"
        ],

        initialize: function(spinner, options) {
            this._spinner = spinner;
            this._spinner.getButtonElement().onkeydown = this._onKeyDownHandler.bind(this);

            this._super_initialize(this._spinner.defaults, options);
        },

        _onKeyDownHandler: function(event) {
            switch (event.keyCode) {
            case 8: // backspace
                this._deleteDigit();
                return false;
            case 13: // enter
                this._enter();
                return false;
            case 38: // up arrow
                this._setValue(this._spinner.getValue() + (this._keyStep || 1));
                return false;
            case 40: // down arrow
                this._setValue(this._spinner.getValue() - (this._keyStep || 1));
                return false;
            case 48:
            case 49:
            case 50:
            case 51:
            case 52:
            case 53:
            case 54:
            case 55:
            case 56:
            case 57: // digits 0-9
                this._enterDigit(event.keyCode - 48);
                return false;
            case 109: // substract
            case 189: // "-"
                this._toggleSign();
                return false;
            default:
                return true;
            }
        },

        _setValue: function(value) {
            var newValue = Math.min(this._spinner.getMaximalValue(), Math.max(this._spinner.getMinimalValue(), value));
            this._spinner.setValue(newValue);
        },

        _enterDigit: function(digit) {
            var value = this._spinner.isEntering() ? this._spinner.getValue() : 0;
            value *= 10;
            value += digit;
            this._spinner.startEntering();
            this._spinner.setValue(value);
        },

        _deleteDigit: function() {
            if (!this._control.isEntering()) return;
            this._spinner.setValue(Math.floor(this._spinner.getValue() / 10));
        },

        _enter: function() {
            this._spinner.stopEntering();
        },

        _toggleSign: function() {
            this._spinner.setValue(this._spinner.getValue() * -1);
        }

    }),

    Drawer: class({

        extends: Optionable,

        OPTION_KEYS: [
            "lineWidth",
            "radiusDifference",
            "lowArcColor",
            "highArcColor",
            "valueColor",
            "font",
            "fontSize",
            "cursorColor"
        ],

        initialize: function(spinner, options) {
            this._spinner = spinner;
            this._context = this._spinner.getCanvasElement().getContext("2d");

            this._super_initialize(this._spinner.defaults, options);

            this.calculateFontSize();
            this.draw();
        },

        calculateFontSize: function() {
            if (!this._context) return;

            if (this._fontSize) {
                this._context.font = this._fontSize + "px " + this._font;
            } else {
                var fontSize = 0;
                var textWidth = 0;
                while (textWidth < (this._spinner.getSize() / 2 - this._context.lineWidth * 2)) {
                    fontSize++;
                    this._context.font = fontSize + "px " + this._font;
                    textWidth = this._context.measureText("-100").width;
                }
                this._context.font = (fontSize - 1) + "px " + this._font;
            }
            this._context.textBaseline = "middle";
        },

        draw: function() {
            if (!this._context) return;
            this._drawArcs();
            this._drawValue();
            this._drawCursor();
        },

        _drawArcs: function() {
            var size = this._spinner.getSize();
            var angle = (Math.PI / 2) + (3 * (Math.PI / 2) * this._spinner.getFactor());

            this._context.lineWidth = (this._lineWidth || 1);
            this._context.lineCap = "round";

            this._context.strokeStyle = this._lowArcColor;
            this._context.beginPath();
            this._context.arc(
                    size / 2,
                    size / 2,
                    size / 2 - this._context.lineWidth - (this._radiusDifference || 0),
                    (Math.PI / 2),
                    angle,
                    false
            );
            this._context.stroke();

            this._context.strokeStyle = this._highArcColor;
            this._context.beginPath();
            this._context.lineTo(size / 2, size / 2);
            this._context.arc(
                    size / 2,
                    size / 2,
                    size / 2 - this._context.lineWidth,
                    angle,
                    2 * Math.PI,
                    false
            );
            this._context.stroke();
        },

        _drawValue: function() {
            var size = this._spinner.getSize();

            this._context.fillStyle = this._valueColor;
            this._context.fillText(this._spinner.getValue(), size / 2 + this._context.lineWidth, 3 * size / 4);
        },

        _drawCursor: function() {
            if (!this._spinner.isEntering()) return;

            var size = this._spinner.getSize();

            var cursorX = size / 2 +
                          this._context.lineWidth * 2 +
                          this._context.measureText(this._spinner.getValue()).width;

            this._context.strokeStyle = this._cursorColor;
            this._context.beginPath();
            this._context.moveTo(cursorX, Math.round(size * 0.60));
            this._context.lineTo(cursorX, Math.round(size * 0.85));
            this._context.stroke();
        }

    })

});
