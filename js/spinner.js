
var Spinner = class({

    extends: Control,

    defaults: {
        size: 100,
        minimalValue: -100,
        maximalValue: 100,
        initialValue: 0,
        initialFactor: 0.5,

        externalMapping: {
            fromFactor: function(factor) { return factor * 200.0 - 100.0; },
            toFactor: function(value) { return (value + 100.0) / 200.0; }
        },
        internalMapping: {
            fromFactor: function(factor) { return Math.round(factor * 255); },
            toFactor: function(value) { return value / 255.0; }
        },

        // mouse handler
        mouseScale: 1,              // a value of 1 means, that the spinner has turned completly around
                                    // if the mouse has been moved 1 time the distance of "size".

        // key handler
        keyScale: 1,                // a value of 1 means, that the spinenr has turned completly around
                                    // if the up/down-key has been hit size-times.

        // drawer
        lineWidth: 3,
        radiusDifference: 0,
        lowArcColor: "red",
        highArcColor: "black",
        font: "sans-serif",
        fontColor: "black",
        fontSize: null,             // null means, that the font size gonna be calculated
        cursorColor: "black",
        focusColor: "blue"
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

        if (options.title) this.setTitle(options.title);
        if (options.size) this.setSize(options.size);
        if (options.minimalValue) this.setMinimalValue(options.minimalValue);
        if (options.maximalValue) this.setMaximalValue(options.maximalValue);
        if (options.initialValue) this.setValue(options.initialValue);
        if (options.initialFactor) this.setFactor(options.initialFactor);
        if (options.externalMapping) this.setExternalMapping(options.externalMapping);
        if (options.internalMapping) this.setInternalMapping(options.internalMapping);

        if (options.onchange) this.onchange = options.onchange;
    },

    setTitle: function(value) {
        this._title = value;
        this.draw();
    },

    getTitle: function() {
        return this._title;
    },

    setSize: function(value) {
        this._size = value;
        this.setHeight(this._size + (this._drawer ? this._drawer.getTitleHeight() : 0));
        this.setWidth(this._size);
    },

    getSize: function() {
        return this._size;
    },

    setExternalMapping: function(mapping) {
        this._checkMappingFormat(mapping);
        this._externalMapping = mapping;
    },

    getExternalMapping: function() {
        return this._externalMapping;
    },

    setInternalMapping: function(mapping) {
        this._checkMappingFormat(mapping);
        this._internalMapping = mapping;
    },

    getInternalMapping: function() {
        return this._internalMapping;
    },

    setExternalValue: function(value) {
        this.setFactor(this._externalMapping.toFactor(value));
    },

    getExternalValue: function() {
        return this._externalMapping.fromFactor(this.getFactor());
    },

    setInternalValue: function(value) {
        this.setFactor(this._internalMapping.toFactor(value));
    },

    getInternalValue: function() {
        return this._internalMapping.fromFactor(this.getFactor());
    },

    setMinimalValue: function(value) {
        this._minimalValue = value;
        this._calculateFactorBasedOnValue();
        this.draw();
    },

    getMinimalValue: function() {
        return this._minimalValue;
    },

    setMaximalValue: function(value) {
        this._maximalValue = value;
        this._calculateFactorBasedOnValue();
        this.draw();
    },

    getMaximalValue: function() {
        return this._maximalValue;
    },

    setFactor: function(value) {
        value = Math.max(0.0, Math.min(1.0, value));

        var changed = this._factor != value;

        this._factor = value;
        this._calculateValueBasedOnFactor();
        this.draw();

        this.abortEntering();
        if (changed) this._triggerOnChange();
    },

    getFactor: function(value) {
        return this._factor || 0.0;
    },

    setValue: function(value) {
        if (value < this.getMinimalValue() || value > this.getMaximalValue()) return;

        var changed = this._value != value;
        this._value = value;
        this._calculateFactorBasedOnValue();
        this.draw();

        this.abortEntering();
        if (changed) this._triggerOnChange();
    },

    getValue: function() {
        return this._value || 0;
    },

    blur: function() {
        this.abortEntering();
        this._super_blur();
    },

    getEnteredText: function() {
        return this._keyHandler.getEnteredText();
    },

    abortEntering: function() {
        if (this.isEntering()) this._keyHandler.abortEntering();
    },

    isEntering: function() {
        return this._keyHandler && this._keyHandler.isEntering();
    },

    draw: function() {
        this._super_draw();
        if (this._drawer) this._drawer.draw();
    },

    _checkMappingFormat: function(mapping) {
        if (!(mapping && typeof(mapping.fromFactor) === "function" && typeof(mapping.toFactor) === "function")) {
            throw("The given mapping has an incorrect format");
        }
    },

    _calculateFactorBasedOnValue: function() {
        this._factor = (this._value - this.getMinimalValue()) / (this.getMaximalValue() - this.getMinimalValue());
    },

    _calculateValueBasedOnFactor: function() {
        this._value = this.getMinimalValue() + Math.round(this.getFactor() * (this.getMaximalValue() - this.getMinimalValue()));
    },

    _triggerOnChange: function() {
        if (this.onchange) this.onchange(this.getValue(), this.getFactor());
    },

    MouseHandler: class({

        extends: Optionable,

        OPTION_KEYS: [
            "mouseScale"
        ],

        initialize: function(spinner, options) {
            this._spinner = spinner;
            this._spinner.getButtonElement().onmousedown = this._onMouseDownHandler.bind(this);

            this._super_initialize(this._spinner.defaults, options);
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
            var range = this._spinner.getSize() * this._mouseScale;
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
            "keyScale"
        ],

        initialize: function(spinner, options) {
            this._spinner = spinner;
            this._spinner.getButtonElement().onkeydown = this._onKeyDownHandler.bind(this);

            this._super_initialize(this._spinner.defaults, options);

            this._entering = false;
            this._enteredText = null;
        },

        getEnteredText: function() {
            return this._enteredText;
        },

        abortEntering: function() {
            this._entering = false;
            this._enteredText = null;
            this._spinner.draw();
        },

        isEntering: function() {
            return !!this._entering;
        },

        _onKeyDownHandler: function(event) {
            switch (event.keyCode) {
            case 8: // backspace
                this._deleteCharacter();
                return false;
            case 13: // enter
                this._enter();
                return false;
            case 37: // left arrow
            case 38: // up arrow
                this._stepUp();
                return false;
            case 39: // right arrow
            case 40: // down arrow
                this._stepDown();
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
                this._enterCharacter(event.keyCode - 48);
                return false;
            case 109: // substract
            case 189: // "-"
                this._enterCharacter("-");
                return false;
            case 190: // "."
                this._enterCharacter(".");
                return false;
            default:
                return true;
            }
        },

        _stepUp: function() {
            this._spinner.setFactor(this._spinner.getFactor() + this._getKeyStep());
        },

        _stepDown: function() {
            this._spinner.setFactor(this._spinner.getFactor() - this._getKeyStep());
        },

        _getKeyStep: function() {
            return this._keyScale / this._spinner.getSize();
        },

        _enterCharacter: function(character) {
            if (!this.isEntering()) this._enteredText = "";
            this._entering = true;
            this._enteredText += character;

            this._spinner.draw();
        },

        _deleteCharacter: function() {
            if (!this.isEntering()) return;
            this._enteredText = this._enteredText.substring(0, Math.max(0, this._enteredText.length - 1));
            this._spinner.draw();
        },

        _enter: function() {
            this._spinner.setExternalValue(parseFloat(this._enteredText));
            this._entering = false;
            this._enteredText = null;
        }

    }),

    Drawer: class({

        extends: Optionable,

        OPTION_KEYS: [
            "lineWidth",
            "radiusDifference",
            "lowArcColor",
            "highArcColor",
            "font",
            "fontColor",
            "fontSize",
            "cursorColor"
        ],

        initialize: function(spinner, options) {
            this._spinner = spinner;
            this._context = this._spinner.getCanvasElement().getContext("2d");

            this._super_initialize(this._spinner.defaults, options);

            this._calculateFontSize();
            this._adjustSpinnerHeight();
            this.draw();
        },

        getTitleHeight: function() {
            return this._spinner.getTitle() ? this._fontSize + this._lineWidth : 0;
        },

        draw: function() {
            if (!this._context) return;
            this._drawTitle();
            this._drawArcs();
            this._drawValue();
            this._drawCursor();
        },

        _calculateFontSize: function() {
            if (!this._context) return;

            if (this._fontSize) {
                this._context.font = this._fontSize + "px " + this._font;
            } else {
                var fontSize = 0;
                var textWidth = 0;
                while (textWidth < (this._spinner.getSize() / 2 - this._lineWidth * 2)) {
                    fontSize++;
                    textWidth = this._measureFontSize(fontSize);
                }
                this._fontSize = fontSize - 1;
            }
        },

        _measureFontSize: function(fontSize) {
            this._context.font = fontSize + "px " + this._font;
            var minimalValueWidth = this._context.measureText(this._spinner.getMinimalValue()).width;
            var maximalValueWidth = this._context.measureText(this._spinner.getMaximalValue()).width;
            return Math.max(minimalValueWidth, maximalValueWidth);
        },

        _adjustSpinnerHeight: function() {
            this._spinner.setHeight(this._spinner.getSize() + this.getTitleHeight());
        },

        _drawTitle: function() {
            if (!this._spinner.getTitle()) return;

            var offsetY = this.getTitleHeight();
            var size = this._spinner.getSize();

            var x = this._spinner.isEntering() ? size / 2 + this._lineWidth : size - this._lineWidth;

            this._context.font = this._fontSize + "px " + this._font;
            this._context.textBaseline = "middle";
            this._context.fillStyle = this._fontColor;
            this._context.textAlign = "center";
            this._context.fillText(this._spinner.getTitle(), size / 2, this._lineWidth + this._fontSize / 2);
        },

        _drawArcs: function() {
            var offsetY = this.getTitleHeight();
            var size = this._spinner.getSize();
            var angle = (Math.PI / 2) + (3 * (Math.PI / 2) * this._spinner.getFactor());

            this._context.lineWidth = (this._lineWidth || 1);
            this._context.lineCap = "round";

            this._context.strokeStyle = this._lowArcColor;
            this._context.beginPath();
            this._context.arc(
                    size / 2,
                    offsetY + size / 2,
                    size / 2 - this._lineWidth - (this._radiusDifference || 0),
                    (Math.PI / 2),
                    angle,
                    false
            );
            this._context.stroke();

            this._context.strokeStyle = this._highArcColor;
            this._context.beginPath();
            this._context.lineTo(size / 2, offsetY + size / 2);
            this._context.arc(
                    size / 2,
                    offsetY + size / 2,
                    size / 2 - this._lineWidth,
                    angle,
                    2 * Math.PI,
                    false
            );
            this._context.stroke();
        },

        _drawValue: function() {
            var offsetY = this.getTitleHeight();
            var size = this._spinner.getSize();

            var x = this._spinner.isEntering() ? size / 2 + this._lineWidth : size - this._lineWidth;

            this._context.font = this._fontSize + "px " + this._font;
            this._context.textBaseline = "middle";
            this._context.fillStyle = this._fontColor;
            this._context.textAlign = this._spinner.isEntering() ? "left" : "right";
            this._context.fillText(this._getDisplayText(), x, offsetY + size * 0.75);
        },

        _drawCursor: function() {
            if (!this._spinner.isEntering()) return;

            var offsetY = this.getTitleHeight();
            var size = this._spinner.getSize();

            var cursorX = size / 2 +
                          this._lineWidth * 2 +
                          this._context.measureText(this._getDisplayText()).width;

            this._context.strokeStyle = this._cursorColor;
            this._context.beginPath();
            this._context.moveTo(cursorX, offsetY + Math.round(size * 0.75 - this._fontSize / 2));
            this._context.lineTo(cursorX, offsetY + Math.round(size * 0.75 + this._fontSize / 2));
            this._context.stroke();
        },

        _getDisplayText: function() {
            return this._spinner.isEntering() ? this._spinner.getEnteredText() : this._spinner.getValue();
        }

    })

});
