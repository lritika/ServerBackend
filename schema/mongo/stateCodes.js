/**
 * Created by cl-macmini-149 on 31/01/17.
 */
'use strict'

var mongoose = require('mongoose');
//mongoose schema
var codeSchema = mongoose.Schema({
       place:{type:String,default:null},
       code:{type:String,default:null},
       placeType:{type:String,default:null},
       country:{type:String,default:null}
},
    {
        collection : 'codes'
    }
);

module.exports.CodeSchema = mongoose.model('CodeSchema', codeSchema,'codes');
