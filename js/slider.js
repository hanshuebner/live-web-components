
var Slider = class({

    extends: Control,

    defaults: {
        width: 100,
        height: 40,
        padding: 5,
        stateCount: 101,
        mouseScale: 1,
        barColor: "green",
        font: "sans-serif",
        fontSize: null,             // null means, that the font size gonna be calculated
        fontColor: "black",
        borderColor: "black",
        borderSize: 2
    },

    initialize: function(element_or_id, options) {
        this._super_initialize(element_or_id, options);

        this._dimensioner = new this.Dimensioner(this, options);
        this._positioner = new this.Positioner(this, this._dimensioner, options);
        this._drawer = new this.Drawer(this, this._dimensioner, this._positioner, options);

        this._mouseHandler = new StateChangeMouseHandler(this, options);
    },

    setOptions: function(options) {
        options = options || { };
        this._super_setOptions(options);

        if (options.stateCount) this.setStateCount(options.stateCount);
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

        extends: Optionable,

        OPTION_KEYS: [
            "padding",
            "fontSize",
            "borderSize"
        ],

        initialize: function(slider, options) {
            this._slider = slider;
            this._super_initialize(this._slider.defaults, options);
        },

        getBorder: function() {
            return {
                width: this._slider.getWidth() - this._padding * 2,
                height: this._slider.getHeight() - this._padding * 2
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
            return this._fontSize || (this.getBorder().height - this._borderSize * 2);
        }

    }),

    Positioner: class({

        extends: Optionable,

        OPTION_KEYS: [
            "padding"
        ],

        initialize: function(slider, dimensioner, options) {
            this._slider = slider;
            this._dimensioner = dimensioner;
            this._super_initialize(this._slider.defaults, options);
        },

        getBorder: function() {
            return {
                x: this._padding,
                y: this._padding
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

        extends: Optionable,

        OPTION_KEYS: [
            "barColor",
            "borderColor",
            "borderSize",
            "font",
            "fontColor"
        ],

        initialize: function(slider, dimensioner, positioner, options) {
            this._slider = slider;
            this._dimensioner = dimensioner;
            this._positioner = positioner;
            this._super_initialize(this._slider.defaults, options);

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
            this._context.fillStyle = this._barColor;
            this._context.fillRect(barPosition.x, barPosition.y, barDimension.width, barDimension.height);
        },

        _drawBorder: function() {
            var borderDimension = this._dimensioner.getBorder();
            var borderPosition = this._positioner.getBorder();
            this._context.strokeStyle = this._borderColor;
            this._context.lineWidth = this._borderSize;
            this._context.strokeRect(borderPosition.x, borderPosition.y, borderDimension.width, borderDimension.height);
        },

        _drawText: function() {
            var textPosition = this._positioner.getText();
            this._context.fillStyle = this._fontColor;
            this._context.font = this._dimensioner.getFontSize() + "px " + this._font;
            this._context.textAlign = "center";
            this._context.textBaseline = "middle";
            this._context.fillText(this._slider.getExternalValue(), textPosition.x, textPosition.y);
        }

    })

});
