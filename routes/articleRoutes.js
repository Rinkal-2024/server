// backend/routes/articleRoutes.js
const express = require('express');
const router = express.Router();
const articleController = require('../controllers/article');
const verifyToken = require('../config/jwt');

// CRUD Operations for Articles
router.post('/articles', verifyToken, articleController.createArticle); 
router.get('/get-articles', articleController.getArticles); // All users can view articles
router.get('/breaking-news', articleController.getBreakingNews); // Fetch breaking news (trending articles)
router.get('/latest-news', articleController.getLatestNews); // Fetch latest news (sorted by createdAt)
router.get('/:id', articleController.getArticleById); // View a single article
router.get('/articles/:slug', articleController.getArticleBySlug); // Updated route to search by slug
router.get('/articles/category/:category', articleController.getArticlesByCategory);  // This route will handle category filtering
router.put('/:id', verifyToken, articleController.updateArticle); // Admin can update
router.delete('/:id', verifyToken, articleController.deleteArticle); 

module.exports = router;
