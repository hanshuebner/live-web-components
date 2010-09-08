
describe("Slider", function() {

    var slider, sliderDriver;

    beforeEach(function() {
        slider = new Slider(buttonElement, {
            stateCount: 101
        });
        sliderDriver = new ControlDriver(slider);
    });

    it("should extend Control", function() {
        expect(Slider.prototype.extends).toBe(Control);
    });

    describe("Dimensioner", function() {

        var dimensioner;

        beforeEach(function() {
            dimensioner = slider._dimensioner;
        });

        describe("getBorder", function() {

            it("should return the border dimensions", function() {
                expect(dimensioner.getBorder().width).toBe(90);
                expect(dimensioner.getBorder().height).toBe(30);
            });

        });

        describe("getBar", function() {

            beforeEach(function() {
                slider.setState(50);
            });

            it("should return the bar dimensions", function() {
                expect(dimensioner.getBar().width).toBe(45);
                expect(dimensioner.getBar().height).toBe(30);
            });

            it("should return the bar dimensions dependend on the state", function() {
                slider.setState(75);
                expect(dimensioner.getBar().width).toBe(67);
                expect(dimensioner.getBar().height).toBe(30);
            });

        });

        describe("getFontSize", function() {

            it("should return the given font size", function() {
                dimensioner.setOptions({ fontSize: 30 });
                expect(dimensioner.getFontSize()).toBe(30);
            });

            it("should return a calculated font size if nothing is given", function() {
                expect(dimensioner.getFontSize()).toBe(26);
            });

        });

    });

    describe("Positioner", function() {

        var positioner;

        beforeEach(function() {
            positioner = slider._positioner;
        });

        describe("getBorder", function() {

            it("should return the border position", function() {
                expect(positioner.getBorder().x).toBe(5);
                expect(positioner.getBorder().y).toBe(5);
            });

        });

        describe("getBar", function() {

            it("should return the bar position", function() {
                expect(positioner.getBar().x).toBe(5);
                expect(positioner.getBar().y).toBe(5);
            });

        });

        describe("getText", function() {

            it("should return the text position", function() {
                expect(positioner.getText().x).toBe(50);
                expect(positioner.getText().y).toBe(20);
            });

        });

    });

});
