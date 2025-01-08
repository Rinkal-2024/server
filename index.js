// backend/app.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();
const adminRoutes = require('./routes/adminRoutes');  
const articleRoutes = require('./routes/articleRoutes');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
// const cloudinary = require('./config/cloudinary');

const app = express();

app.use(cors({
  origin : 'https://news-website-demo-ten.vercel.app'
}
));
app.use(express.json()); 

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { })
.then(() => console.log('MongoDB connected'))
.catch((err) => console.log('Error connecting to MongoDB:', err));

// Routes
app.use('/api', userRoutes);
app.use('/api', authRoutes);
app.use('/api', articleRoutes);

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
});
