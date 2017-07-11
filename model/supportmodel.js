/**
 * Created by clicklabs on 6/20/17.
 */


'use strict';
const responseFormatter = require('Utils/responseformatter.js');
const supportSchema = require('schema/mongo/support.js');
const  log = require('Utils/logger.js');
var config=require('../config');
const logger = log.getLogger();





module.exports.addSupportInfo = function (payload, callback) {

    let supportInfo = new supportSchema.Support(payload);
    supportInfo.save(function (err, support) {
        if (err) {
            callback(err);
        }
        else {
            console.log("supportInfo savedData______", support);
            callback(null , support);
        }
    })
}

module.exports.getSupportInfo = function ( callback) {
    supportSchema.Support.find({}, {}, {lean: true}, function (err, data) {
        if (err) {
            callback(err)
        }
        else {
            if (!data || data.length == 0) {
                responseFormatter.formatServiceResponse([], callback, "Support not found", "error", 400)
            }
            else {
                console.log("--------***Supoort Data", data);
                responseFormatter.formatServiceResponse(data, callback, "Promotions fetched successfully", "success", 200);
                //callback(null, data)

            }
        }
    })
}