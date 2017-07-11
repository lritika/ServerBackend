/**
 * Created by clicklabs on 4/8/17.
 */


'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
//mongoose schema
var gigCategorySchema = mongoose.Schema({
        category_id		: String,
        category_name   : String
    },
    {
        collection : 'gigcategories'
    }
);

module.exports.GigCategory = mongoose.model('GigCategory', gigCategorySchema,'gigcategories');
