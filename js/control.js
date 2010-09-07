
var Control = class({

    defaults: { },

    initialize: function(element_or_id, options) {
        this._initializeButtonElement(element_or_id);
        this._createCanvasElement();

        this._controlDrawer = new this.ControlDrawer(this, options);

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

        if (options.state) this.setState(options.state);
        if (options.externalMapping) this.setExternalMapping(options.externalMapping);
        if (options.internalMapping) this.setInternalMapping(options.internalMapping);

        if (options.onchange) this.onchange = options.onchange;
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

    setWidth: function(value) {
        this._width = value;
        this._buttonElement.setAttribute("width", this._width + "px");
        this._canvasElement.width = this._width;
        this.draw();
    },

    getWidth: function() {
        return this._width || 0;
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
        return 0;
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
    },

    _triggerOnChange: function() {
        if (this.onchange) this.onchange(this.getInternalValue(), this.getExternalValue(), this.getState());
    },

    ControlDrawer: class({

        extends: Optionable,

        OPTION_KEYS: [
            "focusColor"
        ],

        initialize: function(control, options) {
            this._control = control;
            this._context = this._control.getCanvasElement().getContext("2d");

            this._super_initialize(this._control.defaults, options);

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
            this._context.strokeStyle = this._focusColor;
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
