var commonmodelService = require('../services/commonmodelService.js');
var jwt = require('jsonwebtoken');
var usermaster = {};
const config = require('../config/config')[process.env.NODE_ENV || "dev"];
const apiKey = process.env.SHOPIFY_API_KEY;
const apiSecret = process.env.SHOPIFY_API_SECRET;
const forwardingAddress = config.middleware_endpoint;
const shopurl = config.shopurl;

const scopes = 'write_products,write_inventory';
const crypto = require('crypto');
const cookie = require('cookie');
const nonce = require('nonce')();
const querystring = require('querystring');
const request = require('request-promise');
const { access } = require('fs');
const { promises } = require('dns');
const shell = require('shelljs');
var uniqid = require('uniqid');
const { Console } = require('console');
const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default;

var helper = require('../services/helper.js');
var User =  require('../models/UserModel');

const Joi = require('joi');

const bcrypt = require('bcrypt');



const custitem_zoku_website_name = config.custitem_zoku_website_name;
var dt = new Date();

var currentDt = `${dt.getFullYear().toString().padStart(4, '0')}/${(dt.getMonth() + 1).toString().padStart(2, '0')}/${dt.getDate().toString().padStart(2, '0')} ${dt.getHours().toString().padStart(2, '0')}:${dt.getMinutes().toString().padStart(2, '0')}:${dt.getSeconds().toString().padStart(2, '0')}`;


//users
usermaster.login = async function (req, res) {

    try {
        // Get user input
        const { email, password } = req.body;
    
        // Validate user input
        if (!(email && password)) {
          res.status(400).send("All input is required");
        }
        // Validate if user exist in our database
        const user = await User.findOne({ email });
    
        if (user && (await bcrypt.compare(password, user.password))) {
          // Create token
          const token = jwt.sign(
            { user_id: user._id, email },
            config.token,
            {
              expiresIn: "2h",
            }
          );
            
          reqObj = { 'data': user,'token': token};
          // save user token
          // user
          res.status(200).json(reqObj);
        }
        res.status(400).send("Invalid Credentials");
      } catch (err) {
        console.log(err);
      }

}
usermaster.register = async function (req, res) {


    try {
        // Get user input
        const { first_name, last_name, email, password } = req.body;
    
        // Validate user input
        if (!(email && password && first_name && last_name)) {
          res.status(400).send("All input is required");
        }
    
        // check if user already exist
        // Validate if user exist in our database
        const oldUser = await User.findOne({ email });
    
        if (oldUser) {
          return res.status(409).send("User Already Exist. Please Login");
        }
    
        //Encrypt user password
        encryptedPassword = await bcrypt.hash(password, 10);
    
        // Create user in our database
        const user = await User.create({
          first_name,
          last_name,
          email: email.toLowerCase(), // sanitize: convert email to lowercase
          password: encryptedPassword,
        });
    
        // Create token
        const token = jwt.sign(
          { user_id: user._id, email },
          process.env.TOKEN_KEY,
          {
            expiresIn: "2h",
          }
        );
        // save user token
        user.token = token;
    
        // return new user
        res.status(201).json(user);
      } catch (err) {
        console.log(err);
      }
    
}

usermaster.get = function (req, res) {
  reqObj = {};
  commonmodelService.findAll('userModel', reqObj).then(result => {
    const response = helper.response({ message: ('products'), data: result });
    return res.status(response.statusCode).json(response);
  },err=>{
    //productCreationProcess(itemLists,index)

    return res.status(500).json(err);
    //  printConsoleLog(err);
  })

}
usermaster.delete = function (req, res) {

  reqObj = { '_id': req.body._id };

  commonmodelService.findAndRemove('productModel', reqObj).then(result => {
    const response = helper.response({ message: ('products_deleted'), data: result });
    return res.status(response.statusCode).json(response);
  },err=>{
    //productCreationProcess(itemLists,index)

    return res.status(500).json(err);
    //  printConsoleLog(err);
  })

}
  
module.exports = usermaster;
