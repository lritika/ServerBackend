/**
 * Created by Prashant on 1/10/17.
 */


'use strict';

//create logger
var log = require('Utils/logger.js');
var logger = log.getLogger();

var mongoose = require('mongoose');
var joi = require('joi');
var bcrypt = require('bcryptjs');
var uniqueValidator = require('mongoose-unique-validator');

var SALT_WORK_FACTOR = 12;

//mongoose schema
var adminSchema = mongoose.Schema({
        admin_id			: String,
        first_name		: {type: String, required: true},
        last_name		: {type: String, required: true},
        address			: {
            street: String,
            city: String,
            state: String,
            country: String,
            pincode: String
        },
        mobile			    : String,
        age				    : String,
        role                : [String],
        email			    : String,
        password		    : {type: String},
        profile_image	    : String,
        is_email_verified   : {type : Boolean , default : false}
    },
    {
        collection : 'admins'
    }
);

//add uniqueness validator as plugin
adminSchema.plugin(uniqueValidator,{ message: '{VALUE} already exists.'});


//removing unwanted attribues when sending to front end
adminSchema.set('toJSON', {
    transform: function(doc, ret, options) {
        delete ret.password;
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

//set function to encrypt password on save
adminSchema.pre('save', function(next) {
    var admin = this;

    console.log('Pre save');
    // only hash the password if it has been modified (or is new)
    if (!admin.isModified('password')){
        return next();
    }

    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err){
            console.log('Error generating salt' + err.message);
            return next(err);
        }

        // hash the password using our new salt
        bcrypt.hash(admin.password, salt, function(err, hash) {
            if (err){
                console.log('Error hashing password' + err.message);
                return next(err);
            }
            // override the cleartext password with the hashed one
            admin.password = hash;
            console.log("in admin model: admin.password :",admin.password);
            next();
        });
    });
});

//need a special compare method to compare encrypted passwords
adminSchema.methods.comparePassword = function(candidatePassword, cb) {
    //logger.debug('Admin compare password', candidatePassword);
    //logger.debug('Admin compare password - current Admin instance', this);
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        //logger.debug('bcrypt compare password callback - err', err);
        //logger.debug('bcrypt compare password callback - isMatch', isMatch);
        if (err){
            logger.error('bcrypt compare password callback - err', err);
            return cb(err);
        }
        cb(null, isMatch);
    });
};


//JOI schema, should be same as mongoose schema. Using because HAPI and some plugins like swagger
//internally use JOI
var joiPutSchema = {
    admin_id: joi.string().email(),
    first_name: joi.string().max(20).required(),
    last_name: joi.string().max(20).required(),
    address: joi.object({
        street: joi.string().max(50),
        city: joi.string().max(30),
        state: joi.string().max(30),
        country: joi.string().max(30),
        pincode: joi.string().max(6)
    }),
    mobile: joi.string().length(10).required(),
    email: joi.string().email().required(),
    profile_image: joi.binary().encoding('base64'),
    created: joi.date(),
    //favourites:joi.array()
};

var joiPostSchema = {
    first_name: joi.string().max(20).required(),
    last_name: joi.string().max(20).required(),
    address: joi.object({
        street: joi.string().max(50),
        city: joi.string().max(30),
        state: joi.string().max(30),
        country: joi.string().max(30),
        pincode: joi.string().max(6)
    }),
    mobile: joi.string().length(10),
    email: joi.string().email().required(),
    profile_image: joi.binary().encoding('base64'),
    password: joi.string().min(5).max(30).regex(/[a-zA-Z0-9]{3,30}/).required()
};


module.exports.Admin = mongoose.model('Admin', adminSchema,'admins');
module.exports.AdminJoiPutSchema = joiPutSchema;
module.exports.AdminJoiPostSchema = joiPostSchema;

