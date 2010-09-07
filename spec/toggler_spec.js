
describe("Toggler", function() {

    var toggler, togglerDriver;

    beforeEach(function() {
        toggler = new Toggler(buttonElement);
        toggler.onchange = function() { };
        toggler.setState(0);

        togglerDriver = new ControlDriver(toggler);
    });

    it("should extend Control", function() {
        expect(Toggler.prototype.extends).toBe(Control);
    });

    describe("getStateCount", function() {

        it("should return two", function() {
            expect(toggler.getStateCount()).toBe(2);
        });

    });

    describe("toggleState", function() {

        it("should alternate the state", function() {
            toggler.toggleState();
            expect(toggler.getState()).toBe(1);
            toggler.toggleState();
            expect(toggler.getState()).toBe(0);
        });

    });

    describe("MouseHandler", function() {

        describe("_onMouseDownHandler", function() {

            it("should set the focus on the control", function() {
                spyOn(toggler.getButtonElement(), "focus")
                togglerDriver.mouseDown();
                expect(toggler.getButtonElement().focus).toHaveBeenCalled();
            });

            it("should toggle the state", function() {
                togglerDriver.mouseDown();
                expect(toggler.getState()).toBe(1);
                togglerDriver.mouseDown();
                expect(toggler.getState()).toBe(0);
            });

        });

    });

    describe("KeyHandler", function() {

        describe("_onKeyDownHandler", function() {

            it("should toggle the state on enter key", function() {
                togglerDriver.enterKey(13); // enter
                expect(toggler.getState()).toBe(1);
                togglerDriver.enterKey(13); // enter
                expect(toggler.getState()).toBe(0);
            });

            it("should not toggle the state on tab key", function() {
                togglerDriver.enterKey(9); // tab
                expect(toggler.getState()).toBe(0);
            });

        });

    });

});
