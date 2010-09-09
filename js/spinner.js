
var Spinner = generateClass({

    extendClass: Control,

    defaultOptions: {
        size: 100,
        state: 50,
        stateCount: 101,

        mouseScale: 1,              // a value of 1 means, that the spinner has turned completly around
                                    // if the mouse has been moved 1 time the distance of "size".

        keyStep: 1                  // a value of 1 means, that the spinner increases step index by one
                                    // on each key stroke
    },

    defaultStyle: {
        font: "sans-serif",
        fontColor: "black",
        fontSize: null,             // null means, that the font size gonna be calculated

        lineWidth: 3,
        radiusDifference: 0,
        lowArcColor: "red",
        highArcColor: "black",
        cursorColor: "black",
        focusColor: "blue"
    },

    initialize: function(element_or_id, options) {
        this._super_initialize(element_or_id, options);

        this._mouseHandler = new StateChangingMouseHandler(this);
        this._keyHandler = new StateChangingKeyHandler(this);
        this._drawer = new this.Drawer(this, this._keyHandler);
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
        if (this._drawer) {
            this.setHeight(this._size + this._drawer.getTitleHeight());
            this.setWidth(this._size / 2 + this._drawer.getTitleHeight());
        } else {
            this.setHeight(this._size);
            this.setWidth(this._size);
        }
    },

    getSize: function() {
        return this._size;
    },

    setState: function(value) {
        this._super_setState(value);
        if (this._keyHandler) this._keyHandler.abortEntering();
    },

    setStateCount: function(value) {
        this._stateCount = value;
    },

    getStateCount: function() {
        return this._stateCount;
    },

    blur: function() {
        this._keyHandler.abortEntering();
        this._super_blur();
    },

    draw: function() {
        this._super_draw();
        if (this._drawer) this._drawer.draw();
    },

    Dimensioner: generateClass({

        initialize: function(spinner) {
            this._spinner = spinner;
            this._style = this._spinner.getStyle();
            this._super_initialize(this._spinner.defaults, options);
        }

    }),

    Drawer: generateClass({

        initialize: function(spinner, keyHandler) {
            this._spinner = spinner;
            this._keyHandler = keyHandler;
            this._style = this._spinner.getStyle();
            this._context = this._spinner.getCanvasElement().getContext("2d");

            this._calculateFontSize();
            this._adjustSpinnerHeight();
            this._adjustSpinnerWidth();
            this.draw();
        },

        getTitleWidth: function() {
            if (!this._spinner.getTitle()) return 0;
            this._context.font = this._style.fontSize + "px " + this._style.font;
            return this._context.measureText(this._spinner.getTitle()).width + this._style.lineWidth * 2;
        },

        getTitleHeight: function() {
            return this._spinner.getTitle() ? this._style.fontSize + this._style.lineWidth : 0;
        },

        getSpinnerWidth: function() {
            return this._spinner.getSize() / 2 + this.getMaximalValueWidth();
        },

        getMaximalValueWidth: function() {
            this._context.font = this._style.fontSize + "px " + this._style.font;
            var minimalValueWidth = this._context.measureText(this._spinner.getExternalValueFor(0)).width;
            var maximalValueWidth = this._context.measureText(this._spinner.getExternalValueFor(this._spinner.getStateCount() - 1)).width;
            var width = Math.max(minimalValueWidth, maximalValueWidth);
            width += this._style.lineWidth * 2;
            return Math.max(width, this._spinner.getSize() / 2);
        },

        draw: function() {
            if (!this._context) return;
            this._drawTitle();
            this._drawArcs();
            this._drawValue();
            this._drawCursor();
        },

        _calculateFontSize: function() {
            this._style.fontSize = this._spinner.getSize() / 2 - this._style.lineWidth * 2;
        },

        _adjustSpinnerHeight: function() {
            this._spinner.setHeight(this._spinner.getSize() + this.getTitleHeight());
        },

        _adjustSpinnerWidth: function() {
            this._spinner.setWidth(Math.max(this.getSpinnerWidth(), this.getTitleWidth()));
        },

        _drawTitle: function() {
            if (!this._spinner.getTitle()) return;

            this._context.fillStyle = this._style.fontColor;
            this._context.font = this._style.fontSize + "px " + this._style.font;
            this._context.textBaseline = "middle";
            this._context.textAlign = "center";
            this._context.fillText(this._spinner.getTitle(), this._spinner.getWidth() / 2, this._style.lineWidth + this._style.fontSize / 2);
        },

        _drawArcs: function() {
            var offsetX = this._getSpinnerOffsetX();
            var offsetY = this._getSpinnerOffsetY();
            var size = this._spinner.getSize();
            var angle = (Math.PI / 2) + (3 * (Math.PI / 2) * (this._spinner.getState() / (this._spinner.getStateCount() - 1)));

            this._context.lineWidth = (this._style.lineWidth || 1);
            this._context.lineCap = "round";

            this._context.strokeStyle = this._style.lowArcColor;
            this._context.beginPath();
            this._context.arc(
                    offsetX + size / 2,
                    offsetY + size / 2,
                    size / 2 - this._style.lineWidth - (this._style.radiusDifference || 0),
                    (Math.PI / 2),
                    angle,
                    false
            );
            this._context.stroke();

            this._context.strokeStyle = this._style.highArcColor;
            this._context.beginPath();
            if (angle == 2 * Math.PI) {
                this._context.moveTo(offsetX + size - this._style.lineWidth, offsetY + size / 2);
            } else {
                 this._context.arc(
                        offsetX + size / 2,
                        offsetY + size / 2,
                        size / 2 - this._style.lineWidth,
                        2 * Math.PI,
                        angle,
                        true
                );
            }
            this._context.lineTo(offsetX + size / 2, offsetY + size / 2);
            this._context.stroke();
        },

        _drawValue: function() {
            var offsetX = this._getSpinnerOffsetX();
            var offsetY = this._getSpinnerOffsetY();
            var size = this._spinner.getSize();

            var x = size / 2 + (this._keyHandler.isEntering() ? this._style.lineWidth : this.getMaximalValueWidth());

            this._context.font = this._style.fontSize + "px " + this._style.font;
            this._context.textBaseline = "middle";
            this._context.fillStyle = this._style.fontColor;
            this._context.textAlign = this._keyHandler.isEntering() ? "left" : "right";
            this._context.fillText(this._getDisplayText(), offsetX + x, offsetY + size * 0.75);
        },

        _drawCursor: function() {
            if (!this._keyHandler.isEntering()) return;

            var offsetX = this._getSpinnerOffsetX();
            var offsetY = this._getSpinnerOffsetY();
            var size = this._spinner.getSize();

            var cursorX = size / 2 +
                          this._style.lineWidth * 2 +
                          this._context.measureText(this._getDisplayText()).width;

            this._context.strokeStyle = this._style.cursorColor;
            this._context.beginPath();
            this._context.moveTo(offsetX + cursorX, offsetY + Math.round(size * 0.75 - this._style.fontSize / 2));
            this._context.lineTo(offsetX + cursorX, offsetY + Math.round(size * 0.75 + this._style.fontSize / 2));
            this._context.stroke();
        },

        _getSpinnerOffsetX: function() {
            return Math.max(0, this.getTitleWidth() / 2 - this.getSpinnerWidth() / 2);
        },

        _getSpinnerOffsetY: function() {
            return this.getTitleHeight();
        },

        _getDisplayText: function() {
            return this._keyHandler.isEntering() ? this._keyHandler.getEnteredText() : this._spinner.getExternalValue();
        }

    })

});
