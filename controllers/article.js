const { getAdmin } = require('../config/getUser');
const { multiFileUploader } = require('../config/uploader');
const Article = require('../models/Article');

const createArticle = async (req, res) => {
  try {
    // Check if the user is an admin
    const adminCheck = await getAdmin(req, res);
    console.log(req.body, 'req.body');
    if (adminCheck.error) {
      return res.status(401).json({
        success: false,
        message: adminCheck.error,
      });
    }

    // Destructure data from the request body
    const { title, content, tags, category, status, description, mainContent, slug, trending, images } = req.body;

    // Check if images exist and upload them
    let uploadedImages = [];
    if (images && images.length > 0) {
      uploadedImages = await multiFileUploader(images);  // Assuming images are passed as file paths
    }

    // Create a new article instance
    const newArticle = new Article({
      title,
      content,
      tags,
      category,
      status: status || 'draft',
      description,
      mainContent,
      slug,
      trending,
      author: adminCheck._id, // Assuming `adminCheck` contains the admin user info
      images: uploadedImages,  // Store the uploaded image URLs and IDs
      createdOn: Date.now(),  // Add createdOn timestamp
    });

    console.log(newArticle , "newArticle");

    // Save the new article to the database
    await newArticle.save();

    return res.status(201).json({
      success: true,
      message: 'Article created successfully',
      data: newArticle,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
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

const updateArticle = async (req, res) => {
  try {
    const { title, content, tags, category, status, description, mainContent, slug, trending, images } = req.body;

    // Handle image update: If images are passed, upload new ones
    let updatedImages = [];
    if (images && images.length > 0) {
      updatedImages = await multiFileUploader(images);
    }

    // Update the article with the new data
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
};
