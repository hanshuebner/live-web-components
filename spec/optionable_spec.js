
describe("Optionable", function() {

    var optionable;

    beforeEach(function() {
        Optionable.prototype.OPTION_KEYS = [ "test" ];
        optionable = new Optionable({ test: 5 }, { });
    });

    describe("initialize", function() {

        it("should set the defaults", function() {
            expect(optionable._test).toBe(5);
        });

        it("should set the options", function() {
            optionable = new Optionable({ test: 5 }, { test: 10 });
            expect(optionable._test).toBe(10);
        });

    });

    describe("setDefaults", function() {

        it("should set the defaults", function() {
            optionable._test = 7;
            optionable.setDefaults();
            expect(optionable._test).toBe(5);
        });

    });

    describe("setOptions", function() {

        it("should set the options", function() {
            optionable.setOptions({ test: 8 });
            expect(optionable._test).toBe(8);
        });

    });

});
