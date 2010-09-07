
var Selector = class({

    extends: Control,

    defaults: {
        width: 10,
        height: 40,
        padding: 5,
        font: "sans-serif",
        fontSize: null,             // null means, that the font size gonna be calculated
        fontColor: "black",
        borderColor: "black",
        borderSize: 2,
        highlightColor: "green",
        backgroundColor: "white"
    },

    initialize: function(element_or_id, options) {
        this._super_initialize(element_or_id, options);

        this._dimensioner = new this.Dimensioner(this, options);
        this._positioner = new this.Positioner(this, this._dimensioner, options);
        this._drawer = new this.Drawer(this, this._dimensioner, this._positioner, options);
        this._menu = new this.Menu(this, this._dimensioner, this._positioner);

        this._mouseHandler = new this.MouseHandler(this);
        this._keyHandler = new this.KeyHandler(this, this._menu);

        this._adjustWidth();
    },

    setOptions: function(options) {
        options = options || { };
        this._super_setOptions(options);

        if (options.items) this.setItems(options.items);
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

    _adjustWidth: function() {
        this.setWidth(Math.max(this.getWidth(), this._dimensioner.getMinimalWidth()));
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

        extends: Optionable,

        OPTION_KEYS: [
            "padding",
            "font",
            "fontSize",
            "borderSize"
        ],

        initialize: function(selector, options) {
            this._selector = selector;
            this._context = this._selector.getCanvasElement().getContext("2d");
            this._super_initialize(this._selector.defaults, options);
        },

        getMinimalWidth: function() {
            var item = this.getItem();
            var arrow = this.getArrow();
            return item.width + arrow.width + this._borderSize * 3 + this._padding * 2;
        },

        getMenu: function() {
            var borderDimension = this.getBorder();
            var itemDimension = this.getItem();
            return {
                width: borderDimension.width,
                height: itemDimension.height * this._selector.getStateCount()
            };
        },

        getBorder: function() {
            var itemDimension = this.getItem();
            var arrowDimension = this.getArrow();
            return {
                width: Math.max(itemDimension.width + arrowDimension.width, this._selector.getWidth() - this._padding * 2),
                height: Math.max(Math.max(itemDimension.height,  arrowDimension.height), this._selector.getHeight() - this._padding * 2)
            };
        },

        getArrow: function() {
            return {
                width: Math.round(this.getFontSize() / 2),
                height: Math.round(this.getFontSize() / 2)
            };
        },

        getItem: function(index) {
            return {
                width: this.getMaximalTextWidth() + this._borderSize * 4,
                height: this.getFontSize() + this._borderSize * 2
            };
        },

        getMaximalTextWidth: function() {
            var width = 0;
            for (var index = 0; index < this._selector.getStateCount(); index++) {
                width = Math.max(width, this.getTextWidth(this._selector.getExternalValueFor(index)));
            }
            return width;
        },

        getTextWidth: function(text) {
            this._context.font = this.getFontSize() + "px " + this.font;
            return this._context.measureText(text).width;
        },

        getFontSize: function() {
            return this._fontSize || (this._selector.getHeight() - this._borderSize * 2 - this._padding * 2);
        }

    }),

    Positioner: class({

        extends: Optionable,

        OPTION_KEYS: [
            "padding",
            "borderSize"
        ],

        initialize: function(selector, dimensioner, options) {
            this._selector = selector;
            this._dimensioner = dimensioner;

            this._super_initialize(this._selector.defaults, options);
        },

        getMenu: function() {
            var borderDimension = this._dimensioner.getBorder();
            var borderPosition = this.getBorder();
            return {
                top: this._selector.getButtonElement().offsetTop + borderPosition.y + borderDimension.height,
                left: this._selector.getButtonElement().offsetLeft + borderPosition.x
            };
        },

        getBorder: function() {
            return {
                x: this._padding,
                y: this._padding
            };
        },

        getArrow: function() {
            var borderPosition = this.getBorder();
            var borderDimension = this._dimensioner.getBorder();
            var arrowDimension = this._dimensioner.getArrow();
            return {
                x: borderPosition.x + borderDimension.width - this._borderSize * 2 - arrowDimension.width,
                y: borderPosition.y + Math.round(borderDimension.height / 2) - Math.round(arrowDimension.height / 2)
            };
        },

        getState: function() {
            var borderPosition = this.getBorder();
            var itemDimension = this._dimensioner.getItem();
            return {
                x: borderPosition.x + Math.round(itemDimension.width / 2),
                y: borderPosition.y + Math.round(itemDimension.height / 2)
            };
        }

    }),

    Drawer: class({

        extends: Optionable,

        OPTION_KEYS: [
            "font",
            "fontColor",
            "borderColor",
            "borderSize",
            "backgroundColor"
        ],

        initialize: function(selector, dimensioner, positioner, options) {
            this._selector = selector;
            this._dimensioner = dimensioner;
            this._positioner = positioner;
            this._context = this._selector.getCanvasElement().getContext("2d");

            this._super_initialize(this._selector.defaults, options);

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
            this._context.fillStyle = this._backgroundColor;
            this._context.fillRect(borderPosition.x, borderPosition.y, borderDimensioner.width, borderDimensioner.height);
        },

        _drawArrow: function() {
            var arrowDimension = this._dimensioner.getArrow();
            var arrowPosition = this._positioner.getArrow();
            this._context.strokeStyle = this._borderColor;
            this._context.beginPath();
            this._context.moveTo(arrowPosition.x, arrowPosition.y);
            this._context.lineTo(arrowPosition.x + arrowDimension.width, arrowPosition.y);
            this._context.lineTo(arrowPosition.x + arrowDimension.width / 2, arrowPosition.y + arrowDimension.height);
            this._context.lineTo(arrowPosition.x, arrowPosition.y);
            this._context.stroke();
        },

        _drawState: function() {
            var statePosition = this._positioner.getState();
            this._context.fillStyle = this._fontColor;
            this._context.font = this._dimensioner.getFontSize() + "px " + this._font;
            this._context.textAlign = "center";
            this._context.textBaseline = "middle";
            this._context.fillText(this._selector.getExternalValue(), statePosition.x, statePosition.y);
        },

        _drawBorder: function() {
            var borderDimensioner = this._dimensioner.getBorder();
            var borderPosition = this._positioner.getBorder();
            this._context.strokeStyle = this._borderColor;
            this._context.lineWidth = this._borderSize;
            this._context.strokeRect(borderPosition.x, borderPosition.y, borderDimensioner.width, borderDimensioner.height);
        }

    }),

    Menu: class({

        extends: Optionable,

        initialize: function(selector, dimensioner, positioner, options) {
            this._selector = selector;
            this._dimensioner = dimensioner;
            this._positioner = positioner;
            this._super_initialize(options);

            this._createCanvasElement();
            this._mouseHandler = new this.MouseHandler(this._selector, this, this._dimensioner);
            this._drawer = new this.Drawer(this._selector, this, this._dimensioner, options);

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
                var item = this._dimensioner.getItem();
                return Math.floor(event.offsetY / item.height);
            }

        }),

        Drawer: class({

            extends: Optionable,

            OPTION_KEYS: [
                "font",
                "fontColor",
                "borderColor",
                "borderSize",
                "highlightColor",
                "backgroundColor"
            ],

            initialize: function(selector, menu, dimensioner, options) {
                this._selector = selector;
                this._menu = menu;
                this._dimensioner = dimensioner;

                this._super_initialize(this._selector.defaults, options);

                this._context = this._menu.getCanvasElement().getContext("2d");
            },

            draw: function() {
                this._drawBackground();
                this._drawHighlight();
                this._drawBorder();
                this._drawItems();
            },

            _drawBackground: function() {
                var menuDimension = this._dimensioner.getMenu();
                this._context.fillStyle = this._backgroundColor;
                this._context.fillRect(0, 0, menuDimension.width, menuDimension.height);
            },

            _drawHighlight: function() {
                if (!this._menu.hasHighlight()) return;

                var menuDimension = this._dimensioner.getMenu();
                var itemDimension = this._dimensioner.getItem();
                var y = this._menu.getHighlightState() * itemDimension.height;

                this._context.fillStyle = this._highlightColor;
                this._context.fillRect(0, y, menuDimension.width, itemDimension.height);
            },

            _drawBorder: function() {
                var menuDimension = this._dimensioner.getMenu();
                this._context.strokeStyle = this._borderColor;
                this._context.lineWidth = this._borderSize;
                this._context.strokeRect(0, 0, menuDimension.width, menuDimension.height);
            },

            _drawItems: function() {
                var menuDimension = this._dimensioner.getMenu();
                var itemDimension = this._dimensioner.getItem();

                this._context.fillStyle = this._fontColor;
                this._context.font = this._dimensioner.getFontSize() + "px " + this._font;
                this._context.textAlign = "center";
                this._context.textBaseline = "middle";

                var x = menuDimension.width / 2;
                var y = itemDimension.height / 2;

                for (var index = 0; index < this._selector.getStateCount(); index++) {
                    this._context.fillText(this._selector.getExternalValueFor(index), x, y);
                    y += itemDimension.height;
                }
            }

        })

    })

});
