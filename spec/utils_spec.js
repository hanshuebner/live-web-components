
describe("class", function() {

    var TestParent, TestOne, TestTwo;

    beforeEach(function() {
        TestParent = class({
            initialize: function() { this.one = this.two = false; },
            funcOne: function() { this.one = true; },
            funcTwo: function() { this.two = true; }
        });
        TestOne = class({
            extends: TestParent,
            initialize: function() { this.initialize.super(); this.three = false; },
            funcTwo: function() { this.funcTwo.super(); this.three = true; }
        });
        TestTwo = class({
            extends: TestParent,
            funcTwo: function() { this.funcTwo.super(); this.three = true; }
        });
    });

    it("should return a constructor function", function() {
        expect(typeof(TestOne)).toBe("function");
    });

    it("should call initialize on construction", function() {
        spyOn(TestOne.prototype, "initialize");
        var test = new TestOne();
        expect(TestOne.prototype.initialize).toHaveBeenCalled();
    });

    it("should inherit the constructor from the parent", function() {
        var test = new TestOne();
        expect(test.one).toBeFalsy();
        expect(test.two).toBeFalsy();
        expect(test.three).toBeFalsy();
    });

    it("should inherit functions from the parent", function() {
        var test = new TestOne();
        expect(typeof(test.funcOne)).toBe("function");

        test.funcOne();
        expect(test.one).toBeTruthy();
    });

    it("should override parent functions", function() {
        var test = new TestOne();
        expect(typeof(test.funcTwo)).toBe("function");

        test.funcTwo();
        expect(test.two).toBeTruthy();
        expect(test.three).toBeTruthy();
    });

    it("should create an independend child class", function() {
        var testOne = new TestOne();
        var testTwo = new TestTwo();

        testOne.funcTwo();

        expect(testOne.two).toBeTruthy();
        expect(testOne.three).toBeTruthy();
        expect(testTwo.two).toBeFalsy();
        expect(testTwo.three).toBeFalsy();
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
