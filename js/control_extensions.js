
var TitleBorderDimensioner = class({

    initialize: function(control) {
        this._control = control;
        this._style = this._control.getStyle();
        this._context = this._control.getCanvasElement().getContext("2d");
    },

    getArea: function() {
        var borderDimension = this.getBorder();
        return {
            width: borderDimension.width - this._style.paddingLeft - this._style.paddingRight,
            height: borderDimension.height - this._style.paddingTop - this._style.paddingBottom
        };
    },

    getBorder: function() {
        return {
            width: this._control.getWidth() - this._style.marginLeft - this._style.marginRight,
            height: this._control.getHeight() -
                    this._style.marginTop - this._style.marginBottom -
                    (this._control.hasTitle() ? this.getTitle().height + this._style.marginTop : 0)
        }
    },

    getTitle: function() {
        return this._control.hasTitle() ? {
            width: this.getTextWidth(this._control.getTitle(), this._style.font, this._style.fontSize),
            height: this.getFontSize()
        } : {
            width: 0,
            height: 0
        }
    },

    getFontSize: function() {
        return this._style.fontSize || 10;
    },

    getTextWidth: function(text, font, fontSize) {
        this._context.font = fontSize + "px " + font;
        return this._context.measureText(text).width;
    }

});

var TitleBorderPositioner = class({

    initialize: function(control, dimensioner) {
        this._control = control;
        this._dimensioner = dimensioner;
        this._style = this._control.getStyle();
    },

    getArea: function() {
        var borderPosition = this.getBorder();
        return {
            x: borderPosition.x + this._style.paddingLeft,
            y: borderPosition.y + this._style.paddingTop
        };
    },

    getBorder: function() {
        return {
            x: this._style.marginLeft,
            y: this._style.marginTop +
               (this._control.hasTitle() ? this._dimensioner.getTitle().height + this._style.marginTop : 0)
        };
    },

    getTitle: function() {
        var titleDimension = this._dimensioner.getTitle();
        return {
            x: Math.round(this._control.getWidth() / 2),
            y: Math.round(this._style.marginTop + titleDimension.height / 2)
        };
    }

});

var TitleBorderDrawer = class({

    initialize: function(control, dimensioner, positioner) {
        this._control = control;
        this._dimensioner = dimensioner;
        this._positioner = positioner;
        this._style = this._control.getStyle();
        this._context = this._control.getCanvasElement().getContext("2d");
        this.draw();
    },

    draw: function() {
        // has be implemented
    },

    _drawTitle: function() {
        if (!this._control.hasTitle()) return;

        var fontSize = this._dimensioner.getFontSize();
        var titlePosition = this._positioner.getTitle();
        this._context.fillStyle = this._style.fontColor;
        this._context.font = fontSize + "px " + this._style.font;
        this._context.textBaseline = "middle";
        this._context.textAlign = "center";
        this._context.fillText(this._control.getTitle(), titlePosition.x, titlePosition.y);
    },

    _drawBackground: function() {
        var borderDimensioner = this._dimensioner.getBorder();
        var borderPosition = this._positioner.getBorder();
        this._context.fillStyle = this._style.backgroundColor;
        this._context.fillRect(borderPosition.x, borderPosition.y, borderDimensioner.width, borderDimensioner.height);
    },

    _drawBorder: function() {
        var borderDimensioner = this._dimensioner.getBorder();
        var borderPosition = this._positioner.getBorder();
        this._context.strokeStyle = this._style.borderColor;
        this._context.lineWidth = this._style.borderTopWidth;
        this._context.strokeRect(borderPosition.x, borderPosition.y, borderDimensioner.width, borderDimensioner.height);
    }

});

var StateChangingMouseHandler = class({

    initialize: function(control) {
        this._control = control;
        this._options = this._control.getOptions();
        this._control.getButtonElement().onmousedown = this._onMouseDownHandler.bind(this);
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
        var range = this._control.getHeight() * this._options.mouseScale;
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

    initialize: function(control) {
        this._control = control;
        this._options = this._control.getOptions();
        this._control.getButtonElement().onkeydown = this._onKeyDownHandler.bind(this);

        this._entering = false;
        this._enteredText = null;
    },

    isEnteringEnabled: function() {
        return this._control.getExternalMapping() && this._control.getExternalMapping().fromDisplay;
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
        this._control.setState(this._control.getState() + this._options.keyStep);
    },

    _stepDown: function() {
        this._control.setState(this._control.getState() - this._options.keyStep);
    },

    _enterCharacter: function(character) {
        if (!this.isEnteringEnabled()) return;
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
