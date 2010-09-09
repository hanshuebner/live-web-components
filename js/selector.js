
var Selector = class({

    extends: Control,

    defaultStyle: {
        width: 100,
        height: 40,
        font: "sans-serif",
        fontSize: undefined,
        marginTop: 5,
        marginLeft: 5,
        marginBottom: 5,
        marginRight: 5,
        paddingTop: 2,
        paddingLeft: 2,
        paddingBottom: 2,
        paddingRight: 2,

        fontColor: "black",
        borderColor: "black",
        borderSize: 2,
        highlightColor: "green",
        backgroundColor: "white"
    },

    initialize: function(element_or_id, options) {
        this._super_initialize(element_or_id, options);

        this._dimensioner = new this.Dimensioner(this);
        this._positioner = new this.Positioner(this, this._dimensioner);
        this._drawer = new this.Drawer(this, this._dimensioner, this._positioner);
        this._menu = new this.Menu(this, this._dimensioner, this._positioner);

        this._mouseHandler = new this.MouseHandler(this);
        this._keyHandler = new this.KeyHandler(this, this._menu);
    },

    setItems: function(value) {
        this.setStateCount(value.length);
        this.setExternalMapping({
            toDisplay: function(state) { return value[state]; }
        });
        this.draw();
    },

    setStateCount: function(value) {
        this._stateCount = value;
    },

    getStateCount: function() {
        return this._stateCount || 0;
    },

    showMenu: function() {
        this._menu.show();
    },

    hideMenu: function() {
        this._menu.hide();
    },

    toggleMenu: function() {
        if (this.visibleMenu()) {
            this.hideMenu();
        } else {
            this.showMenu();
        }
    },

    visibleMenu: function() {
        return this._menu.isVisible();
    },

    blur: function() {
        if (this.visibleMenu()) this.hideMenu();
        this._super_blur();
    },

    draw: function() {
        this._super_draw();
        if (this._drawer) this._drawer.draw();
    },

    MouseHandler: class({

        initialize: function(selector) {
            this._selector = selector;
            this._selector.getButtonElement().onmousedown = this._onMouseDownHandler.bind(this);
        },

        _onMouseDownHandler: function() {
            this._selector.getButtonElement().focus();
            this._selector.toggleMenu();
            return false;
        }

    }),

    KeyHandler: class({

        initialize: function(selector, menu) {
            this._selector = selector;
            this._menu = menu;
            this._selector.getButtonElement().onkeydown = this._onKeyDownHandler.bind(this);
        },

        _onKeyDownHandler: function(event) {
            return this._menu.isVisible() ? this._handleMenuKey(event.keyCode) : this._handleSelectorKey(event.keyCode);
        },

        _handleSelectorKey: function(keyCode) {
            switch(keyCode) {
            case 13: // enter
            case 32: // space
            case 38: // up arrow
            case 40: // down arrow
                this._menu.setHighlightState(this._selector.getState());
                this._menu.show();
                return false;
            default:
                return true;
            }
        },

        _handleMenuKey: function(keyCode) {
            switch(keyCode) {
            case 13: // enter
                this._selector.setState(this._menu.getHighlightState());
                this._menu.hide();
                return false;
            case 38: // up arrow
                if (this._menu.getHighlightState() > 0)
                    this._menu.setHighlightState(this._menu.getHighlightState() - 1);
                return false;
            case 40: // down arrow
                if (this._menu.getHighlightState() < (this._selector.getStateCount() - 1))
                    this._menu.setHighlightState(this._menu.getHighlightState() + 1);
                return false;
            default:
                return true;
            }

        }

    }),

    Dimensioner: class({

        extends: TitleBorderDimensioner,

        initialize: function(selector) {
            this._super_initialize(selector);
        },

        getMenu: function() {
            var control = this.getControl();
            var borderDimension = this.getBorder();
            var stateDimension = this.getState();
            return {
                width: borderDimension.width,
                height: stateDimension.height * control.getStateCount()
            };
        },

        getState: function() {
            var style = this.getStyle();
            var areaDimension = this.getArea();
            var arrowDimension = this.getArrow();
            return {
                width: areaDimension.width - arrowDimension.width - style.paddingRight * 2,
                height: this.getFontSize()
            };
        },

        getArrow: function() {
            var fontSizeDimension = this.getFontSize();
            var size = Math.round(fontSizeDimension / 2);
            return {
                width:  size,
                height: size
            };
        },

        getFontSize: function() {
            var style = this.getStyle();
            if (style.fontSize) {
                return style.fontSize;
            } else {
                var control = this.getControl();
                if (control.hasTitle()) {
                    return Math.round((control.getHeight() - style.marginTop * 2 - style.marginBottom - style.paddingTop - style.paddingBottom) / 2);
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
            var control = this.getControl();
            var style = this.getStyle();
            var width = 0;
            var text;
            for (var index = 0; index < control.getStateCount(); index++) {
                text = control.getExternalValueFor(index);
                width = Math.max(width, this.getTextWidth(text, style.font, fontSize));
            }
            return width;
        }

    }),

    Positioner: class({

        extends: TitleBorderPositioner,

        initialize: function(selector, dimensioner) {
            this._super_initialize(selector, dimensioner);
        },

        getMenu: function() {
            var control = this.getControl();
            var dimensioner = this.getDimensioner();
            var borderDimension = dimensioner.getBorder();
            var borderPosition = this.getBorder();
            return {
                top: control.getButtonElement().offsetTop + borderPosition.y + borderDimension.height,
                left: control.getButtonElement().offsetLeft + borderPosition.x
            };
        },

        getArrow: function() {
            var dimensioner = this.getDimensioner();
            var style = this.getStyle();
            var areaPosition = this.getArea();
            var areaDimension = dimensioner.getArea();
            var arrowDimension = dimensioner.getArrow();
            return {
                x: areaPosition.x + areaDimension.width - arrowDimension.width - style.paddingRight,
                y: areaPosition.y + Math.round(areaDimension.height / 2 - arrowDimension.height / 2)
            };
        },

        getState: function() {
            var dimensioner = this.getDimensioner();
            var areaPosition = this.getArea();
            var stateDimension = dimensioner.getState();
            return {
                x: areaPosition.x + Math.round(stateDimension.width / 2),
                y: areaPosition.y + Math.round(stateDimension.height / 2)
            };
        }

    }),

    Drawer: class({

        initialize: function(selector, dimensioner, positioner) {
            this._selector = selector;
            this._dimensioner = dimensioner;
            this._positioner = positioner;
            this._style = this._selector.getStyle();
            this._context = this._selector.getCanvasElement().getContext("2d");

            this.draw();
        },

        draw: function() {
            this._drawBackground();
            this._drawArrow();
            this._drawState();
            this._drawBorder();
        },

        _drawBackground: function() {
            var borderDimensioner = this._dimensioner.getBorder();
            var borderPosition = this._positioner.getBorder();
            this._context.fillStyle = this._style.backgroundColor;
            this._context.fillRect(borderPosition.x, borderPosition.y, borderDimensioner.width, borderDimensioner.height);
        },

        _drawArrow: function() {
            var arrowDimension = this._dimensioner.getArrow();
            var arrowPosition = this._positioner.getArrow();
            this._context.strokeStyle = this._style.borderColor;
            this._context.lineWidth = this._style.borderSize;
            this._context.beginPath();
            this._context.moveTo(arrowPosition.x, arrowPosition.y);
            this._context.lineTo(arrowPosition.x + arrowDimension.width, arrowPosition.y);
            this._context.lineTo(arrowPosition.x + arrowDimension.width / 2, arrowPosition.y + arrowDimension.height);
            this._context.lineTo(arrowPosition.x, arrowPosition.y);
            this._context.stroke();
        },

        _drawState: function() {
            var statePosition = this._positioner.getState();
            this._context.fillStyle = this._style.fontColor;
            this._context.font = this._dimensioner.getFontSize() + "px " + this._style.font;
            this._context.textAlign = "center";
            this._context.textBaseline = "middle";
            this._context.fillText(this._selector.getExternalValue(), statePosition.x, statePosition.y);
        },

        _drawBorder: function() {
            var borderDimensioner = this._dimensioner.getBorder();
            var borderPosition = this._positioner.getBorder();
            this._context.strokeStyle = this._style.borderColor;
            this._context.lineWidth = this._style.borderSize;
            this._context.strokeRect(borderPosition.x, borderPosition.y, borderDimensioner.width, borderDimensioner.height);
        }

    }),

    Menu: class({

        initialize: function(selector, dimensioner, positioner) {
            this._selector = selector;
            this._dimensioner = dimensioner;
            this._positioner = positioner;

            this._createCanvasElement();
            this._mouseHandler = new this.MouseHandler(this._selector, this, this._dimensioner);
            this._drawer = new this.Drawer(this._selector, this, this._dimensioner);

            this.hide();
        },

        show: function() {
            this._visible = true;
            this._setCanvasElementStyle();
            this.draw();
        },

        hide: function() {
            this._visible = false;
            this._setCanvasElementStyle();
        },

        isVisible: function() {
            return this._visible;
        },

        clearHighlightState: function() {
            this._highlightState = undefined;
            this.draw();
        },

        setHighlightState: function(value) {
            this._highlightState = value;
            this.draw();
        },

        getHighlightState: function() {
            return this._highlightState;
        },

        hasHighlight: function() {
            return this._highlightState !== undefined;
        },

        getCanvasElement: function() {
            return this._canvasElement;
        },

        draw: function() {
            this._drawer.draw();
        },

        _setCanvasElementStyle: function() {
            var menuDimension = this._dimensioner.getMenu();
            var menuPosition = this._positioner.getMenu();
            this._canvasElement.setAttribute("width", menuDimension.width);
            this._canvasElement.setAttribute("height", menuDimension.height);
            this._canvasElement.setAttribute("style",
                "position: absolute;" +
                " top: " + menuPosition.top + "px;" +
                " left: " + menuPosition.left + "px;" +
                " visibility: " + (this._visible ? "visible" : "hidden") + ";" +
                " display: " + (this._visible ? "block" : "none") + ";");
        },

        _createCanvasElement: function() {
            this._canvasElement = document.createElement("canvas");
            this._selector.getButtonElement().appendChild(this._canvasElement);
            this._context = this._canvasElement.getContext("2d");
        },

        MouseHandler: class({

            initialize: function(selector, menu, dimensioner) {
                this._selector = selector;
                this._menu = menu;
                this._dimensioner = dimensioner;

                this._menu.getCanvasElement().onmousedown = this._onMouseDownHandler.bind(this);
                this._menu.getCanvasElement().onmousemove = this._onMouseMoveHandler.bind(this);
                this._menu.getCanvasElement().onmouseout = this._onMouseOutHandler.bind(this);
            },

            _onMouseDownHandler: function(event) {
                this._selector.setState(this._getStateForMouseEvent(event));
                return false;
            },

            _onMouseMoveHandler: function(event) {
                this._menu.setHighlightState(this._getStateForMouseEvent(event));
                return false;
            },

            _onMouseOutHandler: function() {
                this._menu.clearHighlightState();
                return false;
            },

            _getStateForMouseEvent: function(event) {
                var stateDimension = this._dimensioner.getState();
                return Math.floor(event.offsetY / stateDimension.height);
            }

        }),

        Drawer: class({

            initialize: function(selector, menu, dimensioner) {
                this._selector = selector;
                this._menu = menu;
                this._dimensioner = dimensioner;
                this._style = this._selector.getStyle();

                this._context = this._menu.getCanvasElement().getContext("2d");
            },

            draw: function() {
                this._drawBackground();
                this._drawHighlight();
                this._drawBorder();
                this._drawStates();
            },

            _drawBackground: function() {
                var menuDimension = this._dimensioner.getMenu();
                this._context.fillStyle = this._style.backgroundColor;
                this._context.fillRect(0, 0, menuDimension.width, menuDimension.height);
            },

            _drawHighlight: function() {
                if (!this._menu.hasHighlight()) return;

                var menuDimension = this._dimensioner.getMenu();
                var stateDimension = this._dimensioner.getState();
                var y = this._menu.getHighlightState() * stateDimension.height;

                this._context.fillStyle = this._style.highlightColor;
                this._context.fillRect(0, y, menuDimension.width, stateDimension.height);
            },

            _drawBorder: function() {
                var menuDimension = this._dimensioner.getMenu();
                this._context.strokeStyle = this._style.borderColor;
                this._context.lineWidth = this._style.borderSize;
                this._context.strokeRect(0, 0, menuDimension.width, menuDimension.height);
            },

            _drawStates: function() {
                var menuDimension = this._dimensioner.getMenu();
                var stateDimension = this._dimensioner.getState();

                this._context.fillStyle = this._style.fontColor;
                this._context.font = this._dimensioner.getFontSize() + "px " + this._style.font;
                this._context.textAlign = "center";
                this._context.textBaseline = "middle";

                var x = menuDimension.width / 2;
                var y = stateDimension.height / 2;

                for (var index = 0; index < this._selector.getStateCount(); index++) {
                    this._context.fillText(this._selector.getExternalValueFor(index), x, y);
                    y += stateDimension.height;
                }
            }

        })

    })

});
