/**
 * Created by cl-macmini-63 on 2/1/17.
 */

/**
 * Created by cl-macmini-63 on 1/18/17.
 */
'use strict';
const responseFormatter = require('Utils/responseformatter.js');
let commonFunction=require('Utils/commonfunction.js');
var config=require('../config');
const cardSchema = require('schema/mongo/cardschema');
const  log = require('Utils/logger.js');
const logger = log.getLogger();
var async=require('async')
var AWS = config.amazon.s3


module.exports = {};

module.exports.addCards = function(payload , callback){
    let card = new cardSchema.Card();
    card.card_id = card._id;
    card.card_name = payload.card_name;
    card.card_type = payload.card_type;
    card.card_fields = payload.card_fields;
    async.series([
        function(cb){
                if (payload.hasOwnProperty("icon") && payload.icon) {
                    let fileName = payload.icon.filename;
                    let tempPath = payload.icon.path;
                    if(typeof payload.icon !== 'undefined' && payload.icon.length){
                        fileName = payload.icon[1].filename;
                        tempPath = payload.icon[1].path;
                    }
                    console.log("tempPath",fileName)

                    commonFunction.uploadFile(tempPath, fileName, "aLarge", function (err) {

                        if (err) {
                            cb(err);
                        }
                        else {

                            let x = fileName;

                            let fileNameFirst = x.substr(0, x.lastIndexOf('.'));
                            let extension = x.split('.').pop();

                            card.icon = {
                                original: AWS.s3URL + AWS.folder.aLarge + "/" + fileName,
                                thumbnail: AWS.s3URL + AWS.folder.aLarge + "/" + fileNameFirst + "_thumb." + extension
                            };

                            console.log("file upload success");
                            console.log("teamPhoto",card.icon);
                            cb(null)

                        }
                    });
                }
                else {
                    cb(null);
                }
            },
        function(cb){
            card.save(function(err,card){
                if (err){
                    responseFormatter.formatServiceResponse(err, cb);
                }
                else {
                    console.log("in success :card created successfully");
                    responseFormatter.formatServiceResponse(card, cb, 'card Saved successfully','success',200);
                }
            });   
        }
    ],function(err,data){
        if(err){
            callback(err)
        }
        else{
            data=card
            callback(null,data)
        }
    })
};

module.exports.getCards = function(callback){
    cardSchema.Card.find({"is_active" : true}, function (err, cards) {
        if (err){
            logger.error("Find failed", err);
            responseFormatter.formatServiceResponse(err, callback);
        }
        else {
            if(cards && cards.length){
                responseFormatter.formatServiceResponse(cards, callback ,'','success',200);
            }
            else{
                responseFormatter.formatServiceResponse({}, callback, "No cards Found." , "error",404);
            }
        }
    });

};




