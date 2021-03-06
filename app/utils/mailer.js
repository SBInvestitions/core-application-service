import nodemailer from 'nodemailer';
import config from './../../config';
// import logo from './../../assets/logo.png';

export function sendRegisterEmail(key, email) {
  const transporter = nodemailer.createTransport({
    service: 'yandex',
    auth: {
      user: config.NODEMAILER_LOGIN,
      pass: config.NODEMAILER_PASS,
    }
  });
  const mailOptions = {
    from: '"SBInvestitions" <register@sbinvest.pro>',
    to: email, // list of receivers
    subject: "Подтверждение регистрации", // Subject line
    text: 'Здравствуйте! Ваш email адрес был зарегистрирован на сайте sbinvest.pro', // plaintext body
    html: '<h1><img src="cid:' + key + '"/>SBInvestitions</h1>' +
    '<p>Здравствуйте! Ваш email адрес был зарегистрирован на сайте sbinvest.pro</p>' +
    '<p>Для подтверждения регистрации, перейтите по <a href="http://sbinvest.pro/confirm?key=' + key + '">ссылке</a></p>' +  // html body
    '<p>Hello! Your email address was registered on the site sbinvest.pro</p>' +
    '<p>Please, follow this <a href="http://sbinvest.pro/register/confirm">link</a> to confirm registration</p>',  // html body
    attachments: [{
      filename: 'logo-mini.png',
      path: 'https://sbinvest.pro/assets/logo-mini.png',
      cid: key //same cid value as in the html img src
    }]
  };

  // send mail with defined transport object
  return transporter.sendMail(mailOptions, function(error, info){
    if(error){
      console.log('error ' + error);
      return false;
    }
    console.log('sent', email);
    return true;
  });
}

export function sendSubscribeEmail(dbSubscriber, email) {
  const transporter = nodemailer.createTransport({
    service: 'yandex',
    auth: {
      user: config.NODEMAILER_LOGIN,
      pass: config.NODEMAILER_PASS,
    }
  });
  const mailOptions = {
    from: '"SBInvestitions" <register@sbinvest.pro>', // sender address hobbit137@ya.ru, shabanov.m.y@gmail.com
    to: 'invest@sbinvest.pro', // list of receivers
    subject: "Подписка пользователя", // Subject line
    text: 'Пользователь подписался ' + email, // plaintext body
  };

  // send mail with defined transport object
  return transporter.sendMail(mailOptions, function(error, info){
    if(error){
      console.log('error ' + error);
      return false;
    }
    console.log('sent', email);
    return true;
  });
}

export function sendRecoverEmail(key, email) {
  const transporter = nodemailer.createTransport({
    service: 'yandex',
    auth: {
      user: config.NODEMAILER_LOGIN,
      pass: config.NODEMAILER_PASS,
    }
  });
  const mailOptions = {
    from: '"SBInvestitions" <register@sbinvest.pro>', // sender address hobbit137@ya.ru, shabanov.m.y@gmail.com
    to: email, // list of receivers
    subject: "Подтверждение регистрации", // Subject line
    text: 'Здравствуйте! Ваш email адрес был зарегистрирован на сайте sbinvest.pro', // plaintext body
    html: '<h1><img src="cid:' + key + '"/>SBInvestitions</h1>' +
    '<p>Здравствуйте! Ваш email адрес был зарегистрирован на сайте sbinvest.pro</p>' +
    '<p>Для подтверждения регистрации, перейтите по <a href="http://sbinvest.pro/recover?key=' + key + '">ссылке</a></p>' +  // html body
    '<p>Hello! Your email address was registered on the site sbinvest.pro</p>' +
    '<p>Please, follow this <a href="http://sbinvest.pro/register/confirm">link</a> to confirm registration</p>',  // html body
    attachments: [{
      filename: 'logo-mini.png',
      path: 'https://sbinvest.pro/assets/logo-mini.png',
      cid: key //same cid value as in the html img src
    }]
  };

  // send mail with defined transport object
  return transporter.sendMail(mailOptions, function(error, info){
    if(error){
      console.log('error ' + error);
      return false;
    }
    console.log('sent', email);
    return true;
  });
}