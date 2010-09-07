
describe("Slider", function() {

    var slider, sliderDriver;

    beforeEach(function() {
        slider = new Slider(buttonElement);
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

    });

});
