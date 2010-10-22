
var Control = generateClass({

    defaultOptions: { },
    defaultStyle: { },

    initialize: function(element_or_id, options) {
        this._initializeButtonElement(element_or_id);
        this._createCanvasElement();
        this.setOptions(options);
        this._setStyle();
        this._addButtonElementClass();

        this._controlDrawer = new this.ControlDrawer(this, this.getOptions());
    },

    getButtonElement: function() {
        return this._buttonElement;
    },

    getCanvasElement: function() {
        return this._canvasElement;
    },

    getClass: function() {
        return ""; // has to be implemented
    },

    setOptions: function(options) {
        this._options = options || { };
        this._setDefaultOptions();
        this._callSettersForOptions();
    },

    getOptions: function() {
        return this._options;
    },

    getStyle: function() {
        return this._style;
    },

    setWidth: function(value) {
        this._width = value;
        this._buttonElement.setAttribute("width", this._width + "px");
        this._canvasElement.width = this._width;
        this.draw();
    },

    getWidth: function() {
        return this._width || 0;
    },

    setHeight: function(value) {
        this._height = value;
        this._buttonElement.setAttribute("height", this._height + "px");
        this._canvasElement.height = this._height;
        this.draw();
    },

    getHeight: function() {
        return this._height || 0;
    },

    setDisabled: function(value) {
        this._disabled = value;
        this.draw();
    },

    isDisabled: function() {
        return this._disabled;
    },

    setTitle: function(value) {
        this._title = value;
    },

    getTitle: function() {
        return this._title;
    },

    hasTitle: function() {
        return !!this._title;
    },

    setExternalMapping: function(mapping) {
        this._externalMapping = mapping;
    },

    getExternalMapping: function() {
        return this._externalMapping;
    },

    setInternalMapping: function(mapping) {
        this._internalMapping = mapping;
    },

    getInternalMapping: function() {
        return this._internalMapping;
    },

    setExternalValue: function(value) {
        this.setState(
            this._externalMapping && this._externalMapping.fromDisplay ?
            this._externalMapping.fromDisplay(value) :
            value);
    },

    getExternalValue: function() {
        return this.getExternalValueFor(this.getState());
    },

    getExternalValueFor: function(state) {
        return this._externalMapping && this._externalMapping.toDisplay ?
               this._externalMapping.toDisplay(state) :
               state;
    },

    setInternalValue: function(value) {
        this.setState(this._internalMapping && this._internalMapping.fromValue ?
                      this._internalMapping.fromValue(value) :
                      value);
    },

    getInternalValue: function() {
        return this._internalMapping && this._internalMapping.toValue ?
               this._internalMapping.toValue(this.getState()) :
               this.getState();
    },

    setState: function(value) {
        value = Math.max(0, Math.min(this.getStateCount() - 1, value));
        var changed = this._state != value;
        this._state = value;
        this.draw();
        if (changed) this._triggerOnChange();
    },

    getState: function() {
        return this._state || 0.0;
    },

    getStateCount: function() {
        return 0; // has to be implemented
    },

    focus: function() {
        this._focused = true;
        this.draw();
    },

    blur: function() {
        this._focused = false;
        this.draw();
    },

    hasFocus: function() {
        return this._focused || false;
    },

    draw: function() {
        if (this._controlDrawer) this._controlDrawer.draw();
    },

    _initializeButtonElement: function(element_or_id) {
        element = typeof(element_or_id) === "string" ? document.getElementById(element_or_id) : element_or_id;
        if (element && element.nodeName == "BUTTON") {
            this._buttonElement = element;
            this._buttonElement.onfocus = function() { this.focus(); }.bind(this);
            this._buttonElement.onblur = function() { this.blur(); }.bind(this);
        } else {
            throw("The given id doesn't belong to a button element!");
        }
    },

    _addButtonElementClass: function() {
        this._buttonElement.setAttribute("class", this._buttonElement.getAttribute("class") + " control " + this.getClass());
    },

    _setDefaultOptions: function() {
        for (var key in this.defaultOptions) {
            if (this._options[key] === undefined)
                this._options[key] = this.defaultOptions[key];
        }
    },

    _callSettersForOptions: function() {
        this._callSettersFor(this._options);
    },

    _setStyle: function() {
        this._readStyle();
        this._setDefaultStyle();
        this._callSettersForStyle();
    },

    _readStyle: function() {
        this._style = { };
        var style = window.getComputedStyle(this.getButtonElement());
        for (var index = 0; index < style.length; index++) {
            var key = style[index];
            if (key == "width") {
                var value = style.getPropertyValue(key);
                var camelCaseKey = this._convertStyleKey(key);
                if (value.match(/^\d+px/)) value = parseInt(value);
                this._style[camelCaseKey] = value;
            }
        }
    },

    _setDefaultStyle: function() {
        for (var key in this.defaultStyle) {
            if (this._style[key] === undefined)
                this._style[key] = this.defaultStyle[key];
        }
    },

    _callSettersForStyle: function() {
        this._callSettersFor(this._style);
    },

    _callSettersFor: function(hash) {
        for (var key in hash) {
            var setterName = "set" + key.substring(0, 1).toUpperCase() + key.substring(1);
            if (typeof(this[setterName]) === "function")
                this[setterName](hash[key]);
        }
    },

    _convertStyleKey: function(key) {
        var regexp = /-\w/;
        var result;
        while (result = key.match(regexp)) {
            key = key.replace(result, result.toString().substring(1).toUpperCase());
        }
        return key;
    },

    _createCanvasElement: function() {
        this._canvasElement = document.createElement("canvas");
        this._canvasElement.setAttribute("style", "position: absolute;");
        this._buttonElement.appendChild(this._canvasElement);
    },

    _triggerOnChange: function() {
        if (this.getOptions().onchange)
            this.getOptions().onchange(this.getInternalValue(), this.getExternalValue(), this.getState());
    },

    ControlDrawer: generateClass({

        initialize: function(control, options) {
            this._control = control;
            this._options = options;
            this._context = this._control.getCanvasElement().getContext("2d");

            this.draw();
        },

        draw: function() {
            if (!this._context) return;
            this._clear();
            this._drawFocus();
        },

        _clear: function() {
            this._context.clearRect(0, 0, this._control.getWidth(), this._control.getHeight());
        },

        _drawFocus: function() {
            if (!this._control.hasFocus()) return;

            var width = this._control.getWidth();
            var height = this._control.getHeight();

            var widthLength = width / 8;
            var heightLength = height / 8;

            this._context.lineWidth = 1;
            this._context.lineCap = "round";
            this._context.strokeStyle = this._options.focusColor;
            this._context.beginPath();
            this._context.moveTo(0, 0);
            this._context.lineTo(widthLength, 0);
            this._context.moveTo(width - widthLength, 0);
            this._context.lineTo(width, 0);
            this._context.lineTo(width, heightLength);
            this._context.moveTo(width, height - heightLength);
            this._context.lineTo(width, height);
            this._context.lineTo(width - widthLength, height);
            this._context.moveTo(widthLength, height);
            this._context.lineTo(0, height);
            this._context.lineTo(0, height - heightLength);
            this._context.moveTo(0, heightLength);
            this._context.lineTo(0, 0);
            this._context.stroke();
        }

    })

});
