'use strict';
/**
 * @method paginate
 * @param {Object} query Mongoose Query Object
 * @param {Number} pageNumber
 * @param {Number} resultsPerPage
 * @param {Number} listLength   maximum length of range array/2
 * Extend Mongoose Models to paginate queries
 **/

var responseFormatter = require('./responseformatter.js');

//logger
var log = require('./logger.js');
var logger = log.getLogger();

exports.paginate = function(filter, pageNumber, resultsPerPage, listLength, url, fields, callback, sort){
    console.log('filter, pageNumber, resultsPerPage, listLength, url, fields, sort ::: ----->',filter, pageNumber, resultsPerPage, listLength, url, fields, sort);
    var model = this;
    var maxResultSize = 100;
    pageNumber = pageNumber || 1;
    resultsPerPage = resultsPerPage || 3;
    listLength = listLength || 10;
    callback = callback || function(){};

    if(resultsPerPage > maxResultSize)
    	resultsPerPage = maxResultSize;

    var skipFrom = ((pageNumber -1) * resultsPerPage) ;
    var jsonFilter;
    /*if(JSON.stringify(filter) == '{}' || filter.doFilterParse == false){
    	jsonFilter = filter;
    }else{
    	jsonFilter = JSON.parse(filter);
    }*/
    logger.debug('in paginte.js ----- > filter: ', filter);
    if (typeof filter == 'string' || filter instanceof String){
        jsonFilter = JSON.parse(filter);
    }
    else{
       jsonFilter = filter;
    }

console.log("jsonFilter in paginate",jsonFilter)
    var query = model.find(jsonFilter).skip(skipFrom).limit(resultsPerPage);
    query.select(fields);
    //console.log("in paginate.js -----> @@@@@@@@@@@@@@@@@@@@@  query  :",query);
    if(sort)
    	query.sort(sort);

    query.exec(function(error, results) {
        if (error) {
        	responseFormatter.formatServiceResponse(error, callback);
        } else {
            model.count(jsonFilter, function(error, count) {

                if (error) {
                	responseFormatter.formatServiceResponse(error, callback);
                } else {
                    var range = [];
                    var carry = 0;
                    var pageCount = Math.ceil(count / resultsPerPage);
                    console.log('pageCount ::: ',pageCount);
                    console.log('pageNumber ::: ',pageNumber);
                    console.log('listLength ::: ',listLength);
                    var start = pageNumber - listLength ;
                    if (start < 1 ){
                        start = 1;
                        carry = listLength - pageNumber + 1;
                    }
                    var end =  (pageNumber + listLength  + carry);
                    console.log('*** start',start,"  carry : ",carry,'   end : ',end,"  pageCount ::: ",pageCount);
                    if (end > pageCount  ){
                        carry = pageNumber + listLength  - pageCount;
                        end = pageCount;
                        start = (start - carry ) < 1 ? 1 : (start - carry);
                    }
                    console.log('### start',start,"  carry : ",carry,'   end : ',end,"  pageCount ::: ",pageCount);
                    for (var i = start; i <= end ; i++) {
                    	var pageObj = { page : i, link : ''};
                        //console.log("when i --- ", i," pageObje -------",pageObj);
                    	if(i != pageNumber){
	                    	if(url.indexOf("?")>-1){
	                    		pageObj.link = url + '&pageno=' + i;
	                    	}
	                    	else{
	                    		pageObj.link = url + '?pageno=' + i;
	                    	}
                    	}
                        console.log("when i --- ", i," pageObje -------",pageObj);
                    	range.push(pageObj);
                    }
                    var data = {};
                    data.results = results;
                    data.pageCount = pageCount;
                    data.range = range;
                    responseFormatter.formatServiceResponse(data, callback , '','success',200);
                }
            });
    	}
    });

};
