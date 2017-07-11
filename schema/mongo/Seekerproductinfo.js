/**
 * Created by Chandan Sharma on 2/6/17.
 */
'use strict'

var mongoose = require('mongoose');
//mongoose schema
var SeekerProductSchema = mongoose.Schema({
         booking_id:String,
    seeker_id:String,
         product:[{
          product_id:String,
          quantity:String
         }]
    },
    {
        collection : 'Seekerproductinfo'
    }
);

module.exports.SeekerProduct = mongoose.model('SeekerProduct', SeekerProductSchema,'Seekerproductinfo');