
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
        backgroundColor: "white"
    },

    initialize: function(element_or_id, options) {
        this._super_initialize(element_or_id, options);

        this._mouseHandler = new this.MouseHandler(this);
        this._dimensioner = new this.Dimensioner(this, options);
        this._drawer = new this.Drawer(this, this._dimensioner, options);
        this._menu = new this.Menu(this, this._dimensioner);

        this._adjustWidth();
    },

    setOptions: function(options) {
        options = options || { };
        this._super_setOptions(options);

        if (options.items) this.setItems(options.items);
    },

    setItems: function(value) {
        this._items = value;
        this.draw();
    },

    getItems: function() {
        return this._items;
    },

    getSelectedItem: function() {
        return this._items[ this.getSelectedIndex() ];
    },

    setSelectedIndex: function(value) {
        this._selectedIndex = value;
        this.draw();
    },

    getSelectedIndex: function() {
        return this._selectedIndex || 0;
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
            return item.width + this._borderSize * 2 + this._padding * 2;
        },

        getFontSize: function() {
            return this._fontSize || (this._selector.getHeight() - this._padding * 2);
        },

        getMaximalTextWidth: function() {
            var width = 0;
            this._selector.getItems().each(function(item) {
                width = Math.max(width, this.getTextWidth(item));
            }, this);
            return width;
        },

        getTextWidth: function(text) {
            this._context.font = this.getFontSize() + "px " + this.font;
            return this._context.measureText(text).width;
        },

        getSelectedItem: function() {
            var border = this.getBorder();
            return {
                x: border.x + this._borderSize + this.getMaximalTextWidth() / 2,
                y: border.y + this.getFontSize() / 2
            };
        },

        getBorder: function() {
            return {
                x: this._padding,
                y: this._padding,
                width: this._selector.getWidth() - this._padding * 2,
                height: this._selector.getHeight() - this._padding * 2
            };
        },

        getMenu: function() {
            var item = this.getItem();
            return {
                top: this._selector.getButtonElement().offsetTop + item.height,
                left: this._selector.getButtonElement().offsetLeft + this._padding,
                width: item.width + this._borderSize * 2,
                height: item.height * this._selector.getItems().length
            };
        },

        getItem: function(index) {
            var arrow = this.getArrow();
            return {
                width: this.getMaximalTextWidth() + arrow.width + this._borderSize * 2,
                height: this.getFontSize() + this._borderSize * 2
            };
        },

        getArrow: function() {
            var border = this.getBorder();
            return {
                x: border.x + border.width - this.getFontSize(),
                y: border.y + this._borderSize * 2,
                width: this.getFontSize() - this._borderSize * 2,
                height: this.getFontSize() - this._borderSize * 4
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

        initialize: function(selector, dimensioner, options) {
            this._selector = selector;
            this._dimensioner = dimensioner;
            this._context = this._selector.getCanvasElement().getContext("2d");

            this._super_initialize(this._selector.defaults, options);

            this.draw();
        },

        draw: function() {
            this._drawBackground();
            this._drawArrow();
            this._drawSelectedItem();
            this._drawBorder();
        },

        _drawBackground: function() {
            var border = this._dimensioner.getBorder();
            this._context.fillStyle = this._backgroundColor;
            this._context.fillRect(border.x, border.y, border.width, border.height)
        },

        _drawArrow: function() {
            var arrow = this._dimensioner.getArrow();
            this._context.strokeStyle = this._borderColor;
            this._context.beginPath();
            this._context.moveTo(arrow.x, arrow.y);
            this._context.lineTo(arrow.x + arrow.width, arrow.y);
            this._context.lineTo(arrow.x + arrow.width / 2, arrow.y + arrow.height);
            this._context.lineTo(arrow.x, arrow.y);
            this._context.stroke();
        },

        _drawSelectedItem: function() {
            var selectedItem = this._dimensioner.getSelectedItem();
            this._context.fillStyle = this._fontColor;
            this._context.font = this._dimensioner.getFontSize() + "px " + this._font;
            this._context.textAlign = "center";
            this._context.textBaseline = "middle";
            this._context.fillText(this._selector.getSelectedItem(), selectedItem.x, selectedItem.y);
        },

        _drawBorder: function() {
            var border = this._dimensioner.getBorder();
            this._context.strokeStyle = this._borderColor;
            this._context.lineWidth = this._borderSize;
            this._context.strokeRect(border.x, border.y, border.width, border.height)
        }

    }),

    Menu: class({

        extends: Optionable,

        initialize: function(selector, dimensioner, options) {
            this._selector = selector;
            this._dimensioner = dimensioner;
            this._super_initialize(options);

            this._createCanvasElement();
            this._mouseHandler = new this.MouseHandler(this._selector, this, this._dimensioner);
            this._drawer = new this.Drawer(this._selector, this, this._dimensioner, options);

            this.hide();
        },

        show: function() {
            this._visible = true;
            this._setCanvasElementStyle();
            this._drawer.draw();
        },

        hide: function() {
            this._visible = false;
            this._setCanvasElementStyle();
        },

        isVisible: function() {
            return this._visible;
        },

        getCanvasElement: function() {
            return this._canvasElement;
        },

        _setCanvasElementStyle: function() {
            var menu = this._dimensioner.getMenu();
            this._canvasElement.setAttribute("width", menu.width);
            this._canvasElement.setAttribute("height", menu.height);
            this._canvasElement.setAttribute("style",
                "position: absolute;" +
                " top: " + menu.top + "px;" +
                " left: " + menu.left + "px;" +
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
            },

            _onMouseDownHandler: function(event) {
                var item = this._dimensioner.getItem();
                var index = Math.floor(event.offsetY / item.height);
                this._selector.setSelectedIndex(index);
                // this._menu.hide();
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

            initialize: function(selector, menu, dimensioner, options) {
                this._selector = selector;
                this._menu = menu;
                this._dimensioner = dimensioner;

                this._super_initialize(this._selector.defaults, options);

                this._context = this._menu.getCanvasElement().getContext("2d");
            },

            draw: function() {
                this._drawBackground();
                this._drawBorder();
                this._drawItems();
            },

            _drawBackground: function() {
                var menu = this._dimensioner.getMenu();
                this._context.fillStyle = this._backgroundColor;
                this._context.fillRect(0, 0, menu.width, menu.height);
            },

            _drawBorder: function() {
                var menu = this._dimensioner.getMenu();
                this._context.strokeStyle = this._borderColor;
                this._context.lineWidth = this._borderSize;
                this._context.strokeRect(0, 0, menu.width, menu.height);
            },

            _drawItems: function() {
                var menu = this._dimensioner.getMenu();
                var item = this._dimensioner.getItem();

                this._context.fillStyle = this._fontColor;
                this._context.font = this._dimensioner.getFontSize() + "px " + this._font;
                this._context.textAlign = "center";
                this._context.textBaseline = "middle";

                var x = menu.width / 2;
                var y = item.height / 2;

                this._selector.getItems().each(function(itemText) {
                    this._context.fillText(itemText, x, y);
                    y += item.height;
                }, this);
            }

        })

    })

});
