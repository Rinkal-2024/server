// backend/routes/articleRoutes.js
const express = require('express');
const router = express.Router();
const articleController = require('../controllers/article');
const verifyToken = require('../config/jwt');

// CRUD Operations for Articles
router.post('/articles', verifyToken, articleController.createArticle); 
router.get('/get-articles', articleController.getArticles); // All users can view articles
router.get('/:id', articleController.getArticleById); // View a single article
router.put('/:id', verifyToken, articleController.updateArticle); // Admin can update
router.delete('/:id', verifyToken, articleController.deleteArticle); // Admin can delete

module.exports = router;
