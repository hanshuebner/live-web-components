
describe("Slider", function() {

    var slider, sliderDriver;

    beforeEach(function() {
        slider = new Slider(buttonElement, {
            height: 40,
            stateCount: 101
        }, {
            width: 100,
            height: 40,
            marginTop: 5,
            marginLeft: 5,
            marginBottom: 5,
            marginRight: 5,
            borderTopWidth: 2,
            paddingTop: 2,
            paddingLeft: 2,
            paddingBottom: 2,
            paddingRight: 2
        });
        sliderDriver = new ControlDriver(slider);
    });

    it("should extend Control", function() {
        expect(Slider.prototype.extendClass).toBe(Control);
    });

    describe("Dimensioner", function() {

        var dimensioner;

        beforeEach(function() {
            dimensioner = slider._dimensioner;
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
                dimensioner._style.fontSize = 30;
                expect(dimensioner.getFontSize()).toBe(30);
            });

            it("should return a calculated font size if nothing is given", function() {
                expect(dimensioner.getFontSize()).toBe(25);
            });

        });

    });

    describe("Positioner", function() {

        var positioner;

        beforeEach(function() {
            positioner = slider._positioner;
        });

        describe("getBar", function() {

            it("should return the bar position", function() {
                expect(positioner.getBar().x).toBe(5);
                expect(positioner.getBar().y).toBe(5);
            });

        });

        describe("getState", function() {

            it("should return the text position", function() {
                expect(positioner.getState().x).toBe(50);
                expect(positioner.getState().y).toBe(20);
            });

        });

    });

});
