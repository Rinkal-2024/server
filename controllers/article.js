const { getAdmin } = require('../config/getUser');
const Article = require('../models/Article');
const Post = require('../models/Article');
const blurDataUrl = require('../config/getBlurDataUrl');

const createArticle = async (req, res) => {
  try {
    const admin = await getAdmin(req, res);
    const { images, ...body } = req.body; 
    console.log(images , "images")
    console.log(req.body , "req.body")

    const updatedImages = await Promise.all(
      images.map(async (image) => {
        const blurDataURL = await blurDataUrl(image.url);
        return { ...image, blurDataURL };
      })
    );

    // Create the new post with the processed data
    const newPost = await Post.create({
      ...body,
      images: updatedImages,
      author: admin._id,
    });

    res.status(201).json({
      success: true,
      message: 'Post Created',
      data: newPost,
    });
  } catch (error) {
    console.log(error , "error")
    res.status(400).json({ success: false, message: error.message });
  }
};


const getArticles = async (req, res) => {
  console.log(req , "req")
  try {
    const articles = await Article.find();
    console.log(articles , "articles")
    return res.status(200).json({
      success: true,
      data: articles,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};


// Get Breaking News (Articles with trending = true)
const getBreakingNews = async (req, res) => {
  try {
    const breakingNews = await Article.find({ trending: true }).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      data: breakingNews,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// Get Latest News (Sort by createdAt)
const getLatestNews = async (req, res) => {
  try {
    const latestNews = await Article.find().sort({ createdAt: -1 }).limit(5); // Limit to 5 most recent articles
    return res.status(200).json({
      success: true,
      data: latestNews,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// Get Article by ID
const getArticleById = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: article,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
// controllers/article.js

const getArticleBySlug = async (req, res) => {
  try {
    const { slug } = req.params; // Getting the slug from the URL
    const article = await Article.findOne({ slug }); // Search the article by slug

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: article,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const getArticlesByCategory = async (req, res) => {
  const { category } = req.params;  // Get the category from the URL

  try {
    const articles = await Article.find({ category: category });  // Find articles that match the category

    if (articles.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No articles found in this category.',
      });
    }

    return res.status(200).json({
      success: true,
      data: articles,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Article
const updateArticle = async (req, res) => {
  try {
    const { title, content, tags, category, status, description, mainContent, slug, trending, images } = req.body;

    let updatedImages = [];
    if (images && images.length > 0) {
      updatedImages = await multiFileUploader(images);
    }

    const updatedArticle = await Article.findByIdAndUpdate(
      req.params.id,
      {
        title,
        content,
        tags,
        category,
        status,
        description,
        mainContent,
        slug,
        trending,
        images: updatedImages.length > 0 ? updatedImages : undefined,  // Only update images if new ones are passed
      },
      { new: true }
    );

    if (!updatedArticle) {
      return res.status(404).json({
        success: false,
        message: 'Article not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: updatedArticle,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// Delete Article
const deleteArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found',
      });
    }

    // Delete images from Cloudinary
    if (article.images && article.images.length > 0) {
      await multiFilesDelete(article.images);  // Deleting all the images associated with the article
    }

    // Delete the article from the database
    await article.remove();

    return res.status(200).json({
      success: true,
      message: 'Article deleted successfully',
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};


module.exports = {
  createArticle,
  getArticles,
  getArticleById,
  updateArticle,
  deleteArticle,
  getBreakingNews, 
  getLatestNews,
  getArticleBySlug,
  getArticlesByCategory,
};
