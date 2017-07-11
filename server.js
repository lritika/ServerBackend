'use strict';

process.env['PREPARE_TABLES'] = 'true';
process.env['MUST_DEBUG'] = 'true';
process.env['REDIS_USE_UNIX_DOMAIN_SOCKET'] = 'true';
process.env['REDIS_USE_TCP'] = 'false';
require('app-module-path').addPath(__dirname);

if (process.env.NODE_ENV == "live") {
    global.environment = "production";
} else if (process.env.NODE_ENV == "test") {
    global.environment = "testing";
} else if (process.env.NODE_ENV == "dev") {
    global.environment = "development";
} else {
    process.env.NODE_ENV = global.environment = "development";
}
console.log("process.env.NODE_ENV", process.env.NODE_ENV)
//let environment;
//if (process.env.NODE_ENV) {
//    environment = process.env.NODE_ENV;
//} else {
//    environment = 'development';
//}

//environment = environment.toLowerCase();
/**
 * Very important
 */
//switch (environment) {
//    case "localhost":
//        environment = "development";
//        break;
//    case "production":
//    case "testing":
//    case "development":
//        break;
//    default:
//        environment = "development";
//}
process.env.NODE_ENV = environment;
//process.env.IS_STARTED = false;
//if (environment !== 'development') {
//    process.env['MUST_DEBUG'] = 'false';
//}
const Path = require('path');
const Hapi = require('hapi');

var log = require('Utils/logger.js');

var logger = log.getLogger();


const config = require("config");
const user = require('./model/auth.js');
const admin = require('./model/admin.js');
const socket=require('Utils/socketNew')
let moment=require('moment')

//const HapiSwagger = require('hapi-swagger');
const Pack = require('package');
var raven = require('raven');
/*const swaggerOptions = {
    info: {
        'title': 'Skeleton API documentation',
        'version': Pack.version
    }
};*/
var client = new raven.Client('http://50e2e32074d14bf5aae007b78f9dee20:a778b077f2a94fb783820f8aa6e516a5@sentry.clicklabs.in:9000/45');
const socketConfig = config.socket;



const server = new Hapi.Server({
    debug: {request: ['error']},
    connections: {
        router: {
            stripTrailingSlash: true
        },
        routes: {
            cors: true,
            files: {
                relativeTo: Path.join(__dirname, 'public')
            }
        }
    }
});
server.connection({
    routes: {cors: true},
    host: socketConfig.mainServer.ipAddress,
    port: socketConfig.mainServer.portNumber
});

function handler (req, res) {
    fs.readFile(__dirname + '/index.html',
        function (err, data) {
            if (err) {
                res.writeHead(500);
                return res.end('Error loading index.html');
            }

            res.writeHead(200);
            res.end(data);
        });
}


//register logger
server.register({
        register: require('Utils/logger.js'),

    },
    function (err) {
        if (err) {
            throw err; // something bad happened loading the plugin
        }
    });


//setup swagger options and register swagger plugin
var swaggerOptions = {
    //basePath: 'http://localhost:3001',
    //basePath: 'http://52.206.153.254:3001',
    apiVersion: Pack.version,
    /*authorizations: {
     default: {
     type: "apiKey",
     passAs: "header",
     keyname: "authentication"
     }
     },*/  //for now no authorization
    info: {
        title: 'futrun',
        description: 'REST API for futrun',
        contact: 'info@click-labs.co.in',
        license: 'All rights reserverd. For private use only',
        licenseUrl: '/license'
    }
};

server.register({
    register: require('hapi-swagger'),
    options: swaggerOptions
}, function (err) {
    if (err) {
        server.log(['error'], 'hapi-swagger load error: ' + err)
    }else{
        server.log(['start'], 'hapi-swagger interface loaded')
    }
});


//we use views only for swagger documentation
server.views({
    path: 'templates',
    engines: { html: require('handlebars') },
    partialsPath: 'templates/withPartials',
    helpersPath: 'templates/helpers',
    isCached: false
});


var plugins = [
    {
        register: require('hapi-auth-bearer-token')
    },
    {
        register: require('hapi-authorization'),
        options: {
            roles: ['SEEKER','PROVIDER', 'ADMIN']	// Can also reference a function which returns an array of roles
        }
    }
];

//register auth token module

server.register(plugins, function (err) {
    console.log("PRS")
    server.auth.strategy('token1', 'bearer-access-token', {
        allowQueryToken: false,              // optional, true by default
        allowMultipleHeaders: false,        // optional, false by default
        accessTokenName: 'authToken',    // optional, 'access_token' by default
        validateFunc: user.validate
    });
    
    server.auth.strategy('token2', 'bearer-access-token', {
        allowQueryToken: false,              // optional, true by default
        allowMultipleHeaders: false,        // optional, false by default
        accessTokenName: 'authToken',    // optional, 'access_token' by default
        validateFunc: admin.validate
    });
    //const routes = require('route');
    
});

//to make sure auth is turned on by default and security is not overlooked
 server.auth.default('token1');
//register user

server.register([
            {
                register: require('route/config/usercontroller.js'),
            },
            {
                register: require('route/config/authcontroller.js'),
            },
            {
                register: require('route/config/phoneotpcontroller.js'),
            },
            {
                register: require('route/config/admincontroller.js'),
            },
            {
                register: require('route/config/masterserviceroute.js'),
            },
            {
                register: require('route/config/gigRoute.js'),
            },
            {
                register: require('route/config/cardroute.js'),
            },
            {
                register: require('route/config/locationroute.js'),
            },
            {
                register: require('route/config/SProute.js'),
            },
            {
                register: require('route/config/bookingroute.js'),
            },
            {
                register: require('route/config/adminglobaldataroute.js'),
            },
            {
                register: require('route/config/organizationtyperoute.js'),
            },
            {
                register: require('route/config/promotionroute.js'),
            },
            {
                register: require('route/config/supportroute.js'),
            },
            {
                register: require('route/config/userreffralcoderoute.js'),
            }

],
            function (err) {
                if (err) {
                    console.log("VKS",err);
            throw err; // something bad happened loading the plugin
        }
    });

server.on('response', function (request) {
    logger.info(new Date(),
        request.info.remoteAddress + ': ' +
        request.method.toUpperCase() + ' ' +
        request.url.path +
        ' --> ' + request.response.statusCode);
});
socket.connectSocket(server);
server.start(function () {
    logger.info('Server started as', server.info.uri);
});

//if all modules found, initialize db connection
require('Utils/dbconnection.js');




