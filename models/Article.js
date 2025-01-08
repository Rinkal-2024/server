const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  tags: [String],
  category: { type: String, required: true },
  status: { type: String, default: 'draft' },  // default status is draft
  description: { type: String },
  mainContent: { type: String },
  slug: { type: String, required: true, unique: true },
  trending: { type: Boolean, default: false },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // assuming you have a User model
  images: [
    {
      _id: { type: String },  // Cloudinary public ID
      url: { type: String },  // Cloudinary URL
    }
  ],
  createdOn: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Article', articleSchema);
