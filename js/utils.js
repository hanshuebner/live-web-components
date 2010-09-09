
var generateClass = function(class) {
    var constructor = function() {
        if (typeof(class.extendClass) === "function") {
            for (var key in class.extendClass.prototype) {
                switch (typeof(class[key])) {
                case "undefined":
                    class[key] = class.extendClass.prototype[key];
                    break;
                case "function": // override
                    class["_super_" + key] = class.extendClass.prototype[key];
                    break;
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
