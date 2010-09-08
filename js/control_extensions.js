
var StateChangeMouseHandler = class({

    extends: Optionable,

    OPTION_KEYS: [
        "mouseScale"
    ],

    initialize: function(control, options) {
        this._control = control;
        this._control.getButtonElement().onmousedown = this._onMouseDownHandler.bind(this);

        this._super_initialize(this._control.defaults, options);
    },

    _onMouseDownHandler: function(event) {
        this._control.getButtonElement().focus();

        this._startY = event.screenY;
        this._startState = this._control.getState();

        document.onmousemove = this._onMouseMoveHandler.bind(this);
        document.onmouseup = this._onMouseUpHandler.bind(this);

        return false;
    },

    _onMouseMoveHandler: function(event) {
        var range = this._control.getHeight() * this._mouseScale;
        var difference = this._startY - event.screenY;
        var stateDifference = Math.round((difference / range) * this._control.getStateCount());

        this._control.setState(this._startState + stateDifference);

        return false;
    },

    _onMouseUpHandler: function() {
        document.onmousemove = null;
        document.onmouseup = null;

        return false;
    }

});
