(function (module) {

    "use strict";

    var mongoose = require('mongoose')
        , ArtelSchema;

    ArtelSchema = new mongoose.Schema({
        name: { 'type': String },
        /*Участки*/
        attrs:{
            intervals :  { 'type': [{
                strategy: { 'type': String},
                c0end:    { 'type': Number},
                c0start:  { 'type': Number},
                EQ:       { 'type': String},
                ER:       { 'type': String},
                ES:       { 'type': String},
                XK:       { 'type': Number},
                XQ:       { 'type': Number},
                XR:       { 'type': Number},
                XS:       { 'type': Number}
            }]},
            I: { 'type': Number },
            K: { 'type': Number },
            N: { 'type': Number },
            Q: { 'type': Number },
            R: { 'type': Number },
            S: { 'type': Number },
            a: { 'type': Number },
            b1: { 'type': Number },
            b2: { 'type': Number },
            b3: { 'type': Number },
            e1: { 'type': Number },
            e2: { 'type': Number },
            e3: { 'type': Number },
            h: { 'type': Number },
            k1: { 'type': Number },
            k1m: { 'type': Number },
            k2: { 'type': Number },
            k2m: { 'type': Number },
            k3: { 'type': Number },
            k4: { 'type': Number },
            k5: { 'type': Number },
            k6: { 'type': Number },
            k7: { 'type': Number },
            k8: { 'type': Number }
        }
    });
    module.exports = mongoose.model('Artel', ArtelSchema);
}(module));
/*
 db.artels.insert(
 {"name": "Teempla",
 "attrs":
 {
 "intervals": [
 {
 "end": 0,
 "start": 1,
 "EQ": 21,
 "ER": 0.3,
 "ES": 0.06,
 "XQ": 50,
 "XR": 1,
 "XS": 1,
 "XSS": 50,
 "strategy": "save"
 },{
 "end": 0,
 "start": 1,
 "EQ": 21,
 "ER": 0.3,
 "ES": 0.06,
 "XQ": 50,
 "XR": 1,
 "XS": 1,
 "XSS": 50,
 "strategy": "save"
 }],
 "T": 1000,
 "t0": 0,
 "K": 100,
 "N": 150000,
 "Q": 1000,
 "R": 50,
 "S": 10,
 "a": 0,000000046,
 "b1": 0.001,
 "b2": 0.05,
 "b3": 0.05,
 "e1": 0.02,
 "e2": 0.005,
 "e3": 0.005,
 "h": 1,
 "k1m": 0.2,
 "k2m": 0.34,
 "l0": 1,
 "l1": 1,
 "l2": 1,
 "l3": 1,
 "l4": 1,
 "l5": 1,
 "l6": 1,
 "l7": 1,
 }
 })
 )

 db.artels.insert({"name": "Teempla","attrs":{"intervals": [{"end": 500, "start": 0, "EQ": 21, "ER": 0.3, "ES": 0.06, "XK": 0, "XQ": 50, "XR": 1, "XS": 1, "XSS": 70, "strategy": "save"},{"end": 1000, "start": 501, "EQ": 21, "ER": 0.3, "ES": 0.06, "XK": 0, "XQ": 50, "XR": 1, "XS": 1, "XSS": 50, "strategy": "save"}], "T": 1000,"t0": 0, "K": 100, "N": 150000, "Q": 1000,"R": 50, "S": 10,"a": 0.000000046, "b1": 0.001, "b2": 0.05, "b3": 0.05,"e0": 0.005, "e1": 0.02, "e2": 0.005, "e3": 0.005, "h": 1, "k1": 0.2, "k2": 0.34, "l0": 1,"l1": 1, "l2": 1, "l3": 1,"l4": 1, "l5": 1, "l6": 1, "l7": 1,}})

 db.artels.insert({ "name" : "Teempla", "attrs" : { "intervals" : [
 {
 "end" : 500,
 "start" : 1,
 "EQ" : 21,
 "ER" : 0.3,
 "ES" : 0.06,
 "XQ" : 50,
 "XR" : 1,
 "XS" : 1,
 "XSS" : 50,
 "strategy" : "save"
 },
 {
 "end" : 1000,
 "start" : 501,
 "EQ" : 21,
 "ER" : 0.3,
 "ES" : 0.06,
 "XQ" : 50,
 "XR" : 1,
 "XS" : 1,
 "XSS" : 50,
 "strategy" : "save"
 }
 ], "T" : 1000, "t0" : 0, "K" : 100, "N" : 150000, "Q" : 1000, "R" : 50, "S" : 10, "a" : 0.000000046, "b1" : 0.001, "b2" : 0.05, "b3" : 0.05,
    "e0" : 0.005, "e1" : 0.02, "e2" : 0.005, "e3" : 0.005, "h" : 1, "k1" : 0.2, "k2" : 0.34, "l0" : 1, "l1" : 1, "l2" : 1, "l3" : 1, "l4" : 1, "l5" : 1, "l6" : 1, "l7" : 1 } })

 db.artels.insert({ "name" : "Teempla2", "attrs" : { "intervals" : [
 {
 "end" : 500,
 "start" : 1,
 "EQ" : 30,
 "ER" : 0.3,
 "ES" : 0.06,
 "XQ" : 50,
 "XR" : 1,
 "XS" : 1,
 "XSS" : 50,
 "strategy" : "save"
 },
 {
 "end" : 1000,
 "start" : 501,
 "EQ" : 30,
 "ER" : 0.3,
 "ES" : 0.06,
 "XQ" : 50,
 "XR" : 1,
 "XS" : 1,
 "XSS" : 50,
 "strategy" : "save"
 }
 ], "T" : 1000, "t0" : 0, "K" : 100, "N" : 100000, "Q" : 1000, "R" : 50, "S" : 10, "a" : 0.0000000938, "b1" : 0.001, "b2" : 0.05, "b3" : 0.05,
    "e0" : 0.005, "e1" : 0.02, "e2" : 0.005, "e3" : 0.005, "h" : 1, "k1" : 0.2, "k2" : 0.34, "l0" : 1, "l1" : 1, "l2" : 1, "l3" : 1, "l4" : 1, "l5" : 1, "l6" : 1, "l7" : 1 } })

 * */
