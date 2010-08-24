
var class = function(class) {
    var constructor = function() {
        if (this.initialize)
            this.initialize.apply(this, arguments);
    };
    constructor.prototype = class;
    return constructor;
};

Function.prototype.bind = function(scope) {
    var func = this;
    return function() {
        return func.apply(scope, arguments);
    };
};
