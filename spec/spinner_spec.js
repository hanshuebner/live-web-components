
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
            spyOn(spinner, "abortEntering");
            spinner.blur();
            expect(spinner.abortEntering).toHaveBeenCalled();
        });

    });

    describe("setState", function() {

        it("should set the state", function() {
            spinner.setState(60);
            expect(spinner.getState()).toBe(60);
        });

        it("should abort entering", function() {
            spinnerDriver.enterKey(49) // "1"
            expect(spinner.isEntering()).toBeTruthy();
            spinner.setState(0.8);
            expect(spinner.isEntering()).toBeFalsy();
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
                spinner.setState(50);
                spinnerDriver.mouseDown(0);
            });

            it("should calculate the new state", function() {
                spinnerDriver.mouseMove(25);
                expect(spinner.getState()).toBe(75);

                spinnerDriver.mouseMove(-25);
                expect(spinner.getState()).toBe(25);
            });

            it("should calculate the new state based on the mouseScale", function() {
                spinner._mouseHandler.setOptions({ mouseScale: 2 });

                spinnerDriver.mouseMove(50);
                expect(spinner.getState()).toBe(75);
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
                spinner.setState(50);
            });

            it("should add a keyStep if up arrow is pressed", function() {
                var oldState = spinner.getState();
                spinnerDriver.enterKey(38); // up arrow
                expect(spinner.getState()).toBe(oldState + 1);
            });

            it("should substract a keyStep if down arrow is pressed", function() {
                var oldState = spinner.getState();
                spinnerDriver.enterKey(40); // down arrow
                expect(spinner.getState()).toBe(oldState - 1);
            });

            it("should go into the entering-mode if a digit is pressed", function() {
                spinnerDriver.enterKey(49); // "1"
                expect(spinner.isEntering()).toBeTruthy();
            });

            it("should leave the entering-mode and commit the new value if enter is pressed", function() {
                spinnerDriver.enterKey(49); // "1"
                spinnerDriver.enterKey(13); // enter
                expect(spinner.isEntering()).toBeFalsy();
                expect(spinner.getExternalValue()).toBe(1);
            });

            it("should accept negative values", function() {
                spinner.setExternalMapping({
                    toDisplay: function(state) { return state - 50; },
                    fromDisplay: function(display) { return display + 50 }
                });
                spinnerDriver.enterKey(189); // "-"
                spinnerDriver.enterKey(49);  // "1"
                spinnerDriver.enterKey(13);  // enter
                expect(spinner.isEntering()).toBeFalsy();
                expect(spinner.getExternalValue()).toBe(-1);
            });

        });

    });

});
