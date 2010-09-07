
describe("Slider", function() {

    var slider, sliderDriver;

    beforeEach(function() {
        slider = new Slider(buttonElement);
        sliderDriver = new ControlDriver(slider);
    });

    it("should extend Control", function() {
        expect(Slider.prototype.extends).toBe(Control);
    });

    describe("", function() {



    });

});
