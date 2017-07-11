/**
 * Created by prashant on 7/1/17.
 */
/**
 * Module to format response returned from model into a standard format in the service
 * Differentiates between success, validation errors and system errors
 *
 */
'use strict';

var mongoose = require( 'mongoose' );

var log = require('Utils/logger.js');

var logger = log.getLogger();

var Boom = require('boom');

module.exports = {};

/**
 * Used in services to wrap the data in a standard response format
 */

module.exports.formatServiceResponse = function(data, callback, message, status ,statusCode){
    var formattedResponse = {status:'', error_type:'', message:'', data:''};

    if (data instanceof Error){
        //check if validation error
        //mongoos validation errors have a name field, we can check instance of as well
        formattedResponse.status = "error";
        formattedResponse.message = data.message;
        if (data.name=='ValidationError'){
            formattedResponse.error_type="validation_error";
            formattedResponse.data = data; //send the entire error back
            formattedResponse.statusCode = 400;
        }
        else if (data.name == 'AuthenticationError'){
            formattedResponse.error_type="authentication_error";
            formattedResponse.data = data.stack;
            formattedResponse.statusCode = 401;
        }
        else{
            formattedResponse.error_type="system_error";
            formattedResponse.data = data.stack;
            formattedResponse.statusCode = 500;
        }

    }else{
        if(status && status == "error"){
            formattedResponse.status="error";
            formattedResponse.statusCode=statusCode || "";
            formattedResponse.data=data || "";
            formattedResponse.message = message || "";
        }else{
            //success
            formattedResponse.status="success";
            formattedResponse.statusCode=statusCode || "";
            formattedResponse.data=data || "";
            formattedResponse.message = message || "";
        }

    }

    callback(formattedResponse);
}

/**
 * Used in controller to format validation errors being returned to front end
 */


module.exports.formatValidationErrorResponse = function(data, callback){
    console.log('Data in response formatValidationErrorResponse', data);
    var error = Boom.badRequest(data.message, data);
    //error.output.payload.data = {};
    if (data.errors) {
        error.output.payload.data = data.errors;
    }
    callback(error);
}

