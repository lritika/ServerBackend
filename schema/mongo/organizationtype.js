/**
 * Created by clicklabs on 6/12/17.
 */

'use strict'

var mongoose = require('mongoose');
//mongoose schema
var organizationTypeSchema = mongoose.Schema({

        organization_type       : String,
        org_tab_flag            : {type : Boolean , default : true},
        bank_tab_flag           : {type : Boolean , default : true},
        insurance_tab_flag      : {type : Boolean , default : true},
        is_active               : {type : Boolean , default : true},

    },
    {
        collection : 'organization_types'
    }
);

module.exports.OrganizationType = mongoose.model('OrganizationType', organizationTypeSchema,'organization_types');