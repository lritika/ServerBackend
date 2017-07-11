/**
 * Created by clicklabs on 6/7/17.
 */

'use strict';

const responseFormatter = require('Utils/responseformatter.js');
const  log = require('Utils/logger.js');
const logger = log.getLogger();
const async=require('async');
const messenger = require('Utils/messenger.js');
const mongoose = require('mongoose');
const commonFunction = require('Utils/commonfunction.js');
let moment=require('moment');
const SPoraganizationSchema = require('schema/mongo/SPorganizationprofile');
let config = require('config');
let AWS = config.amazon.s3;

module.exports={};



module.exports.addOrganizationData = function (payload, callback) {
    let orgDetails = payload.org_details;
    let finalData = null
    async.series([
        function (cb) {
            if (payload.hasOwnProperty("certificate") && payload.certificate) {
                let fileName = payload.certificate.filename;
                let tempPath = payload.certificate.path;
                if (typeof payload.certificate !== 'undefined' && payload.certificate.length) {
                    fileName = payload.certificate[1].filename;
                    tempPath = payload.certificate[1].path;
                }
                console.log("tempPath", fileName)

                commonFunction.uploadFile(tempPath, fileName, "aLarge", function (err) {

                    if (err) {
                        cb(err);
                    }
                    else {

                        let x = fileName;

                        let fileNameFirst = x.substr(0, x.lastIndexOf('.'));
                        let extension = x.split('.').pop();

                        orgDetails.certificate = {
                            original: AWS.s3URL + AWS.folder.aLarge + "/" + fileName,
                            thumbnail: AWS.s3URL + AWS.folder.aLarge + "/" + fileNameFirst + "_thumb." + extension
                        };
                        console.log("file upload success", orgDetails.certificate);
                        console.log("cerificateimage");
                        cb(null)
                    }
                });
            }
            else {
                cb(null);
            }
        },
        function (cb) {
            if (payload.hasOwnProperty("licence") && payload.licence) {
                let fileName = payload.licence.filename;
                let tempPath = payload.licence.path;
                if (typeof payload.licence !== 'undefined' && payload.licence.length) {
                    fileName = payload.licence[1].filename;
                    tempPath = payload.licence[1].path;
                }
                console.log("tempPath", fileName)

                commonFunction.uploadFile(tempPath, fileName, "aLarge", function (err) {

                    if (err) {
                        cb(err);
                    }
                    else {

                        let x = fileName;

                        let fileNameFirst = x.substr(0, x.lastIndexOf('.'));
                        let extension = x.split('.').pop();

                        orgDetails.licence = {
                            original: AWS.s3URL + AWS.folder.aLarge + "/" + fileName,
                            thumbnail: AWS.s3URL + AWS.folder.aLarge + "/" + fileNameFirst + "_thumb." + extension
                        };
                        console.log("file upload success", orgDetails.licence);
                        console.log("licenceimage");
                        cb(null)
                    }
                });
            }
            else {
                cb(null);
            }
        },
        function (cb) {
            console.log("async series orgDetails", orgDetails);
            let SPorganization = new SPoraganizationSchema.SPOrganizationProfile(orgDetails);
            SPorganization.organization_profile_id = SPorganization._id;
            SPorganization.org_tab_flag = true;
            SPorganization.save(function(err,SPorganization) {
                if (err) {
                    responseFormatter.formatServiceResponse(err, callback);
                }
                else {
                    console.log("SPorganization savedData______", SPorganization);
                    finalData = SPorganization;
                    cb(null);
                }
            })
        }
    ], function (err, data) {
        if (err) {
            callback(err)
        }
        else {
            data = finalData;
            console.log("final data after series", data)
            callback(null, data);
        }
    })
}


module.exports.addInsuranceDetails = function (payload, callback) {
    let insuranceDetails = payload.insurance_details;
    let finalData = null
    async.series([
        function (cb) {
            if (payload.hasOwnProperty("insurance_doc") && payload.insurance_doc) {
                let fileName = payload.insurance_doc.filename;
                let tempPath = payload.insurance_doc.path;
                if (typeof payload.insurance_doc !== 'undefined' && payload.insurance_doc.length) {
                    fileName = payload.insurance_doc[1].filename;
                    tempPath = payload.insurance_doc[1].path;
                }
                console.log("tempPath", fileName)

                commonFunction.uploadFile(tempPath, fileName, "aLarge", function (err) {

                    if (err) {
                        cb(err);
                    }
                    else {

                        let x = fileName;

                        let fileNameFirst = x.substr(0, x.lastIndexOf('.'));
                        let extension = x.split('.').pop();

                        insuranceDetails.insurance_doc = {
                            original: AWS.s3URL + AWS.folder.aLarge + "/" + fileName,
                            thumbnail: AWS.s3URL + AWS.folder.aLarge + "/" + fileNameFirst + "_thumb." + extension
                        };
                        console.log("file upload success", insuranceDetails.insurance_doc);
                        console.log("insurance_doc");
                        cb(null)
                    }
                });
            }
            else {
                cb(null);
            }
        },
        function (cb) {
            SPoraganizationSchema.SPOrganizationProfile.findOneAndUpdate({"organization_profile_id":payload.organization_profile_id},
                {'insurance_details' : insuranceDetails, $set:{insurance_tab_flag : true}},
                {lean:true,new:true},function(err,organizationDetails){
                    console.log("async series updated orgDetails with insurance details :", organizationDetails);
                if (err){
                    console.log('error in addInsuranceDetails : ',err);
                    responseFormatter.formatServiceResponse(err, callback);
                }
                else {
                    finalData = organizationDetails
                    cb(null);
                }
            })

        }
    ], function (err, data) {
        if (err) {
            callback(err)
        }
        else {
            data = finalData;
            console.log("final data after series", data)
            callback(null, data);
        }
    })
}


module.exports.addBankDetails = function(payload,callback){
    let bank_details = payload.bank_details;

    SPoraganizationSchema.SPOrganizationProfile.findOneAndUpdate({"organization_profile_id":payload.organization_profile_id},
        {'bank_details' : bank_details, $set:{bank_tab_flag : true}},
        {lean:true,new:true},function(err,organizationDetails){
            console.log("async series updated orgDetails with bank details :", organizationDetails);
            if (err){
                console.log('error in addBankDetails : ',err);
                responseFormatter.formatServiceResponse(err, callback);
            }
            else {
                if(organizationDetails){
                    responseFormatter.formatServiceResponse(organizationDetails , callback,'Bank Details Added successfully','success',200);

                }else{
                    responseFormatter.formatServiceResponse(organizationDetails , callback,'SP Organization profile not found','error',404);

                }
            }
        })

};
