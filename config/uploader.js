// uploader.js
const cloudinary = require('./cloudinary');

// Function to upload an image to Cloudinary
const uploadImageToCloudinary = async (file) => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: 'articles', // You can specify a folder for organizing your images
      use_filename: true,
      unique_filename: false,
    });
    console.log(result , "result");
    return result;
  } catch (error) {
    console.log(error);
    throw new Error('Error uploading image to Cloudinary');
  }
};

// Function to delete an image from Cloudinary using the public_id
const deleteImageFromCloudinary = async (public_id) => {
  try {
    const result = await cloudinary.uploader.destroy(public_id);
    return result;
  } catch (error) {
    throw new Error('Error deleting image from Cloudinary');
  }
};

module.exports = {
  uploadImageToCloudinary,
  deleteImageFromCloudinary,
};
