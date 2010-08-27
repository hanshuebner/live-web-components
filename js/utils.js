
var class = function(class) {
    var constructor = function() {
        if (typeof(class.extends) === "function") {
            for (var key in class.extends.prototype) {
                var parentFunc = class.extends.prototype[key];
                if (typeof(class[key]) === "function") { // override
                    class[key].super = parentFunc.bind(this);
                } else {
                    class[key] = parentFunc;
                }
            }
        }

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

Array.prototype.each = function(func, scope) {
    for (var index = 0; index < this.length; index++) {
        func.call(scope || this, this[index]);
    }
};
