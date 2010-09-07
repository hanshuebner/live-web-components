
var buttonElement = document.createElement("button");

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

var MenuDriver = class({

    initialize: function(menu) {
        this._menu = menu;
    },

    mouseDown: function(offsetY) {
        this._menu.getCanvasElement().onmousedown({ offsetY: offsetY });
    },

    mouseMove: function(offsetY) {
        this._menu.getCanvasElement().onmousemove({ offsetY: offsetY });
    },

    mouseOut: function() {
        this._menu.getCanvasElement().onmouseout();
    }

});
