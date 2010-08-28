
var class = function(class) {
    var constructor = function() {
        if (typeof(class.extends) === "function") {
            for (var key in class.extends.prototype) {
                switch (typeof(class[key])) {
                case "undefined":
                    class[key] = class.extends.prototype[key];
                    break;
                case "function": // override
                    class[key].super = class.extends.prototype[key].bind(this);
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
