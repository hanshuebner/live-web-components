
describe("Spinner", function() {

    var spinner, spinnerDriver;

    beforeEach(function() {
        spinner = new Spinner(buttonElement, {
            externalMapping: {
                toDisplay: function(state) { return state; },
                fromDisplay: function(display) { return parseInt(display); }
            }
        });
        spinner.onchange = function() { };

        spinnerDriver = new ControlDriver(spinner);
    });

    it("should extend Control", function() {
        expect(Spinner.prototype.extends).toBe(Control);
    });

    describe("setTitle", function() {

        it("should set the title", function() {
            spinner.setTitle("test");
            expect(spinner.getTitle()).toBe("test");
        });

        it("should invoke a draw", function() {
            spyOn(spinner, "draw");
            spinner.setTitle("test");
            expect(spinner.draw).toHaveBeenCalled();
        });

    });

    describe("setSize", function() {

        it("should set the size", function() {
            spinner.setSize(111);
            expect(spinner.getSize()).toBe(111);
        });

        it("should set the height", function() {
            spyOn(spinner, "setHeight");
            spinner.setSize(222);
            expect(spinner.setHeight).toHaveBeenCalledWith(222);
        });

        it("should set the width", function() {
            spyOn(spinner, "setWidth");
            spinner.setSize(333);
            expect(spinner.setWidth).toHaveBeenCalledWith(166.5);
        });

        it("should invoke a draw", function() {
            spyOn(spinner, "draw");
            spinner.setSize(444);
            expect(spinner.draw).toHaveBeenCalled();
        });

    });

    describe("blur", function() {

        it("should end value entering", function() {
            spyOn(spinner._keyHandler, "abortEntering");
            spinner.blur();
            expect(spinner._keyHandler.abortEntering).toHaveBeenCalled();
        });

    });

    describe("setState", function() {

        it("should set the state", function() {
            spinner.setState(60);
            expect(spinner.getState()).toBe(60);
        });

        it("should abort entering", function() {
            spinnerDriver.enterKey(49) // "1"
            expect(spinner._keyHandler.isEntering()).toBeTruthy();
            spinner.setState(0.8);
            expect(spinner._keyHandler.isEntering()).toBeFalsy();
        });

    });

});
