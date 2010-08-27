
describe("Spinner", function() {

    var spinner;

    beforeEach(function() {
        spinner = new Spinner(buttonElement);
    });

    it("should extend Control", function() {
        expect(Spinner.prototype.extends).toBe(Control);
    });

});
