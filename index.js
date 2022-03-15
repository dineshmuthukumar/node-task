const dotenv = require('dotenv').config();
const express = require('express');
const mongoose = require("mongoose");
const http = require('http');
const https = require('https');
const fs = require('fs');

const app = express();

const secureRoutes = express.Router();
const bodyParser = require('body-parser');
const cors = require('cors');
const moment = require('moment');
const config = require('./config/config')[ "dev"];
const port = config.node_port;
mongoose.Promise = global.Promise;
app.use(cors());
app.use(secureRoutes);
app.use(express.json());
require('./router')(app,config);





mongoose.connect(`${config.db}`,{ useNewUrlParser: true , useUnifiedTopology: true, useFindAndModify: false
 }).then(
     () => {
         console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
         console.log(' Middleware - Database connected as successfully');
         console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
     },
    err => {
         console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
         console.log(' Middleware - Database connection Error');
         console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
         console.log(err);
     }
 );

// app.listen(port,function () {
//     console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
//     console.log(' Middleware is listening the following port number: ' + port);
//     console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
// });

//var env = process.argv[2] || 'prod';
var env =  'dev';
switch (env) {
    case 'dev':
        const httpServer = http.createServer(app);


        httpServer.listen(port, () => {
            console.log('HTTP Server running on port ' + port);
            console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
            console.log(' Middleware is listening the following port number: ' + port);
            console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
        });
        break;
    case 'prod':
        const httpsServer = https.createServer({
            key: fs.readFileSync('/etc/letsencrypt/live/netsuiteshopify.ml/privkey.pem'),
            cert: fs.readFileSync('/etc/letsencrypt/live/netsuiteshopify.ml/fullchain.pem'),
          }, app);
        httpsServer.listen(port, () => {
            console.log('HTTPS Server running on port '+port);
            console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
            console.log(' Middleware is listening the following port number: ' + port);
            console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
        });
        break;
}


