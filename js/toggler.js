
var Toggler = generateClass({

    extendClass: Control,

    defaultOptions: {
        state: 0
    },

    defaultStyle: {
        /*
        width: 100,
        height: 40,
        font: "sans-serif",
        fontSize: undefined,
        fontColor: "black",
        marginTop: 5,
        marginLeft: 5,
        marginBottom: 5,
        marginRight: 5,
        borderColor: "black",
        borderSize: 2,
        borderTopWidth: 2,
        paddingTop: 2,
        paddingLeft: 2,
        paddingBottom: 2,
        paddingRight: 2,
        backgroundColor: "white",
        */

        onColor: "green",
        offColor: "white",
        disabledColor: "gray"
    },

    initialize: function(element_or_id, options, style) {
        this._super_initialize(element_or_id, options, style);

        this._dimensioner = new this.Dimensioner(this);
        this._positioner = new this.Positioner(this, this._dimensioner);
        this._drawer = new this.Drawer(this, this._dimensioner, this._positioner);

        this._mouseHandler = new this.MouseHandler(this);
        this._keyHandler = new this.KeyHandler(this);
    },

    setItems: function(value) {
        this.setExternalMapping({
            toDisplay: function(state) { return value[state]; }
        });
        this.draw();
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

    MouseHandler: generateClass({

        initialize: function(toggler) {
            this._toggler = toggler;
            this._toggler.getButtonElement().onmousedown = this._onMouseDownHandler.bind(this);
        },

        _onMouseDownHandler: function() {
            if (this._toggler.isDisabled()) return;
            this._toggler.getButtonElement().focus();
            this._toggler.toggleState();
        }

    }),

    KeyHandler: generateClass({

        initialize: function(toggler) {
            this._toggler = toggler;
            this._toggler.getButtonElement().onkeydown = this._onKeyDownHandler.bind(this);
        },

        _onKeyDownHandler: function(event) {
            if (this._toggler.isDisabled()) return;
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

    Dimensioner: generateClass({

        extendClass: TitleBorderDimensioner,

        getButton: function() {
            return this.getBorder();
        }

    }),

    Positioner: generateClass({

        extendClass: TitleBorderPositioner,

        getButton: function() {
            return this.getBorder();
        },

        getState: function() {
            var spaceDimension = this._dimensioner.getSpace();
            var spacePosition = this.getSpace();
            return {
                x: spacePosition.x + Math.round(spaceDimension.width / 2),
                y: spacePosition.y + Math.round(spaceDimension.height / 2)
            };
        }

    }),

    Drawer: generateClass({

        extendClass: TitleBorderDrawer,

        draw: function() {
            this._drawTitle();
            this._drawButton();
            this._drawBorder();
            this._drawState();
        },

        _drawButton: function() {
            var buttonDimension = this._dimensioner.getButton();
            var buttonPosition = this._positioner.getButton();
            this._context.fillStyle = this._control.getState() ? this._getColor("onColor") : this._getColor("offColor");
            this._context.fillRect(buttonPosition.x, buttonPosition.y, buttonDimension.width, buttonDimension.height);
        },

        _drawState: function() {
            var statePosition = this._positioner.getState();
            var fontSize = this._dimensioner.getFontSize();
            var externalValue = this._control.getExternalValue();
            if (typeof(externalValue) === "string" && externalValue.match(/^image:/)) {
                var context = this._context;
                var image = new Image();
                image.onload = function() {
                    context.drawImage(
                        image,
                        statePosition.x - Math.round(image.width / 2),
                        statePosition.y - Math.round(image.height / 2)
                    );
                };
                image.src = externalValue.substring(6);
            } else {
                this._context.font = fontSize + "px " + this._style.fontFamily;
                this._context.fillStyle = this._getColor("color");
                this._context.textAlign = "center";
                this._context.textBaseline = "middle";
                this._context.fillText(externalValue, statePosition.x, statePosition.y);
            }
        }

    })

});
