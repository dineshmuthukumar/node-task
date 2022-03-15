var commonmodelService = require('../services/commonmodelService.js');
var order = require('../models/OrderModel.js');
var product = require('../models/ProductModel.js');
var user = require('../models/UserModel.js');
var jwt = require('jsonwebtoken');
var ordersmaster = {};
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

var dt = new Date();

var currentDt = `${dt.getFullYear().toString().padStart(4, '0')}/${(dt.getMonth() + 1).toString().padStart(2, '0')}/${dt.getDate().toString().padStart(2, '0')} ${dt.getHours().toString().padStart(2, '0')}:${dt.getMinutes().toString().padStart(2, '0')}:${dt.getSeconds().toString().padStart(2, '0')}`;

var helper = require('../services/helper.js');

ordersmaster.order_creation = function (req, res) {
  

  try {
     
    reqObj = { 'user_id': req.body.user_id, 'product_id': req.body.product_id,'quantity': req.body.quantity,"amount": req.body.amount,"status":"pending","created_at":currentDt,"updated_at": currentDt};
  
     commonmodelService.addAndUpdate('orderModel', reqObj).then(result => {
       const response = helper.response({ message: ('order inserted or updated'), data: result });
       return res.status(response.statusCode).json(response);
     },err=>{
       //productCreationProcess(itemLists,index)

       return res.status(500).json(err);
       //  printConsoleLog(err);
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

ordersmaster.orders_get = function (req, res) {
  let sort = {};
  var populateQuery = [{ path: 'user_id', model: user,select: [] },{ path: 'product_id', model: product,select: [] }];
  if(req.query.sort){
    let arr = req.query.sort.toString().split(","); 
    for(const val of arr) { 
      sort[val] = 1;
      sort[val] = 1;
    }
  } 
  let search_value = {};
 
  if(req.query.search_text){
    let regex = req.query.search_text;
    search_value = {$and: [ { $or: [{amount: regex },{quantity: regex}] } ]};
  } 
  //console.log(search_value);
  commonmodelService._get(order,search_value, {}, {sort: sort,populate: populateQuery,}).then(result => {
    const response = helper.response({ message: ('products'), data: result });
    return res.status(response.statusCode).json(response);
  },err=>{
    return res.status(500).json(err);
  })

}

//order updated , order Cancel
ordersmaster.order_update = function (req, res) {

  reqObj = {'_id':req.body._id}; 
  commonmodelService.findOne('orderModel', reqObj).then(tableresult => {
    reqObj= {'_id':req.body._id,"status":req.body.status}
      commonmodelService.addAndUpdate('orderModel', reqObj).then(result => {
        const response = helper.response({ message: ('products'), data: result });
        return res.status(response.statusCode).json(response);
      },err=>{
        //productCreationProcess(itemLists,index)

        return res.status(500).json(err);
        //  printConsoleLog(err);
      })
  })
}

ordersmaster.orders_days = function (req, res) {
  order.aggregate([
    {
        "$group": {
            "_id": "$created_at",
            "quantity": { "$sum": "$quantity" }
        }
    },
    { "$sort": { "quantity": -1 } },
    { "$limit": 5 }
  ]).exec(function(error, orders){
    return res.status(200).json(orders);
  });

}

ordersmaster.product_purchase = function (req, res) {
  order.aggregate([
    {
        "$group": {
            "_id": "$user_id",
            "quantity": { "$sum": "$quantity" }
        }
    },{
        "$lookup": {
             "from": "users",
             "localField": "_id",
             "foreignField": "user_id",
             "as": "user"
        }
    },{
      "$lookup": {
           "from": "product",
           "localField": "_id",
           "foreignField": "product_id",
           "as": "products"
      }
  },
    { "$sort": { "quantity": -1 } },
    { "$limit": 5 }
  ]).exec(function(error, orders){
    return res.status(200).json(orders);
  });

}

ordersmaster.productCustomerBased = function (req, res) {

  var populateQuery = [{ path: 'user_id', model: user,select: [] },{ path: 'product_id', model: product,select: [] }];


  commonmodelService._get(user,{}, {}, {sort: {},populate: populateQuery,}).then(result => {
    const response = helper.response({ message: ('products'), data: result });
    return res.status(response.statusCode).json(response);
  },err=>{
    //productCreationProcess(itemLists,index)

    return res.status(500).json(err);
    //  printConsoleLog(err);
  })

}


ordersmaster.gethookorder_creation = function (req, res) {
  reqObj = { 'slack_id': "user1" };
  // console.log(reqObj);
  // return false;
  commonmodelService.findOne('zoku_config', reqObj).then(tableresult => {
    let orders = req.body
  // console.log(orders);
  // orders = JSON.stringify(orders);
  //   return false;
    var shipping_amt = orders.shipping
    // console.log(orders.line_items);
    // return false;
    asyncFunction(orders.line_items, function (framelines) {
      console.log("asyncdone");


        // console.log(framelines);
        // return false;



     var shipping_total = orders.shipping_total;
    //   //console.log("framelinesinside",framelines);
    //   //console.log(framelines.status!=undefined);return;
       if (shipping_total&&shipping_total!=0) {
        var singlelinee = {}
        singlelinee = {
          "product": 12198,
          "qty": 1,
          "taxes": [],
          "total": parseFloat(shipping_total),
          "discounts": []
        }
        framelines.push(singlelinee)
      }
     if (framelines.status != undefined) {
        res.status(200).send("Order Not Created");
      } else {
      if (orders['customer_id'] != undefined) {
    //       //console.log(orders['customer']['id'])
           reqObj = { 'customerid': orders['customer_id'] };


          let billing = orders.billing;
          let shipping = orders.shipping;


      //    commonmodelService.findOne('customermapping', reqObj).then(custtableresult => {

         
          // let data = {
          //   "id": uniqid(),
          //   "customer": 1767,//orders['customer_id'],
          //   "location": config.location_id['location'],
          //   "memo": "Please ring the doorbell",
          //   "timestamp": new Date(orders['date_created']).getTime(),
          //   "loyaltypoints": 50,
          //   "shipaddress": shipping.address_1 + '\n' + shipping.address_2 + '\n' + shipping.city +  '\n' + shipping.country,
          //   "billaddress": billing.address_1 + '\n' + billing.address_2 + '\n' + billing.city + '\n' + billing.country,
          //   "lines": framelines,
          //   "payments": [
          //     {
          //       "amount": orders['discount_total'],
          //       "giftCertID": "2" 
          //     },
          //     {
          //       "amount": orders['total'],
          //       "trxCode": orders['id']
          //     }
          //   ]
          // };



        //   let data = {
        //     "id": uniqid(),
        //     "customer": parseInt(custtableresult.internalid),
        //     "location": config.location_id['location'],
        //     "memo": "",
        //     "timestamp": new Date(orders['date_created']).getTime(),
        //     // "shipaddress": shipping.address_1 + '\n' + shipping.address_2 + '\n' + shipping.city +  '\n' + shipping.country,
        //     //  "billaddress": billing.address_1 + '\n' + billing.address_2 + '\n' + billing.city + '\n' + billing.country,
        //     "shipaddress": shipping.address_1 + '\n' + shipping.address_2 + '\n' + shipping.city + ' ' + shipping.zip + '\n' + shipping.country,
        //     "billaddress": billing.address_1 + '\n' + billing.address_2 + '\n' + billing.city + ' ' + billing.zip + '\n' + billing.country,

        //     "loyaltypoints": 50,
        //     "lines": framelines,
        //     "discounts": [
        //     ],
        //     "payments": [
        //     // { "amount": orders['discount_total'].toString(), "giftCertID": "2" },
        //     { "amount": orders['total'].toString(), "trxCode": orders['id'].toString() }
        //     ]
        //    }

        //   // console.log(data);

        //   var request = require('request');
        //   let accesstkn = tableresult.zoku_access_token;
        //  // console.log(accesstkn);
        //   //console.log(config.zoku_api_endpoint + '/web/order');
        //   var options = {
        //     'method': 'POST',
        //     'url': config.zoku_api_endpoint + '/web/order',
        //     'headers': {
        //       'Authorization': 'Bearer ' + accesstkn.toString(),
        //       'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify(data)

        //   };
        //   request(options, function (error, response) {

        //     if (error) throw new Error(error);
        //     //console.log(response);
        //     console.log("result")
        //     console.log("Order Created!!");
        //     //res.status(200).send("Order Created SuccessFully!!");
        //   });
        //   },custfetchdberror=>{

            // var billing = orders.billing;
            // var shipping = orders.shipping;
            // let err_const ={
            //   subject:"Order Creation Error",
            //   text:"Customer That You Selected Is Not Exist in Netsuite!!"
            // }
            // mailsendererr(err_const).then((resp)=>{
            //   //res.send(resp);
            //   //cb(resp);
            // },err=>{
            //   //res.send(err);
            //   //cb(err);
            // });

            let data = {
              "id": uniqid(),
              "customer": orders['customer_id'],
              "location": config.location_id['location'],
              "memo": "",
              "timestamp": new Date(orders['date_created']).getTime(),
              // "shipaddress": shipping.address_1 + '\n' + shipping.address_2 + '\n' + shipping.city +  '\n' + shipping.country,
              //  "billaddress": billing.address_1 + '\n' + billing.address_2 + '\n' + billing.city + '\n' + billing.country,
              "shipaddress": shipping.address_1 + '\n' + shipping.address_2 + '\n' + shipping.city + ' ' + shipping.zip + '\n' + shipping.country,
              "billaddress": billing.address_1 + '\n' + billing.address_2 + '\n' + billing.city + ' ' + billing.zip + '\n' + billing.country,
  
              "loyaltypoints": 50,
              "lines": framelines,
              "discounts": [
              ],
              "payments": [
              // { "amount": orders['discount_total'].toString(), "giftCertID": "2" },
              { "amount": orders['total'].toString(), "trxCode": orders['id'].toString() }
              ]
             }
  
  
            var request = require('request');
            let accesstkn = tableresult.zoku_access_token;
           // console.log(accesstkn);
            //console.log(config.zoku_api_endpoint + '/web/order');
            var options = {
              'method': 'POST',
              'url': config.zoku_api_endpoint + '/web/order',
              'headers': {
                'Authorization': 'Bearer ' + accesstkn.toString(),
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(data)
  
            };
            request(options, function (error, response) {
  
              if (error) throw new Error(error);
             // console.log(response);
              console.log("result")
              console.log("Order Created!!");
              //res.status(200).send("Order Created SuccessFully!!");
            });
          //});
        } else {
          let err_const = {
            subject: "Order Creation Error",
            text: "Customer Not Selected!!"
          }
          mailsendererr(err_const).then((resp) => {
            //res.send(resp);
            //cb(resp);
          }, err => {
            //res.send(err);
            //cb(err);
          });
      }

      }

    });
    res.status(200).send("Order Executed!!");
  })
}


module.exports = ordersmaster;
