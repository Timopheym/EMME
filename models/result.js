(function (module) {

    "use strict";

    var mongoose = require('mongoose')
        , ResultSchema;

    ResultSchema = new mongoose.Schema({
        artelId: { 'type': String },
        S:  [String],
        K:  [String],
        Q:  [String],
        R:  [String],
        Fi: Number
    });
    module.exports = mongoose.model('Result', ResultSchema);
}(module));