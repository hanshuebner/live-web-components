
var CanvasManager = {

    keys: {
        LEFT:   37,
        UP:     38,
        RIGHT:  39,
        DOWN:   40
    },

    focusedCanvas: null,

    initialize: function() {
        var scope = this;
        document.onkeydown = function(event) {
            scope._onKeyDownHandler.call(scope, event);
        }

        this._selectFirstCanvas();
    },

    focusCanvas: function(canvas) {
        if (!canvas) return;

        if (this.focusedCanvas && this.focusedCanvas.onblur) this.focusedCanvas.onblur();
        this.focusedCanvas = canvas;
        if (this.focusedCanvas && this.focusedCanvas.onfocus) this.focusedCanvas.onfocus();
    },

    _onKeyDownHandler: function(event) {
        switch(event.keyCode) {
        case this.keys.LEFT:
            this._selectPreviousCanvas();
            break;
        case this.keys.RIGHT:
            this._selectNextCanvas();
            break;
        default:
            if (this.focusedCanvas && this.focusedCanvas.onkeydown)
                this.focusedCanvas.onkeydown(event);
            break;
        }
    },

    _selectFirstCanvas: function() {
        var canvas = document.getElementsByTagName("canvas");
        if (canvas.length > 0) this.focusCanvas(canvas[0]);
    },

    _selectPreviousCanvas: function() {
        var found = this._searchCanvas(function(canvas, index) {
            return (index - 1) >= 0 ? canvas[index - 1] : null;
        });
        this.focusCanvas(found);
    },

    _selectNextCanvas: function() {
        var found = this._searchCanvas(function(canvas, index) {
            return (index + 1) < canvas.length ? canvas[index + 1] : null;
        });
        this.focusCanvas(found);
    },

    _searchCanvas: function(selectFunction) {
        var canvas = document.getElementsByTagName("canvas");
        var index = 0;
        var found = null;
        for (index = 0; index < canvas.length; index++) {
            if (canvas[index] == this.focusedCanvas) {
                found = selectFunction.call(this, canvas, index);
                if (found) break;
            }
        }
        return found;
    }

};
