
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
        font: "sans-serif",
        fontSize: undefined,
        fontColor: "black",
        marginTop: 5,
        marginLeft: 5,
        marginBottom: 5,
        marginRight: 5,
        paddingTop: 2,
        paddingLeft: 2,
        paddingBottom: 2,
        paddingRight: 2,

        barColor: "green",
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

        extends: TitleBorderDimensioner,

        initialize: function(slider) {
            this._super_initialize(slider);
        },

        getBar: function() {
            var borderDimension = this.getBorder();
            return {
                width: Math.round(borderDimension.width / this._control.getStateCount() * this._control.getState()),
                height: borderDimension.height
            };
        },

        getFontSize: function() {
            if (this._style.fontSize) {
                return this._style.fontSize;
            } else {
                if (this._control.hasTitle()) {
                    return Math.round((this._control.getHeight() - this._style.marginTop * 2 - this._style.marginBottom - this._style.paddingTop - this._style.paddingBottom) / 2);
                } else {
                    var areaDimension = this.getArea();
                    var fontSize = 1;
                    var width = 0;
                    do {
                        width = this.getMaximalTextWidth(fontSize);
                        fontSize++;
                    } while(width < areaDimension.width && fontSize < areaDimension.height);
                    return fontSize - 1;
                }
            }
        },

        getMaximalTextWidth: function(fontSize) {
            return Math.max(
                this.getTextWidth(this._control.getExternalValueFor(0), this._style.font, fontSize),
                this.getTextWidth(this._control.getExternalValueFor(this._control.getStateCount() - 1), this._style.font, fontSize)
            );
        }

    }),

    Positioner: class({

        extends: TitleBorderPositioner,

        initialize: function(slider, dimensioner) {
            this._super_initialize(slider, dimensioner);
        },

        getBar: function() {
            var borderPosition = this.getBorder();
            return {
                x: borderPosition.x,
                y: borderPosition.y
            };
        },

        getState: function() {
            var borderDimension = this._dimensioner.getBorder();
            var borderPosition = this.getBorder();
            return {
                x: borderPosition.x + Math.round(borderDimension.width / 2),
                y: borderPosition.y + Math.round(borderDimension.height / 2)
            };
        }

    }),

    Drawer: class({

        extends: TitleBorderDrawer,

        initialize: function(slider, dimensioner, positioner) {
            this._super_initialize(slider, dimensioner, positioner);
        },

        draw: function() {
            this._drawTitle();
            this._drawBar();
            this._drawBorder();
            this._drawState();
        },

        _drawBar: function() {
            var barDimension = this._dimensioner.getBar();
            var barPosition = this._positioner.getBar();
            this._context.fillStyle = this._style.barColor;
            this._context.fillRect(barPosition.x, barPosition.y, barDimension.width, barDimension.height);
        },

        _drawState: function() {
            var statePosition = this._positioner.getState();
            this._context.fillStyle = this._style.fontColor;
            this._context.font = this._dimensioner.getFontSize() + "px " + this._style.font;
            this._context.textAlign = "center";
            this._context.textBaseline = "middle";
            this._context.fillText(this._control.getExternalValue(), statePosition.x, statePosition.y);
        }

    })

});
