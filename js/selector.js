
var Selector = generateClass({

    extendClass: Control,

    defaultStyle: {
        highlightColor: "green",
        disabledColor: "gray"
    },

    initialize: function(element_or_id, options, style) {
        this._super_initialize(element_or_id, options, style);

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

    MouseHandler: generateClass({

        initialize: function(selector) {
            this._selector = selector;
            this._selector.getButtonElement().onmousedown = this._onMouseDownHandler.bind(this);
        },

        _onMouseDownHandler: function() {
            if (this._selector.isDisabled()) return;
            this._selector.getButtonElement().focus();
            this._selector.toggleMenu();
            return false;
        }

    }),

    KeyHandler: generateClass({

        initialize: function(selector, menu) {
            this._selector = selector;
            this._menu = menu;
            this._selector.getButtonElement().onkeydown = this._onKeyDownHandler.bind(this);
        },

        _onKeyDownHandler: function(event) {
            return this._menu.isVisible() ? this._handleMenuKey(event.keyCode) : this._handleSelectorKey(event.keyCode);
        },

        _handleSelectorKey: function(keyCode) {
            if (this._selector.isDisabled()) return;
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

    Dimensioner: generateClass({

        extendClass: TitleBorderDimensioner,

        getMenu: function() {
            var borderDimension = this.getBorder();
            var stateDimension = this.getState();
            return {
                width: borderDimension.width,
                height: stateDimension.height * this._control.getStateCount() + this._style.borderTopWidth * 4
            };
        },

        getState: function() {
            var spaceDimension = this.getSpace();
            var arrowDimension = this.getArrow();
            return {
                width: spaceDimension.width - arrowDimension.width - this._style.paddingRight * 2,
                height: Math.round(this.getFontSize() * 1.3)
            };
        },

        getArrow: function() {
            var spaceDimension = this.getSpace();
            var size = Math.round(spaceDimension.height / 3);
            return {
                width:  size,
                height: size
            };
        }

    }),

    Positioner: generateClass({

        extendClass: TitleBorderPositioner,

        getMenu: function() {
            var borderDimension = this._dimensioner.getBorder();
            var borderPosition = this.getBorder();
            var menuDimension = this._dimensioner.getMenu();
            var top = this._control.getButtonElement().offsetTop + borderPosition.y + borderDimension.height;
            if (top + menuDimension.height > this._getWindowHeight())
                top -= top + menuDimension.height - this._getWindowHeight();
            return {
                top: top,
                left: this._control.getButtonElement().offsetLeft + borderPosition.x,
                x: this._style.borderTopWidth * 2,
                y: this._style.borderTopWidth * 2
            };
        },

        getArrow: function() {
            var arrowDimension = this._dimensioner.getArrow();
            var spaceDimension = this._dimensioner.getSpace();
            var spacePosition = this.getSpace();
            return {
                x: spacePosition.x + spaceDimension.width - arrowDimension.width - this._style.paddingRight,
                y: spacePosition.y + Math.round(spaceDimension.height / 2 - arrowDimension.height / 2)
            };
        },

        getState: function() {
            var stateDimension = this._dimensioner.getState();
            var spaceDimension = this._dimensioner.getSpace();
            var spacePosition = this.getSpace();
            return {
                x: spacePosition.x + Math.round(stateDimension.width / 2),
                y: spacePosition.y + Math.round(spaceDimension.height / 2)
            };
        },

        _getWindowHeight: function() {
            return window.innerHeight;
        }

    }),

    Drawer: generateClass({

        extendClass: TitleBorderDrawer,

        draw: function() {
            this._drawTitle();
            this._drawBackground();
            this._drawArrow();
            this._drawState();
            this._drawBorder();
        },

        _drawArrow: function() {
            var arrowDimension = this._dimensioner.getArrow();
            var arrowPosition = this._positioner.getArrow();
            this._context.strokeStyle = this._getColor("borderTopColor");
            this._context.lineWidth = this._style.borderTopWidth;
            this._context.beginPath();
            this._context.moveTo(arrowPosition.x, arrowPosition.y);
            this._context.lineTo(arrowPosition.x + arrowDimension.width, arrowPosition.y);
            this._context.lineTo(arrowPosition.x + arrowDimension.width / 2, arrowPosition.y + arrowDimension.height);
            this._context.lineTo(arrowPosition.x, arrowPosition.y);
            this._context.stroke();
        },

        _drawState: function() {
            var statePosition = this._positioner.getState();
            this._context.fillStyle = this._getColor("color");
            this._context.font = this._dimensioner.getFontSize() + "px " + this._style.fontFamily;
            this._context.textAlign = "center";
            this._context.textBaseline = "middle";
            this._context.fillText(this._control.getExternalValue(), statePosition.x, statePosition.y);
        }

    }),

    Menu: generateClass({

        initialize: function(selector, dimensioner, positioner) {
            this._selector = selector;
            this._dimensioner = dimensioner;
            this._positioner = positioner;

            this._createButtonElement();
            this._createCanvasElement();
            this._mouseHandler = new this.MouseHandler(this._selector, this, this._dimensioner, this._positioner);
            this._drawer = new this.Drawer(this._selector, this, this._dimensioner, this._positioner);

            this.hide();
        },

        getButtonElement: function() {
            return this._buttonElement;
        },

        getCanvasElement: function() {
            return this._canvasElement;
        },

        show: function() {
            this._visible = true;
            this._setStyles();
            this.draw();
        },

        hide: function() {
            this._visible = false;
            this._setStyles();
        },

        isVisible: function() {
            return this._visible;
        },

        clearHighlightState: function() {
            var oldHighlightState = this._highlightState;
            this._highlightState = undefined;
            this._drawer.drawState(oldHighlightState);
        },

        setHighlightState: function(value) {
            var oldHighlightState = this._highlightState;
            this._highlightState = value;
            if (oldHighlightState != this._highlightState) {
                if (oldHighlightState !== undefined)
                    this._drawer.drawState(oldHighlightState);
                this._drawer.drawState(this._highlightState);
            }
        },

        getHighlightState: function() {
            return this._highlightState;
        },

        hasHighlight: function() {
            return this._highlightState !== undefined;
        },

        draw: function() {
            this._drawer.draw();
        },

        _createButtonElement: function() {
            this._buttonElement = document.createElement("button");
            document.firstChild.appendChild(this._buttonElement);
        },

        _createCanvasElement: function() {
            this._canvasElement = document.createElement("canvas");
            this._buttonElement.appendChild(this._canvasElement);
            this._context = this._canvasElement.getContext("2d");
        },

        _setStyles: function() {
            var menuDimension = this._dimensioner.getMenu();
            var menuPosition = this._positioner.getMenu();

            this._buttonElement.setAttribute("width", menuDimension.width);
            this._buttonElement.setAttribute("height", menuDimension.height);
            this._buttonElement.setAttribute("style",
                "position: absolute;" +
                " top: " + menuPosition.top + "px;" +
                " left: " + menuPosition.left + "px;" +
                " visibility: " + (this._visible ? "visible" : "hidden") + ";" +
                " display: " + (this._visible ? "block" : "none") + ";" +
                " border: none; margin: 0px; padding: 0px; background: transparent;");

            this._canvasElement.setAttribute("width", menuDimension.width);
            this._canvasElement.setAttribute("height", menuDimension.height);
        },

        MouseHandler: generateClass({

            initialize: function(selector, menu, dimensioner, positioner) {
                this._selector = selector;
                this._menu = menu;
                this._dimensioner = dimensioner;
                this._positioner = positioner;

                this._menu.getButtonElement().onmousedown = this._onMouseDownHandler.bind(this);
                this._menu.getButtonElement().onmousemove = this._onMouseMoveHandler.bind(this);
                this._menu.getButtonElement().onmouseout = this._onMouseOutHandler.bind(this);
            },

            _onMouseDownHandler: function(event) {
                this._selector.setState(this._getStateForMouseEvent(event));
                return true;
            },

            _onMouseMoveHandler: function(event) {
                var state = this._getStateForMouseEvent(event);
                if (state !== undefined) this._menu.setHighlightState(state);
                return true;
            },

            _onMouseOutHandler: function() {
                this._menu.clearHighlightState();
                return true;
            },

            _getStateForMouseEvent: function(event) {
                var stateDimension = this._dimensioner.getState();
                var menuPosition = this._positioner.getMenu();

                var y = event.offsetY || event.layerY;
                var state = Math.floor((y - menuPosition.y) / stateDimension.height);
                return state >= 0 && state < this._selector.getStateCount() ? state : undefined;
            }

        }),

        Drawer: generateClass({

            initialize: function(selector, menu, dimensioner, positioner) {
                this._selector = selector;
                this._menu = menu;
                this._dimensioner = dimensioner;
                this._positioner = positioner;
                this._style = this._selector.getStyle();

                this._context = this._menu.getCanvasElement().getContext("2d");
            },

            draw: function() {
                this._drawBackground();
                this._drawStates();
                this._drawBorder();
            },

            drawState: function(index) {
                var menuDimension = this._dimensioner.getMenu();
                var menuPosition = this._positioner.getMenu();
                var stateDimension = this._dimensioner.getState();

                var y = menuPosition.y + index * stateDimension.height;

                this._context.fillStyle = (index === this._menu.getHighlightState()) ?
                    this._style.highlightColor :
                    this._style.backgroundColor;
                this._context.fillRect(
                        menuPosition.x,
                        y,
                        menuDimension.width - this._style.borderTopWidth * 4,
                        stateDimension.height);

                this._context.fillStyle = this._style.color;
                this._context.font = this._dimensioner.getFontSize() + "px " + this._style.fontFamily;
                this._context.textAlign = "center";
                this._context.textBaseline = "middle";

                var x = menuDimension.width / 2;
                y += stateDimension.height / 2;

                this._context.fillText(this._selector.getExternalValueFor(index), x, y);
            },

            _drawBackground: function() {
                var menuDimension = this._dimensioner.getMenu();
                this._context.fillStyle = this._style.backgroundColor;
                this._context.fillRect(0, 0, menuDimension.width, menuDimension.height);
            },

            _drawStates: function() {
                for (var index = 0; index < this._selector.getStateCount(); index++) {
                    this.drawState(index);
                }
            },

            _drawBorder: function() {
                var menuDimension = this._dimensioner.getMenu();
                this._context.strokeStyle = this._style.borderTopColor;
                this._context.lineWidth = this._style.borderTopWidth;
                this._context.strokeRect(
                    this._context.lineWidth,
                    this._context.lineWidth,
                    menuDimension.width - this._context.lineWidth * 2,
                    menuDimension.height - this._context.lineWidth * 2);
            }

        })

    })

});
