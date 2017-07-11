/**
 * Created by prashant on 7/1/17.
 */

'use strict';

//create logger
var log = require('../../Utils/logger.js');
var logger = log.getLogger();

//var mongoose = require('mongoose');
//var SchemaTypes = mongoose.Schema.Types;
var mongoose = require('mongoose');
//require('mongoose-long')(mongoose);

var SchemaTypes = mongoose.Schema.Types;

var joi = require('joi');
var bcrypt = require('bcryptjs');
var uniqueValidator = require('mongoose-unique-validator');

var SALT_WORK_FACTOR = 12;

//mongoose schema
var userSchema = mongoose.Schema({
        user_id: String,
        first_name: {type: String, required: true},
        last_name: {type: String, required: true},
        address: {
            Address1 :String,
            Address2 :String,
            City:String,
            State:String,
            ZipCode:String,
            Country:String
        },
        email: String,
        fb_id: String,
        account_type: String,           // social or futran
        seeker_profile_type      : {type: String ,default : 'individual'},           // individual or organization
        seeker_notification_flag : {type: Boolean ,default : true},
        provider_notification_flag : {type: Boolean ,default : true},
        organization_details : {
            organization_type           : String,
            organization_name           : String,
            organization_email          : String,
            organization_phone          : String,
            org_country_code            : String,
            ssn                         : String,
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
            certificate        : {
                original  : {type:String,default:null},
                thumbnail : {type:String,default:null}
            },
            licence        : {
                original  : {type:String,default:null},
                thumbnail : {type:String,default:null}
            },
        },
        locationLatitude: {type: String, default: null},
        locationLongitude: {type: String, default: null},
        mobile: String,
        countryCode: {type: String, default: null},
        dob: String,
        role: [String],
        role_token :[{
            role : String,
            token: String,
            token_time : Number
        }],
        token_time : Number,//SchemaTypes.Long,
        registration_type: String,           // indidual or company
        company_details: {                 // in case if type is company this object will have data , otherwise it will be empty
            id: String,
            name: String,
            reffral_code: String
        },
        password: {type: String},
        profilePhoto: {
            original: {type: String, default: null},
            thumbnail: {type: String, default: null}
        },
        promo_code: String,           // optional It would be id of records from promocode collection
        app_version: String,
        device_token: String,
        device_type: String,           // IOS or ANDROID
        time_zone: Number,
        otp: String,
        is_email_verified: {type: Boolean, default: false},
        is_phone_verified: {type: Boolean, default: false},
        passwordResetToken: {type: String, default: null},
        is_family_member:{type:Boolean,default:false},
        parent_id:{type:String,default:null},
        wallet_amount   :{type: Number , default:0},        // this amount is number of CREDITS
        is_active   : {type:Boolean,default:true},
        id_check    : {type:Boolean,default:false},
        criminal_clearance : {type:Boolean,default:false},
        sex_offender_clearance : {type:Boolean,default:false},
        language    : {type : String , default : 'EN'},
        reff_code   : {
            code    : String,
            used_by : []        // ROLES - 'PROVIDER' 'SEEKER'
        }
    },
    {
        collection: 'users'
    }
);

//add uniqueness validator as plugin
userSchema.plugin(uniqueValidator, {message: '{VALUE} already exists.'});


//removing unwanted attribues when sending to front end
userSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        delete ret.password;
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

//set function to encrypt password on save
userSchema.pre('save', function (next) {
    var user = this;

    console.log('Pre save');
    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) {
        return next();
    }

    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
        if (err) {
            console.log('Error generating salt' + err.message);
            return next(err);
        }

        // hash the password using our new salt
        bcrypt.hash(user.password, salt, function (err, hash) {
            if (err) {
                console.log('Error hashing password' + err.message);
                return next(err);
            }
            // override the cleartext password with the hashed one
            user.password = hash;
            console.log("in user model: user.password :", user.password);
            next();
        });
    });
});

//need a special compare method to compare encrypted passwords
userSchema.methods.comparePassword = function (candidatePassword, cb) {
    //logger.debug('User compare password', candidatePassword);
    //logger.debug('User compare password - current user instance', this);
    bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
        //logger.debug('bcrypt compare password callback - err', err);
        //logger.debug('bcrypt compare password callback - isMatch', isMatch);
        if (err) {
            logger.error('bcrypt compare password callback - err', err);
            return cb(err);
        }
        cb(null, isMatch);
    });
};


//JOI schema, should be same as mongoose schema. Using because HAPI and some plugins like swagger
//internally use JOI
var joiPutSchema = {
    first_name: joi.string().max(20).required(),
    last_name: joi.string().max(20).required(),
    address: joi.string().required(),
    mobile: joi.string().length(10).required(),
    email: joi.string().email().required(),
    profile_image: joi.string(),
    created: joi.date()
    //favourites:joi.array()
};

var joiPostSchema = {
    first_name: joi.string().max(20).required(),
    last_name: joi.string().max(20).required(),
    fb_id: joi.string(),
    address: joi.string().required(),
    locationLatitude: joi.string().required(),
    locationLongitude: joi.string().required(),
    mobile: joi.string().required(),        //include +91 1234567890
    reg_as: joi.string().valid('SEEKER', 'PROVIDER').required(),
    email: joi.string().email().required(),
    password: joi.string().optional().allow(''),      //.required(),
    promo_code: joi.string(),           // optional It would be id of records from promocode collection
    registration_type: joi.string().valid('Individual', 'Company').required(),           // indidual or company
    company_details: joi.object({
        name: joi.string(),
        reffral_code: joi.string()
    }),
    dob: joi.string(),
    app_version: joi.string().required(),
    device_token: joi.string().required(),
    device_type: joi.string().valid('IOS', 'ANDROID').required(),           // IOS or ANDROID
    time_zone: joi.number()
};


module.exports.User = mongoose.model('User', userSchema, 'users');
module.exports.UserJoiPutSchema = joiPutSchema;
module.exports.UserJoiPostSchema = joiPostSchema;

