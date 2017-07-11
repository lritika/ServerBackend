/**
 * Created by clicklabs on 6/12/17.
 */

'use strict';
const responseFormatter = require('Utils/responseformatter.js');
const organizationTypeSchema = require('schema/mongo/organizationtype');
const  log = require('Utils/logger.js');
var config=require('../config');
const logger = log.getLogger();



module.exports.setOrganizationTypes = function (payload, callback) {
    organizationTypeSchema.OrganizationType.insertMany(payload.docs, function (err, OrganizationTypes) {
        console.log('OrganizationTypes  :: ', OrganizationTypes);
        if (err) {
            logger.error("Find failed", err);
            responseFormatter.formatServiceResponse(err, callback);
        }
        else {
            callback(null, OrganizationTypes)
        }
    });
};

module.exports.getOrganizationTypes = function (callback) {
    organizationTypeSchema.OrganizationType.find({}, {}, {lean: true}, function (err, data) {
        if (err) {
            callback(err)
        }
        else {
            if (!data) {
                responseFormatter.formatServiceResponse([], callback, "Organization type not found", "error", 400)
            }
            else {
                console.log("--------***Data", data)
                callback(null, data)

            }
        }
    })
}