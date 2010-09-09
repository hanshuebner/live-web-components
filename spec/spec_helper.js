
var buttonElement = document.createElement("button");

var ControlDriver = generateClass({

    initialize: function(control) {
        this._control = control;
    },

    mouseDown: function(screenX, screenY) {
        this._control.getButtonElement().onmousedown({ screenX: screenX, screenY: screenY });
    },

    enterKey: function(keyCode) {
        this._control.getButtonElement().onkeydown({ keyCode: keyCode });
    }

});

var DocumentDriver = generateClass({

    mouseMove: function(screenX, screenY) {
        document.onmousemove({ screenX: screenX, screenY: screenY });
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
