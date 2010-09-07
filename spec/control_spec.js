
describe("Control", function() {

    var control;

    beforeEach(function() {
        control = new Control(buttonElement, {
            width: 200,
            externalMapping: {
                toDisplay: function(state) { return Math.round(state / 100.0 * 200.0 - 100.0); },
                fromDisplay: function(display) { return Math.round((display + 100.0) * 100.0 / 200.0); }
            },
            internalMapping: {
                toValue: function(state) { return Math.round(state / 100.0 * 255); },
                fromValue: function(value) { return Math.round(value * 100.0 / 255.0); }
            },
            onchange: function(internalValue, externalValue, state) { }
        });
        control.getStateCount = function() { return 101; };
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

    describe("setExternalValue", function() {

        it("should set the state by using the external mapping function", function() {
            control.setExternalValue(0);
            expect(control.getState()).toBe(50);
        });

        it("should set the state out of range", function() {
            control.setExternalValue(120);
            expect(control.getState()).toBe(100);
        });

        it("should set the state directly if no mapping function is given", function() {
            control.setExternalMapping(null);
            control.setExternalValue(60);
            expect(control.getState()).toBe(60);
        });

    });

    describe("getExternalValue", function() {

        it("should return the external value by passing the state to the external mapping function", function() {
            control.setState(50);
            expect(control.getExternalValue()).toBe(0);
        });

        it("should return the state if no mapping is given", function() {
            control.setExternalMapping(null);
            control.setState(60);
            expect(control.getExternalValue()).toBe(60);
        });

    });

    describe("setInternalValue", function() {

        it("should set the state by using the internal mapping function", function() {
            control.setInternalValue(128);
            expect(control.getState()).toBe(50);
        });

        it("should set the state out of range", function() {
            control.setInternalValue(510);
            expect(control.getState()).toBe(100);
        });

        it("should set the state directly if no mapping function is given", function() {
            control.setInternalMapping(null);
            control.setInternalValue(60);
            expect(control.getState()).toBe(60);
        });

    });

    describe("getInternalValue", function() {

        it("should return the internal value by passing the state to the internal mapping function", function() {
            control.setState(50);
            expect(control.getInternalValue()).toBe(128);
        });

        it("should return the state if no mapping is given", function() {
            control.setInternalMapping(null);
            control.setState(60);
            expect(control.getInternalValue()).toBe(60);
        });

    });

    describe("setState", function() {

        it("should set the state", function() {
            control.setState(80);
            expect(control.getState()).toBe(80);
        });

        it("should not set the state out-of-range", function() {
            control.setState(120);
            expect(control.getState()).toBe(100);
        });

        it("should invoke a draw", function() {
            spyOn(control, "draw");
            control.setState(80);
            expect(control.draw).toHaveBeenCalled();
        });

        it("should trigger a onchange event", function() {
            spyOn(control, "onchange");
            control.setState(80);
            expect(control.onchange).toHaveBeenCalled();
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
