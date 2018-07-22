import mongoose, {Schema} from 'mongoose';
import q from 'q';

//defining schema for news table

const newsSchema = new Schema({
  name: { type: String },
  userId: { type: String },
  text: String,
  description: { type: String },
  mainImg: { type: String },
  mainImgAlt: { type: String },
  mainImgId: { type: String },
  secondImg: { type: String },
  secondImgAlt: { type: String },
  secondImgId: { type: String },
  thirdImg: { type: String },
  thirdImgAlt: { type: String },
  thirdImgId: { type: String },
  dateCreate: { type: Date, default: Date.now },
  dateModified: { type: Date, default: Date.now },
  userModifiedId: { type: String },
  isDeleted: { type: Boolean, default: false },
});

//To use our schema definition, we need to convert our blogSchema into a Model we can work with
const News = mongoose.model('news', newsSchema);

//Initlizing interface object of this model.
const newsModel = {};

//function to get news listings
newsModel.get = function(skip, limit, isDeleted){
  const results = q.defer();
  skip = parseInt(skip) || 0;
  limit = parseInt(limit) || 30;
  News.find({ 'isDeleted': isDeleted }, function(err, dbNews) {
    if (err){
      results.reject(err);
    }
    results.resolve(dbNews);
  }).skip(skip).limit(limit);
  return results.promise;
};

// function to get single news by its id.

newsModel.getOne = function(id){
  const results = q.defer();
  if(!id){
    results.reject({ status:'error', error:'News Id not supplied.' });
  }
  News.findOne({ _id: id }, function(err, dbNews) {
    if (err){
      results.reject(err);
    }

    if(dbNews){
      results.resolve(dbNews);
    } else{
      results.reject({status:'error', error:'Invalid news Id supplied.'});
    }
  });
  return results.promise;
};

//Insert news into database
newsModel.insertOne = function(article, user){
  const results = q.defer();
  const error = checkArticleError(article);
  if(error){
    results.reject({ status:'error', error:error });
  }
  const news = [];
  //Добавляем статью
  if(!error){
    const newArticle = {
      name: article.name,
      userId: user.id,
      text: article.text,
      description: article.description,
      mainImg: article.mainImg,
      mainImgAlt: article.mainImgAlt,
      mainImgId: article.mainImgId,
      secondImg: article.secondImg,
      secondImgAlt: article.secondImgAlt,
      secondImgId: article.secondImgId,
      thirdImg: article.thirdImg,
      thirdImgAlt: article.thirdImgAlt,
      thirdImgId: article.thirdImgId,
      dateCreate: new Date(),
      dateModified: new Date(),
      userModifiedId: user.id,
      isDeleted: false,
    };
    news.push(newArticle);
    News.collection.insert(news, function(err, dbNews) {
      if(err){
        console.log('error occured in populating database');
        console.log(err);
      }
      else{
        results.resolve(dbNews);
      }
    });
  }
  return results.promise;
};

//update the article
newsModel.updateOne = function(article, user) {
  const results = q.defer();
  const error = checkArticleError(article);
  if(error){
    results.reject({ status:'error', error:error });
  }
  //Добавляем статью
  if(!error){
    News.findOne({ _id: article._id }, function (err, dbArticle) {
      if (err) {
        return results.reject(err);
      }
      dbArticle.name = article.name;
      dbArticle.text = article.text;
      dbArticle.description = article.description;
      dbArticle.mainImg = article.mainImg;
      dbArticle.mainImgAlt = article.mainImgAlt;
      dbArticle.mainImgId = article.mainImgId;
      dbArticle.secondImg = article.secondImg;
      dbArticle.secondImgAlt = article.secondImgAlt;
      dbArticle.secondImgId = article.secondImgId;
      dbArticle.thirdImg = article.thirdImg;
      dbArticle.thirdImgAlt = article.thirdImgAlt;
      dbArticle.thirdImgId = article.thirdImgId;
      dbArticle.dateModified = new Date();
      dbArticle.userModifiedId = user.id;
      dbArticle.isDeleted = false;

      dbArticle.save();
      results.resolve(dbArticle);
    });
  }
  return results.promise;
};

//delete article
newsModel.delete = function(articleId){
  const results = q.defer();
  let error = false;
  if(!articleId){
    results.reject({ status:'error', error:error });
    error = true;
  }
  if(!error){
    console.log('delete article', articleId);
    News.findOne({ _id:articleId }, function(err, dbArticle) {
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
  if (!article.name) {
    return 'Name not supplied.';
  }
  return false;
}

module.exports = newsModel;