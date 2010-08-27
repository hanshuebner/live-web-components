
var Control = class({

    defaults: {
        height: 100,
        width: 100
    },

    initialize: function(element_or_id, options) {
        this._initializeButtonElement(
            typeof(element_or_id) === "string" ? document.getElementById(element_or_id) : element_or_id);

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
        if (options.height) this.setHeight(options.height);
        if (options.width) this.setWidth(options.width);
    },

    setHeight: function(value) {
        this._height = value;
    },

    getHeight: function() {
        return this._height;
    },

    setWidth: function(value) {
        this._width = value;
    },

    getWidth: function() {
        return this._width;
    },

    _initializeButtonElement: function(element) {
        if (element && element.nodeName == "BUTTON") {
            this._buttonElement = element;
            this._buttonElement.setAttribute("class", "control");
            this._buttonElement.setAttribute("style", "border: 0px; padding: 0px; background: transparent; outline: none;");

            this._createCanvasElement();
        } else {
            throw("The given id doesn't belong to a button element!");
        }
    },

    _createCanvasElement: function() {
        this._canvasElement = document.createElement("canvas");
        this._buttonElement.appendChild(this._canvasElement);
    }

});
