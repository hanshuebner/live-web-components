
var control, controlDriver, documentDriver;

beforeEach(function() {
    control = new Control(buttonElement, {
        width: 100,
        height: 100,
        mouseScale: 1,
        keyStep: 1
    });
    control.getStateCount = function() { return 101; };

    controlDriver = new ControlDriver(control);
    documentDriver = new DocumentDriver();
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
