
var buttonElement = document.createElement("button");

beforeEach(function() {
    buttonElement = document.createElement("button");
    buttonElement.setAttribute("id", "test");
});

var ControlDriver = class({

    initialize: function(control) {
        this._control = control;
    },

    mouseDown: function(screenY) {
        this._control.getButtonElement().onmousedown({ screenY: screenY });
    },

    enterKey: function(keyCode) {
        this._control.getButtonElement().onkeydown({ keyCode: keyCode });
    }

});

var SpinnerDriver = class({

    extends: ControlDriver,

    mouseMove: function(screenY) {
        document.onmousemove({ screenY: screenY });
    },

    mouseUp: function() {
        document.onmouseup({ });
    }

});
