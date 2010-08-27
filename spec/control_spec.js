
describe("Control", function() {

    describe("initialize", function() {

        var buttonElement, control;

        beforeEach(function() {
            buttonElement = document.createElement("button");
            buttonElement.setAttribute("id", "test");

            control = new Control(buttonElement, {
                width: 200
            });
        });

        it("should initialize the button element", function() {
            expect(control.getButtonElement().getAttribute("class")).toBe("control");
            expect(control.getButtonElement().getAttribute("style")).toBe("border: 0px; padding: 0px; background: transparent; outline: none;");
        });

        it("should create an canvas element", function() {
            expect(control.getCanvasElement().nodeName).toBe("CANVAS");
        });

        it("should set the defaults", function() {
            expect(control.getHeight()).toBe(100);
        });

        it("should set the options", function() {
            expect(control.getWidth()).toBe(200);
        });

    });

});
