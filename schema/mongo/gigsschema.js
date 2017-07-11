/**
 * Created by cl-macmini-63 on 1/21/17.
 */
'use strict';

//create logger
const log = require('Utils/logger.js');
const logger = log.getLogger();

const mongoose = require('mongoose');
const joi = require('joi');

const uniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;


//mongoose schema
let gigSchema = mongoose.Schema({
        service_id: String,
        service_name:String,
        gig_id			            : String,
        gig_name                    : String,
         alternate_gig_name:     String,
        gig_image                   : {
            original:{type:String,default:null},
            thumbnail:{type:String,default:null}
        },
        pricing                     : {type:Array,default:[]},
        revenue_model               : {type:Array,default:[]},                      // monthly quaterly annuly percentgr base for every transction
        skill_level                 : [String],                                     //N/H/P
        is_product_based            : {type : Boolean , default : false},
        gig_categories              : [{
            //category_id     : String,
            category_name   : String,
            //enabled:Boolean
        }],
        flow                        : [String],// in this case flow will be 3. default flow will be 2
        min_age                     : String,
        booking_location:{type:Array,default:[]},
        gig_booking_options         : {type:Array,default:[]},                                     // mongoose id of gig flow document collection
        tool_required               : {type: Boolean , default : false},            // true - yes , false -No
        additional_comments         : {type:String,default:null} ,                  // additional commentrs for tools
        set_unit                    : String,
        is_active                   : {type : Boolean , default : true},
        max_fixed_price             :         String,
        max_hourly_price            :        String,
        number_of_hours             :         String,
        is_gigger_required          : {type: Boolean , default : false}, 
        addSupplies                 : {type:Boolean,default:false},
        no_of_giggers               : String,
        gig_specific_param          : {
                        geofencing_enabled      : {type : Boolean , default : false},
                        weather_api             : {type : Boolean , default : false},
                        profile_cards           : [],                                           // profile card ids
                        //is_slider               : {type : Boolean , default : false},           // if profile needs to show slider , is_slider will be true in the payload request api from admin panel
                        add_attributes          : [
                                            {
                                                key                 : String,
                                                value               : [{type : mongoose.Schema.Types.Mixed}],
                                                is_multi            : {type : Boolean , default : false},
                                                is_slider           : {type : Boolean , default : false},           // if profile needs to show slider , is_slider will be true in the payload request api from admin panel
                                                seeker_key          : String,
                                                seeker_is_multi     : {type : Boolean , default : false},
                                                seeker_is_slider    : {type : Boolean , default : false}
                                            }
                                    ]
        },
    location:[
        {type: Schema.ObjectId,
        ref: 'Mapper'}
    ]
},
    {
        collection : 'gigs'
    }
);

//add uniqueness validator as plugin
gigSchema.plugin(uniqueValidator,{ message: '{VALUE} already exists.'});


//removing unwanted attribues when sending to front end
gigSchema.set('toJSON', {
    transform: function(doc, ret, options) {
        delete ret.__v;
        return ret;
    }
});


//JOI schema, should be same as mongoose schema. Using because HAPI and some plugins like swagger
//internally use JOI
var joiPutSchema = {

};

var joiPostSchema = {
    gig_name                    : String,
    gig_image                   : {
        original:{type:String,default:null},
        thumbnail:{type:String,default:null}
    },
    pricing                     : [{
        type:String,
        default_rate:String
    }],
    revenue_model               : [{
        type : String,
        value : String
    }],                               // monthly quaterly annuly percentgr base for every transction
    skill_level                 : [String],                               //N/H/P
    is_product_based   : {type : Boolean , default : false},        // in this case flow will be 3. default flow will be 2
    flow:                [String],
    min_age                     : String,
    gig_booking_options         : [String],                               // mongoose id of gig flow document collection
    tool_required               : {type: Boolean , default : false},    // true - yes , false -No
    additional_comments          : String,                               // additional commentrs for tools
    set_unit                    : String,
    is_active                   : {type : Boolean , default : true},
    is_favourite               : {type : Boolean , default : false}


};


module.exports.Gigs = mongoose.model('gigs', gigSchema,'gigs');
module.exports.GigsJoiPutSchema = joiPutSchema;
module.exports.GigsJoiPostSchema = joiPostSchema;





