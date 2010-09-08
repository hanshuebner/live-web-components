
var Slider = class({

    extends: Control,

    defaultOptions: {
        stateCount: 101,
        mouseScale: 1,
        keyStep: 1
    },

    defaultStyle: {
        width: 100,
        height: 40,
        padding: 5,
        barColor: "green",
        font: "sans-serif",
        fontSize: null,             // null means, that the font size gonna be calculated
        fontColor: "black",
        borderColor: "black",
        borderSize: 2
    },

    initialize: function(element_or_id, options) {
        this._super_initialize(element_or_id, options);

        this._dimensioner = new this.Dimensioner(this);
        this._positioner = new this.Positioner(this, this._dimensioner);
        this._drawer = new this.Drawer(this, this._dimensioner, this._positioner);

        this._mouseHandler = new StateChangingMouseHandler(this);
        this._keyHandler = new StateChangingKeyHandler(this);
    },

    setStateCount: function(value) {
        this._stateCount = value;
    },

    getStateCount: function() {
        return this._stateCount;
    },

    draw: function() {
        this._super_draw();
        if (this._drawer) this._drawer.draw();
    },

    Dimensioner: class({

        initialize: function(slider) {
            this._slider = slider;
            this._style = this._slider.getStyle();
        },

        getBorder: function() {
            return {
                width: this._slider.getWidth() - this._style.padding * 2,
                height: this._slider.getHeight() - this._style.padding * 2
            };
        },

        getBar: function() {
            var borderDimension = this.getBorder();
            return {
                width: Math.round(borderDimension.width / this._slider.getStateCount() * this._slider.getState()),
                height: borderDimension.height
            };
        },

        getFontSize: function() {
            return this._style.fontSize || (this.getBorder().height - this._style.borderSize * 2);
        }

    }),

    Positioner: class({

        initialize: function(slider, dimensioner) {
            this._slider = slider;
            this._dimensioner = dimensioner;
            this._style = this._slider.getStyle();
        },

        getBorder: function() {
            return {
                x: this._style.padding,
                y: this._style.padding
            };
        },

        getBar: function() {
            var borderPosition = this.getBorder();
            return {
                x: borderPosition.x,
                y: borderPosition.y
            };
        },

        getText: function() {
            var borderDimension = this._dimensioner.getBorder();
            var borderPosition = this.getBorder();
            return {
                x: borderPosition.x + Math.round(borderDimension.width / 2),
                y: borderPosition.y + Math.round(borderDimension.height / 2)
            };
        }

    }),

    Drawer: class({

        initialize: function(slider, dimensioner, positioner) {
            this._slider = slider;
            this._dimensioner = dimensioner;
            this._positioner = positioner;
            this._style = this._slider.getStyle();

            this._context = this._slider.getCanvasElement().getContext("2d");
            this.draw();
        },

        draw: function() {
            this._drawBar();
            this._drawBorder();
            this._drawText();
        },

        _drawBar: function() {
            var barDimension = this._dimensioner.getBar();
            var barPosition = this._positioner.getBar();
            this._context.fillStyle = this._style.barColor;
            this._context.fillRect(barPosition.x, barPosition.y, barDimension.width, barDimension.height);
        },

        _drawBorder: function() {
            var borderDimension = this._dimensioner.getBorder();
            var borderPosition = this._positioner.getBorder();
            this._context.strokeStyle = this._style.borderColor;
            this._context.lineWidth = this._style.borderSize;
            this._context.strokeRect(borderPosition.x, borderPosition.y, borderDimension.width, borderDimension.height);
        },

        _drawText: function() {
            var textPosition = this._positioner.getText();
            this._context.fillStyle = this._style.fontColor;
            this._context.font = this._dimensioner.getFontSize() + "px " + this._style.font;
            this._context.textAlign = "center";
            this._context.textBaseline = "middle";
            this._context.fillText(this._slider.getExternalValue(), textPosition.x, textPosition.y);
        }

    })

});
