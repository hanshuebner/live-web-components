
var Optionable = class({

    OPTION_KEYS: [ ],

    initialize: function(defaults, options) {
        this.defaults = defaults;

        this.setDefaults();
        this.setOptions(options);
    },

    setDefaults: function() {
        this.setOptions(this.defaults);
    },

    setOptions: function(options) {
        options = options || { };
        this.OPTION_KEYS.each(function(key) {
            if (options[key]) this["_" + key] = options[key];
        }, this);
    }

});
