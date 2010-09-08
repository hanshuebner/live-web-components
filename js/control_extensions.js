
var StateChangingMouseHandler = class({

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

var StateChangingKeyHandler = class({

    extends: Optionable,

    OPTION_KEYS: [
        "keyStep"
    ],

    initialize: function(control, options) {
        this._control = control;
        this._control.getButtonElement().onkeydown = this._onKeyDownHandler.bind(this);

        this._super_initialize(this._control.defaults, options);

        this._entering = false;
        this._enteredText = null;
    },

    getEnteredText: function() {
        return this._enteredText;
    },

    abortEntering: function() {
        this._entering = false;
        this._enteredText = null;
        this._control.draw();
    },

    isEntering: function() {
        return !!this._entering;
    },

    _onKeyDownHandler: function(event) {
        switch (event.keyCode) {
        case 8: // backspace
            this._deleteCharacter();
            return false;
        case 13: // enter
            this._enter();
            return false;
        case 37: // left arrow
        case 38: // up arrow
            this._stepUp();
            return false;
        case 39: // right arrow
        case 40: // down arrow
            this._stepDown();
            return false;
        case 48:
        case 49:
        case 50:
        case 51:
        case 52:
        case 53:
        case 54:
        case 55:
        case 56:
        case 57: // digits 0-9
            this._enterCharacter(event.keyCode - 48);
            return false;
        case 109: // substract
        case 189: // "-"
            this._enterCharacter("-");
            return false;
        case 190: // "."
            this._enterCharacter(".");
            return false;
        default:
            return true;
        }
    },

    _stepUp: function() {
        this._control.setState(this._control.getState() + this._keyStep);
    },

    _stepDown: function() {
        this._control.setState(this._control.getState() - this._keyStep);
    },

    _enterCharacter: function(character) {
        if (!this.isEntering()) this._enteredText = "";
        this._entering = true;
        this._enteredText += character;

        this._control.draw();
    },

    _deleteCharacter: function() {
        if (!this.isEntering()) return;
        this._enteredText = this._enteredText.substring(0, Math.max(0, this._enteredText.length - 1));
        this._control.draw();
    },

    _enter: function() {
        this._control.setExternalValue(this._enteredText);
        this._entering = false;
        this._enteredText = null;
    }

});
