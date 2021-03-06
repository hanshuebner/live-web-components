
var TitleBorderDimensioner = generateClass({

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
                    (this._control.hasTitle() ? Math.round(this.getTitle().height * 1.25) : 0)
        }
    },

    getSpace: function() {
        var borderDimension = this.getBorder();
        return {
            width: borderDimension.width - this._style.paddingLeft - this._style.paddingRight,
            height: borderDimension.height - this._style.paddingTop - this._style.paddingBottom
        };
    },

    getTitle: function() {
        return this._control.hasTitle() ? {
            width: this.getTextWidth(this._control.getTitle(), this._style.fontSize),
            height: this.getFontSize()
        } : {
            width: 0,
            height: 0
        };
    },

    getFontSize: function() {
        return parseInt(this._style.fontSize) || 10;
    },

    getFittingFontSize: function(width, height) {
        var fontSize = 1;
        var textWidth = 0;
        do {
            textWidth = this.getMaximalTextWidth(fontSize);
            fontSize++;
        } while(textWidth < width && fontSize < height);
        return fontSize - 1;
    },

    getMaximalTextWidth: function(fontSize) {
        var width = 0;
        var text;
        for (var index = 0; index < this._control.getStateCount(); index++) {
            text = this._control.getExternalValueFor(index);
            width = Math.max(width, this.getTextWidth(text, fontSize));
        }
        return width;
    },

    getTextWidth: function(text, fontSize) {
        this._context.font = fontSize + "px " + this._style.fontFamily;
        return this._context.measureText(text).width;
    }

});

var TitleBorderPositioner = generateClass({

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
               (this._control.hasTitle() ? Math.round(this._dimensioner.getTitle().height * 1.25) : 0)
        };
    },

    getSpace: function() {
        var borderPosition = this.getBorder();
        return {
            x: borderPosition.x + this._style.paddingLeft,
            y: borderPosition.y + this._style.paddingTop
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

var TitleBorderDrawer = generateClass({

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
        this._context.fillStyle = this._getColor("color");
        this._context.font = fontSize + "px " + this._style.fontFamily;
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
        if (!this._style.borderTopWidth) return;
        var borderDimensioner = this._dimensioner.getBorder();
        var borderPosition = this._positioner.getBorder();
        this._context.strokeStyle = this._getColor("borderTopColor");
        this._context.lineWidth = this._style.borderTopWidth;
        this._context.strokeRect(borderPosition.x, borderPosition.y, borderDimensioner.width, borderDimensioner.height);
    },

    _getColor: function(key) {
        return this._control.isDisabled() ? this._style.disabledColor : this._style[key];
    }

});

var StateChangingMouseHandler = generateClass({

    initialize: function(control) {
        this._control = control;
        this._options = this._control.getOptions();
        this._control.getButtonElement().onmousedown = this._onMouseDownHandler.bind(this);
    },

    _onMouseDownHandler: function(event) {
        if (this._control.isDisabled()) return;

        this._control.getButtonElement().focus();

        this._lastX = event.screenX;
        this._lastY = event.screenY;

        document.onmousemove = this._onMouseMoveHandler.bind(this);
        document.onmouseup = this._onMouseUpHandler.bind(this);

        return false;
    },

    _onMouseMoveHandler: function(event) {
        var key = event.shiftKey ? this._options.alternateMouseScale : this._options.mouseScale;
        var differenceX = event.screenX - this._lastX;
        var differenceY = this._lastY - event.screenY;
        var difference = Math.abs(differenceX) > Math.abs(differenceY) ? differenceX : differenceY;
        var range = key * (Math.abs(differenceX) > Math.abs(differenceY) ? this._control.getWidth() : this._control.getHeight());
        var stateDifference = Math.round((difference / range) * this._control.getStateCount());
        var newState = this._control.getState() + stateDifference;

        if (this._control.getState() != newState) {
            this._lastX = event.screenX;
            this._lastY = event.screenY;
        }

        this._control.setState(newState)
            && this._control._triggerOnChange();


        return false;
    },

    _onMouseUpHandler: function() {
        document.onmousemove = null;
        document.onmouseup = null;

        return false;
    }

});

var StateChangingKeyHandler = generateClass({

    initialize: function(control) {
        this._control = control;
        this._options = this._control.getOptions();
        this._control.getButtonElement().onkeydown = this._onKeyDownHandler.bind(this);

        this._entering = false;
        this._enteredText = null;

        this.setDefaultEventFilter();
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

    setEventFilter: function(eventFilter) {
        this._eventFilter = eventFilter;
    },

    getEventFilter: function() {
        return this._eventFilter;
    },

    setDefaultEventFilter: function() {
        this.setEventFilter(function(event) {
            if (event.altKey || event.ctrlKey) return false;

            switch (event.keyCode) {
            case 8: // backspace
            case 13: // enter
            case 37: // left arrow
            case 38: // up arrow
            case 39: // right arrow
            case 40: // down arrow
            case 109: // substract
            case 189: // "-"
                return true;
            default:
                return event.keyCode >= 48 && event.keyCode <= 57;
            }
        });
    },

    _onKeyDownHandler: function(event) {
        if (this._control.isDisabled()) return true;
        if (this._eventFilter && !this._eventFilter(event)) return true;

        switch (event.keyCode) {
        case 8: // backspace
            this._deleteCharacter();
            return false;
        case 13: // enter
            this._enter();
            return false;
        case 38: // up arrow
        case 39: // right arrow
            this._stepUp(event.shiftKey);
            return false;
        case 40: // down arrow
        case 37: // left arrow
            this._stepDown(event.shiftKey);
            return false;
        case 109: // substract
        case 189: // "-"
            this._enterCharacter("-");
            return false;
        default:
            if (event.keyCode >= 48 && event.keyCode <= 90) {
                this._enterCharacter(String.fromCharCode(event.keyCode));
                return false;
            } else {
                return true;
            }
        }
    },

    _stepUp: function(shiftPressed) {
        this._control.setState(this._control.getState() + (shiftPressed ? this._options.alternateKeyStep : this._options.keyStep))
            && this._control._triggerOnChange();
    },

    _stepDown: function(shiftPressed) {
        this._control.setState(this._control.getState() - (shiftPressed ? this._options.alternateKeyStep : this._options.keyStep))
            && this._control._triggerOnChange();
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
        if (!this.isEntering()) return;
        this._control.setExternalValue(this._enteredText);
        this._entering = false;
        this._enteredText = null;
    }

});
