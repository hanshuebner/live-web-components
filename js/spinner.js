
var Spinner = class({

    defaults: {
        size: 100,
        minimalValue: -100,
        maximalValue: 100,

        // drawer
        radiusDifference: 0,
        lowArcColor: "red",
        highArcColor: "black",
        valueColor: "black",
        valueFont: "sans-serif",
        focusColor: "blue",
        backgroundColor: "white"
    },

    initialize: function(id, options) {
        this.setContainerElement(document.getElementById(id));

        this._mouseHandler = new this.MouseHandler(this);
        this._keyHandler = new this.KeyHandler(this);
        this._focusHandler = new this.FocusHandler(this);
        this._drawer = new this.Drawer(this, options);

        this.setDefaults();
        this.setOptions(options);

        this.setFactor(0.5);
    },

    setDefaults: function() {
        this.setSize(this.defaults.size);
        this.setMinimalValue(this.defaults.minimalValue);
        this.setMaximalValue(this.defaults.maximalValue);
    },

    setOptions: function(options) {
        options = options || { };
        if (options.size) this.setSize(options.size);
        if (options.minimalValue) this.setMinimalValue(options.minimalValue);
        if (options.maximalValue) this.setMaximalValue(options.maximalValue);
    },

    setContainerElement: function(element) {
        if (element && element.nodeName == "DIV") {
            this._containerElement = element;

            this._createInputElement();
            this._createCanvasElement();
        } else {
            throw("The given id doesn't belong to a div element!");
        }
    },

    getInputElement: function() {
        return this._inputElement;
    },

    getCanvasElement: function() {
        return this._canvasElement;
    },

    setSize: function(value) {
        this._size = value;
        this._containerElement.setAttribute("height", this._size + "px");
        this._containerElement.setAttribute("width", this._size + "px");
        this._canvasElement.height = this._canvasElement.width = this._size;
        this._drawer.calculateFontSize();
        this._drawer.calculateLineWidth();
        this._drawer.draw();
    },

    getSize: function() {
        return this._size;
    },

    focus: function() {
        this._focused = true;
        this._drawer.draw();
    },

    blur: function() {
        this._focused = false;
        this._drawer.draw();
    },

    hasFocus: function() {
        return this._focused || false;
    },

    setFactor: function(value) {
        this._factor = Math.max(0.0, Math.min(1.0, value));
        this._value = this.getMinimalValue() + Math.round(this.getFactor() * (this.getMaximalValue() - this.getMinimalValue()));
        this._drawer.draw();
    },

    getFactor: function(value) {
        return this._factor || 0.0;
    },

    setMinimalValue: function(value) {
        this._minimalValue = value;
    },

    getMinimalValue: function() {
        return this._minimalValue || -100;
    },

    setMaximalValue: function(value) {
        this._maximalValue = value;
    },

    getMaximalValue: function() {
        return this._maximalValue || 100;
    },

    setValue: function(value) {
        this._value = Math.max(this.getMinimalValue(), Math.min(this.getMaximalValue(), value));
        this._factor = (this._value - this.getMinimalValue()) / (this.getMaximalValue() - this.getMinimalValue());
        this._drawer.draw();
    },

    getValue: function() {
        return this._value || 0;
    },

    _createInputElement: function() {
        this._inputElement = document.createElement("input");
        this._inputElement.type = "button";
        this._inputElement.setAttribute("style", "position: absolute; width: 1px; height: 1px; border: 0px;");
        this._containerElement.appendChild(this._inputElement);
    },

    _createCanvasElement: function() {
        this._canvasElement = document.createElement("canvas");
        this._containerElement.appendChild(this._canvasElement);
    },

    MouseHandler: class({

        initialize: function(spinner) {
            this._spinner = spinner;

            if (!document.onmousemove)
                this._spinner.getCanvasElement().onmousedown = this._onMouseDownHandler.bind(this);
        },

        _onMouseDownHandler: function(event) {
            this._spinner.getInputElement().focus();

            this._startY = event.screenY;
            this._startFactor = this._spinner.getFactor();

            document.onmousemove = this._onMouseMoveHandler.bind(this);
            document.onmouseup = this._onMouseUpHandler.bind(this);

            return false;
        },

        _onMouseMoveHandler: function(event) {
            var difference = event.screenY - this._startY;
            var sign = difference < 0 ? -1 : 1;
            var normalizedDifference = Math.min(Math.abs(difference), 500) * sign;
            var factorDifference = difference / 500.0;

            this._spinner.setFactor(this._startFactor + factorDifference);

            return false;
        },

        _onMouseUpHandler: function(spinner, event) {
            document.onmousemove = null;
            document.onmouseup = null;

            return false;
        }

    }),

    KeyHandler: class({

        initialize: function(spinner) {
            this._spinner = spinner;

            this._spinner.getInputElement().onkeydown = this._onKeyDownHandler.bind(this);
        },

        _onKeyDownHandler: function(event) {
            switch (event.keyCode) {
            case 38: // up arrow
                this._spinner.setValue(this._spinner.getValue() + 1);
                return false;
            case 40: // down arrow
                this._spinner.setValue(this._spinner.getValue() - 1);
                return false;
            default:
                return true;
            }
        }

    }),

    FocusHandler: class({

        initialize: function(spinner) {
            this._spinner = spinner;

            this._spinner.getInputElement().onfocus = this._onFocusHandler.bind(this);
            this._spinner.getInputElement().onblur = this._onBlurHandler.bind(this);
        },

        _onFocusHandler: function(event) {
            this._spinner.focus();
            return false;
        },

        _onBlurHandler: function(event) {
            this._spinner.blur();
            return false;
        }

    }),

    Drawer: class({

        OPTION_KEYS: [
            "radiusDifference",
            "lowArcColor",
            "highArcColor",
            "valueColor",
            "valueFont",
            "focusColor",
            "backgroundColor"
        ],

        initialize: function(spinner, options) {
            this._spinner = spinner;
            this._context = this._spinner.getCanvasElement().getContext("2d");

            this.setDefaults();
            this.setOptions(options);
        },

        setDefaults: function() {
            this.OPTION_KEYS.each(function(attribute) {
                this["_" + attribute] = this._spinner.defaults[attribute];
            }, this);
        },

        setOptions: function(options) {
            options = options || { };
            this.OPTION_KEYS.each(function(attribute) {
                if (options[attribute]) this["_" + attribute] = options[attribute];
            }, this);
        },

        calculateFontSize: function() {
            if (!this._context) return;

            var fontSize = 0;
            var textWidth = 0;
            while (textWidth < (this._spinner.getSize() / 2 - this._context.lineWidth * 2)) {
                fontSize++;
                this._context.font = fontSize + "px " + this._valueFont;
                textWidth = this._context.measureText("-100").width;
            }
            this._context.font = (fontSize - 1) + "px " + this._valueFont;
            this._context.textBaseline = "middle";
        },

        calculateLineWidth: function() {
            this._context.lineWidth = Math.max(1, Math.round(this._spinner.getSize() / 50));
            this._context.lineCap = "round";
        },

        draw: function() {
            if (!this._context) return;
            this._clear();
            this._drawArcs();
            this._drawValue();
            this._drawFocus();
        },

        _clear: function() {
            var size = this._spinner.getSize();

            this._context.fillStyle = this._backgroundColor;
            this._context.fillRect(0, 0, size, size);
        },

        _drawArcs: function() {
            var size = this._spinner.getSize();
            var angle = (Math.PI / 2) + (3 * (Math.PI / 2) * this._spinner.getFactor());

            this._context.strokeStyle = this._lowArcColor;
            this._context.beginPath();
            this._context.arc(
                    size / 2,
                    size / 2,
                    size / 2 - this._context.lineWidth - this._radiusDifference,
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

        _drawFocus: function() {
            var size = this._spinner.getSize();

            if (this._spinner.hasFocus()) {
                var length = size / 8;
                this._context.strokeStyle = this._focusColor;
                this._context.beginPath();
                this._context.moveTo(0, 0);
                this._context.lineTo(length, 0);
                this._context.moveTo(size - length, 0);
                this._context.lineTo(size, 0);
                this._context.lineTo(size, length);
                this._context.moveTo(size, size - length);
                this._context.lineTo(size, size);
                this._context.lineTo(size - length, size);
                this._context.moveTo(length, size);
                this._context.lineTo(0, size);
                this._context.lineTo(0, size - length);
                this._context.moveTo(0, length);
                this._context.lineTo(0, 0);
                this._context.stroke();
            }
        }

    })

});
