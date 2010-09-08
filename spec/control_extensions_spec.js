
var control, controlDriver, documentDriver;

beforeEach(function() {
    control = new Control(buttonElement, {
        width: 100,
        height: 100
    });
    control.getStateCount = function() { return 101; };

    controlDriver = new ControlDriver(control);
    documentDriver = new DocumentDriver();
});

describe("StateChangeMouseHandler", function() {

    var mouseHandler;

    beforeEach(function() {
        mouseHandler = new StateChangeMouseHandler(control, {
            mouseScale: 1
        });
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
            documentDriver.mouseMove(25);
            expect(control.getState()).toBe(75);

            documentDriver.mouseMove(-25);
            expect(control.getState()).toBe(25);
        });

        it("should calculate the new state based on the mouseScale", function() {
            mouseHandler.setOptions({ mouseScale: 2 });

            documentDriver.mouseMove(50);
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
