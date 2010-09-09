
var control, controlDriver, documentDriver;

beforeEach(function() {
    Control.prototype.defaultStyle = {
        width: 100,
        height: 100
    }
    control = new Control(buttonElement, {
        mouseScale: 1,
        keyStep: 1,
        title: "Test"
    });
    control.getStateCount = function() { return 101; };
    control._style = {
        font: "sans-serif",
        fontSize: undefined,
        marginTop: 5,
        marginLeft: 5,
        marginBottom: 5,
        marginRight: 5,
        paddingTop: 2,
        paddingLeft: 2,
        paddingBottom: 2,
        paddingRight: 2
    };

    controlDriver = new ControlDriver(control);
    documentDriver = new DocumentDriver();
});

describe("TitleBorderDimensioner", function() {

    var dimensioner;

    beforeEach(function() {
        dimensioner = new TitleBorderDimensioner(control);
    });

    describe("getArea", function() {

        it("should return the area dimension", function() {
            expect(dimensioner.getArea().width).toBe(86);
            expect(dimensioner.getArea().height).toBe(71);
        });

    });

    describe("getBorder", function() {

        it("should return the border dimension", function() {
            expect(dimensioner.getBorder().width).toBe(90);
            expect(dimensioner.getBorder().height).toBe(75);
        });

        it("should return a bigger border if no title is given", function() {
            control.setTitle(null);
            expect(dimensioner.getBorder().width).toBe(90);
            expect(dimensioner.getBorder().height).toBe(90);
        });

    });

    describe("getTitle", function() {

        it("should return the title dimension", function() {
            expect(dimensioner.getTitle().width).toBe(19);
            expect(dimensioner.getTitle().height).toBe(10);
        });

        it("should return null if no title is given", function() {
            control.setTitle(null);
            expect(dimensioner.getTitle().width).toBe(0);
            expect(dimensioner.getTitle().height).toBe(0);
        });

    });

    describe("getFontSize", function() {

        it("should return the given font size", function() {
            dimensioner._style.fontSize = 26;
            expect(dimensioner.getFontSize()).toBe(26);
        });

        it("should return 10 if no font size is given", function() {
            expect(dimensioner.getFontSize()).toBe(10);
        });

    });

    describe("getTextWidth", function() {

        it("should return the width for the given text", function() {
            expect(dimensioner.getTextWidth("test", "sans-serif", 10)).toBe(16);
        });

        it("should return the width for the given text base on the font size", function() {
            expect(dimensioner.getTextWidth("test", "sans-serif", 30)).toBe(48);
        });

    });

});

describe("TitleBorderPositioner", function() {

    var dimensioner, positioner;

    beforeEach(function() {
        dimensioner = new TitleBorderDimensioner(control);
        positioner = new TitleBorderPositioner(control, dimensioner);
    });

    describe("getArea", function() {

        it("should return the area position", function() {
            expect(positioner.getArea().x).toBe(7);
            expect(positioner.getArea().y).toBe(22);
        });

    });

    describe("getBorder", function() {

        it("should return the border position", function() {
            expect(positioner.getBorder().x).toBe(5);
            expect(positioner.getBorder().y).toBe(20);
        });

        it("should return a different position if no title is given", function() {
            control.setTitle(null);
            expect(positioner.getBorder().x).toBe(5);
            expect(positioner.getBorder().y).toBe(5);
        });

    });

    describe("getTitle", function() {

        it("should return the title position", function() {
            expect(positioner.getTitle().x).toBe(50);
            expect(positioner.getTitle().y).toBe(10);
        });

    });

});

describe("StateChangingMouseHandler", function() {

    var mouseHandler;

    beforeEach(function() {
        mouseHandler = new StateChangingMouseHandler(control);
    });

    describe("_onMouseDownHandler", function() {

        it("should move the focus to the current control", function() {
            spyOn(control.getButtonElement(), "focus");
            controlDriver.mouseDown();
            expect(control.getButtonElement().focus).toHaveBeenCalled();
        });

        it("should assign a global mousemove handler", function() {
            controlDriver.mouseDown();
            expect(typeof(document.onmousemove)).toBe("function");
            expect(typeof(document.onmousemove)).toBe("function");
        });

        it("should assign a global mouseup handler", function() {
            controlDriver.mouseDown();
            expect(typeof(document.onmouseup)).toBe("function");
        });

    });

    describe("_onMouseMoveHandler", function() {

        beforeEach(function() {
            control.setState(50);
            controlDriver.mouseDown(0);
        });

        it("should calculate the new state", function() {
            documentDriver.mouseMove(-25);
            expect(control.getState()).toBe(75);

            documentDriver.mouseMove(25);
            expect(control.getState()).toBe(25);
        });

        it("should calculate the new state based on the mouseScale", function() {
            mouseHandler._options.mouseScale = 2;

            documentDriver.mouseMove(-50);
            expect(control.getState()).toBe(75);
        });

    });

    describe("_onMouseUpHandler", function() {

        beforeEach(function() {
            controlDriver.mouseDown();
        });

        it("should unassign the global mousemove handler", function() {
            documentDriver.mouseUp();
            expect(document.onmousemove).toBe(null);
        });

        it("should assign a global mouseup handler", function() {
            documentDriver.mouseUp();
            expect(document.onmouseup).toBe(null);
        });

    });

});

describe("StateChagingKeyHandler", function() {

    var keyHandler;

    beforeEach(function() {
        keyHandler = new StateChangingKeyHandler(control);
    });

    describe("_onKeyDownHandler", function() {

        beforeEach(function() {
            control.setState(50);
            control.setExternalMapping({
                toDisplay: function(state) { return state; },
                fromDisplay: function(display) { return parseInt(display); }
            });
        });

        it("should add a keyStep if up arrow is pressed", function() {
            var oldState = control.getState();
            controlDriver.enterKey(38); // up arrow
            expect(control.getState()).toBe(oldState + 1);
        });

        it("should substract a keyStep if down arrow is pressed", function() {
            var oldState = control.getState();
            controlDriver.enterKey(40); // down arrow
            expect(control.getState()).toBe(oldState - 1);
        });

        it("should go into entering-mode if a digit is pressed", function() {
            controlDriver.enterKey(49); // "1"
            expect(keyHandler.isEntering()).toBeTruthy();
        });

        it("should not go into entering-mode if no fromDisplay mapping is given", function() {
            control.setExternalMapping({
                toDisplay: function(state) { return state; }
            });
            controlDriver.enterKey(49); // "1"
            expect(keyHandler.isEntering()).toBeFalsy();
        });

        it("should leave the entering-mode and commit the new value if enter is pressed", function() {
            controlDriver.enterKey(49); // "1"
            controlDriver.enterKey(13); // enter
            expect(keyHandler.isEntering()).toBeFalsy();
            expect(control.getExternalValue()).toBe(1);
        });

        it("should accept negative values", function() {
            control.setExternalMapping({
                toDisplay: function(state) { return state - 50; },
                fromDisplay: function(display) { return parseInt(display) + 50 }
            });
            controlDriver.enterKey(189); // "-"
            controlDriver.enterKey(49);  // "1"
            controlDriver.enterKey(13);  // enter
            expect(keyHandler.isEntering()).toBeFalsy();
            expect(control.getExternalValue()).toBe(-1);
        });

    });

});