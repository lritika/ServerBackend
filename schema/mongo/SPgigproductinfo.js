/**
 * Created by clicklabs on 4/9/17.
 */


'use strict'

var mongoose = require('mongoose');
//mongoose schema
var SPGigProductsInfoSchema = mongoose.Schema({
        profile_id          : String,
        provider_id         : String,
        gig_id              : String,
        category_id         : String,
        product_info        : [{                // array of products , because there can be multiple products under one category
            product_name    : String,
            product_desc    : String,
            price           : String,
            stock           : Number,
            delivery_charge : String,
            is_active       : {type : Boolean , default : true},     // make it false when a particular product is not available
            product_image:{
                original: {type: String, default: null},
                thumbnail: {type: String, default: null}
            },
            unit:String
        }]
    },
    {
        collection : 'SPgigproducts'
    }
);

module.exports.SPGigProductsInfo = mongoose.model('SPGigProductsInfo', SPGigProductsInfoSchema,'SPgigproducts');