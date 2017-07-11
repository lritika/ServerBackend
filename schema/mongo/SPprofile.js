/**
 * Created by cl-macmini-63 on 2/6/17.
 */


'use strict'

var mongoose = require('mongoose');
//mongoose schema
var SPProfileSchema = mongoose.Schema({
        first_name          : String,
        last_name           : String,
        profile_id          : String,
        provider_id			: String,
        provider_email      : String,
        profile_type        : {type: String ,default : 'individual'},           // individual or organization
        organization_type           : String,
        organization_name           : String,
        organization_email          : String,
        organization_phone          : String,
        org_country_code            : {type: String, default: null},
        address             : {
            Address1 :String,
            Address2 :String,
            City:String,
            State:String,
            ZipCode:String,
            Country:String
        },
        gender  : String,
        geometry: {
            coordinates: { type: [Number], index : '2dsphere'}
        },
        ssn                 : String,
        revenue_type        : String,
        certificate        : {
            original  : {type:String,default:null},
            thumbnail : {type:String,default:null}
        },
        licence        : {
            original  : {type:String,default:null},
            thumbnail : {type:String,default:null}
        },
       // booking_type:[],
        federal_id          : String,
        org_tab_flag        : {type : Boolean ,default : false},
        bank_details        : {
            bank_name       : String,
            account_type    : String,
            account_number  : String,
            routing_number  : String,
            bank_address: {
                Address1 :String,
                Address2 :String,
                City:String,
                State:String,
                ZipCode:String,
                Country:String
            },
        },
        bank_tab_flag       : {type : Boolean ,default : false},
        insurance_details    : {
            company_name     : String,
            policy_type      : String,
            insurance_number : String,
            insurance_doc    : {
                original        : {type:String,default:null},
                thumbnail       : {type:String,default:null}
            }
        },
        insurance_tab_flag  : {type : Boolean ,default : false},
    service_and_gigs_info   : [
            {
                    service_id      : String,
                    service_name    : String,
                    gigs     : [
                        {
                            gig_id              : String,
                            gig_name            : String,
                            is_product_based    : {type:Boolean , default : false},
                            tools               : {type:Boolean , default : false},
                            supplies            : {type:Boolean , default : false},
                            level               : [],
                            gig_specific_param  : {type : mongoose.Schema.Types.Mixed},
                            booking_type:[]
                            /*Booking type must be according to gigs*/
                        }
                    ]
            }
        ],
        ratings             : [],
        average_rating      : {type:Number,default:0},
        number_of_bookings  : {type:Number,default:0},
        reviews             : [{
           seeker_feedback      : {type: String, default: 'default feedback'},
           is_approved_by_admin : {type: Boolean, default : true}
        }],
        acceptance_count    : {type : Number , default : 0},
        rejectance_count    : {type : Number , default : 0},
        description         : String,
        is_volunteer        : {type: Boolean , default : false},
        is_engaged          : {type: Boolean , default : false},
        mode_of_transport   : {type:String,enum : [
            "driving","walking","bicycling"
        ], default:"driving"},
        is_available        : {type : Boolean , default : true},
        insurance           : {type : Boolean , default : false},           // For Individual this flag will be false always
        i_can_travel        : {type: Number , default : 10000},             // '1000' defalut in metres
        is_approved         : {type : Boolean , default : false},            // This flag will be approved by ADMIN
        discount            : {type : Boolean , default : false},            // This is global flag for discount. will be true if SP wants to give dicount in case of lowest deal
    },
    {
        collection : 'SPprofile'
    }
);

//SPProfileSchema.index({geometry : '2dsphere'});

module.exports.SPProfile = mongoose.model('SPProfile', SPProfileSchema,'SPprofile');