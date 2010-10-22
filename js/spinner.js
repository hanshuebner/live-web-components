
var Spinner = generateClass({

    extendClass: Control,

    defaultOptions: {
        state: 50,
        stateCount: 101,

        mouseScale: 1,              // a value of 1 means, that the spinner has turned completly around
                                    // if the mouse has been moved 1 time the distance of "size".

        keyStep: 1                  // a value of 1 means, that the spinner increases step index by one
                                    // on each key stroke
    },

    defaultStyle: {
        width: 100,
        height: 100,
        font: "sans-serif",
        fontSize: undefined,
        fontColor: "black",
        marginTop: 5,
        marginLeft: 5,
        marginBottom: 5,
        marginRight: 5,
        borderColor: "black",
        borderSize: 0,
        borderTopWidth: 0,
        paddingTop: 2,
        paddingLeft: 2,
        paddingBottom: 2,
        paddingRight: 2,
        backgroundColor: "white",

        lineWidth: 3,
        radiusDifference: 0,
        lowArcColor: "red",
        highArcColor: "black",
        cursorWidth: 1,
        cursorColor: "black",
        focusColor: "blue",
        disabledColor: "gray"
    },

    initialize: function(element_or_id, options) {
        this._super_initialize(element_or_id, options);

        this._dimensioner = new this.Dimensioner(this);
        this._positioner = new this.Positioner(this, this._dimensioner);
        this._drawer = new this.Drawer(this, this._dimensioner, this._positioner);

        this._mouseHandler = new StateChangingMouseHandler(this);
        this._keyHandler = new StateChangingKeyHandler(this);
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

    getKeyHandler: function() {
        return this._keyHandler;
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

        extendClass: TitleBorderDimensioner,

        getHighArc: function() {
            var spaceDimension = this.getSpace();
            return {
                radius: Math.round(Math.min(spaceDimension.width, spaceDimension.height) / 2)
            };
        },

        getLowArc: function() {
            var highArcDimension = this.getHighArc();
            return {
                radius: highArcDimension.radius - this._style.radiusDifference
            };
        },

        getValue: function() {
            var spaceDimension = this.getSpace();
            return {
                width: Math.round(spaceDimension.width / 2),
                height: Math.round(spaceDimension.height / 2)
            };
        },

        getFontSize: function() {
            if (this._style.fontSize) {
                return this._style.fontSize;
            } else {
                return Math.round(this._control.getHeight() / 3);
            }
        },

        getCursor: function() {
            var fontSize = this.getFontSize();
            return {
                height: fontSize + 4
            };
        }

    }),

    Positioner: generateClass({

        extendClass: TitleBorderPositioner,

        getHighArc: function() {
            var spaceDimension = this._dimensioner.getSpace();
            var spacePosition = this.getSpace();
            return {
                x: spacePosition.x + Math.round(spaceDimension.width / 2),
                y: spacePosition.y + Math.round(spaceDimension.height / 2)
            };
        },

        getLowArc: function() {
            return this.getHighArc();
        },

        getValue: function() {
            var spaceDimension = this._dimensioner.getSpace();
            var highArcPosition = this.getHighArc();
            var keyHandler = this._control.getKeyHandler();
            return {
                x: highArcPosition.x + (keyHandler && keyHandler.isEntering() ? 0 : Math.round(spaceDimension.width / 2)),
                y: highArcPosition.y + Math.round(spaceDimension.height * 0.25)
            };
        },

        getCursor: function() {
            var cursorDimension = this._dimensioner.getCursor();
            var fontSize = this._dimensioner.getFontSize();
            var valuePosition = this.getValue();
            return {
                x: valuePosition.x + this._dimensioner.getTextWidth(this._control.getKeyHandler().getEnteredText(), fontSize),
                y: valuePosition.y - Math.round(cursorDimension.height / 2)
            };
        }

    }),

    Drawer: generateClass({

        extendClass: TitleBorderDrawer,

        draw: function() {
            this._drawTitle();
            this._drawBorder();
            this._drawArcs();
            this._drawValue();
            this._drawCursor();
        },

        _drawArcs: function() {
            var highArcDimension = this._dimensioner.getHighArc();
            var lowArcDimension = this._dimensioner.getLowArc();
            var highArcPosition = this._positioner.getHighArc();
            var lowArcPosition = this._positioner.getLowArc();

            var angle = (Math.PI / 2) + (3 * (Math.PI / 2) * (this._control.getState() / (this._control.getStateCount() - 1)));

            this._context.lineWidth = (this._style.lineWidth || 1);
            this._context.lineCap = "round";

            this._context.strokeStyle = this._getColor("lowArcColor");
            this._context.beginPath();
            this._context.arc(
                    lowArcPosition.x,
                    lowArcPosition.y,
                    lowArcDimension.radius,
                    (Math.PI / 2),
                    angle,
                    false
            );
            this._context.stroke();

            this._context.strokeStyle = this._getColor("highArcColor");
            this._context.beginPath();
            if (angle == 2 * Math.PI) {
                this._context.moveTo(highArcPosition.x + highArcDimension.radius, highArcPosition.y);
            } else {
                 this._context.arc(
                        highArcPosition.x,
                        highArcPosition.y,
                        highArcDimension.radius,
                        2 * Math.PI,
                        angle,
                        true
                );
            }
            this._context.lineTo(highArcPosition.x, highArcPosition.y);
            this._context.stroke();
        },

        _drawValue: function() {
            var valuePosition = this._positioner.getValue();
            var keyHandler = this._control.getKeyHandler();

            var text;
            if (keyHandler && keyHandler.isEntering()) {
                this._context.textAlign = "left";
                text = keyHandler.getEnteredText();
            } else {
                this._context.textAlign = "right";
                text = this._control.getExternalValue();
            }

            this._context.fillStyle = this._getColor("fontColor");
            this._context.font = this._style.fontSize + "px " + this._style.font;
            this._context.textBaseline = "middle";
            this._context.fillText(text, valuePosition.x, valuePosition.y);
        },

        _drawCursor: function() {
            var keyHandler = this._control.getKeyHandler();
            if (!(keyHandler && keyHandler.isEntering())) return;

            var cursorDimension = this._dimensioner.getCursor();
            var cursorPosition = this._positioner.getCursor();

            this._context.strokeStyle = this._getColor("cursorColor");
            this._context.lineWidth = this._style.cursorWidth;
            this._context.beginPath();
            this._context.moveTo(cursorPosition.x, cursorPosition.y);
            this._context.lineTo(cursorPosition.x, cursorPosition.y + cursorDimension.height);
            this._context.stroke();
        }

    })

});
