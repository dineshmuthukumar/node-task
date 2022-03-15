var commonmodelService = require('../services/commonmodelService.js');
var jwt = require('jsonwebtoken');
var userMaster = {};
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

//console.log(new Date(dt).getTime());
//console.log(currentDt);

userMaster.index = function (req, res) {

  const token = jwt.sign(
    { user_id: 11, email:"dinesh@gmail.com" },
    config.token,
    {
      expiresIn: "1h",
    }
  );
  //v user;

  ///https://www.section.io/engineering-education/how-to-build-authentication-api-with-jwt-token-in-nodejs/
  // save user token
  //user.token = token;

  // return new user
  res.status(201).json(token);
  //res.status(200).send("MiddleWare Application Running!!")

};

userMaster.home = function (req, res) {
  
  res.status(200).send("Welcome 🙌 ");


}

userMaster.logout = function (req, res) {
  const token = req.body.token || req.query.token || req.headers["x-access-token"];

  jwt.destroy(token);
  res.status(200).send("Logout");

}

userMaster.login = function (req, res) {
  const token = req.body.token || req.query.token || req.headers["x-access-token"];

  jwt.destroy(token);
  res.status(200).send("Logout");

}

userMaster.register = async function (req, res) {
  
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



//mail sender
userMaster.mailsender = function (req, res) {
  var nodemailer = require('nodemailer');
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: config.mailer.id,
      pass: config.mailer.password
    }

  });

  var mailOptions = {
    from: config.mailer.id,
    to: "aswathf1@gmail.com",
    subject: "test",
    attachments: []
  };
  //console.log("0")

  transporter.sendMail(mailOptions, function (err, res1) {
    //console.log("1")
    if (!err) {
      //console.log("2")
      res.send({
        status: true,
        msg: "Mail send",

      })
    } else {
      res.send({
        status: false,
        msg: "Mail not send",

      })
    }

  });
}

userMaster.testingEmail = function (req, res) {
  let err_const = {
    subject: "Zoku Product Fetch error",
    text: "testing error"
  }
  mailsendererr(err_const).then((resp) => {
    res.send(resp);
  }, err => {
    res.send(err);
  });
};

mailsendererr = function (mail) {
  return new Promise((resolve, reject) => {
    var nodemailer = require('nodemailer');
    var transporter = nodemailer.createTransport({
      //service: 'gmail',
      host: 'smtp.gmail.com',
      secure: true,
      port: 465,
      auth: {
        user: config.mailer.id,
        pass: config.mailer.password
      },
      // tls: {
      //      rejectUnauthorized: false
      //   }
    });

    var mailOptions = {
      from: config.mailer.id,
      to: config.admin_mail_id.id,
      subject: mail.subject ? mail.subject : "error",
      text: mail.text ? mail.text : "text is empty",
    };

    transporter.sendMail(mailOptions, function (err, res) {
      if (!err) {
        resolve({
          status: true,
          msg: "Error Mail send",

        });
      } else {
        reject({
          status: false,
          msg: "Error Mail Not send",
          err: err

        })
      }

    });
  });

}

module.exports = userMaster;

