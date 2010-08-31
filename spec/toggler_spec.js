
describe("Toggler", function() {

    var toggler, togglerDriver;

    beforeEach(function() {
        toggler = new Toggler(buttonElement);
        toggler.onchange = function() { };
        toggler.setOn(false);

        togglerDriver = new ControlDriver(toggler);
    });

    it("should extend Control", function() {
        expect(Toggler.prototype.extends).toBe(Control);
    });

    describe("setOn", function() {

        it("should set the state", function() {
            toggler.setOn(true);
            expect(toggler.isOn()).toBeTruthy();
        });

        it("should invoke a draw on changing state", function() {
            spyOn(toggler, "draw");
            toggler.setOn(true);
            expect(toggler.draw).toHaveBeenCalled();
        });

        it("should not invoke a draw on not-changing state", function() {
            spyOn(toggler, "draw");
            toggler.setOn(false);
            expect(toggler.draw).not.toHaveBeenCalled();
        });

        it("should trigger a change event on changing state", function() {
            spyOn(toggler, "onchange");
            toggler.setOn(true);
            expect(toggler.onchange).toHaveBeenCalled();
        });

        it("should not trigger a change event on not-changing state", function() {
            spyOn(toggler, "onchange");
            toggler.setOn(false);
            expect(toggler.onchange).not.toHaveBeenCalled();
        });

    });

    describe("toggleOn", function() {

        it("should alternate the state", function() {
            toggler.toggleOn();
            expect(toggler.isOn()).toBeTruthy();
            toggler.toggleOn();
            expect(toggler.isOn()).toBeFalsy();
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
                expect(toggler.isOn()).toBeTruthy();
                togglerDriver.mouseDown();
                expect(toggler.isOn()).toBeFalsy();
            });

        });

    });

    describe("KeyHandler", function() {

        describe("_onKeyDownHandler", function() {

            it("should toggle the state on enter key", function() {
                togglerDriver.enterKey(13); // enter
                expect(toggler.isOn()).toBeTruthy();
                togglerDriver.enterKey(13); // enter
                expect(toggler.isOn()).toBeFalsy();
            });

            it("should not toggle the state on tab key", function() {
                togglerDriver.enterKey(9); // tab
                expect(toggler.isOn()).toBeFalsy();
            });

        });

    });

});
