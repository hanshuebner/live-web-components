
var Slider = class({

    extends: Control,

    defaults: {
        width: 100,
        height: 40,
        padding: 5,
        stateCount: 101,
        borderColor: "black",
        borderSize: 2
    },

    initialize: function(element_or_id, options) {
        this._super_initialize(element_or_id, options);

        this._dimensioner = new this.Dimensioner(this, options);
        this._positioner = new this.Positioner(this, options);
        this._drawer = new this.Drawer(this, this._dimensioner, this._positioner, options);
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
            "padding"
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
        }

    }),

    Positioner: class({

        extends: Optionable,

        OPTION_KEYS: [
            "padding"
        ],

        initialize: function(slider, options) {
            this._slider = slider;
            this._super_initialize(this._slider.defaults, options);
        },

        getBorder: function() {
            return {
                x: this._padding,
                y: this._padding
            };
        }

    }),

    Drawer: class({

        extends: Optionable,

        OPTION_KEYS: [
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
            this._drawBorder();
        },

        _drawBorder: function() {
            var borderDimension = this._dimensioner.getBorder();
            var borderPosition = this._positioner.getBorder();
            this._context.strokeStyle = this._borderColor;
            this._context.lineWidth = this._borderSize;
            this._context.strokeRect(borderPosition.x, borderPosition.y, borderDimension.width, borderDimension.height);
        }

    })

});
