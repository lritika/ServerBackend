'use strict';
	var errors = {
		db :         {
			DB_NOT_INITIALIZED_PROPERLY : {//***Should be matched
				statusCode :    500 ,
					 message : 'DB_NOT_INITIALIZED_PROPERLY' ,
					 type :          'DB_NOT_INITIALIZED_PROPERLY'//** Should be matched
			} ,
			PLEASE_TRY_AGAIN :            {
				statusCode :    500 ,
					 message : 'PLEASE_TRY_AGAIN' ,
					 type :          'PLEASE_TRY_AGAIN'
			}
		} ,
		notFound :   {
			STRIPE_USER_NOT_FOUND :         {
				statusCode :    404 ,
					 message : 'Please add a card first' ,
					 type :          'STRIPE_USER_NOT_FOUND'
			} ,
			CARD_NOT_FOUND :                {
				statusCode :    404 ,
					 message : 'The card does not exist' ,
					 type :          'CARD_NOT_FOUND'
			} ,
			REFEREE_NOT_FOUND :             {
				statusCode :    404 ,
					 message : 'The referee does not exist' ,
					 type :          'REFEREE_NOT_FOUND'
			} ,
			USER_NOT_FOUND :                {
				statusCode :    404 ,
					 message : 'The user does not exist' ,
					 type :          'USER_NOT_FOUND'
			} ,
			EMAIL_NOT_REGISTERED :          {
				"status": "error",
				"error_type": "email_not_registered",
				"message": "Error",
				"data": {},
				"statusCode": 400
			} ,
			NO_MEMBERSHIP_MATCH_THE_QUERY : {
				statusCode :    404 ,
					 message : 'No membership(s) match with the given filters' ,
					 type :          'NO_MEMBERSHIP_MATCH_THE_QUERY'
			} ,
			NO_OCCASSIONS_MATCH_THE_QUERY : {
				statusCode :    404 ,
					 message : 'No occassion(s) match with the given filters' ,
					 type :          'NO_OCCASSIONS_MATCH_THE_QUERY'
			}

		} ,
		violation :
		{
			OTP_NOT_VERIFIED : {
				statusCode :    400 ,
				message : 'OTP not verified' ,
				type :          'OTP_NOT_VERIFIED'
			},
			CARD_DECLINED :                {
				statusCode :    400 ,
					 message : 'The card has been declined' ,
					 type :          'CARD_DECLINED'
			} ,
			INVALID_FILE_TYPE :            {
				statusCode :    400 ,
					 message : 'Only jpg, jpeg, png and bmp files are allowed for upload' ,
					 type :          'INVALID_FILE_TYPE'
			} ,
			INSURANCE_DETAILS_INCOMPLETE : {
				statusCode :    400 ,
					 message : 'insurancePolicyNumber, insuranceIssuedByCompany and insuranceExpirationDate all are required' ,
					 type :          'INSURANCE_DETAILS_INCOMPLETE'
			} ,
			INVALID_MEMBERSHIP :           {
				statusCode :    400 ,
					 message : 'The membership selected is not valid for you' ,
					 type :          'INVALID_MEMBERSHIP'
			} ,
			INVALID_CREDENTIALS :          {
				statusCode :    400 ,
					 message : 'The username or password is not valid' ,
					 type :          'INVALID_CREDENTIALS'
			} ,
			UNAUTHORIZED_ACCOUNT_STATE :   {
				statusCode :    400 ,
					 message : 'This account has been marked invalid' ,
					 type :          'UNAUTHORIZED_ACCOUNT_STATE'
			} ,
			INVALID_ACCESS_TOKEN :         {
				statusCode :    401 ,
					 message : 'The token is not valid anymore' ,
					 type :          'INVALID_ACCESS_TOKEN'
			} ,
			INVALID_ACCESS_TOKEN_FORMAT :  {
				statusCode :    401 ,
					 message : 'The token is not in valid format(Please make sure you are not sending "bearer")' ,
					 type :          'INVALID_ACCESS_TOKEN_FORMAT'
			} ,
			THE_ID_IS_INVALID :            {
				statusCode :    400 ,
					 message : 'The given id is invalid' ,
					 type :          'THE_ID_IS_INVALID'
			} ,
			REFERRAL_CODE_IS_YOURS :       {
				statusCode :    400 ,
					 message : 'You can not use your own referral code to sign up' ,
					 type :          'REFERRAL_CODE_IS_YOURS'
			},
			PHONE_NOT_VERIFIED:{
				statusCode:400,
				message:'Phone not Verified',
				type:'PHONE_EMAIL_NOT_VERIFIED'
			},
			EMAIL_NOT_VERIFIED : {
				statusCode :    400 ,
				message : 'Email not verified' ,
				type :          'EMAIL_NOT_VERIFIED'
			},
		} ,
		conflicts :  {
			DUPLICATE_CARD_DETAILS :      {
				statusCode :    409 ,
					 message : 'This card is already registered with us.' ,
					 type :          'DUPLICATE_CARD_DETAILS'
			} ,
			EMAIL_ALREADY_EXISTS :        {
				statusCode :    409 ,
					 message : 'This email is already registered with us, please sign up with a different email id.' ,
					 type :          'EMAIL_ALREADY_EXIST'
			} ,
			PHONE_NUMBER_ALREADY_EXISTS : {
				statusCode :    409 ,
					 message : 'This phone number is already registered with us, please sign up with a different phone number.' ,
					 type :          'PHONE_NUMBER_ALREADY_EXISTS'
			} ,
			FACEBOOK_ID_ALREADY_EXISTS :  {
				statusCode :    409 ,
					 message : 'This facebook account is already registered with us, please sign up with a different account.' ,
					 type :          'FACEBOOK_ID_ALREADY_EXISTS'
			} ,
			LINKEDIN_ID_ALREADY_EXISTS :  {
				statusCode :    409 ,
					 message : 'This LinkedIn account is already registered with us, please sign up with a different account.' ,
					 type :          'LINKEDIN_ID_ALREADY_EXISTS'
			}
		} ,
		misMatches : {
			PASSWORDS_DIFFERENT : {
				statusCode :    400 ,
					 message : 'Passwords do not match.' ,
					 type :          'PASSWORDS_DIFFERENT'
			}
		} ,
		missing :    {
			INSUFFICIENT_INFORMATION_PROVIDED : {
				statusCode :    400 ,
					 message : 'The information provided was not sufficient to get results' ,
					 type :          'INSUFFICIENT_INFORMATION_PROVIDED'
			}
		}
	}
	var success={
		CREATED:{
			resetPassword:{
				"status": "success",
				"error_type": "",
				"message": "Reset Password Link have been sent",
				"statusCode": 200
			}
		},
		DEFAULT:{
			"status": "success",
			"error_type": "",
			"message": "Success",
			"statusCode": 200
		},
		UPDATED:{
			"status": "success",
			"error_type": "",
			"message": "Success",
			"statusCode": 200
		},

	}

	module.exports={
	errors:errors,
		success:success
}