var jwt = require('jsonwebtoken');

const config = require('./config/config')["dev"];

const auth = require("./middleware/auth");



const forwardingAddress = "https://6df64a65e414.ngrok.io"; //REplace with your https forwarding address


var apis = require('./controllers/apis.js');
var orders = require('./controllers/orders.js');
var products = require('./controllers/products.js');
var users = require('./controllers/users.js');

var rootMaster = {};


module.exports = rootMaster;

module.exports = function (app) {
    // app.get('/',apis.index);
    // app.post('/home',auth,apis.home);

    app.post('/login',users.login);
    app.post('/register',users.register);

    app.post('/itemcreation',auth, products.product_creation);
    app.get('/items',auth, products.product_get);
    app.post('/itemdelete',auth ,products.product_delete);

    app.post('/ordercreation',auth ,orders.order_creation);
    app.get('/orders',auth, orders.orders_get);
    app.get('/orders_days_wise',auth, orders.orders_days);
    app.get('/orders_purchase',auth,orders.product_purchase);
    app.post('/orderupdate', auth,orders.order_update);

    app.get('/logout',auth,apis.logout);

}
