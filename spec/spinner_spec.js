
describe("Spinner", function() {

    var spinner, spinnerDriver;

    beforeEach(function() {
        spinner = new Spinner(buttonElement);
        spinner.onchange = function() { };

        spinnerDriver = new SpinnerDriver(spinner);
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
            spyOn(spinner, "abortEntering");
            spinner.blur();
            expect(spinner.abortEntering).toHaveBeenCalled();
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

    describe("MouseHandler", function() {

        describe("_onMouseDownHandler", function() {

            it("should move the focus to the current control", function() {
                spyOn(spinner.getButtonElement(), "focus");
                spinnerDriver.mouseDown();
                expect(spinner.getButtonElement().focus).toHaveBeenCalled();
            });

            it("should assign a global mousemove handler", function() {
                spinnerDriver.mouseDown();
                expect(typeof(document.onmousemove)).toBe("function");
                expect(typeof(document.onmousemove)).toBe("function");
            });

            it("should assign a global mouseup handler", function() {
                spinnerDriver.mouseDown();
                expect(typeof(document.onmouseup)).toBe("function");
            });

        });

        describe("_onMouseMoveHandler", function() {

            beforeEach(function() {
                spinner.setFactor(0.5);
                spinnerDriver.mouseDown(0);
            });

            it("should calculate the new factor", function() {
                spinnerDriver.mouseMove(25);
                expect(spinner.getFactor()).toBe(0.75);

                spinnerDriver.mouseMove(-25);
                expect(spinner.getFactor()).toBe(0.25);
            });

            it("should calculate the new factor based on the mouseScale", function() {
                spinner._mouseHandler.setOptions({ mouseScale: 2 });

                spinnerDriver.mouseMove(50);
                expect(spinner.getFactor()).toBe(0.75);
            });

        });

        describe("_onMouseUpHandler", function() {

            beforeEach(function() {
                spinnerDriver.mouseDown();
            });

            it("should unassign the global mousemove handler", function() {
                spinnerDriver.mouseUp();
                expect(document.onmousemove).toBe(null);
            });

            it("should assign a global mouseup handler", function() {
                spinnerDriver.mouseUp();
                expect(document.onmouseup).toBe(null);
            });

        });

    });

    describe("KeyHandler", function() {

        describe("_onKeyDownHandler", function() {

            beforeEach(function() {
                spinner._keyHandler.setOptions({ keyStep: 5.0 });
            });

            it("should add a keyStep if up arrow is pressed", function() {
                var oldValue = spinner.getValue();
                spinnerDriver.enterKey(38); // up arrow
                expect(spinner.getValue() - oldValue).toBe(5);
            });

            it("should substract a keyStep if down arrow is pressed", function() {
                var oldValue = spinner.getValue();
                spinnerDriver.enterKey(40); // down arrow
                expect(spinner.getValue() - oldValue).toBe(-5);
            });

            it("should go into the entering-mode if a digit is pressed", function() {
                spinnerDriver.enterKey(49); // "1"
                expect(spinner.isEntering()).toBeTruthy();
            });

            it("should leave the entering-mode and commit the new value if enter is pressed", function() {
                spinnerDriver.enterKey(49); // "1"
                spinnerDriver.enterKey(13); // enter
                expect(spinner.isEntering()).toBeFalsy();
                expect(spinner.getValue()).toBe(1);
            });

            it("should accept negative values", function() {
                spinnerDriver.enterKey(189); // "-"
                spinnerDriver.enterKey(49);  // "1"
                spinnerDriver.enterKey(13);  // enter
                expect(spinner.isEntering()).toBeFalsy();
                expect(spinner.getValue()).toBe(-1);
            });

        });

    });

});
