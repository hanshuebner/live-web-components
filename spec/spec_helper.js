
var buttonElement = document.createElement("button");

var ControlDriver = generateClass({

    initialize: function(control) {
        this._control = control;
    },

    mouseDown: function(screenX, screenY) {
        this._control.getButtonElement().onmousedown({ screenX: screenX, screenY: screenY });
    },

    enterKey: function(keyCode, shiftPressed) {
        this._control.getButtonElement().onkeydown({ keyCode: keyCode, shiftKey: shiftPressed });
    }

});

var DocumentDriver = generateClass({

    mouseMove: function(screenX, screenY, shiftPressed) {
        document.onmousemove({ screenX: screenX, screenY: screenY, shiftKey: shiftPressed });
    },

    mouseUp: function() {
        document.onmouseup({ });
    }

});

var MenuDriver = generateClass({

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
