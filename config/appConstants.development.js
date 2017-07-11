'use strict';


module.exports = {
	pushCreds:{
		androidPushSettings: {
			seeker: {
			brandName: "Futran CP",
			gcmSender: "AAAA5upmMiM:APA91bGjdRAYuQ9fxWG6bvBsRw5xOudY06j8B2ACm82LvPFDsaVNrYwR32zK9fbx6G8cuaRcieZBlRB548SH_gX4seIGgsCXZ1fHdnU1XG6mjq0YFBkvGh8xL2tCUOVuCz1pD82A1NaM"
		},
			provider: {
			brandName: "FutranSP",
			gcmSender: "AAAAb6HjB8Q:APA91bEmKshzue3jYDy-NQeol2tQnFDUHHhWn1ZgecTsP3azk0w8GPq2l3JxF88JVZSUE30dYweZHGxjRiGJyJ-t7jBVNfE-khHGwkAN26bohXRYnCeUP4zXSpIZm1X-sQzTsToLOdQO"
		}
	},
		iOSPushSettings : {
		seeker: {
			iosApnCertificate: "certs/Futran_Seeker.pem",
			gateway: "gateway.push.apple.com"
		},
		provider: {
			iosApnCertificate: "certs/Futran_Provider.pem",
			gateway: "gateway.push.apple.com"
		}
	}
	},
	twilioCreds:{
		accountSid : 'ACe2a8c10ee55df6f2f5acf0ccf1f547b2',
		authToken : 'd5a466e5d181d0f7abfb696e8cbd3958',
		smsFromNumber : '+18666221441'
	},
	Mandrill:{
		host: "smtp.mandrillapp.com", // hostname
		//secureConnection: true, // use SSL
		port: 587, // port for secure SMTP
		auth: {
			user: "GigsInaJiffy",
			pass: "Zyohk5d5ZKQZR5U-47E-5A"
		}
	},
	validUploadMimeTypes :   {
		'image/png' :      1 ,
		'image/jpeg' :     1 ,
		'image/x-ms-bmp' : 1

	} ,
	dateTimeFormat :         'YYYY-MM-DD' ,
	dateTimeFormatInternal : 'YYYY-MM-DD hh:mm:ss' ,
	deviceTypes :            {
		IOS :     'IOS' ,
		ANDROID : 'ANDROID'
	} ,
	referral :               {
		startAt : 'AAA0002'
	} ,
	errors :                 {
		eng : {
			db :         {
				DB_NOT_INITIALIZED_PROPERLY : {
					statusCode :    500 ,
					message : 'DB_NOT_INITIALIZED_PROPERLY' ,
					type :          'DB_NOT_INITIALIZED_PROPERLY'
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
					statusCode :    404 ,
					message : 'This email is not registered with us, please sign up' ,
					type :          'EMAIL_NOT_REGISTERED'
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
			violation :  {
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
				}
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
		} ,
		fr :  {
			db :         {
				DB_NOT_INITIALIZED_PROPERLY : {
					statusCode :    500 ,
					message : 'DB NON INITIALISÉ BIEN' ,
					type :          'DB_NOT_INITIALIZED_PROPERLY'
				} ,
				PLEASE_TRY_AGAIN :            {
					statusCode :    500 ,
					message : 'VEUILLEZ RÉESSAYER' ,
					type :          'PLEASE_TRY_AGAIN'
				}
			} ,
			notFound :   {
				STRIPE_USER_NOT_FOUND :         {
					statusCode :    404 ,
					message : 'Veuillez ajouter une carte' ,
					type :          'STRIPE_USER_NOT_FOUND'
				} ,
				CARD_NOT_FOUND :                {
					statusCode :    404 ,
					message : "La carte n'existe pas" ,
					type :          'CARD_NOT_FOUND'
				} ,
				REFEREE_NOT_FOUND :             {
					statusCode :    404 ,
					message : "L'arbitre n'existe pas" ,
					type :          'REFEREE_NOT_FOUND'
				} ,
				USER_NOT_FOUND :                {
					statusCode :    404 ,
					message : "L'utilisateur n'existe pas" ,
					type :          'USER_NOT_FOUND'
				} ,
				EMAIL_NOT_REGISTERED :          {
					statusCode :    404 ,
					message : "Ce courriel n'est pas enregistré chez nous, inscrivez-vous" ,
					type :          'EMAIL_NOT_REGISTERED'
				} ,
				NO_MEMBERSHIP_MATCH_THE_QUERY : {
					statusCode :    404 ,
					message : 'Aucune correspondance avec les filtres indiqués' ,
					type :          'NO_MEMBERSHIP_MATCH_THE_QUERY'
				} ,
				NO_OCCASSIONS_MATCH_THE_QUERY : {
					statusCode :    404 ,
					message : 'Aucune correspondance des occasions avec les filtres donnés' ,
					type :          'NO_OCCASSIONS_MATCH_THE_QUERY'
				}
			} ,
			violation :  {
				CARD_DECLINED :                {
					statusCode :    400 ,
					message : "La carte a été refusée" ,
					type :          'CARD_DECLINED'
				} ,
				INVALID_FILE_TYPE :            {
					statusCode :    400 ,
					message : 'Seuls les fichiers jpg, jpeg, png et bmp sont autorisés pour le téléchargement' ,
					type :          'INVALID_FILE_TYPE'
				} ,
				INSURANCE_DETAILS_INCOMPLETE : {
					statusCode :    400 ,
					message : 'InsurancePolicyNumber, insuranceIssuedByCompany et insuranceExpirationDate tous sont exigés' ,
					type :          'INSURANCE_DETAILS_INCOMPLETE'
				} ,
				INVALID_MEMBERSHIP :           {
					statusCode :    400 ,
					message : "L'appartenance sélectionnée n'est pas valide pour vous" ,
					type :          'INVALID_MEMBERSHIP'
				} ,
				INVALID_CREDENTIALS :          {
					statusCode :    400 ,
					message : "Le nom d'utilisateur ou le mot de passe n'est pas valide" ,
					type :          'INVALID_CREDENTIALS'
				} ,
				UNAUTHORIZED_ACCOUNT_STATE :   {
					statusCode :    400 ,
					message : 'Ce compte a été marqué comme non valide' ,
					type :          'UNAUTHORIZED_ACCOUNT_STATE'
				} ,
				INVALID_ACCESS_TOKEN :         {
					statusCode :    401 ,
					message : "Le jeton n'est plus valide" ,
					type :          'INVALID_ACCESS_TOKEN'
				} ,
				INVALID_ACCESS_TOKEN_FORMAT :  {
					statusCode :    401 ,
					message : "Le jeton n'est pas en format valide (Assurez-vous de ne pas envoyer de porteur)" ,
					type :          'INVALID_ACCESS_TOKEN_FORMAT'
				} ,
				THE_ID_IS_INVALID :            {
					statusCode :    400 ,
					message : "L'ID donné n'est pas valide" ,
					type :          'THE_ID_IS_INVALID'
				} ,
				REFERRAL_CODE_IS_YOURS :       {
					statusCode :    400 ,
					message : 'Vous ne pouvez pas utiliser votre propre code de référence pour vous inscrire' ,
					type :          'REFERRAL_CODE_IS_YOURS'
				}
			} ,
			conflicts :  {
				DUPLICATE_CARD_DETAILS :      {
					statusCode :    409 ,
					message : "Cette carte est déjà enregistrée chez nous" ,
					type :          'DUPLICATE_CARD_DETAILS'
				} ,
				EMAIL_ALREADY_EXISTS :        {
					statusCode :    409 ,
					message : 'Cet e-mail est déjà enregistré avec nous, veuillez vous inscrire avec un identifiant de messagerie différent.' ,
					type :          'EMAIL_ALREADY_EXIST'
				} ,
				PHONE_NUMBER_ALREADY_EXISTS : {
					statusCode :    409 ,
					message : 'Ce numéro de téléphone est déjà enregistré chez nous, inscrivez-vous avec un numéro de téléphone différent.' ,
					type :          'PHONE_NUMBER_ALREADY_EXISTS'
				} ,
				FACEBOOK_ID_ALREADY_EXISTS :  {
					statusCode :    409 ,
					message : 'Ce compte facebook est déjà enregistré chez nous, veuillez vous inscrire à un autre compte.' ,
					type :          'FACEBOOK_ID_ALREADY_EXISTS'
				} ,
				LINKEDIN_ID_ALREADY_EXISTS :  {
					statusCode :    409 ,
					message : 'Ce compte LinkedIn est déjà enregistré chez nous, veuillez vous inscrire à un autre compte.' ,
					type :          'LINKEDIN_ID_ALREADY_EXISTS'
				}
			} ,
			misMatches : {
				PASSWORDS_DIFFERENT : {
					statusCode :    400 ,
					message : 'Les mots de passe ne correspondent pas.' ,
					type :          'PASSWORDS_DIFFERENT'
				}
			} ,
			missing :    {
				INSUFFICIENT_INFORMATION_PROVIDED : {
					statusCode :    400 ,
					message : "L'information fournie n'était pas suffisante pour obtenir des résultats" ,
					type :          'INSUFFICIENT_INFORMATION_PROVIDED'
				}
			}
		}
	} ,
	authActions :            {
		SUCCESSFUL_LOGIN :   'SUCCESSFUL_LOGIN' ,
		ACCESS_TOKEN_LOGIN : 'ACCESS_TOKEN_LOGIN'
	} ,
	notification :           {
		states : [
			'UNREAD' ,
			'READ' ,
			'DELETED' ,
			'ARCHIVED'
		]
	} ,
	accountStates :          {
		"ACTIVE" :                                    "ACTIVE" ,
		"MEMBERSHIP_PAYMENT_PENDING" :                "MEMBERSHIP_PAYMENT_PENDING" ,
		"PENDING_VERIFICATION" :                      "PENDING_VERIFICATION" ,
		"BLOCKED_BY_ADMIN" :                          "BLOCKED_BY_ADMIN" ,
		"DISABLED_BY_ADMIN" :                         "DISABLED_BY_ADMIN" ,
		"DISABLED_AUTHENTICATION_ATTEMPTS_EXCEEDED" : "DISABLED_AUTHENTICATION_ATTEMPTS_EXCEEDED" ,
		"DISABLED_ACCOUNT_LIFETIME_EXPIRED" :         "DISABLED_ACCOUNT_LIFETIME_EXPIRED"
	} ,
	occassions :             {
		"BIRTHDAY" : "Birthday"
	} ,
	membershipTypes :        {
		"FREE" :    {
			name :                  "FREE" ,
			ammountValue :          0 ,
			ammountMeasuredInUnit : 'cents' ,
			currency :              'USD'
		} ,
		"PREMIUM" : {
			name :                  "PREMIUM" ,
			ammountValue :          20 * 1e2 ,
			ammountMeasuredInUnit : 'cents' ,
			currency :              'USD'
		}
	},
	messages:      {
		Success:{
			insertion :"insertion successful",
			deletion  :"deletion successful",
			updation  :"updation successful",
			get  :"Fetched Successfully"
		},
		error:{
			"dbError":"db_error",
			locationNOtFound:"location_not_found"

		}
	}

};


