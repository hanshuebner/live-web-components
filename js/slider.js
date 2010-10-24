
var Slider = generateClass({

    extendClass: Control,

    defaultOptions: {
        stateCount: 101,
        mouseScale: 1,
        keyStep: 1
    },

    defaultStyle: {
        barColor: "green",
        disabledColor: "gray"
    },

    initialize: function(element_or_id, options, style) {
        this._super_initialize(element_or_id, options, style);

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

    Dimensioner: generateClass({

        extendClass: TitleBorderDimensioner,

        getBar: function() {
            var borderDimension = this.getBorder();
            return {
                width: Math.round(borderDimension.width / this._control.getStateCount() * this._control.getState()),
                height: borderDimension.height
            };
        }

    }),

    Positioner: generateClass({

        extendClass: TitleBorderPositioner,

        getBar: function() {
            var borderPosition = this.getBorder();
            return {
                x: borderPosition.x,
                y: borderPosition.y
            };
        },

        getState: function() {
            var areaDimension = this._dimensioner.getArea();
            var areaPosition = this.getArea();
            return {
                x: areaPosition.x + Math.round(areaDimension.width / 2),
                y: areaPosition.y + Math.round(areaDimension.height / 2)
            };
        }

    }),

    Drawer: generateClass({

        extendClass: TitleBorderDrawer,

        draw: function() {
            this._drawTitle();
            this._drawBar();
            this._drawBorder();
            this._drawState();
        },

        _drawBar: function() {
            var barDimension = this._dimensioner.getBar();
            var barPosition = this._positioner.getBar();
            this._context.fillStyle = this._getColor("barColor");
            this._context.fillRect(barPosition.x, barPosition.y, barDimension.width, barDimension.height);
        },

        _drawState: function() {
            var statePosition = this._positioner.getState();
            this._context.fillStyle = this._getColor("color");
            this._context.font = this._dimensioner.getFontSize() + "px " + this._style.fontFamily;
            this._context.textAlign = "center";
            this._context.textBaseline = "middle";
            this._context.fillText(this._control.getExternalValue(), statePosition.x, statePosition.y);
        }

    })

});
