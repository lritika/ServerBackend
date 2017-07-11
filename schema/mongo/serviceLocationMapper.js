/**
 * Created by Chandan Sharma on 31/01/17.
 */
'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
//mongoose schema
var mappperSchema = mongoose.Schema({
       service        :{type: Schema.ObjectId,
           ref: 'masterservices'},
       gig              :{type: Schema.ObjectId,
           ref: 'gigs'},
       service_name:String,
       gig_name:String,
       location       :{type: Schema.ObjectId,
           ref: 'CodeSchema'},
       location_name:String,
       pricing          :{type:Array,default:[]},
       revenue_model    :{type:Array,default:null}
    },
    {
        collection : 'servicelocationmap'
    }
);

module.exports.Mapper = mongoose.model('Mapper', mappperSchema,'servicelocationmap');