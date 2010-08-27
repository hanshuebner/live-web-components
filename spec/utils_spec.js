
describe("class", function() {

    var Test;

    beforeEach(function() {
        Test = class({
            initialize: function() { }
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
