import mongoose, { Schema } from 'mongoose';
import q from 'q';
import fs from 'fs';
import path from 'path';

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

  Article.find({ 'isDeleted': 'false' }, function(err, dbArticles) {
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
articlesModel.insertOne = function(article){
  const results = q.defer();
  const error = checkArticleError(article);
  if(error){
    results.reject({ status:'error', error:error });
  }
  const articles = Array();
  //Добавляем статью
  if(!error){
    article.authorId = user._id;
    article.authorAlt = user.name + ' ' + user.secondName;
    article.authorImg = user.userImg;
    article.authorFirstName = user.name;
    article.authorLastName = user.secondName;
    article.categoryId = '';
    article.categoryName = '';
    article.mainImgId = '';
    article.sequence = '1'; //for long posts to order by this
    article.ratings = [];
    article.commentsTreeId = null;
    article.dateCreate = { type: Date, default: Date.now };
    article.dateModified = { type: Date, default: Date.now };
    article.userModified = user._id;
    article.isDeleted = false;

    articles.push(article);

    Article.collection.insert(articles, function(err, dbArticles) {
      if(err){
        console.log('error occured in populating database');
        console.log(err);
      }
      else{
        const resArticle = dbArticles.ops[0];
        const base64Data = resArticle.mainImg.replace(/^data:image\/jpeg;base64,/, "");
        fs.writeFile(path.join(__dirname, '../../uploads/' + resArticle._id + '.jpg'), new Buffer(base64Data, "base64"), function(err, data) {
          if (err) {
            return console.log(err);
          }
          Article.update({_id: resArticle._id }, {
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
  }
  return results.promise;
};

//update the article
articlesModel.updateOne = function(article) {
  const results = q.defer();
  const error = checkArticleError(article);

  if(error){
    results.reject({ status:'error', error:error });
  }

  //Обновляем статью
  if(!error) {
    Article.findOne({_id: article._id}, function (err, dbArticle) {
      if (err) {
        return results.reject(err);
      }
      const resArticle = dbArticle;
      if(article.mainImg.indexOf('https://sbinvest.pro/uploads/') == -1){
        const base64Data = article.mainImg.replace(/^data:image\/jpeg;base64,/, "");
        fs.writeFile(path.join(__dirname, '../../uploads/' + resArticle._id + '.jpg'), new Buffer(base64Data, "base64"), function (err, data) {
          if (err) {
            return console.log(err);
          }
          console.log('photo file updated')
          for (const k in article) dbArticle[k] = article[k];
          dbArticle.mainImg = '/uploads/' + resArticle._id + '.jpg';
          dbArticle.authorImg = '/uploads/avatar.jpg';
          dbArticle.dateModified = new Date;
          dbArticle.save();
          results.resolve(dbArticle);
        });
      }
      else{
        console.log('photo file norm');
        for (const k in article) dbArticle[k] = article[k];
        dbArticle.authorImg = '/uploads/avatar.jpg';
        dbArticle.dateModified = new Date;
        dbArticle.save();
        results.resolve(dbArticle);
      }

    });
  }
  else{
    results.reject(err);
  }
  return results.promise;
};

// delete article
articlesModel.delete = function(articleId){
  const results = q.defer();
  let error = false;
  if(!articleId){
    results.reject({ status:'error', error:error });
    error = true;
  }
  if(!error){
    console.log(articleId);
    Article.findOne({ _id:articleId }, function(err, dbArticle) {
      if (err){
        results.reject(err);
      }
      dbArticle.isDeleted = true;
      dbArticle.remove();
      results.resolve(dbArticle);
    });
  }
  return results.promise;
};

//check input validation
function checkArticleError(article) {
  if (!article.text) {
    return 'Text not supplied.';
  }
  if (!article.url) {
    return 'Url not supplied.';
  }
  if (!article.name) {
    return 'Name not supplied.';
  }
  if (!article.authorId) {
    return 'Author not supplied.';
  }
  if (!article.commentsTreeId) {
    return 'Comments column not supplied.';
  }
  return false;
}

module.exports = articlesModel;