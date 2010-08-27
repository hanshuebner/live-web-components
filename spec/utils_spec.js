
describe("class", function() {

    var TestParent, Test;

    beforeEach(function() {
        TestParent = class({
            funcOne: function() { this.one = true; },
            funcTwo: function() { this.two = true; }
        });
        Test = class({
            extends: TestParent,
            initialize: function() { this.one = this.two = this.three = false; },
            funcTwo: function() { this.funcTwo.super(); this.three = true; }
        });
    });

    it("should return a constructor function", function() {
        expect(typeof(Test)).toBe("function");
    });

    it("should call initialize on construction", function() {
        spyOn(Test.prototype, "initialize");

        var test = new Test();

        expect(Test.prototype.initialize).toHaveBeenCalled();
    });

    it("should inherit functions from the parent", function() {
        var test = new Test();
        expect(typeof(test.funcOne)).toBe("function");

        test.funcOne();
        expect(test.one).toBeTruthy();
    });

    it("should override parent functions", function() {
        var test = new Test();
        expect(typeof(test.funcTwo)).toBe("function");

        test.funcTwo();
        expect(test.two).toBeTruthy();
        expect(test.three).toBeTruthy();
    });

});

describe("bind", function() {

    var func;

    beforeEach(function() {
        func = function() {
            this.test = true;
        };
    });

    it("should set the function's context", function() {
        var context = {
            test: false
        };

        func = func.bind(context);
        func();

        expect(context.test).toBeTruthy();
    });

});

describe("each", function() {

    var array;

    beforeEach(function() {
        array = [ 1, 2 ];
    });

    it("should call the given function with each element", function() {
        var obj = {
            func: function(element) { }
        };

        spyOn(obj, "func");

        array.each(obj.func);

        expect(obj.func).toHaveBeenCalledWith(1);
        expect(obj.func).toHaveBeenCalledWith(2);
    });

});
