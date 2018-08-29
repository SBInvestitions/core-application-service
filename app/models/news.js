import mongoose, { Schema } from 'mongoose';
import q from 'q';
import fs from 'fs';
import path from 'path';
import User from "./user";
import Role from "./role";

//defining schema for articles table

const articlesSchema = new Schema({
  name: { type: String },
  authorId: String,
  authorImg: String,
  authorAlt: String,
  authorFirstName: String,
  authorLastName: String,
  text: String,
  description: { type: String },
  categoryId: Number,
  categoryName: String,
  url: String,
  mainImg: String,
  mainImgAlt: String,
  mainImgId: String,
  sequence: Number, //for long posts to order by this
  ratings: [{ userId: Number, rating: Number }],
  commentsTreeId: Number,
  dateCreate: { type: Date, default: Date.now },
  dateModified: { type: Date, default: Date.now },
  userModified: Number,
  isDeleted: { type: Boolean, default: false }
});

//To use our schema definition, we need to convert our blogSchema into a Model we can work with
const Article = mongoose.model('articles', articlesSchema);

//Initlizing interface object of this model.
const articlesModel = {};

//function to get articles listings
articlesModel.get = function(skip, limit, isDeleted){
  const results = q.defer();

  skip = parseInt(skip) || 0;
  limit = parseInt(limit) || 20;

  Article.find({ 'isDeleted': 'false' }, null, { sort: '-dateCreate' }, function(err, dbArticles) {
    if (err){
      results.reject(err);
    }
    results.resolve(dbArticles);
  }).skip(skip).limit(limit);
  return results.promise;
};

//function to get single video by its id.
articlesModel.getOne = function(id){
  const results = q.defer();

  if(!id){
    results.reject({ status:'error', error:'Article Id not supplied.' });
  }
  Article.findOne({ _id: id }, function(err, dbArticles) {
    if (err){
      results.reject(err);
    }

    if(dbArticles){
      results.resolve(dbArticles);
    } else{
      results.reject({status:'error', error:'Invalid article Id supplied.'});
    }
  });
  return results.promise;
};

//Insert article into database
articlesModel.insertOne = function(article, user){
  const results = q.defer();
  const error = checkArticleError(article);
  if(error){
    results.reject({ status:'error', error:error });
  }
  // userModel.getOne()
  User.findOne({ _id: user.id }, function(userErr, dbUser) {
    if(userErr){
      return results.reject({ error: { text: 'User err' + userErr } });
    }
    const articles = [];
    if (dbUser.role && dbUser.role[0]) {

      Role.findOne({ _id: dbUser.role[0] }, function(roleErr, dbRole) {
        //Добавляем статью
        if(roleErr){
          return results.reject({ error: { text: 'User role err' + roleErr } });
        }
        if (dbRole.name && (dbRole.name !== 'Admin' && dbRole.name !== 'Redactor')) {
          return results.reject({ error: { text: 'User action not accepted' }});
        }
        article.authorId = dbUser._id;
        article.authorAlt = dbUser.name + ' ' + dbUser.secondName;
        article.authorImg = dbUser.userImg;
        article.authorFirstName = dbUser.name;
        article.authorLastName = dbUser.secondName;
        article.categoryId = '';
        article.categoryName = '';
        article.mainImgId = '';
        article.sequence = '1'; //for long posts to order by this
        article.ratings = [];
        article.commentsTreeId = null;
        article.dateCreate = Date.now();
        article.dateModified = Date.now();
        article.userModified = dbUser._id;
        article.isDeleted = false;
        delete article.mainImgSrc;
        articles.push(article);

        Article.collection.insert(articles, function(err, dbArticles) {
          if(err){
            console.log('error occured in populating database');
            return results.reject(err);
          }
          else{
            const resArticle = dbArticles.ops[0];
            const base64Data = resArticle.mainImg.replace(/^data:image\/jpeg;base64,/, "");
            fs.writeFile(path.join(__dirname, '../../uploads/' + resArticle._id + '.jpg'), new Buffer(base64Data, "base64"), function(err, data) {
              if (err) {
                return console.log(err);
              }
              Article.update({ _id: resArticle._id }, {
                mainImg: '/uploads/' + resArticle._id + '.jpg'
              }, function(error, affected, resp) {
                if(error){
                  return console.log(err);
                }
              });
              results.resolve(Article);
            });
          }
        });
      })
    } else {
      return console.log('No roles found');
    }

  });
  return results.promise;
};

//update the article
articlesModel.updateOne = function(article, user) {
  const results = q.defer();
  const error = checkArticleError(article);
  if(error){
    results.reject({ status:'error', error:error });
  }
  // userModel.getOne()
  User.findOne({ _id: user.id }, function(userErr, dbUser) {
    if (userErr) {
      return results.reject({error: {text: 'User err' + userErr}});
    }
    if (dbUser.role && dbUser.role[0]) {

      Role.findOne({_id: dbUser.role[0]}, function (roleErr, dbRole) {
        //Добавляем статью
        if (roleErr) {
          return results.reject({error: {text: 'User role err' + roleErr}});
        }
        if (dbRole.name && (dbRole.name !== 'Admin' && dbRole.name !== 'Redactor')) {
          return results.reject({error: {text: 'User action not accepted'}});
        }

        Article.findOne({ _id: article._id }, function (err, dbArticle) {
          if (err) {
            return results.reject(err);
          }
          const resArticle = dbArticle;
          if(article.mainImg.indexOf('https://sbinvest.pro/uploads/') == -1){
            const base64Data = article.mainImg.replace(/^data:image\/jpeg;base64,/, "");
            fs.writeFile(path.join(__dirname, '../../uploads/' + resArticle._id + '.jpg'), new Buffer(base64Data, "base64"), function (err, data) {
              if (err) {
                return results.reject(err);
              }
              for (const k in article) dbArticle[k] = article[k];
              dbArticle.mainImg = '/uploads/' + resArticle._id + '.jpg';
              dbArticle.authorImg = '/uploads/avatar.jpg';
              dbArticle.dateModified = Date.now();
              dbArticle.save();
              results.resolve(dbArticle);
            });
          }
          else{
            console.log('photo file is normal');
            for (const k in article) dbArticle[k] = article[k];
            dbArticle.dateModified = Date.now();
            dbArticle.save();
            results.resolve(dbArticle);
          }

        });
      })
    }
  });
  return results.promise;
};

// delete article
articlesModel.delete = function(articleId, user){
  const results = q.defer();
  let error = false;
  if(!articleId){
    results.reject({ status:'error', error:error });
    error = true;
  }
  if (!error) {
    User.findOne({ _id: user.id }, function(userErr, dbUser) {
      if (userErr) {
        return results.reject({error: {text: 'User err' + userErr}});
      }
      Role.findOne({_id: dbUser.role[0]}, function (roleErr, dbRole) {
        //Добавляем статью
        if (roleErr) {
          return results.reject({error: {text: 'User role err' + roleErr}});
        }
        if (dbRole.name && (dbRole.name !== 'Admin' && dbRole.name !== 'Redactor')) {
          return results.reject({error: {text: 'User action not accepted'}});
        }
        Article.findOne({ _id: articleId }, function(err, dbArticle) {
          if (err){
            results.reject(err);
          }
          dbArticle.isDeleted = true;
          dbArticle.remove();
          results.resolve(dbArticle);
        });
      })
    });
  }
  return results.promise;
};

//check input validation
function checkArticleError(article) {
  if (!article.text) {
    return 'Text not supplied.';
  }
  if (!article.name) {
    return 'Name not supplied.';
  }
  return false;
}

module.exports = articlesModel;