
var generateClass = function(className) {
    var constructor = function() {
        if (typeof(className.extendClass) === "function") {
            for (var key in className.extendClass.prototype) {
                switch (typeof(className[key])) {
                case "undefined":
                    className[key] = className.extendClass.prototype[key];
                    break;
                case "function": // override
                    className["_super_" + key] = className.extendClass.prototype[key];
                    break;
                }
            }
        }

        if (this.initialize)
            this.initialize.apply(this, arguments);
    };

    constructor.prototype = className;
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
