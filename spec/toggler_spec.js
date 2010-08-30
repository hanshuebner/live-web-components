
describe("Toggler", function() {

    var toggler;

    beforeEach(function() {
        toggler = new Toggler(buttonElement);
        toggler.onchange = function() { };
    });

    it("should extend Control", function() {
        expect(Toggler.prototype.extends).toBe(Control);
    });

});
