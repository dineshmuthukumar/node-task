var commonmodelService = require('../services/commonmodelService.js');
var jwt = require('jsonwebtoken');
var productmaster = {};
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


const Joi = require('joi');

const custitem_zoku_website_name = config.custitem_zoku_website_name;
var dt = new Date();

var currentDt = `${dt.getFullYear().toString().padStart(4, '0')}/${(dt.getMonth() + 1).toString().padStart(2, '0')}/${dt.getDate().toString().padStart(2, '0')} ${dt.getHours().toString().padStart(2, '0')}:${dt.getMinutes().toString().padStart(2, '0')}:${dt.getSeconds().toString().padStart(2, '0')}`;


//product
productmaster.product_creation = function (req, res) {

    ///*********************************_Validator__****************************
    // const schema = Joi.object().options({ abortEarly: false }).keys({
    //   name: Joi.string().required().label("Name"),
    //   description: Joi.string().required().label("description")
    // }).unknown(true);

    //const { error } = schema.validate(req.body);

    // let errorMessage = {};

    // if (error) {      
    //     error.details.forEach(err => {
    //         errorMessage[err.context.key] = (err.message).replace(/"/g, "")
    //     })  
    // }

    // const errorResponse = helper.response({ status: 422, error:errorMessage });
    

   // if (error) return res.status(errorResponse.statusCode).json(errorResponse);

    //res.status(200).send("Welcome");

   // let errorMessage = {};

    try {
     
       reqObj = { 'name': req.body.name, 'description': req.body.description,'amount':req.body.amount };
       if(req.body._id){   
         reqObj._id = req.body._id;
       } 
     
        commonmodelService.addAndUpdate('productModel', reqObj).then(result => {
          const response = helper.response({ message: ('product inserted or updated'), data: result });
          return res.status(response.statusCode).json(response);
        },err=>{
          return res.status(500).json(err);
          
        })
    } catch (err) {
      if (err[0] != undefined) {
          for (i in err.errors) {
              return res.status(422).json(err.errors[i].message);
          }
      } else {
          return res.status(422).json(err);
      }
    }
}

productmaster.product_get = function (req, res) {
  commonmodelService.findAll('productModel', {}).then(result => {
    console.log(result);
    const response = helper.response({ message: ('products'), data: result });
    return res.status(response.statusCode).json(response);
  },err=>{
    return res.status(500).json(err);
  })

 

}
productmaster.product_delete = function (req, res) {

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
  


  module.exports = productmaster;
