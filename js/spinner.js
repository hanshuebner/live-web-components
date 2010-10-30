
var Spinner = generateClass({

    extendClass: Control,

    defaultOptions: {
        state: 50,
        stateCount: 101,

        mouseScale: 1,              // a value of 1 means, that the spinner has turned completly around
                                    // if the mouse has been moved 1 time the distance of "size".
        alternateMouseScale: 5,     // same as mouseScale but for input with pressed shift key

        keyStep: 1,                 // a value of 1 means, that the spinner increases step index by one
                                    // on each key stroke
        alternateKeyStep: 5,        // same as keyStep but for input with pressed shift key

        markerVisible: true,        // defines if the marker is visible
        markerPosition: 50
    },

    defaultStyle: {
        lineWidth: 3,
        radiusDifference: 0,
        lowArcColor: "red",
        highArcColor: "black",
        markerColor: "green",
        cursorWidth: 1,
        cursorColor: "black",
        focusColor: "blue",
        disabledColor: "gray"
    },

    initialize: function(element_or_id, options, style) {
        this._super_initialize(element_or_id, options, style);

        this._dimensioner = new this.Dimensioner(this);
        this._positioner = new this.Positioner(this, this._dimensioner);
        this._drawer = new this.Drawer(this, this._dimensioner, this._positioner);

        this._mouseHandler = new StateChangingMouseHandler(this);
        this._keyHandler = new StateChangingKeyHandler(this);
        if (this._keyEventFilter) this._keyHandler.setEventFilter(this._keyEventFilter);
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

    setMarkerVisible: function(value) {
        this._markerVisible = value;
        this.draw();
    },

    setMarkerPosition: function(value) {
        this._markerPosition = value;
        this.draw();
    },

    getMarkerPosition: function() {
        return this._markerPosition;
    },

    isMarkerVisible: function() {
        return this._markerVisible;
    },

    getKeyHandler: function() {
        return this._keyHandler;
    },

    setKeyEventFilter: function(keyEventFilter) {
        this._keyEventFilter = keyEventFilter;
        if (this._keyHandler) this._keyHandler.setEventFilter(this._keyEventFilter);
    },

    getKeyEventFilter: function() {
        return this._keyHandler.getEventFilter();
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

        getMarker: function() {
            var spaceDimension = this.getSpace();
            var outterRadius = Math.round(Math.min(spaceDimension.width, spaceDimension.height) / 2);
            return {
                outterRadius: outterRadius,
                innerRadius: Math.min(outterRadius - 4, Math.round(outterRadius * 0.85))
            };
        },

        getHighArc: function() {
            var markerDimension = this.getMarker();
            return {
                radius: markerDimension.innerRadius - this._style.lineWidth
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

        getCursor: function() {
            var fontSize = this.getFontSize();
            return {
                height: fontSize + 4
            };
        }

    }),

    Positioner: generateClass({

        extendClass: TitleBorderPositioner,

        getMarker: function() {
            var markerDimension = this._dimensioner.getMarker();
            var spaceDimension = this._dimensioner.getSpace();
            var spacePosition = this.getSpace();
            var centerX = spacePosition.x + Math.round(spaceDimension.width / 2);
            var centerY = spacePosition.y + Math.round(spaceDimension.height / 2);
            var angle = this.getAngleForState(this._control.getMarkerPosition() || 0);
            return {
                x1: centerX + Math.round(Math.cos(angle) * markerDimension.innerRadius),
                y1: centerY + Math.round(Math.sin(angle) * markerDimension.innerRadius),
                x2: centerX + Math.round(Math.cos(angle - 0.13) * markerDimension.outterRadius),
                y2: centerY + Math.round(Math.sin(angle - 0.13) * markerDimension.outterRadius),
                x3: centerX + Math.round(Math.cos(angle + 0.13) * markerDimension.outterRadius),
                y3: centerY + Math.round(Math.sin(angle + 0.13) * markerDimension.outterRadius)
            };
        },

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
                x: highArcPosition.x + this._style.lineWidth,
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
        },

        getAngleForState: function(state) {
            return (Math.PI / 2) + (3 * (Math.PI / 2) * (state / (this._control.getStateCount() - 1)));
        }

    }),

    Drawer: generateClass({

        extendClass: TitleBorderDrawer,

        draw: function() {
            this._drawTitle();
            this._drawBorder();
            this._drawArcs();
            this._drawMarker();
            this._drawValue();
            this._drawCursor();
        },

        _drawMarker: function() {
            if (!this._control.isMarkerVisible()) return;
            var markerPosition = this._positioner.getMarker();

            this._context.fillStyle = this._getColor("markerColor");
            this._context.lineWidth = this._style.lineWidth;
            this._context.beginPath();
            this._context.moveTo(markerPosition.x1, markerPosition.y1);
            this._context.lineTo(markerPosition.x2, markerPosition.y2);
            this._context.lineTo(markerPosition.x3, markerPosition.y3);
            this._context.lineTo(markerPosition.x1, markerPosition.y1);
            this._context.fill();
        },

        _drawArcs: function() {
            var highArcDimension = this._dimensioner.getHighArc();
            var lowArcDimension = this._dimensioner.getLowArc();
            var highArcPosition = this._positioner.getHighArc();
            var lowArcPosition = this._positioner.getLowArc();

            var angle = this._positioner.getAngleForState(this._control.getState());

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
            var text = keyHandler && keyHandler.isEntering() ? keyHandler.getEnteredText() : this._control.getExternalValue();

            this._context.fillStyle = this._getColor("color");
            this._context.font = this._style.fontSize + "px " + this._style.fontFamily;
            this._context.textAlign = "left";
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
