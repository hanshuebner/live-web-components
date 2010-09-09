
describe("generateClass", function() {

    var TestParent, TestOne, TestTwo;

    beforeEach(function() {
        TestParent = generateClass({
            initialize: function(value) {
                this.one = this.two = value;
            },
            funcOne: function() {
                this.one = true;
            },
            funcTwo: function() {
                this.two = true;
            }
        });
        TestOne = generateClass({
            extendClass: TestParent,
            initialize: function(value) {
                this._super_initialize(value);
                this.three = value;
            },
            funcTwo: function() {
                this._super_funcTwo();
                this.three = true;
            }
        });
        TestTwo = generateClass({
            extendClass: TestParent,
            funcTwo: function() {
                this._super_funcTwo();
                this.three = true;
            }
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
        var test = new TestOne(false);
        expect(test.one).toBe(false);
        expect(test.two).toBe(false);
        expect(test.three).toBe(false);
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
