/**
 * Created by cl-macmini-63 on 2/6/17.
 */
'use strict';

const SPProfileModel =require('model/SPprofilemodel');


const  log = require('Utils/logger.js');
const logger = log.getLogger();
let config=require('config')
const responseFormatter = require('Utils/responseformatter');

module.exports={};

module.exports.createSPProfile=function(request,reply){
    let payload=request.payload;
    console.log('payload  in createSPProfile ::: ',payload);
    SPProfileModel.createSPProfile(payload,function(err,data){
        if(err){
            reply(err)
        }
        else{
            responseFormatter.formatServiceResponse(data,reply, 'Fetched successfully','success',200);
        }
    })

};

module.exports.AddServicesAndGigs=function(request,reply){
    let payload=request.payload;
    SPProfileModel.AddServicesAndGigs1(payload, function(response){
        if(response.status == 'success'){
            reply(response);
        }
        else{
            console.log('error in updateMasterService',response);
            reply(response);
        }
    });

};

module.exports.addLocationsAndPricingToGig=function(request,reply){
    let payload=request.payload;
    console.log('payload  in addLocationsAndPricingToGig ::: ',payload);
    SPProfileModel.addLocationsAndPricingToGig(payload, function(err,data){
        if(err){
            reply(err);
        }
        else{
            responseFormatter.formatServiceResponse(data, reply, 'Gig-Location Mapping succesfullty done', 'success', 200);;
        }
    });

};

module.exports.addSPTimeSlots=function(request,reply){
    let payload=request.payload;
    console.log('add time slots ::: ',payload);
    SPProfileModel.addSPTimeSlots(payload, function(err,data){
        if(err){
            reply(err);
        }
        else{
            responseFormatter.formatServiceResponse(data,reply ,'Time Slot Added to Provider profile','success',200)
        }
    });
}
module.exports.updateSPTimeSlots = function(request,reply){
    let payload=request.payload;
    console.log('updateSPTimeSlots handler time slots ::: ',payload);
    SPProfileModel.updateSPTimeSlots(payload, function(err,data){
        if(err){
            reply(err);
        }
        else{
            responseFormatter.formatServiceResponse(data,reply ,'Time Slot updated to Provider profile','success',200)
        }
    });
}

module.exports.CategoriesByGigId = function(request,reply){
    let gig_id =request.query.gig_id;
    SPProfileModel.CategoriesByGigId(gig_id,function(err,data){
        if(err){
            reply(err)
        }
        else{
            responseFormatter.formatServiceResponse(data,reply, config.constants.messages.Success.get,'success',200);
        }
    })

}
//module.exports.getSPTimeSlots=function(request,reply){
//    console.log('payload  in AddServicesAndGigs ::: ',payload);
//    SPProfileModel.getSPTimeSlots(function(response){
//        if(response.status == 'success'){
//            reply(response);
//        }
//        else{
//            console.log('error in updateMasterService',response);
//            reply(response);
//        }
//    });
//}


module.exports.getAllProvidersByGigId = function(request, reply){
    console.log("in handler getAllProvidersByGigId :::  ");
    let service_id  = request.query.service_id;
    let gig_id = request.query.gig_id;
    let latitude = request.query.latitude;
    let longitude = request.query.longitude;
    SPProfileModel.getAllProvidersByGigId(service_id,gig_id,latitude,longitude,function(response){
        if(response.status == 'success'){
            reply(response);
        }
        else{
            console.log('error in getAllProvidersByGigId :: ',response);
            reply(response);
        }
    });
};

module.exports.getProvider = function(request, reply){
    let payload=request.query
    SPProfileModel.getProviderModelTemp(payload,function(err,data){
        if(err){
            reply(err)
        }
        else{
            responseFormatter.formatServiceResponse(data,reply, 'Fetched successfully','success',200);
        }
    });
};
module.exports.getSearch = function(request, reply){
    let payload=request.query
    SPProfileModel.searchGigs(payload,function(err,data){
        if(err){
            reply(err)
        }
        else{
            responseFormatter.formatServiceResponse(data,reply, 'Fetched successfully','success',200);
        }
    });
};
module.exports.filterProviders = function(request, reply){
    console.log("in handler getAllProvidersByGigId :::  payload  : ",JSON.stringify(request.payload));
    SPProfileModel.filterProviders(request.payload,function(err,data){
        console.log('in handler response from filter api -----',err , data);
        //if(response.status == 'success'){
        //    reply(response);
        //}
        //else{
        //    console.log('error in filterProviders',response);
        //    reply(response);
        //}
        if(err){
           reply(err)
        }
        else{
            if(!data || data[0]== null || data.length == 0){
                responseFormatter.formatServiceResponse([],reply, 'No Provider Details Found','success',200);

            }else{
                responseFormatter.formatServiceResponse(data,reply, 'Fetched successfully','success',200);
            }

        }
    });
};
module.exports.pushTestHandler=function(request,reply){
    let payload=request.payload
console.log("payload",payload)
    SPProfileModel.pushTestModel(payload,function(err,data){
        if(err){
          reply(err)
        }
        else{
            responseFormatter.formatServiceResponse(data,reply, 'sent successfully','success',200);
        }
    })
}

module.exports.getProviderBookings = function(request, reply){
    let payload=request.query
    SPProfileModel.getProviderBookings(payload,function(err,data){
        if(err){
            reply(err)
        }
        else{
            responseFormatter.formatServiceResponse(data,reply, 'Fetched successfully','success',200);
        }
    });
};

module.exports.getGigInfoForProvider = function(request, reply){
    let provider_id=request.params.provider_id;
    let gig_id=request.params.gig_id;
    let service_id=request.params.service_id;
    SPProfileModel.getGigInfoForProvider(provider_id,gig_id,service_id,function(err,data){
        if(err){
            reply(err)
        }
        else{
            responseFormatter.formatServiceResponse(data,reply, 'Fetched successfully','success',200);
        }
    });
};

module.exports.getProviderBookingsByPagination = function(request, reply){

    logger.debug("query  : ",request.query," path :  ", request.path)
    var querystring = request.query;
    SPProfileModel.getProviderBookingsByPagination(querystring, request.path, function(response){
        reply(response);

    });
};
module.exports.getProductBasedGigsForProvider = function(request, reply){
    let provider_id=request.params.provider_id;
    //let service_id=request.params.service_id;
    SPProfileModel.getProductBasedGigsForProvider(provider_id , function(err,data){
        if(err){
            reply(err)
        }
        else{
            responseFormatter.formatServiceResponse(data,reply, config.constants.messages.Success.get,'success',200);
        }
    });
};

module.exports.addProductInfoForGig = function(request, reply){
    SPProfileModel.addProductInfoForGig(request.payload , function(err,data){
        if(err){
            reply(err)
        }
        else{
            responseFormatter.formatServiceResponse(data,reply, config.constants.messages.Success.insertion,'success',200);
        }
    });
};

module.exports.getProductInfoForGig = function(request, reply){
    SPProfileModel.getProductInfoForGig(request.query, function(err,data){
        if(err){
            reply(err)
        }
        else{
            responseFormatter.formatServiceResponse(data,reply, config.constants.messages.Success.get,'success',200);
        }
    });
};

module.exports.getAllUnregisteredGigsByServiceId = function(request, reply){
    let provider_id=request.params.provider_id;
    let service_id=request.params.service_id;
    SPProfileModel.getAllUnregisteredGigsByServiceId(provider_id,service_id,function(err,data){
        if(err){
            responseFormatter.formatServiceResponse(err,reply, 'error occurred','error',400);
            //reply(err)
        }
        else{
            if(data && data.length ){
                responseFormatter.formatServiceResponse(data,reply, 'Fetched successfully','success',200);
            }
            else{
                responseFormatter.formatServiceResponse([],reply, 'No Gigs Found','error',404);
            }
        }
    });
};

module.exports.updateLocationsAndPricingToGig = function(request,reply){
    let payload=request.payload;
    console.log('payload  in handler updateLocationsAndPricingToGig ::: ',payload);
    SPProfileModel.updateLocationsAndPricingToGig(payload, function(err,data){
        if(err){
            reply(err);
        }
        else{
            responseFormatter.formatServiceResponse(data, reply, 'Gig-Location Mapping updated succesfullty', 'success', 200);;
        }
    });

};

module.exports.updateSPAvailability = function(request,reply){
    let payload=request.payload;
    console.log('payload  in handler updateSPAvailability ::: ',payload);
    SPProfileModel.updateSPAvailability(payload, function(data){
        console.log('in handler response from updateSPAvailability service : ',data)
        reply(data);
    });

};

module.exports.toggleDiscountFlagForSP = function(request,reply){
    let payload=request.payload;
    console.log('payload  in handler toggleDiscountFlagForSP ::: ',payload);
    SPProfileModel.toggleDiscountFlagForSP(payload, function(data){
        console.log('in handler response from updateSPAvailability service : ',data)
        reply(data);
    });

};

module.exports.updateSPRevenuePaymentStatusDummy = function(request,reply){
    let payload=request.payload;
    console.log('payload  in handler updateSPRevenuePaymentStatusDummy ::: ',payload);
    SPProfileModel.updateSPRevenuePaymentStatusDummy(payload, function(data){
        console.log('in handler response from updateSPRevenuePaymentStatusDummy service : ',data)
        reply(data);
    });

};

module.exports.addOrganizationData = function(request, reply){
    let provider_id =  request.auth.credentials.user_id;
    SPProfileModel.addOrganizationData(request.payload ,provider_id, function(err,data){
        if(err){
            reply(err)
        }
        else{
            responseFormatter.formatServiceResponse(data,reply, 'SP Organization Inserted Successfully','success',200);
        }
    });
};

module.exports.addBankDetails = function(request, reply){
    SPProfileModel.addBankDetails(request.payload , function(err,data){
        if(err){
            reply(err)
        }
        else{
            responseFormatter.formatServiceResponse(data,reply, 'SP Organization Bank Details Inserted Successfully','success',200);
        }
    });
};

module.exports.addInsuranceDetails = function(request, reply){
    SPProfileModel.addInsuranceDetails(request.payload , function(err,data){
        if(err){
            reply(err)
        }
        else{
            if(data){
                responseFormatter.formatServiceResponse(data,reply, 'SP Organization Insurance Details Inserted Successfully','success',200);
            }else{
                responseFormatter.formatServiceResponse(data,reply, 'SP Organization Profile not found','error',404);

            }
        }
    });
};

module.exports.getAllApprovedReviews = function(request, reply){
    SPProfileModel.getAllApprovedReviews(request.query.provider_id, function(err,data){
        if(err){
            reply(err)
        }
        else{
            responseFormatter.formatServiceResponse(data,reply, config.constants.messages.Success.get,'success',200);
        }
    });
};