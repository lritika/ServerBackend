/**
 * Created by cl-macmini-63 on 2/1/17.
 */

'use strict';

var cardModel =require('model/cardmodel')

const  log = require('Utils/logger.js');
const logger = log.getLogger();

const responseFormatter = require('Utils/responseformatter');

module.exports={};
module.exports.addCards=function(request,reply){
    let payload=request.payload;
    console.log('payload  in cardHandler ::: ',payload);
    cardModel.addCards(payload,function(err,data){
        if(err){
            reply(err)
        }
        else{
            responseFormatter.formatServiceResponse(data,reply, 'Fetched successfully','success',200);
        }
    })

}

module.exports.getCards = function(request, reply){
    console.log("in handler getCards :::  ");
    cardModel.getCards(function(response){
        if(response.status == 'success'){
            reply(response);
        }
        else{
            console.log('error in addCards',response);
            reply(response);
        }
    });
};