/**
 * Created by cl-macmini-149 on 31/01/17.
 */
'use strict';
const adminModel = require( 'model/admin.js' );
var gigModel =require('model/gigModel')


const Boom = require('boom');

const  log = require('Utils/logger.js');
const logger = log.getLogger();

const responseFormatter = require('Utils/responseformatter');

module.exports={};
module.exports.updateGigHandler=function(request,reply){
    let payload=request.payload
   gigModel.updateGigModel(payload,function(err,data){
       if(err){
           reply(err)
       }
       else{
           responseFormatter.formatServiceResponse(data,reply, 'Gig Updated successfully','success',200);
       }
   })

}
module.exports.createGigAdmin = function(request, reply){
    console.log("in handler activateMasterService :::  ",request.payload);
    gigModel.createGigAdminModel(request.payload , function(err,data){
        if(err){
            reply(err);
        }
        else{
            reply(data);
        }
    });
};
module.exports.addMapperHandler=function(request,reply){
    let payload=request.payload
    gigModel.addMapperModel(payload,function(err,data){
        if(err){
            reply(err)
        }
        else{
            reply(data)
        }
    })
};
module.exports.getAllGigsHandler=function(request,reply){
    gigModel.getAllGigsModel(function(err,data){
        if(err){
            reply(err)
        }
        else{
            responseFormatter.formatServiceResponse(data,reply, 'Fetched successfully','success',200);
        }
    })
};
module.exports.getGigsMapping=function(request,reply){
    gigModel.getGigsMapping(function(err,data){
        if(err){
            reply(err)
        }
        else{
            responseFormatter.formatServiceResponse(data,reply, 'Fetched successfully','success',200);
        }
    })
};

module.exports.getGigMappingByService=function(request,reply){
    const payload=request.query
    gigModel.getGigMappingByService(payload,function(err,data){
        if(err){
            reply(err)
        }
        else{
            responseFormatter.formatServiceResponse(data,reply, 'Fetched successfully','success',200);
        }
    })
}
module.exports.getGigMapperHandler=function(request,reply){
    let payload=request.query
    gigModel.getGigLocationModel(payload,function(err,data){
        if(err){
            reply(err)
        }
        else{
            responseFormatter.formatServiceResponse(data,reply, 'Fetched successfully','success',200);
        }
    })
};

module.exports.addGigSpecificParam=function(request,reply){
    let payload=request.payload
    gigModel.addGigSpecificParam(payload,function(err,data){
        if(err){
            reply(err)
        }
        else{
            responseFormatter.formatServiceResponse(data,reply, 'Added successfully','success',200);
        }
    })

}
module.exports.getGigSpecificParam=function(request,reply){
    let payload=request.query
    gigModel.getGigSpecificParam(payload,function(err,data){
        if(err){
            reply(err)
        }
        else{
            responseFormatter.formatServiceResponse(data,reply, 'Fetched successfully','success',200);
        }
    })

}
module.exports.updateMapperHandler=function(request,reply){
    let payload=request.payload
    gigModel.updateLocationModel(payload,function(err,data){
        if(err){
            reply(err)
        }
        else{
            responseFormatter.formatServiceResponse(data,reply, 'updated Successfully','success',200);
        }
    })
}
module.exports.getAllCategoriesByGigId = function(request,reply){
    let gig_id =request.query.gig_id;
    gigModel.getAllCategoriesByGigId(gig_id,function(err,data){
        if(err){
            reply(err)
        }
        else{
            responseFormatter.formatServiceResponse(data,reply, 'Fetched successfully','success',200);
        }
    })

}