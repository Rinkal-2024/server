  // controllers/userController.js
  const User = require('../models/User');
  const jwt = require('jsonwebtoken');
  const bcrypt = require('bcrypt');
  const otpGenerator = require('otp-generator');
  const nodemailer = require('nodemailer');
  const fs = require('fs');
  const path = require('path');
  const registerUser = async (req, res) => {
    try {

      const request = req.body; 
      const UserCount = await User.countDocuments();
      const existingUser = await User.findOne({ email: request.email });


      if (existingUser) {
        return res.status(400).json({
          UserCount,
          success: false,
          message: 'User With This Email Already Exists',
        });
      }

      const otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        specialChars: false,
        lowerCaseAlphabets: false,
        digits: true,
      });
    
      const user = await User.create({
        ...request,
        otp,
        role: Boolean(UserCount) ? request.role || 'user' : 'super admin',
      });

      const token = jwt.sign(
        {
          _id: user._id,
          
        },
        process.env.JWT_SECRET,
        {
          expiresIn: '7d',
        }
      );
      
      const htmlFilePath = path.join(
        process.cwd(),
        'email-templates',
        'otp.html'
      );

    
      let htmlContent = fs.readFileSync(htmlFilePath, 'utf8');

      htmlContent = htmlContent.replace(/<h1>[\s\d]*<\/h1>/g, `<h1>${otp}</h1>`);
      htmlContent = htmlContent.replace(/usingyourmail@gmail\.com/g, user.email);

  
      let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL, 
          pass: process.env.EMAIL_PASSWORD, 
        },
      });

      
      let mailOptions = {
        from: process.env.EMAIL, 
        to: user.email,
        subject: 'Verify your email',
        html: htmlContent, 
      };

      await transporter.sendMail(mailOptions);
      res.status(201).json({
        success: true,
        message: 'Created User Successfully',
        otp,
        token,
        user,
      });
    } catch (error) {
      res.status(500).json({
        message: error.message,
        status: 500,
      });
    }
  };
  const loginUser = async (req, res) => {
    try {
      const { email, password } = await req.body;
      const user = await User.findOne({ email }).select('+password');

      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: 'User Not Found' });
      }

      if (!user.password) {
        return res
          .status(404)
          .json({ success: false, message: 'User Password Not Found' });
      }

      const isPasswordMatch = await bcrypt.compare(password, user.password);

      if (!isPasswordMatch) {
        return res
          .status(400)
          .json({ success: false, message: 'Incorrect Password' });
      }

      const token = jwt.sign(
        {
          _id: user._id,
          email: user.email,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: '7d',
        }
      );

      // const products = await Products.aggregate([
      //   {
      //     $match: {
      //       _id: { $in: user.wishlist },
      //     },
      //   },
      //   {
      //     $lookup: {
      //       from: 'reviews',
      //       localField: 'reviews',
      //       foreignField: '_id',
      //       as: 'reviews',
      //     },
      //   },
      //   {
      //     $addFields: {
      //       averageRating: { $avg: '$reviews.rating' },
      //       image: { $arrayElemAt: ['$images', 0] },
      //     },
      //   },
      //   {
      //     $project: {
      //       image: { url: '$image.url', blurDataURL: '$image.blurDataURL' },
      //       name: 1,
      //       slug: 1,
      //       colors: 1,
      //       discount: 1,
      //       available: 1,
      //       likes: 1,
      //       priceSale: 1,
      //       price: 1,
      //       averageRating: 1,
      //       createdAt: 1,
      //     },
      //   },
      // ]);

      return res.status(201).json({
        success: true,
        message: 'Login Successfully',
        token,
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          cover: user.cover,
          gender: user.gender,
          phone: user.phone,
          address: user.address,
          city: user.city,
          country: user.country,
          zip: user.zip,
          state: user.state,
          about: user.about,
          role: user.role,
        },
      });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  };

  const forgetPassword = async (req, res) => {
    try {
      const request = await req.body;
      const user = await User.findOne({ email: request.email });

      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: 'User Not Found ' });
      }

      const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '7d',
      });
    
      const resetPasswordLink = `${request.origin}/auth/reset-password/${token}`;

      const htmlFilePath = path.join(
        process.cwd(),
        'email-templates',
        'forget.html'
      );

    
      let htmlContent = fs.readFileSync(htmlFilePath, 'utf8');

      // Replace the href attribute of the <a> tag with the reset password link
      // htmlContent = htmlContent.replace(
      //   /href="javascript:void\(0\);"/g,
      //   `href="${resetPasswordLink}"`
      // )
      htmlContent = htmlContent.replace(
        /href="javascript:void\(0\);"/g,
        `href="${resetPasswordLink}"`
      );
      
      let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL, 
          pass: process.env.EMAIL_PASSWORD, 
        },
      });

      let mailOptions = {
        from: process.env.EMAIL,
        to: user.email, 
        subject: 'Verify your email',
        html: htmlContent, 
      };

    
      await transporter.sendMail(mailOptions);

      return res.status(200).json({
        success: true,
        message: 'Forgot Password Email Sent Successfully.',
        token,
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  };

  const resetPassword = async (req, res) => {
    try {
      const { token, newPassword } = await req.body;

    
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch (err) {
        return res.status(400).json({
          success: false,
          message: 'Invalid Or Expired Token. Please Request A New One.',
        });
      }

    
      const user = await User.findById(decoded._id).select('password');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User Not Found ',
        });
      }
      if (!newPassword || !user.password) {
        return res.status(400).json({
          success: false,
          message:
            'Invalid Data. Both NewPassword And User Password Are Required.',
        });
      }

      const isSamePassword = await bcrypt.compare(newPassword, user.password);
      if (isSamePassword) {
        return res.status(400).json({
          success: false,
          message: 'New Password Must Be Different From The Old Password.',
        });
      }
    
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await User.findByIdAndUpdate(user._id, {
        password: hashedPassword,
      });

      return res.status(201).json({
        success: true,
        message: 'Password Updated Successfully.',
        user,
      });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  };

  const verifyOtp = async (req, res) => {
    try {
      const { email, otp } = await req.body;

      
      const user = await User.findOne({ email }).maxTimeMS(30000).exec();

      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: 'User Not Found' });
      }

      if (user.isVerified) {
        return res.status(400).json({
          success: false,
          message: 'OTP Has Already Been Verified',
        });
      }

      let message = '';
      if (otp === user.otp) {
        user.isVerified = true;
        await user.save();
        message = 'OTP Verified Successfully';
        return res.status(201).json({ success: true, message });
      } else {
        message = 'Invalid OTP';
        return res.status(404).json({ success: false, message });
      }
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  };

  const resendOtp = async (req, res) => {
    try {
      const { email } = await req.body;

      const user = await User.findOne({ email }).maxTimeMS(30000).exec();

      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: 'User Not Found' });
      }

      if (user.isVerified) {
        return res.status(400).json({
          success: false,
          message: 'OTP Has Already Been Verified',
        });
      }
      const otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        specialChars: false,
        lowerCaseAlphabets: false,
        digits: true,
      });
      await User.findByIdAndUpdate(user._id, {
        otp: otp.toString(),
      });

      const htmlFilePath = path.join(
        process.cwd(),
        'email-templates',
        'otp.html'
      );

      let htmlContent = fs.readFileSync(htmlFilePath, 'utf8');

      htmlContent = htmlContent.replace(/<h1>[\s\d]*<\/h1>/g, `<h1>${otp}</h1>`);
      htmlContent = htmlContent.replace(/usingyourmail@gmail\.com/g, user.email);

      let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL, 
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      let mailOptions = {
        from: process.env.EMAIL, 
        to: user.email, 
        subject: 'Verify your email',
        html: htmlContent, 
      };

      await transporter.sendMail(mailOptions);

      return res.status(200).json({
        success: true,
        message: 'OTP Resent Successfully',
      });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  };
  module.exports = {
    registerUser,
    loginUser,
    forgetPassword,
    resetPassword,
    verifyOtp,
    resendOtp,
  };