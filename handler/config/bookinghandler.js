/**
 * Created by cl-macmini-63 on 2/24/17.
 */

'use strict';

const SPProfileModel =require('model/SPprofilemodel');
const bookingModel =require('model/bookingmodel');



const  log = require('Utils/logger.js');
const logger = log.getLogger();

const responseFormatter = require('Utils/responseformatter');

module.exports={};

module.exports.createBookingForSeekerSelect=function(request,reply){
    let payload=request.payload;
    console.log('payload  in createSPProfile ::: ',payload);
    bookingModel.createBookingForSeekerSelect(payload,function(err,data){
       if(err){
           reply(err)
       }
        else{
           console.log("data",data)
           responseFormatter.formatServiceResponse(data,reply, 'Booking created successfully','success',200);
       }

    });

};

module.exports.createBookingProducts=function(request,reply){

}

module.exports.bookingAcceptedBySP=function(request,reply){
    let payload=request.payload;
    console.log('payload  in bookingAcceptedBySP ::: ',payload);
    bookingModel.bookingAcceptedBySP(payload,function(err,data){
        if(err){
            reply(err)
        }
        else{
            console.log("data changes on booking seeker",data)
            responseFormatter.formatServiceResponse(data,reply, 'Booking created successfully','success',200);
        }
    })

};

module.exports.productBookingAcceptedBySP=function(request,reply){
    let payload=request.payload;
    console.log('payload  in bookingAcceptedBySP ::: ',payload);
    bookingModel.productBookingAcceptedBySP(payload,function(err,data){
        if(err){
            reply(err)
        }
        else{
            console.log("data changes on booking seeker",data)
            responseFormatter.formatServiceResponse(data,reply, 'Booking created successfully','success',200);
        }
    })

};

module.exports.bookingRejectedByProvider=function(request,reply){
    let payload=request.payload;
    console.log('payload  in bookingRejectedBySeeker ::: ',payload);
    bookingModel.bookingRejectedByProvider(payload,function(response){
        reply(response);
        //if(err){
        //    responseFormatter.formatServiceResponse(err,reply, 'error occurred','error',400);
        //}
        //else{
        //    responseFormatter.formatServiceResponse(data,reply, 'Booking created successfully','success',200);
        //}
    })

};
module.exports.getBookingDetails=function(request,reply){
    let booking_id=request.params.booking_id;
    console.log('payload  in getBookingDetails ::: ',booking_id);
    bookingModel.getBookingDetails(booking_id,function(response){
        reply(response);
    })

};

module.exports.startBooking=function(request,reply){
    let booking_id=request.params.booking_id;
    console.log('payload  in getBookingDetails ::: ',booking_id);
    bookingModel.startBooking(booking_id,function(response){
        reply(response);
    })

};

module.exports.onTheWay=function(request,reply){
    let booking_id=request.params.booking_id;
    console.log('payload  in getBookingDetails ::: ',booking_id);
    bookingModel.onTheWay(booking_id,function(response){
        reply(response);
    })

};

module.exports.pauseBooking=function(request,reply){
    let booking_id=request.params.booking_id;
    console.log('payload  in getBookingDetails ::: ',booking_id);
    bookingModel.pauseBooking(booking_id,function(response){
        reply(response);
    })

};

module.exports.resumeBooking=function(request,reply){
    let booking_id=request.params.booking_id;
    console.log('payload  in getBookingDetails ::: ',booking_id);
    bookingModel.resumeBooking(booking_id,function(response){
        reply(response);
    })

};

module.exports.endBooking=function(request,reply){
    let booking_id=request.params.booking_id;
    console.log('payload  in getBookingDetails ::: ',booking_id);
    bookingModel.endBooking(booking_id,function(response){
        reply(response);
    })

};

module.exports.rateSeekerForBooking=function(request,reply){
    let booking_id=request.params.booking_id;
    let payload = request.payload;
    console.log('payload  in getBookingDetails ::: ',booking_id , payload);
    bookingModel.rateSeekerForBooking(booking_id,payload,function(response){
        reply(response);
    })

};

module.exports.rateSPForBooking=function(request,reply){
    let booking_id=request.params.booking_id;
    let payload = request.payload;
    console.log('payload  in getBookingDetails ::: ',booking_id, payload);
    bookingModel.rateSPForBooking(booking_id,payload,function(err,data){
       if(err){
           responseFormatter.formatServiceResponse(err, reply,'Error Occurred','error',500);
       }
        else{
           responseFormatter.formatServiceResponse(data, reply, 'Thank you for rating us', 'success', 200);
       }
    })

};

module.exports.acceptedDataSP=function(request,reply){
    let payload=request.query;
    console.log('payload  in bookingAcceptedBySP ::: ',payload);
    bookingModel.acceptedDataSP(payload,function(err,data){

        if(err){
            responseFormatter.formatServiceResponse(err,reply, 'error occurred','error',400);
        }
        else{
            responseFormatter.formatServiceResponse(data,reply, 'Provider data fetched successfully','success',200);
        }
    })

};
module.exports.bookingConfirmedProduct=function(request,reply){
    let payload=request.payload
    bookingModel.bookingConfirmedProduct(payload,function(err,data){
        if(err){
            responseFormatter.formatServiceResponse(err,reply, 'error occurred','error',400);
        }
        else{
            responseFormatter.formatServiceResponse(data,reply, 'Booking created successfully','success',200);
        }
    })
}

module.exports.getSeekerBookingsByPagination = function(request, reply){

    logger.debug("query  : ",request.query," path :  ", request.path)
    let querystring = request.query;
    //if(querystring.filter.status == 'Current'){
    //    querystring.filter = {'seeker_id' : querystring.filter.seeker_id, $or :[ { "status" : 'Unconfirmed' }, {"status":"Confirmed"} ] };
    //}else {
    //    querystring.filter = {'seeker_id': querystring.filter.seeker_id, "status": 'Closed'};
    //}
    bookingModel.getSeekerBookingsByPagination(querystring, request.path, function(response){
        reply(response);

    });
};
module.exports.bulkUpdate=function(request,reply){
    let payload = request.payload;
    console.log('bulk update::: ', payload);
    bookingModel.bulkUpdateModel(payload,function(err,data){
        if(err){
            reply(err)
        }
        else{
            responseFormatter.formatServiceResponse(data,reply, 'bulk update','success',200);
        }
    })

};
module.exports.bookingCronStatus=function(request,reply){
    bookingModel.bookingCronStatus(function(err,data){
        if(err){
            reply(err)
        }
        else{
            responseFormatter.formatServiceResponse(data,reply, 'bulk update','success',200);
        }
    })
}

module.exports.getBookingDetailsForMonth = function(request,reply){
    let provider_id = request.params.provider_id;
    let month = request.query.month;
    let year = request.query.year;
    console.log('in handler in getBookingDetailsForMonth month ---> ::: ',request.query);
    bookingModel.getBookingDetailsForMonth(provider_id ,month,year, function(response){
        reply(response);
    })

};

module.exports.getAllBookedServicesByUserId=function(request,reply){
    let user_id =  request.auth.credentials.user_id;
    console.log('in handler getAllBookedServicesByUserId ::: ');
    bookingModel.getAllBookedServicesByUserId(user_id ,function(response){
        reply(response);
    })

};

module.exports.getAllBookedGigsForSpecificServiceByUserId  = function(request,reply){
    let user_id =  request.auth.credentials.user_id;
    let service_id = request.params.service_id;
    console.log('in handler getAllBookedGigsForSpecificServiceByUserId ::: ');
    bookingModel.getAllBookedGigsForSpecificServiceByUserId(service_id , user_id ,function(response){
        reply(response);
    })

};


