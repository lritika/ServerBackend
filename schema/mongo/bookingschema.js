/**
 * Created by Chandan Prashant on 22/02/17.
 */
var log = require('../../Utils/logger.js');
var logger = log.getLogger();

var mongoose = require('mongoose');
var joi = require('joi');
//mongoose schema
var bookingSchema = mongoose.Schema({
      seeker_id             :String,
      seeker_name           :String,
      seeker_device_token   :String,
      seeker_device_type    :String,
      seeker_image          : {
        original    : {type: String, default: null},
        thumbnail   : {type: String, default: null}
       },
      provider_id             :String,
      provider_name           :String,
      provider_device_token   :String,
      provider_device_type    :String,
        provider_image          : {
            original    : {type: String, default: null},
            thumbnail   : {type: String, default: null}
        },
      booking_type            :String,                      // ODS , RFP , SCHEDULE
      booking_item_info       :{
        service_id      :String,
        gig_id          :String,
        service_name    :String,
        gig_name        :String,
        booked_price_value:String,
        booked_price_type:String,
      },
     booking_address        :{
        Address1    :String,
        Address2    :String,
        City        :String,
        State       :String,
        ZipCode     :String,
        Country     :String
    },
    booking_latitude    :String,
    booking_longitude   :String,
        booking_address1:{
            Address1 :String,
            Address2 :String,
            City:String,
            State:String,
            ZipCode:String,
            Country:String,
        },
        booking_latitude1:String,
        booking_longitude1:String,
    virtual_address:String,
    is_seeker_location  :Boolean,
    is_accepted         :{type:Boolean,default:false},
    is_rejected         :{type:Boolean,default:false},
    status              : String ,                   // 1 Unconfirmed 2. Confirmed 3. Closed 4. Rejected   (post this status on the basis of current status)
    current_status_info : [{                          // 1. Accepted 2. On-the-way 3. Start 4. Pause 5. Resume 6. End 7. Not accepted 8. Rate 9. Expire 10. Cancelled by admin/CP/SP4. Payment Success / failure
        status    : String,
        datetime  : String,
        status_by : String                  // PROVIDER, SEEKER
    }],
    
    ODS_type            : String,
    seeker_avg_rating   : {type : String , default : "3"},
    SP_avg_rating       : {type : String , default : "3"},
    seeker_rating       : {
        feedback    : {type : String , default : ''},
        rating      : {type : String , default : '0'}
    },
    SP_rating           : {
        feedback    : {type : String , default : ''},
        rating      : {type : String , default : '0'}
    },
    booking_datetime: Date,
    tools           : {type:Boolean,default:false},
    supplies        : {type:Boolean,default:false},
    description     : String,
    unit            : String,
    quantity        : String,
    rejection_reason:String,
        net_amount:String,
    is_product_based:{type:Boolean,default:false},
    pre_on_the_way:{type:Boolean,default:false}
    },
    {timestamps: true},
    {
        collection: 'booking',
    }
);

module.exports.Booking = mongoose.model('Booking', bookingSchema, 'booking');