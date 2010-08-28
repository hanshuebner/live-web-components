
describe("Spinner", function() {

    var spinner;

    beforeEach(function() {
        spinner = new Spinner(buttonElement);
        spinner.onchange = function() { };
    });

    it("should extend Control", function() {
        expect(Spinner.prototype.extends).toBe(Control);
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
            expect(spinner.setWidth).toHaveBeenCalledWith(333);
        });

        it("should invoke a draw", function() {
            spyOn(spinner, "draw");
            spinner.setSize(444);
            expect(spinner.draw).toHaveBeenCalled();
        });

    });

    describe("blur", function() {

        it("should end value entering", function() {
            spyOn(spinner, "stopEntering");
            spinner.blur();
            expect(spinner.stopEntering).toHaveBeenCalled();
        });

    });

    describe("setFactor", function() {

        it("should not accept out-of-range-values", function() {
            spinner.setFactor(2);
            expect(spinner.getFactor()).not.toBe(2);
        });

        it("should set the factor", function() {
            spinner.setFactor(0.8);
            expect(spinner.getFactor()).toBe(0.8);
        });

        it("should calculate the value", function() {
            spinner.setFactor(0.8);
            expect(spinner.getValue()).toBe(60);
        });

        it("should invoke a draw", function() {
            spyOn(spinner, "draw");
            spinner.setFactor(0.8);
            expect(spinner.draw).toHaveBeenCalled();
        });

        it("should trigger a onchange event", function() {
            spyOn(spinner, "onchange");
            spinner.setFactor(0.8);
            expect(spinner.onchange).toHaveBeenCalled();
        });

    });

    describe("setValue", function() {

        it("should not accept out-of-range-values", function() {
            spinner.setValue(200);
            expect(spinner.getValue()).not.toBe(200);
        });

        it("should set the value", function() {
            spinner.setValue(60);
            expect(spinner.getValue()).toBe(60);
        });

        it("should calculate the factor", function() {
            spinner.setValue(60);
            expect(spinner.getFactor()).toBe(0.8);
        });

        it("should invoke a draw", function() {
            spyOn(spinner, "draw");
            spinner.setValue(60);
            expect(spinner.draw).toHaveBeenCalled();
        });

        it("should trigger a onchange event", function() {
            spyOn(spinner, "onchange");
            spinner.setValue(60);
            expect(spinner.onchange).toHaveBeenCalled();
        });

    });

    describe("startEntering", function() {

        it("should enter the entering-mode", function() {
            spinner.startEntering();
            expect(spinner.isEntering()).toBeTruthy();
        });

    });

    describe("stopEntering", function() {

        it("should leave the entering-mode", function() {
            spinner.stopEntering();
            expect(spinner.isEntering()).toBeFalsy();
        });

        it("should invoke a draw", function() {
            spyOn(spinner, "draw");
            spinner.stopEntering();
            expect(spinner.draw).toHaveBeenCalled();
        });

        it("should trigger a onchange event", function() {
            spyOn(spinner, "onchange");
            spinner.stopEntering();
            expect(spinner.onchange).toHaveBeenCalled();
        });

    });

});
