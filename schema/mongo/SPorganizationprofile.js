/**
 * Created by cl-macmini-63 on 2/8/17.
 */

'use strict'

var mongoose = require('mongoose');
//mongoose schema
var SPOrganizationProfileSchema = mongoose.Schema({

        organization_profile_id     : String,
        organization_type           : String,
        organization_name           : String,
        organization_email          : String,
        organization_phone          : String,
        org_country_code                : {type: String, default: null},
        ssn                         : String,
        certificate                 : {
            original        : {type:String,default:null},
            thumbnail       : {type:String,default:null}
        },
        licence                     : {
            original        : {type:String,default:null},
            thumbnail       : {type:String,default:null}
        },
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
        insurance_tab_flag  : {type : Boolean ,default : false}
    },
    {
        collection : 'SPorganizationprofiles'
    }
);

module.exports.SPOrganizationProfile = mongoose.model('SPOrganizationProfile', SPOrganizationProfileSchema,'SPorganizationprofiles');