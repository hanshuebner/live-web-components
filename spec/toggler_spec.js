
describe("Toggler", function() {

    var toggler, togglerDriver;

    beforeEach(function() {
        toggler = new Toggler(buttonElement);
        toggler.onchange = function() { };
        toggler.setState(0);

        togglerDriver = new ControlDriver(toggler);
    });

    it("should extend Control", function() {
        expect(Toggler.prototype.extendClass).toBe(Control);
    });

    describe("setItems", function() {

        var items;

        beforeEach(function() {
            items = [ "one", "two" ];
        });

        it("should install a external mapping function", function() {
            toggler.setItems(items);
            toggler.setState(1);
            expect(toggler.getExternalValue()).toBe("two")
        });

        it("should invoke a draw", function() {
            spyOn(toggler, "draw");
            toggler.setItems(items);
            expect(toggler.draw).toHaveBeenCalled();
        });

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

    describe("Dimensioner", function() {

        var dimensioner;

        beforeEach(function() {
            dimensioner = toggler._dimensioner;
        });

        describe("getButton", function() {

            it("should return button dimensions", function() {
                expect(dimensioner.getButton().width).toBe(90);
                expect(dimensioner.getButton().height).toBe(30);
            });

        });

        describe("getFontSize", function() {

            it("should return the calculated font size by fitting the text in", function() {
                expect(dimensioner.getFontSize()).toBe(25);
            });

            it("should return the calculated font size by using the control height", function() {
                toggler.setTitle("Test");
                expect(dimensioner.getFontSize()).toBe(11);
            });

            it("should return the given font size", function() {
                dimensioner._style.fontSize = 30;
                expect(dimensioner.getFontSize()).toBe(30);
            });

        });

    });

    describe("Positioner", function() {

        var positioner;

        beforeEach(function() {
            positioner = toggler._positioner;
        });

        describe("getButton", function() {

            it("should return the bar position", function() {
                expect(positioner.getButton().x).toBe(5);
                expect(positioner.getButton().y).toBe(5);
            });

        });

        describe("getState", function() {

            it("should return the text position", function() {
                expect(positioner.getState().x).toBe(50);
                expect(positioner.getState().y).toBe(20);
            });

        });

    });

    describe("MouseHandler", function() {

        describe("_onMouseDownHandler", function() {

            it("should do nothing is control is disabled", function() {
                toggler.setDisabled(true);
                togglerDriver.mouseDown();
                expect(toggler.getState()).toBe(0);
            });

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

            it("should do nothing is control is disabled", function() {
                toggler.setDisabled(true);
                togglerDriver.enterKey(13); // enter
                expect(toggler.getState()).toBe(0);
            });

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
