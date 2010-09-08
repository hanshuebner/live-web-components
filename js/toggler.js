
var Toggler = class({

    extends: Control,

    defaultOptions: {
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
        this._drawer = new this.Drawer(this);
    },

    getStateCount: function() {
        return 2;
    },

    toggleState: function() {
        this.setState(this.getState() ? 0 : 1);
    },

    draw: function() {
        this._super_draw();
        if (this._drawer) this._drawer.draw();
    },

    MouseHandler: class({

        initialize: function(toggler) {
            this._toggler = toggler;
            this._toggler.getButtonElement().onmousedown = this._onMouseDownHandler.bind(this);
        },

        _onMouseDownHandler: function() {
            this._toggler.getButtonElement().focus();
            this._toggler.toggleState();
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
                this._toggler.toggleState();
                return false;
            default:
                return true;
            }
        }

    }),

    Drawer: class({

        initialize: function(toggler) {
            this._toggler = toggler;
            this._options = this._toggler.getOptions();
            this._context = this._toggler.getCanvasElement().getContext("2d");

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
            this._buttonX = this._options.padding;
            this._buttonY = this._options.padding;
            this._buttonWidth = this._toggler.getWidth() - this._options.padding * 2;
            this._buttonHeight = this._toggler.getHeight() - this._options.padding * 2;
        },

        _calculateFontSize: function() {
            if (this._options.fontSize) return;
            this._options.fontSize = this._toggler.getHeight() - this._options.padding * 2 - this._options.borderWidth * 2;
        },

        _drawButton: function() {
            this._context.fillStyle = this._toggler.getState() ? this._options.onColor : this._options.offColor;
            this._context.fillRect(this._buttonX, this._buttonY, this._buttonWidth, this._buttonHeight);
        },

        _drawBorder: function() {
            this._context.strokeStyle = this._options.borderColor;
            this._context.lineWidth = this._options.borderWidth;
            this._context.strokeRect(this._buttonX, this._buttonY, this._buttonWidth, this._buttonHeight);
        },

        _drawText: function() {
            this._context.font = this._options.fontSize + "px " + this._options.font;
            this._context.fillStyle = this._options.fontColor;
            this._context.textAlign = "center";
            this._context.textBaseline = "middle";
            this._context.fillText(this._toggler.getExternalValue(), this._toggler.getWidth() / 2, this._toggler.getHeight() / 2);
        }

    })

});
