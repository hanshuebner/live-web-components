
var Control = class({

    defaults: {
        height: 100,
        width: 100
    },

    initialize: function(element_or_id, options) {
        this._initializeButtonElement(element_or_id);
        this._createCanvasElement();

        this.setDefaults();
        this.setOptions(options);
    },

    getButtonElement: function() {
        return this._buttonElement;
    },

    getCanvasElement: function() {
        return this._canvasElement;
    },

    setDefaults: function() {
        this.setOptions(this.defaults)
    },

    setOptions: function(options) {
        options = options || { };

        if (options.height) this.setHeight(options.height);
        if (options.width) this.setWidth(options.width);
    },

    setHeight: function(value) {
        this._height = value;
        this._buttonElement.setAttribute("height", this._height + "px");
        this._canvasElement.height = this._height;
        this.draw();
    },

    getHeight: function() {
        return this._height;
    },

    setWidth: function(value) {
        this._width = value;
        this._buttonElement.setAttribute("width", this._width + "px");
        this._canvasElement.width = this._width;
        this.draw();
    },

    getWidth: function() {
        return this._width;
    },

    focus: function() {
        this._focused = true;
        this.draw();
        // printLine("focus " + this._buttonElement.id);
    },

    blur: function() {
        this._focused = false;
        this.draw();
        // printLine("blur " + this._buttonElement.id);
    },

    hasFocus: function() {
        return this._focused || false;
    },

    draw: function() {
        // has to be implemented
    },

    _initializeButtonElement: function(element_or_id) {
        element = typeof(element_or_id) === "string" ? document.getElementById(element_or_id) : element_or_id;
        if (element && element.nodeName == "BUTTON") {
            this._buttonElement = element;
            this._buttonElement.setAttribute("class", "control");
            this._buttonElement.setAttribute("style", "border: 0px; padding: 0px; background: transparent; outline: none;");
            this._buttonElement.onfocus = function() { this.focus(); }.bind(this);
            this._buttonElement.onblur = function() { this.blur(); }.bind(this);
        } else {
            throw("The given id doesn't belong to a button element!");
        }
    },

    _createCanvasElement: function() {
        this._canvasElement = document.createElement("canvas");
        this._buttonElement.appendChild(this._canvasElement);
    }

});
