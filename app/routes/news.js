import express from 'express';
import articlesModel from './../models/news';

const router = express.Router();

// controller that handles news listings fetch request.
router.route('/v1/news').get(async (req, res) => {
  try {
    const skip = req.query.skip;
    const limit = req.query.limit;
    const isDeleted = req.query.isDeleted;
    const articlesData = await articlesModel.get(skip, limit, isDeleted);
    const response = {};
    response.status = 'success';
    response.data = articlesData;
    res.send(response);
  } catch(e) {
    console.log('error while getting news!', e);
    res.status(500);
    res.send(e);
  }
});

// controller that handles single article fetch request.
router.route('/v1/news/:articleId').get(async (req, res) => {
  try {
    const articleId = req.query.articleId;
    const articleData = await articlesModel.getOne(articleId);
    const response = {};
    response.status = 'success';
    response.data = articleData;
    res.send(response);
  } catch(e) {
    console.log('error while getting news by id!', e);
    res.status(500);
    res.send(e);
  }
});

// controller that add single article fetch request.
router.route('/v1/news').post(async (req, res) => {
  try {
    const decoded = req.decoded;
    console.log('decoded = ', decoded);
    if (!decoded || !decoded.user || decoded.user.role.name !== 'admin' || decoded.user.role.name !== 'redactor') {
      return;
    }
    const article = req.body;
    const articlesData = articlesModel.insertOne(article);
    const response = {};
    response.status = 'success';
    response.data = articlesData;
    res.send(response);
  } catch(e) {
    console.log('error while adding single article!', e);
    res.status(500);
    res.send(e);
  }
});

// controller that update single article fetch request.
router.route('/v1/news').put(async (req, res) => {
  try {
    const decoded = req.decoded;
    console.log('decoded = ', decoded);
    if (!decoded || !decoded.user || decoded.user.role.name !== 'admin' || decoded.user.role.name !== 'redactor') {
      return;
    }
    const article = req.body;
    const articlesData = articlesModel.updateOne(article);
    const response = {};
    response.status = 'success';
    response.data = articlesData;
    res.send(response);
  } catch(e) {
    console.log('error while updating single article!', e);
    res.status(500);
    res.send(e);
  }
});

router.route('/v1/news/:newsId').delete(async (req, res) => {
  try {
    const decoded = req.decoded;
    console.log('decoded = ', decoded);
    if (!decoded || !decoded.user || decoded.user.role.name !== 'admin' || decoded.user.role.name !== 'redactor') {
      return;
    }
    const articleId = req.query.newsId;
    const articlesData = articlesModel.delete(articleId);
    const response = {};
    response.status = 'success';
    response.data = articlesData;
    res.send(response);
  } catch(e) {
    console.log('error while deleting single article!', e);
    res.status(500);
    res.send(e);
  }
});

export default router;
