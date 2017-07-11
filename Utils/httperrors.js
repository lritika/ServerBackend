/**
 * Created by prashant on 8/1/17.
 */
/**
 * List of HTTP Errors
 */

'use strict';
module.exports.standardHTTPErrors = [
    { code: 400, message: 'Bad Request' },
    { code: 500, message: 'Internal Server Error'}
];

module.exports.extendedHTTPErrors = [
    { code: 400, message: 'Bad Request' },
    { code: 404, message: 'Object not found' },
    { code: 500, message: 'Internal Server Error'}
];

module.exports.fileHTTPErrors = [
    { code: 400, message: 'Bad Request' },
    { code: 415, message: 'Unsupported Media Type' },
    { code: 500, message: 'Internal Server Error'}
];
