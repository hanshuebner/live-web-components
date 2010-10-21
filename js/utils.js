
var generateClass = function(classPrototype) {
    var constructor = function() {
        if (typeof(classPrototype.extendClass) === "function") {
            for (var key in classPrototype.extendClass.prototype) {
                switch (typeof(classPrototype[key])) {
                case "undefined":
                    classPrototype[key] = classPrototype.extendClass.prototype[key];
                    break;
                case "function": // override
                    classPrototype["_super_" + key] = classPrototype.extendClass.prototype[key];
                    break;
                }
            }
        }

        if (this.initialize)
            this.initialize.apply(this, arguments);
    };

    constructor.prototype = classPrototype;
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
