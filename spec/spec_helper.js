
var buttonElement = document.createElement("button");

beforeEach(function() {
    buttonElement = document.createElement("button");
    buttonElement.setAttribute("id", "test");
});

var SpinnerDriver = class({

    initialize: function(spinner) {
        this._spinner = spinner;
    },

    mouseDown: function(screenY) {
        this._spinner.getButtonElement().onmousedown({ screenY: screenY });
    },

    mouseMove: function(screenY) {
        document.onmousemove({ screenY: screenY });
    },

    mouseUp: function() {
        document.onmouseup({ });
    },

    enterKey: function(keyCode) {
        this._spinner.getButtonElement().onkeydown({ keyCode: keyCode });
    }

});
