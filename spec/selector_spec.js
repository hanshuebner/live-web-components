
describe("Selector", function() {

    var selector;

    beforeEach(function() {
        selector = new Selector(buttonElement, {
            items: [ "one", "two", "three" ]
        });
        selector.onchange = function() { };
    });

    it("should extend Control", function() {
        expect(Selector.prototype.extends).toBe(Control);
    });

    describe("setItems", function() {

        it("should set the items", function() {
            var items = [ "one", "two" ];
            selector.setItems(items);
            expect(selector.getItems()).toBe(items);
        });

        it("should invoke a draw", function() {
            spyOn(selector, "draw");
            selector.setItems([ "one", "two" ]);
            expect(selector.draw).toHaveBeenCalled();
        });

    });

    describe("Dimensioner", function() {

        var dimensioner;

        beforeEach(function() {
            dimensioner = new selector.Dimensioner(selector);
        });

        describe("getMinimalWidth", function() {

            it("should calculate the minimal width", function() {
                expect(dimensioner.getMinimalWidth()).toBe(21);
                selector.setItems([ "one", "two", "three", "long long entry" ]);
                expect(dimensioner.getMinimalWidth()).toBe(61);
            });

        });

        describe("getMenuHeight", function() {

            it("should calculate the menu height", function() {
                expect(dimensioner.getMenuHeight()).toBe(90);
                selector.setItems([ "one", "two", "three", "long long entry" ]);
                expect(dimensioner.getMenuHeight()).toBe(120);
            });

        });

    });

});
