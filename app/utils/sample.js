var express         = require('express');
var app             = express();
var fs              = require("fs");
var request = require('request');

var bodyParser = require('body-parser');

// create application/json parser
var jsonParser = bodyParser.json();

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false });

var nodemailer = require('nodemailer');
// create reusable transporter object using the default SMTP transport
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'kpozdnikin@gmail.com',
    pass: 'vputin810380544648409'
  }
});
console.log(transporter);

/*****************************************/
var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'bob',
  password : 'secret',
  database : 'my_db'
});
/*****************************************/

app.post('/nodeapi/contact', jsonParser, function (req, res) {
  var phone = req.body.phone.toString();
  var dishes = req.body.dishes;
  var totalAmount = req.body.totalAmount;
  var referer = req.body.referer;
  var delivery = req.body.delivery;
  var dishTable = '<p>Источник: ' + referer + '</p><p>Доставка: ' + delivery + '</p><h3>Телефон: ' + phone + '</h3>' +
    '<table>' +
    '<thead>' +
    '<tr>' +
    '<th>Название блюда</th>' +
    '<th>Цена</th>' +
    '<th>Количество</th>' +
    '<th>Стоимость</th>' +
    '</tr>' +
    '</thead>' +
    '<tbody>';

  dishes.forEach(function(dish){
    var name = dish.name.toString();
    var price = dish.price.toString();
    var count = dish.count.toString();
    var amount = (dish.price * dish.count).toString();
    var newRow = '<tr>' +
      '<td>'+ name + '</td>' +
      '<td>' + price + '</td>' +
      '<td>' + count + '</td>' +
      '<td>' + amount + '</td></tr>';
    dishTable = dishTable + newRow;
  });
  dishTable = dishTable + '</tbody></table>';
  var date = new Date();
  var convertedDate = '';

  try{
    convertedDate =  ('0' + date.getDate()).slice(-2) + '.' + ('0' + (date.getMonth() + 1)).slice(-2) + '.' + date.getFullYear();
  }
  catch(err){
    convertedDate = date;
  }

  dishTable = dishTable + '<p>' + convertedDate + '.' + '</p>';

  dishTable = dishTable + '<p>Итого: ' + totalAmount + '</p>';

  var mailOptions = {
    from: '"BambooBanner" <kpozdnikin@gmail.com>', // sender address hobbit137@ya.ru, shabanov.m.y@gmail.com
    to: 'kpozdnikin@gmail.com', // list of receivers
    subject: "Заказ суши", // Subject line
    text: phone.toString(), // plaintext body
    html: '<b>' + dishTable + '</b>' // html body
  };

  console.log(dishTable);

  // send mail with defined transport object
  transporter.sendMail(mailOptions, function(error, info){
    if(error){
      console.log('error ' + error);
      return res.send(error);
    }
    console.log('sent');
    res.send('sent');
  });
});

var server = app.listen(8085, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log("Example app listening at http://%s:%s", host, port);

});

app.use(function(err, req, res, next) {
  if(!err)
    return next();
  try{
    res.send(res);
    console.log(res);
  } catch(err){
    console.log(err);
    res.send('error');
  }
});