
var Toggler = class({

    extends: Control,

    defaults: {
        width: 200,
        height: 50,
        initialValue: false,
        text: null,

        // drawer
        padding: 5,
        borderColor: "black",
        borderWidth: 2,
        onColor: "green",
        offColor: "white",
        font: "sans-serif",
        fontColor: "black",
        fontSize: null,             // null means, that the font size gonna be calculated

        // control drawer
        focusColor: "blue"
    },

    initialize: function(element_or_id, options) {
        this._super_initialize(element_or_id, options);

        this._mouseHandler = new this.MouseHandler(this);
        this._keyHandler = new this.KeyHandler(this);
        this._drawer = new this.Drawer(this, options);
    },

    setOptions: function(options) {
        options = options || { };
        this._super_setOptions(options);

        if (options.initialValue) this.setOn(options.initialValue);
        if (options.text) this.setText(options.text);
        if (options.onchange) this.onchange = options.onchange;
    },

    setOn: function(value) {
        var changed = this._on != value;

        this._on = value;

        if (changed) {
            this.draw();
            this._triggerOnChange();
        }
    },

    toggleOn: function() {
        this.setOn(this.isOn() ? false : true);
    },

    isOn: function() {
        return this._on;
    },

    setText: function(value) {
        this._text = value;
        this.draw();
    },

    getText: function() {
        return this._text || "";
    },

    draw: function() {
        this._super_draw();
        if (this._drawer) this._drawer.draw();
    },

    _triggerOnChange: function() {
        if (this.onchange) this.onchange(this.isOn());
    },

    MouseHandler: class({

        initialize: function(toggler) {
            this._toggler = toggler;
            this._toggler.getButtonElement().onmousedown = this._onMouseDownHandler.bind(this);
        },

        _onMouseDownHandler: function() {
            this._toggler.getButtonElement().focus();
            this._toggler.toggleOn();
        }

    }),

    KeyHandler: class({

        initialize: function(toggler) {
            this._toggler = toggler;
            this._toggler.getButtonElement().onkeydown = this._onKeyDownHandler.bind(this);
        },

        _onKeyDownHandler: function(event) {
            switch (event.keyCode) {
            case 13: // enter
            case 32: // space
                this._toggler.toggleOn();
                return false;
            default:
                return true;
            }
        }

    }),

    Drawer: class({

        extends: Optionable,

        OPTION_KEYS: [
            "padding",
            "borderColor",
            "borderWidth",
            "onColor",
            "offColor",
            "font",
            "fontColor",
            "fontSize"
        ],

        initialize: function(toggler, options) {
            this._toggler = toggler;
            this._context = this._toggler.getCanvasElement().getContext("2d");

            this._super_initialize(this._toggler.defaults, options);

            this._calculateFontSize();
            this.draw();
        },

        draw: function() {
            if (!this._context) return;

            this._calculateButtonSize();
            this._drawButton();
            this._drawBorder();
            this._drawText();
        },

        _calculateButtonSize: function() {
            this._buttonX = this._padding;
            this._buttonY = this._padding;
            this._buttonWidth = this._toggler.getWidth() - this._padding * 2;
            this._buttonHeight = this._toggler.getHeight() - this._padding * 2;
        },

        _calculateFontSize: function() {
            if (this._fontSize) return;
            this._fontSize = this._toggler.getHeight() - this._padding * 2 - this._borderWidth * 2;
        },

        _drawButton: function() {
            this._context.fillStyle = this._toggler.isOn() ? this._onColor : this._offColor;
            this._context.fillRect(this._buttonX, this._buttonY, this._buttonWidth, this._buttonHeight);
        },

        _drawBorder: function() {
            this._context.strokeStyle = this._borderColor;
            this._context.lineWidth = this._borderWidth;
            this._context.strokeRect(this._buttonX, this._buttonY, this._buttonWidth, this._buttonHeight);
        },

        _drawText: function() {
            this._context.font = this._fontSize + "px " + this._font;
            this._context.fillStyle = this._fontColor;
            this._context.textAlign = "center";
            this._context.textBaseline = "middle";
            this._context.fillText(this._toggler.getText(), this._toggler.getWidth() / 2, this._toggler.getHeight() / 2);
        }

    })

});
