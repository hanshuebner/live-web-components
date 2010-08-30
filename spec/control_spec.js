
describe("Control", function() {

    var control;

    beforeEach(function() {
        control = new Control(buttonElement, {
            width: 200
        });
    });

    describe("initialize", function() {

        it("should initialize the button element", function() {
            expect(control.getButtonElement().getAttribute("class")).toBe("control");
            expect(control.getButtonElement().getAttribute("style")).toBe("border: 0px; padding: 0px; background: transparent; outline: none;");
        });

        it("should create an canvas element", function() {
            expect(control.getCanvasElement().nodeName).toBe("CANVAS");
        });

        it("should set the options", function() {
            expect(control.getWidth()).toBe(200);
        });

    });

    describe("setHeight", function() {

        it("should set the height", function() {
            control.setHeight(111);
            expect(control.getHeight()).toBe(111);
        });

        it("should set the height of the button element", function() {
            control.setHeight(222);
            expect(control.getButtonElement().getAttribute("height")).toBe("222px");
        });

        it("should set the height of the canvas element", function() {
            control.setHeight(333);
            expect(control.getCanvasElement().height).toBe(333);
        });

        it("should invoke a draw", function() {
            spyOn(control, "draw");
            control.setHeight(444);
            expect(control.draw).toHaveBeenCalled();
        });

    });

    describe("setWidth", function() {

        it("should set the width", function() {
            control.setWidth(111);
            expect(control.getWidth()).toBe(111);
        });

        it("should set the width of the button element", function() {
            control.setWidth(222);
            expect(control.getButtonElement().getAttribute("width")).toBe("222px");
        });

        it("should set the width of the canvas element", function() {
            control.setWidth(333);
            expect(control.getCanvasElement().width).toBe(333);
        });

        it("should invoke a draw", function() {
            spyOn(control, "draw");
            control.setWidth(444);
            expect(control.draw).toHaveBeenCalled();
        });

    });

    describe("focus", function() {

        it("should set the focus", function() {
            control.focus();
            expect(control.hasFocus()).toBeTruthy();
        });

        it("should invoke a draw", function() {
            spyOn(control, "draw");
            control.focus();
            expect(control.draw).toHaveBeenCalled();
        });

    });

    describe("blur", function() {

        it("should clear the focus", function() {
            control.blur();
            expect(control.hasFocus()).toBeFalsy();
        });

        it("should invoke a draw", function() {
            spyOn(control, "draw");
            control.blur();
            expect(control.draw).toHaveBeenCalled();
        });

    });

});
